/* Deepu Enterprises — customer website.
   Connected to the SAME Google Apps Script backend and Google Sheets database
   as the Admin Dashboard (Spreadsheet ID: 1jUPjOacuZw0sLD1EAfAar9FphcZCwdy8PkvQNsRG-98).
   LocalDB key "deepu_electrical_v3_kn" acts as the offline-ready bridge.
   Customer purchases, enquiries, stock, and live order tracking synchronize automatically. */

const DEMO_ADMIN_USER = "admin@deepu.local";
const DEMO_ADMIN_PASS = "Demo@12345";
const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyugtl-Hl3U1Zmv_HjKlcTi2Homf5rheNQltW3VHGwrYJ7lKc03a_45HdJxvkgL25qEMw/exec";

/* ---------- Translations (shared language toggle with admin via "deepu_lang") ---------- */
const TX = {
 en: {
  nav_home: "Home", nav_sections: "Shop by Section", nav_catalog: "Catalog", nav_brands: "Brands",
  nav_about: "About", nav_logistics: "Logistics", nav_dealer: "Become a Dealer", nav_contact: "Contact",
  nav_track_order: "Track Order", my_inquiry: "Cart & Order",
  hero_eyebrow: "YOUR TRUSTED ELECTRICAL & ELECTRONICS PARTNER",
  hero_title: "Powering businesses.<br><em>Strengthening</em> relationships.",
  hero_text: "Bulbs, wires, switches, MCBs, fans, lighting and more — wholesale and retail supply from one dependable counter.",
  search_ph: "Search product, brand or SKU… (e.g. syska, vayar, ಬಲ್ಬ್)", explore: "Explore Catalog",
  serving: "Serving Channarayapatna and surrounding regions", float_a: "One partner.", float_b: "Many supply needs.",
  stat_products_u: "Products", stat_products: "In our live catalog",
  stat_brands_u: "Brands", stat_brands: "Partner brands",
  stat_sections_u: "Sections", stat_sections: "Organised store racks",
  disclaimer: "Catalog, stock status and prices update live from the shop's inventory system. Wholesale rates are shared on enquiry.",
  sec_kicker: "SHOP BY SECTION", sec_title: "Find it on<br><em>the right rack.</em>",
  sec_text: "Our store is organised into racks by product type. Pick a section to see what is available.",
  cat_kicker: "PRODUCT CATALOG", cat_title: "Find what your<br><em>business needs.</em>",
  cat_text: "Browse live products with retail prices and availability. Wholesale prices are shared after enquiry or dealer approval.",
  all_categories: "All categories", all_brands: "All brands", all: "All", show_all: "Show all products", show_fewer: "Show fewer",
  no_products: "No matching products found.",
  in_stock: "In stock", low_stock: "Limited stock", out_stock: "Out of stock", available: "Available", on_request: "On request",
  add_inquiry: "+ Add to Cart", unavailable: "Unavailable", wholesale_note: "Wholesale rate on enquiry",
  filtering: "Showing", clear: "Clear filter", per: "per",
  brand_kicker: "BRANDS & SUPPLY PARTNERS", brand_title: "Brands you<br><em>already trust.</em>",
  brand_text: "Tap a brand to see its products in our catalog.", items: "items",
  about_kicker: "ABOUT DEEPU ENTERPRISES", about_title: "Built on trust.<br><em>Driven by service.</em>",
  about_text: "Deepu Enterprises is an electrical and electronics wholesale and retail supplier based in Channarayapatna, Karnataka. We connect electricians, contractors, retailers and households with dependable products and responsive local support.",
  about_panel_h: "Dependable supply, closer to your business.", about_panel_p: "Our focus is straightforward: genuine branded products, clear communication and dependable distribution support.",
  v1_h: "Genuine brands", v1_p: "Leading electrical brands under one roof.",
  v2_h: "Wholesale & retail", v2_p: "Competitive rates for bulk and counter buyers.",
  v3_h: "Local distribution", v3_p: "Coverage planning around Hassan district.",
  log_kicker: "DISTRIBUTION & LOGISTICS", log_title: "Local knowledge.<br><em>Planned delivery.</em>",
  log_text: "Coverage areas around our Channarayapatna hub. Please confirm delivery days and serviceability with our team.",
  primary_hub: "Primary hub", town_chn: "Channarayapatna", dist_hassan: "Hassan District, Karnataka",
  log_note: "Coverage list is not a guarantee of daily service or a physical branch at each location.",
  map_cap: "Hassan district coverage overview", map_note: "Illustrative schematic, not a navigational map.",
  dealer_kicker: "GROW WITH DEEPU ENTERPRISES", dealer_title: "Let’s build a stronger<br><em>business relationship.</em>",
  dealer_text: "Apply to become a retail or sub-dealer partner. Our team can review your details and contact you.", dealer_cta: "Apply for dealership →",
  dealer_form_h: "Dealer application", dealer_form_p: "Submit your shop and contact information.",
  f_contact: "Contact person", f_business: "Shop / business name", f_mobile: "Mobile number", f_email: "Email",
  f_gstin: "GSTIN (if registered)", f_city: "City / town", f_address: "Shop address", f_interest: "Products of interest",
  ph_mobile: "10-digit mobile", ph_gstin: "15-character GSTIN", ph_interest: "Bulbs, wires, switches, fans…",
  consent_dealer: "I agree to be contacted regarding this dealership application.", submit_app: "Submit application",
  contact_kicker: "CONTACT US", contact_title: "Let’s talk<br><em>business.</em>",
  contact_text: "For product availability, bulk requirements and dealership enquiries, contact the team.",
  c_phone: "PHONE", c_email: "OFFICIAL EMAIL", c_loc: "BUSINESS LOCATION", c_wa: "Chat with us on WhatsApp",
  contact_form_h: "Send an enquiry", f_name: "Your name", f_phone: "Phone number", f_type: "Enquiry type", f_message: "Message",
  t_general: "General", t_product: "Product Enquiry", t_bulk: "Bulk Order", t_dist: "Distribution", send_enquiry: "Send enquiry",
  footer_text: "Distribution and supply support for electricians, retailers and businesses.", rights: "All rights reserved.", admin_link: "Admin",
  inq_title: "Your Shopping Cart & Order", inq_intro: "Review selected items and complete your purchase or request a wholesale quotation.",
  inq_empty: "Your cart is currently empty. Add products from the catalog to place an order.",
  q_name: "Your Name", q_business: "Shop / Business Name (Optional)", q_notes: "Delivery / Special Notes", q_send: "Send Quote Request",
  added: "Added to your cart",
  quote_ok: "Quote request sent. We will contact you soon.", dealer_ok: "Application submitted successfully. We will contact you.",
  contact_ok: "Thank you. Your enquiry was sent.",
  signin: "Admin sign in", signin_p: "Access inventory and business operations.", f_user: "Email / username", f_pass: "Password",
  signin_btn: "Sign in", signin_hint: "Demo admin: admin@deepu.local / Demo@12345.", signin_fail: "Incorrect username or password.",
  wa_text: "Hi Deepu Enterprises, I am checking your online catalog and would like to enquire about bulk prices.",
  
  /* Additional purchase & order tracking keys */
  btn_place_order: "🛍️ Complete Purchase (Place Order)",
  btn_quote_req: "📄 Request Wholesale Quote Instead",
  order_summary_lbl: "Order Summary",
  total_units: "Total Units",
  grand_total: "Grand Total",
  f_delivery_addr: "Delivery Address",
  f_city_town: "City / Town",
  order_success_title: "Order Placed Successfully!",
  order_success_desc: "Your purchase order has been recorded and submitted to Deepu Enterprises. Status is currently Pending.",
  order_id_lbl: "Order ID",
  order_status_lbl: "Status",
  copy_order_id: "Copy Order ID",
  order_id_copied: "Order ID copied to clipboard!",
  btn_track_this: "🔍 Track This Order",
  btn_continue_shop: "Continue Shopping",
  track_title: "Track Your Order",
  track_desc: "Enter your Order ID (e.g. ORD-...) or 10-digit mobile number to check real-time order status.",
  track_ph: "Enter Order ID or mobile number…",
  btn_check_status: "Check Status",
  order_not_found: "No matching order found. Please check your Order ID or phone number.",
  track_lookup_link: "🔍 Already placed an order? Track your order status",
  status_pending: "Pending",
  status_confirmed: "Confirmed",
  status_shipped: "Shipped",
  status_delivered: "Delivered",
  status_cancelled: "Cancelled"
 },
 kn: {
  nav_home: "ಮುಖಪುಟ", nav_sections: "ವಿಭಾಗಗಳು", nav_catalog: "ಉತ್ಪನ್ನಗಳು", nav_brands: "ಬ್ರಾಂಡ್‌ಗಳು",
  nav_about: "ನಮ್ಮ ಬಗ್ಗೆ", nav_logistics: "ಸರಬರಾಜು", nav_dealer: "ಡೀಲರ್ ಆಗಿ", nav_contact: "ಸಂಪರ್ಕಿಸಿ",
  nav_track_order: "ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ", my_inquiry: "🛒 ಕಾರ್ಟ್ ಮತ್ತು ಆರ್ಡರ್",
  hero_eyebrow: "ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ಎಲೆಕ್ಟ್ರಿಕಲ್ ಮತ್ತು ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಪಾಲುದಾರ",
  hero_title: "ವ್ಯವಹಾರಗಳಿಗೆ ಶಕ್ತಿ.<br><em>ಸಂಬಂಧಗಳಿಗೆ</em> ಬಲ.",
  hero_text: "ಬಲ್ಬ್, ವೈರ್, ಸ್ವಿಚ್, ಎಂಸಿಬಿ, ಫ್ಯಾನ್, ಲೈಟಿಂಗ್ ಮತ್ತು ಇನ್ನಷ್ಟು — ಒಂದೇ ಕೌಂಟರ್‌ನಲ್ಲಿ ಸಗಟು ಮತ್ತು ಚಿಲ್ಲರೆ ಪೂರೈಕೆ.",
  search_ph: "ಉತ್ಪನ್ನ, ಬ್ರಾಂಡ್ ಅಥವಾ SKU ಹುಡುಕಿ… (ಉದಾ. syska, vayar, ಬಲ್ಬ್)", explore: "ಉತ್ಪನ್ನಗಳನ್ನು ನೋಡಿ",
  serving: "ಚನ್ನರಾಯಪಟ್ಟಣ ಮತ್ತು ಸುತ್ತಮುತ್ತಲಿನ ಪ್ರದೇಶಗಳಿಗೆ ಸೇವೆ", float_a: "ಒಬ್ಬ ಪಾಲುದಾರ.", float_b: "ಹಲವು ಪೂರೈಕೆ ಅಗತ್ಯಗಳು.",
  stat_products_u: "ಉತ್ಪನ್ನಗಳು", stat_products: "ನಮ್ಮ ಲೈವ್ ಕ್ಯಾಟಲಾಗ್‌ನಲ್ಲಿ",
  stat_brands_u: "ಬ್ರಾಂಡ್‌ಗಳು", stat_brands: "ಪಾಲುದಾರ ಬ್ರಾಂಡ್‌ಗಳು",
  stat_sections_u: "ವಿಭಾಗಗಳು", stat_sections: "ವ್ಯವಸ್ಥಿತ ಅಂಗಡಿ ರ‍್ಯಾಕ್‌ಗಳು",
  disclaimer: "ಕ್ಯಾಟಲಾಗ್, ಸ್ಟಾಕ್ ಸ್ಥಿತಿ ಮತ್ತು ಬೆಲೆಗಳು ಅಂಗಡಿಯ ಇನ್ವೆಂಟರಿ ವ್ಯವಸ್ಥೆಯಿಂದ ನೇರವಾಗಿ ನವೀಕರಣಗೊಳ್ಳುತ್ತವೆ. ಸಗಟು ದರಗಳನ್ನು ವಿಚಾರಣೆಯ ನಂತರ ತಿಳಿಸಲಾಗುತ್ತದೆ.",
  sec_kicker: "ವಿಭಾಗದ ಪ್ರಕಾರ ಖರೀದಿಸಿ", sec_title: "ಸರಿಯಾದ ರ‍್ಯಾಕ್‌ನಲ್ಲಿ<br><em>ಹುಡುಕಿ.</em>",
  sec_text: "ನಮ್ಮ ಅಂಗಡಿಯನ್ನು ಉತ್ಪನ್ನ ಪ್ರಕಾರದ ಪ್ರಕಾರ ರ‍್ಯಾಕ್‌ಗಳಾಗಿ ವಿಂಗಡಿಸಲಾಗಿದೆ. ಲಭ್ಯವಿರುವುದನ್ನು ನೋಡಲು ಒಂದು ವಿಭಾಗವನ್ನು ಆರಿಸಿ.",
  cat_kicker: "ಉತ್ಪನ್ನ ಕ್ಯಾಟಲಾಗ್", cat_title: "ನಿಮ್ಮ ವ್ಯವಹಾರಕ್ಕೆ<br><em>ಬೇಕಾದದ್ದನ್ನು ಹುಡುಕಿ.</em>",
  cat_text: "ಚಿಲ್ಲರೆ ಬೆಲೆ ಮತ್ತು ಲಭ್ಯತೆಯೊಂದಿಗೆ ಲೈವ್ ಉತ್ಪನ್ನಗಳನ್ನು ನೋಡಿ. ಸಗಟು ಬೆಲೆಗಳನ್ನು ವಿಚಾರಣೆ ಅಥವಾ ಡೀಲರ್ ಅನುಮೋದನೆಯ ನಂತರ ತಿಳಿಸಲಾಗುತ್ತದೆ.",
  all_categories: "ಎಲ್ಲಾ ವರ್ಗಗಳು", all_brands: "ಎಲ್ಲಾ ಬ್ರಾಂಡ್‌ಗಳು", all: "ಎಲ್ಲಾ", show_all: "ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳನ್ನು ತೋರಿಸಿ", show_fewer: "ಕಡಿಮೆ ತೋರಿಸಿ",
  no_products: "ಹೊಂದುವ ಉತ್ಪನ್ನಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
  in_stock: "ಸ್ಟಾಕ್ ಇದೆ", low_stock: "ಸೀಮಿತ ಸ್ಟಾಕ್", out_stock: "ಸ್ಟಾಕ್ ಇಲ್ಲ", available: "ಲಭ್ಯವಿದೆ", on_request: "ವಿನಂತಿಯ ಮೇರೆಗೆ",
  add_inquiry: "+ ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ", unavailable: "ಲಭ್ಯವಿಲ್ಲ", wholesale_note: "ಸಗಟು ದರ ವಿಚಾರಣೆಯ ಮೇರೆಗೆ",
  filtering: "ತೋರಿಸುತ್ತಿರುವುದು", clear: "ಫಿಲ್ಟರ್ ತೆಗೆಯಿರಿ", per: "ಪ್ರತಿ",
  brand_kicker: "ಬ್ರಾಂಡ್‌ಗಳು ಮತ್ತು ಪೂರೈಕೆ ಪಾಲುದಾರರು", brand_title: "ನೀವು ಈಗಾಗಲೇ<br><em>ನಂಬುವ ಬ್ರಾಂಡ್‌ಗಳು.</em>",
  brand_text: "ಬ್ರಾಂಡ್‌ನ ಉತ್ಪನ್ನಗಳನ್ನು ನೋಡಲು ಅದರ ಮೇಲೆ ಟ್ಯಾಪ್ ಮಾಡಿ.", items: "ಉತ್ಪನ್ನಗಳು",
  about_kicker: "ದೀಪು ಎಂಟರ್‌ಪ್ರೈಸಸ್ ಬಗ್ಗೆ", about_title: "ವಿಶ್ವಾಸದ ಮೇಲೆ ನಿರ್ಮಿತ.<br><em>ಸೇವೆಯಿಂದ ಮುನ್ನಡೆ.</em>",
  about_text: "ದೀಪು ಎಂಟರ್‌ಪ್ರೈಸಸ್ ಕರ್ನಾಟಕದ ಚನ್ನರಾಯಪಟ್ಟಣದಲ್ಲಿರುವ ಎಲೆಕ್ಟ್ರಿಕಲ್ ಮತ್ತು ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಸಗಟು ಮತ್ತು ಚಿಲ್ಲರೆ ಪೂರೈಕೆದಾರ. ಎಲೆಕ್ಟ್ರಿಷಿಯನ್‌ಗಳು, ಗುತ್ತಿಗೆದಾರರು, ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ಮನೆಯವರಿಗೆ ನಂಬಿಕಸ್ಥ ಉತ್ಪನ್ನಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ಸೇವೆಯನ್ನು ನೀಡುತ್ತೇವೆ.",
  about_panel_h: "ನಂಬಿಕಸ್ಥ ಪೂರೈಕೆ, ನಿಮ್ಮ ವ್ಯವಹಾರಕ್ಕೆ ಹತ್ತಿರ.", about_panel_p: "ನಮ್ಮ ಗಮನ ಸರಳ: ಅಸಲಿ ಬ್ರಾಂಡೆಡ್ ಉತ್ಪನ್ನಗಳು, ಸ್ಪಷ್ಟ ಸಂವಹನ ಮತ್ತು ನಂಬಿಕಸ್ಥ ವಿತರಣಾ ಬೆಂಬಲ.",
  v1_h: "ಅಸಲಿ ಬ್ರಾಂಡ್‌ಗಳು", v1_p: "ಪ್ರಮುಖ ಎಲೆಕ್ಟ್ರಿಕಲ್ ಬ್ರಾಂಡ್‌ಗಳು ಒಂದೇ ಸೂರಿನಡಿ.",
  v2_h: "ಸಗಟು ಮತ್ತು ಚಿಲ್ಲರೆ", v2_p: "ಬೃಹತ್ ಮತ್ತು ಕೌಂಟರ್ ಖರೀದಿದಾರರಿಗೆ ಸ್ಪರ್ಧಾತ್ಮಕ ದರ.",
  v3_h: "ಸ್ಥಳೀಯ ವಿತರಣೆ", v3_p: "ಹಾಸನ ಜಿಲ್ಲೆಯ ಸುತ್ತ ವ್ಯಾಪ್ತಿ.",
  log_kicker: "ವಿತರಣೆ ಮತ್ತು ಸರಬರಾಜು", log_title: "ಸ್ಥಳೀಯ ಜ್ಞಾನ.<br><em>ಯೋಜಿತ ವಿತರಣೆ.</em>",
  log_text: "ನಮ್ಮ ಚನ್ನರಾಯಪಟ್ಟಣ ಕೇಂದ್ರದ ಸುತ್ತಲಿನ ವ್ಯಾಪ್ತಿ ಪ್ರದೇಶಗಳು. ವಿತರಣಾ ದಿನಗಳನ್ನು ನಮ್ಮ ತಂಡದೊಂದಿಗೆ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
  primary_hub: "ಮುಖ್ಯ ಕೇಂದ್ರ", town_chn: "ಚನ್ನರಾಯಪಟ್ಟಣ", dist_hassan: "ಹಾಸನ ಜಿಲ್ಲೆ, ಕರ್ನಾಟಕ",
  log_note: "ಈ ಪಟ್ಟಿಯು ಪ್ರತಿದಿನ ಸೇವೆ ಅಥವಾ ಪ್ರತಿ ಸ್ಥಳದಲ್ಲಿ ಶಾಖೆಯ ಖಾತರಿಯಲ್ಲ.",
  map_cap: "ಹಾಸನ ಜಿಲ್ಲೆ ವ್ಯಾಪ್ತಿ ನೋಟ", map_note: "ಸಾಂಕೇತಿಕ ಚಿತ್ರ, ದಾರಿ ತೋರಿಸುವ ನಕ್ಷೆಯಲ್ಲ.",
  dealer_kicker: "ದೀಪು ಎಂಟರ್‌ಪ್ರೈಸಸ್‌ನೊಂದಿಗೆ ಬೆಳೆಯಿರಿ", dealer_title: "ಬಲವಾದ<br><em>ವ್ಯವಹಾರ ಸಂಬಂಧ ಕಟ್ಟೋಣ.</em>",
  dealer_text: "ರಿಟೇಲ್ ಅಥವಾ ಸಬ್-ಡೀಲರ್ ಪಾಲುದಾರರಾಗಲು ಅರ್ಜಿ ಸಲ್ಲಿಸಿ. ನಮ್ಮ ತಂಡ ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಸಂಪರ್ಕಿಸುತ್ತದೆ.", dealer_cta: "ಡೀಲರ್‌ಶಿಪ್‌ಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ →",
  dealer_form_h: "ಡೀಲರ್ ಅರ್ಜಿ", dealer_form_p: "ನಿಮ್ಮ ಅಂಗಡಿ ಮತ್ತು ಸಂಪರ್ಕ ವಿವರಗಳನ್ನು ಸಲ್ಲಿಸಿ.",
  f_contact: "ಸಂಪರ್ಕ ವ್ಯಕ್ತಿ", f_business: "ಅಂಗಡಿ / ವ್ಯವಹಾರದ ಹೆಸರು", f_mobile: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ", f_email: "ಇಮೇಲ್",
  f_gstin: "GSTIN (ನೋಂದಾಯಿತರಾಗಿದ್ದರೆ)", f_city: "ನಗರ / ಪಟ್ಟಣ", f_address: "ಅಂಗಡಿ ವಿಳಾಸ", f_interest: "ಆಸಕ್ತಿಯ ಉತ್ಪನ್ನಗಳು",
  ph_mobile: "10-ಅಂಕಿಯ ಮೊಬೈಲ್", ph_gstin: "15-ಅಕ್ಷರದ GSTIN", ph_interest: "ಬಲ್ಬ್, ವೈರ್, ಸ್ವಿಚ್, ಫ್ಯಾನ್…",
  consent_dealer: "ಈ ಡೀಲರ್‌ಶಿಪ್ ಅರ್ಜಿಯ ಬಗ್ಗೆ ನನ್ನನ್ನು ಸಂಪರ್ಕಿಸಲು ಒಪ್ಪುತ್ತೇನೆ.", submit_app: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
  contact_kicker: "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ", contact_title: "ವ್ಯವಹಾರದ ಬಗ್ಗೆ<br><em>ಮಾತನಾಡೋಣ.</em>",
  contact_text: "ಉತ್ಪನ್ನ ಲಭ್ಯತೆ, ಬೃಹತ್ ಅಗತ್ಯಗಳು ಮತ್ತು ಡೀಲರ್‌ಶಿಪ್ ವಿಚಾರಣೆಗಳಿಗಾಗಿ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ.",
  c_phone: "ದೂರವಾಣಿ", c_email: "ಅಧಿಕೃತ ಇಮೇಲ್", c_loc: "ವ್ಯವಹಾರ ಸ್ಥಳ", c_wa: "ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಚಾಟ್ ಮಾಡಿ",
  contact_form_h: "ವಿಚಾರಣೆ ಕಳುಹಿಸಿ", f_name: "ನಿಮ್ಮ ಹೆಸರು", f_phone: "ಫೋನ್ ಸಂಖ್ಯೆ", f_type: "ವಿಚಾರಣೆಯ ಪ್ರಕಾರ", f_message: "ಸಂದೇಶ",
  t_general: "ಸಾಮಾನ್ಯ", t_product: "ಉತ್ಪನ್ನ ವಿಚಾರಣೆ", t_bulk: "ಬೃಹತ್ ಆರ್ಡರ್", t_dist: "ವಿತರಣೆ", send_enquiry: "ವಿಚಾರಣೆ ಕಳುಹಿಸಿ",
  footer_text: "ಎಲೆಕ್ಟ್ರಿಷಿಯನ್‌ಗಳು, ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ವ್ಯವಹಾರಗಳಿಗೆ ವಿತರಣೆ ಮತ್ತು ಪೂರೈಕೆ ಬೆಂಬಲ.", rights: "ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.", admin_link: "ಅಡ್ಮಿನ್",
  inq_title: "ನಿಮ್ಮ ಶಾಪಿಂಗ್ ಕಾರ್ಟ್ ಮತ್ತು ಆರ್ಡರ್", inq_intro: "ಉತ್ಪನ್ನಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಖರೀದಿಸಿ ಅಥವಾ ಸಗಟು ದರದ ಕೋಟ್ ವಿನಂತಿಸಿ.",
  inq_empty: "ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ. ಆರ್ಡರ್ ಮಾಡಲು ಕ್ಯಾಟಲಾಗ್‌ನಿಂದ ಉತ್ಪನ್ನಗಳನ್ನು ಸೇರಿಸಿ.",
  q_name: "ನಿಮ್ಮ ಹೆಸರು", q_business: "ಅಂಗಡಿ / ವ್ಯವಹಾರ (ಐಚ್ಛಿಕ)", q_notes: "ವಿಶೇಷ ಸೂಚನೆಗಳು", q_send: "ಕೋಟ್ ವಿನಂತಿ ಕಳುಹಿಸಿ",
  added: "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ",
  quote_ok: "ಕೋಟ್ ವಿನಂತಿ ಕಳುಹಿಸಲಾಗಿದೆ. ನಾವು ಶೀಘ್ರದಲ್ಲೇ ಸಂಪರ್ಕಿಸುತ್ತೇವೆ.", dealer_ok: "ಅರ್ಜಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಕೆಯಾಗಿದೆ. ನಾವು ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತೇವೆ.",
  contact_ok: "ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ವಿಚಾರಣೆ ಕಳುಹಿಸಲಾಗಿದೆ.",
  signin: "ಅಡ್ಮಿನ್ ಸೈನ್ ಇನ್", signin_p: "ಇನ್ವೆಂಟರಿ ಮತ್ತು ವ್ಯವಹಾರ ನಿರ್ವಹಣೆಗೆ ಪ್ರವೇಶಿಸಿ.", f_user: "ಇಮೇಲ್ / ಬಳಕೆದಾರ ಹೆಸರು", f_pass: "ಪಾಸ್‌ವರ್ಡ್",
  signin_btn: "ಸೈನ್ ಇನ್", signin_hint: "ಡೆಮೊ ಅಡ್ಮಿನ್: admin@deepu.local / Demo@12345.", signin_fail: "ತಪ್ಪಾದ ಬಳಕೆದಾರ ಹೆಸರು ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್.",
  wa_text: "ನಮಸ್ಕಾರ ದೀಪು ಎಂಟರ್‌ಪ್ರೈಸಸ್, ನಿಮ್ಮ ಆನ್‌ಲೈನ್ ಕ್ಯಾಟಲಾಗ್ ನೋಡಿದೆ. ಸಗಟು ಬೆಲೆಗಳ ಬಗ್ಗೆ ವಿಚಾರಿಸಲು ಬಯಸುತ್ತೇನೆ.",

  btn_place_order: "🛍️ ಖರೀದಿಸಿ (ಆರ್ಡರ್ ಮಾಡಿ)",
  btn_quote_req: "📄 ಸಗಟು ಕೋಟ್ ವಿನಂತಿಸಿ",
  order_summary_lbl: "ಆರ್ಡರ್ ಸಾರಾಂಶ",
  total_units: "ಒಟ್ಟು ಪ್ರಮಾಣ",
  grand_total: "ಒಟ್ಟು ಮೊತ್ತ",
  f_delivery_addr: "ವಿತರಣಾ ವಿಳಾಸ",
  f_city_town: "ನಗರ / ಪಟ್ಟಣ",
  order_success_title: "ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಕೆಯಾಗಿದೆ!",
  order_success_desc: "ನಿಮ್ಮ ಖರೀದಿ ಆರ್ಡರ್ ದಾಖಲಾಗಿದೆ ಮತ್ತು ದೀಪು ಎಂಟರ್‌ಪ್ರೈಸಸ್‌ಗೆ ತಲುಪಿದೆ. ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ: Pending.",
  order_id_lbl: "ಆರ್ಡರ್ ಸಂಖ್ಯೆ",
  order_status_lbl: "ಸ್ಥಿತಿ",
  copy_order_id: "ಆರ್ಡರ್ ಸಂಖ್ಯೆ ನಕಲಿಸಿ",
  order_id_copied: "ಆರ್ಡರ್ ಸಂಖ್ಯೆ ನಕಲಿಸಲಾಗಿದೆ!",
  btn_track_this: "🔍 ಈ ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
  btn_continue_shop: "ಶಾಪಿಂಗ್ ಮುಂದುವರಿಸಿ",
  track_title: "ನಿಮ್ಮ ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
  track_desc: "ಲೈವ್ ಆರ್ಡರ್ ಸ್ಥಿತಿ ತಿಳಿಯಲು ಆರ್ಡರ್ ಸಂಖ್ಯೆ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
  track_ph: "ಆರ್ಡರ್ ಸಂಖ್ಯೆ ಅಥವಾ ಮೊಬೈಲ್ ನಮೂದಿಸಿ…",
  btn_check_status: "ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ",
  order_not_found: "ಯಾವುದೇ ಆರ್ಡರ್ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಆರ್ಡರ್ ಸಂಖ್ಯೆ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
  track_lookup_link: "🔍 ಈಗಾಗಲೇ ಆರ್ಡರ್ ಮಾಡಿದಿರಾ? ಇಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
  status_pending: "ಬಾಕಿ ಇದೆ (Pending)",
  status_confirmed: "ಖಚಿತಪಡಿಸಲಾಗಿದೆ",
  status_shipped: "ರವಾನಿಸಲಾಗಿದೆ",
  status_delivered: "ವಿತರಿಸಲಾಗಿದೆ",
  status_cancelled: "ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ"
 }
};

