/* Deepu Enterprises — customer website.
   Reads the SAME data as the admin inventory system (LocalDB key "deepu_electrical_v3_kn"),
   so products, prices, stock, racks, brands and shop details entered in admin appear here.
   Enquiries / quote requests / dealer applications are saved back for admin → "Customer Enquiries". */

const DEMO_ADMIN_USER = "admin@deepu.local";
const DEMO_ADMIN_PASS = "Demo@12345";

/* ---------- Translations (language choice is shared with admin via "deepu_lang") ---------- */
const TX = {
 en: {
  nav_home:"Home",nav_sections:"Shop by Section",nav_catalog:"Catalog",nav_brands:"Brands",nav_about:"About",nav_logistics:"Logistics",nav_dealer:"Become a Dealer",nav_contact:"Contact",my_inquiry:"My Enquiry",
  hero_eyebrow:"YOUR TRUSTED ELECTRICAL & ELECTRONICS PARTNER",hero_title:"Powering businesses.<br><em>Strengthening</em> relationships.",
  hero_text:"Bulbs, wires, switches, MCBs, fans, lighting and more — wholesale and retail supply from one dependable counter.",
  search_ph:"Search product, brand or SKU… (e.g. syska, vayar, ಬಲ್ಬ್)",explore:"Explore Catalog",serving:"Serving Channarayapatna and surrounding regions",float_a:"One partner.",float_b:"Many supply needs.",
  stat_products_u:"Products",stat_products:"In our live catalog",stat_brands_u:"Brands",stat_brands:"Partner brands",stat_sections_u:"Sections",stat_sections:"Organised store racks",
  disclaimer:"Catalog, stock status and prices update live from the shop's inventory system. Wholesale rates are shared on enquiry.",
  sec_kicker:"SHOP BY SECTION",sec_title:"Find it on<br><em>the right rack.</em>",sec_text:"Our store is organised into racks by product type. Pick a section to see what is available.",
  cat_kicker:"PRODUCT CATALOG",cat_title:"Find what your<br><em>business needs.</em>",cat_text:"Browse live products with retail prices and availability. Wholesale prices are shared after enquiry or dealer approval.",
  all_categories:"All categories",all_brands:"All brands",all:"All",show_all:"Show all products",show_fewer:"Show fewer",no_products:"No matching products found.",
  in_stock:"In stock",low_stock:"Limited stock",out_stock:"Out of stock",available:"Available",on_request:"On request",add_inquiry:"+ Add enquiry",unavailable:"Unavailable",
  wholesale_note:"Wholesale rate on enquiry",filtering:"Showing",clear:"Clear filter",per:"per",
  brand_kicker:"BRANDS & SUPPLY PARTNERS",brand_title:"Brands you<br><em>already trust.</em>",brand_text:"Tap a brand to see its products in our catalog.",items:"items",
  about_kicker:"ABOUT DEEPU ENTERPRISES",about_title:"Built on trust.<br><em>Driven by service.</em>",
  about_text:"Deepu Enterprises is an electrical and electronics wholesale and retail supplier based in Channarayapatna, Karnataka. We connect electricians, contractors, retailers and households with dependable products and responsive local support.",
  about_panel_h:"Dependable supply, closer to your business.",about_panel_p:"Our focus is straightforward: genuine branded products, clear communication and dependable distribution support.",
  v1_h:"Genuine brands",v1_p:"Leading electrical brands under one roof.",v2_h:"Wholesale & retail",v2_p:"Competitive rates for bulk and counter buyers.",v3_h:"Local distribution",v3_p:"Coverage planning around Hassan district.",
  log_kicker:"DISTRIBUTION & LOGISTICS",log_title:"Local knowledge.<br><em>Planned delivery.</em>",log_text:"Coverage areas around our Channarayapatna hub. Please confirm delivery days and serviceability with our team.",
  primary_hub:"Primary hub",town_chn:"Channarayapatna",dist_hassan:"Hassan District, Karnataka",log_note:"Coverage list is not a guarantee of daily service or a physical branch at each location.",
  map_cap:"Hassan district coverage overview",map_note:"Illustrative schematic, not a navigational map.",
  dealer_kicker:"GROW WITH DEEPU ENTERPRISES",dealer_title:"Let’s build a stronger<br><em>business relationship.</em>",dealer_text:"Apply to become a retail or sub-dealer partner. Our team can review your details and contact you.",dealer_cta:"Apply for dealership →",
  dealer_form_h:"Dealer application",dealer_form_p:"Submit your shop and contact information.",f_contact:"Contact person",f_business:"Shop / business name",f_mobile:"Mobile number",f_email:"Email",f_gstin:"GSTIN (if registered)",f_city:"City / town",f_address:"Shop address",f_interest:"Products of interest",
  ph_mobile:"10-digit mobile",ph_gstin:"15-character GSTIN",ph_interest:"Bulbs, wires, switches, fans…",consent_dealer:"I agree to be contacted regarding this dealership application.",submit_app:"Submit application",
  contact_kicker:"CONTACT US",contact_title:"Let’s talk<br><em>business.</em>",contact_text:"For product availability, bulk requirements and dealership enquiries, contact the team.",
  c_phone:"PHONE",c_email:"OFFICIAL EMAIL",c_loc:"BUSINESS LOCATION",c_wa:"Chat with us on WhatsApp",contact_form_h:"Send an enquiry",f_name:"Your name",f_phone:"Phone number",f_type:"Enquiry type",f_message:"Message",
  t_general:"General",t_product:"Product Enquiry",t_bulk:"Bulk Order",t_dist:"Distribution",send_enquiry:"Send enquiry",
  footer_text:"Distribution and supply support for electricians, retailers and businesses.",rights:"All rights reserved.",admin_link:"Admin",
  inq_title:"Your enquiry list",inq_intro:"Submit products and quantities. The sales team can respond with availability and wholesale pricing.",inq_empty:"Your enquiry list is empty. Add products from the catalog first.",
  q_name:"Your name",q_business:"Shop / business",q_notes:"Notes",q_send:"Send quote request",added:"Added to your enquiry list",
  quote_ok:"Quote request sent. We will contact you soon.",dealer_ok:"Application submitted successfully. We will contact you.",contact_ok:"Thank you. Your enquiry was sent.",
  signin:"Admin sign in",signin_p:"Access inventory and business operations.",f_user:"Email / username",f_pass:"Password",signin_btn:"Sign in",signin_hint:"Demo admin: admin@deepu.local / Demo@12345. Replace with real authentication before going live.",signin_fail:"Incorrect username or password.",
  wa_text:"Hi Deepu Enterprises, I am checking your online catalog and would like to enquire about bulk prices."
 },
 kn: {
  nav_home:"ಮುಖಪುಟ",nav_sections:"ವಿಭಾಗಗಳು",nav_catalog:"ಉತ್ಪನ್ನಗಳು",nav_brands:"ಬ್ರಾಂಡ್‌ಗಳು",nav_about:"ನಮ್ಮ ಬಗ್ಗೆ",nav_logistics:"ಸರಬರಾಜು",nav_dealer:"ಡೀಲರ್ ಆಗಿ",nav_contact:"ಸಂಪರ್ಕಿಸಿ",my_inquiry:"ನನ್ನ ವಿಚಾರಣೆಗಳು",
  hero_eyebrow:"ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ಎಲೆಕ್ಟ್ರಿಕಲ್ ಮತ್ತು ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಪಾಲುದಾರ",hero_title:"ವ್ಯವಹಾರಗಳಿಗೆ ಶಕ್ತಿ.<br><em>ಸಂಬಂಧಗಳಿಗೆ</em> ಬಲ.",
  hero_text:"ಬಲ್ಬ್, ವೈರ್, ಸ್ವಿಚ್, ಎಂಸಿಬಿ, ಫ್ಯಾನ್, ಲೈಟಿಂಗ್ ಮತ್ತು ಇನ್ನಷ್ಟು — ಒಂದೇ ಕೌಂಟರ್‌ನಲ್ಲಿ ಸಗಟು ಮತ್ತು ಚಿಲ್ಲರೆ ಪೂರೈಕೆ.",
  search_ph:"ಉತ್ಪನ್ನ, ಬ್ರಾಂಡ್ ಅಥವಾ SKU ಹುಡುಕಿ… (ಉದಾ. syska, vayar, ಬಲ್ಬ್)",explore:"ಉತ್ಪನ್ನಗಳನ್ನು ನೋಡಿ",serving:"ಚನ್ನರಾಯಪಟ್ಟಣ ಮತ್ತು ಸುತ್ತಮುತ್ತಲಿನ ಪ್ರದೇಶಗಳಿಗೆ ಸೇವೆ",float_a:"ಒಬ್ಬ ಪಾಲುದಾರ.",float_b:"ಹಲವು ಪೂರೈಕೆ ಅಗತ್ಯಗಳು.",
  stat_products_u:"ಉತ್ಪನ್ನಗಳು",stat_products:"ನಮ್ಮ ಲೈವ್ ಕ್ಯಾಟಲಾಗ್‌ನಲ್ಲಿ",stat_brands_u:"ಬ್ರಾಂಡ್‌ಗಳು",stat_brands:"ಪಾಲುದಾರ ಬ್ರಾಂಡ್‌ಗಳು",stat_sections_u:"ವಿಭಾಗಗಳು",stat_sections:"ವ್ಯವಸ್ಥಿತ ಅಂಗಡಿ ರ‍್ಯಾಕ್‌ಗಳು",
  disclaimer:"ಕ್ಯಾಟಲಾಗ್, ಸ್ಟಾಕ್ ಸ್ಥಿತಿ ಮತ್ತು ಬೆಲೆಗಳು ಅಂಗಡಿಯ ಇನ್ವೆಂಟರಿ ವ್ಯವಸ್ಥೆಯಿಂದ ನೇರವಾಗಿ ನವೀಕರಣಗೊಳ್ಳುತ್ತವೆ. ಸಗಟು ದರಗಳನ್ನು ವಿಚಾರಣೆಯ ನಂತರ ತಿಳಿಸಲಾಗುತ್ತದೆ.",
  sec_kicker:"ವಿಭಾಗದ ಪ್ರಕಾರ ಖರೀದಿಸಿ",sec_title:"ಸರಿಯಾದ ರ‍್ಯಾಕ್‌ನಲ್ಲಿ<br><em>ಹುಡುಕಿ.</em>",sec_text:"ನಮ್ಮ ಅಂಗಡಿಯನ್ನು ಉತ್ಪನ್ನ ಪ್ರಕಾರದ ಪ್ರಕಾರ ರ‍್ಯಾಕ್‌ಗಳಾಗಿ ವಿಂಗಡಿಸಲಾಗಿದೆ. ಲಭ್ಯವಿರುವುದನ್ನು ನೋಡಲು ಒಂದು ವಿಭಾಗವನ್ನು ಆರಿಸಿ.",
  cat_kicker:"ಉತ್ಪನ್ನ ಕ್ಯಾಟಲಾಗ್",cat_title:"ನಿಮ್ಮ ವ್ಯವಹಾರಕ್ಕೆ<br><em>ಬೇಕಾದದ್ದನ್ನು ಹುಡುಕಿ.</em>",cat_text:"ಚಿಲ್ಲರೆ ಬೆಲೆ ಮತ್ತು ಲಭ್ಯತೆಯೊಂದಿಗೆ ಲೈವ್ ಉತ್ಪನ್ನಗಳನ್ನು ನೋಡಿ. ಸಗಟು ಬೆಲೆಗಳನ್ನು ವಿಚಾರಣೆ ಅಥವಾ ಡೀಲರ್ ಅನುಮೋದನೆಯ ನಂತರ ತಿಳಿಸಲಾಗುತ್ತದೆ.",
  all_categories:"ಎಲ್ಲಾ ವರ್ಗಗಳು",all_brands:"ಎಲ್ಲಾ ಬ್ರಾಂಡ್‌ಗಳು",all:"ಎಲ್ಲಾ",show_all:"ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳನ್ನು ತೋರಿಸಿ",show_fewer:"ಕಡಿಮೆ ತೋರಿಸಿ",no_products:"ಹೊಂದುವ ಉತ್ಪನ್ನಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
  in_stock:"ಸ್ಟಾಕ್ ಇದೆ",low_stock:"ಸೀಮಿತ ಸ್ಟಾಕ್",out_stock:"ಸ್ಟಾಕ್ ಇಲ್ಲ",available:"ಲಭ್ಯವಿದೆ",on_request:"ವಿನಂತಿಯ ಮೇರೆಗೆ",add_inquiry:"+ ವಿಚಾರಣೆಗೆ ಸೇರಿಸಿ",unavailable:"ಲಭ್ಯವಿಲ್ಲ",
  wholesale_note:"ಸಗಟು ದರ ವಿಚಾರಣೆಯ ಮೇರೆಗೆ",filtering:"ತೋರಿಸುತ್ತಿರುವುದು",clear:"ಫಿಲ್ಟರ್ ತೆಗೆಯಿರಿ",per:"ಪ್ರತಿ",
  brand_kicker:"ಬ್ರಾಂಡ್‌ಗಳು ಮತ್ತು ಪೂರೈಕೆ ಪಾಲುದಾರರು",brand_title:"ನೀವು ಈಗಾಗಲೇ<br><em>ನಂಬುವ ಬ್ರಾಂಡ್‌ಗಳು.</em>",brand_text:"ಬ್ರಾಂಡ್‌ನ ಉತ್ಪನ್ನಗಳನ್ನು ನೋಡಲು ಅದರ ಮೇಲೆ ಟ್ಯಾಪ್ ಮಾಡಿ.",items:"ಉತ್ಪನ್ನಗಳು",
  about_kicker:"ದೀಪು ಎಂಟರ್‌ಪ್ರೈಸಸ್ ಬಗ್ಗೆ",about_title:"ವಿಶ್ವಾಸದ ಮೇಲೆ ನಿರ್ಮಿತ.<br><em>ಸೇವೆಯಿಂದ ಮುನ್ನಡೆ.</em>",
  about_text:"ದೀಪು ಎಂಟರ್‌ಪ್ರೈಸಸ್ ಕರ್ನಾಟಕದ ಚನ್ನರಾಯಪಟ್ಟಣದಲ್ಲಿರುವ ಎಲೆಕ್ಟ್ರಿಕಲ್ ಮತ್ತು ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಸಗಟು ಮತ್ತು ಚಿಲ್ಲರೆ ಪೂರೈಕೆದಾರ. ಎಲೆಕ್ಟ್ರಿಷಿಯನ್‌ಗಳು, ಗುತ್ತಿಗೆದಾರರು, ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ಮನೆಯವರಿಗೆ ನಂಬಿಕಸ್ಥ ಉತ್ಪನ್ನಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ಸೇವೆಯನ್ನು ನೀಡುತ್ತೇವೆ.",
  about_panel_h:"ನಂಬಿಕಸ್ಥ ಪೂರೈಕೆ, ನಿಮ್ಮ ವ್ಯವಹಾರಕ್ಕೆ ಹತ್ತಿರ.",about_panel_p:"ನಮ್ಮ ಗಮನ ಸರಳ: ಅಸಲಿ ಬ್ರಾಂಡೆಡ್ ಉತ್ಪನ್ನಗಳು, ಸ್ಪಷ್ಟ ಸಂವಹನ ಮತ್ತು ನಂಬಿಕಸ್ಥ ವಿತರಣಾ ಬೆಂಬಲ.",
  v1_h:"ಅಸಲಿ ಬ್ರಾಂಡ್‌ಗಳು",v1_p:"ಪ್ರಮುಖ ಎಲೆಕ್ಟ್ರಿಕಲ್ ಬ್ರಾಂಡ್‌ಗಳು ಒಂದೇ ಸೂರಿನಡಿ.",v2_h:"ಸಗಟು ಮತ್ತು ಚಿಲ್ಲರೆ",v2_p:"ಬೃಹತ್ ಮತ್ತು ಕೌಂಟರ್ ಖರೀದಿದಾರರಿಗೆ ಸ್ಪರ್ಧಾತ್ಮಕ ದರ.",v3_h:"ಸ್ಥಳೀಯ ವಿತರಣೆ",v3_p:"ಹಾಸನ ಜಿಲ್ಲೆಯ ಸುತ್ತ ವ್ಯಾಪ್ತಿ.",
  log_kicker:"ವಿತರಣೆ ಮತ್ತು ಸರಬರಾಜು",log_title:"ಸ್ಥಳೀಯ ಜ್ಞಾನ.<br><em>ಯೋಜಿತ ವಿತರಣೆ.</em>",log_text:"ನಮ್ಮ ಚನ್ನರಾಯಪಟ್ಟಣ ಕೇಂದ್ರದ ಸುತ್ತಲಿನ ವ್ಯಾಪ್ತಿ ಪ್ರದೇಶಗಳು. ವಿತರಣಾ ದಿನಗಳನ್ನು ನಮ್ಮ ತಂಡದೊಂದಿಗೆ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
  primary_hub:"ಮುಖ್ಯ ಕೇಂದ್ರ",town_chn:"ಚನ್ನರಾಯಪಟ್ಟಣ",dist_hassan:"ಹಾಸನ ಜಿಲ್ಲೆ, ಕರ್ನಾಟಕ",log_note:"ಈ ಪಟ್ಟಿಯು ಪ್ರತಿದಿನ ಸೇವೆ ಅಥವಾ ಪ್ರತಿ ಸ್ಥಳದಲ್ಲಿ ಶಾಖೆಯ ಖಾತರಿಯಲ್ಲ.",
  map_cap:"ಹಾಸನ ಜಿಲ್ಲೆ ವ್ಯಾಪ್ತಿ ನೋಟ",map_note:"ಸಾಂಕೇತಿಕ ಚಿತ್ರ, ದಾರಿ ತೋರಿಸುವ ನಕ್ಷೆಯಲ್ಲ.",
  dealer_kicker:"ದೀಪು ಎಂಟರ್‌ಪ್ರೈಸಸ್‌ನೊಂದಿಗೆ ಬೆಳೆಯಿರಿ",dealer_title:"ಬಲವಾದ<br><em>ವ್ಯವಹಾರ ಸಂಬಂಧ ಕಟ್ಟೋಣ.</em>",dealer_text:"ರಿಟೇಲ್ ಅಥವಾ ಸಬ್-ಡೀಲರ್ ಪಾಲುದಾರರಾಗಲು ಅರ್ಜಿ ಸಲ್ಲಿಸಿ. ನಮ್ಮ ತಂಡ ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಸಂಪರ್ಕಿಸುತ್ತದೆ.",dealer_cta:"ಡೀಲರ್‌ಶಿಪ್‌ಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ →",
  dealer_form_h:"ಡೀಲರ್ ಅರ್ಜಿ",dealer_form_p:"ನಿಮ್ಮ ಅಂಗಡಿ ಮತ್ತು ಸಂಪರ್ಕ ವಿವರಗಳನ್ನು ಸಲ್ಲಿಸಿ.",f_contact:"ಸಂಪರ್ಕ ವ್ಯಕ್ತಿ",f_business:"ಅಂಗಡಿ / ವ್ಯವಹಾರದ ಹೆಸರು",f_mobile:"ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",f_email:"ಇಮೇಲ್",f_gstin:"GSTIN (ನೋಂದಾಯಿತರಾಗಿದ್ದರೆ)",f_city:"ನಗರ / ಪಟ್ಟಣ",f_address:"ಅಂಗಡಿ ವಿಳಾಸ",f_interest:"ಆಸಕ್ತಿಯ ಉತ್ಪನ್ನಗಳು",
  ph_mobile:"10-ಅಂಕಿಯ ಮೊಬೈಲ್",ph_gstin:"15-ಅಕ್ಷರದ GSTIN",ph_interest:"ಬಲ್ಬ್, ವೈರ್, ಸ್ವಿಚ್, ಫ್ಯಾನ್…",consent_dealer:"ಈ ಡೀಲರ್‌ಶಿಪ್ ಅರ್ಜಿಯ ಬಗ್ಗೆ ನನ್ನನ್ನು ಸಂಪರ್ಕಿಸಲು ಒಪ್ಪುತ್ತೇನೆ.",submit_app:"ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
  contact_kicker:"ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ",contact_title:"ವ್ಯವಹಾರದ ಬಗ್ಗೆ<br><em>ಮಾತನಾಡೋಣ.</em>",contact_text:"ಉತ್ಪನ್ನ ಲಭ್ಯತೆ, ಬೃಹತ್ ಅಗತ್ಯಗಳು ಮತ್ತು ಡೀಲರ್‌ಶಿಪ್ ವಿಚಾರಣೆಗಳಿಗಾಗಿ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ.",
  c_phone:"ದೂರವಾಣಿ",c_email:"ಅಧಿಕೃತ ಇಮೇಲ್",c_loc:"ವ್ಯವಹಾರ ಸ್ಥಳ",c_wa:"ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಚಾಟ್ ಮಾಡಿ",contact_form_h:"ವಿಚಾರಣೆ ಕಳುಹಿಸಿ",f_name:"ನಿಮ್ಮ ಹೆಸರು",f_phone:"ಫೋನ್ ಸಂಖ್ಯೆ",f_type:"ವಿಚಾರಣೆಯ ಪ್ರಕಾರ",f_message:"ಸಂದೇಶ",
  t_general:"ಸಾಮಾನ್ಯ",t_product:"ಉತ್ಪನ್ನ ವಿಚಾರಣೆ",t_bulk:"ಬೃಹತ್ ಆರ್ಡರ್",t_dist:"ವಿತರಣೆ",send_enquiry:"ವಿಚಾರಣೆ ಕಳುಹಿಸಿ",
  footer_text:"ಎಲೆಕ್ಟ್ರಿಷಿಯನ್‌ಗಳು, ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ವ್ಯವಹಾರಗಳಿಗೆ ವಿತರಣೆ ಮತ್ತು ಪೂರೈಕೆ ಬೆಂಬಲ.",rights:"ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",admin_link:"ಅಡ್ಮಿನ್",
  inq_title:"ನಿಮ್ಮ ವಿಚಾರಣಾ ಪಟ್ಟಿ",inq_intro:"ಉತ್ಪನ್ನಗಳು ಮತ್ತು ಪ್ರಮಾಣವನ್ನು ಸಲ್ಲಿಸಿ. ನಮ್ಮ ಮಾರಾಟ ತಂಡ ಲಭ್ಯತೆ ಮತ್ತು ಸಗಟು ಬೆಲೆಯೊಂದಿಗೆ ಉತ್ತರಿಸುತ್ತದೆ.",inq_empty:"ನಿಮ್ಮ ವಿಚಾರಣಾ ಪಟ್ಟಿ ಖಾಲಿಯಾಗಿದೆ. ಮೊದಲು ಕ್ಯಾಟಲಾಗ್‌ನಿಂದ ಉತ್ಪನ್ನಗಳನ್ನು ಸೇರಿಸಿ.",
  q_name:"ನಿಮ್ಮ ಹೆಸರು",q_business:"ಅಂಗಡಿ / ವ್ಯವಹಾರ",q_notes:"ಟಿಪ್ಪಣಿಗಳು",q_send:"ಕೋಟ್ ವಿನಂತಿ ಕಳುಹಿಸಿ",added:"ನಿಮ್ಮ ವಿಚಾರಣಾ ಪಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ",
  quote_ok:"ಕೋಟ್ ವಿನಂತಿ ಕಳುಹಿಸಲಾಗಿದೆ. ನಾವು ಶೀಘ್ರದಲ್ಲೇ ಸಂಪರ್ಕಿಸುತ್ತೇವೆ.",dealer_ok:"ಅರ್ಜಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಕೆಯಾಗಿದೆ. ನಾವು ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತೇವೆ.",contact_ok:"ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ವಿಚಾರಣೆ ಕಳುಹಿಸಲಾಗಿದೆ.",
  signin:"ಅಡ್ಮಿನ್ ಸೈನ್ ಇನ್",signin_p:"ಇನ್ವೆಂಟರಿ ಮತ್ತು ವ್ಯವಹಾರ ನಿರ್ವಹಣೆಗೆ ಪ್ರವೇಶಿಸಿ.",f_user:"ಇಮೇಲ್ / ಬಳಕೆದಾರ ಹೆಸರು",f_pass:"ಪಾಸ್‌ವರ್ಡ್",signin_btn:"ಸೈನ್ ಇನ್",signin_hint:"ಡೆಮೊ ಅಡ್ಮಿನ್: admin@deepu.local / Demo@12345. ಲೈವ್ ಆಗುವ ಮೊದಲು ನಿಜವಾದ ದೃಢೀಕರಣ ಬಳಸಿ.",signin_fail:"ತಪ್ಪಾದ ಬಳಕೆದಾರ ಹೆಸರು ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್.",
  wa_text:"ನಮಸ್ಕಾರ ದೀಪು ಎಂಟರ್‌ಪ್ರೈಸಸ್, ನಿಮ್ಮ ಆನ್‌ಲೈನ್ ಕ್ಯಾಟಲಾಗ್ ನೋಡಿದೆ. ಸಗಟು ಬೆಲೆಗಳ ಬಗ್ಗೆ ವಿಚಾರಿಸಲು ಬಯಸುತ್ತೇನೆ."
 }
};
let LANG = "en";
try { LANG = localStorage.getItem("deepu_lang") === "kn" ? "kn" : "en"; } catch (e) {}
const tr = k => (TX[LANG] && TX[LANG][k]) || TX.en[k] || k;

