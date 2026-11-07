# Deepu Enterprises B2B Platform — fixed demo package

## Run it (recommended)
- **Windows:** double-click `START-WINDOWS.bat`.
- **macOS/Linux:** run `./START-MAC-LINUX.sh` from this folder.
- Or manually: open a terminal in `frontend` and run `python -m http.server 8000`, then visit `http://localhost:8000/`.

Do not open `frontend/js/*.js` or `frontend/css/*.css` as pages. They are supporting source files, not standalone web pages. The public entry point is `frontend/index.html`; the admin page is `frontend/pages/admin/dashboard.html` and is reached through the Admin button after demo login.

## Demo admin credentials
- Username: `admin@deepu.local`
- Password: `Demo@12345`

The demo uses browser localStorage. Changes stay in that browser and are not shared with the company. Apps Script is not connected until a deployment URL is configured in `frontend/js/app.js`.

All sample products and partner brands are illustrative demo records, not verified live company data. See `docs/SETUP.md` before deployment.
