# Deepu Enterprises — User Website + Admin Panel

```
deepu-enterprises/
├── user/    Customer website (catalog, search, quote requests, dealer form)
├── admin/   Inventory / POS admin panel (Products, Stock, Purchases, Sales, Suppliers, Prices, Reports, Settings, Customer Enquiries)
│   └── backend/   Google Apps Script (Code.gs) + Google Sheets setup guide
├── START-WINDOWS.bat / START-MAC-LINUX.sh
```

## Run
Double-click `START-WINDOWS.bat` (or run `./START-MAC-LINUX.sh`), then open
- Website: http://localhost:8000/user/
- Admin:   http://localhost:8000/admin/ — reached through the **Admin** link in the website footer.
  Demo login: `admin@deepu.local` / `Demo@12345`

Always run through the local server (not by double-clicking the HTML files) — the website and admin share data through the browser's localStorage, which requires the same origin.

## How the two parts connect
- The website reads the **same database** as the admin (`deepu_electrical_v3_kn`): products, Kannada names, retail price, stock status, racks, categories, brands, shop phone/address/name.
- Edit a product or price in admin → the website updates (live across tabs).
- Language (English / ಕನ್ನಡ) is shared via `deepu_lang`.
- Quote requests, dealer applications and contact messages from the website appear in admin → **Customer Enquiries**, where status can be set to New / In Progress / Closed.
- Wholesale and purchase prices are never shown on the website.

## Google Sheets (optional)
See `admin/backend/GOOGLE-SHEETS-SETUP.md`. Paste the new `admin/backend/Code.gs` (it adds an `Enquiries` sheet) and re-run `setupDatabase` on a new sheet, or just let the app create the sheet on first enquiry. Save the Web App URL in admin → Settings; the website then also posts enquiries there.

## Notes
- The admin login is a demo gate in the browser, not real security. Add real authentication before publishing.
- Delivery coverage towns come from the earlier website; confirm before publishing.