/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
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
function notify(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2800); }
function persistCart() { try { localStorage.setItem("deepu_cart", JSON.stringify(cart)); } catch (e) {} $("#cartCount").textContent = cart.reduce((n, x) => n + x.qty, 0); }

/* ---------- Static text & shop details ---------- */
function applyStatic() {
  document.documentElement.lang = LANG;
  $$("[data-i18n]").forEach(el => { el.textContent = tr(el.dataset.i18n); });
  $$("[data-i18n-html]").forEach(el => { el.innerHTML = tr(el.dataset.i18nHtml); });
  $$("[data-i18n-ph]").forEach(el => { el.placeholder = tr(el.dataset.i18nPh); });
  $("#langToggle").textContent = LANG === "en" ? "🌐 ಕನ್ನಡ" : "🌐 English";
  const s = shop();
  const set = (k, v) => $$(`[data-shop="${k}"]`).forEach(el => { el.textContent = v; });
  set("phone", s.SHOP_PHONE || "—");
  set("address", s.SHOP_ADDRESS || "Channarayapatna, Hassan District, Karnataka");
  set("name_upper", (s.SHOP_NAME || "Deepu Enterprises").toUpperCase());
  set("tagline_upper", (s.SHOP_TAGLINE || "Electrical & Electronics").toUpperCase());
  const digits = String(s.SHOP_PHONE || "").replace(/[^0-9]/g, "").slice(0, 12);
  const wa = digits.length >= 10 ? (digits.length === 10 ? "91" + digits : digits) : "";
  $("#whatsappLink").href = `https://wa.me/${wa}?text=` + encodeURIComponent(tr("wa_text"));
  $("#year").textContent = new Date().getFullYear();
}

