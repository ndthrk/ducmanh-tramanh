import { validateRsvp } from './rsvp.ts';

type Options = { url?: string; secret?: string; fetchImpl?: typeof fetch };
const headers = { 'Cache-Control': 'no-store' };
const reply = (body: object, status: number) => Response.json(body, { status, headers });

export function createRsvpHandler({ url, secret, fetchImpl = fetch }: Options) {
  return async (request: Request) => {
    if (!url || !secret || !/^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(url)) {
      return reply({ ok: false, message: 'Chức năng xác nhận đang được chuẩn bị. Bạn vui lòng thử lại sau nhé.' }, 503);
    }
    if (!request.headers.get('content-type')?.includes('application/json')) {
      return reply({ ok: false, message: 'Định dạng gửi không hợp lệ.' }, 415);
    }
    let input: unknown;
    try {
      const raw = await request.text();
      if (raw.length > 8000) return reply({ ok: false, message: 'Nội dung quá dài.' }, 413);
      input = JSON.parse(raw);
    } catch {
      return reply({ ok: false, message: 'Thông tin xác nhận không hợp lệ.' }, 400);
    }
    const result = validateRsvp(input);
    if (result.error) return reply({ ok: false, message: result.error }, 400);
    try {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...result.data, secret }),
        redirect: 'follow',
        cache: 'no-store',
        signal: AbortSignal.timeout(25000),
      });
      if (!response.ok) throw new Error('Upstream failed');
      const saved = await response.json();
      if (saved.ok !== true || saved.requestId !== result.data?.requestId) throw new Error('Write not confirmed');
      return reply({ ok: true, requestId: saved.requestId }, 200);
    } catch {
      return reply({ ok: false, message: 'Chưa xác nhận được việc lưu phản hồi. Bạn vui lòng thử gửi lại nhé; nội dung vẫn được giữ nguyên.' }, 502);
    }
  };
}
