"""
Deepu Enterprises / Kamagere Mart - Electrical & Electronics Shop Inventory System
SQLite Relational Database Schema & Data Initialization
"""

import sqlite3
import os
import json
from datetime import datetime, timedelta
import random

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "inventory.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_connection()
    cur = conn.cursor()

    # 1. Racks (R1 to R20 Electrical Racks as seen in reference screenshots)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS racks (
        rack_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_ta TEXT NOT NULL,
        icon TEXT NOT NULL,
        category_id TEXT,
        capacity_pct INTEGER DEFAULT 80,
        status TEXT DEFAULT 'Active',
        description TEXT
    );
    """)

    # 2. Categories
    cur.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        category_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_ta TEXT NOT NULL,
        slug TEXT UNIQUE,
        description TEXT,
        rack_id TEXT,
        display_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1
    );
    """)

    # 3. Brands
    cur.execute("""
    CREATE TABLE IF NOT EXISTS brands (
        brand_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        logo_icon TEXT,
        is_active INTEGER DEFAULT 1
    );
    """)

    # 4. Products
    cur.execute("""
    CREATE TABLE IF NOT EXISTS products (
        product_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_ta TEXT NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        barcode TEXT,
        category_id TEXT NOT NULL,
        rack_id TEXT NOT NULL,
        brand_id TEXT NOT NULL,
        model_number TEXT,
        unit TEXT DEFAULT 'Piece',
        purchase_price REAL NOT NULL DEFAULT 0.0,
        selling_price REAL NOT NULL DEFAULT 0.0,
        wholesale_price REAL NOT NULL DEFAULT 0.0,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        min_stock_level INTEGER NOT NULL DEFAULT 10,
        image_url TEXT,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (category_id) REFERENCES categories(category_id),
        FOREIGN KEY (rack_id) REFERENCES racks(rack_id),
        FOREIGN KEY (brand_id) REFERENCES brands(brand_id)
    );
    """)

    # 5. Suppliers
    cur.execute("""
    CREATE TABLE IF NOT EXISTS suppliers (
        supplier_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        contact_person TEXT,
        phone TEXT NOT NULL,
        email TEXT,
        gstin TEXT,
        address TEXT,
        city TEXT,
        outstanding_balance REAL DEFAULT 0.0,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
    """)

    # 6. Customers
    cur.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        customer_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        email TEXT,
        business_name TEXT,
        address TEXT,
        city TEXT,
        customer_type TEXT DEFAULT 'Retail', -- 'Retail' or 'Wholesale'
        credit_balance REAL DEFAULT 0.0,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
    """)

    # 7. Stock Movements (Audit Trail)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS stock_movements (
        movement_id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        movement_type TEXT NOT NULL, -- 'Stock In', 'Stock Out', 'Sale', 'Purchase', 'Damage', 'Return', 'Adjustment'
        quantity INTEGER NOT NULL,
        previous_stock INTEGER NOT NULL,
        new_stock INTEGER NOT NULL,
        reference_id TEXT, -- Invoice # or PO #
        reason TEXT,
        performed_by TEXT DEFAULT 'Admin',
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    );
    """)

    # 8. Sales Invoices
    cur.execute("""
    CREATE TABLE IF NOT EXISTS sales (
        sale_id TEXT PRIMARY KEY,
        invoice_no TEXT UNIQUE NOT NULL,
        customer_id TEXT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        subtotal REAL NOT NULL,
        discount_amount REAL DEFAULT 0.0,
        tax_amount REAL DEFAULT 0.0,
        grand_total REAL NOT NULL,
        paid_amount REAL NOT NULL,
        balance_amount REAL DEFAULT 0.0,
        payment_mode TEXT DEFAULT 'Cash', -- 'Cash', 'UPI', 'Bank Transfer', 'Card', 'Credit'
        status TEXT DEFAULT 'Completed', -- 'Completed', 'Cancelled', 'Returned'
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        created_by TEXT DEFAULT 'Admin',
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    );
    """)

    # 9. Sale Items
    cur.execute("""
    CREATE TABLE IF NOT EXISTS sale_items (
        item_id TEXT PRIMARY KEY,
        sale_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        sku TEXT,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        cost_price REAL NOT NULL,
        line_total REAL NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    );
    """)

    # 10. Purchase Orders / Inward Receipts
    cur.execute("""
    CREATE TABLE IF NOT EXISTS purchases (
        purchase_id TEXT PRIMARY KEY,
        po_number TEXT UNIQUE NOT NULL,
        supplier_id TEXT NOT NULL,
        supplier_name TEXT NOT NULL,
        invoice_number TEXT,
        total_amount REAL NOT NULL,
        paid_amount REAL NOT NULL,
        payment_status TEXT DEFAULT 'Paid', -- 'Paid', 'Partial', 'Unpaid'
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
    );
    """)

    # 11. Purchase Items
    cur.execute("""
    CREATE TABLE IF NOT EXISTS purchase_items (
        item_id TEXT PRIMARY KEY,
        purchase_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        purchase_price REAL NOT NULL,
        line_total REAL NOT NULL,
        FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    );
    """)

    # 12. Price History Log
    cur.execute("""
    CREATE TABLE IF NOT EXISTS price_history (
        history_id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        old_purchase_price REAL,
        new_purchase_price REAL,
        old_selling_price REAL,
        new_selling_price REAL,
        changed_by TEXT DEFAULT 'Admin',
        changed_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    );
    """)

    # 13. System Users
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Admin', -- 'Admin', 'Staff'
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
    """)

    # 14. Google Sheets Sync Log & Config
    cur.execute("""
    CREATE TABLE IF NOT EXISTS sync_settings (
        setting_key TEXT PRIMARY KEY,
        setting_value TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
    """)

    conn.commit()

    # Seed data if empty
    check = cur.execute("SELECT COUNT(*) FROM racks").fetchone()[0]
    if check == 0:
        seed_all_data(conn)

    # Normalize known legacy Tamil sample labels to Kannada on existing local DBs too.
    migrate_legacy_sample_translations(conn)
    conn.close()

def migrate_legacy_sample_translations(conn):
    """Idempotently keep the bundled sample translations in Kannada."""
    cur = conn.cursor()
    categories = {
        "C_CABLES": "ಕೈಗಾರಿಕಾ ಕೇಬಲ್‌ಗಳು",
        "C_FUSE": "ಫ್ಯೂಸ್‌ಗಳು ಮತ್ತು ಸುರಕ್ಷತೆ",
    }
    products = {
        "P102": "ಫಿಲಿಪ್ಸ್ 9W ಎಲ್ಇಡಿ ಬಲ್ಬ್",
        "P104": "ಬಜಾಜ್ 9W ಎಲ್ಇಡಿ ಬಲ್ಬ್",
        "P105": "ಹ್ಯಾವೆಲ್ಸ್ 12W ಎಲ್ಇಡಿ ಬಲ್ಬ್",
        "P114": "ಹ್ಯಾವೆಲ್ಸ್ 12W ಎಲ್ಇಡಿ ಪ್ಯಾನೆಲ್",
    }
    cur.executemany("UPDATE categories SET name_ta = ? WHERE category_id = ?", [(v, k) for k, v in categories.items()])
    cur.executemany("UPDATE products SET name_ta = ? WHERE product_id = ?", [(v, k) for k, v in products.items()])
    conn.commit()

def seed_all_data(conn):
    cur = conn.cursor()

    # 1. Seed Racks R1-R20 (Matches Screenshot 3)
    racks_data = [
        ("R1", "Bulbs", "ಬಲ್ಬ್‌ಗಳು", "lightbulb", "C_BULBS", 95, "Active", "LED Bulbs, Incandescent, Smart Bulbs"),
        ("R2", "Wires", "ತಂತಿಗಳು / ವೈರ್‌ಗಳು", "cable", "C_WIRES", 89, "Active", "Copper wire coils, FR wires, flexible cables"),
        ("R3", "Switches", "ಸ್ವಿಚ್‌ಗಳು", "toggle-right", "C_SWITCH", 90, "Active", "Modular switches, sockets, regulator plates"),
        ("R4", "Cables", "ಕೇಬಲ್‌ಗಳು", "git-commit", "C_CABLES", 88, "Active", "Industrial heavy-duty cables, submersible cables"),
        ("R5", "Sockets", "ಸಾಕೆಟ್‌ಗಳು", "plug", "C_SOCKET", 76, "Active", "3-pin, 2-pin, multi-pin universal sockets"),
        ("R6", "Fuses", "ಫ್ಯೂಸ್‌ಗಳು", "shield-alert", "C_FUSE", 70, "Active", "Rewirable fuses, glass fuses, cartridge fuses"),
        ("R7", "MCBs", "ಎಂಸಿಬಿ", "cpu", "C_MCB", 68, "Active", "Miniature circuit breakers, isolators, RCCB"),
        ("R8", "LEDs", "ಎಲ್‌ಇಡಿ", "sun", "C_LEDS", 92, "Active", "LED panels, downlights, strip lights"),
        ("R9", "Fans", "ವಿದ್ಯುತ್ ಫ್ಯಾನ್‌ಗಳು", "wind", "C_FANS", 22, "Active", "Ceiling fans, exhaust fans, table fans"),
        ("R10", "Lighting", "ದೀಪಗಳು", "lamp", "C_LIGHT", 98, "Active", "Decorative fixtures, flood lights, street lights"),
        ("R11", "Junction Box", "ಜಂಕ್ಷನ್ ಬಾಕ್ಸ್", "square", "C_JBOX", 65, "Active", "Concealed & surface PVC junction boxes"),
        ("R12", "Tools", "ಉಪಕರಣಗಳು", "wrench", "C_TOOLS", 11, "Active", "Pliers, testers, screwdrivers, crimpers"),
        ("R13", "Hardware", "ಹಾರ್ಡ್‌ವೇರ್", "hammer", "C_HARDWARE", 85, "Active", "Screws, clips, wall plugs, nails"),
        ("R14", "Raw Material", "ಕಚ್ಚಾ ಸಾಮಗ್ರಿಗಳು", "box", "C_RAW", 75, "Active", "Insulation PVC, copper terminals, tape"),
        ("R15", "Panels", "ಪ್ಯಾನೆಲ್‌ಗಳು", "layers", "C_PANELS", 76, "Active", "Distribution boards, panel boxes, enclosures"),
        ("R16", "Sensors", "ಸೆನ್ಸಾರ್‌ಗಳು", "radio", "C_SENSORS", 40, "Active", "Motion sensors, dusk-to-dawn sensors"),
        ("R17", "Motors", "ಮೋಟಾರ್‌ಗಳು", "disc", "C_MOTORS", 55, "Active", "Submersible motors, water pump motors"),
        ("R18", "Batteries", "ಬ್ಯಾಟರಿಗಳು", "battery-charging", "C_BATTERY", 60, "Active", "Inverter batteries, dry cells, button cells"),
        ("R19", "Connectors", "ಕನೆಕ್ಟರ್‌ಗಳು", "link", "C_CONNECT", 85, "Active", "Terminal blocks, wire caps, lug connectors"),
        ("R20", "Safety Gear", "ಸುರಕ್ಷತಾ ಸಾಧನಗಳು", "shield", "C_SAFETY", 60, "Active", "Insulated gloves, helmets, safety goggles")
    ]
    cur.executemany("INSERT INTO racks VALUES (?, ?, ?, ?, ?, ?, ?, ?)", racks_data)

    # 2. Seed Categories
    categories_data = [
        ("C_BULBS", "Bulbs & Lamps", "ಬಲ್ಬ್‌ಗಳು ಮತ್ತು ದೀಪಗಳು", "bulbs", "All types of LED, CFL and filament bulbs", "R1", 1),
        ("C_WIRES", "Wires & Conduits", "ತಂತಿಗಳು ಮತ್ತು ಪೈಪ್‌ಗಳು", "wires", "House wiring, PVC conduits and casing", "R2", 2),
        ("C_SWITCH", "Switches & Accessories", "ಸ್ವಿಚ್‌ಗಳು ಮತ್ತು ಪರಿಕರಗಳು", "switches", "Modular & non-modular switches", "R3", 3),
        ("C_CABLES", "Industrial Cables", "ಕೈಗಾರಿಕಾ ಕೇಬಲ್‌ಗಳು", "cables", "Submersible 3-core, flat and armored cables", "R4", 4),
        ("C_SOCKET", "Sockets & Plugs", "ಸಾಕೆಟ್‌ಗಳು ಮತ್ತು ಪ್ಲಗ್‌ಗಳು", "sockets", "Wall sockets, industrial plugs and tops", "R5", 5),
        ("C_FUSE", "Fuses & Protection", "ಫ್ಯೂಸ್‌ಗಳು ಮತ್ತು ಸುರಕ್ಷತೆ", "fuses", "Kit-kat fuses and safety protection", "R6", 6),
        ("C_MCB", "Circuit Breakers (MCB/DB)", "ಸರ್ಕ್ಯೂಟ್ ಬ್ರೇಕರ್‌ಗಳು", "mcb", "Single pole, double pole MCBs, ELCBs", "R7", 7),
        ("C_LEDS", "LED Panels & Downlights", "ಎಲ್‌ಇಡಿ ಪ್ಯಾನೆಲ್‌ಗಳು", "leds", "Ceiling downlights, slim panels, COBs", "R8", 8),
        ("C_FANS", "Fans & Ventilation", "ವಿದ್ಯುತ್ ಫ್ಯಾನ್‌ಗಳು", "fans", "High-speed ceiling fans and exhausts", "R9", 9),
        ("C_LIGHT", "Decorative & Commercial", "ಅಲಂಕಾರಿಕ ದೀಪಗಳು", "lighting", "Gate lights, floodlights and battens", "R10", 10),
        ("C_TOOLS", "Electrician Tools", "ಎಲೆಕ್ಟ್ರಿಷಿಯನ್ ಉಪಕರಣಗಳು", "tools", "Professional multimeters, pliers, testers", "R12", 11),
        ("C_PANELS", "Distribution Boards", "ವಿತರಣಾ ಬೋರ್ಡ್‌ಗಳು", "panels", "Metal and plastic enclosures and DB boxes", "R15", 12)
    ]
    cur.executemany("INSERT INTO categories VALUES (?, ?, ?, ?, ?, ?, ?, 1)", categories_data)

    # 3. Seed Brands (Matches Screenshot 2 brands & industry standards)
    brands_data = [
        ("B_PHILIPS", "Philips", "Leading lighting & LED solutions", "philips"),
        ("B_SYSKA", "Syska", "LED lighting and smart appliances", "syska"),
        ("B_CROMPTON", "Crompton", "Pumps, fans and home appliances", "crompton"),
        ("B_BAJAJ", "Bajaj", "Electrical goods and appliances", "bajaj"),
        ("B_HAVELLS", "Havells", "Fast moving electrical goods (FMEG)", "havells"),
        ("B_FINOLEX", "Finolex", "Premium wires and agricultural cables", "finolex"),
        ("B_ANCHOR", "Anchor by Panasonic", "Switches, wires and accessories", "anchor"),
        ("B_LEGRAND", "Legrand", "Luxury switches and circuit protection", "legrand"),
        ("B_POLYCAB", "Polycab", "Cables, wires and solar solutions", "polycab"),
        ("B_VGUARD", "V-Guard", "Stabilizers, water heaters and inverters", "vguard")
    ]
    cur.executemany("INSERT INTO brands VALUES (?, ?, ?, ?, 1)", brands_data)

    # 4. Seed Products (Rich electrical dataset, matching screenshots)
    products_data = [
        # Bulbs (R1)
        ("P101", "Syska 9W LED Bulb Cool Day Light", "ಸಿಸ್ಕಾ 9W ಎಲ್‌ಇಡಿ ಬಲ್ಬ್", "SYS-9W-LED", "890123456001", "C_BULBS", "R1", "B_SYSKA", "SSK-SRL-9W", "Piece", 65.0, 110.0, 95.0, 250, 25, "https://m.media-amazon.com/images/I/71MBUePMvQL._SX679_.jpg", "9 Watt B22 LED Bulb, 6500K Cool Daylight, 900 Lumens"),
        ("P102", "Philips 9W LED Bulb Stellar Bright", "ಫಿಲಿಪ್ಸ್ 9W ಎಲ್ಇಡಿ ಬಲ್ಬ್", "PHI-9W-LED", "890123456002", "C_BULBS", "R1", "B_PHILIPS", "PHIL-B22-9W", "Piece", 70.0, 120.0, 105.0, 180, 20, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTehxphkgi29LikWxu-s-IpK1_scyMjTgMiGYfs5h_9-Q&s=10", "Philips Stellar Bright 9W LED Bulb, Energy Saving, B22 cap"),
        ("P103", "Crompton EcoFit LED Tube 18W", "ಕ್ರಾಂಪ್ಟನ್ 18W ಟ್ಯೂಬ್ ಲೈಟ್", "CRO-18W-TUB", "890123456003", "C_BULBS", "R1", "B_CROMPTON", "CR-TUB-18W", "Piece", 120.0, 210.0, 180.0, 120, 15, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8ndzLNM6jKsHFeF98nkdzWchqaKmEkZBr3fhxNmlg0A&s=10", "4 feet 18 Watt LED Batten Tube Light, high glare-free illumination"),
        ("P104", "Bajaj 9W LED Bulb White Crystal", "ಬಜಾಜ್ 9W ಎಲ್ಇಡಿ ಬಲ್ಬ್", "BAJ-9W-LED", "890123456004", "C_BULBS", "R1", "B_BAJAJ", "BJ-LED-9W", "Piece", 60.0, 105.0, 90.0, 15, 20, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdftiLO5d8nvAqp4K-nQCSdni1meXfXlxDPms1t_Mg6g&s=10", "Bajaj crystal white energy efficient B22 bulb (Low Stock)"),
        ("P105", "Havells 12W LED Bulb Adore", "ಹ್ಯಾವೆಲ್ಸ್ 12W ಎಲ್ಇಡಿ ಬಲ್ಬ್", "HAV-12W-LED", "890123456005", "C_BULBS", "R1", "B_HAVELLS", "HAV-ADR-12W", "Piece", 95.0, 160.0, 140.0, 85, 15, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJIc0bmd3zfnOlBfI0uGqupkn4mLv3VsQtUZaq5EpWeA&s=10", "Havells 12W bright LED bulb, surge protection up to 4kV"),
        
        # Wires (R2)
        ("P106", "Finolex 2.5sqmm FR House Wire (90m)", "ಫಿನೋಲೆಕ್ಸ್ 2.5 ಚ.ಮೀ.ಮೀ ವೈರ್", "FIN-2.5-WIR", "890123456006", "C_WIRES", "R2", "B_FINOLEX", "FIN-FR-25", "Coil", 1150.0, 1550.0, 1420.0, 480, 50, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE9vpHRlsNU5XYiM964gQ8TWrzDxXqYGj63kPp2x28zg&s=10", "Finolex 100% pure electrolytic copper flame retardant PVC wire 90m coil"),
        ("P107", "Finolex 1.5sqmm FR House Wire (90m)", "ಫಿನೋಲೆಕ್ಸ್ 1.5 ಚ.ಮೀ.ಮೀ ವೈರ್", "FIN-1.5-WIR", "890123456007", "C_WIRES", "R2", "B_FINOLEX", "FIN-FR-15", "Coil", 780.0, 1050.0, 960.0, 320, 40, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9e0EoFRMyr2w7QsMryhhkK3GSt0BpW2YTlIJdtaHx_w&s=10", "1.5 sq mm copper wire for lighting circuits, 90 meter red coil"),
        ("P108", "Polycab 4.0sqmm Heavy Duty Wire (90m)", "ಪಾಲಿಕ್ಯಾಬ್ 4.0 ಚ.ಮೀ.ಮೀ ವೈರ್", "POL-4.0-WIR", "890123456008", "C_WIRES", "R2", "B_POLYCAB", "POL-FR-40", "Coil", 1750.0, 2350.0, 2150.0, 110, 20, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROg9hQrxLIHp2a53Xxk5xK-XEB8a7JB35Mp9SHJA6X6g&s=10", "4 sq mm wire suitable for AC and power circuits"),
        ("P109", "Anchor 1.0sqmm Advance Wire (90m)", "ಆಂಕರ್ 1.0 ಚ.ಮೀ.ಮೀ ವೈರ್", "ANC-1.0-WIR", "890123456009", "C_WIRES", "R2", "B_ANCHOR", "ANC-ADV-10", "Coil", 520.0, 720.0, 660.0, 210, 25, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROg9hQrxLIHp2a53Xxk5xK-XEB8a7JB35Mp9SHJA6X6g&s=10", "Anchor by Panasonic 1.0 sq mm copper wire coil"),

        # Switches (R3)
        ("P110", "Havells Fabio 6A 1-Way Modular Switch", "ಹ್ಯಾವೆಲ್ಸ್ 6A ಸ್ವಿಚ್", "HAV-6A-SW1", "890123456010", "C_SWITCH", "R3", "B_HAVELLS", "FAB-6A-1W", "Piece", 24.0, 42.0, 35.0, 420, 50, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhMV7XUDyQXss1PM6B0Cok5maH7uv0jXJPf5wNW3MEzA&s=10", "Havells Fabio gloss white 6 Amp modular single switch"),
        ("P111", "Havells Fabio 16A Power Switch", "ಹ್ಯಾವೆಲ್ಸ್ 16A ಪವರ್ ಸ್ವಿಚ್", "HAV-16A-SW1", "890123456011", "C_SWITCH", "R3", "B_HAVELLS", "FAB-16A-1W", "Piece", 48.0, 85.0, 72.0, 230, 30, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhMV7XUDyQXss1PM6B0Cok5maH7uv0jXJPf5wNW3MEzA&s=10", "Havells Fabio 16 Amp heavy appliance power switch with indicator"),
        ("P112", "Anchor Roma 6A 1-Way Switch", "ಆಂಕರ್ ರೋಮಾ 6A ಸ್ವಿಚ್", "ANC-ROM-6A", "890123456012", "C_SWITCH", "R3", "B_ANCHOR", "ROMA-6A", "Piece", 22.0, 38.0, 32.0, 350, 40, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-DHiPYsr-km5Eb_m-oEHmQPtmCC4wWZZ9vIE2h_8IUA&s=10", "Standard Anchor Roma white 6 Amp modular switch"),
        ("P113", "Legrand Arteor 10A Switch Silver", "ಲೆಗ್ರಾಂಡ್ 10A ಪ್ರೀಮಿಯಂ ಸ್ವಿಚ್", "LEG-ART-10A", "890123456013", "C_SWITCH", "R3", "B_LEGRAND", "ART-10A-SLV", "Piece", 95.0, 165.0, 140.0, 80, 15, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAhDD8db2Kime-p1cwAAy5Kx3WCQPyBOT5HiJzCGkXPg&s=10", "Premium brushed silver finish 10A switch"),

        # LEDs & Panels (R8)
        ("P114", "Havells 12W LED Slim Panel Round", "ಹ್ಯಾವೆಲ್ಸ್ 12W ಎಲ್ಇಡಿ ಪ್ಯಾನೆಲ್", "HAV-12W-PAN", "890123456014", "C_LEDS", "R8", "B_HAVELLS", "12WH8N-PANEL", "Piece", 190.0, 350.0, 290.0, 115, 20, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXzSmGQYwAITDr85X_VQDC0ABBZxdPSryuk-c8up2yAQ&s=10", "Havells 12W Round White Slim Recessed LED Panel light"),
        ("P115", "Philips 15W LED Downlight Square", "ಫಿಲಿಪ್ಸ್ 15W ಡೌನ್‌ಲೈಟ್", "PHI-15W-DWN", "890123456015", "C_LEDS", "R8", "B_PHILIPS", "DN-SQ-15W", "Piece", 240.0, 420.0, 360.0, 90, 15, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXMiRH-liDGfo7zenY9EO2MjHXfvALKOJQQtbZmsOmug&s", "Philips square ceiling downlight with anti-glare diffuser"),
        ("P116", "Syska 18W Surface LED Panel Light", "ಸಿಸ್ಕಾ 18W ಸರ್ಫೇಸ್ ಪ್ಯಾನೆಲ್", "SYS-18W-SRF", "890123456016", "C_LEDS", "R8", "B_SYSKA", "SSK-SRF-18W", "Piece", 280.0, 480.0, 410.0, 65, 10, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVLm7j1iZo7kEOUcbwNC3sF_PfCOKN0YNowqsR9Vu6uA&s=10", "Surface mount circular panel, no false ceiling required"),

        # MCBs (R7)
        ("P117", "Schneider 16A Single Pole C-Curve MCB", "ಶ್ನೈಡರ್ 16A ಸಿಂಗಲ್ ಪೋಲ್ MCB", "SCH-16A-MCB", "890123456017", "C_MCB", "R7", "B_LEGRAND", "A9K-16A", "Piece", 110.0, 190.0, 160.0, 140, 20, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkyQHU0eRHFLc-qIhRA-bKyZLFlSwIDPOa-9ugNN7knA&s=10", "C-Curve 16A Single Pole miniature circuit breaker"),
        ("P118", "Havells 32A Double Pole Isolator", "ಹ್ಯಾವೆಲ್ಸ್ 32A ಐಸೋಲೇಟರ್", "HAV-32A-ISO", "890123456018", "C_MCB", "R7", "B_HAVELLS", "HAV-DP-32A", "Piece", 210.0, 360.0, 310.0, 75, 12, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcO6gMvP6gL9-a9yDR-V8g1LG6RbzCmO8LfnpIxeeoFg&s=10", "Double pole main supply disconnect isolator switch"),
        ("P119", "Legrand 40A 30mA 2-Pole RCCB", "ಲೆಗ್ರಾಂಡ್ 40A ಅರ್ಥ್ ಲೀಕೇಜ್ RCCB", "LEG-40A-RCC", "890123456019", "C_MCB", "R7", "B_LEGRAND", "RX3-40A-30M", "Piece", 950.0, 1550.0, 1350.0, 4, 10, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlOcgN2ULIxOBLhr3xooRZIqmjFTrOZis-g-6KGbm1eQ&s=10", "Human shock protection residual current circuit breaker (Low Stock)"),

        # Fans (R9)
        ("P120", "Crompton Hill Briz 1200mm Ceiling Fan", "ಕ್ರಾಂಪ್ಟನ್ 1200ಮಿಮೀ ಸೀಲಿಂಗ್ ಫ್ಯಾನ್", "CRO-1200-FAN", "890123456020", "C_FANS", "R9", "B_CROMPTON", "HB-1200-BRW", "Piece", 1250.0, 1850.0, 1650.0, 60, 10, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0huX31e_CD2Xpi2qCmG9YrlaModW0wVq4POeO-94RTw&s", "Crompton 1200mm 3 blade high air delivery ceiling fan, brown"),
        ("P121", "Bajaj Maxima 1200mm High Speed Fan", "ಬಜಾಜ್ 1200ಮಿಮೀ ಹೈ ಸ್ಪೀಡ್ ಫ್ಯಾನ್", "BAJ-1200-FAN", "890123456021", "C_FANS", "R9", "B_BAJAJ", "MAX-1200-WHT", "Piece", 1180.0, 1720.0, 1520.0, 45, 10, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRMh-9PVsVz-fh5ywX1L8t5FDmd7VOWwvHrqbD7kDGyg&s=10", "High speed 380 RPM ceiling fan with double ball bearing"),
        ("P122", "Havells Ventil Air DB 200mm Exhaust Fan", "ಹ್ಯಾವೆಲ್ಸ್ 200ಮಿಮೀ ಎಕ್ಸಾಸ್ಟ್ ಫ್ಯಾನ್", "HAV-200-EXH", "890123456022", "C_FANS", "R9", "B_HAVELLS", "VENT-200-DB", "Piece", 850.0, 1350.0, 1180.0, 0, 8, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjvbX1Bspq2ua3m_5J5rJbd-HxhGJ7LMeXXTRGl9OU8A&s=10", "Kitchen and bathroom exhaust fan (Out of Stock)"),

        # Tools & Accessories (R12 / R5 / R6)
        ("P123", "Taparia 8-inch Insulated Combination Plier", "ಟಪಾರಿಯಾ 8 ಇಂಚಿನ ಕಟಿಂಗ್ ಪ್ಲಯರ್", "TAP-8IN-PLI", "890123456023", "C_TOOLS", "R12", "B_ANCHOR", "1621-8N", "Piece", 160.0, 260.0, 220.0, 50, 10, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRURncn2VHrTLTCg5LeDu5Pj6AQB6SbHWzH4HPr7Ya1rg&s=10", "High grade chrome vanadium insulated grip electrician combination plier"),
        ("P124", "Taparia Line Tester 500V Neon", "ಟಪಾರಿಯಾ ನಿಯಾನ್ ಲೈನ್ ಟೆಸ್ಟರ್", "TAP-500V-TES", "890123456024", "C_TOOLS", "R12", "B_ANCHOR", "814-TESTER", "Piece", 25.0, 55.0, 42.0, 120, 20, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfQ993yjocbcSSqlKwL_PMWRF5kiO6kfvuP89u96ToFQ&s", "High sensitivity neon bulb electrical line tester"),
        ("P125", "Steelgrip PVC Electrical Insulation Tape", "ಸ್ಟೀಲ್‌ಗ್ರಿಪ್ ಇನ್ಸುಲೇಷನ್ ಟೇಪ್", "STG-PVC-TAP", "890123456025", "C_WIRES", "R2", "B_ANCHOR", "STG-BLCK", "Roll", 10.0, 20.0, 15.0, 450, 50, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMnmXvxGa8dGoux6TSm4JzYFo1oJe7JUAmozlPfvNfSA&s=10", "Self extinguishing electrical grade black PVC tape"),
        ("P126", "Anchor 3-Pin Multi Plug Adaptor with Surge", "ಆಂಕರ್ 3-ಪಿನ್ ಮಲ್ಟಿ ಪ್ಲಗ್", "ANC-3PIN-ADP", "890123456026", "C_SOCKET", "R5", "B_ANCHOR", "ANC-MULTI-3P", "Piece", 45.0, 90.0, 75.0, 85, 15, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUz91qtiz6Exl2ATV3pvP7XidmqksFB2rGWq1QMSWiOw&s", "Universal 3 pin multi plug adaptor with LED indicator")
    ]
    cur.executemany("INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now', 'localtime'), datetime('now', 'localtime'))", products_data)

    # 5. Seed Suppliers
    suppliers_data = [
        ("SUP1", "Karnataka Electrical Distributors", "Suresh Kumar", "9845012345", "sales@kedist.com", "29AAAAA0000A1Z5", "BTM Layout 2nd Stage", "Bengaluru", 0.0),
        ("SUP2", "Mysuru Power & Cable Agencies", "Gopal Gowda", "9880123456", "mysurupower@gmail.com", "29BBBBB1111B2Z6", "Devaraja Mohalla", "Mysuru", 14500.0),
        ("SUP3", "Southern Lighting & Switch Corp", "Venkatesh Murthy", "9448123457", "slscorp@yahoo.com", "29CCCCC2222C3Z7", "B.M. Road", "Hassan", 5200.0),
        ("SUP4", "Havells Official Regional Depot", "Ramesh Babu", "9900123458", "depot.south@havells.com", "29DDDDD3333D4Z8", "Industrial Area, Peenya", "Bengaluru", 0.0)
    ]
    cur.executemany("INSERT INTO suppliers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))", suppliers_data)

    # 6. Seed Customers
    customers_data = [
        ("CUST1", "Rajesh Gowda", "9876543210", "rajesh.gowda@gmail.com", "Rajesh Electrical Contracts", "Main Road, Kamagere", "Kollegal", "Wholesale", 3500.0),
        ("CUST2", "Kumar Swamy", "9876501234", "kumar.swamy@gmail.com", "Swamy Hardware & Electricals", "K.R. Nagar Road", "Mysuru", "Wholesale", 12000.0),
        ("CUST3", "Lakshmi Enterprises", "9988776655", "lakshmi.ent@gmail.com", "Lakshmi Building Solutions", "Channarayapatna Hub", "Hassan", "Wholesale", 0.0),
        ("CUST4", "Siva Shankaran", "9740123456", "siva.shankaran@gmail.com", "Siva Wiring Works", "Near Bus Stand", "Hanur", "Retail", 0.0),
        ("CUST5", "Ramesh Babu", "9620123457", "ramesh.b@gmail.com", "Self House Construction", "B.M. Road", "Channarayapatna", "Retail", 0.0),
        ("CUST6", "Praveen Kumar", "9535123458", "praveen.k@gmail.com", "Praveen Agro Farm Pumps", "Rural Ward 4", "Sakleshpur", "Retail", 450.0)
    ]
    cur.executemany("INSERT INTO customers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))", customers_data)

    # 7. Seed Sample Sales & Sale Items (Matches Screenshot 1 table & trends)
    sales_data = [
        ("SAL-2026-00145", "SAL-2026-00145", "CUST1", "Rajesh Gowda", "9876543210", 7800.0, 340.0, 0.0, 7460.0, 7460.0, 0.0, "UPI", "Completed", "Order completed via PhonePe UPI", "2026-11-05 16:32:00", "Admin"),
        ("SAL-2026-00144", "SAL-2026-00144", "CUST2", "Kumar Swamy", "9876501234", 13500.0, 640.0, 0.0, 12860.0, 12860.0, 0.0, "Cash", "Completed", "Paid in cash on counter", "2026-11-05 15:10:00", "Admin"),
        ("SAL-2026-00143", "SAL-2026-00143", "CUST3", "Lakshmi Enterprises", "9988776655", 29800.0, 1400.0, 0.0, 28400.0, 28400.0, 0.0, "Bank Transfer", "Completed", "NEFT received in SBI account", "2026-11-05 11:42:00", "Admin"),
        ("SAL-2026-00142", "SAL-2026-00142", "CUST4", "Siva Shankaran", "9740123456", 10200.0, 240.0, 0.0, 9960.0, 9960.0, 0.0, "UPI", "Completed", "Google Pay transaction", "2026-11-04 17:18:00", "Admin"),
        ("SAL-2026-00141", "SAL-2026-00141", "CUST5", "Ramesh Babu", "9620123457", 4700.0, 140.0, 0.0, 4560.0, 4560.0, 0.0, "Cash", "Completed", "Direct counter sale", "2026-11-04 14:27:00", "Admin"),
        ("SAL-2026-00140", "SAL-2026-00140", "CUST1", "Rajesh Gowda", "9876543210", 19800.0, 200.0, 0.0, 19600.0, 19600.0, 0.0, "UPI", "Completed", "Wire and switch supply", "2026-11-03 16:50:00", "Admin"),
        ("SAL-2026-00139", "SAL-2026-00139", "CUST2", "Kumar Swamy", "9876501234", 23200.0, 450.0, 0.0, 22750.0, 22750.0, 0.0, "Cash", "Completed", "Bulbs and panels batch", "2026-11-02 12:30:00", "Admin"),
        ("SAL-2026-00138", "SAL-2026-00138", "CUST3", "Lakshmi Enterprises", "9988776655", 18500.0, 300.0, 0.0, 18200.0, 18200.0, 0.0, "Bank Transfer", "Completed", "Site delivery", "2026-11-01 10:15:00", "Admin")
    ]
    cur.executemany("INSERT INTO sales VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", sales_data)

    # Seed Sale items
    sale_items_data = [
        ("SI101", "SAL-2026-00145", "P101", "Syska 9W LED Bulb Cool Day Light", "SYS-9W-LED", 20, 110.0, 65.0, 2200.0),
        ("SI102", "SAL-2026-00145", "P110", "Havells Fabio 6A 1-Way Modular Switch", "HAV-6A-SW1", 50, 42.0, 24.0, 2100.0),
        ("SI103", "SAL-2026-00145", "P106", "Finolex 2.5sqmm FR House Wire (90m)", "FIN-2.5-WIR", 2, 1550.0, 1150.0, 3100.0),
        ("SI104", "SAL-2026-00144", "P106", "Finolex 2.5sqmm FR House Wire (90m)", "FIN-2.5-WIR", 6, 1550.0, 1150.0, 9300.0),
        ("SI105", "SAL-2026-00144", "P114", "Havells 12W LED Slim Panel Round", "HAV-12W-PAN", 10, 350.0, 190.0, 3500.0),
        ("SI106", "SAL-2026-00143", "P120", "Crompton Hill Briz 1200mm Ceiling Fan", "CRO-1200-FAN", 10, 1850.0, 1250.0, 18500.0),
        ("SI107", "SAL-2026-00143", "P108", "Polycab 4.0sqmm Heavy Duty Wire (90m)", "POL-4.0-WIR", 4, 2350.0, 1750.0, 9400.0)
    ]
    cur.executemany("INSERT INTO sale_items VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", sale_items_data)

    # 8. Seed Purchases
    purchases_data = [
        ("PO-2026-001", "PO-2026-001", "SUP1", "Karnataka Electrical Distributors", "INV-KED-9921", 85000.0, 85000.0, "Paid", "Monthly bulk wire procurement", "2026-10-28 11:00:00"),
        ("PO-2026-002", "PO-2026-002", "SUP4", "Havells Official Regional Depot", "HAV-DEP-443", 64000.0, 64000.0, "Paid", "LED Panels and Modular switches replenishment", "2026-11-01 14:20:00")
    ]
    cur.executemany("INSERT INTO purchases VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", purchases_data)

    # 9. Seed Stock Movements
    movements_data = [
        ("MOV1", "P101", "Stock In", 100, 150, 250, "PO-2026-002", "Supplier delivery received", "Admin", "2026-11-01 15:00:00"),
        ("MOV2", "P106", "Stock In", 50, 430, 480, "PO-2026-001", "Monthly wire inward lot", "Admin", "2026-10-29 12:00:00"),
        ("MOV3", "P101", "Sale", -20, 270, 250, "SAL-2026-00145", "Sold to Rajesh Gowda", "Admin", "2026-11-05 16:32:00"),
        ("MOV4", "P110", "Sale", -50, 470, 420, "SAL-2026-00145", "Sold to Rajesh Gowda", "Admin", "2026-11-05 16:32:00"),
        ("MOV5", "P122", "Stock Out", -8, 8, 0, "ADJ-001", "Damaged exhaust motor during transit", "Admin", "2026-11-03 10:00:00")
    ]
    cur.executemany("INSERT INTO stock_movements VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", movements_data)

    # 10. Seed Users
    users_data = [
        ("U1", "admin", "pbkdf2:sha256:admin123", "Deepu R. (Proprietor)", "Admin", 1, datetime.now().isoformat()),
        ("U2", "staff", "pbkdf2:sha256:staff123", "Mani K. (Sales Staff)", "Staff", 1, datetime.now().isoformat())
    ]
    cur.executemany("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)", users_data)

    # 11. Seed Google Sheets Sync Config
    sync_config = [
        ("SPREADSHEET_ID", "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"),
        ("SHEET_URL", "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"),
        ("LAST_SYNC_AT", "Never (Demo Mode Active)"),
        ("AUTO_SYNC_ENABLED", "0"),
        ("SHOP_NAME", "Deepu Enterprises"),
        ("SHOP_TAGLINE", "Electrical & Electronics Wholesale & Retail"),
        ("SHOP_PHONE", "+91 98450 12345 / 94480 54321"),
        ("SHOP_GSTIN", "29ABCDE1234F1Z5"),
        ("SHOP_ADDRESS", "Main Hub, B.M. Road, Channarayapatna / Kamagere, Karnataka - 573116")
    ]
    cur.executemany("INSERT INTO sync_settings VALUES (?, ?, datetime('now', 'localtime'))", sync_config)

    conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)