/* ---------- Stats, racks, filters ---------- */
function renderStats() {
  const prods = activeProducts();
  $("#statProducts").textContent = prods.length;
  $("#statBrands").textContent = new Set(prods.map(p => p.brand_name).filter(Boolean)).size;
  $("#statSections").textContent = new Set(prods.map(p => p.rack_id).filter(Boolean)).size;
}
function renderRacks() {
  const prods = activeProducts();
  const tiles = (db.racks || []).map(r => ({ r, n: prods.filter(p => p.rack_id === r.rack_id).length })).filter(x => x.n > 0);
  $("#rackGrid").innerHTML = tiles.map(({ r, n }) =>
    `<button class="rack-tile ${view.rack === r.rack_id ? "active" : ""}" data-rack="${esc(r.rack_id)}"><span class="rack-id">${esc(r.rack_id)}</span><span class="rack-icon">${esc(r.icon || "📦")}</span><b>${esc(rackName(r))}</b><small>${n} ${tr("items")}</small></button>`
  ).join("") || `<p class="empty-note">${tr("no_products")}</p>`;
}
function renderFilters() {
  const cats = (db.categories || []).filter(c => activeProducts().some(p => p.category_id === c.category_id));
  $("#categoryFilter").innerHTML = `<option value="">${tr("all_categories")}</option>` + cats.map(c => `<option value="${esc(c.category_id)}">${esc(catName(c))}</option>`).join("");
  $("#brandFilter").innerHTML = `<option value="">${tr("all_brands")}</option>` + brandList().map(b => `<option value="${esc(b.name)}">${esc(b.name)}</option>`).join("");
  $("#categoryFilter").value = view.cat; $("#brandFilter").value = view.brand;
  $("#categoryPills").innerHTML = `<button class="pill ${view.cat ? "" : "active"}" data-cat="">${tr("all")}</button>` +
    cats.map(c => `<button class="pill ${view.cat === c.category_id ? "active" : ""}" data-cat="${esc(c.category_id)}">${esc(catName(c))}</button>`).join("");
  $("#productSearch").value = view.q;
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
  const img = p.image_url ? `<img src="${esc(p.image_url)}" alt="" loading="lazy" onerror="this.remove()">` : "";
  return `<article class="product-card"><div class="product-visual"><div class="product-symbol">${initials}</div>${img}<span class="stock-tag ${st.cls}">${esc(st.label)}</span></div>
  <div class="product-body"><span class="product-brand">${esc(p.brand_name || "")}</span><h3>${esc(pName(p))}</h3>
  <div class="price-row"><span class="price">${inr(p.selling_price)}</span><small>${tr("per")} ${esc(p.unit || "Piece")}</small></div><div class="wholesale-note">${tr("wholesale_note")}</div>
  <div class="product-meta"><small>${esc(p.sku || "")}</small><button ${st.ok ? "" : "disabled"} onclick="addToCart('${esc(p.product_id)}')">${st.ok ? tr("add_inquiry") : tr("unavailable")}</button></div></div></article>`;
}
function renderCatalog() {
  const list = filteredProducts(), shown = view.showAll ? list : list.slice(0, 8);
  $("#productGrid").innerHTML = shown.map(productCard).join("") || `<p class="empty-note">${tr("no_products")}</p>`;
  $("#showMore").hidden = list.length <= 8;
  $("#showMore").textContent = view.showAll ? tr("show_fewer") : tr("show_all");
  const af = $("#activeFilter"), parts = [];
  if (view.rack) { const r = rackOf(view.rack); parts.push((r ? rackName(r) : view.rack)); }
  if (view.brand) parts.push(view.brand);
  af.hidden = !parts.length;
  af.innerHTML = parts.length ? `${tr("filtering")}: <b>${esc(parts.join(" · "))}</b> <button data-clear>${tr("clear")}</button>` : "";
}
function renderBrands() {
  const prods = activeProducts();
  $("#brandGrid").innerHTML = brandList().map(b => {
    const n = prods.filter(p => p.brand_name === b.name).length;
    return `<div class="brand-card" data-brand="${esc(b.name)}"><div class="brand-monogram">${esc(b.name.slice(0, 2).toUpperCase())}</div><div><b>${esc(b.name)}</b><small>${esc(b.description || "")}</small></div><span class="count">${n} ${tr("items")}</span></div>`;
  }).join("");
}
function renderRoutes() { $("#routeList").innerHTML = LOCATIONS.map(x => `<div class="route-place">${esc(x)}</div>`).join(""); }
function renderAll() { renderStats(); renderRacks(); renderFilters(); renderCatalog(); renderBrands(); renderRoutes(); persistCart(); }