let LANG = "en";
try { LANG = localStorage.getItem("deepu_lang") === "kn" ? "kn" : "en"; } catch (e) {}
const tr = k => (TX[LANG] && TX[LANG][k]) || TX.en[k] || k;

/* ---------- Helpers & State ---------- */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function productImageSrc(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("data:image/") || raw.startsWith("blob:") || raw.startsWith("assets/") || raw.startsWith("./") || raw.startsWith("/") || raw.startsWith("../")) {
    return raw;
  }
  try {
    const candidate = raw.startsWith("//") ? "https:" + raw : (/^https?:\/\//i.test(raw) ? raw : "https://" + raw);
    const url = new URL(candidate);
    if (!/^https?:$/.test(url.protocol)) return raw;
    const host = url.hostname.toLowerCase();
    if ((host === "google.com" || host === "www.google.com") && url.pathname === "/imgres") {
      const target = url.searchParams.get("imgurl");
      if (target) return productImageSrc(target);
    }
    if ((host === "google.com" || host === "www.google.com") && url.pathname === "/url") {
      const target = url.searchParams.get("url") || url.searchParams.get("q");
      if (target && /^https?:\/\//i.test(target)) return productImageSrc(target);
    }
    if (host === "drive.google.com" || host.endsWith(".drive.google.com") || host === "docs.google.com") {
      const match = url.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/);
      const id = (match && match[1]) || url.searchParams.get("id");
      if (id) return "https://drive.google.com/uc?export=view&id=" + encodeURIComponent(id);
    }
    return url.href;
  } catch (_) { return raw; }
}

