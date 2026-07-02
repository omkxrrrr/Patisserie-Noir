# Patisserie Noir — Project Manifest

**Last updated:** App is fully routed and deployable. Core ordering flow, admin operations (orders/customers/analytics), Cake Menu management, and Cake Journal (blog) are live end-to-end. 8 admin pages and 4 customer pages are still `ComingSoon` placeholders — see §2 for the full list.

---

## 1. Complete Folder Structure

✅ done · 🔲 placeholder (route exists, shows "Coming Soon")

```
cake-shop/
├── .env.example
├── package.json / vite.config.js / tailwind.config.js / postcss.config.js  ✅
├── index.html                            ✅
├── PROJECT_MANIFEST.md                   ✅
│
├── google-apps-script/                   ✅ Backend complete for ALL 14 sheets
│   ├── Code.gs        — action router (doGet/doPost)
│   ├── Utils.gs        — sheet read/write/cache helpers
│   ├── Setup.gs        — sheet schema definitions
│   ├── Auth.gs          — staff login/session/roles
│   ├── Cakes.gs         — wired to CakeManagement.jsx
│   ├── Content.gs       — Banners + Gallery + Blog. Blog wired to Blog.jsx/BlogPost.jsx/Content.jsx.
│   │                       Banners & Gallery backend exists but NO frontend yet (see §2).
│   ├── Orders.gs, Coupons.gs, Customers.gs, Inquiries.gs, Testimonials.gs,
│   │   Inventory.gs, Analytics.gs, AuditAndBackup.gs  — backend ready, frontend pending (see §2)
│   ├── Media.gs          — Drive-backed image upload, wired to FileUploadField.jsx
│   └── README.md
│
├── public/
│   ├── cake-placeholder.svg              ✅
│   ├── favicon.svg                       ✅
│   ├── og-cover.jpg                      🔲 not created
│   └── icons/ (192/512/maskable)         🔲 not created — PWA installs with generic icon
│
└── src/
    ├── main.jsx, App.jsx, index.css      ✅
    ├── api/ (client.js, cache.js)        ✅
    ├── services/
    │   ├── cakeService.js                ✅ incl. admin create/update/setAvailability
    │   ├── orderService.js               ✅
    │   ├── mediaService.js               ✅
    │   └── adminServices.js              ✅ inquiry/testimonial/coupon/customer/inventory/
    │                                          content(banner+gallery+blog)/analytics/staff/audit/backup
    ├── store/ (adminAuthStore, uiStore, orderDraftStore)  ✅
    ├── constants/ (cakeOptions, referenceData)            ✅
    ├── utils/ (priceCalculator, validators, whatsapp, format, exportData, pdfInvoice, aiSuggestions) ✅
    ├── hooks/ (useDebounce, usePagination)                ✅
    ├── layouts/ (CustomerLayout, AdminLayout)              ✅ each has its own Suspense boundary
    │                                                          around <Outlet /> (fixed: layout no longer
    │                                                          unmounts/remounts — and mobile nav no longer
    │                                                          gets stuck open — on first-visit lazy page loads)
    ├── routes/ (AdminRoute.jsx, index.jsx)                 ✅
    ├── components/
    │   ├── ui/ (Button, Badge, Skeleton, StarRating, Modal, EmptyState, PageLoader) ✅
    │   ├── layout/ (Header, Footer, MobileNav, AdminSidebar)                       ✅
    │   │     ⚠️ MobileNav (customer) closes itself on link click. AdminSidebar's mobile
    │   │        drawer does NOT auto-close on nav — AdminLayout owns that open state and
    │   │        AdminSidebar has no callback wired to it yet. Minor, not yet fixed.
    │   ├── cake/ (CakeCard, CakeFilters, PriceSummary, CakeCustomizerPanel)         ✅
    │   ├── order/ (DeliverySlotPicker, CouponInput, GiftDetailsForm, OrderStepper) ✅
    │   └── shared/ (ComingSoon, FileUploadField, CakeHeroIllustration)             ✅
    │
    ├── pages/ (customer-facing)
    │   ├── Home.jsx                      ✅
    │   ├── CakeCatalog.jsx               ✅
    │   ├── CakeDetail.jsx                ✅ customizer + AI theme/message helpers
    │   ├── OrderForm.jsx                 ✅ Maps autocomplete w/ fallback, slots, gift, coupon
    │   ├── OrderConfirmation.jsx         ✅ PDF invoice + WhatsApp link
    │   ├── Blog.jsx                      ✅ NEW — Cake Journal list, published posts only
    │   ├── BlogPost.jsx                  ✅ NEW — article detail by slug, plain-text content
    │   │                                     rendered with whitespace-pre-wrap (no HTML/markdown
    │   │                                     parsing — deliberate, avoids XSS from admin-entered content)
    │   ├── CustomOrdersHub.jsx           🔲 placeholder — route /custom-orders
    │   ├── InquiryForm.jsx               🔲 placeholder — route /custom-orders/:type
    │   ├── Contact.jsx                   🔲 placeholder — route /contact
    │   └── OccasionPage.jsx              🔲 placeholder — route /occasions/:occasionId
    │       (NotFound is inline in routes/index.jsx, not a separate file)
    │
    └── admin/pages/
        ├── AdminLogin.jsx                ✅
        ├── AdminDashboard.jsx            ✅
        ├── OrdersPage.jsx                ✅ list + detail modal — search/filter/bulk/notes/VIP/priority/export/WhatsApp/invoice
        ├── CustomerManagement.jsx        ✅ search/VIP/notes/order history modal
        ├── AnalyticsPage.jsx             ✅ daily/weekly/monthly revenue, status pie, top cakes
        ├── CakeManagement.jsx            ✅ add/edit form, image URL + upload, availability toggle
        ├── Content.jsx                   ✅ NEW — Cake Journal (blog) CRUD: list all incl. drafts,
        │                                     create/edit modal, publish toggle, cover image URL + upload.
        │                                     ⚠️ Banner & Gallery management NOT built yet — same route
        │                                     ("Content & Blog" in sidebar) but only the blog half exists.
        ├── Kitchen.jsx                   🔲 placeholder — route /admin/kitchen
        ├── Inventory.jsx                 🔲 placeholder — route /admin/inventory
        ├── Inquiries.jsx                 🔲 placeholder — route /admin/inquiries
        ├── Testimonials.jsx              🔲 placeholder — route /admin/testimonials
        ├── Coupons.jsx                   🔲 placeholder — route /admin/coupons
        ├── Staff.jsx                     🔲 placeholder — route /admin/staff
        ├── AuditLogs.jsx                 🔲 placeholder — no route wired yet
        └── Reports.jsx                   🔲 placeholder — route /admin/reports
```

