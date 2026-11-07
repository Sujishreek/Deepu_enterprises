"""
Quick test of the Starlette app endpoints using Starlette TestClient or direct invocation
"""
import asyncio
from backend.services.inventory_service import InventoryService
from backend.services.sales_service import SalesService
from backend.services.purchase_service import PurchaseService
from backend.services.search_service import search_products
from backend.services.sheets_service import GoogleSheetsSyncService

def run_tests():
    print("Testing InventoryService...")
    summary = InventoryService.get_dashboard_summary()
    print("Dashboard Summary:", summary["total_products"], "products, stock:", summary["total_stock_units"], "sales:", summary["total_sales_revenue"])
    assert summary["total_products"] > 0
    assert summary["total_stock_units"] > 0

    print("Testing Multilingual & Tanglish search...")
    all_prods = InventoryService.list_products()
    res1 = search_products(all_prods, "bulbu")
    print("Search 'bulbu' found:", len(res1), [p["name"] for p in res1[:2]])
    assert len(res1) > 0

    res2 = search_products(all_prods, "vayar")
    print("Search 'vayar' found:", len(res2), [p["name"] for p in res2[:2]])
    assert len(res2) > 0

    res3 = search_products(all_prods, "பல்பு")
    print("Search Tamil 'bulb' found:", len(res3), [p["name"] for p in res3[:2]])
    assert len(res3) > 0

    print("Testing Sale creation and inventory decrement...")
    test_p = all_prods[0]
    initial_stock = test_p["stock_quantity"]
    sale_res = SalesService.create_sale({
        "customer_name": "Test Counter Customer",
        "customer_phone": "9876599999",
        "payment_mode": "UPI",
        "items": [{"product_id": test_p["product_id"], "quantity": 2, "unit_price": test_p["selling_price"]}]
    })
    print("Created sale invoice:", sale_res["invoice_no"], "Grand Total:", sale_res["grand_total"])
    updated_p = InventoryService.get_product(test_p["product_id"])
    print(f"Stock before: {initial_stock}, Stock after sale: {updated_p['stock_quantity']}")
    assert updated_p["stock_quantity"] == initial_stock - 2

    print("Testing Google Sheets sync export payload...")
    sheets_payload = GoogleSheetsSyncService.export_all_tables_as_sheets_payload()
    print("Sheets prepared:", list(sheets_payload.keys()))
    assert "Products" in sheets_payload
    assert "Racks" in sheets_payload
    assert "Sales" in sheets_payload

    print("\nALL BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