function productImageMarkup(value, alt = "Product image", className = "") {
  const src = productImageSrc(value);
  if (!src) return `<span class="product-image-fallback ${className}" role="img" aria-label="No product image">DE</span>`;
  return `<img class="${className}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" onerror="this.onerror=null;this.replaceWith(Object.assign(document.createElement('span'),{className:'product-image-fallback ${className}',textContent:'DE'}))">`;
}
const inr = n => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const LOCATIONS = ["Channarayapatna", "Hassan City", "Holenarasipura", "Arsikere", "Belur", "Sakleshpur", "Arkalgud", "Alur"];

let db = LocalDB.load();
let cart = [];
try { cart = JSON.parse(localStorage.getItem("deepu_cart") || "[]"); if (!Array.isArray(cart)) cart = []; } catch (e) { cart = []; }
const view = { q: "", cat: "", brand: "", rack: "", showAll: false };

function reload() { db = LocalDB.load(); }
function shop() {
  let s = db.settings || {};
  if (Array.isArray(s)) s = Object.fromEntries(s.map(r => [r.setting_key, r.setting_value]));
  return s;
}

function getAppsScriptUrl() {
  const s = shop();
  return (s.APPS_SCRIPT_URL && s.APPS_SCRIPT_URL.trim()) || DEFAULT_APPS_SCRIPT_URL;
}

