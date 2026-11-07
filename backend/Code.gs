/**
 * Deepu Enterprises — Electrical & Electronics Inventory Management System
 * Production Google Apps Script Web App (Backend API & Google Sheets Database)
 * 
 * Deployment Instructions:
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Click Extensions > Apps Script
 * 3. Paste this code into Code.gs
 * 4. Run setupDatabase() once to create all sheets, headers, and seed electrical data.
 * 5. Click Deploy > New deployment > Select type: Web app
 * 6. Set "Execute as": Me, "Who has access": Anyone
 * 7. Copy the Web App URL and paste it into the application settings!
 */

const SHEETS = {
  Products: [
    "product_id", "name", "name_ta", "sku", "barcode", "category_id", "rack_id", "brand_id",
    "model_number", "unit", "purchase_price", "selling_price", "wholesale_price",
    "stock_quantity", "min_stock_level", "image_url", "description", "is_active", "updated_at"
  ],
  Racks: [
    "rack_id", "name", "name_ta", "icon", "category_id", "capacity_pct", "status", "description"
  ],
  Categories: [
    "category_id", "name", "name_ta", "slug", "description", "rack_id", "display_order", "is_active"
  ],
  Brands: [
    "brand_id", "name", "description", "logo_icon", "is_active"
  ],
  Sales: [
    "sale_id", "invoice_no", "customer_id", "customer_name", "customer_phone",
    "subtotal", "discount_amount", "tax_amount", "grand_total", "paid_amount",
    "balance_amount", "payment_mode", "status", "notes", "created_at", "created_by"
  ],
  SaleItems: [
    "item_id", "sale_id", "product_id", "product_name", "sku", "quantity", "unit_price", "cost_price", "line_total"
  ],
  Purchases: [
    "purchase_id", "po_number", "supplier_id", "supplier_name", "invoice_number", "total_amount", "paid_amount", "payment_status", "notes", "created_at"
  ],
  PurchaseItems: [
    "item_id", "purchase_id", "product_id", "quantity", "purchase_price", "line_total"
  ],
  Suppliers: [
    "supplier_id", "name", "contact_person", "phone", "email", "gstin", "address", "city", "outstanding_balance", "created_at"
  ],
  Customers: [
    "customer_id", "name", "phone", "email", "business_name", "address", "city", "customer_type", "credit_balance", "created_at"
  ],
  StockMovements: [
    "movement_id", "product_id", "movement_type", "quantity", "previous_stock", "new_stock", "reference_id", "reason", "performed_by", "created_at"
  ],
  Settings: [
    "setting_key", "setting_value", "updated_at"
  ]
};

// ----------------- Web App Entrypoints -----------------

function doGet(e) {
  return jsonResponse({
    ok: true,
    service: "Deepu Enterprises Google Sheets Inventory API",
    status: "active",
    timestamp: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    const rawData = e.postData ? e.postData.contents : "{}";
    const body = JSON.parse(rawData);
    const action = body.action || "";
    let data = null;

    if (action === "setupDatabase") {
      data = setupDatabase();
    } else if (action === "getInitialData" || action === "getAllData") {
      data = getAllData();
    } else if (action === "getProducts") {
      data = getSheetObjects("Products").filter(p => p.is_active != 0 && p.is_active !== "0");
    } else if (action === "saveProduct") {
      data = saveProduct(body.product);
    } else if (action === "deleteProduct") {
      data = deleteProduct(body.product_id);
    } else if (action === "adjustStock") {
      data = adjustStock(body);
    } else if (action === "createSale") {
      data = createSale(body.sale);
    } else if (action === "getSales") {
      data = getSheetObjects("Sales");
    } else if (action === "returnSale") {
      data = returnSale(body.sale_id, body.reason);
    } else if (action === "createPurchase") {
      data = createPurchase(body.purchase);
    } else if (action === "getPurchases") {
      data = getSheetObjects("Purchases");
    } else if (action === "saveSupplier") {
      data = saveSupplier(body.supplier);
    } else if (action === "deleteSupplier") {
      data = deleteSupplier(body.supplier_id);
    } else if (action === "saveCustomer") {
      data = saveCustomer(body.customer);
    } else if (action === "deleteCustomer") {
      data = deleteCustomer(body.customer_id);
    } else if (action === "updatePrices") {
      data = updatePrices(body.product_id, body.prices);
    } else if (action === "batchSync") {
      data = batchSync(body.data);
    } else {
      throw new Error("Unknown action: " + action);
    }

    return jsonResponse({ ok: true, data: data });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err.message || err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ----------------- Spreadsheet Helpers -----------------

function getSpreadsheet() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("SPREADSHEET_ID");
  if (id) {
    return SpreadsheetApp.openById(id);
  }
  // Fallback to active spreadsheet if container-bound
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) {
      props.setProperty("SPREADSHEET_ID", active.getId());
      return active;
    }
  } catch (e) {}

  // Or create new
  const created = SpreadsheetApp.create("Deepu Enterprises — Electrical Inventory DB");
  props.setProperty("SPREADSHEET_ID", created.getId());
  return created;
}

