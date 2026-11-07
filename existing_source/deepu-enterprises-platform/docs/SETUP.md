# Deepu Enterprises – setup and deployment

## Included
- Responsive public website with product search/filter, inquiry cart, dealer application, contact form, brand directory and coverage overview.
- Admin demo dashboard: products, quick stock edits, rack locations, inquiries, dealer applications, brand list, delivery areas and stock movement log.
- Dealer portal placeholder and dealer application flow.
- Google Apps Script backend with Google Sheets setup, public inquiry endpoints, admin login, product/stock endpoints and role checks.
- SQL reference schema and sample data.
- Official logo supplied by the project owner. No extra real photographs are used.

## Important data integrity note
All product records and all brand records in this project are **fictional demo records**. The existing public website lists coverage places (Channarayapatna, Hassan City, Holenarasipura, Arsikere, Belur, Sakleshpur, Arkalgud and Alur) and makes business claims such as 15+ years, 500+ retailers and 24-hour delivery. Treat claims and route schedules as unverified until Deepu Enterprises confirms them. The map is a schematic, not a live geographic map. Brand names are illustrative examples, not proof of an authorized partnership.

## Run locally
1. Extract the ZIP.
2. Open `frontend/index.html` in a browser, or serve the `frontend` folder with a local static server.
3. The public catalog and admin dashboard use localStorage demo data. Admin demo login: `admin@deepu.local` / `Demo@12345`.
4. Dealer portal is a UI placeholder; real dealer authentication and private pricing need admin provisioning and a deployed backend.

Local demo mode stores changes in that browser only. It is not shared between devices and is not a production database.

## Deploy Apps Script backend
1. Create a new Google Apps Script project.
2. Copy `backend/Code.gs` into `Code.gs`.
3. Enable **Show "appsscript.json" manifest file** in Project Settings and copy the provided manifest.
4. Run `setupDatabase()` manually and authorize it. It creates a Google Spreadsheet with all required tabs and sample records.
5. Run `setupAdmin()` once. Then open **Project Settings → Script Properties** and replace `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` with a hash for a strong private password. The helper `sha256("your-password")` can be run from the editor; do not leave the example password.
6. Deploy → New deployment → Web app. Execute as the deploying account. Choose access appropriate to your use case. Public inquiry endpoints must be reachable by website visitors; admin endpoints still require a session token.
7. Copy the `/exec` URL and set `API_URL` at the top of `frontend/js/app.js`.
8. Test public submissions and admin sign-in using a separate test account before production.

## Security / production hardening required
- Do not use demo credentials in production.
- Apps Script web apps with "Anyone" access expose the endpoint publicly; keep public actions limited to validated submissions and read-only catalog data.
- The included admin login is a basic single-admin demonstration. Before real business use, add rate limiting/lockout, password rotation, session revocation, CSRF/origin strategy, least-privilege access, and preferably Google Workspace identity or a dedicated identity provider.
- Never return rack/bin, dealer pricing, invoice or personal information from public endpoints.
- Validate all inputs server-side. Restrict spreadsheet access to authorized operators.
- Google Sheets is a starter datastore, not a high-concurrency inventory database. Use transaction/locking patterns and consider a relational database when volume grows.
- Add GST-compliant invoice numbering/tax calculations only after the company's accountant confirms requirements.
- Verify GSTIN against the appropriate official process; format validation alone does not verify a registration.
- Confirm WhatsApp business number before configuring a direct business link.
- Configure real route days, delivery cut-off times, warehouse addresses and the scope of any 24-hour guarantee before advertising them.

## Frontend structure
- `index.html`: public website
- `css/styles.css`: responsive design and admin styles
- `js/app.js`: public catalog, inquiry cart, forms and API integration
- `pages/admin/dashboard.html`, `js/admin.js`: local demo admin
- `pages/dealer.html`: dealer portal landing state
- `backend/Code.gs`: Apps Script API and Sheets schema initialization

## Current feature status
- Phase 1 public site: implemented as a functional demo.
- Phase 2 inventory/admin: implemented in browser demo; Apps Script product and stock API included, but admin UI API wiring needs deployment-specific integration before production.
- Phase 3 dealer onboarding/portal: application capture implemented; dealer login, dealer pricing and account provisioning are not complete production workflows.
- Phase 4 inquiries/orders/invoices/routes: inquiry capture and admin status demo implemented; order fulfillment, invoice generation, route calendar and live map integrations require business rules and confirmation.
- Phase 5 deployment/security: deployment instructions included; production hardening and acceptance testing remain required.

This is a complete phase-one-to-five starter delivery, not a claim that a live production system is already deployed.

## Troubleshooting the local demo
- Start the site through the supplied launcher or `python -m http.server 8000` from the `frontend` directory. Then open `http://localhost:8000/`.
- Keep the folder structure intact. `index.html` depends on `css/styles.css`, `js/app.js`, and `assets/images/deepu-logo.png` using relative paths.
- JavaScript and CSS files are not pages and cannot be opened as standalone websites.
- Open the admin dashboard using the Admin button on the public website and the demo credentials. The demo inventory is initialized in localStorage on first page load so the admin and public catalog share the same sample data.
- If the browser has stale demo data, clear site data for `localhost:8000` and reload. This resets only the local demo data.
