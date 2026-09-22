'use client';

import { CSSProperties, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { weddingConfig as config } from '@/config/wedding';

function useCountdown(target: string) {
  const [distance, setDistance] = useState<number | null>(null);
  useEffect(() => {
    const calculate = () => setDistance(Math.max(0, new Date(target).getTime() - Date.now()));
    calculate();
    const timer = window.setInterval(calculate, 1000);
    return () => window.clearInterval(timer);
  }, [target]);
  if (distance === null) return null;
  return {
    ngày: Math.floor(distance / 86400000),
    giờ: Math.floor((distance / 3600000) % 24),
    phút: Math.floor((distance / 60000) % 60),
    giây: Math.floor((distance / 1000) % 60),
  };
}

function Petals() {
  const petals = useMemo(() => Array.from({ length: 22 }, (_, index) => ({
    left: `${(index * 37) % 100}%`,
    delay: `${-((index * 1.7) % 12)}s`,
    duration: `${8 + (index % 7)}s`,
    size: `${7 + (index % 5) * 2}px`,
  })), []);
  return <div className="petals" aria-hidden="true">{petals.map((petal, index) => (
    <i key={index} style={{ '--left': petal.left, '--delay': petal.delay, '--duration': petal.duration, '--size': petal.size } as CSSProperties} />
  ))}</div>;
}

function WeddingCalendar({ date }: { date: string }) {
  const [year, month, weddingDay] = date.slice(0, 10).split('-').map(Number);
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const mondayOffset = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cellCount = Math.ceil((mondayOffset + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: cellCount }, (_, index) => {
    const day = index - mondayOffset + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  return (
    <div className="wedding-calendar" aria-label={`Lịch tháng ${month} năm ${year}`}>
      <div className="calendar-heading"><span>Tháng {String(month).padStart(2, '0')}</span><b>{year}</b></div>
      <div className="calendar-weekdays" aria-hidden="true">{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => <span key={day}>{day}</span>)}</div>
      <div className="calendar-days">
        {cells.map((day, index) => <span key={index} className={day === weddingDay ? 'wedding-day' : day ? '' : 'empty'}>{day || ''}{day === weddingDay && <i aria-label="Ngày cưới">♥</i>}</span>)}
      </div>
    </div>
  );
}

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [autoScrollPlaying, setAutoScrollPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const giftTimerRef = useRef<number | null>(null);
  const autoScrollStartedRef = useRef(false);
  const countdown = useCountdown(config.event.date);
  const photoCount = config.assets.gallery.length;

  const closeGiftModal = () => {
    if (giftTimerRef.current !== null) {
      window.clearTimeout(giftTimerRef.current);
      giftTimerRef.current = null;
    }
    setGiftModalOpen(false);
    setGiftOpen(false);
  };

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -7% 0px' });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('cover-locked', !opened);
    if (!opened) window.scrollTo(0, 0);
    return () => document.body.classList.remove('cover-locked');
  }, [opened]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowLeft') setActivePhoto(current => (current - 1 + photoCount) % photoCount);
      if (event.key === 'ArrowRight') setActivePhoto(current => (current + 1) % photoCount);
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [lightboxOpen, photoCount]);

  useEffect(() => {
    if (!opened || lightboxOpen || photoCount < 2) return;
    const timer = window.setInterval(() => {
      setActivePhoto(current => (current + 1) % photoCount);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [lightboxOpen, opened, photoCount]);

  useEffect(() => {
    document.body.classList.toggle('lightbox-open', lightboxOpen || giftModalOpen);
    return () => document.body.classList.remove('lightbox-open');
  }, [giftModalOpen, lightboxOpen]);

  useEffect(() => {
    if (!giftModalOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeGiftModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [giftModalOpen]);

  useEffect(() => () => {
    if (giftTimerRef.current !== null) window.clearTimeout(giftTimerRef.current);
  }, []);

  useEffect(() => {
    if (!opened || !autoScrollPlaying) return;
    let frameId = 0;
    let previousTime: number | null = null;
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';

    const step = (time: number) => {
      if (previousTime !== null) {
        const maxScroll = root.scrollHeight - window.innerHeight;
        if (window.scrollY >= maxScroll - 1) {
          setAutoScrollPlaying(false);
          return;
        }
        const distance = Math.min((time - previousTime) * 0.12, maxScroll - window.scrollY);
        window.scrollBy(0, distance);
      }
      previousTime = time;
      frameId = window.requestAnimationFrame(step);
    };

    const startTimer = window.setTimeout(() => {
      autoScrollStartedRef.current = true;
      frameId = window.requestAnimationFrame(step);
    }, autoScrollStartedRef.current ? 0 : 1650);

    return () => {
      window.clearTimeout(startTimer);
      window.cancelAnimationFrame(frameId);
      root.style.scrollBehavior = previousScrollBehavior;
    };
  }, [autoScrollPlaying, opened]);

  const handleOpen = async () => {
    window.scrollTo(0, 0);
    autoScrollStartedRef.current = false;
    setOpened(true);
    setAutoScrollPlaying(true);
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.45;
    audio.currentTime = config.music.startAt;
    try {
      await audio.play();
      setMusicPlaying(true);
    } catch {
      setMusicPlaying(false);
    }
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try { await audio.play(); setMusicPlaying(true); } catch { setMusicPlaying(false); }
    } else {
      audio.pause();
      setMusicPlaying(false);
    }
  };

  const showPreviousPhoto = () => setActivePhoto(current => (current - 1 + photoCount) % photoCount);
  const showNextPhoto = () => setActivePhoto(current => (current + 1) % photoCount);

  const handleGiftOpen = () => {
    if (giftTimerRef.current !== null) window.clearTimeout(giftTimerRef.current);
    if (giftOpen) {
      setGiftModalOpen(true);
      return;
    }
    setGiftOpen(true);
    giftTimerRef.current = window.setTimeout(() => {
      setGiftModalOpen(true);
      giftTimerRef.current = null;
    }, 1350);
  };

  const getPhotoPosition = (index: number) => {
    let distance = (index - activePhoto + photoCount) % photoCount;
    if (distance > photoCount / 2) distance -= photoCount;
    if (distance === 0) return 'is-active';
    if (distance === -1) return 'is-previous';
    if (distance === 1) return 'is-next';
    return 'is-hidden';
  };

  const handlePointer = (event: MouseEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--mouse-x', `${event.clientX}px`);
    event.currentTarget.style.setProperty('--mouse-y', `${event.clientY}px`);
    const wind = ((event.clientX / window.innerWidth) - 0.5) * 110;
    event.currentTarget.style.setProperty('--petal-wind-soft', `${wind * 0.35}px`);
    event.currentTarget.style.setProperty('--petal-wind', `${wind}px`);
  };

  return (
    <main className={opened ? 'invitation is-open' : 'invitation'} onMouseMove={handlePointer}>
      <div className="cursor-glow" aria-hidden="true" />
      <Petals />
      <audio ref={audioRef} src={config.music.src} preload="auto" loop playsInline onPlay={() => setMusicPlaying(true)} onPause={() => setMusicPlaying(false)} />

      <section className="cover" aria-label="Mở thiệp cưới">
        <div className="invitation-card">
          <div className="cover-pattern" aria-hidden="true" />
          <div className="dragon dragon-left" aria-hidden="true">龍</div>
          <div className="dragon dragon-right" aria-hidden="true">鳳</div>
          <div className="cover-copy">
            <p className="eyebrow">Trân trọng báo tin lễ thành hôn</p>
            <p className="double-happiness" aria-hidden="true">囍</p>
            <h1><span>{config.couple.groomShortName}</span><i>&amp;</i><span>{config.couple.brideShortName}</span></h1>
            <p className="cover-date">{config.event.displayDate}</p>
            <button type="button" className="open-button" onClick={handleOpen}>
              <span>Mở thiệp</span><small>Chạm để bước vào ngày vui</small>
            </button>
          </div>
          <div className="cover-wave" aria-hidden="true" />
        </div>
      </section>

      <div className="site-shell" aria-hidden={!opened}>
        <button type="button" className={`auto-scroll-toggle ${autoScrollPlaying ? 'is-playing' : ''}`} onClick={() => setAutoScrollPlaying(current => !current)} aria-label={autoScrollPlaying ? 'Tạm dừng tự động cuộn' : 'Tiếp tục tự động cuộn'} title={autoScrollPlaying ? 'Tạm dừng tự động cuộn' : 'Tiếp tục tự động cuộn'}>
          <span aria-hidden="true" />
        </button>
        <button type="button" className={`music-toggle ${musicPlaying ? 'is-playing' : ''}`} onClick={toggleMusic} aria-label={musicPlaying ? 'Tắt nhạc' : 'Phát nhạc'} title={musicPlaying ? 'Tắt nhạc' : 'Phát nhạc'}>
          <span aria-hidden="true">♫</span>
        </button>
        <section className="hero">
          <Image className="hero-photo" src={config.assets.hero} alt={`Ảnh cưới ${config.couple.groomShortName} và ${config.couple.brideShortName}`} fill priority sizes="100vw" />
          <div className="hero-overlay" />
          <div className="hero-content reveal is-visible" data-reveal>
            <p className="eyebrow">We are getting married</p>
            <h2>{config.couple.groomShortName}<i>&amp;</i>{config.couple.brideShortName}</h2>
            <p className="hero-date">{config.event.weekday} · {config.event.displayDate}</p>
            <a href="#invitation" className="scroll-cue" aria-label="Xem nội dung thiệp">Cuộn để xem <b>↓</b></a>
          </div>
        </section>

        <section className="paper-section intro-section" id="invitation">
          <div className="section-inner narrow reveal" data-reveal>
            <p className="eyebrow dark">Lời ngỏ</p>
            <p className="ornament">❧</p>
            <blockquote>{config.messages.intro}</blockquote>
            <p className="body-copy">{config.messages.invitation}</p>
          </div>
        </section>

        <section className="green-section family-section">
          <div className="section-inner reveal" data-reveal>
            <p className="eyebrow">Hai gia đình</p>
            <h3>Trân trọng báo hỷ</h3>
            <div className="families">
              {Object.values(config.families).map((family, index) => (
                <article className="family-card" key={family.label}>
                  <span className="family-symbol-wrap" aria-hidden="true"><Image className="family-symbol" src={index === 0 ? config.assets.dragon : config.assets.phoenix} alt="" fill sizes="(max-width: 700px) 90vw, 40vw" /></span>
                  <p>{family.label}</p>
                  {family.father && <strong>{family.father}</strong>}
                  <strong>{family.mother}</strong>
                  <small>{family.address}</small>
                </article>
              ))}
            </div>
            <div className="couple-names">
              <div><small>{config.couple.groomLabel}</small><span>{config.couple.groomFullName}</span></div>
              <b>&amp;</b>
              <div><small>{config.couple.brideLabel}</small><span>{config.couple.brideFullName}</span></div>
            </div>
          </div>
        </section>

        <section className="paper-section event-section">
          <div className="section-inner reveal" data-reveal>
            <p className="eyebrow dark">Save the date</p>
            <h3>Ngày mình chung đôi</h3>
            <div className="event-details">
              <p className="event-details-label">Tiệc cưới sẽ diễn ra vào lúc:</p>
              <strong className="ceremony-time">{config.event.ceremonyTime}</strong>
              <div className="date-lockup"><span>{config.event.weekday}</span><b>24</b><span>Tháng 10</span></div>
              <strong className="event-year">2026</strong>
              <p className="lunar-date">Tức ngày {config.event.lunarDate}</p>
              <div className="reception-times">
                <div><span>Đón khách</span><b>{config.event.receptionTime}</b></div>
                <div><span>Khai tiệc</span><b>{config.event.ceremonyTime}</b></div>
              </div>
            </div>
            <WeddingCalendar date={config.event.date} />
            <a className="calendar-link" href={config.event.calendarUrl} target="_blank" rel="noreferrer">＋ Thêm vào lịch</a>
            <div className="countdown" aria-live="polite">
              {(countdown ? Object.entries(countdown) : [['ngày', null], ['giờ', null], ['phút', null], ['giây', null]]).map(([label, value]) => <div key={label}><b>{value === null ? '--' : String(value).padStart(2, '0')}</b><span>{label}</span></div>)}
            </div>
          </div>
        </section>

        <section className="gallery-section">
          <div className="section-inner wide reveal" data-reveal>
            <p className="eyebrow">Khoảnh khắc</p>
            <h3>Album ảnh</h3>
            <div className="gallery-carousel" aria-label="Album ảnh cưới">
              <button type="button" className="gallery-arrow gallery-previous" onClick={showPreviousPhoto} aria-label="Ảnh trước" />
              <div className="gallery-stage">
                {config.assets.gallery.map((photo, index) => (
                  <button type="button" key={`${photo}-${index}`} className={`carousel-photo ${getPhotoPosition(index)}`} onClick={() => index === activePhoto ? setLightboxOpen(true) : setActivePhoto(index)} aria-label={index === activePhoto ? `Mở ảnh ${index + 1}` : `Chuyển tới ảnh ${index + 1}`}>
                    <Image src={photo} alt={`Ảnh cưới ${index + 1}`} fill sizes="(max-width: 700px) 78vw, 38vw" priority={index < 3} />
                  </button>
                ))}
              </div>
              <button type="button" className="gallery-arrow gallery-next" onClick={showNextPhoto} aria-label="Ảnh tiếp theo" />
              <div className="gallery-dots" aria-label={`Ảnh ${activePhoto + 1} trên ${photoCount}`}>
                {config.assets.gallery.map((_, index) => <button type="button" key={index} className={index === activePhoto ? 'is-active' : ''} onClick={() => setActivePhoto(index)} aria-label={`Xem ảnh ${index + 1}`} />)}
              </div>
            </div>
          </div>
        </section>

        <section className="paper-section schedule-section">
          <div className="section-inner reveal" data-reveal>
            <p className="eyebrow dark">Lịch trình</p>
            <h3>Lịch trình ngày vui</h3>
            <div className="timeline">
              {config.timeline.map((item, index) => <div className="timeline-item" key={item.time}><b>{item.time}</b><i>{index + 1}</i><span>{item.label}</span></div>)}
            </div>
            <div className="dress-code">
              <p>Dress code</p>
              <div>{config.dressCode.map(item => <i key={`${item.label}-${item.color}`} style={{ backgroundColor: item.color }} title={item.label} />)}</div>
              <small>{config.dressCode.map(item => item.label).join(' · ')}</small>
            </div>
          </div>
        </section>

        <section className="venue-section">
          <div className="section-inner map-section reveal" data-reveal>
            <p className="eyebrow">Nơi mình hẹn nhau</p>
            <span className="location-pin" aria-hidden="true" />
            <h3>{config.event.venue}</h3>
            <p>{config.event.address}</p>
            <a className="outline-button" href={config.event.mapUrl} target="_blank" rel="noreferrer">Mở chỉ đường ↗</a>
            <div className="map-frame">
              <iframe src={config.event.mapEmbedUrl} title={`Bản đồ ${config.event.venue}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            </div>
          </div>
        </section>

        <section className="paper-section gift-section">
          <div className="section-inner narrow reveal" data-reveal>
            <p className="eyebrow dark">Gửi chút yêu thương</p>
            <h3>Mừng ngày chung đôi</h3>
            <p>{config.messages.thanks}</p>
            <div className={`gift-display ${giftOpen ? 'is-open' : ''}`}>
              <button type="button" className="envelope-decoration" onClick={handleGiftOpen} aria-label={giftOpen ? 'Xem lại mã QR quà cưới' : 'Mở phong bì quà cưới'} aria-expanded={giftModalOpen}>
                <div className="envelope-letter">
                  <div className="letter-face letter-front"><span>囍</span></div>
                  <div className="letter-face letter-back"><span>Quà cưới</span><b>♥</b></div>
                </div>
                <div className="envelope-back" />
                <div className="envelope-front" />
                <div className="envelope-seal">♥</div>
                <span className="gift-heart heart-1">♥</span><span className="gift-heart heart-2">♥</span><span className="gift-heart heart-3">♥</span><span className="gift-heart heart-4">♥</span><span className="gift-heart heart-5">♥</span>
              </button>
              <p className="gift-hint">Chạm vào phong bì để mở quà cưới</p>
            </div>
          </div>
        </section>

        <footer>
          <p className="double-happiness">囍</p>
          <h3>{config.couple.groomShortName} &amp; {config.couple.brideShortName}</h3>
          <p>Hẹn gặp bạn trong ngày vui của chúng mình!</p>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Về đầu trang ↑</button>
        </footer>
      </div>

      {lightboxOpen && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Ảnh cưới ${activePhoto + 1}`} onClick={() => setLightboxOpen(false)}>
          <button type="button" className="lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Đóng ảnh">×</button>
          <button type="button" className="lightbox-arrow lightbox-previous" onClick={(event) => { event.stopPropagation(); showPreviousPhoto(); }} aria-label="Ảnh trước" />
          <div className="lightbox-image" onClick={(event) => event.stopPropagation()}>
            <Image src={config.assets.gallery[activePhoto]} alt={`Ảnh cưới ${activePhoto + 1}`} fill sizes="100vw" priority />
          </div>
          <button type="button" className="lightbox-arrow lightbox-next" onClick={(event) => { event.stopPropagation(); showNextPhoto(); }} aria-label="Ảnh tiếp theo" />
          <p>{activePhoto + 1} / {photoCount}</p>
        </div>
      )}

      {giftModalOpen && (
        <div className="gift-modal" role="dialog" aria-modal="true" aria-labelledby="gift-modal-title" onClick={closeGiftModal}>
          <div className="gift-modal-card" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="gift-modal-close" onClick={closeGiftModal} aria-label="Đóng mã QR">×</button>
            <p className="eyebrow dark">Gửi chút yêu thương</p>
            <h3 id="gift-modal-title">❤️</h3>
            <div className="gift-modal-qr">
              <Image src={config.assets.giftQr} alt="Mã QR quà cưới" width={706} height={688} priority />
            </div>
            <p>Chúng mình trân trọng đón nhận món quà nhỏ của bạn</p>
          </div>
        </div>
      )}
    </main>
  );
}