function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headers = SHEETS[sheetName] || [];
    if (headers.length) {
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#F1F5F9");
    }
  }
  return sheet;
}

function getSheetObjects(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const rows = data.slice(1);
  return rows.filter(r => r.some(x => x !== "")).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });
}

function appendSheetRow(sheetName, obj) {
  const sheet = getSheet(sheetName);
  const headers = SHEETS[sheetName];
  const row = headers.map(h => obj[h] === undefined ? "" : obj[h]);
  sheet.appendRow(row);
}

function updateSheetRow(sheetName, keyField, keyValue, updatedFields) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return false;
  const headers = data[0];
  const keyIdx = headers.indexOf(keyField);
  if (keyIdx === -1) return false;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][keyIdx]) === String(keyValue)) {
      headers.forEach((h, colIdx) => {
        if (updatedFields[h] !== undefined) {
          sheet.getRange(i + 1, colIdx + 1).setValue(updatedFields[h]);
        }
      });
      return true;
    }
  }
  return false;
}

// ----------------- Business Logic Operations -----------------

function getAllData() {
  return {
    products: getSheetObjects("Products").filter(p => p.is_active != 0 && p.is_active !== "0"),
    racks: getSheetObjects("Racks"),
    categories: getSheetObjects("Categories"),
    brands: getSheetObjects("Brands"),
    sales: getSheetObjects("Sales"),
    purchases: getSheetObjects("Purchases"),
    suppliers: getSheetObjects("Suppliers"),
    customers: getSheetObjects("Customers"),
    movements: getSheetObjects("StockMovements").slice(0, 100),
    settings: getSheetObjects("Settings")
  };
}

function saveProduct(p) {
  if (!p.name || !p.sku) throw new Error("Product name and SKU are required.");
  p.product_id = p.product_id || ("P" + Utilities.getUuid().slice(0, 6).toUpperCase());
  p.updated_at = new Date().toISOString();
  p.is_active = 1;

  const exists = updateSheetRow("Products", "product_id", p.product_id, p);
  if (!exists) {
    appendSheetRow("Products", p);
    if (Number(p.stock_quantity) > 0) {
      appendSheetRow("StockMovements", {
        movement_id: "MOV-" + Utilities.getUuid().slice(0, 8).toUpperCase(),
        product_id: p.product_id,
        movement_type: "Stock In",
        quantity: p.stock_quantity,
        previous_stock: 0,
        new_stock: p.stock_quantity,
        reference_id: p.sku,
        reason: "Initial catalog product creation",
        performed_by: "Admin",
        created_at: new Date().toISOString()
      });
    }
  }
  return p;
}

function deleteProduct(productId) {
  updateSheetRow("Products", "product_id", productId, { is_active: 0, updated_at: new Date().toISOString() });
  return { deleted: true };
}

