import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRsvp } from '../src/lib/rsvp.ts';
import { createRsvpHandler } from '../src/lib/rsvp-handler.ts';

const payload = { requestId: 'c13b4c65-0d89-4c44-9180-578d5d762af3', fullName: '  Nguyễn   Trâm Anh  ', attending: true, guestCount: 1, wishes: '' };
const request = (value = payload) => new Request('https://wedding.example/api/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
const config = { url: 'https://script.google.com/macros/s/test-deployment/exec', secret: 'test-secret' };

test('normalizes Vietnamese names and allows an empty optional wish', () => {
  assert.deepEqual(validateRsvp(payload).data, { ...payload, fullName: 'Nguyễn Trâm Anh' });
});

test('absence requires zero guests; attendance requires a whole number from 1 to 50', () => {
  assert.ok(validateRsvp({ ...payload, attending: false, guestCount: 0 }).data);
  for (const guestCount of [0, -1, 1.5, 51, '1', null]) assert.ok(validateRsvp({ ...payload, guestCount }).error);
  assert.ok(validateRsvp({ ...payload, attending: false }).error);
});

test('rejects missing decisions, empty names, oversized wishes, bad IDs and honeypot', () => {
  for (const patch of [{ attending: null }, { fullName: '   ' }, { fullName: 'a'.repeat(101) }, { wishes: 'a'.repeat(1001) }, { requestId: 'invalid' }, { website: 'spam' }]) {
    assert.ok(validateRsvp({ ...payload, ...patch }).error);
  }
});

test('API validates input before contacting Google', async () => {
  const handler = createRsvpHandler({ ...config, fetchImpl: async () => { assert.fail('Google should not be called'); } });
  assert.equal((await handler(request({ ...payload, guestCount: 0 }))).status, 400);
});

test('API sends secret only upstream and follows Apps Script redirects', async () => {
  const handler = createRsvpHandler({ ...config, fetchImpl: async (url, options) => {
    assert.equal(url, config.url);
    assert.equal(options.redirect, 'follow');
    assert.equal(options.cache, 'no-store');
    assert.equal(JSON.parse(options.body).secret, config.secret);
    assert.equal(JSON.parse(options.body).fullName, 'Nguyễn Trâm Anh');
    return Response.json({ ok: true, requestId: payload.requestId });
  } });
  const response = await handler(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await response.json(), { ok: true, requestId: payload.requestId });
});

test('API never reports success for an unconfirmed write or failed connection', async () => {
  for (const fetchImpl of [
    async () => Response.json({ ok: false, code: 'SAVE_FAILED' }),
    async () => Response.json({ ok: true, requestId: 'wrong-id' }),
    async () => new Response('<html>Login required</html>'),
    async () => new Response('', { status: 500 }),
    async () => { throw new Error('Timeout'); },
  ]) {
    const response = await createRsvpHandler({ ...config, fetchImpl })(request());
    assert.equal(response.status, 502);
    assert.equal((await response.json()).ok, false);
  }
});

test('API reports missing configuration and rejects malformed or oversized requests', async () => {
  assert.equal((await createRsvpHandler({})(request())).status, 503);
  assert.equal((await createRsvpHandler({ ...config, url: 'https://example.com' })(request())).status, 503);
  const handler = createRsvpHandler(config);
  assert.equal((await handler(new Request('https://example.com', { method: 'POST', body: '{}' }))).status, 415);
  const malformed = new Request('https://example.com', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal((await handler(malformed)).status, 400);
  const oversized = new Request('https://example.com', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'a'.repeat(8001) });
  assert.equal((await handler(oversized)).status, 413);
});
