/**
 * Paste this file into Code.gs in Google Apps Script.
 * Script properties: SPREADSHEET_ID, RSVP_SECRET, SHEET_NAME (optional, default RSVP).
 * Deploy as Web app: Execute as Me; access Anyone.
 * The secret is passed by the Next.js server, never by the browser.
 */
var RSVP_HEADERS = ['Thời gian', 'Họ và tên', 'Tham dự', 'Số người', 'Lời chúc', 'Mã lần gửi'];

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function safeCellText(value) {
  // Untrusted names and wishes must never execute as spreadsheet formulas.
  return /^[=+\-@\t\r\n]/.test(value) ? "'" + value : value;
}

function getRsvpSheet(properties) {
  var spreadsheet = SpreadsheetApp.openById(properties.SPREADSHEET_ID);
  var name = properties.SHEET_NAME || 'RSVP';
  var sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(RSVP_HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, RSVP_HEADERS.length).setFontWeight('bold').setBackground('#edf2e8');
  } else {
    var existing = sheet.getRange(1, 1, 1, RSVP_HEADERS.length).getValues()[0];
    if (existing.join('|') !== RSVP_HEADERS.join('|')) throw new Error('Unexpected sheet headers');
  }
  return sheet;
}

// Run once in the editor to authorize Sheets access and create the RSVP tab.
function setupRsvpSheet() {
  var properties = PropertiesService.getScriptProperties().getProperties();
  if (!properties.SPREADSHEET_ID || !properties.RSVP_SECRET) throw new Error('Set SPREADSHEET_ID and RSVP_SECRET in Script properties first.');
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getRsvpSheet(properties);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  var lock;
  var locked = false;
  try {
    var properties = PropertiesService.getScriptProperties().getProperties();
    if (!properties.SPREADSHEET_ID || !properties.RSVP_SECRET) return jsonResponse({ ok: false, code: 'NOT_CONFIGURED' });
    if (!e || !e.postData || e.postData.contents.length > 8000) return jsonResponse({ ok: false, code: 'INVALID_DATA' });
    var data = JSON.parse(e.postData.contents);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return jsonResponse({ ok: false, code: 'INVALID_DATA' });
    if (data.secret !== properties.RSVP_SECRET) return jsonResponse({ ok: false, code: 'UNAUTHORIZED' });
    var fullName = typeof data.fullName === 'string' ? data.fullName.trim().replace(/\s+/g, ' ') : '';
    if (typeof data.requestId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(data.requestId) ||
        !fullName || fullName.length > 100 || typeof data.attending !== 'boolean' ||
        typeof data.guestCount !== 'number' || !Number.isInteger(data.guestCount) ||
        (data.attending ? data.guestCount < 1 || data.guestCount > 50 : data.guestCount !== 0) ||
        typeof data.wishes !== 'string' || data.wishes.length > 1000) {
      return jsonResponse({ ok: false, code: 'INVALID_DATA' });
    }
    lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) return jsonResponse({ ok: false, code: 'BUSY' });
    locked = true;
    var sheet = getRsvpSheet(properties);
    var lastRow = sheet.getLastRow();
    var values = [safeCellText(fullName), data.attending ? 'Có' : 'Không', data.guestCount, safeCellText(data.wishes.trim())];
    if (lastRow > 1) {
      var match = sheet.getRange(2, 6, lastRow - 1, 1).createTextFinder(data.requestId).matchEntireCell(true).findNext();
      if (match) {
        // A retry of the same submission is successful without appending twice.
        var stored = sheet.getRange(match.getRow(), 2, 1, 4).getValues()[0];
        // Sheets may omit the leading apostrophe used to protect literal text.
        var expected = [fullName, values[1], values[2], data.wishes.trim()];
        var same = stored.every(function (value, index) { return value === values[index] || value === expected[index]; });
        if (!same) return jsonResponse({ ok: false, code: 'REQUEST_ID_CONFLICT' });
        SpreadsheetApp.flush();
        return jsonResponse({ ok: true, requestId: data.requestId });
      }
    }
    sheet.appendRow([new Date()].concat(values, [data.requestId]));
    SpreadsheetApp.flush();
    return jsonResponse({ ok: true, requestId: data.requestId });
  } catch (error) {
    // Do not expose secrets, guest data or internal errors in public responses.
    return jsonResponse({ ok: false, code: 'SAVE_FAILED' });
  } finally {
    if (locked) lock.releaseLock();
  }
}
