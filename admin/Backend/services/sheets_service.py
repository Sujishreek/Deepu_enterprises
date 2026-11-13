"""
Google Sheets Integration & Data Synchronization Service
Future-ready data access layer connecting SQLite with Google Sheets / Google Apps Script.
"""

from Admin.Backend.database import get_connection
import json
import urllib.request
import urllib.error
from datetime import datetime

class GoogleSheetsSyncService:
    @staticmethod
    def get_settings():
        conn = get_connection()
        cur = conn.cursor()
        rows = cur.execute("SELECT setting_key, setting_value FROM sync_settings").fetchall()
        conn.close()
        return dict(rows)

    @staticmethod
    def save_settings(settings_dict):
        conn = get_connection()
        cur = conn.cursor()
        for k, v in settings_dict.items():
            cur.execute("""
                INSERT INTO sync_settings (setting_key, setting_value, updated_at)
                VALUES (?, ?, datetime('now', 'localtime'))
                ON CONFLICT(setting_key) DO UPDATE SET
                    setting_value = excluded.setting_value,
                    updated_at = datetime('now', 'localtime')
            """, (k, str(v)))
        conn.commit()
        conn.close()
        return GoogleSheetsSyncService.get_settings()

    @staticmethod
    def get_sync_status():
        settings = GoogleSheetsSyncService.get_settings()
        spreadsheet_id = settings.get("SPREADSHEET_ID", "")
        last_sync = settings.get("LAST_SYNC_AT", "Never")
        auto_sync = settings.get("AUTO_SYNC_ENABLED", "0") == "1"
        apps_script_url = settings.get("APPS_SCRIPT_URL", "")

        conn = get_connection()
        cur = conn.cursor()
        product_count = cur.execute("SELECT COUNT(*) FROM products WHERE is_active = 1").fetchone()[0]
        sales_count = cur.execute("SELECT COUNT(*) FROM sales").fetchone()[0]
        rack_count = cur.execute("SELECT COUNT(*) FROM racks").fetchone()[0]
        conn.close()

        is_connected = bool(apps_script_url or (spreadsheet_id and spreadsheet_id != "DEMO"))

        return {
            "is_connected": is_connected,
            "mode": "Live Google Sheets" if is_connected else "Local SQLite Database (Demo Ready)",
            "spreadsheet_id": spreadsheet_id,
            "spreadsheet_url": f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit" if spreadsheet_id else "",
            "has_apps_script": bool(apps_script_url),
            "last_sync_at": last_sync,
            "auto_sync_enabled": auto_sync,
            "local_record_summary": {
                "products": product_count,
                "sales_invoices": sales_count,
                "racks": rack_count
            }
        }

    @staticmethod
    def export_all_tables_as_sheets_payload():
        """
        Extracts all application tables into the tabular rows format expected by Google Sheets:
        { "Products": [[headers...], [row1...], ...], "Sales": [...], ... }
        """
        conn = get_connection()
        cur = conn.cursor()

        payload = {}

        # 1. Products Sheet
        prods = cur.execute("""
            SELECT product_id, name, name_ta, sku, barcode, category_id, rack_id, brand_id,
                   unit, purchase_price, selling_price, wholesale_price, stock_quantity,
                   min_stock_level, is_active, updated_at
            FROM products ORDER BY rack_id, name
        """).fetchall()
        p_headers = ["ID", "Name (EN)", "Name (Kannada)", "SKU", "Barcode", "Category", "Rack", "Brand",
                     "Unit", "Purchase Price", "Selling Price", "Wholesale Price", "Stock Quantity",
                     "Min Stock Level", "Active", "Last Updated"]
        payload["Products"] = [p_headers] + [list(r) for r in prods]

        # 2. Racks Sheet
        racks = cur.execute("SELECT rack_id, name, name_ta, icon, category_id, capacity_pct, status, description FROM racks").fetchall()
        r_headers = ["Rack ID", "Name", "Kannada Name", "Icon", "Category", "Capacity %", "Status", "Description"]
        payload["Racks"] = [r_headers] + [list(r) for r in racks]

        # 3. Sales Sheet
        sales = cur.execute("SELECT sale_id, invoice_no, customer_name, customer_phone, subtotal, discount_amount, tax_amount, grand_total, paid_amount, balance_amount, payment_mode, status, created_at FROM sales").fetchall()
        s_headers = ["Sale ID", "Invoice No", "Customer Name", "Phone", "Subtotal", "Discount", "Tax", "Grand Total", "Paid Amount", "Balance", "Payment Mode", "Status", "Date"]
        payload["Sales"] = [s_headers] + [list(r) for r in sales]

        # 4. Stock Movements Sheet
        movs = cur.execute("""
            SELECT m.movement_id, p.name, m.movement_type, m.quantity, m.previous_stock, m.new_stock, m.reference_id, m.reason, m.performed_by, m.created_at
            FROM stock_movements m
            JOIN products p ON m.product_id = p.product_id
            ORDER BY m.created_at DESC
        """).fetchall()
        m_headers = ["Movement ID", "Product", "Type", "Quantity", "Prev Stock", "New Stock", "Ref No", "Reason", "User", "Timestamp"]
        payload["StockMovements"] = [m_headers] + [list(r) for r in movs]

        # 5. Suppliers Sheet
        sups = cur.execute("SELECT supplier_id, name, contact_person, phone, email, gstin, city, outstanding_balance FROM suppliers").fetchall()
        sup_headers = ["Supplier ID", "Company Name", "Contact Person", "Phone", "Email", "GSTIN", "City", "Balance Due"]
        payload["Suppliers"] = [sup_headers] + [list(r) for r in sups]

        # 6. Customers Sheet
        custs = cur.execute("SELECT customer_id, name, phone, email, business_name, city, customer_type, credit_balance FROM customers").fetchall()
        c_headers = ["Customer ID", "Customer Name", "Phone", "Email", "Business Name", "City", "Type", "Credit Balance"]
        payload["Customers"] = [c_headers] + [list(r) for r in custs]

        conn.close()
        return payload

    @staticmethod
    def sync_to_google_sheets():
        """
        Synchronizes local SQLite records to configured Google Sheets.
        If Apps Script Web App URL is provided, sends POST request with payload.
        Otherwise updates the last_sync timestamp and prepares data bundle.
        """
        settings = GoogleSheetsSyncService.get_settings()
        apps_script_url = settings.get("APPS_SCRIPT_URL", "").strip()

        payload = GoogleSheetsSyncService.export_all_tables_as_sheets_payload()
        now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")

        if apps_script_url and apps_script_url.startswith("http"):
            try:
                req_data = json.dumps({"action": "batchSync", "data": payload}).encode("utf-8")
                req = urllib.request.Request(
                    apps_script_url,
                    data=req_data,
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=10) as response:
                    res_body = response.read().decode("utf-8")
                    res_json = json.loads(res_body)
                    GoogleSheetsSyncService.save_settings({"LAST_SYNC_AT": now_str})
                    return {
                        "status": "success",
                        "synced_at": now_str,
                        "remote_response": res_json,
                        "sheets_updated": list(payload.keys())
                    }
            except Exception as e:
                # Log error and fallback
                return {
                    "status": "partial_offline",
                    "synced_at": now_str,
                    "warning": f"Could not reach remote Apps Script endpoint ({str(e)}). Local sync bundle created.",
                    "sheets_prepared": list(payload.keys())
                }

        # Local mode: Record timestamp and confirm payload generation
        GoogleSheetsSyncService.save_settings({"LAST_SYNC_AT": f"{now_str} (Local Bundle Ready)"})
        return {
            "status": "success",
            "synced_at": now_str,
            "message": "Local records serialized and ready for Google Sheets API push.",
            "sheets_prepared": list(payload.keys()),
            "total_products": len(payload.get("Products", [])) - 1,
            "total_sales": len(payload.get("Sales", [])) - 1
        }
