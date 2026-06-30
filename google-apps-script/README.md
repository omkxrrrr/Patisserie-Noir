# Backend setup — Google Apps Script

This folder is the entire backend. There is no server to host — Google
runs it for you, for free, inside your own Google account.

## 1. Create the Sheet + Script project

1. Go to [sheets.google.com](https://sheets.google.com) and create a new
   blank spreadsheet. Name it something like **"Patisserie Noir — Database"**.
2. In the Sheet, go to **Extensions → Apps Script**. This opens a script
   project already bound to your spreadsheet.
3. Delete the default `Code.gs` content, then create each file in this
   folder inside the Apps Script editor with the **same filename**
   (use the **+** next to "Files" → **Script**), and paste the matching
   contents:
   - `Code.gs`
   - `Utils.gs`
   - `Setup.gs`
   - `Auth.gs`
   - `Cakes.gs`
   - `Orders.gs`
   - `Coupons.gs`
   - `Customers.gs`
   - `Inquiries.gs`
   - `Testimonials.gs`
   - `Content.gs`
   - `Inventory.gs`
   - `Analytics.gs`
   - `AuditAndBackup.gs`
   - `Media.gs`

## 2. Run the one-time setup

1. In the Apps Script editor toolbar, pick `setupSpreadsheet` from the
   function dropdown (next to the Run button) and click **Run**.
2. The first time, Google will ask you to authorize the script — accept
   it (it's your own script touching your own Sheet and Drive; the Drive
   permission is used only to store customer photo uploads from the
   cake customizer).
3. You'll get an alert with a generated **Owner login**:
   - username: `owner`
   - password: `ChangeMe123!`
   Log in with this once the admin panel is running, then change it
   immediately from **Staff Management**.
4. Go back to the Sheet — you should now see tabs: Cakes, Orders,
   StatusLog, Inquiries, Testimonials, Coupons, Inventory, Banners,
   BlogPosts, Gallery, Staff, Sessions, AuditLog, Customers.
5. Add a few rows to the **Cakes** sheet so the catalog isn't empty —
   it just needs `Id`, `Name`, `Slug`, `Category`, `Description`,
   `BasePrice`, `Images` (comma-separated image URLs), and `IsAvailable`
   = `TRUE` at minimum. (Phase 2 of this build adds an admin "Manage
   Cakes" screen so you won't need to touch the Sheet directly.)

## 3. Set your API secret

This stops random people from calling your `/exec` URL directly.

1. In the Apps Script editor: **Project Settings (gear icon) → Script
   Properties → Add script property**.
2. Key: `API_SECRET`, Value: any long random string (e.g. run
   `openssl rand -hex 24` in a terminal, or just mash the keyboard).
3. Put the **same value** in your frontend's `.env.local` as
   `VITE_API_SECRET`.

## 4. Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → **Web app**.
3. Settings:
   - Execute as: **Me**
   - Who has access: **Anyone**
   (This does *not* expose your Sheet — only the specific actions coded
   in `Code.gs` are reachable, and every one of them is gated by the
   `API_SECRET` and, for admin actions, a valid login session token.)
4. Click **Deploy**, authorize again if asked, and copy the **Web app
   URL** (ends in `/exec`).
5. Put it in your frontend's `.env.local` as `VITE_APPS_SCRIPT_URL`.

## 5. Redeploying after you change the code

Apps Script Web App URLs are pinned to a specific deployment snapshot.
If you edit any `.gs` file later, you must:
**Deploy → Manage deployments → ✏️ (edit) → Version: New version → Deploy**.
The `/exec` URL stays the same — you don't need to update your `.env`.

## Notes on quotas & limits

- Free Google accounts get **20,000 URL Fetch / script runtime calls
  per day**, which is far more than a single bakery needs.
- Apps Script execution is capped at **6 minutes per request** — every
  function here runs in well under a second for realistic sheet sizes
  (hundreds to low thousands of rows). If you ever grow past ~10,000
  orders, consider migrating reads to the Sheets API with row indexing,
  but that's a "great problem to have" scale, not a day-one concern.
- The read/write helpers in `Utils.gs` cache reads for 30–600 seconds
  (`CACHE_TTL`) and invalidate that cache the moment a write happens, so
  the Sheet itself is hit far less often than the number of page views.
