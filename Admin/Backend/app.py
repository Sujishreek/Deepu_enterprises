"""
Deepu Enterprises / Kamagere Mart - Electrical & Electronics Inventory Management System
Starlette ASGI Application with Full REST API & Google Sheets Data Access Layer
"""

import os
import json
import csv
import io
from datetime import datetime, timedelta

from starlette.applications import Starlette
from starlette.responses import JSONResponse, HTMLResponse, Response, FileResponse
from starlette.routing import Route, Mount
from starlette.staticfiles import StaticFiles
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

from Admin.Backend.database import init_db, get_connection
from Admin.Backend.services.inventory_service import InventoryService
from Admin.Backend.services.sales_service import SalesService
from Admin.Backend.services.purchase_service import PurchaseService
from Admin.Backend.services.search_service import search_products, get_search_suggestions
from Admin.Backend.services.sheets_service import GoogleSheetsSyncService

# Ensure DB is created
init_db()

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FRONTEND_DIR = os.path.join(PROJECT_DIR, "Admin", "Frontend")

# ----------------- Helper Handlers -----------------

async def handle_home(request):
    index_file = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_file):
        with open(index_file, "r", encoding="utf-8") as f:
            return HTMLResponse(f.read())
    return HTMLResponse("<h1>Deepu Enterprises Inventory System Ready</h1>")

# ----------------- Auth API -----------------

async def api_login(request):
    try:
        body = await request.json()
    except Exception:
        body = {}
    username = body.get("username", "").strip()
    password = body.get("password", "").strip()
    role = body.get("role", "Admin")

    # Demo accounts
    if username in ["admin", "admin@deepu.local", "deepu"] and (password in ["Demo@12345", "admin123", "admin"]):
        return JSONResponse({
            "ok": True,
            "token": "tok_admin_demo_9921",
            "user": {
                "user_id": "U1",
                "username": "admin",
                "full_name": "Deepu R. (Proprietor)",
                "role": "Admin",
                "email": "contact@deepuenterprises.com"
            }
        })
    elif username in ["staff", "sales"] and (password in ["staff123", "Demo@12345"]):
        return JSONResponse({
            "ok": True,
            "token": "tok_staff_demo_8812",
            "user": {
                "user_id": "U2",
                "username": "staff",
                "full_name": "Mani K. (Sales Staff)",
                "role": "Staff",
                "email": "sales@deepuenterprises.com"
            }
        })
    return JSONResponse({"ok": False, "error": "Invalid username or password. Use demo login or Admin credentials."}, status_code=401)

async def api_get_profile(request):
    return JSONResponse({
        "user_id": "U1",
        "username": "admin",
        "full_name": "Deepu R. (Proprietor)",
        "role": "Admin",
        "shop": "Deepu Enterprises – Electrical & Electronics"
    })

# ----------------- Dashboard API -----------------

async def api_dashboard_stats(request):
    try:
        summary = InventoryService.get_dashboard_summary()
        return JSONResponse({"ok": True, "data": summary})
    except Exception as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=500)

async def api_dashboard_charts(request):
    conn = get_connection()
    cur = conn.cursor()

    # 1. Last 7 Days Sales Trend (Matches Screenshot 1 line chart)
    today = datetime.now()
    trend_labels = []
    trend_sales = []
    trend_orders = []

    for i in range(6, -1, -1):
        dt = today - timedelta(days=i)
        dt_str = dt.strftime("%Y-%m-%d")
        dt_label = dt.strftime("%d %b")
        trend_labels.append(dt_label)

        row = cur.execute("""
            SELECT COALESCE(SUM(grand_total), 0.0) as daily_total,
                   COUNT(*) as order_count
            FROM sales
            WHERE date(created_at) = ? AND status = 'Completed'
        """, (dt_str,)).fetchone()

        trend_sales.append(round(row["daily_total"], 2) if row else 0.0)
        trend_orders.append(row["order_count"] if row else 0)

    # 2. Category Distribution (Pie / Donut Chart)
    cat_dist = cur.execute("""
        SELECT c.name as label, c.name_ta as label_kn,
               COUNT(p.product_id) as product_count,
               COALESCE(SUM(p.stock_quantity), 0) as stock_count,
               COALESCE(SUM(p.stock_quantity * p.selling_price), 0.0) as total_value
        FROM categories c
        LEFT JOIN products p ON c.category_id = p.category_id AND p.is_active = 1
        GROUP BY c.category_id
        HAVING stock_count > 0
        ORDER BY stock_count DESC
        LIMIT 6
    """).fetchall()

    conn.close()

    return JSONResponse({
        "ok": True,
        "data": {
            "sales_trend": {
                "labels": trend_labels,
                "revenue": trend_sales,
                "orders": trend_orders
            },
            "category_distribution": [dict(r) for r in cat_dist]
        }
    })