function adjustStock(x) {
  const prods = getSheetObjects("Products");
  const p = prods.find(item => item.product_id === x.product_id);
  if (!p) throw new Error("Product not found");

  const prev = Number(p.stock_quantity || 0);
  const delta = Number(x.delta || 0);
  const newStock = Math.max(0, prev + delta);

  updateSheetRow("Products", "product_id", x.product_id, {
    stock_quantity: newStock,
    updated_at: new Date().toISOString()
  });

  appendSheetRow("StockMovements", {
    movement_id: "MOV-" + Utilities.getUuid().slice(0, 8).toUpperCase(),
    product_id: x.product_id,
    movement_type: x.movement_type || "Adjustment",
    quantity: delta,
    previous_stock: prev,
    new_stock: newStock,
    reference_id: x.reference_id || "MANUAL",
    reason: x.reason || "Stock adjustment",
    performed_by: x.user || "Admin",
    created_at: new Date().toISOString()
  });

  return { product_id: x.product_id, previous_stock: prev, new_stock: newStock, delta: delta };
}

function createSale(sale) {
  const saleId = "SAL-" + Utilities.getUuid().slice(0, 8).toUpperCase();
  const year = new Date().getFullYear();
  const sales = getSheetObjects("Sales");
  const invoiceNo = "SAL-" + year + "-" + String(sales.length + 101).padStart(5, "0");

  let subtotal = 0;
  const items = sale.items || [];
  if (!items.length) throw new Error("Sale must contain items.");

  const prods = getSheetObjects("Products");

  items.forEach(itm => {
    const p = prods.find(x => x.product_id === itm.product_id);
    if (p) {
      const qty = Number(itm.quantity || 1);
      const rate = Number(itm.unit_price || p.selling_price);
      const lineTotal = qty * rate;
      subtotal += lineTotal;

      appendSheetRow("SaleItems", {
        item_id: "SI-" + Utilities.getUuid().slice(0, 8).toUpperCase(),
        sale_id: saleId,
        product_id: itm.product_id,
        product_name: p.name,
        sku: p.sku,
        quantity: qty,
        unit_price: rate,
        cost_price: Number(p.purchase_price || 0),
        line_total: lineTotal
      });

      // Decrement stock
      const prevStock = Number(p.stock_quantity || 0);
      const newStock = Math.max(0, prevStock - qty);
      updateSheetRow("Products", "product_id", itm.product_id, {
        stock_quantity: newStock,
        updated_at: new Date().toISOString()
      });

      // Audit movement
      appendSheetRow("StockMovements", {
        movement_id: "MOV-" + Utilities.getUuid().slice(0, 8).toUpperCase(),
        product_id: itm.product_id,
        movement_type: "Sale",
        quantity: -qty,
        previous_stock: prevStock,
        new_stock: newStock,
        reference_id: invoiceNo,
        reason: "Sold to " + (sale.customer_name || "Walk-in"),
        performed_by: sale.created_by || "Admin",
        created_at: new Date().toISOString()
      });
    }
  });

  const discount = Number(sale.discount_amount || 0);
  const taxRate = Number(sale.tax_rate || 0);
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * (taxRate / 100);
  const grandTotal = taxable + tax;
  const paid = Number(sale.paid_amount || grandTotal);
  const balance = Math.max(0, grandTotal - paid);

  const saleRecord = {
    sale_id: saleId,
    invoice_no: invoiceNo,
    customer_id: sale.customer_id || "",
    customer_name: sale.customer_name || "Walk-in Customer",
    customer_phone: sale.customer_phone || "",
    subtotal: subtotal,
    discount_amount: discount,
    tax_amount: tax,
    grand_total: grandTotal,
    paid_amount: paid,
    balance_amount: balance,
    payment_mode: sale.payment_mode || "Cash",
    status: "Completed",
    notes: sale.notes || "",
    created_at: new Date().toLocaleString(),
    created_by: sale.created_by || "Admin"
  };

  appendSheetRow("Sales", saleRecord);
  return saleRecord;
}

function returnSale(saleId, reason) {
  updateSheetRow("Sales", "sale_id", saleId, { status: "Returned" });
  return { status: "success", message: "Sale marked as returned in Google Sheets" };
}