/* ---------- Search flyout in hero (same smart search as admin) ---------- */
function heroSuggest() {
  const q = $("#heroSearch").value, box = $("#heroSuggest");
  if (!q.trim()) { box.classList.remove("open"); return; }
  const res = SearchEngine.search(activeProducts(), q, 6);
  box.innerHTML = res.map(p => `<button data-pick="${esc(p.product_id)}">${p.image_url ? `<img src="${esc(p.image_url)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'thumb-fallback',textContent:'DE'}))">` : `<span class="thumb-fallback">DE</span>`}<span><b>${esc(pName(p))}</b><small>${esc(p.brand_name || "")} · ${esc(p.sku || "")}</small></span><span class="price">${inr(p.selling_price)}</span></button>`).join("") || `<div style="padding:14px;font-size:12px;color:var(--muted)">${tr("no_products")}</div>`;
  box.classList.add("open");
}

/* ---------- Inquiry cart ---------- */
function addToCart(id) {
  const p = activeProducts().find(x => x.product_id === id); if (!p) return;
  const it = cart.find(x => x.id === id); it ? it.qty++ : cart.push({ id, qty: 1 });
  persistCart(); notify(tr("added"));
}
function openModal(html) { $("#modalContent").innerHTML = html; $("#modalBackdrop").classList.add("open"); }
function closeModal() { $("#modalBackdrop").classList.remove("open"); }
function inquiryModal() {
  const rows = cart.map(x => { const p = (db.products || []).find(y => y.product_id === x.id); return p ? `<div class="inquiry-row"><span><b>${esc(pName(p))}</b><br><small>${esc(p.sku)} · ${inr(p.selling_price)}</small></span><input type="number" min="1" max="99999" value="${x.qty}" data-qty="${esc(p.product_id)}"><button data-remove="${esc(p.product_id)}">×</button></div>` : ""; }).join("");
  openModal(`<h2>${tr("inq_title")}</h2><p>${tr("inq_intro")}</p>${rows || `<p>${tr("inq_empty")}</p>`}<form id="quoteForm" class="modal-form"><label>${tr("q_name")}<input name="name" required></label><label>${tr("q_business")}<input name="businessName" required></label><label>${tr("f_mobile")}<input name="phone" required pattern="[6-9][0-9]{9}" placeholder="${tr("ph_mobile")}"></label><label>${tr("f_email")}<input name="email" type="email"></label><label class="full">${tr("q_notes")}<textarea name="message" rows="2"></textarea></label><button class="btn btn-primary full" ${cart.length ? "" : "disabled"}>${tr("q_send")}</button></form>`);
  $$("[data-qty]").forEach(i => i.addEventListener("change", () => { const x = cart.find(y => y.id === i.dataset.qty); if (x) x.qty = Math.max(1, Number(i.value) || 1); persistCart(); }));
  $$("[data-remove]").forEach(b => b.addEventListener("click", () => { cart = cart.filter(x => x.id !== b.dataset.remove); persistCart(); inquiryModal(); }));
  $("#quoteForm").addEventListener("submit", submitQuote);
}