# ----------------- Products API -----------------

async def api_list_products(request):
    rack_id = request.query_params.get("rack_id")
    category_id = request.query_params.get("category_id")
    brand_id = request.query_params.get("brand_id")
    stock_status = request.query_params.get("stock_status")
    query = request.query_params.get("q")

    products = InventoryService.list_products(
        rack_id=rack_id,
        category_id=category_id,
        brand_id=brand_id,
        stock_status=stock_status,
        query=query
    )
    return JSONResponse({"ok": True, "count": len(products), "data": products})

async def api_get_product(request):
    pid = request.path_params.get("product_id")
    prod = InventoryService.get_product(pid)
    if not prod:
        return JSONResponse({"ok": False, "error": "Product not found"}, status_code=404)
    return JSONResponse({"ok": True, "data": prod})

async def api_create_product(request):
    try:
        body = await request.json()
        new_prod = InventoryService.create_product(body, user=body.get("user", "Admin"))
        return JSONResponse({"ok": True, "data": new_prod}, status_code=201)
    except Exception as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=400)

async def api_update_product(request):
    pid = request.path_params.get("product_id")
    try:
        body = await request.json()
        updated = InventoryService.update_product(pid, body, user=body.get("user", "Admin"))
        if not updated:
            return JSONResponse({"ok": False, "error": "Product not found"}, status_code=404)
        return JSONResponse({"ok": True, "data": updated})
    except Exception as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=400)

async def api_delete_product(request):
    pid = request.path_params.get("product_id")
    success = InventoryService.delete_product(pid)
    return JSONResponse({"ok": True, "deleted": success})

async def api_adjust_product_stock(request):
    pid = request.path_params.get("product_id")
    try:
        body = await request.json()
        delta = int(body.get("delta", 0))
        movement_type = body.get("movement_type", "Adjustment")
        reason = body.get("reason", "Admin quick stock adjustment")
        user = body.get("user", "Admin")

        result = InventoryService.adjust_stock(pid, delta, movement_type, reason=reason, user=user)
        return JSONResponse({"ok": True, "data": result})
    except Exception as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=400)

# ----------------- Racks, Categories & Brands API -----------------

async def api_list_racks(request):
    racks = InventoryService.list_racks()
    return JSONResponse({"ok": True, "count": len(racks), "data": racks})

async def api_list_categories(request):
    cats = InventoryService.list_categories()
    return JSONResponse({"ok": True, "count": len(cats), "data": cats})

async def api_list_brands(request):
    brands = InventoryService.list_brands()
    return JSONResponse({"ok": True, "count": len(brands), "data": brands})

async def api_list_movements(request):
    limit = int(request.query_params.get("limit", 50))
    movs = InventoryService.list_movements(limit=limit)
    return JSONResponse({"ok": True, "count": len(movs), "data": movs})

# ----------------- Sales & POS Billing API -----------------

async def api_create_sale(request):
    try:
        body = await request.json()
        sale = SalesService.create_sale(body, user=body.get("user", "Admin"))
        return JSONResponse({"ok": True, "data": sale}, status_code=201)
    except Exception as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=400)

