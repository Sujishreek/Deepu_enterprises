/**
 * Local Data Store & Mock Database Engine
 * Provides immediate offline functionality with realistic Electrical & Electronics datasets.
 * Prepares and synchronizes data with Google Sheets via Apps Script.
 */

const LOCAL_DB_KEY = "deepu_electrical_v3_kn";

const SEED_DATA = {
    racks: [
        { rack_id: "R1", name: "Bulbs", name_kn: "ಬಲ್ಬ್‌ಗಳು", icon: "💡", category_id: "C_BULBS", capacity_pct: 95, status: "Active" },
        { rack_id: "R2", name: "Wires", name_kn: "ವೈರ್‌ಗಳು / ತಂತಿಗಳು", icon: "🔌", category_id: "C_WIRES", capacity_pct: 89, status: "Active" },
        { rack_id: "R3", name: "Switches", name_kn: "ಸ್ವಿಚ್‌ಗಳು", icon: "🔘", category_id: "C_SWITCH", capacity_pct: 90, status: "Active" },
        { rack_id: "R4", name: "Cables", name_kn: "ಕೇಬಲ್‌ಗಳು", icon: "🔗", category_id: "C_CABLES", capacity_pct: 88, status: "Active" },
        { rack_id: "R5", name: "Sockets", name_kn: "ಸಾಕೆಟ್‌ಗಳು", icon: "🔌", category_id: "C_SOCKET", capacity_pct: 76, status: "Active" },
        { rack_id: "R6", name: "Fuses", name_kn: "ಫ್ಯೂಸ್‌ಗಳು", icon: "🛡️", category_id: "C_FUSE", capacity_pct: 70, status: "Active" },
        { rack_id: "R7", name: "MCBs", name_kn: "ಎಂಸಿಬಿಗಳು", icon: "⚡", category_id: "C_MCB", capacity_pct: 68, status: "Active" },
        { rack_id: "R8", name: "LEDs", name_kn: "ಎಲ್ಇಡಿಗಳು", icon: "☀️", category_id: "C_LEDS", capacity_pct: 92, status: "Active" },
        { rack_id: "R9", name: "Fans", name_kn: "ಫ್ಯಾನ್‌ಗಳು / ಬೀಸಣಿಗೆಗಳು", icon: "💨", category_id: "C_FANS", capacity_pct: 22, status: "Active" },
        { rack_id: "R10", name: "Lighting", name_kn: "ದೀಪಗಳು / ಲೈಟಿಂಗ್", icon: "🏮", category_id: "C_LIGHT", capacity_pct: 98, status: "Active" },
        { rack_id: "R11", name: "Junction Box", name_kn: "ಜಂಕ್ಷನ್ ಬಾಕ್ಸ್", icon: "📦", category_id: "C_JBOX", capacity_pct: 65, status: "Active" },
        { rack_id: "R12", name: "Tools", name_kn: "ಉಪಕರಣಗಳು", icon: "🔧", category_id: "C_TOOLS", capacity_pct: 11, status: "Active" },
        { rack_id: "R13", name: "Hardware", name_kn: "ಹಾರ್ಡ್‌ವೇರ್", icon: "🔨", category_id: "C_HARDWARE", capacity_pct: 85, status: "Active" },
        { rack_id: "R14", name: "Raw Material", name_kn: "ಕಚ್ಚಾ ಸಾಮಗ್ರಿಗಳು", icon: "🧱", category_id: "C_RAW", capacity_pct: 75, status: "Active" },
        { rack_id: "R15", name: "Panels", name_kn: "ಪ್ಯಾನೆಲ್‌ಗಳು", icon: "🎛️", category_id: "C_PANELS", capacity_pct: 76, status: "Active" },
        { rack_id: "R16", name: "Sensors", name_kn: "ಸೆನ್ಸಾರ್‌ಗಳು", icon: "📡", category_id: "C_SENSORS", capacity_pct: 40, status: "Active" },
        { rack_id: "R17", name: "Motors", name_kn: "ಮೋಟಾರ್‌ಗಳು / ಪಂಪ್", icon: "⚙️", category_id: "C_MOTORS", capacity_pct: 55, status: "Active" },
        { rack_id: "R18", name: "Batteries", name_kn: "ಬ್ಯಾಟರಿಗಳು", icon: "🔋", category_id: "C_BATTERY", capacity_pct: 60, status: "Active" },
        { rack_id: "R19", name: "Connectors", name_kn: "ಕನೆಕ್ಟರ್‌ಗಳು", icon: "🖇️", category_id: "C_CONNECT", capacity_pct: 85, status: "Active" },
        { rack_id: "R20", name: "Safety Gear", name_kn: "ಸುರಕ್ಷತಾ ಸಾಧನಗಳು", icon: "🦺", category_id: "C_SAFETY", capacity_pct: 60, status: "Active" }
    ],

    categories: [
        { category_id: "C_BULBS", name: "Bulbs & Lamps", name_kn: "ಬಲ್ಬ್‌ಗಳು ಮತ್ತು ದೀಪಗಳು" },
        { category_id: "C_WIRES", name: "Wires & Conduits", name_kn: "ವೈರ್‌ಗಳು ಮತ್ತು ಪೈಪ್‌ಗಳು" },
        { category_id: "C_SWITCH", name: "Switches & Accessories", name_kn: "ಸ್ವಿಚ್‌ಗಳು ಮತ್ತು ಪರಿಕರಗಳು" },
        { category_id: "C_CABLES", name: "Industrial Cables", name_kn: "ಕೈಗಾರಿಕಾ ಕೇಬಲ್‌ಗಳು" },
        { category_id: "C_SOCKET", name: "Sockets & Plugs", name_kn: "ಸಾಕೆಟ್‌ಗಳು ಮತ್ತು ಪ್ಲಗ್‌ಗಳು" },
        { category_id: "C_FUSE", name: "Fuses & Protection", name_kn: "ಫ್ಯೂಸ್‌ಗಳು ಮತ್ತು ರಕ್ಷಣೆ" },
        { category_id: "C_MCB", name: "Circuit Breakers (MCB/DB)", name_kn: "ಸರ್ಕ್ಯೂಟ್ ಬ್ರೇಕರ್‌ಗಳು (MCB)" },
        { category_id: "C_LEDS", name: "LED Panels & Downlights", name_kn: "ಎಲ್ಇಡಿ ಪ್ಯಾನೆಲ್‌ಗಳು" },
        { category_id: "C_FANS", name: "Fans & Ventilation", name_kn: "ಫ್ಯಾನ್‌ಗಳು ಮತ್ತು ವೆಂಟಿಲೇಶನ್" },
        { category_id: "C_LIGHT", name: "Decorative & Commercial", name_kn: "ಅಲಂಕಾರಿಕ ಮತ್ತು ವಾಣಿಜ್ಯ ಲೈಟಿಂಗ್" },
        { category_id: "C_TOOLS", name: "Electrician Tools", name_kn: "ಎಲೆಕ್ಟ್ರಿಷಿಯನ್ ಉಪಕರಣಗಳು" }
    ],

    brands: [
        { brand_id: "B_PHILIPS", name: "Philips" },
        { brand_id: "B_SYSKA", name: "Syska" },
        { brand_id: "B_CROMPTON", name: "Crompton" },
        { brand_id: "B_BAJAJ", name: "Bajaj" },
        { brand_id: "B_HAVELLS", name: "Havells" },
        { brand_id: "B_FINOLEX", name: "Finolex" },
        { brand_id: "B_ANCHOR", name: "Anchor by Panasonic" },
        { brand_id: "B_LEGRAND", name: "Legrand" },
        { brand_id: "B_POLYCAB", name: "Polycab" }
    ],

    products: [
        { product_id: "P101", name: "Syska 9W LED Bulb Cool Day Light", name_kn: "ಸಿಸ್ಕಾ 9W ಎಲ್ಇಡಿ ಬಲ್ಬ್", sku: "SYS-9W-LED", category_id: "C_BULBS", rack_id: "R1", rack_cell: "1", brand_id: "B_SYSKA", brand_name: "Syska", unit: "Piece", purchase_price: 65, selling_price: 110, wholesale_price: 95, stock_quantity: 250, min_stock_level: 25, image_url: "https://m.media-amazon.com/images/I/71MBUePMvQL._SX679_.jpg", is_active: 1 },
        { product_id: "P102", name: "Philips 9W LED Bulb Stellar Bright", name_kn: "ಫಿಲಿಪ್ಸ್ 9W ಎಲ್ಇಡಿ ಬಲ್ಬ್", sku: "PHI-9W-LED", category_id: "C_BULBS", rack_id: "R1", rack_cell: "2", brand_id: "B_PHILIPS", brand_name: "Philips", unit: "Piece", purchase_price: 70, selling_price: 120, wholesale_price: 105, stock_quantity: 180, min_stock_level: 20, image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTehxphkgi29LikWxu-s-IpK1_scyMjTgMiGYfs5h_9-Q&s=10", is_active: 1 },
        { product_id: "P103", name: "Crompton EcoFit LED Tube 18W", name_kn: "ಕ್ರಾಂಪ್ಟನ್ 18W ಎಲ್ಇಡಿ ಟ್ಯೂಬ್ ಲೈಟ್", sku: "CRO-18W-TUB", category_id: "C_BULBS", rack_id: "R1", rack_cell: "3", brand_id: "B_CROMPTON", brand_name: "Crompton", unit: "Piece", purchase_price: 120, selling_price: 210, wholesale_price: 180, stock_quantity: 120, min_stock_level: 15, image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8ndzLNM6jKsHFeF98nkdzWchqaKmEkZBr3fhxNmlg0A&s=10", is_active: 1 },
        { product_id: "P104", name: "Bajaj 9W LED Bulb White Crystal", name_kn: "ಬಜಾಜ್ 9W ಎಲ್ಇಡಿ ಬಲ್ಬ್", sku: "BAJ-9W-LED", category_id: "C_BULBS", rack_id: "R1", rack_cell: "4", brand_id: "B_BAJAJ", brand_name: "Bajaj", unit: "Piece", purchase_price: 60, selling_price: 105, wholesale_price: 90, stock_quantity: 15, min_stock_level: 20, image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdftiLO5d8nvAqp4K-nQCSdni1meXfXlxDPms1t_Mg6g&s=10", is_active: 1 },
        { product_id: "P105", name: "Havells 12W LED Bulb Adore", name_kn: "ಹ್ಯಾವೆಲ್ಸ್ 12W ಎಲ್ಇಡಿ ಬಲ್ಬ್", sku: "HAV-12W-LED", category_id: "C_BULBS", rack_id: "R1", rack_cell: "5", brand_id: "B_HAVELLS", brand_name: "Havells", unit: "Piece", purchase_price: 95, selling_price: 160, wholesale_price: 140, stock_quantity: 85, min_stock_level: 15, image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJIc0bmd3zfnOlBfI0uGqupkn4mLv3VsQtUZaq5EpWeA&s=10", is_active: 1 },
        { product_id: "P106", name: "Finolex 2.5sqmm FR House Wire (90m)", name_kn: "ಫಿನೋಲೆಕ್ಸ್ 2.5 ಚ.ಮಿ.ಮೀ ವೈರ್ (90ಮೀ)", sku: "FIN-2.5-WIR", category_id: "C_WIRES", rack_id: "R2", brand_id: "B_FINOLEX", brand_name: "Finolex", unit: "Coil", purchase_price: 1150, selling_price: 1550, wholesale_price: 1420, stock_quantity: 480, min_stock_level: 50, image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE9vpHRlsNU5XYiM964gQ8TWrzDxXqYGj63kPp2x28zg&s=10", is_active: 1 },
        { product_id: "P107", name: "Finolex 1.5sqmm FR House Wire (90m)", name_kn: "ಫಿನೋಲೆಕ್ಸ್ 1.5 ಚ.ಮಿ.ಮೀ ವೈರ್ (90ಮೀ)", sku: "FIN-1.5-WIR", category_id: "C_WIRES", rack_id: "R2", brand_id: "B_FINOLEX", brand_name: "Finolex", unit: "Coil", purchase_price: 780, selling_price: 1050, wholesale_price: 960, stock_quantity: 320, min_stock_level: 40, image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9e0EoFRMyr2w7QsMryhhkK3GSt0BpW2YTlIJdtaHx_w&s=10", is_active: 1 },
        { product_id: "P108", name: "Polycab 4.0sqmm Heavy Duty Wire (90m)", name_kn: "ಪಾಲಿಕ್ಯಾಬ್ 4.0 ಚ.ಮಿ.ಮೀ ಹೆವಿ ಡ್ಯೂಟಿ ವೈರ್", sku: "POL-4.0-WIR", category_id: "C_WIRES", rack_id: "R2", brand_id: "B_POLYCAB", brand_name: "Polycab", unit: "Coil", purchase_price: 1750, selling_price: 2350, wholesale_price: 2150, stock_quantity: 110, min_stock_level: 20, image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROg9hQrxLIHp2a53Xxk5xK-XEB8a7JB35Mp9SHJA6X6g&s=10", is_active: 1 },
        { product_id: "P110", name: "Havells Fabio 6A 1-Way Modular Switch", name_kn: "ಹ್ಯಾವೆಲ್ಸ್ 6A ಮಾಡ್ಯುಲರ್ ಸ್ವಿಚ್", sku: "HAV-6A-SW1", category_id: "C_SWITCH", rack_id: "R3", brand_id: "B_HAVELLS", brand_name: "Havells", unit: "Piece", purchase_price: 24, selling_price: 42, wholesale_price: 35, stock_quantity: 420, min_stock_level: 50, image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhMV7XUDyQXss1PM6B0Cok5maH7uv0jXJPf5wNW3MEzA&s=10", is_active: 1 },
        { product_id: "P114", name: "Havells 12W LED Slim Panel Round", name_kn: "ಹ್ಯಾವೆಲ್ಸ್ 12W ಎಲ್ಇಡಿ ಸ್ಲಿಮ್ ಪ್ಯಾನೆಲ್", sku: "HAV-12W-PAN", category_id: "C_LEDS", rack_id: "R8", brand_id: "B_HAVELLS", brand_name: "Havells", unit: "Piece", purchase_price: 190, selling_price: 350, wholesale_price: 290, stock_quantity: 115, min_stock_level: 20, image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXzSmGQYwAITDr85X_VQDC0ABBZxdPSryuk-c8up2yAQ&s=10", is_active: 1 },
        { product_id: "P117", name: "Schneider 16A Single Pole C-Curve MCB", name_kn: "ಶ್ನೇಡರ್ 16A ಸಿಂಗಲ್ ಪೋಲ್ ಎಂಸಿಬಿ", sku: "SCH-16A-MCB", category_id: "C_MCB", rack_id: "R7", brand_id: "B_LEGRAND", brand_name: "Legrand", unit: "Piece", purchase_price: 110, selling_price: 190, wholesale_price: 160, stock_quantity: 140, min_stock_level: 20, image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkyQHU0eRHFLc-qIhRA-bKyZLFlSwIDPOa-9ugNN7knA&s=10", is_active: 1 },
        { product_id: "P120", name: "Crompton Hill Briz 1200mm Ceiling Fan", name_kn: "ಕ್ರಾಂಪ್ಟನ್ 1200ಮಿ.ಮೀ ಸೀಲಿಂಗ್ ಫ್ಯಾನ್", sku: "CRO-1200-FAN", category_id: "C_FANS", rack_id: "R9", brand_id: "B_CROMPTON", brand_name: "Crompton", unit: "Piece", purchase_price: 1250, selling_price: 1850, wholesale_price: 1650, stock_quantity: 60, min_stock_level: 10, image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0huX31e_CD2Xpi2qCmG9YrlaModW0wVq4POeO-94RTw&s", is_active: 1 }
    ],


    sales: [
        { sale_id: "SAL-00145", invoice_no: "SAL-2026-00145", customer_name: "Rajesh Gowda", customer_phone: "9876543210", subtotal: 7800, discount_amount: 340, tax_amount: 0, grand_total: 7460, paid_amount: 7460, balance_amount: 0, payment_mode: "UPI", status: "Completed", created_at: "05 Nov 2026, 04:32 PM", items_count: 3, total_quantity: 25 },
        { sale_id: "SAL-00144", invoice_no: "SAL-2026-00144", customer_name: "Kumar Swamy", customer_phone: "9876501234", subtotal: 13500, discount_amount: 640, tax_amount: 0, grand_total: 12860, paid_amount: 12860, balance_amount: 0, payment_mode: "Cash", status: "Completed", created_at: "05 Nov 2026, 03:10 PM", items_count: 5, total_quantity: 48 },
        { sale_id: "SAL-00143", invoice_no: "SAL-2026-00143", customer_name: "Lakshmi Enterprises", customer_phone: "9988776655", subtotal: 29800, discount_amount: 1400, tax_amount: 0, grand_total: 28400, paid_amount: 28400, balance_amount: 0, payment_mode: "Bank Transfer", status: "Completed", created_at: "05 Nov 2026, 11:42 AM", items_count: 8, total_quantity: 96 },
        { sale_id: "SAL-00142", invoice_no: "SAL-2026-00142", customer_name: "Siva Shankaran", customer_phone: "9740123456", subtotal: 10200, discount_amount: 240, tax_amount: 0, grand_total: 9960, paid_amount: 9960, balance_amount: 0, payment_mode: "UPI", status: "Completed", created_at: "04 Nov 2026, 05:18 PM", items_count: 4, total_quantity: 37 },
        { sale_id: "SAL-00141", invoice_no: "SAL-2026-00141", customer_name: "Ramesh Babu", customer_phone: "9620123457", subtotal: 4700, discount_amount: 140, tax_amount: 0, grand_total: 4560, paid_amount: 4560, balance_amount: 0, payment_mode: "Cash", status: "Completed", created_at: "04 Nov 2026, 02:27 PM", items_count: 2, total_quantity: 18 }
    ],

    purchases: [
        { purchase_id: "PO-001", po_number: "PO-2026-0001", supplier_name: "Karnataka Electrical Distributors", invoice_number: "INV-KED-9921", total_amount: 85000, paid_amount: 85000, payment_status: "Paid", created_at: "28 Oct 2026, 11:00 AM", items_count: 12, total_quantity: 350 },
        { purchase_id: "PO-002", po_number: "PO-2026-0002", supplier_name: "Havells Official Regional Depot", invoice_number: "HAV-DEP-443", total_amount: 64000, paid_amount: 64000, payment_status: "Paid", created_at: "01 Nov 2026, 02:20 PM", items_count: 8, total_quantity: 210 }
    ],

    suppliers: [
        { supplier_id: "SUP1", name: "Karnataka Electrical Distributors", contact_person: "Suresh Kumar", phone: "9845012345", email: "sales@kedist.com", gstin: "29AAAAA0000A1Z5", city: "Bengaluru", outstanding_balance: 0 },
        { supplier_id: "SUP2", name: "Mysuru Power & Cable Agencies", contact_person: "Gopal Gowda", phone: "9880123456", email: "mysurupower@gmail.com", gstin: "29BBBBB1111B2Z6", city: "Mysuru", outstanding_balance: 14500 }
    ],

    customers: [
        { customer_id: "CUST1", name: "Rajesh Gowda", phone: "9876543210", business_name: "Rajesh Electrical Contracts", customer_type: "Wholesale", city: "Kollegal", credit_balance: 3500 },
        { customer_id: "CUST2", name: "Kumar Swamy", phone: "9876501234", business_name: "Swamy Hardware & Electricals", customer_type: "Wholesale", city: "Mysuru", credit_balance: 12000 }
    ],

    movements: [
        { movement_id: "MOV1", product_name: "Syska 9W LED Bulb Cool Day Light", sku: "SYS-9W-LED", movement_type: "Stock In", quantity: 100, previous_stock: 150, new_stock: 250, reference_id: "PO-2026-0002", reason: "Supplier delivery received", performed_by: "Admin", created_at: "01 Nov 2026, 03:00 PM" },
        { movement_id: "MOV2", product_name: "Finolex 2.5sqmm FR House Wire (90m)", sku: "FIN-2.5-WIR", movement_type: "Stock In", quantity: 50, previous_stock: 430, new_stock: 480, reference_id: "PO-2026-0001", reason: "Monthly wire lot", performed_by: "Admin", created_at: "29 Oct 2026, 12:00 PM" }
    ],

    enquiries: [],

    orders: [
        {
            order_id: "ORD-2026-1001",
            customer_name: "Rajesh Gowda",
            customer_phone: "9876543210",
            customer_address: "Main Road, Channarayapatna",
            purchased_items: "Philips 9W LED Bulb (x10), Havells 6A Switch (x5)",
            quantity: 15,
            total_price: 1410,
            order_date: "08 Nov 2026, 11:30 AM",
            status: "Pending",
            items: [
                { product_id: "P101", name: "Philips 9W LED Bulb", quantity: 10, unit_price: 120, line_total: 1200 },
                { product_id: "P110", name: "Havells 6A Switch", quantity: 5, unit_price: 42, line_total: 210 }
            ],
            created_at: "2026-11-08T11:30:00.000Z"
        },
        {
            order_id: "ORD-2026-1002",
            customer_name: "Lakshmi Electricals",
            customer_phone: "9988776655",
            customer_address: "B.M. Road, Hassan",
            purchased_items: "Finolex 2.5sqmm Wire (x2), Schneider 16A MCB (x4)",
            quantity: 6,
            total_price: 3860,
            order_date: "09 Nov 2026, 02:15 PM",
            status: "Shipped",
            items: [
                { product_id: "P106", name: "Finolex 2.5sqmm Wire", quantity: 2, unit_price: 1550, line_total: 3100 },
                { product_id: "P117", name: "Schneider 16A MCB", quantity: 4, unit_price: 190, line_total: 760 }
            ],
            created_at: "2026-11-09T14:15:00.000Z"
        }
    ],

    settings: {
        SHOP_NAME: "Deepu Enterprises",
        SHOP_TAGLINE: "Electrical & Electronics Wholesale & Retail",
        SHOP_PHONE: "+91 98450 12345 / 94480 54321",
        SHOP_GSTIN: "29ABCDE1234F1Z5",
        SHOP_ADDRESS: "Main Hub, B.M. Road, Channarayapatna, Karnataka - 573116",
        APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbw_4907n5x-M8j-r7YKPbgoGSPY4KqDMdTSQQ8ZJply01M3eJeXcnVi6yfN_4FwYi75uQ/exec"
    }
};

const LocalDB = {
    load() {
        try {
            const raw = localStorage.getItem(LOCAL_DB_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed) {
                    parsed.orders = parsed.orders || [];
                    if (!parsed.orders.length && SEED_DATA.orders) parsed.orders = structuredClone(SEED_DATA.orders);
                    parsed.products = parsed.products || [];
                    if (!parsed.products.length && SEED_DATA.products) parsed.products = structuredClone(SEED_DATA.products);
                    parsed.sales = parsed.sales || [];
                    if (!parsed.sales.length && SEED_DATA.sales) parsed.sales = structuredClone(SEED_DATA.sales);
                    parsed.categories = (parsed.categories && parsed.categories.length) ? parsed.categories : structuredClone(SEED_DATA.categories);
                    parsed.racks = (parsed.racks && parsed.racks.length) ? parsed.racks : structuredClone(SEED_DATA.racks);
                    parsed.brands = (parsed.brands && parsed.brands.length) ? parsed.brands : structuredClone(SEED_DATA.brands);
                    parsed.suppliers = (parsed.suppliers && parsed.suppliers.length) ? parsed.suppliers : structuredClone(SEED_DATA.suppliers);
                    parsed.customers = (parsed.customers && parsed.customers.length) ? parsed.customers : structuredClone(SEED_DATA.customers);
                    parsed.movements = (parsed.movements && parsed.movements.length) ? parsed.movements : structuredClone(SEED_DATA.movements);
                    parsed.purchases = (parsed.purchases && parsed.purchases.length) ? parsed.purchases : structuredClone(SEED_DATA.purchases);
                    parsed.enquiries = parsed.enquiries || [];
                    parsed.settings = parsed.settings || structuredClone(SEED_DATA.settings);
                    return parsed;
                }
            }
        } catch (e) {}
        this.save(SEED_DATA);
        return structuredClone(SEED_DATA);
    },

    save(data) {
        try {
            localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(data));
            localStorage.setItem("deepu_sync_heartbeat", String(Date.now()));
        } catch (e) {
            console.error("Storage save failed:", e);
        }
        try {
            if (typeof window !== "undefined" && "BroadcastChannel" in window) {
                if (!window.__deepu_bus) window.__deepu_bus = new BroadcastChannel("deepu_sync_bus");
                window.__deepu_bus.postMessage({ type: "SYNC", timestamp: Date.now() });
            }
        } catch (e) {}
    }
};
