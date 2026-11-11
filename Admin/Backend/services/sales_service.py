"""
Sales, POS Billing, Invoicing and Customer Ledger Service
Handles POS checkout, inventory depletion, invoice generation, and sale returns.
"""

from Admin.Backend.database import get_connection
import uuid
from datetime import datetime

class SalesService:
    @staticmethod
    def generate_invoice_no(cur):
        year = datetime.now().strftime("%Y")
        last_row = cur.execute("SELECT invoice_no FROM sales WHERE invoice_no LIKE ? ORDER BY created_at DESC LIMIT 1", (f"SAL-{year}-%",)).fetchone()
        if last_row and last_row["invoice_no"]:
            try:
                seq = int(last_row["invoice_no"].split("-")[-1]) + 1
            except Exception:
                seq = 1
        else:
            seq = 101
        return f"SAL-{year}-{seq:05d}"

    @staticmethod
    def create_sale(data, user="Admin"):
        conn = get_connection()
        cur = conn.cursor()

        try:
            sale_id = "SAL-" + uuid.uuid4().hex[:8].upper()
            invoice_no = SalesService.generate_invoice_no(cur)
            customer_id = data.get("customer_id")
            customer_name = data.get("customer_name", "Walk-in Customer").strip() or "Walk-in Customer"
            customer_phone = data.get("customer_phone", "").strip()
            payment_mode = data.get("payment_mode", "Cash")
            notes = data.get("notes", "")

            items = data.get("items", [])
            if not items:
                raise ValueError("Sale must include at least one item")

            subtotal = 0.0
            total_cost = 0.0
            sale_items_records = []

            # Process items and verify stock
            for itm in items:
                pid = itm.get("product_id")
                qty = int(itm.get("quantity", 1))
                if qty <= 0:
                    continue

                prod = cur.execute("SELECT * FROM products WHERE product_id = ?", (pid,)).fetchone()
                if not prod:
                    raise ValueError(f"Product {pid} not found")

                unit_price = float(itm.get("unit_price") or prod["selling_price"])
                cost_price = float(prod["purchase_price"])
                line_total = round(unit_price * qty, 2)
                subtotal += line_total
                total_cost += round(cost_price * qty, 2)

                item_id = "SI-" + uuid.uuid4().hex[:8].upper()
                sale_items_records.append({
                    "item_id": item_id,
                    "sale_id": sale_id,
                    "product_id": pid,
                    "product_name": prod["name"],
                    "sku": prod["sku"],
                    "quantity": qty,
                    "unit_price": unit_price,
                    "cost_price": cost_price,
                    "line_total": line_total,
                    "prev_stock": prod["stock_quantity"]
                })

            discount = float(data.get("discount_amount", 0.0))
            tax_rate = float(data.get("tax_rate", 0.0)) # e.g. 18 for 18% GST
            taxable_amount = max(0.0, subtotal - discount)
            tax_amount = round(taxable_amount * (tax_rate / 100.0), 2)
            grand_total = round(taxable_amount + tax_amount, 2)

            paid_amount = float(data.get("paid_amount", grand_total))
            balance_amount = max(0.0, round(grand_total - paid_amount, 2))

            # Insert Sale Record
            cur.execute("""
                INSERT INTO sales (
                    sale_id, invoice_no, customer_id, customer_name, customer_phone,
                    subtotal, discount_amount, tax_amount, grand_total, paid_amount,
                    balance_amount, payment_mode, status, notes, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Completed', ?, ?)
            """, (
                sale_id, invoice_no, customer_id, customer_name, customer_phone,
                subtotal, discount, tax_amount, grand_total, paid_amount,
                balance_amount, payment_mode, notes, user
            ))

            # Insert Items & update stock
            for rec in sale_items_records:
                cur.execute("""
                    INSERT INTO sale_items (
                        item_id, sale_id, product_id, product_name, sku, quantity, unit_price, cost_price, line_total
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    rec["item_id"], rec["sale_id"], rec["product_id"], rec["product_name"],
                    rec["sku"], rec["quantity"], rec["unit_price"], rec["cost_price"], rec["line_total"]
                ))

                # Decrement stock
                new_stock = max(0, rec["prev_stock"] - rec["quantity"])
                cur.execute("UPDATE products SET stock_quantity = ?, updated_at = datetime('now', 'localtime') WHERE product_id = ?", (new_stock, rec["product_id"]))

                # Record stock audit movement
                mov_id = "MOV-" + uuid.uuid4().hex[:8].upper()
                cur.execute("""
                    INSERT INTO stock_movements (
                        movement_id, product_id, movement_type, quantity, previous_stock, new_stock, reference_id, reason, performed_by
                    ) VALUES (?, ?, 'Sale', ?, ?, ?, ?, ?, ?)
                """, (
                    mov_id, rec["product_id"], -rec["quantity"], rec["prev_stock"], new_stock,
                    invoice_no, f"Sold to {customer_name} ({invoice_no})", user
                ))

            # Update customer balance if credit / partial payment
            if customer_id and balance_amount > 0:
                cur.execute("UPDATE customers SET credit_balance = credit_balance + ? WHERE customer_id = ?", (balance_amount, customer_id))

            conn.commit()
            conn.close()

            return SalesService.get_sale_details(sale_id)

        except Exception as e:
            conn.rollback()
            conn.close()
            raise e

    @staticmethod
    def get_sale_details(sale_id_or_invoice_no):
        conn = get_connection()
        cur = conn.cursor()

        sale = cur.execute("""
            SELECT s.*, c.email as customer_email, c.address as customer_address, c.city as customer_city
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.customer_id
            WHERE s.sale_id = ? OR s.invoice_no = ?
        """, (sale_id_or_invoice_no, sale_id_or_invoice_no)).fetchone()

        if not sale:
            conn.close()
            return None

        sale_dict = dict(sale)
        items = cur.execute("SELECT * FROM sale_items WHERE sale_id = ?", (sale_dict["sale_id"],)).fetchall()
        sale_dict["items"] = [dict(i) for i in items]

        # Fetch shop settings for invoice header
        settings = dict(cur.execute("SELECT setting_key, setting_value FROM sync_settings").fetchall())
        sale_dict["shop_info"] = {
            "name": settings.get("SHOP_NAME", "Deepu Enterprises"),
            "tagline": settings.get("SHOP_TAGLINE", "Electrical & Electronics"),
            "phone": settings.get("SHOP_PHONE", "+91 98450 12345"),
            "gstin": settings.get("SHOP_GSTIN", "29ABCDE1234F1Z5"),
            "address": settings.get("SHOP_ADDRESS", "Main Hub, B.M. Road, Channarayapatna, Karnataka")
        }

        conn.close()
        return sale_dict

    @staticmethod
    def list_sales(start_date=None, end_date=None, customer_id=None, limit=100):
        conn = get_connection()
        cur = conn.cursor()

        sql = """
            SELECT s.*,
                   (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.sale_id) as items_count,
                   (SELECT COALESCE(SUM(quantity), 0) FROM sale_items WHERE sale_id = s.sale_id) as total_quantity
            FROM sales s
            WHERE 1=1
        """
        params = []

        if start_date:
            sql += " AND date(s.created_at) >= ?"
            params.append(start_date)
        if end_date:
            sql += " AND date(s.created_at) <= ?"
            params.append(end_date)
        if customer_id:
            sql += " AND s.customer_id = ?"
            params.append(customer_id)

        sql += " ORDER BY s.created_at DESC LIMIT ?"
        params.append(limit)

        rows = cur.execute(sql, params).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def return_sale(sale_id, reason="Customer Return", user="Admin"):
        conn = get_connection()
        cur = conn.cursor()

        sale = cur.execute("SELECT * FROM sales WHERE sale_id = ?", (sale_id,)).fetchone()
        if not sale:
            conn.close()
            raise ValueError("Sale not found")

        if sale["status"] == "Returned":
            conn.close()
            return {"message": "Sale is already marked as returned"}

        items = cur.execute("SELECT * FROM sale_items WHERE sale_id = ?", (sale_id,)).fetchall()

        # Restock products
        for itm in items:
            p = cur.execute("SELECT stock_quantity FROM products WHERE product_id = ?", (itm["product_id"],)).fetchone()
            if p:
                prev_stock = p["stock_quantity"]
                new_stock = prev_stock + itm["quantity"]
                cur.execute("UPDATE products SET stock_quantity = ?, updated_at = datetime('now', 'localtime') WHERE product_id = ?", (new_stock, itm["product_id"]))

                mov_id = "MOV-" + uuid.uuid4().hex[:8].upper()
                cur.execute("""
                    INSERT INTO stock_movements (
                        movement_id, product_id, movement_type, quantity, previous_stock, new_stock, reference_id, reason, performed_by
                    ) VALUES (?, ?, 'Return', ?, ?, ?, ?, ?, ?)
                """, (mov_id, itm["product_id"], itm["quantity"], prev_stock, new_stock, sale["invoice_no"], f"Return from {sale['customer_name']}: {reason}", user))

        cur.execute("UPDATE sales SET status = 'Returned', notes = notes || ' [RETURNED: ' || ? || ']' WHERE sale_id = ?", (reason, sale_id))

        # Revert customer credit if unpaid balance existed
        if sale["customer_id"] and sale["balance_amount"] > 0:
            cur.execute("UPDATE customers SET credit_balance = max(0, credit_balance - ?) WHERE customer_id = ?", (sale["balance_amount"], sale["customer_id"]))

        conn.commit()
        conn.close()
        return {"status": "success", "message": "Sale returned and stock replenished successfully"}