async def api_list_sales(request):
    start = request.query_params.get("start_date")
    end = request.query_params.get("end_date")
    cust = request.query_params.get("customer_id")
    limit = int(request.query_params.get("limit", 100))

    sales = SalesService.list_sales(start_date=start, end_date=end, customer_id=cust, limit=limit)
    return JSONResponse({"ok": True, "count": len(sales), "data": sales})

async def api_get_sale_details(request):
    sid = request.path_params.get("sale_id")
    sale = SalesService.get_sale_details(sid)
    if not sale:
        return JSONResponse({"ok": False, "error": "Sale invoice not found"}, status_code=404)
    return JSONResponse({"ok": True, "data": sale})

async def api_return_sale(request):
    sid = request.path_params.get("sale_id")
    try:
        body = await request.json()
        reason = body.get("reason", "Customer Return")
        user = body.get("user", "Admin")
        res = SalesService.return_sale(sid, reason=reason, user=user)
        return JSONResponse({"ok": True, "data": res})
    except Exception as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=400)

# ----------------- Purchases API -----------------

async def api_create_purchase(request):
    try:
        body = await request.json()
        po = PurchaseService.create_purchase(body, user=body.get("user", "Admin"))
        return JSONResponse({"ok": True, "data": po}, status_code=201)
    except Exception as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=400)

async def api_list_purchases(request):
    pos = PurchaseService.list_purchases()
    return JSONResponse({"ok": True, "count": len(pos), "data": pos})

async def api_get_purchase_details(request):
    pid = request.path_params.get("purchase_id")
    po = PurchaseService.get_purchase_details(pid)
    if not po:
        return JSONResponse({"ok": False, "error": "Purchase order not found"}, status_code=404)
    return JSONResponse({"ok": True, "data": po})

# ----------------- Suppliers & Customers API -----------------

async def api_suppliers(request):
    if request.method == "GET":
        return JSONResponse({"ok": True, "data": PurchaseService.list_suppliers()})
    elif request.method == "POST":
        body = await request.json()
        sup = PurchaseService.create_supplier(body)
        return JSONResponse({"ok": True, "data": sup}, status_code=201)

async def api_supplier_item(request):
    sid = request.path_params.get("supplier_id")
    if request.method == "PUT":
        body = await request.json()
        res = PurchaseService.update_supplier(sid, body)
        return JSONResponse({"ok": True, "data": res})
    elif request.method == "DELETE":
        res = PurchaseService.delete_supplier(sid)
        return JSONResponse({"ok": True, "data": res})

async def api_customers(request):
    if request.method == "GET":
        return JSONResponse({"ok": True, "data": PurchaseService.list_customers()})
    elif request.method == "POST":
        body = await request.json()
        cust = PurchaseService.create_customer(body)
        return JSONResponse({"ok": True, "data": cust}, status_code=201)

async def api_customer_item(request):
    cid = request.path_params.get("customer_id")
    if request.method == "PUT":
        body = await request.json()
        res = PurchaseService.update_customer(cid, body)
        return JSONResponse({"ok": True, "data": res})
    elif request.method == "DELETE":
        res = PurchaseService.delete_customer(cid)
        return JSONResponse({"ok": True, "data": res})

# ----------------- Price Management API -----------------

async def api_price_management(request):
    if request.method == "GET":
        conn = get_connection()
        cur = conn.cursor()
        rows = cur.execute("""
            SELECT p.product_id, p.name, p.name_ta as name_kn, p.sku, p.unit, p.stock_quantity,
                   p.purchase_price, p.selling_price, p.wholesale_price,
                   b.name as brand_name, c.name as category_name,
                   ROUND(((p.selling_price - p.purchase_price) / NULLIF(p.purchase_price, 0)) * 100, 1) as profit_margin_pct,
                   ROUND(p.selling_price - p.purchase_price, 2) as profit_amount
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE p.is_active = 1
            ORDER BY p.name
        """).fetchall()
        conn.close()
        return JSONResponse({"ok": True, "data": [dict(r) for r in rows]})
    elif request.method == "POST":
        body = await request.json()
        pid = body.get("product_id")
        user = body.get("user", "Admin")
        res = InventoryService.update_product(pid, body, user=user)
        return JSONResponse({"ok": True, "data": res})