const activeProducts = () => (db.products || []).filter(p => p.is_active != 0 && p.is_active !== "0");
const pName = p => (LANG === "kn" && p.name_kn) ? p.name_kn : p.name;
const catOf = id => (db.categories || []).find(c => c.category_id === id);
const catName = c => c ? ((LANG === "kn" && c.name_kn) ? c.name_kn : c.name) : "";
const rackOf = id => (db.racks || []).find(r => r.rack_id === id);
const rackName = r => (LANG === "kn" && r.name_kn) ? r.name_kn : r.name;
const brandList = () => {
  const map = new Map();
  (db.brands || []).forEach(b => map.set(b.name, { id: b.brand_id, name: b.name }));
  activeProducts().forEach(p => { if (p.brand_name && !map.has(p.brand_name)) map.set(p.brand_name, { id: p.brand_id, name: p.brand_name }); });
  return [...map.values()];
};

function stockState(p) {
  const q = Number(p.stock_quantity || 0), min = Number(p.min_stock_level || 0);
  if (q <= 0) return { cls: "out", label: tr("out_stock"), ok: false };
  if (q <= min) return { cls: "low", label: tr("low_stock"), ok: true };
  return { cls: "", label: tr("in_stock"), ok: true };
}

function notify(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

function persistCart() {
  try { localStorage.setItem("deepu_cart", JSON.stringify(cart)); } catch (e) {}
  const countEl = $("#cartCount");
  const n = cart.reduce((a, x) => a + x.qty, 0);
  if (countEl) countEl.textContent = n > 0 ? n : "";
  const eb = $(".btn-enquiry"); if (eb) eb.classList.toggle("on", n > 0);
}

/* ---------- Static text & shop details ---------- */
function applyStatic() {
  document.documentElement.lang = LANG;
  $$("[data-i18n]").forEach(el => { el.textContent = tr(el.dataset.i18n); });
  $$("[data-i18n-html]").forEach(el => { el.innerHTML = tr(el.dataset.i18nHtml); });
  $$("[data-i18n-ph]").forEach(el => { el.placeholder = tr(el.dataset.i18nPh); });
  const langBtn = $("#langToggle");
  const langLbl = $("#langToggle .lang-label"); if (langLbl) langLbl.textContent = LANG === "en" ? "ಕನ್ನಡ" : "English";

  const s = shop();
  const set = (k, v) => $$(`[data-shop="${k}"]`).forEach(el => { el.textContent = v; });
  set("phone", s.SHOP_PHONE || "—");
  set("address", s.SHOP_ADDRESS || "Channarayapatna, Hassan District, Karnataka");
  set("name_upper", (s.SHOP_NAME || "Deepu Enterprises").toUpperCase());
  set("tagline_upper", (s.SHOP_TAGLINE || "Electrical & Electronics").toUpperCase());
  
  const digits = String(s.SHOP_PHONE || "").replace(/[^0-9]/g, "").slice(0, 12);
  const wa = digits.length >= 10 ? (digits.length === 10 ? "91" + digits : digits) : "";
  const waLink = $("#whatsappLink");
  if (waLink) waLink.href = `https://wa.me/${wa}?text=` + encodeURIComponent(tr("wa_text"));
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- Stats, racks, filters ---------- */
function renderStats() {
  const prods = activeProducts();
  const pEl = $("#statProducts"), bEl = $("#statBrands"), sEl = $("#statSections");
  if (pEl) pEl.textContent = prods.length;
  if (bEl) bEl.textContent = new Set(prods.map(p => p.brand_name).filter(Boolean)).size;
  if (sEl) sEl.textContent = new Set(prods.map(p => p.rack_id).filter(Boolean)).size;
}

function renderRacks() {
  const prods = activeProducts();
  const tiles = (db.racks || []).map(r => ({ r, n: prods.filter(p => p.rack_id === r.rack_id).length })).filter(x => x.n > 0);
  const el = $("#rackGrid");
  if (!el) return;
  el.innerHTML = tiles.map(({ r, n }) =>
    `<button class="rack-tile ${view.rack === r.rack_id ? "active" : ""}" data-rack="${esc(r.rack_id)}"><span class="rack-id">${esc(r.rack_id)}</span><span class="rack-icon">${esc(r.icon || "📦")}</span><b>${esc(rackName(r))}</b><small>${n} ${tr("items")}</small></button>`
  ).join("") || `<p class="empty-note">${tr("no_products")}</p>`;
}

function renderFilters() {
  const cats = (db.categories || []).filter(c => activeProducts().some(p => p.category_id === c.category_id));
  const catFilter = $("#categoryFilter"), brandFilter = $("#brandFilter");
  if (catFilter) {
    catFilter.innerHTML = `<option value="">${tr("all_categories")}</option>` + cats.map(c => `<option value="${esc(c.category_id)}">${esc(catName(c))}</option>`).join("");
    catFilter.value = view.cat;
  }
  if (brandFilter) {
    brandFilter.innerHTML = `<option value="">${tr("all_brands")}</option>` + brandList().map(b => `<option value="${esc(b.name)}">${esc(b.name)}</option>`).join("");
    brandFilter.value = view.brand;
  }
  const pillsEl = $("#categoryPills");
  if (pillsEl) {
    pillsEl.innerHTML = `<button class="pill ${view.cat ? "" : "active"}" data-cat="">${tr("all")}</button>` +
      cats.map(c => `<button class="pill ${view.cat === c.category_id ? "active" : ""}" data-cat="${esc(c.category_id)}">${esc(catName(c))}</button>`).join("");
  }
  const searchEl = $("#productSearch");
  if (searchEl) searchEl.value = view.q;
}

/* ---------- Catalog ---------- */
function filteredProducts() {
  let list = activeProducts();
  if (view.cat) list = list.filter(p => p.category_id === view.cat);
  if (view.brand) list = list.filter(p => p.brand_name === view.brand);
  if (view.rack) list = list.filter(p => p.rack_id === view.rack);
  if (view.q.trim()) list = SearchEngine.search(list, view.q, 500);
  return list;
}

function productCard(p) {
  const st = stockState(p);
  const initials = esc(p.name.split(" ").slice(0, 2).map(x => x[0]).join(""));
  const img = productImageMarkup(p.image_url, pName(p), "catalog-product-image");
  const stockQty = Number(p.stock_quantity || 0);
  const stockText = stockQty > 0 ? `${st.label} (${stockQty})` : st.label;

  return `<article class="product-card">
    <div class="product-visual">
      <div class="product-symbol">${initials}</div>
      ${img}
      <span class="stock-tag ${st.cls}">${esc(stockText)}</span>
    </div>
    <div class="product-body">
      <span class="product-brand">${esc(p.brand_name || "")}</span>
      <h3>${esc(pName(p))}</h3>
      <div class="price-row"><span class="price">${inr(p.selling_price)}</span><small>${tr("per")} ${esc(p.unit || "Piece")}</small></div>
      <div class="wholesale-note">${tr("wholesale_note")}</div>
      <div class="product-meta">
        <small>${esc(p.sku || "")}</small>
        <button ${st.ok ? "" : "disabled"} onclick="addToCart('${esc(p.product_id)}')">${st.ok ? tr("add_inquiry") : tr("unavailable")}</button>
      </div>
    </div>
  </article>`;
}

function renderCatalog() {
  const list = filteredProducts(), shown = view.showAll ? list : list.slice(0, 8);
  const pGrid = $("#productGrid");
  if (pGrid) pGrid.innerHTML = shown.map(productCard).join("") || `<p class="empty-note">${tr("no_products")}</p>`;
  const showMore = $("#showMore");
  if (showMore) {
    showMore.hidden = list.length <= 8;
    showMore.textContent = view.showAll ? tr("show_fewer") : tr("show_all");
  }
  const af = $("#activeFilter");
  if (af) {
    const parts = [];
    if (view.rack) { const r = rackOf(view.rack); parts.push((r ? rackName(r) : view.rack)); }
    if (view.brand) parts.push(view.brand);
    af.hidden = !parts.length;
    af.innerHTML = parts.length ? `${tr("filtering")}: <b>${esc(parts.join(" · "))}</b> <button data-clear>${tr("clear")}</button>` : "";
  }
}

function renderBrands() {
  const prods = activeProducts();
  const el = $("#brandGrid");
  if (!el) return;
  el.innerHTML = brandList().map(b => {
    const n = prods.filter(p => p.brand_name === b.name).length;
    return `<div class="brand-card" data-brand="${esc(b.name)}"><div class="brand-monogram">${esc(b.name.slice(0, 2).toUpperCase())}</div><div><b>${esc(b.name)}</b><small>${esc(b.description || "")}</small></div><span class="count">${n} ${tr("items")}</span></div>`;
  }).join("");
}

function renderRoutes() {
  const el = $("#routeList");
  if (el) el.innerHTML = LOCATIONS.map(x => `<div class="route-place">${esc(x)}</div>`).join("");
}

function renderAll() {
  renderStats();
  renderRacks();
  renderFilters();
  renderCatalog();
  renderBrands();
  renderRoutes();
  persistCart();
}

/* ---------- Search flyout in hero ---------- */
function heroSuggest() {
  const q = $("#heroSearch").value, box = $("#heroSuggest");
  if (!q.trim()) { box.classList.remove("open"); return; }
  const res = SearchEngine.search(activeProducts(), q, 6);
  box.innerHTML = res.map(p => `<button data-pick="${esc(p.product_id)}">${productImageMarkup(p.image_url, pName(p), "suggestion-product-image")}<span><b>${esc(pName(p))}</b><small>${esc(p.brand_name || "")} · ${esc(p.sku || "")}</small></span><span class="price">${inr(p.selling_price)}</span></button>`).join("") || `<div style="padding:14px;font-size:12px;color:var(--muted)">${tr("no_products")}</div>`;
  box.classList.add("open");
}

/* ---------- Modal controls ---------- */
function openModal(html) {
  const c = $("#modalContent"), b = $("#modalBackdrop");
  if (c && b) {
    c.innerHTML = html;
    b.classList.add("open");
  }
}
function closeModal() {
  const b = $("#modalBackdrop");
  if (b) b.classList.remove("open");
}

/* ---------- Shopping Cart & Purchase Flow ---------- */
function addToCart(id) {
  const p = activeProducts().find(x => x.product_id === id);
  if (!p) return;
  const currentStock = Number(p.stock_quantity || 0);
  const it = cart.find(x => x.id === id);
  if (it) {
    if (it.qty >= currentStock) {
      notify(`Only ${currentStock} units available in stock.`);
      return;
    }
    it.qty++;
  } else {
    if (currentStock <= 0) {
      notify(tr("unavailable"));
      return;
    }
    cart.push({ id, qty: 1 });
  }
  persistCart();
  notify(tr("added"));
}

function updateCartQty(id, delta) {
  const it = cart.find(x => x.id === id);
  if (!it) return;
  const p = (db.products || []).find(y => y.product_id === id);
  const maxStock = p ? Number(p.stock_quantity || 9999) : 9999;
  
  const newQty = it.qty + delta;
  if (newQty <= 0) {
    cart = cart.filter(x => x.id !== id);
  } else if (newQty > maxStock) {
    notify(`Maximum available stock is ${maxStock}.`);
    it.qty = maxStock;
  } else {
    it.qty = newQty;
  }
  persistCart();
  inquiryModal();
}

function setCartQtyDirect(id, val) {
  const it = cart.find(x => x.id === id);
  if (!it) return;
  const p = (db.products || []).find(y => y.product_id === id);
  const maxStock = p ? Number(p.stock_quantity || 9999) : 9999;
  let q = parseInt(val, 10);
  if (isNaN(q) || q <= 0) {
    cart = cart.filter(x => x.id !== id);
  } else {
    it.qty = Math.min(q, maxStock);
  }
  persistCart();
  inquiryModal();
}

function removeFromCart(id) {
  cart = cart.filter(x => x.id !== id);
  persistCart();
  inquiryModal();
}

function inquiryModal() {
  if (!cart.length) {
    openModal(`
      <h2>${tr("inq_title")}</h2>
      <div class="cart-empty-state">
        <span class="empty-icon">🛒</span>
        <p>${tr("inq_empty")}</p>
        <div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="closeModal();location.hash='#catalog'">${tr("explore")}</button>
          <button class="btn btn-outline" onclick="openTrackOrderModal()">${tr("nav_track_order")}</button>
        </div>
      </div>
    `);
    return;
  }

  let totalUnits = 0;
  let grandTotal = 0;

  const rows = cart.map(x => {
    const p = (db.products || []).find(y => y.product_id === x.id);
    if (!p) return "";
    const price = Number(p.selling_price || 0);
    const lineTotal = price * x.qty;
    totalUnits += x.qty;
    grandTotal += lineTotal;

    return `
      <div class="cart-item-row">
        <div class="cart-item-info">
          <b>${esc(pName(p))}</b>
          <small>${esc(p.sku)} · ${inr(price)} / ${esc(p.unit || "pc")}</small>
        </div>
        <div class="qty-stepper">
          <button class="qty-btn" type="button" onclick="updateCartQty('${esc(p.product_id)}', -1)">−</button>
          <input class="qty-val" type="number" min="1" value="${x.qty}" onchange="setCartQtyDirect('${esc(p.product_id)}', this.value)">
          <button class="qty-btn" type="button" onclick="updateCartQty('${esc(p.product_id)}', 1)">+</button>
        </div>
        <div class="cart-item-price">${inr(lineTotal)}</div>
        <button class="btn-del-item" type="button" title="Remove" onclick="removeFromCart('${esc(p.product_id)}')">×</button>
      </div>
    `;
  }).join("");

  openModal(`
    <h2>${tr("inq_title")}</h2>
    <p>${tr("inq_intro")}</p>
    
    <div class="cart-list">
      ${rows}
    </div>

    <div class="cart-summary-box">
      <div class="cart-summary-row">
        <span>${tr("total_units")}</span>
        <b>${totalUnits} items</b>
      </div>
      <div class="cart-summary-row total">
        <span>${tr("grand_total")}</span>
        <b>${inr(grandTotal)}</b>
      </div>
    </div>

    <form id="purchaseForm" class="modal-form" onsubmit="submitPurchase(event)">
      <label>
        <span>${tr("f_name")} *</span>
        <input name="name" required placeholder="Enter your full name">
      </label>
      <label>
        <span>${tr("f_mobile")} *</span>
        <input name="phone" required pattern="[6-9][0-9]{9}" placeholder="${tr("ph_mobile")}">
      </label>
      <label class="full">
        <span>${tr("f_delivery_addr")} *</span>
        <input name="address" required placeholder="Shop No, Building, Street, Landmark">
      </label>
      <label>
        <span>${tr("f_city_town")} *</span>
        <input name="city" required value="Channarayapatna">
      </label>
      <label>
        <span>${tr("q_business")}</span>
        <input name="businessName" placeholder="Electrician / Shop / Home">
      </label>
      <label class="full">
        <span>${tr("f_order_notes")}</span>
        <textarea name="notes" rows="2" placeholder="Delivery time preference, WhatsApp invoice request, etc."></textarea>
      </label>

      <button type="submit" class="btn btn-primary full" style="font-size:15px;padding:12px;">
        ${tr("btn_place_order")} (${inr(grandTotal)})
      </button>

      <button type="button" class="btn btn-outline full" style="margin-top:6px;" onclick="submitWholesaleQuote()">
        ${tr("btn_quote_req")}
      </button>
    </form>

    <div style="text-align:center;margin-top:14px;">
      <a href="javascript:void(0)" onclick="openTrackOrderModal()" style="font-size:12px;color:var(--de-green-dark);font-weight:600;text-decoration:underline;">
        ${tr("track_lookup_link")}
      </a>
    </div>
  `);
}

/* ---------- Purchase Order Execution (Two-Way Sync Source of Truth) ---------- */
async function submitPurchase(ev) {
  ev.preventDefault();
  if (!cart.length) {
    notify(tr("inq_empty"));
    return;
  }

  const form = ev.target;
  const f = Object.fromEntries(new FormData(form));

  const phone = (f.phone || "").trim();
  if (!/^[6-9]\d{9}$/.test(phone)) {
    notify("Please provide a valid 10-digit Indian mobile number.");
    return;
  }

  // Generate unique Order ID
  const orderId = "ORD-" + Date.now().toString(36).toUpperCase();

  // Prepare items breakdown
  let totalUnits = 0;
  let grandTotal = 0;
  const itemsList = cart.map(x => {
    const p = (db.products || []).find(y => y.product_id === x.id) || {};
    const price = Number(p.selling_price || 0);
    const lineTotal = price * x.qty;
    totalUnits += x.qty;
    grandTotal += lineTotal;
    return {
      product_id: x.id,
      name: p.name || x.id,
      sku: p.sku || "",
      unit_price: price,
      quantity: x.qty,
      line_total: lineTotal
    };
  });

  const itemsSummary = itemsList.map(it => `${it.name} (x${it.quantity})`).join(", ");
  const deliveryAddress = (f.address.trim() + (f.city ? ", " + f.city.trim() : "")).trim();
  const orderDate = new Date().toISOString();

  const newOrder = {
    order_id: orderId,
    customer_name: f.name.trim(),
    customer_phone: phone,
    customer_address: deliveryAddress,
    purchased_items: itemsSummary,
    quantity: totalUnits,
    total_price: grandTotal,
    order_date: orderDate,
    status: "Pending",
    items_json: JSON.stringify(itemsList),
    items: itemsList,
    business_name: f.businessName ? f.businessName.trim() : "",
    notes: f.notes ? f.notes.trim() : ""
  };

  // 1. Update LocalDB and decrement stock immediately (instant UI feedback)
  const currentDb = LocalDB.load();
  currentDb.orders = currentDb.orders || [];
  currentDb.orders.unshift(newOrder);

  // Create corresponding sale record so Admin Dashboard Transactions & Reports update immediately
  const newSale = {
    sale_id: orderId,
    invoice_no: orderId,
    customer_name: f.name.trim(),
    customer_phone: phone,
    subtotal: grandTotal,
    discount_amount: 0,
    tax_amount: 0,
    grand_total: grandTotal,
    paid_amount: grandTotal,
    balance_amount: 0,
    payment_mode: "Online / Cash on Delivery",
    status: "Completed",
    items: itemsList,
    items_count: itemsList.length,
    total_quantity: totalUnits,
    created_at: new Date().toISOString(),
    shop_info: currentDb.settings
  };
  currentDb.sales = currentDb.sales || [];
  currentDb.sales.unshift(newSale);

  currentDb.movements = currentDb.movements || [];

  // Decrement product stock in local store and record movements
  itemsList.forEach(item => {
    const p = (currentDb.products || []).find(x => x.product_id === item.product_id);
    if (p) {
      const prev = Number(p.stock_quantity || 0);
      p.stock_quantity = Math.max(0, prev - Number(item.quantity || 0));
      currentDb.movements.unshift({
        movement_id: "MOV-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
        product_name: item.name,
        sku: item.sku || "",
        movement_type: "Sale",
        quantity: -item.quantity,
        previous_stock: prev,
        new_stock: p.stock_quantity,
        reference_id: orderId,
        reason: `Online order from ${f.name.trim()}`,
        performed_by: "Customer Web Order",
        created_at: new Date().toLocaleString()
      });
    }
  });

  LocalDB.save(currentDb);
  db = currentDb;

  try {
    localStorage.setItem("deepu_sync_heartbeat", String(Date.now()));
    if (window.__deepu_bus) {
      window.__deepu_bus.postMessage({ type: "USER_ACTIVITY", action: "order", order: newOrder, sale: newSale });
    }
  } catch (e) {}

  // 2. Remember customer's last order ID for easy tracking
  try {
    localStorage.setItem("deepu_last_order_id", orderId);
    let myOrders = JSON.parse(localStorage.getItem("deepu_my_orders") || "[]");
    myOrders.unshift(newOrder);
    localStorage.setItem("deepu_my_orders", JSON.stringify(myOrders));
  } catch (e) {}

  // 3. Clear cart
  cart = [];
  persistCart();

  // 4. Send order to Google Apps Script backend (Google Sheets database)
  const scriptUrl = getAppsScriptUrl();
  if (scriptUrl) {
    try {
      fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "createOrder",
          order: newOrder
        })
      }).then(r => r.json()).then(res => {
        console.log("Order saved to Google Sheets backend:", res);
      }).catch(err => {
        console.warn("Apps Script remote order sync:", err);
      });
    } catch (e) {
      console.warn("Could not dispatch remote order fetch:", e);
    }
  }

  // 5. Re-render catalog to show decremented stock levels live
  renderAll();

  // 6. Show Order Confirmation Screen
  showOrderConfirmation(newOrder);
}