function createPurchase(po) {
  const pid = "PO-" + Utilities.getUuid().slice(0, 8).toUpperCase();
  const year = new Date().getFullYear();
  const purchases = getSheetObjects("Purchases");
  const poNumber = "PO-" + year + "-" + String(purchases.length + 1).padStart(4, "0");

  let total = 0;
  (po.items || []).forEach(itm => {
    const qty = Number(itm.quantity || 1);
    const cost = Number(itm.purchase_price || 0);
    total += qty * cost;

    appendSheetRow("PurchaseItems", {
      item_id: "PI-" + Utilities.getUuid().slice(0, 8).toUpperCase(),
      purchase_id: pid,
      product_id: itm.product_id,
      quantity: qty,
      purchase_price: cost,
      line_total: qty * cost
    });

    // Inward stock increment
    const prods = getSheetObjects("Products");
    const p = prods.find(x => x.product_id === itm.product_id);
    if (p) {
      const prev = Number(p.stock_quantity || 0);
      const newStock = prev + qty;
      updateSheetRow("Products", "product_id", itm.product_id, {
        stock_quantity: newStock,
        purchase_price: cost,
        updated_at: new Date().toISOString()
      });

      appendSheetRow("StockMovements", {
        movement_id: "MOV-" + Utilities.getUuid().slice(0, 8).toUpperCase(),
        product_id: itm.product_id,
        movement_type: "Stock In",
        quantity: qty,
        previous_stock: prev,
        new_stock: newStock,
        reference_id: poNumber,
        reason: "Inward shipment from " + (po.supplier_name || "Supplier"),
        performed_by: "Admin",
        created_at: new Date().toISOString()
      });
    }
  });

  const rec = {
    purchase_id: pid,
    po_number: poNumber,
    supplier_id: po.supplier_id || "",
    supplier_name: po.supplier_name || "Supplier",
    invoice_number: po.invoice_number || "",
    total_amount: total,
    paid_amount: Number(po.paid_amount || total),
    payment_status: "Paid",
    notes: po.notes || "",
    created_at: new Date().toLocaleString()
  };
  appendSheetRow("Purchases", rec);
  return rec;
}

function saveSupplier(s) {
  s.supplier_id = s.supplier_id || ("SUP" + Utilities.getUuid().slice(0, 6).toUpperCase());
  s.created_at = s.created_at || new Date().toISOString();
  const exists = updateSheetRow("Suppliers", "supplier_id", s.supplier_id, s);
  if (!exists) appendSheetRow("Suppliers", s);
  return s;
}

function deleteSupplier(id) {
  const sheet = getSheet("Suppliers");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { deleted: true };
    }
  }
  return { deleted: false };
}

function saveCustomer(c) {
  c.customer_id = c.customer_id || ("CUST" + Utilities.getUuid().slice(0, 6).toUpperCase());
  c.created_at = c.created_at || new Date().toISOString();
  const exists = updateSheetRow("Customers", "customer_id", c.customer_id, c);
  if (!exists) appendSheetRow("Customers", c);
  return c;
}

function deleteCustomer(id) {
  const sheet = getSheet("Customers");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { deleted: true };
    }
  }
  return { deleted: false };
}

function updatePrices(productId, prices) {
  updateSheetRow("Products", "product_id", productId, {
    purchase_price: prices.purchase_price,
    selling_price: prices.selling_price,
    wholesale_price: prices.wholesale_price,
    updated_at: new Date().toISOString()
  });
  return { updated: true };
}

function batchSync(payload) {
  if (!payload) return { synced: false };
  Object.keys(payload).forEach(sheetName => {
    if (SHEETS[sheetName]) {
      const sheet = getSheet(sheetName);
      sheet.clear();
      const rows = payload[sheetName];
      if (rows && rows.length) {
        sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
        sheet.setFrozenRows(1);
      }
    }
  });
  return { synced: true, timestamp: new Date().toISOString() };
}

// ----------------- Initial Database & Seed Setup -----------------

