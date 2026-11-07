/**
 * Bilingual Translation Dictionary (English & Tamil)
 * Deepu Enterprises Electrical & Electronics Inventory System
 */

const I18N = {
    en: {
        // App & Nav
        app_name: "Deepu Enterprises",
        app_tagline: "Electrical & Electronics Inventory System",
        nav_dashboard: "Admin Dashboard",
        nav_products: "Products Management",
        nav_stock: "Stock Management",
        nav_purchases: "Purchase",
        nav_sales: "Sales & POS",
        nav_suppliers: "Suppliers",
        nav_customers: "Customers",
        nav_prices: "Price Management",
        nav_reports: "Reports & Analytics",
        nav_settings: "Settings & Sheets Sync",
        nav_logout: "Sign Out",

        // Topbar
        search_placeholder: "Search product, SKU, invoice, customer, rack... (e.g. 'syska', 'vayar', 'பல்பு')",
        role_admin: "Admin",
        role_staff: "Sales Staff",
        lang_switch: "தமிழ்",
        sync_connected: "Google Sheets Ready",
        sync_offline: "Local DB Active",

        // Dashboard
        dash_title: "Inventory Dashboard",
        stat_total_stock: "Total Stock",
        stat_low_stock: "Low Stock Items",
        stat_in_stock: "In Stock Items",
        stat_total_val: "Total Value",
        stat_total_sales: "Total Sales",
        stat_today_sales: "Today's Sales",
        stat_orders: "Total Orders",
        stat_avg_order: "Avg Order Value",
        stat_sales_growth: "Sales Growth",
        sec_racks: "Inventory Racks (R1 - R20)",
        sec_stock_trend: "Stock & Sales Trend",
        sec_inventory_dist: "Category Distribution",
        sec_recent_sales: "Recent Transactions",
        sec_top_products: "Top Selling Products",
        view_all: "View All",

        // Products
        prod_title: "Products Management",
        prod_sub: "Manage electrical catalog, racks, barcodes and retail/wholesale prices.",
        btn_add_product: "+ Add New Product",
        btn_filter: "Filter",
        btn_grid_view: "Grid View",
        btn_table_view: "Table View",
        filter_all_brands: "All Brands",
        filter_all_racks: "All Racks",
        col_image: "Product Image",
        col_name: "Product Name",
        col_sku: "SKU",
        col_rack: "Rack",
        col_category: "Category",
        col_brand: "Brand",
        col_stock: "Current Stock",
        col_price: "Price (₹)",
        col_actions: "Actions",
        status_in_stock: "In Stock",
        status_low_stock: "Low Stock",
        status_out_of_stock: "Out of Stock",
        btn_update_stock: "Update Stock",
        btn_remove_stock: "Remove Stock",
        btn_edit: "Edit",
        btn_delete: "Delete",

        // Add/Edit Product Modal
        modal_add_title: "Add New Product",
        modal_edit_title: "Edit Product Details",
        lbl_rack: "Select Rack",
        lbl_category: "Select Category",
        lbl_prod_name_en: "Product Name (English)",
        lbl_prod_name_ta: "Product Name (Tamil)",
        lbl_sku: "Product SKU / Barcode",
        lbl_brand: "Brand",
        lbl_model: "Model / Specification",
        lbl_unit: "Unit of Measurement",
        lbl_purchase_price: "Purchase Price (Cost ₹)",
        lbl_selling_price: "Selling Price (Retail ₹)",
        lbl_wholesale_price: "Wholesale Price (₹)",
        lbl_opening_stock: "Stock Quantity",
        lbl_min_stock: "Low Stock Alert Threshold",
        lbl_image_url: "Product Image URL",
        lbl_desc: "Product Description",
        btn_save_prod: "Save Product",
        btn_cancel: "Cancel",

        // Sales & POS
        sales_title: "Sales & POS Billing",
        sales_sub: "Quick counter billing, professional tax invoices, and sales performance.",
        tab_new_sale: "New POS Sale",
        tab_sales_list: "Sales Details",
        tab_category_sales: "Category Breakdown",
        pos_search_product: "Search or scan product to add to bill...",
        pos_cart_empty: "No items in bill. Select products from above.",
        pos_customer_name: "Customer Name",
        pos_customer_phone: "Customer Mobile",
        pos_payment_mode: "Payment Mode",
        pos_subtotal: "Subtotal",
        pos_discount: "Discount (₹)",
        pos_tax: "GST / Tax",
        pos_grand_total: "Grand Total",
        pos_paid_amount: "Amount Paid (₹)",
        pos_balance: "Balance Due",
        btn_generate_invoice: "Generate & Print Invoice",
        btn_clear_cart: "Clear Bill",
        col_invoice_no: "Invoice No.",
        col_date_time: "Date & Time",
        col_customer: "Customer",
        col_items: "Items",
        col_qty: "Quantity",
        col_amount: "Amount (₹)",
        col_payment_mode: "Payment Mode",
        col_status: "Status",
        status_completed: "Completed",
        status_returned: "Returned",
        btn_view_invoice: "View Invoice",
        btn_return_sale: "Return Sale",

        // Stock Management
        stock_title: "Stock Management & Audit Movements",
        btn_adjust_stock: "Quick Stock Adjustment",
        col_mov_date: "Date & Time",
        col_mov_prod: "Product",
        col_mov_type: "Movement Type",
        col_mov_delta: "Quantity",
        col_mov_prev: "Before",
        col_mov_after: "After",
        col_mov_ref: "Reference #",
        col_mov_reason: "Reason",
        col_mov_user: "User",

        // Purchases
        purchase_title: "Purchase & Inward Orders",
        btn_new_purchase: "+ Inward Purchase Order",
        lbl_supplier: "Supplier",
        lbl_po_number: "PO Number",
        lbl_supplier_inv: "Supplier Invoice Ref",
        lbl_total_amount: "Total Amount (₹)",
        lbl_paid_amount: "Paid Amount (₹)",
        lbl_payment_status: "Payment Status",

        // Suppliers & Customers
        sup_title: "Supplier Management",
        cust_title: "Customer Ledger",
        btn_add_supplier: "+ Add Supplier",
        btn_add_customer: "+ Add Customer",

        // Reports
        rep_title: "Reports & Financial Analytics",
        rep_sales: "Sales Report",
        rep_stock: "Stock Valuation",
        rep_pl: "Profit & Loss Estimate",
        btn_export_csv: "Export CSV",

        // Google Sheets
        sheets_title: "Google Sheets Data Access Layer",
        btn_sync_now: "Sync with Google Sheets Now",
        sheets_desc: "Direct two-way synchronization between your SQLite system and Google Sheets for remote viewing and live cloud backup."
    },

    ta: {
        // App & Nav
        app_name: "தீபு எண்டர்பிரைசஸ்",
        app_tagline: "எலக்ட்ரிக்கல் & எலக்ட்ரானிக்ஸ் சரக்கு மேலாண்மை அமைப்பு",
        nav_dashboard: "நிர்வாக முகப்பு",
        nav_products: "பொருட்கள் மேலாண்மை",
        nav_stock: "கையிருப்பு மேலாண்மை",
        nav_purchases: "கொள்முதல்",
        nav_sales: "விற்பனை & பில்லிங்",
        nav_suppliers: "சப்ளையர்கள்",
        nav_customers: "வாடிக்கையாளர்கள்",
        nav_prices: "விலை மேலாண்மை",
        nav_reports: "அறிக்கைகள் & பகுப்பாய்வு",
        nav_settings: "அமைப்புகள் & கூகிள் ஷீட்ஸ்",
        nav_logout: "வெளியேறு",

        // Topbar
        search_placeholder: "பொருள், SKU, ரசீது, வாடிக்கையாளர், ரேக் தேடவும்... (எ.கா. 'syska', 'vayar', 'பல்பு')",
        role_admin: "முதலாளி (Admin)",
        role_staff: "விற்பனையாளர்",
        lang_switch: "English",
        sync_connected: "கூகிள் ஷீட்ஸ் தயார்",
        sync_offline: "உள்ளூர் தகவல் தளம்",

        // Dashboard
        dash_title: "சரக்கு இருப்பு முகப்பு",
        stat_total_stock: "மொத்த இருப்பு",
        stat_low_stock: "குறைவான இருப்பு",
        stat_in_stock: "இருப்பில் உள்ளவை",
        stat_total_val: "மொத்த சரக்கு மதிப்பு",
        stat_total_sales: "மொத்த விற்பனை",
        stat_today_sales: "இன்றைய விற்பனை",
        stat_orders: "மொத்த ஆர்டர்கள்",
        stat_avg_order: "சராசரி ஆர்டர் மதிப்பு",
        stat_sales_growth: "விற்பனை வளர்ச்சி",
        sec_racks: "பொருட்கள் ரேக்குகள் (R1 - R20)",
        sec_stock_trend: "விற்பனை & இருப்பு போக்கு",
        sec_inventory_dist: "பிரிவு வாரியான இருப்பு",
        sec_recent_sales: "சமீபத்திய விற்பனைகள்",
        sec_top_products: "அதிகம் விற்பனையான பொருட்கள்",
        view_all: "அனைத்தையும் பார்",

        // Products
        prod_title: "பொருட்கள் மேலாண்மை",
        prod_sub: "மின்சாதன பட்டியல், ரேக்குகள், பார்கோடுகள் மற்றும் சில்லறை/மொத்த விலைகளை நிர்வகிக்கவும்.",
        btn_add_product: "+ புதிய பொருள் சேர்க்க",
        btn_filter: "வடிகட்டு",
        btn_grid_view: "கட்டம் பார்வை",
        btn_table_view: "அட்டவணை பார்வை",
        filter_all_brands: "அனைத்து பிராண்டுகள்",
        filter_all_racks: "அனைத்து ரேக்குகள்",
        col_image: "படம்",
        col_name: "பொருள் பெயர்",
        col_sku: "SKU குறியீடு",
        col_rack: "ரேக்",
        col_category: "பிரிவு",
        col_brand: "பிராண்ட்",
        col_stock: "தற்போதைய இருப்பு",
        col_price: "விலை (₹)",
        col_actions: "செயல்கள்",
        status_in_stock: "இருப்பில் உள்ளது",
        status_low_stock: "குறைவான இருப்பு",
        status_out_of_stock: "தீர்ந்துவிட்டது",
        btn_update_stock: "இருப்பு கூட்டு",
        btn_remove_stock: "இருப்பு குறை",
        btn_edit: "திருத்து",
        btn_delete: "நீக்கு",

        // Add/Edit Product Modal
        modal_add_title: "புதிய மின்சாதன பொருள் சேர்க்க",
        modal_edit_title: "பொருள் விவரங்களை திருத்து",
        lbl_rack: "ரேக் தேர்வு செய்க",
        lbl_category: "பிரிவு தேர்வு செய்க",
        lbl_prod_name_en: "பொருள் பெயர் (ஆங்கிலம்)",
        lbl_prod_name_ta: "பொருள் பெயர் (தமிழ்)",
        lbl_sku: "SKU / பார்கோடு",
        lbl_brand: "பிராண்ட்",
        lbl_model: "மாடல் / விவரக்குறிப்பு",
        lbl_unit: "அளவீட்டு அலகு",
        lbl_purchase_price: "வாங்கிய விலை (அடக்கம் ₹)",
        lbl_selling_price: "விற்பனை விலை (சில்லறை ₹)",
        lbl_wholesale_price: "மொத்த விலை (₹)",
        lbl_opening_stock: "தொடக்க கையிருப்பு எண்ணிக்கை",
        lbl_min_stock: "குறைந்தபட்ச இருப்பு எச்சரிக்கை அளவு",
        lbl_image_url: "பட இணைப்பு URL",
        lbl_desc: "பொருள் விளக்கம்",
        btn_save_prod: "பொருளைச் சேமி",
        btn_cancel: "ரத்து செய்",

        // Sales & POS
        sales_title: "விற்பனை & பில்லிங் கவுண்டர்",
        sales_sub: "விரைவான விற்பனை பில், தொழில்முறை ஜிஎஸ்டி ரசீது மற்றும் விற்பனை பகுப்பாய்வு.",
        tab_new_sale: "புதிய பில் / விற்பனை",
        tab_sales_list: "விற்பனை ரசீது பட்டியல்",
        tab_category_sales: "பிரிவு வாரிய விற்பனை",
        pos_search_product: "பொருளைத் தேடவும் அல்லது பார்கோடு ஸ்கேன் செய்யவும்...",
        pos_cart_empty: "பில்லில் பொருட்கள் இல்லை. மேலே இருந்து தேர்ந்தெடுக்கவும்.",
        pos_customer_name: "வாடிக்கையாளர் பெயர்",
        pos_customer_phone: "வாடிக்கையாளர் மொபைல் எண்",
        pos_payment_mode: "செலுத்தும் முறை",
        pos_subtotal: "கூட்டுத்தொகை",
        pos_discount: "தள்ளுபடி (₹)",
        pos_tax: "ஜி.எஸ்.டி / வரி",
        pos_grand_total: "மொத்த தொகை",
        pos_paid_amount: "செலுத்திய தொகை (₹)",
        pos_balance: "மீதி பாக்கி",
        btn_generate_invoice: "ரசீது உருவாக்கி அச்சிடு",
        btn_clear_cart: "பில் நீக்கு",
        col_invoice_no: "ரசீது எண்",
        col_date_time: "தேதி & நேரம்",
        col_customer: "வாடிக்கையாளர்",
        col_items: "பொருட்கள்",
        col_qty: "அளவு",
        col_amount: "தொகை (₹)",
        col_payment_mode: "பணம் செலுத்திய முறை",
        col_status: "நிலை",
        status_completed: "முடிந்தது",
        status_returned: "திருப்பித் தரப்பட்டது",
        btn_view_invoice: "ரசீது பார்",
        btn_return_sale: "பில் திரும்புதல்",

        // Stock Management
        stock_title: "கையிருப்பு மேலாண்மை & தணிக்கை வரலாறு",
        btn_adjust_stock: "விரைவு இருப்பு சரிசெய்தல்",
        col_mov_date: "தேதி & நேரம்",
        col_mov_prod: "பொருள்",
        col_mov_type: "நகர்வு வகை",
        col_mov_delta: "அளவு",
        col_mov_prev: "முந்தைய இருப்பு",
        col_mov_after: "புதிய இருப்பு",
        col_mov_ref: "குறிப்பு எண்",
        col_mov_reason: "காரணம்",
        col_mov_user: "பயனர்",

        // Purchases
        purchase_title: "கொள்முதல் மற்றும் உள்வரும் சரக்குகள்",
        btn_new_purchase: "+ புதிய கொள்முதல் ஆர்டர்",
        lbl_supplier: "சப்ளையர்",
        lbl_po_number: "கொள்முதல் எண் (PO)",
        lbl_supplier_inv: "சப்ளையர் பில் எண்",
        lbl_total_amount: "மொத்த தொகை (₹)",
        lbl_paid_amount: "செலுத்திய தொகை (₹)",
        lbl_payment_status: "பணம் செலுத்திய நிலை",

        // Suppliers & Customers
        sup_title: "சப்ளையர்கள் பட்டியல்",
        cust_title: "வாடிக்கையாளர் கணக்கு ஏடு",
        btn_add_supplier: "+ சப்ளையர் சேர்க்க",
        btn_add_customer: "+ வாடிக்கையாளர் சேர்க்க",

        // Reports
        rep_title: "நிதி அறிக்கைகள் & பகுப்பாய்வு",
        rep_sales: "விற்பனை அறிக்கை",
        rep_stock: "சரக்கு மதிப்பு அறிக்கை",
        rep_pl: "லாப நஷ்ட மதிப்பீடு",
        btn_export_csv: "CSV ஏற்றுமதி",

        // Google Sheets
        sheets_title: "கூகிள் ஷீட்ஸ் இணைப்பு & தரவு ஒத்திசைவு",
        btn_sync_now: "இப்போது கூகிள் ஷீட்டுடன் ஒத்திசை",
        sheets_desc: "உங்கள் உள்ளூர் SQLite தகவலையும் கூகிள் ஷீட்ஸையும் இணைத்து நிகழ்நேர கிளவுட் பேக்கப் பெறவும்."
    }
};

let CURRENT_LANG = localStorage.getItem("deepu_lang") || "en";

function t(key) {
    return I18N[CURRENT_LANG]?.[key] || I18N["en"]?.[key] || key;
}

function setLanguage(lang) {
    CURRENT_LANG = lang;
    localStorage.setItem("deepu_lang", lang);
    document.documentElement.lang = lang;
    if (window.renderCurrentView) {
        window.renderCurrentView();
    }
    if (window.updateStaticTranslations) {
        window.updateStaticTranslations();
    }
}