function showOrderConfirmation(order) {
  openModal(`
    <div class="order-confirm-card">
      <div class="order-success-icon">✓</div>
      <h2>${tr("order_success_title")}</h2>
      <p>${tr("order_success_desc")}</p>

      <div class="order-id-badge">
        <span>${tr("order_id_lbl")}: <b>${esc(order.order_id)}</b></span>
        <button type="button" onclick="navigator.clipboard.writeText('${esc(order.order_id)}');notify('${tr("order_id_copied")}');">${tr("copy_order_id")}</button>
      </div>

      <div class="order-detail-meta">
        <div><strong>${tr("order_status_lbl")}:</strong> <span class="status-pill pending">${tr("status_pending")}</span></div>
        <div><strong>${tr("grand_total")}:</strong> <span style="color:var(--de-green-dark);font-weight:800;">${inr(order.total_price)}</span></div>
        <div><strong>${tr("items")}:</strong> ${esc(order.purchased_items)}</div>
        <div><strong>${tr("f_delivery_addr")}:</strong> ${esc(order.customer_address)}</div>
      </div>

      <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="openTrackOrderModal('${esc(order.order_id)}')">${tr("btn_track_this")}</button>
        <button class="btn btn-outline" onclick="closeModal()">${tr("btn_continue_shop")}</button>
      </div>
    </div>
  `);
}

