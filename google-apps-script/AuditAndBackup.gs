/**
 * AuditAndBackup.gs
 */

function getAuditLogs_(payload) {
  const guard = requireRole_(payload.token, 'Admin');
  if (!guard.ok) return guard.response;
  let logs = readSheet_('AuditLog', 0);
  if (payload.entity) logs = logs.filter(function (l) { return l.Entity === payload.entity; });
  logs.sort(function (a, b) { return new Date(b.CreatedAt) - new Date(a.CreatedAt); });
  const limit = Number(payload.limit) || 200;
  return ok_(logs.slice(0, limit));
}

/** Owner-only: dump every sheet as JSON so the shop always has an off-platform copy of their data. */
function exportFullBackup_(payload) {
  const guard = requireRole_(payload.token, 'Owner');
  if (!guard.ok) return guard.response;
  const dump = {};
  Object.keys(SHEET_SCHEMA).forEach(function (name) {
    dump[name] = readSheet_(name, 0);
  });
  logAudit_(guard.session.Username, 'EXPORT_BACKUP', 'System', '', '');
  return ok_({ exportedAt: nowIso_(), sheets: dump });
}
