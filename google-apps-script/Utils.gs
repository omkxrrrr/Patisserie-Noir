/**
 * Utils.gs
 * Generic helpers shared by every endpoint. Centralizing sheet reads here
 * is what lets us cache aggressively and keep the per-request Sheets
 * read/write count low (important: Apps Script + Sheets have execution
 * and quota limits, and every avoided read/write is a faster response).
 */

const CACHE = CacheService.getScriptCache();
const CACHE_TTL = {
  SHORT: 30,    // fast-moving data (orders, slot availability)
  MEDIUM: 120,  // catalog, content
  LONG: 600     // coupons, inventory thresholds
};

function getSheet_(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('Sheet "' + name + '" not found. Run setupSpreadsheet() first.');
  return sheet;
}

/** Read an entire sheet into an array of plain objects keyed by header row, with short-lived caching. */
function readSheet_(name, ttlSeconds) {
  const cacheKey = 'sheet_' + name;
  if (ttlSeconds) {
    const cached = CACHE.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }
  const sheet = getSheet_(name);
  const range = sheet.getDataRange().getValues();
  const headers = range[0];
  const rows = range.slice(1).map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  });
  if (ttlSeconds) {
    try { CACHE.put(cacheKey, JSON.stringify(rows), ttlSeconds); } catch (e) { /* payload too large for cache; skip */ }
  }
  return rows;
}

function invalidateCache_(name) {
  CACHE.remove('sheet_' + name);
}

function appendRow_(sheetName, rowObject) {
  const sheet = getSheet_(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(function (h) { return rowObject.hasOwnProperty(h) ? rowObject[h] : ''; });
  sheet.appendRow(row);
  invalidateCache_(sheetName);
  return rowObject;
}

/** Find the 1-indexed sheet row number for a value in a given column, or -1. */
function findRowIndexByKey_(sheetName, keyColumn, keyValue) {
  const sheet = getSheet_(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const colIndex = headers.indexOf(keyColumn);
  if (colIndex === -1) throw new Error('Column "' + keyColumn + '" not found in ' + sheetName);
  const values = sheet.getRange(2, colIndex + 1, Math.max(sheet.getLastRow() - 1, 0), 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(keyValue)) return i + 2; // +2: header row + 0-index offset
  }
  return -1;
}

/** Patch specific fields on the row identified by keyColumn === keyValue. */
function updateRowByKey_(sheetName, keyColumn, keyValue, patch) {
  const sheet = getSheet_(sheetName);
  const rowIndex = findRowIndexByKey_(sheetName, keyColumn, keyValue);
  if (rowIndex === -1) return null;
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
  const updated = {};
  headers.forEach(function (h, i) {
    updated[h] = patch.hasOwnProperty(h) ? patch[h] : currentRow[i];
  });
  const newRow = headers.map(function (h) { return updated[h]; });
  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([newRow]);
  invalidateCache_(sheetName);
  return updated;
}

function nowIso_() {
  return new Date().toISOString();
}

/** Atomic, collision-safe, human-readable ID generator (e.g. PN-20260623-0007). Uses LockService + Script Properties. */
function generateId_(prefix) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties();
    const dateKey = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyyMMdd');
    const counterKey = prefix + '_COUNTER_' + dateKey;
    const current = Number(props.getProperty(counterKey) || '0') + 1;
    props.setProperty(counterKey, String(current));
    const padded = ('0000' + current).slice(-4);
    return prefix + '-' + dateKey + '-' + padded;
  } finally {
    lock.releaseLock();
  }
}

function hashPassword_(password, salt) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password + ':' + salt,
    Utilities.Charset.UTF_8
  );
  return digest.map(function (b) { return (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'); }).join('');
}

function jsonOut_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function ok_(data) {
  return jsonOut_({ success: true, data: data });
}

function fail_(message) {
  return jsonOut_({ success: false, error: String(message) });
}

function toBool_(v) {
  return v === true || v === 'true' || v === 'TRUE' || v === 1 || v === '1';
}

function logAudit_(actorUsername, action, entity, entityId, details) {
  try {
    appendRow_('AuditLog', {
      Id: generateId_('AUD'),
      ActorUsername: actorUsername || 'system',
      Action: action,
      Entity: entity,
      EntityId: entityId,
      Details: typeof details === 'string' ? details : JSON.stringify(details || {}),
      CreatedAt: nowIso_()
    });
  } catch (e) {
    // Audit logging should never break the primary action.
  }
}
