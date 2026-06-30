/**
 * Setup.gs
 * ───────────────────────────────────────────────────────────────────
 * Run ONCE from the Apps Script editor (select `setupSpreadsheet` in the
 * function dropdown, click Run) to create every tab this app needs with
 * the correct header row, and to seed a default Owner login + starter
 * coupons. Safe to re-run — it will not duplicate a sheet that already
 * exists or already has headers.
 * ───────────────────────────────────────────────────────────────────
 */

const SHEET_SCHEMA = {
  Cakes: [
    'Id', 'Name', 'Slug', 'Category', 'Description', 'BasePrice', 'Images',
    'Rating', 'RatingCount', 'IsFeatured', 'IsBestSeller', 'IsTrending',
    'IsAvailable', 'IsSeasonal', 'AvailableFrom', 'AvailableTo', 'Tags',
    'CreatedAt', 'UpdatedAt'
  ],
  Orders: [
    'OrderId', 'CustomerName', 'Phone', 'Email', 'Address', 'MapLink', 'Lat', 'Lng',
    'CakeId', 'CakeName', 'Category', 'Shape', 'WeightKg', 'Flavor', 'CreamType',
    'FrostingType', 'Theme', 'DecorationStyle', 'Topper', 'GreetingCard', 'Candles',
    'CustomMessage', 'PhotoUploadUrl', 'ReferenceImageUrl', 'Occasion',
    'DeliveryDate', 'DeliverySlot', 'SpecialInstructions', 'IsGift', 'RecipientName',
    'RecipientPhone', 'GiftMessage', 'CouponCode', 'BasePrice', 'AddOnsPrice',
    'DeliveryCharge', 'DiscountAmount', 'TotalAmount', 'OrderStatus', 'PaymentStatus',
    'IsVIP', 'IsPriority', 'IsDuplicateFlag', 'StaffNotes', 'Source', 'CreatedAt', 'UpdatedAt'
  ],
  StatusLog: ['Id', 'OrderId', 'FromStatus', 'ToStatus', 'ChangedBy', 'Note', 'CreatedAt'],
  Inquiries: [
    'Id', 'Type', 'Name', 'Phone', 'Email', 'EventDate', 'GuestCount',
    'Budget', 'Details', 'Status', 'StaffNotes', 'CreatedAt', 'UpdatedAt'
  ],
  Testimonials: [
    'Id', 'CustomerName', 'Rating', 'Text', 'PhotoUrl', 'CakeOrdered',
    'IsApproved', 'IsFeatured', 'CreatedAt'
  ],
  Coupons: [
    'Code', 'Type', 'Value', 'MinOrderAmount', 'MaxDiscount', 'ValidFrom',
    'ValidTo', 'UsageLimit', 'UsedCount', 'IsActive', 'Tag'
  ],
  Inventory: [
    'ItemId', 'ItemName', 'Unit', 'CurrentStock', 'LowStockThreshold',
    'UsagePerKgCake', 'LastRestockedAt', 'Notes', 'UpdatedAt'
  ],
  Banners: ['Id', 'ImageUrl', 'Title', 'Subtitle', 'LinkUrl', 'SortOrder', 'IsActive'],
  BlogPosts: [
    'Id', 'Slug', 'Title', 'Excerpt', 'Content', 'CoverImage', 'MetaTitle',
    'MetaDescription', 'IsPublished', 'PublishedAt', 'CreatedAt'
  ],
  Gallery: ['Id', 'ImageUrl', 'Caption', 'IsActive', 'SortOrder'],
  Staff: ['Id', 'Name', 'Username', 'PasswordHash', 'Salt', 'Role', 'IsActive', 'CreatedAt'],
  Sessions: ['Token', 'StaffId', 'Username', 'Role', 'CreatedAt', 'ExpiresAt'],
  AuditLog: ['Id', 'ActorUsername', 'Action', 'Entity', 'EntityId', 'Details', 'CreatedAt'],
  Customers: [
    'Phone', 'Name', 'Email', 'TotalOrders', 'LifetimeSpend', 'FirstOrderAt',
    'LastOrderAt', 'IsVIP', 'Notes', 'UpdatedAt'
  ]
};

function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.keys(SHEET_SCHEMA).forEach(function (name) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    const headers = SHEET_SCHEMA[name];
    const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const isBlank = firstRow.every(function (v) { return v === '' || v === null; });
    if (isBlank) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#3A1B14').setFontColor('#FBF5EF');
    }
  });

  // Remove the default "Sheet1" if it's empty and unused
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && defaultSheet.getDataRange().isBlank()) {
    ss.deleteSheet(defaultSheet);
  }

  seedDefaultOwner_();
  seedStarterCoupons_();
  seedStarterInventory_();

  SpreadsheetApp.getUi().alert(
    'Setup complete.\n\nDefault owner login created:\n  username: owner\n  password: ChangeMe123!\n\n' +
    'Log into the admin panel and change this password immediately from Staff Management.'
  );
}

function seedDefaultOwner_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Staff');
  if (sheet.getLastRow() > 1) return; // already has staff
  const salt = Utilities.getUuid();
  const hash = hashPassword_('ChangeMe123!', salt);
  sheet.appendRow(['ST-0001', 'Shop Owner', 'owner', hash, salt, 'Owner', true, new Date().toISOString()]);
}

function seedStarterCoupons_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Coupons');
  if (sheet.getLastRow() > 1) return;
  const now = new Date();
  const farFuture = new Date(now.getFullYear() + 2, 0, 1);
  sheet.appendRow(['WELCOME10', 'percent', 10, 500, 300, now.toISOString(), farFuture.toISOString(), '', 0, true, 'welcome']);
  sheet.appendRow(['FESTIVE20', 'percent', 20, 1000, 500, now.toISOString(), farFuture.toISOString(), 200, 0, true, 'festival']);
  sheet.appendRow(['BIRTHDAY15', 'percent', 15, 700, 400, now.toISOString(), farFuture.toISOString(), '', 0, true, 'birthday']);
}

function seedStarterInventory_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Inventory');
  if (sheet.getLastRow() > 1) return;
  const now = new Date().toISOString();
  const items = [
    ['INV-001', 'Refined Flour', 'kg', 40, 10, 0.45, now, '', now],
    ['INV-002', 'Sugar', 'kg', 35, 10, 0.30, now, '', now],
    ['INV-003', 'Butter', 'kg', 20, 5, 0.25, now, '', now],
    ['INV-004', 'Cooking Chocolate', 'kg', 18, 5, 0.20, now, '', now],
    ['INV-005', 'Fresh Cream', 'litre', 22, 6, 0.35, now, '', now],
    ['INV-006', 'Eggs', 'pcs', 200, 60, 4, now, '', now],
    ['INV-007', 'Cake Boxes (1kg)', 'pcs', 80, 20, 1, now, '', now],
    ['INV-008', 'Cake Boxes (2kg)', 'pcs', 50, 15, 1, now, '', now]
  ];
  items.forEach(function (row) { sheet.appendRow(row); });
}