---

## 2. Completion Status By Layer

| Layer | Status |
|---|---|
| Database schema (14 sheets) | Complete |
| Backend (Apps Script, incl. Drive media upload) | Complete for all 14 sheets |
| Frontend data layer (api/services/store/utils/constants/hooks) | Complete |
| Shared UI + cake/order components | Complete |
| Layouts + routing | Complete, app is fully deployable |
| Customer pages | 7 of 11 done. Missing: CustomOrdersHub, InquiryForm, Contact, OccasionPage |
| Admin pages | 7 of 14 done (login, dashboard, orders, customers, analytics, cake management, content/blog). Missing: Kitchen, Inventory, Inquiries, Testimonials, Coupons, Staff, AuditLogs, Reports |
| PWA icon assets | Not started — using generic/default icon |

**Deployable today?** Yes. Every route resolves to either a working page or a clearly-labeled "Coming Soon" placeholder — nothing is broken or missing.

**Recommended next build order** (backends already exist for every item below, so each is frontend-only work):
1. **Coupons** — `couponService` already has `adminList/create/setActive`.
2. **Testimonials** — `testimonialService` already has `adminList/moderate`.
3. **Inquiries** — `inquiryService` already has `list/updateStatus`.
4. **Inventory** — `inventoryService` already has `list/adjustStock/estimateNeeds`.
5. **Kitchen** — needs `getKitchenQueue_` (exists in `Orders.gs`, not yet called from any service — needs to be added to `orderService.js`).
6. **Staff & AuditLogs & Reports** — `staffService`/`auditService`/`backupService` already exist; Reports also needs the existing `exportData.js` util wired in.
7. **Banners & Gallery** inside `Content.jsx` — backend (`getBanners_`/`getGallery_`/admin CRUD) exists, just needs UI tabs added alongside the new Blog section.

---

## 3. Notes On Deviations From Original Plan

- `Orders.jsx` + `OrderDetail.jsx` were merged into a single **`OrdersPage.jsx`** (detail renders in a modal rather than a separate route) per explicit instruction.
- `Dashboard.jsx` → renamed **`AdminDashboard.jsx`**; `Customers.jsx` → renamed **`CustomerManagement.jsx`** per explicit instruction.
- Added **`AnalyticsPage.jsx`** (not in the original plan) — deeper revenue/status/top-cake charts, separate from the Dashboard's compact overview, at `/admin/analytics`.
- Added **`Media.gs`** (backend) + **`mediaService.js`** + **`FileUploadField.jsx`** to make "Photo Upload / Reference Image Upload" actually work — uploads go to a Drive folder, not a placeholder. Cake photos and Journal cover images accept either a pasted URL or a file upload (both write to the same field).
- "AI" features (recommendation, message generator, theme suggestion) are implemented as deterministic rule-based logic in `aiSuggestions.js` (no model API key), wired into `CakeCatalog.jsx` and `CakeDetail.jsx`.
- Order confirmation deliberately has **no persistent tracking** — order details are only available via navigation state or the current browser session (`sessionStorage`), matching the business rule that excludes customer-facing order tracking after submission.
- **Cake Menu Management**: added `adminList()` to `cakeService.js` (uses the existing GET `getCakes` action with `onlyAvailable:false`, not a new backend action). Fixed a backend bug in `Cakes.gs` `getCakes_` where `onlyAvailable !== false` failed to detect the string `"false"` sent by GET query params, which silently hid unavailable cakes from the admin view even when explicitly requested.
- **Cake Journal**: added one new backend action, `adminListBlogPosts_` (registered in `Code.gs`), because the existing `getBlogPosts_`/`getBlogPostBySlug_` only ever return *published* posts — there was no way for admin to see or edit drafts. **This requires redeploying the Apps Script project** (Deploy → Manage deployments → Edit → New version) for `Content.jsx` to load its post list.
- **Layout/Suspense fix**: `Suspense` was originally only at the top of `App.jsx`, wrapping the entire routed tree. This caused `Header`/`AdminSidebar` to unmount and remount on the first visit to any not-yet-loaded lazy page each session, which was the root cause of the mobile nav drawer staying open after navigating. Fixed by moving `Suspense` into each layout, scoped to just `<Outlet />`.