/* ---------- Wholesale Quote flow (Secondary CTA) ---------- */
async function submitWholesaleQuote() {
  const form = $("#purchaseForm");
  if (!form) return;
  const f = Object.fromEntries(new FormData(form));
  if (!f.name || !f.phone) {
    notify("Please fill in your Name and Mobile Number first.");
    return;
  }
  await saveEnquiry({
    type: "Quote",
    name: f.name,
    business_name: f.businessName || "",
    phone: f.phone,
    email: f.email || "",
    subject: "Wholesale Quote Request",
    message: (f.notes || "") + (f.city ? " [City: " + f.city + "]" : ""),
    items: cart.map(x => {
      const p = (db.products || []).find(y => y.product_id === x.id) || {};
      return { product_id: x.id, name: p.name, sku: p.sku, qty: x.qty };
    })
  });
  cart = [];
  persistCart();
  closeModal();
  notify(tr("quote_ok"));
}

/* ---------- Live Order Tracking Modal ---------- */
async function openTrackOrderModal(initialOrderId) {
  let defaultQuery = initialOrderId || "";
  if (!defaultQuery) {
    try { defaultQuery = localStorage.getItem("deepu_last_order_id") || ""; } catch (e) {}
  }

  const renderTrackUI = (order = null, searched = false, query = defaultQuery) => {
    let resultHtml = "";
    if (searched && !order) {
      resultHtml = `<div class="empty-note" style="background:#fff1f2;color:#9f1239;border-radius:8px;margin-top:14px;padding:16px;">${tr("order_not_found")}</div>`;
    } else if (order) {
      const st = String(order.status || "Pending").toLowerCase();
      let stepNum = 1;
      if (st === "confirmed") stepNum = 2;
      else if (st === "shipped") stepNum = 3;
      else if (st === "delivered") stepNum = 4;
      else if (st === "cancelled") stepNum = 0;

      const pillClass = ["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(st) ? st : "pending";
      const statusLabel = tr("status_" + pillClass) || order.status;

      resultHtml = `
        <div class="order-detail-meta" style="margin-top:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div>
              <b style="font-size:15px;color:var(--de-navy);">${esc(order.order_id)}</b>
              <small style="display:block;color:var(--de-muted);">${new Date(order.order_date || order.created_at || Date.now()).toLocaleString()}</small>
            </div>
            <span class="status-pill ${pillClass}">${esc(statusLabel)}</span>
          </div>

          <!-- Live Step Progress Bar -->
          <div class="track-timeline">
            <div class="timeline-step ${stepNum >= 1 ? "done" : "active"}">
              <span class="timeline-dot">${stepNum > 1 ? "✓" : "1"}</span>
              <span class="timeline-label">Pending</span>
            </div>
            <div class="timeline-step ${stepNum >= 2 ? "done" : (stepNum === 1 ? "" : "active")}">
              <span class="timeline-dot">${stepNum > 2 ? "✓" : "2"}</span>
              <span class="timeline-label">Confirmed</span>
            </div>
            <div class="timeline-step ${stepNum >= 3 ? "done" : (stepNum === 2 ? "" : "active")}">
              <span class="timeline-dot">${stepNum > 3 ? "✓" : "3"}</span>
              <span class="timeline-label">Shipped</span>
            </div>
            <div class="timeline-step ${stepNum >= 4 ? "done" : (stepNum === 3 ? "" : "active")}">
              <span class="timeline-dot">${stepNum >= 4 ? "✓" : "4"}</span>
              <span class="timeline-label">Delivered</span>
            </div>
          </div>

          <div style="margin-top:12px;font-size:12px;border-top:1px solid #e2e8f0;padding-top:10px;">
            <div><strong>${tr("f_name")}:</strong> ${esc(order.customer_name)} (${esc(order.customer_phone)})</div>
            <div><strong>${tr("f_delivery_addr")}:</strong> ${esc(order.customer_address || "—")}</div>
            <div style="margin-top:6px;"><strong>${tr("items")}:</strong> ${esc(order.purchased_items || "—")}</div>
            <div style="margin-top:4px;"><strong>${tr("grand_total")}:</strong> <b style="color:var(--de-green-dark);font-size:14px;">${inr(order.total_price)}</b></div>
          </div>

          <div style="text-align:right;margin-top:10px;">
            <button class="table-action" onclick="refreshOrderStatus('${esc(order.order_id)}')">↻ Refresh Live Status</button>
          </div>
        </div>
      `;
    }

    openModal(`
      <h2>${tr("track_title")}</h2>
      <p>${tr("track_desc")}</p>
      
      <div class="track-search-box">
        <input id="trackQueryInput" type="text" placeholder="${tr("track_ph")}" value="${esc(query)}">
        <button class="btn btn-primary" onclick="executeOrderTrack()">${tr("btn_check_status")}</button>
      </div>

      <div id="trackResultContainer">
        ${resultHtml}
      </div>
    `);

    const inp = $("#trackQueryInput");
    if (inp) {
      inp.addEventListener("keydown", e => { if (e.key === "Enter") executeOrderTrack(); });
    }
  };

  // If a query exists, run lookup
  if (defaultQuery) {
    const match = findOrderLocalOrMemory(defaultQuery);
    renderTrackUI(match, true, defaultQuery);
    if (!match) {
      // Try background remote query
      fetchRemoteOrderStatus(defaultQuery).then(remoteOrder => {
        if (remoteOrder) renderTrackUI(remoteOrder, true, defaultQuery);
      });
    }
  } else {
    renderTrackUI();
  }
}

function findOrderLocalOrMemory(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return null;
  const digits = q.replace(/\D/g, "");
  const orders = db.orders || [];

  return orders.find(o => {
    const id = String(o.order_id || "").toLowerCase();
    const phone = String(o.customer_phone || "").replace(/\D/g, "");
    return id === q || (digits.length >= 10 && phone.includes(digits));
  }) || null;
}

async function fetchRemoteOrderStatus(query) {
  const url = getAppsScriptUrl();
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "getOrderStatus", order_id: query })
    });
    const json = await res.json();
    if (json && json.status === "success" && json.data) {
      // Sync into local DB
      const currentDb = LocalDB.load();
      currentDb.orders = currentDb.orders || [];
      const idx = currentDb.orders.findIndex(x => x.order_id === json.data.order_id);
      if (idx >= 0) currentDb.orders[idx] = json.data;
      else currentDb.orders.unshift(json.data);
      LocalDB.save(currentDb);
      db = currentDb;
      return json.data;
    }
  } catch (e) {
    console.debug("Remote order query:", e);
  }
  return null;
}