/* ---------- Saving enquiries for admin ---------- */
async function saveEnquiry(e) {
  e.enquiry_id = "ENQ-" + Date.now().toString(36).toUpperCase();
  e.status = "New"; e.created_at = new Date().toISOString();
  const d = LocalDB.load(); d.enquiries = d.enquiries || []; d.enquiries.unshift(e); LocalDB.save(d);
  const url = d.settings && !Array.isArray(d.settings) && d.settings.APPS_SCRIPT_URL;
  if (url) {
    try { await fetch(url.trim(), { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "submitEnquiry", enquiry: { ...e, items_json: JSON.stringify(e.items || []) } }) }); } catch (err) { console.warn("Remote enquiry sync failed; saved locally", err); }
  }
  reload();
}
async function submitQuote(ev) {
  ev.preventDefault(); if (!cart.length) return;
  const f = Object.fromEntries(new FormData(ev.target));
  await saveEnquiry({ type: "Quote", name: f.name, business_name: f.businessName, phone: f.phone, email: f.email || "", subject: "Quote request", message: f.message || "",
    items: cart.map(x => { const p = (db.products || []).find(y => y.product_id === x.id) || {}; return { product_id: x.id, name: p.name, sku: p.sku, qty: x.qty }; }) });
  cart = []; persistCart(); closeModal(); notify(tr("quote_ok"));
}
function bindForms() {
  $("#dealerForm").addEventListener("submit", async e => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
    await saveEnquiry({ type: "Dealer", name: f.contactName, business_name: f.businessName, phone: f.phone, email: f.email || "", city: f.city, gstin: f.gstin || "", address: f.address, subject: "Dealer application", message: "Products of interest: " + (f.interest || "—") });
    $("#dealerMessage").textContent = tr("dealer_ok"); e.target.reset(); });
  $("#contactForm").addEventListener("submit", async e => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
    await saveEnquiry({ type: "Contact", name: f.name, phone: f.phone, email: f.email || "", subject: f.type, message: f.message });
    $("#contactMessage").textContent = tr("contact_ok"); e.target.reset(); });
}

