"""
Purchase Orders, Inward Stock, Supplier Management and Customer Ledger Service
"""

from Admin.Backend.database import get_connection
import uuid
from datetime import datetime

class PurchaseService:
    @staticmethod
    def list_suppliers():
        conn = get_connection()
        cur = conn.cursor()
        rows = cur.execute("""
            SELECT s.*, 
                   COUNT(p.purchase_id) as total_orders,
                   COALESCE(SUM(p.total_amount), 0.0) as total_purchased
            FROM suppliers s
            LEFT JOIN purchases p ON s.supplier_id = p.supplier_id
            GROUP BY s.supplier_id
            ORDER BY s.name
        """).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def create_supplier(data):
        conn = get_connection()
        cur = conn.cursor()
        sid = "SUP" + uuid.uuid4().hex[:6].upper()
        cur.execute("""
            INSERT INTO suppliers (supplier_id, name, contact_person, phone, email, gstin, address, city, outstanding_balance)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            sid, data.get("name"), data.get("contact_person"), data.get("phone"),
            data.get("email"), data.get("gstin"), data.get("address"), data.get("city"),
            float(data.get("outstanding_balance", 0.0))
        ))
        conn.commit()
        conn.close()
        return {"supplier_id": sid, **data}

    @staticmethod
    def update_supplier(supplier_id, data):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE suppliers SET
                name = COALESCE(?, name),
                contact_person = COALESCE(?, contact_person),
                phone = COALESCE(?, phone),
                email = COALESCE(?, email),
                gstin = COALESCE(?, gstin),
                address = COALESCE(?, address),
                city = COALESCE(?, city),
                outstanding_balance = COALESCE(?, outstanding_balance)
            WHERE supplier_id = ?
        """, (
            data.get("name"), data.get("contact_person"), data.get("phone"),
            data.get("email"), data.get("gstin"), data.get("address"), data.get("city"),
            data.get("outstanding_balance"), supplier_id
        ))
        conn.commit()
        conn.close()
        return {"supplier_id": supplier_id, "updated": True}

    @staticmethod
    def delete_supplier(supplier_id):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM suppliers WHERE supplier_id = ?", (supplier_id,))
        conn.commit()
        conn.close()
        return {"deleted": True}

    # Customers
    @staticmethod
    def list_customers():
        conn = get_connection()
        cur = conn.cursor()
        rows = cur.execute("""
            SELECT c.*,
                   COUNT(s.sale_id) as total_orders,
                   COALESCE(SUM(s.grand_total), 0.0) as lifetime_spent
            FROM customers c
            LEFT JOIN sales s ON c.customer_id = s.customer_id AND s.status = 'Completed'
            GROUP BY c.customer_id
            ORDER BY c.name
        """).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def create_customer(data):
        conn = get_connection()
        cur = conn.cursor()
        cid = "CUST" + uuid.uuid4().hex[:6].upper()
        cur.execute("""
            INSERT INTO customers (customer_id, name, phone, email, business_name, address, city, customer_type, credit_balance)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            cid, data.get("name"), data.get("phone"), data.get("email"),
            data.get("business_name"), data.get("address"), data.get("city"),
            data.get("customer_type", "Retail"), float(data.get("credit_balance", 0.0))
        ))
        conn.commit()
        conn.close()
        return {"customer_id": cid, **data}

    @staticmethod
    def update_customer(customer_id, data):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE customers SET
                name = COALESCE(?, name),
                phone = COALESCE(?, phone),
                email = COALESCE(?, email),
                business_name = COALESCE(?, business_name),
                address = COALESCE(?, address),
                city = COALESCE(?, city),
                customer_type = COALESCE(?, customer_type),
                credit_balance = COALESCE(?, credit_balance)
            WHERE customer_id = ?
        """, (
            data.get("name"), data.get("phone"), data.get("email"),
            data.get("business_name"), data.get("address"), data.get("city"),
            data.get("customer_type"), data.get("credit_balance"), customer_id
        ))
        conn.commit()
        conn.close()
        return {"customer_id": customer_id, "updated": True}

    @staticmethod
    def delete_customer(customer_id):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM customers WHERE customer_id = ?", (customer_id,))
        conn.commit()
        conn.close()
        return {"deleted": True}

    # Purchases
    @staticmethod
    def create_purchase(data, user="Admin"):
        conn = get_connection()
        cur = conn.cursor()

        try:
            pid = "PO-" + uuid.uuid4().hex[:8].upper()
            year = datetime.now().strftime("%Y")
            last_po = cur.execute("SELECT po_number FROM purchases ORDER BY created_at DESC LIMIT 1").fetchone()
            seq = 1
            if last_po and last_po["po_number"]:
                try:
                    seq = int(last_po["po_number"].split("-")[-1]) + 1
                except Exception:
                    pass
            po_number = f"PO-{year}-{seq:04d}"

            supplier_id = data.get("supplier_id")
            sup = cur.execute("SELECT name FROM suppliers WHERE supplier_id = ?", (supplier_id,)).fetchone()
            supplier_name = sup["name"] if sup else data.get("supplier_name", "General Supplier")
            invoice_number = data.get("invoice_number", "")
            notes = data.get("notes", "")

            items = data.get("items", [])
            if not items:
                raise ValueError("Purchase must include at least one item")

            total_amount = 0.0
            purchase_items_records = []

            for itm in items:
                product_id = itm.get("product_id")
                qty = int(itm.get("quantity", 1))
                pprice = float(itm.get("purchase_price", 0.0))
                ltotal = round(qty * pprice, 2)
                total_amount += ltotal

                prod = cur.execute("SELECT * FROM products WHERE product_id = ?", (product_id,)).fetchone()
                if not prod:
                    continue

                item_id = "PI-" + uuid.uuid4().hex[:8].upper()
                purchase_items_records.append({
                    "item_id": item_id,
                    "purchase_id": pid,
                    "product_id": product_id,
                    "quantity": qty,
                    "purchase_price": pprice,
                    "line_total": ltotal,
                    "prev_stock": prod["stock_quantity"],
                    "prev_price": prod["purchase_price"]
                })

            paid_amount = float(data.get("paid_amount", total_amount))
            status = "Paid" if paid_amount >= total_amount else ("Partial" if paid_amount > 0 else "Unpaid")

            cur.execute("""
                INSERT INTO purchases (purchase_id, po_number, supplier_id, supplier_name, invoice_number, total_amount, paid_amount, payment_status, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (pid, po_number, supplier_id, supplier_name, invoice_number, total_amount, paid_amount, status, notes))

            # Insert purchase items, augment stock, and update purchase cost
            for rec in purchase_items_records:
                cur.execute("""
                    INSERT INTO purchase_items (item_id, purchase_id, product_id, quantity, purchase_price, line_total)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (rec["item_id"], rec["purchase_id"], rec["product_id"], rec["quantity"], rec["purchase_price"], rec["line_total"]))

                new_stock = rec["prev_stock"] + rec["quantity"]
                # Update product stock & cost price
                cur.execute("""
                    UPDATE products 
                    SET stock_quantity = ?, purchase_price = ?, updated_at = datetime('now', 'localtime')
                    WHERE product_id = ?
                """, (new_stock, rec["purchase_price"], rec["product_id"]))

                # Audit movement
                mov_id = "MOV-" + uuid.uuid4().hex[:8].upper()
                cur.execute("""
                    INSERT INTO stock_movements (
                        movement_id, product_id, movement_type, quantity, previous_stock, new_stock, reference_id, reason, performed_by
                    ) VALUES (?, ?, 'Stock In', ?, ?, ?, ?, ?, ?)
                """, (
                    mov_id, rec["product_id"], rec["quantity"], rec["prev_stock"], new_stock,
                    po_number, f"Inward shipment from {supplier_name} (PO: {po_number})", user
                ))

            # Outstanding balance for supplier
            unpaid = total_amount - paid_amount
            if unpaid > 0 and supplier_id:
                cur.execute("UPDATE suppliers SET outstanding_balance = outstanding_balance + ? WHERE supplier_id = ?", (unpaid, supplier_id))

            conn.commit()
            conn.close()
            return {"purchase_id": pid, "po_number": po_number, "total_amount": total_amount, "status": status}

        except Exception as e:
            conn.rollback()
            conn.close()
            raise e

    @staticmethod
    def list_purchases(limit=50):
        conn = get_connection()
        cur = conn.cursor()
        rows = cur.execute("""
            SELECT p.*,
                   (SELECT COUNT(*) FROM purchase_items WHERE purchase_id = p.purchase_id) as items_count,
                   (SELECT COALESCE(SUM(quantity), 0) FROM purchase_items WHERE purchase_id = p.purchase_id) as total_quantity
            FROM purchases p
            ORDER BY p.created_at DESC
            LIMIT ?
        """, (limit,)).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_purchase_details(purchase_id):
        conn = get_connection()
        cur = conn.cursor()
        po = cur.execute("SELECT * FROM purchases WHERE purchase_id = ?", (purchase_id,)).fetchone()
        if not po:
            conn.close()
            return None
        po_dict = dict(po)
        items = cur.execute("""
            SELECT pi.*, p.name as product_name, p.sku, p.unit
            FROM purchase_items pi
            JOIN products p ON pi.product_id = p.product_id
            WHERE pi.purchase_id = ?
        """, (purchase_id,)).fetchall()
        po_dict["items"] = [dict(i) for i in items]
        conn.close()
        return po_dict