# ----------------- Reports & Export API -----------------

async def api_reports(request):
    rtype = request.path_params.get("report_type")
    conn = get_connection()
    cur = conn.cursor()

    if rtype == "sales":
        rows = cur.execute("""
            SELECT s.invoice_no, s.created_at, s.customer_name, s.payment_mode, s.subtotal,
                   s.discount_amount, s.tax_amount, s.grand_total, s.status,
                   (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.sale_id) as items_count
            FROM sales s
            ORDER BY s.created_at DESC
        """).fetchall()
        data = [dict(r) for r in rows]
    elif rtype == "stock":
        rows = cur.execute("""
            SELECT p.product_id, p.name, p.sku, r.name as rack, b.name as brand,
                   p.stock_quantity, p.min_stock_level, p.unit, p.purchase_price, p.selling_price,
                   ROUND(p.stock_quantity * p.purchase_price, 2) as stock_valuation
            FROM products p
            LEFT JOIN racks r ON p.rack_id = r.rack_id
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            WHERE p.is_active = 1
            ORDER BY p.stock_quantity ASC
        """).fetchall()
        data = [dict(r) for r in rows]
    elif rtype == "profit-loss":
        # Gross profit estimation
        sales_sum = cur.execute("SELECT COALESCE(SUM(grand_total), 0) FROM sales WHERE status = 'Completed'").fetchone()[0]
        cogs_sum = cur.execute("""
            SELECT COALESCE(SUM(si.quantity * si.cost_price), 0)
            FROM sale_items si
            JOIN sales s ON si.sale_id = s.sale_id
            WHERE s.status = 'Completed'
        """).fetchone()[0]
        gross_profit = round(sales_sum - cogs_sum, 2)
        margin_pct = round((gross_profit / sales_sum * 100), 1) if sales_sum > 0 else 0.0

        data = {
            "total_revenue": round(sales_sum, 2),
            "cost_of_goods_sold": round(cogs_sum, 2),
            "gross_profit": gross_profit,
            "gross_margin_pct": margin_pct,
            "period": "All Time / Current Fiscal Year"
        }
    else:
        conn.close()
        return JSONResponse({"ok": False, "error": "Unknown report type"}, status_code=400)

    conn.close()
    return JSONResponse({"ok": True, "report_type": rtype, "data": data})

async def api_export_csv(request):
    rtype = request.query_params.get("type", "products")
    conn = get_connection()
    cur = conn.cursor()

    output = io.StringIO()
    writer = csv.writer(output)

    if rtype == "sales":
        rows = cur.execute("SELECT invoice_no, created_at, customer_name, payment_mode, grand_total, status FROM sales ORDER BY created_at DESC").fetchall()
        writer.writerow(["Invoice No", "Date", "Customer", "Payment Mode", "Grand Total (INR)", "Status"])
        for r in rows:
            writer.writerow(list(r))
        filename = "sales_report.csv"
    else:
        rows = cur.execute("SELECT product_id, name, sku, rack_id, stock_quantity, purchase_price, selling_price FROM products WHERE is_active = 1 ORDER BY rack_id").fetchall()
        writer.writerow(["Product ID", "Product Name", "SKU", "Rack", "Stock Units", "Cost Price", "Selling Price"])
        for r in rows:
            writer.writerow(list(r))
        filename = "inventory_stock_report.csv"

    conn.close()
    csv_bytes = output.getvalue().encode("utf-8")
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

# ----------------- Intelligent Search & Suggestions API -----------------

async def api_smart_search(request):
    q = request.query_params.get("q", "")
    all_products = InventoryService.list_products()
    suggestions = get_search_suggestions(all_products, q, limit=8)
    return JSONResponse({"ok": True, "query": q, "data": suggestions})

# ----------------- Google Sheets Sync API -----------------