async function executeOrderTrack() {
  const inp = $("#trackQueryInput");
  if (!inp) return;
  const q = inp.value.trim();
  if (!q) {
    notify("Please enter an Order ID or phone number.");
    return;
  }
  
  // 1. Check local DB
  let order = findOrderLocalOrMemory(q);
  if (order) {
    openTrackOrderModal(order.order_id);
    return;
  }

  // 2. Query Google Apps Script directly
  notify("Checking live status…");
  const remote = await fetchRemoteOrderStatus(q);
  if (remote) {
    openTrackOrderModal(remote.order_id);
  } else {
    const resBox = $("#trackResultContainer");
    if (resBox) {
      resBox.innerHTML = `<div class="empty-note" style="background:#fff1f2;color:#9f1239;border-radius:8px;margin-top:14px;padding:16px;">${tr("order_not_found")}</div>`;
    }
  }
}

async function refreshOrderStatus(orderId) {
  notify("Refreshing status…");
  const remote = await fetchRemoteOrderStatus(orderId);
  if (remote) {
    notify("Status updated!");
    openTrackOrderModal(orderId);
  } else {
    notify("Status refreshed.");
    openTrackOrderModal(orderId);
  }
}

/* ---------- Saving Enquiries (Contact & Dealer) ---------- */
async function saveEnquiry(e) {
  e.enquiry_id = "ENQ-" + Date.now().toString(36).toUpperCase();
  e.status = "New";
  e.created_at = new Date().toISOString();
  const d = LocalDB.load();
  d.enquiries = d.enquiries || [];
  d.enquiries.unshift(e);
  LocalDB.save(d);

  try {
    localStorage.setItem("deepu_sync_heartbeat", String(Date.now()));
    if (window.__deepu_bus) {
      window.__deepu_bus.postMessage({ type: "USER_ACTIVITY", action: "enquiry", enquiry: e });
    }
  } catch (_) {}

  const url = getAppsScriptUrl();
  if (url) {
    try {
      await fetch(url.trim(), {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "submitEnquiry", enquiry: { ...e, items_json: JSON.stringify(e.items || []) } })
      });
    } catch (err) {
      console.warn("Remote enquiry sync failed; saved locally", err);
    }
  }
  reload();
}