/* ---------- Admin login (demo gate; admin page checks sessionStorage flag) ---------- */
function showLogin() {
  openModal(`<h2>${tr("signin")}</h2><p>${tr("signin_p")}</p><form id="loginForm" class="modal-form"><label class="full">${tr("f_user")}<input name="username" required autocomplete="username"></label><label class="full">${tr("f_pass")}<input type="password" name="password" required autocomplete="current-password"></label><button class="btn btn-primary full">${tr("signin_btn")}</button></form><p class="small-muted">${tr("signin_hint")}</p>`);
  $("#loginForm").addEventListener("submit", e => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
    if (d.username === DEMO_ADMIN_USER && d.password === DEMO_ADMIN_PASS) { try { sessionStorage.setItem("deepu_demo_admin", "1"); } catch (err) {} location.href = "../admin/index.html"; }
    else notify(tr("signin_fail")); });
}

/* ---------- Events ---------- */
function bindEvents() {
  document.addEventListener("click", e => {
    const v = e.target.closest("[data-view]");
    if (v) { if (v.dataset.view === "inquiry") inquiryModal(); if (v.dataset.view === "admin-login") showLogin(); }
    const rk = e.target.closest("[data-rack]");
    if (rk) { view.rack = view.rack === rk.dataset.rack ? "" : rk.dataset.rack; view.showAll = true; renderRacks(); renderCatalog(); if (view.rack) $("#catalog").scrollIntoView({ behavior: "smooth" }); }
    const pill = e.target.closest("[data-cat]");
    if (pill) { view.cat = pill.dataset.cat; renderFilters(); renderCatalog(); }
    const br = e.target.closest("[data-brand]");
    if (br) { view.brand = br.dataset.brand; view.showAll = true; renderFilters(); renderCatalog(); $("#catalog").scrollIntoView({ behavior: "smooth" }); }
    if (e.target.closest("[data-clear]")) { view.rack = ""; view.brand = ""; renderRacks(); renderFilters(); renderCatalog(); }
    const pick = e.target.closest("[data-pick]");
    if (pick) { const p = activeProducts().find(x => x.product_id === pick.dataset.pick); if (p) { view.q = p.sku || p.name; view.cat = ""; view.brand = ""; view.rack = ""; renderRacks(); renderFilters(); renderCatalog(); $("#heroSearch").value = ""; $("#heroSuggest").classList.remove("open"); $("#catalog").scrollIntoView({ behavior: "smooth" }); } }
    if (!e.target.closest(".hero-search")) $("#heroSuggest").classList.remove("open");
  });
  $("#modalClose").addEventListener("click", closeModal);
  $("#modalBackdrop").addEventListener("click", e => { if (e.target.id === "modalBackdrop") closeModal(); });
  $("#productSearch").addEventListener("input", e => { view.q = e.target.value; renderCatalog(); });
  $("#heroSearch").addEventListener("input", heroSuggest);
  $("#heroSearch").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); view.q = e.target.value; renderFilters(); renderCatalog(); $("#heroSuggest").classList.remove("open"); $("#catalog").scrollIntoView({ behavior: "smooth" }); } });
  $("#categoryFilter").addEventListener("change", e => { view.cat = e.target.value; renderFilters(); renderCatalog(); });
  $("#brandFilter").addEventListener("change", e => { view.brand = e.target.value; renderFilters(); renderCatalog(); });
  $("#showMore").addEventListener("click", () => { view.showAll = !view.showAll; renderCatalog(); });
  $("#menuToggle").addEventListener("click", () => $("#mainNav").classList.toggle("open"));
  $$("#mainNav a").forEach(a => a.addEventListener("click", () => $("#mainNav").classList.remove("open")));
  $("#langToggle").addEventListener("click", () => { LANG = LANG === "en" ? "kn" : "en"; try { localStorage.setItem("deepu_lang", LANG); } catch (e) {} applyStatic(); renderAll(); });
  // Live update when admin changes inventory in another tab
  window.addEventListener("storage", e => { if (e.key === "deepu_electrical_v3_kn") { reload(); applyStatic(); renderAll(); } });
  if (location.hash === "#admin-login") { history.replaceState(null, "", location.pathname); showLogin(); }
}

document.addEventListener("DOMContentLoaded", () => { applyStatic(); renderAll(); bindForms(); bindEvents(); });
