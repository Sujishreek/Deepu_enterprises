# Deepu Enterprises — User Website + Admin Panel

```
deepu-enterprises/
├── user/                 Customer website (catalog, search, quote requests, dealer form)
├── Admin/
│   ├── Frontend/         Inventory / POS admin panel and its assets
│   └── Backend/          Google Apps Script API and Google Sheets setup guide
├── design-system.css     Shared design tokens and responsive media rules
├── START-WINDOWS.bat / START-MAC-LINUX.sh
```

## Run

Always run through the local server (not by double-clicking the HTML files) — the website and admin share data through the browser's localStorage, which requires the same origin.

## How the two parts connect
- The website reads the **same database** as the admin (`deepu_electrical_v3_kn`): products, Kannada names, retail price, stock status, racks, categories, brands, shop phone/address/name.
- Edit a product or price in admin → the website updates (live across tabs).
- Language (English / ಕನ್ನಡ) is shared via `deepu_lang`.
- Quote requests, dealer applications and contact messages from the website appear in admin → **Customer Enquiries**. Admins can call, WhatsApp or email applicants, then approve dealer applications; approval is saved as an **Approved** status. Other enquiries can be set to New / In Progress / Closed.
- Wholesale and purchase prices are never shown on the website.

## Google Sheets (optional)
See `Admin/Backend/GOOGLE-SHEETS-SETUP.md`. Paste `Admin/Backend/Code.gs` (it adds an `Enquiries` sheet) and initialize the spreadsheet if needed. Admin API actions require a valid session; the public User website can still submit enquiries. Set admin credentials in Apps Script Script Properties. The existing `/admin/index.html` User-site link redirects to `Admin/Frontend/`.

## Notes
- The User website's Admin link retains its existing demo sign-in. The Admin panel now also requires Apps Script authentication.
- Delivery coverage towns come from the earlier website; confirm before publishing.
