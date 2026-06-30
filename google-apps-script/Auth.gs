/**
 * Auth.gs
 * Token-based admin auth. Apps Script Web Apps can't use normal
 * cookies/CORS sessions cleanly across origins, so on login we issue a
 * random opaque token (stored in the Sessions sheet with an expiry) and
 * the frontend sends it back as `token` on every protected action.
 */

const SESSION_TTL_HOURS = 12;
const ROLE_RANK = { Staff: 1, Manager: 2, Admin: 3, Owner: 4 };

function adminLogin_(payload) {
  const username = String(payload.username || '').trim().toLowerCase();
  const password = String(payload.password || '');
  if (!username || !password) return fail_('Username and password are required.');

  const staff = readSheet_('Staff', 0).find(function (s) {
    return String(s.Username).toLowerCase() === username && toBool_(s.IsActive);
  });
  if (!staff) return fail_('Invalid username or password.');

  const hash = hashPassword_(password, staff.Salt);
  if (hash !== staff.PasswordHash) return fail_('Invalid username or password.');

  const token = Utilities.getUuid() + Utilities.getUuid();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_TTL_HOURS * 60 * 60 * 1000);

  appendRow_('Sessions', {
    Token: token,
    StaffId: staff.Id,
    Username: staff.Username,
    Role: staff.Role,
    CreatedAt: now.toISOString(),
    ExpiresAt: expires.toISOString()
  });

  logAudit_(staff.Username, 'LOGIN', 'Staff', staff.Id, '');

  return ok_({
    token: token,
    staff: { id: staff.Id, name: staff.Name, username: staff.Username, role: staff.Role },
    expiresAt: expires.toISOString()
  });
}

function adminLogout_(payload) {
  const token = payload.token;
  if (!token) return ok_({ loggedOut: true });
  updateRowByKey_('Sessions', 'Token', token, { ExpiresAt: new Date(0).toISOString() });
  return ok_({ loggedOut: true });
}

/** Returns the session record if the token is valid & unexpired, else null. */
function validateSession_(token) {
  if (!token) return null;
  const session = readSheet_('Sessions', CACHE_TTL.SHORT).find(function (s) { return s.Token === token; });
  if (!session) return null;
  if (new Date(session.ExpiresAt).getTime() < Date.now()) return null;
  return session;
}

/** Throws-free guard: returns { ok: true, session } or { ok: false, response } ready to return from doPost. */
function requireRole_(token, minRole) {
  const session = validateSession_(token);
  if (!session) return { ok: false, response: fail_('Session expired. Please log in again.') };
  const rank = ROLE_RANK[session.Role] || 0;
  const minRank = ROLE_RANK[minRole] || 0;
  if (rank < minRank) return { ok: false, response: fail_('You do not have permission to do this.') };
  return { ok: true, session: session };
}

function changePassword_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  const staff = readSheet_('Staff', 0).find(function (s) { return s.Id === guard.session.StaffId; });
  if (!staff) return fail_('Staff record not found.');

  const currentHash = hashPassword_(payload.currentPassword || '', staff.Salt);
  if (currentHash !== staff.PasswordHash) return fail_('Current password is incorrect.');

  const newSalt = Utilities.getUuid();
  const newHash = hashPassword_(payload.newPassword || '', newSalt);
  updateRowByKey_('Staff', 'Id', staff.Id, { PasswordHash: newHash, Salt: newSalt });
  logAudit_(staff.Username, 'CHANGE_PASSWORD', 'Staff', staff.Id, '');
  return ok_({ changed: true });
}

// ── Staff management (Owner/Admin only) ──────────────────────────────

function listStaff_(payload) {
  const guard = requireRole_(payload.token, 'Admin');
  if (!guard.ok) return guard.response;
  const staff = readSheet_('Staff', CACHE_TTL.MEDIUM).map(function (s) {
    return { id: s.Id, name: s.Name, username: s.Username, role: s.Role, isActive: toBool_(s.IsActive) };
  });
  return ok_(staff);
}

function createStaff_(payload) {
  const guard = requireRole_(payload.token, 'Admin');
  if (!guard.ok) return guard.response;
  const username = String(payload.username || '').trim().toLowerCase();
  if (!username || !payload.password || !payload.name || !payload.role) {
    return fail_('Name, username, password, and role are required.');
  }
  const exists = readSheet_('Staff', 0).some(function (s) { return String(s.Username).toLowerCase() === username; });
  if (exists) return fail_('That username is already taken.');

  const salt = Utilities.getUuid();
  const hash = hashPassword_(payload.password, salt);
  const id = generateId_('ST');
  appendRow_('Staff', {
    Id: id, Name: payload.name, Username: username, PasswordHash: hash, Salt: salt,
    Role: payload.role, IsActive: true, CreatedAt: nowIso_()
  });
  logAudit_(guard.session.Username, 'CREATE_STAFF', 'Staff', id, payload.role);
  return ok_({ id: id });
}

function setStaffActive_(payload) {
  const guard = requireRole_(payload.token, 'Admin');
  if (!guard.ok) return guard.response;
  updateRowByKey_('Staff', 'Id', payload.staffId, { IsActive: !!payload.isActive });
  logAudit_(guard.session.Username, payload.isActive ? 'ACTIVATE_STAFF' : 'DEACTIVATE_STAFF', 'Staff', payload.staffId, '');
  return ok_({ updated: true });
}
