# Google Sheets Database Setup Guide

This Inventory Management System uses **Google Sheets** as its database and **Google Apps Script** as its serverless backend.

---

## Set up the Google Sheets backend

### Step 1: Create a Google Spreadsheet and open Apps Script
1. Go to [sheets.new](https://sheets.new) in your browser.
2. In the top menu, click **Extensions** > **Apps Script**.

### Step 2: Add the backend code
1. Delete any default code in `Code.gs`.
2. Open [`Code.gs`](./Code.gs) in this repository and copy its contents.
3. Paste the contents into `Code.gs` in the Google Apps Script editor.
4. Click the **Save** icon (disk icon).

### Step 3: Initialize the spreadsheet (once)
1. In the Apps Script toolbar, select the function dropdown and choose **`setupDatabase`**.
2. Click **Run**.
3. Google will ask for permission on your account:
   - Review and allow the requested spreadsheet access for your own script.
4. `setupDatabase` will automatically create all the formatted sheets with frozen header rows:
   - `Products`, `Racks`, `Categories`, `Brands`, `Sales`, `SaleItems`, `Purchases`, `PurchaseItems`, `Suppliers`, `Customers`, `StockMovements`, `Settings`.
   - It seeds sample inventory records; it does not create any sales transactions.

> **Warning:** `setupDatabase()` clears and rebuilds these tabs. Run it only on a new spreadsheet or when you are certain you want to erase the existing tab data.

### Step 4: Deploy the API
1. At the top right of the Apps Script window, click **Deploy** > **New deployment**.
2. Click the gear icon (⚙️) next to *Select type* and choose **Web app**.
3. Configure:
   - **Description**: `Deepu Enterprises Inventory API`
   - **Execute as**: `Me (your email)`
   - **Who has access**: Choose an access level that permits the app's users to call the API. Anyone with the URL can use an unauthenticated deployment, so only use it if that exposure is acceptable for your data.
4. Click **Deploy**.
5. Copy the generated **Web app URL** (it ends with `/exec`).

### Step 5: Connect the app
The Sheets URL field was removed from the app's Settings screen. With the app open, use the browser developer console to save the deployed `/exec` URL:

```js
API.setApiUrl("https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec");
```

Reload the app and open **Reports & Analytics**. Reports fetch the `Sales` sheet through `getAllData`, count only `Completed` transactions, and show a message instead of demo sales if the backend is not configured or no completed sales exist.