async def api_sync_status(request):
    status = GoogleSheetsSyncService.get_sync_status()
    return JSONResponse({"ok": True, "data": status})

async def api_sync_trigger(request):
    res = GoogleSheetsSyncService.sync_to_google_sheets()
    return JSONResponse({"ok": True, "data": res})

async def api_sync_settings(request):
    if request.method == "POST":
        body = await request.json()
        saved = GoogleSheetsSyncService.save_settings(body)
        return JSONResponse({"ok": True, "data": saved})
    else:
        return JSONResponse({"ok": True, "data": GoogleSheetsSyncService.get_settings()})

async def api_sync_export_bundle(request):
    bundle = GoogleSheetsSyncService.export_all_tables_as_sheets_payload()
    return JSONResponse({"ok": True, "data": bundle})

# ----------------- Routes Configuration -----------------

routes = [
    Route("/", handle_home, methods=["GET"]),
    Route("/api/auth/login", api_login, methods=["POST"]),
    Route("/api/auth/profile", api_get_profile, methods=["GET"]),
    
    Route("/api/dashboard/stats", api_dashboard_stats, methods=["GET"]),
    Route("/api/dashboard/charts", api_dashboard_charts, methods=["GET"]),
    
    Route("/api/products", api_list_products, methods=["GET"]),
    Route("/api/products", api_create_product, methods=["POST"]),
    Route("/api/products/{product_id}", api_get_product, methods=["GET"]),
    Route("/api/products/{product_id}", api_update_product, methods=["PUT"]),
    Route("/api/products/{product_id}", api_delete_product, methods=["DELETE"]),
    Route("/api/products/{product_id}/stock", api_adjust_product_stock, methods=["POST"]),
    
    Route("/api/racks", api_list_racks, methods=["GET"]),
    Route("/api/categories", api_list_categories, methods=["GET"]),
    Route("/api/brands", api_list_brands, methods=["GET"]),
    Route("/api/stock/movements", api_list_movements, methods=["GET"]),
    
    Route("/api/sales", api_list_sales, methods=["GET"]),
    Route("/api/sales", api_create_sale, methods=["POST"]),
    Route("/api/sales/{sale_id}", api_get_sale_details, methods=["GET"]),
    Route("/api/sales/{sale_id}/return", api_return_sale, methods=["POST"]),
    
    Route("/api/purchases", api_list_purchases, methods=["GET"]),
    Route("/api/purchases", api_create_purchase, methods=["POST"]),
    Route("/api/purchases/{purchase_id}", api_get_purchase_details, methods=["GET"]),
    
    Route("/api/suppliers", api_suppliers, methods=["GET", "POST"]),
    Route("/api/suppliers/{supplier_id}", api_supplier_item, methods=["PUT", "DELETE"]),
    Route("/api/customers", api_customers, methods=["GET", "POST"]),
    Route("/api/customers/{customer_id}", api_customer_item, methods=["PUT", "DELETE"]),
    
    Route("/api/prices", api_price_management, methods=["GET", "POST"]),
    Route("/api/reports/{report_type}", api_reports, methods=["GET"]),
    Route("/api/reports/export/csv", api_export_csv, methods=["GET"]),
    
    Route("/api/search", api_smart_search, methods=["GET"]),
    
    Route("/api/sync/status", api_sync_status, methods=["GET"]),
    Route("/api/sync/trigger", api_sync_trigger, methods=["POST"]),
    Route("/api/sync/settings", api_sync_settings, methods=["GET", "POST"]),
    Route("/api/sync/export-bundle", api_sync_export_bundle, methods=["GET"])
]

# Mount static files if frontend folder exists
if os.path.exists(FRONTEND_DIR):
    routes.append(Mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static"))

middleware = [
    Middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
]

app = Starlette(debug=True, routes=routes, middleware=middleware)

if __name__ == "__main__":
    import uvicorn
    print("Starting Deepu Enterprises Inventory Management Backend on http://127.0.0.1:8000")
    uvicorn.run("Admin.Backend.app:app", host="127.0.0.1", port=8000, reload=True)
