import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const code = readFileSync(new URL('../scripts/google-apps-script.gs', import.meta.url), 'utf8');
const input = { requestId: 'c13b4c65-0d89-4c44-9180-578d5d762af3', secret: 'test-secret', fullName: '  Nguyễn   Trâm Anh ', attending: true, guestCount: 1, wishes: '' };

function harness({ busy = false, writeFails = false } = {}) {
  const rows = [];
  let released = 0;
  let flushes = 0;
  const sheet = {
    getLastRow: () => rows.length,
    appendRow: row => {
      if (writeFails && rows.length > 0) throw new Error('Write failed');
      rows.push(Array.from(row));
    },
    setFrozenRows: () => {},
    getRange: (row, column, count = 1, width = 1) => ({
      setFontWeight() { return this; },
      setBackground() { return this; },
      getValues: () => rows.slice(row - 1, row - 1 + count).map(values => values.slice(column - 1, column - 1 + width)),
      createTextFinder: id => ({ matchEntireCell: () => ({ findNext: () => {
        const index = rows.findIndex((values, index) => index > 0 && values[5] === id);
        return index === -1 ? null : { getRow: () => index + 1 };
      } }) }),
    }),
  };
  const context = vm.createContext({
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }) },
    PropertiesService: { getScriptProperties: () => ({ getProperties: () => ({ SPREADSHEET_ID: 'test-sheet', RSVP_SECRET: 'test-secret' }) }) },
    SpreadsheetApp: { openById: () => ({ getSheetByName: () => sheet }), flush: () => { flushes++; } },
    LockService: { getScriptLock: () => ({ tryLock: () => !busy, releaseLock: () => { released++; } }) },
  });
  vm.runInContext(code, context);
  return { rows, post: value => context.doPost({ postData: { contents: JSON.stringify(value) } }), released: () => released, flushes: () => flushes };
}

test('Apps Script creates headers, saves a Vietnamese response and flushes before success', () => {
  const h = harness();
  assert.deepEqual(h.post(input), { ok: true, requestId: input.requestId });
  assert.equal(h.rows.length, 2);
  assert.deepEqual(h.rows[1].slice(1), ['Nguyễn Trâm Anh', 'Có', 1, '', input.requestId]);
  assert.equal(h.flushes(), 1);
  assert.equal(h.released(), 1);
});

test('Apps Script retry appends once and rejects changed data under the same request ID', () => {
  const h = harness();
  h.post(input);
  assert.equal(h.post(input).ok, true);
  assert.equal(h.rows.length, 2);
  assert.equal(h.post({ ...input, fullName: 'Người khác' }).code, 'REQUEST_ID_CONFLICT');
  assert.equal(h.rows.length, 2);
  assert.equal(h.released(), 3);
});

test('Apps Script stores absent guests as zero and neutralizes spreadsheet formulas', () => {
  const h = harness();
  assert.equal(h.post({ ...input, fullName: '=IMPORTXML("url")', attending: false, guestCount: 0, wishes: '+SUM(1,2)' }).ok, true);
  assert.deepEqual(h.rows[1].slice(1, 5), ['\'=IMPORTXML("url")', 'Không', 0, '\'+SUM(1,2)']);
});

test('Apps Script rejects unauthorized or invalid requests without creating rows', () => {
  const h = harness();
  assert.equal(h.post({ ...input, secret: 'wrong' }).code, 'UNAUTHORIZED');
  for (const patch of [{ attending: null }, { guestCount: 0 }, { guestCount: 1.5 }, { wishes: 'x'.repeat(1001) }]) {
    assert.equal(h.post({ ...input, ...patch }).code, 'INVALID_DATA');
  }
  assert.equal(h.rows.length, 0);
});

test('Apps Script never acknowledges failed writes or a busy lock', () => {
  const busy = harness({ busy: true });
  assert.equal(busy.post(input).code, 'BUSY');
  assert.equal(busy.rows.length, 0);
  const failed = harness({ writeFails: true });
  assert.equal(failed.post(input).code, 'SAVE_FAILED');
  assert.equal(failed.released(), 1);
});
