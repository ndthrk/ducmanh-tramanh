'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { validateRsvp } from '../lib/rsvp';
import { appendQuickWish, quickWishes } from '../lib/rsvp-wishes';
import { RsvpCompanion } from './rsvp-companion';

export function RsvpForm({ onInteract }: { onInteract: () => void }) {
  const [fullName, setFullName] = useState('');
  const [attending, setAttending] = useState<boolean | null>(null);
  const [guestCount, setGuestCount] = useState('1');
  const [wishes, setWishes] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [wishFeedback, setWishFeedback] = useState('');
  const pending = useRef<{ key: string; id: string } | null>(null);
  const inFlight = useRef(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'success') feedbackRef.current?.focus();
  }, [status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const website = String(new FormData(event.currentTarget).get('website') || '');
    const values = { fullName, attending, guestCount: attending === false ? 0 : Number(guestCount), wishes };
    const key = JSON.stringify(values);
    if (pending.current?.key !== key) pending.current = { key, id: crypto.randomUUID() };
    const payload = { ...values, requestId: pending.current.id, website };
    const validation = validateRsvp(payload);
    if (validation.error) {
      setStatus('error');
      setMessage(validation.error);
      return;
    }
    inFlight.current = true;
    setStatus('sending');
    setMessage('');
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true || result.requestId !== payload.requestId) {
        throw new Error(result.message || 'Chưa gửi được xác nhận. Bạn thử lại nhé.');
      }
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error && error.name === 'Error' ? error.message : 'Kết nối đang gián đoạn. Bạn thử gửi lại nhé; nội dung vẫn được giữ nguyên.');
    } finally {
      inFlight.current = false;
    }
  }

  return (
    <section className="paper-section rsvp-section" id="rsvp" aria-labelledby="rsvp-heading" onFocusCapture={onInteract} onPointerDown={onInteract}>
      <div className="section-inner narrow reveal" data-reveal>
        <p className="eyebrow dark">Một lời hẹn cho ngày vui</p>
        <h3 id="rsvp-heading">Bạn sẽ đến chứ?</h3>
        <p className="rsvp-intro">Cho chúng mình biết nhé, để ngày đón bạn<br className="rsvp-line-break" /> được chuẩn bị thật chu đáo.</p>
        <div className="rsvp-card">
          <div className="rsvp-card-heading"><span aria-hidden="true">❧</span><p>Xác nhận tham dự</p><span aria-hidden="true">❧</span></div>
          {status === 'success' ? (
            <div className="rsvp-success" ref={feedbackRef} tabIndex={-1} role="status">
              <span className="rsvp-success-mark" aria-hidden="true">✓</span>
              <h4>Cảm ơn {fullName.trim()}!</h4>
              <p>{attending ? `Chúng mình đã ghi nhận ${guestCount} người tham dự, bao gồm bạn. Hẹn gặp bạn trong ngày cưới nhé!` : 'Chúng mình đã nhận được phản hồi của bạn. Cảm ơn bạn đã dành tình cảm cho ngày vui này!'}</p>
              <small>{wishes.trim() ? 'Lời chúc của bạn cũng đã được lưu lại ♥' : 'Cảm ơn lời hồi đáp của bạn ♥'}</small>
            </div>
          ) : (
            <form onSubmit={submit} aria-busy={status === 'sending'}>
              <fieldset className="rsvp-fields" disabled={status === 'sending'}>
                <div className="rsvp-field">
                  <label htmlFor="rsvp-name">Họ và tên <span aria-hidden="true">*</span></label>
                  <input id="rsvp-name" name="fullName" autoComplete="name" placeholder="Tên của bạn" required maxLength={100} value={fullName} onChange={event => setFullName(event.target.value)} />
                </div>
                <fieldset className="rsvp-attendance">
                  <legend>Bạn có thể tham dự không? <span aria-hidden="true">*</span></legend>
                  <div className="rsvp-options">
                    <label className={`rsvp-option ${attending === true ? 'is-selected' : ''}`}>
                      <input type="radio" name="attending" value="yes" required checked={attending === true} onChange={() => setAttending(true)} />
                      <span className="rsvp-option-icon" aria-hidden="true">♡</span><strong>Xác nhận tham dự</strong><small>Mình sẽ đến chung vui</small>
                    </label>
                    <label className={`rsvp-option ${attending === false ? 'is-selected' : ''}`}>
                      <input type="radio" name="attending" value="no" required checked={attending === false} onChange={() => setAttending(false)} />
                      <span className="rsvp-option-icon" aria-hidden="true">♡</span><strong>Không thể tham dự</strong><small>Gửi yêu thương từ xa</small>
                    </label>
                  </div>
                </fieldset>
                <div className={`rsvp-companion-row ${attending === false ? 'is-absent' : ''}`}>
                  <div className="rsvp-guest-content">
                    <div className={`rsvp-collapse ${attending === false ? 'is-hidden' : ''}`} aria-hidden={attending === false} inert={attending === false}>
                      <div className="rsvp-collapse-inner">
                        <div className="rsvp-field rsvp-guests">
                          <label htmlFor="rsvp-guests">Số người tham dự <span aria-hidden="true">*</span></label>
                          <div className="rsvp-counter">
                            <button type="button" aria-label="Giảm số người tham dự" disabled={attending === false || Number(guestCount) <= 1} onClick={() => setGuestCount(String(Math.max(1, Number(guestCount) - 1)))}>−</button>
                            <input id="rsvp-guests" name="guestCount" type="number" inputMode="numeric" min={1} max={50} step={1} required={attending !== false} disabled={attending === false} value={guestCount} onChange={event => setGuestCount(event.target.value)} aria-describedby="rsvp-guests-hint" />
                            <button type="button" aria-label="Tăng số người tham dự" disabled={attending === false || Number(guestCount) >= 50} onClick={() => setGuestCount(String(Math.min(50, Number(guestCount) + 1)))}>+</button>
                          </div>
                          <small id="rsvp-guests-hint">Bao gồm bạn và người đi cùng.</small>
                        </div>
                      </div>
                    </div>
                    <div className={`rsvp-collapse ${attending !== false ? 'is-hidden' : ''}`} aria-hidden={attending !== false}>
                      <div className="rsvp-collapse-inner"><div className="rsvp-away-note"><span aria-hidden="true">♡</span><strong>Vẫn chung một niềm vui</strong><p>Một lời chúc từ bạn cũng làm ngày này thêm trọn vẹn.</p></div></div>
                    </div>
                  </div>
                  <RsvpCompanion attending={attending} guestCount={Number(guestCount)} sending={status === 'sending'} />
                </div>
                <div className="rsvp-field">
                  <label htmlFor="rsvp-wishes">Lời chúc <small>Không bắt buộc</small></label>
                  <textarea id="rsvp-wishes" name="wishes" rows={3} maxLength={1000} placeholder="Gửi đôi lời yêu thương đến chúng mình…" value={wishes} onChange={event => setWishes(event.target.value)} />
                  <div className="rsvp-quick-wishes" role="group" aria-label="Gợi ý lời chúc nhanh">
                    <p>Đôi lời gợi ý cho bạn <span aria-hidden="true">✧</span></p>
                    <div className="rsvp-wish-chips">{quickWishes.map(wish => {
                      const selected = wishes.split('\n').includes(wish.text);
                      return <button key={wish.label} type="button" className={`rsvp-wish-chip ${selected ? 'is-selected' : ''}`} aria-pressed={selected} disabled={!selected && appendQuickWish(wishes, wish.text) === wishes} onClick={() => {
                        setWishes(current => appendQuickWish(current, wish.text));
                        setWishFeedback(selected ? 'Lời chúc này đã được thêm rồi.' : `Đã thêm lời chúc: ${wish.label}. Bạn có thể chỉnh sửa trong ô lời chúc.`);
                      }}><span aria-hidden="true">{selected ? '✓' : '+'}</span>{wish.label}</button>;
                    })}</div>
                    <span className="rsvp-sr-only" role="status">{wishFeedback}</span>
                  </div>
                </div>
                <div className="rsvp-honeypot" aria-hidden="true"><label htmlFor="rsvp-website">Website</label><input id="rsvp-website" name="website" tabIndex={-1} autoComplete="off" /></div>
                {status === 'error' && <p className="rsvp-error" role="alert">{message}</p>}
                <button className="rsvp-submit" type="submit">{status === 'sending' ? <><span className="rsvp-spinner" aria-hidden="true" /> Đang gửi xác nhận…</> : <>Gửi xác nhận <span aria-hidden="true">↗</span></>}</button>
                <p className="rsvp-footnote" role="status">{status === 'sending' ? 'Bạn chờ một chút nhé, chúng mình đang lưu phản hồi.' : 'Mỗi lời hồi đáp đều là một niềm vui với chúng mình.'}</p>
              </fieldset>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