function setupDatabase() {
  const ss = getSpreadsheet();
  
  // Create all sheets with frozen headers
  Object.keys(SHEETS).forEach(name => {
    let sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    sheet.clear();
    const headers = SHEETS[name];
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#F1F5F9");
  });

  // Seed 20 Electrical Racks
  const racksSheet = ss.getSheetByName("Racks");
  const racks = [
    ["R1", "Bulbs", "பல்புகள்", "lightbulb", "C_BULBS", 95, "Active", "LED Bulbs, Incandescent, Smart Bulbs"],
    ["R2", "Wires", "கம்பிகள் / ஒயர்கள்", "cable", "C_WIRES", 89, "Active", "Copper wire coils, FR wires"],
    ["R3", "Switches", "சுவிட்சுகள்", "toggle-right", "C_SWITCH", 90, "Active", "Modular switches, sockets"],
    ["R4", "Cables", "கேபிள்கள்", "git-commit", "C_CABLES", 88, "Active", "Industrial heavy-duty cables"],
    ["R5", "Sockets", "சாக்கெட்டுகள்", "plug", "C_SOCKET", 76, "Active", "3-pin, 2-pin universal sockets"],
    ["R6", "Fuses", "ஃப்யூஸ்கள்", "shield-alert", "C_FUSE", 70, "Active", "Rewirable kit-kat fuses"],
    ["R7", "MCBs", "எம்.சி.பி", "cpu", "C_MCB", 68, "Active", "Miniature circuit breakers, isolators"],
    ["R8", "LEDs", "எல்.இ.டி", "sun", "C_LEDS", 92, "Active", "LED panels, downlights"],
    ["R9", "Fans", "மின் விசிறிகள்", "wind", "C_FANS", 22, "Active", "Ceiling fans, exhaust fans"],
    ["R10", "Lighting", "விளக்குகள்", "lamp", "C_LIGHT", 98, "Active", "Decorative fixtures, floodlights"],
    ["R11", "Junction Box", "ஜங்ஷன் பாக்ஸ்", "square", "C_JBOX", 65, "Active", "Concealed & surface boxes"],
    ["R12", "Tools", "கருவிகள்", "wrench", "C_TOOLS", 11, "Active", "Pliers, testers, screwdrivers"],
    ["R13", "Hardware", "வன்பொருள்", "hammer", "C_HARDWARE", 85, "Active", "Screws, clips, wall plugs"],
    ["R14", "Raw Material", "மூலப்பொருட்கள்", "box", "C_RAW", 75, "Active", "Insulation PVC, copper terminals"],
    ["R15", "Panels", "பேனல்கள்", "layers", "C_PANELS", 76, "Active", "Distribution boards, panel boxes"],
    ["R16", "Sensors", "சென்சார்கள்", "radio", "C_SENSORS", 40, "Active", "Motion sensors, dusk-to-dawn"],
    ["R17", "Motors", "மோட்டார்கள்", "disc", "C_MOTORS", 55, "Active", "Submersible water pump motors"],
    ["R18", "Batteries", "பேட்டரிகள்", "battery-charging", "C_BATTERY", 60, "Active", "Inverter batteries, dry cells"],
    ["R19", "Connectors", "இணைப்பிகள்", "link", "C_CONNECT", 85, "Active", "Terminal blocks, wire caps"],
    ["R20", "Safety Gear", "பாதுகாப்பு சாதனங்கள்", "shield", "C_SAFETY", 60, "Active", "Insulated gloves, helmets"]
  ];
  racksSheet.getRange(2, 1, racks.length, racks[0].length).setValues(racks);

  // Seed Categories
  const catsSheet = ss.getSheetByName("Categories");
  const cats = [
    ["C_BULBS", "Bulbs & Lamps", "பல்புகள் மற்றும் விளக்குகள்", "bulbs", "All LED, CFL and filament bulbs", "R1", 1, 1],
    ["C_WIRES", "Wires & Conduits", "கம்பிகள் மற்றும் குழாய்கள்", "wires", "House wiring, PVC conduits", "R2", 2, 1],
    ["C_SWITCH", "Switches & Accessories", "சுவிட்சுகள் மற்றும் பாகங்கள்", "switches", "Modular & non-modular switches", "R3", 3, 1],
    ["C_CABLES", "Industrial Cables", "தொழில்துறை கேபிள்கள்", "cables", "Submersible flat & armored cables", "R4", 4, 1],
    ["C_SOCKET", "Sockets & Plugs", "சாக்கெட்டுகள் மற்றும் பிளக்ஸ்", "sockets", "Wall sockets, industrial plugs", "R5", 5, 1],
    ["C_FUSE", "Fuses & Protection", "ஃப்யூஸ்கள் மற்றும் பாதுகாப்பு", "fuses", "Kit-kat fuses and safety protection", "R6", 6, 1],
    ["C_MCB", "Circuit Breakers (MCB/DB)", "சர்க்யூட் பிரேக்கர்கள்", "mcb", "Single pole, double pole MCBs", "R7", 7, 1],
    ["C_LEDS", "LED Panels & Downlights", "எல்.இ.டி பேனல்கள்", "leds", "Ceiling downlights, slim panels", "R8", 8, 1],
    ["C_FANS", "Fans & Ventilation", "மின் விசிறிகள்", "fans", "High-speed ceiling fans and exhausts", "R9", 9, 1],
    ["C_LIGHT", "Decorative & Commercial", "அலங்கார விளக்குகள்", "lighting", "Gate lights, floodlights and battens", "R10", 10, 1],
    ["C_TOOLS", "Electrician Tools", "எலக்ட்ரீஷியன் கருவிகள்", "tools", "Professional multimeters, pliers", "R12", 11, 1],
    ["C_PANELS", "Distribution Boards", "டிஸ்ட்ரிபியூஷன் போர்டுகள்", "panels", "Metal and plastic enclosures", "R15", 12, 1]
  ];
  catsSheet.getRange(2, 1, cats.length, cats[0].length).setValues(cats);

  // Seed Brands
  const brandsSheet = ss.getSheetByName("Brands");
  const brands = [
    ["B_PHILIPS", "Philips", "Leading lighting & LED solutions", "philips", 1],
    ["B_SYSKA", "Syska", "LED lighting and smart appliances", "syska", 1],
    ["B_CROMPTON", "Crompton", "Pumps, fans and home appliances", "crompton", 1],
    ["B_BAJAJ", "Bajaj", "Electrical goods and appliances", "bajaj", 1],
    ["B_HAVELLS", "Havells", "Fast moving electrical goods (FMEG)", "havells", 1],
    ["B_FINOLEX", "Finolex", "Premium wires and agricultural cables", "finolex", 1],
    ["B_ANCHOR", "Anchor by Panasonic", "Switches, wires and accessories", "anchor", 1],
    ["B_LEGRAND", "Legrand", "Luxury switches and circuit protection", "legrand", 1],
    ["B_POLYCAB", "Polycab", "Cables, wires and solar solutions", "polycab", 1],
    ["B_VGUARD", "V-Guard", "Stabilizers, water heaters and inverters", "vguard", 1]
  ];
  brandsSheet.getRange(2, 1, brands.length, brands[0].length).setValues(brands);

  // Seed Products
  const prodsSheet = ss.getSheetByName("Products");
  const prods = [
    ["P101", "Syska 9W LED Bulb Cool Day Light", "சிஸ்கா 9வாட் எல்.இ.டி பல்பு", "SYS-9W-LED", "890123456001", "C_BULBS", "R1", "B_SYSKA", "SSK-SRL-9W", "Piece", 65.0, 110.0, 95.0, 250, 25, "https://images.unsplash.com/photo-1550524514-9b6058e59265?w=200", "9 Watt B22 LED Bulb", 1, new Date().toISOString()],
    ["P102", "Philips 9W LED Bulb Stellar Bright", "பிலிப்ஸ் 9வாட் எல்.இ.டி பல்பு", "PHI-9W-LED", "890123456002", "C_BULBS", "R1", "B_PHILIPS", "PHIL-B22-9W", "Piece", 70.0, 120.0, 105.0, 180, 20, "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200", "Philips Stellar Bright 9W LED Bulb", 1, new Date().toISOString()],
    ["P103", "Crompton EcoFit LED Tube 18W", "கிராம்ப்டன் 18வாட் டியூப் லைட்", "CRO-18W-TUB", "890123456003", "C_BULBS", "R1", "B_CROMPTON", "CR-TUB-18W", "Piece", 120.0, 210.0, 180.0, 120, 15, "https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=200", "4 feet 18W LED Batten Tube Light", 1, new Date().toISOString()],
    ["P104", "Bajaj 9W LED Bulb White Crystal", "பஜாஜ் 9வாட் எல்.இ.டி பல்பு", "BAJ-9W-LED", "890123456004", "C_BULBS", "R1", "B_BAJAJ", "BJ-LED-9W", "Piece", 60.0, 105.0, 90.0, 15, 20, "https://images.unsplash.com/photo-1550524514-9b6058e59265?w=200", "Energy efficient B22 bulb", 1, new Date().toISOString()],
    ["P105", "Havells 12W LED Bulb Adore", "ஹேவல்ஸ் 12வாட் எல்.இ.டி பல்பு", "HAV-12W-LED", "890123456005", "C_BULBS", "R1", "B_HAVELLS", "HAV-ADR-12W", "Piece", 95.0, 160.0, 140.0, 85, 15, "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200", "Havells 12W bright LED bulb", 1, new Date().toISOString()],
    ["P106", "Finolex 2.5sqmm FR House Wire (90m)", "பினோலெக்ஸ் 2.5 சதுர மி.மீ வயர்", "FIN-2.5-WIR", "890123456006", "C_WIRES", "R2", "B_FINOLEX", "FIN-FR-25", "Coil", 1150.0, 1550.0, 1420.0, 480, 50, "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200", "100% pure electrolytic copper wire", 1, new Date().toISOString()],
    ["P107", "Finolex 1.5sqmm FR House Wire (90m)", "பினோலெக்ஸ் 1.5 சதுர மி.மீ வயர்", "FIN-1.5-WIR", "890123456007", "C_WIRES", "R2", "B_FINOLEX", "FIN-FR-15", "Coil", 780.0, 1050.0, 960.0, 320, 40, "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200", "1.5 sq mm copper wire", 1, new Date().toISOString()],
    ["P108", "Polycab 4.0sqmm Heavy Duty Wire (90m)", "பாலிகேப் 4.0 சதுர மி.மீ வயர்", "POL-4.0-WIR", "890123456008", "C_WIRES", "R2", "B_POLYCAB", "POL-FR-40", "Coil", 1750.0, 2350.0, 2150.0, 110, 20, "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200", "4 sq mm wire for AC circuits", 1, new Date().toISOString()],
    ["P110", "Havells Fabio 6A 1-Way Modular Switch", "ஹேவல்ஸ் 6A சுவிட்ச்", "HAV-6A-SW1", "890123456010", "C_SWITCH", "R3", "B_HAVELLS", "FAB-6A-1W", "Piece", 24.0, 42.0, 35.0, 420, 50, "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200", "Gloss white 6 Amp modular switch", 1, new Date().toISOString()],
    ["P114", "Havells 12W LED Slim Panel Round", "ஹேவல்ஸ் 12வாட் எல்.இ.டி பேனல்", "HAV-12W-PAN", "890123456014", "C_LEDS", "R8", "B_HAVELLS", "12WH8N-PANEL", "Piece", 190.0, 350.0, 290.0, 115, 20, "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=200", "12W Round Slim Recessed Panel", 1, new Date().toISOString()],
    ["P117", "Schneider 16A Single Pole C-Curve MCB", "ஷ்னைடர் 16A ஒற்றை துருவ MCB", "SCH-16A-MCB", "890123456017", "C_MCB", "R7", "B_LEGRAND", "A9K-16A", "Piece", 110.0, 190.0, 160.0, 140, 20, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200", "C-Curve 16A Single Pole MCB", 1, new Date().toISOString()],
    ["P120", "Crompton Hill Briz 1200mm Ceiling Fan", "கிராம்ப்டன் 1200மி.மீ சீலிங் ஃபேன்", "CRO-1200-FAN", "890123456020", "C_FANS", "R9", "B_CROMPTON", "HB-1200-BRW", "Piece", 1250.0, 1850.0, 1650.0, 60, 10, "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=200", "1200mm high air delivery fan", 1, new Date().toISOString()]
  ];
  prodsSheet.getRange(2, 1, prods.length, prods[0].length).setValues(prods);

  return { setup: true, spreadsheetUrl: ss.getUrl() };
}
