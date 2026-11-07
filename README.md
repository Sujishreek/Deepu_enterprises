# Deepu Enterprises — Electrical & Electronics Inventory Management System

A modern, professional, bilingual (English & Tamil) Inventory Management & POS Billing System designed specifically for an **Electrical and Electronics Shop** (wholesale & retail).

Built strictly using:
- **Frontend**: Pure **HTML5**, **CSS3**, and **Modern JavaScript (ES6+)**
- **Backend**: **Google Apps Script** (`Code.gs` Web App)
- **Database**: **Google Sheets** (Google Spreadsheet)

---

## 🌟 Key Architecture & Capabilities

### 1. Left-Side Vertical Navigation Sidebar (Matches Reference Screenshots)
- Replaced top navigation bar with a modern dark navy (`#0B132B`) vertical sidebar with collapsed and expanded modes.
- 10 complete modules:
  1. **Admin Dashboard** (`📊`): 4 KPI cards (Total Stock, Low Stock, In-Stock, Total Valuation), Sales & Stock trend line charts, Top-Selling Products leaderboard, and Recent Transactions table.
  2. **Products Management** (`📦`): 4-column visual card grid (matching Screenshot 2) & inventory list table (matching Screenshot 4), brand pills filter (`[Philips]`, `[Syska]`, `[Crompton]`, `[Bajaj]`, `[Havells]`, `[Finolex]`, `[Anchor]`, `[Legrand]`, `[Polycab]`), Rack filter, and full CRUD.
  3. **Stock Management** (`📑`): Quick stock adjustment modal, low-stock & out-of-stock alerts, and full stock movement audit history log.
  4. **Purchase Management** (`🚚`): Inward purchase order creation, supplier procurement, automatic stock increments and cost price updating.
  5. **Sales & POS Billing** (`🧾`): Fast counter billing, cart summary, discount %, GST rate calculation, Cash / UPI / Bank Transfer / Credit ledger, and professional printable tax invoice generation.
  6. **Suppliers** (`🏭`): Authorized distributor profiles, contact information, GSTIN, and balance payables.
  7. **Customers** (`👥`): Retail and wholesale electrician / contractor customer accounts with credit balance ledger.
  8. **Price & Margin Management** (`🏷️`): Cost price vs selling price vs wholesale price, profit margin % calculation, markup amount, and instant price updating.
  9. **Reports & Financial Analytics** (`📈`): Sales reports, stock valuation report, profit & loss estimate, and one-click CSV export.
  10. **Settings & Google Sheets Sync** (`⚙️`): Connect your Google Apps Script Web App URL, test live sync, and manage shop profile for invoices.

---

### 2. The 20 Electrical Racks Grid (Matches Screenshot 3)
Physical warehouse and shop rack mapping for electrical goods:
- **R1 Bulbs** (LED bulbs, incandescent, tube lights)
- **R2 Wires** (1.0mm, 1.5mm, 2.5mm, 4.0mm FR copper wires)
- **R3 Switches** (Modular switches, sockets, fan regulators)
- **R4 Cables** (Submersible flat cables, armored 3-core cables)
- **R5 Sockets** (3-pin, multi-plug adaptors, power tops)
- **R6 Fuses** (Rewirable porcelain kit-kat fuses, cartridge fuses)
- **R7 MCBs** (Single pole, double pole MCB isolators, RCCBs)
- **R8 LEDs** (Slim round/square panels, ceiling downlights, COBs)
- **R9 Fans** (1200mm high-speed ceiling fans, exhaust fans)
- **R10 Lighting** (Commercial floodlights, battens, decorative gate lights)
- **R11 Junction Box** (Concealed PVC boxes, surface boxes)
- **R12 Tools** (Insulated pliers, line testers, screwdrivers, crimpers)
- **R13 Hardware** (Screws, clips, wall plugs, nails, brackets)
- **R14 Raw Material** (Insulation PVC, copper lugs, terminal blocks)
- **R15 Panels** (Distribution boards, metal enclosures, DB boxes)
- **R16 Sensors** (Motion sensors, dusk-to-dawn sensors)
- **R17 Motors** (Submersible pumps, agricultural motors)
- **R18 Batteries** (Inverter tubular batteries, dry cells)
- **R19 Connectors** (Wire twist caps, terminal strips, lugs)
- **R20 Safety Gear** (Insulated electrical gloves, helmets, safety goggles)

---

### 3. Bilingual Language Support (Tamil & English)
- Integrated `js/i18n.js` dictionary covering all navigation items, form labels, buttons, tables, status badges, and rack names.
- Instant 1-click toggle button (`🌐 தமிழ் / English`) in the top navigation bar.
- All 20 racks and default electrical products have verified English and Tamil names (e.g. `பல்புகள்`, `கம்பிகள் / ஒயர்கள்`, `சுவிட்சுகள்`, `மின் விசிறிகள்`).

---

### 4. Smart Multilingual & Tanglish Fuzzy Search (Pure JavaScript)
Implemented in `js/search.js` without any external library dependencies:
- **English**: `led`, `syska`, `wire`, `tube`
- **Tamil**: `பல்பு`, `சுவிட்ச்`, `வயர்`, `விசிறி`
- **Tanglish / Phonetic**: `bulbu`, `vayar`, `vaayar`, `suvichu`, `fanu`, `toobulaight`, `filips`
- **Typo Tolerance**: Handles `phlips` ➔ `Philips`, `finolekz` ➔ `Finolex`, `havels` ➔ `Havells`.
- Live autocomplete suggestions dropdown with thumbnail preview, rack location, and selling price.

---

### 5. Google Sheets Database & Google Apps Script Backend
- Backend code is in [`backend/Code.gs`](file:///c:/Users/JEEVINA/Downloads/Kamagere_Mart_Fullstack/backend/Code.gs).
- Automated `setupDatabase()` function creates all tab sheets with frozen header rows:
  - `Products`, `Racks`, `Categories`, `Brands`, `Sales`, `SaleItems`, `Purchases`, `PurchaseItems`, `Suppliers`, `Customers`, `StockMovements`, `Settings`.
- See [`backend/GOOGLE-SHEETS-SETUP.md`](file:///c:/Users/JEEVINA/Downloads/Kamagere_Mart_Fullstack/backend/GOOGLE-SHEETS-SETUP.md) for 3-minute setup instructions.
- Works offline in `localStorage` mode out of the box, and syncs live once your Google Apps Script URL is saved.

---

## 🚀 How to Run

### Method 1: Double-Click (No Installation Needed!)
Simply double-click [`index.html`](file:///c:/Users/JEEVINA/Downloads/Kamagere_Mart_Fullstack/index.html) in your browser.

### Method 2: Local Web Server
Double-click [`START-WINDOWS.bat`](file:///c:/Users/JEEVINA/Downloads/Kamagere_Mart_Fullstack/START-WINDOWS.bat).
Or run:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.
