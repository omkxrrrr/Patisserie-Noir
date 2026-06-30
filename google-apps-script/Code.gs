/**
 * Code.gs
 * ───────────────────────────────────────────────────────────────────
 * Entry point for the whole backend. Deploy this project as a Web App
 * (Deploy → New deployment → Web app → Execute as: Me → Who has access:
 * Anyone) and put the resulting /exec URL into VITE_APPS_SCRIPT_URL.
 *
 * The frontend sends POST requests with Content-Type: text/plain (NOT
 * application/json) on purpose — Apps Script doesn't implement
 * doOptions(), so a request that would trigger a CORS preflight (like a
 * JSON content-type) simply fails cross-origin. text/plain is a
 * "simple request" and skips preflight entirely; we still parse the
 * body as JSON manually below.
 * ───────────────────────────────────────────────────────────────────
 */

// Read-only actions allowed via GET (so they're trivially cacheable / linkable).
const GET_ACTIONS = {
  getCakes: getCakes_,
  getCakeById: getCakeById_,
  getCategories: getCategories_,
  getTestimonials: getTestimonials_,
  getSlotAvailability: getSlotAvailability_,
  getBanners: getBanners_,
  getGallery: getGallery_,
  getBlogPosts: getBlogPosts_,
  getBlogPostBySlug: getBlogPostBySlug_
};

// Mutating + auth-required actions go through POST.
const POST_ACTIONS = {
  // Public, no auth
  createOrder: createOrder_,
  validateCoupon: validateCoupon_,
  submitInquiry: submitInquiry_,
  submitTestimonial: submitTestimonial_,
  uploadImage: uploadImage_,

  // Auth
  adminLogin: adminLogin_,
  adminLogout: adminLogout_,
  changePassword: changePassword_,

  // Admin: staff
  listStaff: listStaff_,
  createStaff: createStaff_,
  setStaffActive: setStaffActive_,

  // Admin: cakes
  adminCreateCake: adminCreateCake_,
  adminUpdateCake: adminUpdateCake_,
  adminSetCakeAvailability: adminSetCakeAvailability_,

  // Admin: orders
  getOrderById: getOrderById_,
  getOrders: getOrders_,
  updateOrderStatus: updateOrderStatus_,
  bulkUpdateOrderStatus: bulkUpdateOrderStatus_,
  addOrderNote: addOrderNote_,
  setOrderFlags: setOrderFlags_,
  getKitchenQueue: getKitchenQueue_,

  // Admin: coupons
  listCoupons: listCoupons_,
  createCoupon: createCoupon_,
  setCouponActive: setCouponActive_,

  // Admin: customers
  listCustomers: listCustomers_,
  getCustomerOrderHistory: getCustomerOrderHistory_,
  updateCustomerNotesOrVIP: updateCustomerNotesOrVIP_,

  // Admin: inquiries
  getInquiries: getInquiries_,
  updateInquiryStatus: updateInquiryStatus_,

  // Admin: testimonials
  adminListTestimonials: adminListTestimonials_,
  adminModerateTestimonial: adminModerateTestimonial_,

  // Admin: analytics
  getDashboardSummary: getDashboardSummary_,
  getRevenueSeries: getRevenueSeries_,

  // Admin: inventory, content, audit, backup (Phase 2 — see those .gs files)
  getInventory: getInventory_,
  adjustInventoryStock: adjustInventoryStock_,
  estimateIngredientNeeds: estimateIngredientNeeds_,
  adminCreateBanner: adminCreateBanner_,
  adminUpdateBanner: adminUpdateBanner_,
  adminCreateBlogPost: adminCreateBlogPost_,
  adminUpdateBlogPost: adminUpdateBlogPost_,
  adminCreateGalleryItem: adminCreateGalleryItem_,
  adminDeleteGalleryItem: adminDeleteGalleryItem_,
  getAuditLogs: getAuditLogs_,
  exportFullBackup: exportFullBackup_
};

function checkSecret_(payload) {
  const expected = PropertiesService.getScriptProperties().getProperty('API_SECRET');
  if (!expected) return true; // not configured yet — allow, so local setup isn't blocked
  return payload && payload.secret === expected;
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    if (!action || !GET_ACTIONS.hasOwnProperty(action)) {
      return fail_('Unknown or missing action: ' + action);
    }
    if (!checkSecret_(e.parameter)) return fail_('Unauthorized.');
    return GET_ACTIONS[action](e.parameter);
  } catch (err) {
    return fail_(err && err.message ? err.message : String(err));
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const action = body.action;
    if (!action || !POST_ACTIONS.hasOwnProperty(action)) {
      return fail_('Unknown or missing action: ' + action);
    }
    if (!checkSecret_(body)) return fail_('Unauthorized.');
    return POST_ACTIONS[action](body);
  } catch (err) {
    return fail_(err && err.message ? err.message : String(err));
  }
}
