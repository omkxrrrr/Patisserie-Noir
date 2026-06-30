/**
 * Inquiries.gs
 * Backs the Custom Cake / Wedding Cake / Corporate Order / Contact forms —
 * these are leads, not orders, since they usually need a quote/conversation
 * before a price exists.
 */

function rowToInquiry_(r) {
  return {
    id: r.Id, type: r.Type, name: r.Name, phone: r.Phone, email: r.Email,
    eventDate: r.EventDate, guestCount: r.GuestCount, budget: r.Budget, details: r.Details,
    status: r.Status, staffNotes: r.StaffNotes, createdAt: r.CreatedAt, updatedAt: r.UpdatedAt
  };
}

function submitInquiry_(payload) {
  if (!payload.name || !payload.phone || !payload.type) return fail_('Name, phone, and inquiry type are required.');
  const id = generateId_('INQ');
  const now = nowIso_();
  appendRow_('Inquiries', {
    Id: id, Type: payload.type, Name: payload.name, Phone: payload.phone, Email: payload.email || '',
    EventDate: payload.eventDate || '', GuestCount: payload.guestCount || '', Budget: payload.budget || '',
    Details: payload.details || '', Status: 'New', StaffNotes: '', CreatedAt: now, UpdatedAt: now
  });
  return ok_({ inquiryId: id });
}

function getInquiries_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  let inquiries = readSheet_('Inquiries', CACHE_TTL.SHORT);
  if (payload.type) inquiries = inquiries.filter(function (i) { return i.Type === payload.type; });
  if (payload.status) inquiries = inquiries.filter(function (i) { return i.Status === payload.status; });
  inquiries.sort(function (a, b) { return new Date(b.CreatedAt) - new Date(a.CreatedAt); });
  return ok_(inquiries.map(rowToInquiry_));
}

function updateInquiryStatus_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  const patch = { Status: payload.status, UpdatedAt: nowIso_() };
  if (payload.hasOwnProperty('staffNotes')) patch.StaffNotes = payload.staffNotes;
  const updated = updateRowByKey_('Inquiries', 'Id', payload.id, patch);
  if (!updated) return fail_('Inquiry not found.');
  return ok_(rowToInquiry_(updated));
}