function bindForms() {
  const dealerForm = $("#dealerForm");
  if (dealerForm) {
    dealerForm.addEventListener("submit", async e => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      await saveEnquiry({
        type: "Dealer",
        name: f.contactName,
        business_name: f.businessName,
        phone: f.phone,
        email: f.email || "",
        city: f.city,
        gstin: f.gstin || "",
        address: f.address,
        subject: "Dealer application",
        message: "Products of interest: " + (f.interest || "—")
      });
      const msg = $("#dealerMessage");
      if (msg) msg.textContent = tr("dealer_ok");
      e.target.reset();
    });
  }

  const contactForm = $("#contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async e => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      await saveEnquiry({
        type: "Contact",
        name: f.name,
        phone: f.phone,
        email: f.email || "",
        subject: f.type,
        message: f.message
      });
      const msg = $("#contactMessage");
      if (msg) msg.textContent = tr("contact_ok");
      e.target.reset();
    });
  }
}

/* ---------- Admin Login Gate ---------- */
function showLogin() {
  openModal(`
    <h2>${tr("signin")}</h2>
    <p>${tr("signin_p")}</p>
    <form id="loginForm" class="modal-form">
      <label class="full">${tr("f_user")}<input name="username" required autocomplete="username"></label>
      <label class="full">${tr("f_pass")}<input type="password" name="password" required autocomplete="current-password"></label>
      <button class="btn btn-primary full">${tr("signin_btn")}</button>
    </form>
    <p class="small-muted">${tr("signin_hint")}</p>
  `);
  const form = $("#loginForm");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      if (d.username === DEMO_ADMIN_USER && d.password === DEMO_ADMIN_PASS) {
        try { sessionStorage.setItem("deepu_demo_admin", "1"); } catch (err) {}
        location.href = "../Admin/Frontend/admin.html";
      } else {
        notify(tr("signin_fail"));
      }
    });
  }
}

/* ---------- Remote Catalog Background Sync ---------- */
let isCatalogSyncing = false;
async function syncRemoteCatalog() {
  if (isCatalogSyncing) return;
  const url = getAppsScriptUrl();
  if (!url) return;
  try {
    isCatalogSyncing = true;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "getPublicCatalog" })
    });
    const json = await res.json();
    if (json && json.status === "success" && json.data) {
      const remote = json.data;
      const current = LocalDB.load();
      let changed = false;
      if (Array.isArray(remote.products) && remote.products.length) {
        current.products = remote.products;
        changed = true;
      }
      if (Array.isArray(remote.categories) && remote.categories.length) {
        current.categories = remote.categories;
        changed = true;
      }
      if (Array.isArray(remote.brands) && remote.brands.length) {
        current.brands = remote.brands;
        changed = true;
      }
      if (Array.isArray(remote.racks) && remote.racks.length) {
        current.racks = remote.racks;
        changed = true;
      }
      if (changed) {
        LocalDB.save(current);
        db = current;
        renderAll();
      }
    }
  } catch (err) {
    console.debug("Background catalog sync notice:", err);
  } finally {
    isCatalogSyncing = false;
  }
}

/* ---------- Global Events & Cross-Tab Sync ---------- */
function bindEvents() {
  document.addEventListener("click", e => {
    const v = e.target.closest("[data-view]");
    if (v) {
      if (v.dataset.view === "inquiry") inquiryModal();
      if (v.dataset.view === "admin-login") showLogin();
    }
    const rk = e.target.closest("[data-rack]");
    if (rk) {
      view.rack = view.rack === rk.dataset.rack ? "" : rk.dataset.rack;
      view.showAll = true;
      renderRacks();
      renderCatalog();
      if (view.rack) $("#catalog").scrollIntoView({ behavior: "smooth" });
    }
    const pill = e.target.closest("[data-cat]");
    if (pill) {
      view.cat = pill.dataset.cat;
      renderFilters();
      renderCatalog();
    }
    const br = e.target.closest("[data-brand]");
    if (br) {
      view.brand = br.dataset.brand;
      view.showAll = true;
      renderFilters();
      renderCatalog();
      $("#catalog").scrollIntoView({ behavior: "smooth" });
    }
    if (e.target.closest("[data-clear]")) {
      view.rack = "";
      view.brand = "";
      renderRacks();
      renderFilters();
      renderCatalog();
    }
    const pick = e.target.closest("[data-pick]");
    if (pick) {
      const p = activeProducts().find(x => x.product_id === pick.dataset.pick);
      if (p) {
        view.q = p.sku || p.name;
        view.cat = "";
        view.brand = "";
        view.rack = "";
        renderRacks();
        renderFilters();
        renderCatalog();
        $("#heroSearch").value = "";
        $("#heroSuggest").classList.remove("open");
        $("#catalog").scrollIntoView({ behavior: "smooth" });
      }
    }
    if (!e.target.closest(".hero-search")) {
      const hs = $("#heroSuggest");
      if (hs) hs.classList.remove("open");
    }
  });

  const mClose = $("#modalClose");
  if (mClose) mClose.addEventListener("click", closeModal);
  const mBackdrop = $("#modalBackdrop");
  if (mBackdrop) mBackdrop.addEventListener("click", e => { if (e.target.id === "modalBackdrop") closeModal(); });

  const pSearch = $("#productSearch");
  if (pSearch) pSearch.addEventListener("input", e => { view.q = e.target.value; renderCatalog(); });

  const hSearch = $("#heroSearch");
  if (hSearch) {
    hSearch.addEventListener("input", heroSuggest);
    hSearch.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        view.q = e.target.value;
        renderFilters();
        renderCatalog();
        const hs = $("#heroSuggest");
        if (hs) hs.classList.remove("open");
        $("#catalog").scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  const catFilter = $("#categoryFilter");
  if (catFilter) catFilter.addEventListener("change", e => { view.cat = e.target.value; renderFilters(); renderCatalog(); });
  const brandFilter = $("#brandFilter");
  if (brandFilter) brandFilter.addEventListener("change", e => { view.brand = e.target.value; renderFilters(); renderCatalog(); });

  const showMore = $("#showMore");
  if (showMore) showMore.addEventListener("click", () => { view.showAll = !view.showAll; renderCatalog(); });

  const menuToggle = $("#menuToggle");
  if (menuToggle) menuToggle.addEventListener("click", () => $("#mainNav").classList.toggle("open"));
  $$("#mainNav a").forEach(a => a.addEventListener("click", () => $("#mainNav").classList.remove("open")));

  const langToggle = $("#langToggle");
  if (langToggle) {
    langToggle.addEventListener("click", () => {
      LANG = LANG === "en" ? "kn" : "en";
      try { localStorage.setItem("deepu_lang", LANG); } catch (e) {}
      applyStatic();
      renderAll();
    });
  }

  function handleUserLiveSync() {
    reload();
    applyStatic();
    renderAll();
  }

  // Real-time broadcast channel across tabs
  if ("BroadcastChannel" in window) {
    try {
      const bus = new BroadcastChannel("deepu_sync_bus");
      bus.onmessage = () => {
        handleUserLiveSync();
      };
      window.__deepu_bus = bus;
    } catch (_) {}
  }

  // Cross-tab immediate synchronization (When Admin updates products/orders or status in another tab)
  window.addEventListener("storage", e => {
    if (e.key === "deepu_electrical_v3_kn" || e.key === "deepu_sync_heartbeat" || e.key === "deepu_user_orders" || e.key === "deepu_orders") {
      handleUserLiveSync();
    }
  });

  // Background catalog polling every 5s and on window focus
  setInterval(syncRemoteCatalog, 5000);
  window.addEventListener("focus", syncRemoteCatalog);

  if (location.hash === "#admin-login") {
    history.replaceState(null, "", location.pathname);
    showLogin();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyStatic();
  renderAll();
  bindForms();
  bindEvents();
  // Initial sync attempt
  syncRemoteCatalog();
});
