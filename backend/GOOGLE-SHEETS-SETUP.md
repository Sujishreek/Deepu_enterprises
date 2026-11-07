# Google Sheets Database Setup Guide

This Inventory Management System uses **Google Sheets** as its database and **Google Apps Script** as its serverless backend.

---

## ⚡ 3-Minute Setup Instructions

### Step 1: Create a Google Spreadsheet & Open Apps Script
1. Go to [sheets.new](https://sheets.new) in your browser.
2. In the top menu, click **Extensions** > **Apps Script**.

### Step 2: Paste the Backend Code
1. Delete any default code in `Code.gs`.
2. Open [`backend/Code.gs`](file:///c:/Users/JEEVINA/Downloads/Kamagere_Mart_Fullstack/backend/Code.gs) from this folder and copy all its contents.
3. Paste the contents into `Code.gs` in the Google Apps Script editor.
4. Click the **Save** icon (disk icon).

### Step 3: Run Setup Function (Once)
1. In the Apps Script toolbar, select the function dropdown and choose **`setupDatabase`**.
2. Click **Run**.
3. Google will ask for permission on your account:
   - Click *Review permissions* > Select your Google Account > Click *Advanced* > Click *Go to Untitled project (unsafe)* > Click *Allow*.
4. `setupDatabase` will automatically create all the formatted sheets with frozen header rows:
   - `Products`, `Racks`, `Categories`, `Brands`, `Sales`, `SaleItems`, `Purchases`, `PurchaseItems`, `Suppliers`, `Customers`, `StockMovements`, `Settings`.
   - It will automatically populate initial electrical shop demo records!

### Step 4: Deploy as a Web App
1. At the top right of the Apps Script window, click **Deploy** > **New deployment**.
2. Click the gear icon (⚙️) next to *Select type* and choose **Web app**.
3. Configure:
   - **Description**: `Deepu Enterprises Inventory API`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(Important: required so your browser frontend can communicate with the sheet)*.
4. Click **Deploy**.
5. Copy the generated **Web app URL** (it ends with `/exec`).

### Step 5: Connect in the Application
1. Open [`index.html`](file:///c:/Users/JEEVINA/Downloads/Kamagere_Mart_Fullstack/index.html) in your browser.
2. Go to **Settings & Sheets Sync** from the left navigation bar.
3. Paste your **Web app URL** into the *Google Apps Script Web App URL* box.
4. Click **Save & Connect**.
5. That's it! Your entire Inventory Management System is now reading and writing directly to your **Google Spreadsheet**!
