# Patisserie Noir — Project Manifest

**Last updated:** Phase 1 — customer ordering flow + admin core complete. App still cannot run until `App.jsx` + `routes/index.jsx` exist.

---

## 1. Complete Folder Structure

✅ generated · 🔲 pending · ⚠️ pending but blocking

```
cake-shop/
├── .env.example                          ✅
├── .gitignore                            ✅
├── package.json                          ✅
├── vite.config.js                        ✅
├── tailwind.config.js                    ✅
├── postcss.config.js                     ✅
├── index.html                            ✅
├── PROJECT_MANIFEST.md                   ✅
│
├── google-apps-script/                   ✅ COMPLETE
│   ├── Code.gs / Utils.gs / Setup.gs / Auth.gs / Cakes.gs / Orders.gs
│   ├── Coupons.gs / Customers.gs / Inquiries.gs / Testimonials.gs
│   ├── Content.gs / Inventory.gs / Analytics.gs / AuditAndBackup.gs
│   ├── Media.gs                          ✅ (Drive-backed image upload)
│   └── README.md
│
├── public/
│   ├── cake-placeholder.svg              ✅
│   ├── favicon.svg                       🔲
│   ├── og-cover.jpg                      🔲
│   └── icons/ (192/512/maskable)         🔲
│
└── src/
    ├── main.jsx                          ✅
    ├── App.jsx                           ⚠️ BLOCKING — not yet created
    ├── index.css                         ✅
    ├── api/client.js, cache.js           ✅
    ├── services/
    │   ├── cakeService.js                ✅
    │   ├── orderService.js               ✅
    │   ├── adminServices.js              ✅
    │   └── mediaService.js               ✅
    ├── store/ (adminAuthStore, uiStore, orderDraftStore)  ✅
    ├── constants/ (cakeOptions, referenceData)            ✅
    ├── utils/ (priceCalculator, validators, whatsapp, format, exportData, pdfInvoice, aiSuggestions) ✅
    ├── hooks/ (useDebounce, usePagination)                ✅
    ├── layouts/ (CustomerLayout, AdminLayout)              ✅
    ├── routes/
    │   ├── AdminRoute.jsx                ✅
    │   └── index.jsx                     ⚠️ BLOCKING — not yet created
    ├── components/
    │   ├── ui/ (Button, Badge, Skeleton, StarRating, Modal, EmptyState, PageLoader) ✅ ALL DONE
    │   ├── layout/ (Header, Footer, MobileNav, AdminSidebar)                       ✅ ALL DONE
    │   ├── cake/ (CakeCard, CakeFilters, PriceSummary, CakeCustomizerPanel)         ✅ ALL DONE
    │   ├── order/ (DeliverySlotPicker, CouponInput, GiftDetailsForm, OrderStepper) ✅ ALL DONE
    │   └── shared/ (ComingSoon, FileUploadField, CakeHeroIllustration)             ✅ ALL DONE
    │
    ├── pages/ (customer-facing)
    │   ├── Home.jsx                      ✅
    │   ├── CakeCatalog.jsx               ✅
    │   ├── CakeDetail.jsx                ✅ (customizer + AI theme/message helpers)
    │   ├── OrderForm.jsx                 ✅ (Maps autocomplete w/ fallback, slots, gift, coupon)
    │   ├── OrderConfirmation.jsx         ✅ (PDF invoice + WhatsApp link)
    │   ├── CustomOrdersHub.jsx           🔲
    │   ├── InquiryForm.jsx               🔲
    │   ├── Contact.jsx                   🔲
    │   ├── Blog.jsx                      🔲
    │   ├── BlogPost.jsx                  🔲
    │   ├── OccasionPage.jsx              🔲
    │   └── NotFound.jsx                  🔲
    │
    └── admin/pages/
        ├── AdminLogin.jsx                ✅
        ├── AdminDashboard.jsx            ✅
        ├── OrdersPage.jsx                ✅ (list + detail modal combined — search/filter/bulk/notes/VIP/priority/export/WhatsApp/invoice)
        ├── CustomerManagement.jsx        ✅ (search/VIP/notes/order history modal)
        ├── AnalyticsPage.jsx             ✅ (daily/weekly/monthly revenue, status pie, top cakes)
        ├── Kitchen.jsx                   🔲
        ├── Inventory.jsx                 🔲
        ├── Inquiries.jsx                 🔲
        ├── Testimonials.jsx              🔲
        ├── Coupons.jsx                   🔲
        ├── CakeManagement.jsx            🔲
        ├── Content.jsx                   🔲
        ├── Staff.jsx                     🔲
        ├── AuditLogs.jsx                 🔲
        └── Reports.jsx                   🔲
```

---

## 2. Completion Status By Layer

| Layer | Status |
|---|---|
| Database schema (14 sheets) | ✅ Complete |
| Backend (Apps Script, incl. Drive media upload) | ✅ Complete |
| Frontend data layer (api/services/store/utils/constants/hooks) | ✅ Complete |
| Shared UI + cake/order components | ✅ Complete |
| Layouts | ✅ Complete |
| Customer pages | 5 of 11 done (core ordering flow complete: browse → customize → order → confirm) |
| Admin pages | 5 of 14 done (login, dashboard, orders, customers, analytics) |
| Routing (`App.jsx`, `routes/index.jsx`) | 🔲 **Not started — app will not run yet** |
| PWA icon assets | 🔲 Not started |

**Deployable today?** ❌ Not yet — `App.jsx` and `routes/index.jsx` must exist before `npm run dev` works.

**Immediate next steps:** `routes/index.jsx` → `App.jsx` → remaining customer pages (CustomOrdersHub, InquiryForm, Contact, Blog, BlogPost, OccasionPage, NotFound) → remaining admin pages (Kitchen, Inventory, Inquiries, Testimonials, Coupons, CakeManagement, Content, Staff, AuditLogs, Reports).

---

## 3. Notes On Deviations From Original Plan

- `Orders.jsx` + `OrderDetail.jsx` were merged into a single **`OrdersPage.jsx`** (detail renders in a modal rather than a separate route) per explicit instruction.
- `Dashboard.jsx` → renamed **`AdminDashboard.jsx`**; `Customers.jsx` → renamed **`CustomerManagement.jsx`** per explicit instruction.
- Added **`AnalyticsPage.jsx`** (not in the original plan) — deeper revenue/status/top-cake charts, separate from the Dashboard's compact overview. Reachable today only via a button on `AdminDashboard.jsx` (route `/admin/analytics` will be wired once `routes/index.jsx` exists; `AdminSidebar.jsx` nav link intentionally not edited since it's an existing file).
- Added **`Media.gs`** (backend) + **`mediaService.js`** + **`FileUploadField.jsx`** to make "Photo Upload / Reference Image Upload" actually work — uploads go to a Drive folder, not a placeholder.
- "AI" features (recommendation, message generator, theme suggestion) are implemented as deterministic rule-based logic in `aiSuggestions.js` (no model API key), wired into `CakeCatalog.jsx` and `CakeDetail.jsx`.
- Order confirmation deliberately has **no persistent tracking** — order details are only available via navigation state or the current browser session (`sessionStorage`), matching the business rule that excludes customer-facing order tracking after submission.
