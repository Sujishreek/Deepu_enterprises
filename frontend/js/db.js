/**
 * Local Data Store & Mock Database Engine
 * Provides immediate offline functionality with realistic Electrical & Electronics datasets.
 * Prepares and synchronizes data with Google Sheets via Apps Script.
 */

const LOCAL_DB_KEY = "deepu_electrical_v2";

const SEED_DATA = {
    racks: [
        { rack_id: "R1", name: "Bulbs", name_ta: "பல்புகள்", icon: "💡", category_id: "C_BULBS", capacity_pct: 95, status: "Active" },
        { rack_id: "R2", name: "Wires", name_ta: "கம்பிகள் / ஒயர்கள்", icon: "🔌", category_id: "C_WIRES", capacity_pct: 89, status: "Active" },
        { rack_id: "R3", name: "Switches", name_ta: "சுவிட்சுகள்", icon: "🔘", category_id: "C_SWITCH", capacity_pct: 90, status: "Active" },
        { rack_id: "R4", name: "Cables", name_ta: "கேபிள்கள்", icon: "🔗", category_id: "C_CABLES", capacity_pct: 88, status: "Active" },
        { rack_id: "R5", name: "Sockets", name_ta: "சாக்கெட்டுகள்", icon: "🔌", category_id: "C_SOCKET", capacity_pct: 76, status: "Active" },
        { rack_id: "R6", name: "Fuses", name_ta: "ஃப்யூஸ்கள்", icon: "🛡️", category_id: "C_FUSE", capacity_pct: 70, status: "Active" },
        { rack_id: "R7", name: "MCBs", name_ta: "எம்.சி.பி", icon: "⚡", category_id: "C_MCB", capacity_pct: 68, status: "Active" },
        { rack_id: "R8", name: "LEDs", name_ta: "எல்.இ.டி", icon: "☀️", category_id: "C_LEDS", capacity_pct: 92, status: "Active" },
        { rack_id: "R9", name: "Fans", name_ta: "மின் விசிறிகள்", icon: "💨", category_id: "C_FANS", capacity_pct: 22, status: "Active" },
        { rack_id: "R10", name: "Lighting", name_ta: "விளக்குகள்", icon: "🏮", category_id: "C_LIGHT", capacity_pct: 98, status: "Active" },
        { rack_id: "R11", name: "Junction Box", name_ta: "ஜங்ஷன் பாக்ஸ்", icon: "📦", category_id: "C_JBOX", capacity_pct: 65, status: "Active" },
        { rack_id: "R12", name: "Tools", name_ta: "கருவிகள்", icon: "🔧", category_id: "C_TOOLS", capacity_pct: 11, status: "Active" },
        { rack_id: "R13", name: "Hardware", name_ta: "வன்பொருள்", icon: "🔨", category_id: "C_HARDWARE", capacity_pct: 85, status: "Active" },
        { rack_id: "R14", name: "Raw Material", name_ta: "மூலப்பொருட்கள்", icon: "🧱", category_id: "C_RAW", capacity_pct: 75, status: "Active" },
        { rack_id: "R15", name: "Panels", name_ta: "பேனல்கள்", icon: "🎛️", category_id: "C_PANELS", capacity_pct: 76, status: "Active" },
        { rack_id: "R16", name: "Sensors", name_ta: "சென்சார்கள்", icon: "📡", category_id: "C_SENSORS", capacity_pct: 40, status: "Active" },
        { rack_id: "R17", name: "Motors", name_ta: "மோட்டார்கள்", icon: "⚙️", category_id: "C_MOTORS", capacity_pct: 55, status: "Active" },
        { rack_id: "R18", name: "Batteries", name_ta: "பேட்டரிகள்", icon: "🔋", category_id: "C_BATTERY", capacity_pct: 60, status: "Active" },
        { rack_id: "R19", name: "Connectors", name_ta: "இணைப்பிகள்", icon: "🖇️", category_id: "C_CONNECT", capacity_pct: 85, status: "Active" },
        { rack_id: "R20", name: "Safety Gear", name_ta: "பாதுகாப்பு சாதனங்கள்", icon: "🦺", category_id: "C_SAFETY", capacity_pct: 60, status: "Active" }
    ],

    categories: [
        { category_id: "C_BULBS", name: "Bulbs & Lamps", name_ta: "பல்புகள் மற்றும் விளக்குகள்" },
        { category_id: "C_WIRES", name: "Wires & Conduits", name_ta: "கம்பிகள் மற்றும் குழாய்கள்" },
        { category_id: "C_SWITCH", name: "Switches & Accessories", name_ta: "சுவிட்சுகள் மற்றும் பாகங்கள்" },
        { category_id: "C_CABLES", name: "Industrial Cables", name_ta: "தொழில்துறை கேபிள்கள்" },
        { category_id: "C_SOCKET", name: "Sockets & Plugs", name_ta: "சாக்கெட்டுகள் மற்றும் பிளக்ஸ்" },
        { category_id: "C_FUSE", name: "Fuses & Protection", name_ta: "ஃப்யூஸ்கள் மற்றும் பாதுகாப்பு" },
        { category_id: "C_MCB", name: "Circuit Breakers (MCB/DB)", name_ta: "சர்க்யூட் பிரேக்கர்கள்" },
        { category_id: "C_LEDS", name: "LED Panels & Downlights", name_ta: "எல்.இ.டி பேனல்கள்" },
        { category_id: "C_FANS", name: "Fans & Ventilation", name_ta: "மின் விசிறிகள்" },
        { category_id: "C_LIGHT", name: "Decorative & Commercial", name_ta: "அலங்கார விளக்குகள்" },
        { category_id: "C_TOOLS", name: "Electrician Tools", name_ta: "எலக்ட்ரீஷியன் கருவிகள்" }
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
        { product_id: "P101", name: "Syska 9W LED Bulb Cool Day Light", name_ta: "சிஸ்கா 9வாட் எல்.இ.டி பல்பு", sku: "SYS-9W-LED", category_id: "C_BULBS", rack_id: "R1", brand_id: "B_SYSKA", brand_name: "Syska", unit: "Piece", purchase_price: 65, selling_price: 110, wholesale_price: 95, stock_quantity: 250, min_stock_level: 25, image_url: "https://images.unsplash.com/photo-1550524514-9b6058e59265?w=200", is_active: 1 },
        { product_id: "P102", name: "Philips 9W LED Bulb Stellar Bright", name_ta: "பிலிப்ஸ் 9வாட் எல்.இ.டி பல்பு", sku: "PHI-9W-LED", category_id: "C_BULBS", rack_id: "R1", brand_id: "B_PHILIPS", brand_name: "Philips", unit: "Piece", purchase_price: 70, selling_price: 120, wholesale_price: 105, stock_quantity: 180, min_stock_level: 20, image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200", is_active: 1 },
        { product_id: "P103", name: "Crompton EcoFit LED Tube 18W", name_ta: "கிராம்ப்டன் 18வாட் டியூப் லைட்", sku: "CRO-18W-TUB", category_id: "C_BULBS", rack_id: "R1", brand_id: "B_CROMPTON", brand_name: "Crompton", unit: "Piece", purchase_price: 120, selling_price: 210, wholesale_price: 180, stock_quantity: 120, min_stock_level: 15, image_url: "https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=200", is_active: 1 },
        { product_id: "P104", name: "Bajaj 9W LED Bulb White Crystal", name_ta: "பஜாஜ் 9வாட் எல்.இ.டி பல்பு", sku: "BAJ-9W-LED", category_id: "C_BULBS", rack_id: "R1", brand_id: "B_BAJAJ", brand_name: "Bajaj", unit: "Piece", purchase_price: 60, selling_price: 105, wholesale_price: 90, stock_quantity: 15, min_stock_level: 20, image_url: "https://images.unsplash.com/photo-1550524514-9b6058e59265?w=200", is_active: 1 },
        { product_id: "P105", name: "Havells 12W LED Bulb Adore", name_ta: "ஹேவல்ஸ் 12வாட் எல்.இ.டி பல்பு", sku: "HAV-12W-LED", category_id: "C_BULBS", rack_id: "R1", brand_id: "B_HAVELLS", brand_name: "Havells", unit: "Piece", purchase_price: 95, selling_price: 160, wholesale_price: 140, stock_quantity: 85, min_stock_level: 15, image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200", is_active: 1 },
        { product_id: "P106", name: "Finolex 2.5sqmm FR House Wire (90m)", name_ta: "பினோலெக்ஸ் 2.5 சதுர மி.மீ வயர்", sku: "FIN-2.5-WIR", category_id: "C_WIRES", rack_id: "R2", brand_id: "B_FINOLEX", brand_name: "Finolex", unit: "Coil", purchase_price: 1150, selling_price: 1550, wholesale_price: 1420, stock_quantity: 480, min_stock_level: 50, image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200", is_active: 1 },
        { product_id: "P107", name: "Finolex 1.5sqmm FR House Wire (90m)", name_ta: "பினோலெக்ஸ் 1.5 சதுர மி.மீ வயர்", sku: "FIN-1.5-WIR", category_id: "C_WIRES", rack_id: "R2", brand_id: "B_FINOLEX", brand_name: "Finolex", unit: "Coil", purchase_price: 780, selling_price: 1050, wholesale_price: 960, stock_quantity: 320, min_stock_level: 40, image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200", is_active: 1 },
        { product_id: "P108", name: "Polycab 4.0sqmm Heavy Duty Wire (90m)", name_ta: "பாலிகேப் 4.0 சதுர மி.மீ வயர்", sku: "POL-4.0-WIR", category_id: "C_WIRES", rack_id: "R2", brand_id: "B_POLYCAB", brand_name: "Polycab", unit: "Coil", purchase_price: 1750, selling_price: 2350, wholesale_price: 2150, stock_quantity: 110, min_stock_level: 20, image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200", is_active: 1 },
        { product_id: "P110", name: "Havells Fabio 6A 1-Way Modular Switch", name_ta: "ஹேவல்ஸ் 6A சுவிட்ச்", sku: "HAV-6A-SW1", category_id: "C_SWITCH", rack_id: "R3", brand_id: "B_HAVELLS", brand_name: "Havells", unit: "Piece", purchase_price: 24, selling_price: 42, wholesale_price: 35, stock_quantity: 420, min_stock_level: 50, image_url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200", is_active: 1 },
        { product_id: "P114", name: "Havells 12W LED Slim Panel Round", name_ta: "ஹேவல்ஸ் 12வாட் எல்.இ.டி பேனல்", sku: "HAV-12W-PAN", category_id: "C_LEDS", rack_id: "R8", brand_id: "B_HAVELLS", brand_name: "Havells", unit: "Piece", purchase_price: 190, selling_price: 350, wholesale_price: 290, stock_quantity: 115, min_stock_level: 20, image_url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=200", is_active: 1 },
        { product_id: "P117", name: "Schneider 16A Single Pole C-Curve MCB", name_ta: "ஷ்னைடர் 16A ஒற்றை துருவ MCB", sku: "SCH-16A-MCB", category_id: "C_MCB", rack_id: "R7", brand_id: "B_LEGRAND", brand_name: "Legrand", unit: "Piece", purchase_price: 110, selling_price: 190, wholesale_price: 160, stock_quantity: 140, min_stock_level: 20, image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200", is_active: 1 },
        { product_id: "P120", name: "Crompton Hill Briz 1200mm Ceiling Fan", name_ta: "கிராம்ப்டன் 1200மி.மீ சீலிங் ஃபேன்", sku: "CRO-1200-FAN", category_id: "C_FANS", rack_id: "R9", brand_id: "B_CROMPTON", brand_name: "Crompton", unit: "Piece", purchase_price: 1250, selling_price: 1850, wholesale_price: 1650, stock_quantity: 60, min_stock_level: 10, image_url: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=200", is_active: 1 }
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

    settings: {
        SHOP_NAME: "Deepu Enterprises",
        SHOP_TAGLINE: "Electrical & Electronics Wholesale & Retail",
        SHOP_PHONE: "+91 98450 12345 / 94480 54321",
        SHOP_GSTIN: "29ABCDE1234F1Z5",
        SHOP_ADDRESS: "Main Hub, B.M. Road, Channarayapatna, Karnataka - 573116",
        APPS_SCRIPT_URL: ""
    }
};

const LocalDB = {
    load() {
        try {
            const raw = localStorage.getItem(LOCAL_DB_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        this.save(SEED_DATA);
        return structuredClone(SEED_DATA);
    },

    save(data) {
        try {
            localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Storage save failed:", e);
        }
    }
};
