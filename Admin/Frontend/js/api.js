/**
 * Unified Google Apps Script Web App Client & Offline Sync Engine
 * Connects directly to Google Spreadsheet database via Google Apps Script Web App.
 */

const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyugtl-Hl3U1Zmv_HjKlcTi2Homf5rheNQltW3VHGwrYJ7lKc03a_45HdJxvkgL25qEMw/exec";

function broadcastDeepuSync(type, details = {}) {
    try {
        localStorage.setItem("deepu_sync_heartbeat", String(Date.now()));
    } catch (e) {}
    try {
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            if (!window.__deepu_bus) window.__deepu_bus = new BroadcastChannel("deepu_sync_bus");
            window.__deepu_bus.postMessage({ type, details, timestamp: Date.now() });
        }
    } catch (e) {}
}

const API = {
    getApiUrl() {
        const db = LocalDB.load();
        const savedUrl = db.settings && db.settings.APPS_SCRIPT_URL;
        return savedUrl && savedUrl.trim() ? savedUrl.trim() : DEFAULT_APPS_SCRIPT_URL;
    },

    setApiUrl(url) {
        const db = LocalDB.load();
        db.settings = db.settings || {};
        db.settings.APPS_SCRIPT_URL = url.trim();
        LocalDB.save(db);
    },

    async callAppsScript(action, payload = {}) {
        const url = this.getApiUrl();
        const request = { action, ...payload };
        if (action !== "login" && typeof sessionStorage !== "undefined") {
            const token = sessionStorage.getItem("deepu_admin_token");
            if (token) request.token = token;
        }

        try {
            // Note: Sending 'text/plain;charset=utf-8' is standard for Google Apps Script Web Apps to avoid CORS OPTIONS preflight
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(request)
            });

            const result = await response.json();
            if (!result.ok) throw new Error(result.error || "Google Sheets API Error");
            return result.data;
        } catch (err) {
            if (action === "login") throw err;
            if (err.message && err.message.indexOf("Admin session expired") !== -1) {
                sessionStorage.removeItem("deepu_admin_token");
                window.location.reload();
                throw err;
            }
            console.warn("Apps Script remote call warning, using local cache:", err);
            return null;
        }
    },

    // 1. Initial Data Load & Sync
    async getAllData() {
        const remote = await this.callAppsScript("getAllData");
        const local = LocalDB.load();

        if (remote && typeof remote === "object") {
            ["products", "racks", "categories", "brands", "sales", "purchases", "purchaseItems", "suppliers", "customers", "movements", "enquiries", "orders"].forEach(key => {
                if (Array.isArray(remote[key])) local[key] = remote[key];
            });
            if (remote.settings && typeof remote.settings === "object") local.settings = remote.settings;
            LocalDB.save(local);
        }
        return local;
    },

    // Customer Purchases & Orders (Live Two-Way Google Sheets Sync)
    async getOrders() {
        const remote = await this.callAppsScript("getOrders");
        const db = LocalDB.load();
        if (remote && Array.isArray(remote)) {
            db.orders = remote;
            LocalDB.save(db);
            return remote;
        }
        return db.orders || [];
    },

    async createOrder(order) {
        const db = LocalDB.load();
        db.orders = db.orders || [];
        order.order_id = order.order_id || ("ORD-" + Date.now().toString(36).toUpperCase());
        order.status = order.status || "Pending";
        order.created_at = order.created_at || new Date().toISOString();
        db.orders.unshift(order);

        // Decrement stock in local DB
        if (Array.isArray(order.items)) {
            order.items.forEach(it => {
                const p = (db.products || []).find(x => x.product_id === (it.product_id || it.id));
                if (p) {
                    const prev = Number(p.stock_quantity || 0);
                    p.stock_quantity = Math.max(0, prev - Number(it.quantity || it.qty || 1));
                }
            });
        }
        LocalDB.save(db);
        broadcastDeepuSync("ORDER_CREATED", { order });

        // Sync with Google Sheets backend
        const remote = await this.callAppsScript("createOrder", { order });
        return remote || order;
    },

    async updateOrderStatus(orderId, newStatus) {
        const db = LocalDB.load();
        db.orders = db.orders || [];
        const ord = db.orders.find(o => o.order_id === orderId);
        if (ord) {
            ord.status = newStatus;
            ord.updated_at = new Date().toISOString();
        }
        if (db.sales) {
            const s = db.sales.find(x => x.sale_id === orderId || x.invoice_no === orderId);
            if (s) s.status = newStatus;
        }
        LocalDB.save(db);
        broadcastDeepuSync("ORDER_UPDATED", { order_id: orderId, status: newStatus });

        // Sync with Google Sheets backend
        const remote = await this.callAppsScript("updateOrderStatus", { order_id: orderId, status: newStatus });
        return { ok: true, order_id: orderId, status: newStatus, remote };
    },

    // Customer enquiries / quote requests / dealer applications sent from the user website
    async updateEnquiry(enquiryId, fields) {
        const db = LocalDB.load();
        db.enquiries = db.enquiries || [];
        const e = db.enquiries.find(x => x.enquiry_id === enquiryId);
        if (e) Object.assign(e, fields);
        LocalDB.save(db);
        broadcastDeepuSync("ENQUIRY_UPDATED", { enquiry_id: enquiryId });
        const remote = await this.callAppsScript("updateEnquiry", { enquiry_id: enquiryId, fields });
        return { updated: !!e, remote: remote || null };
    },

    async deleteEnquiry(enquiryId) {
        const db = LocalDB.load();
        db.enquiries = (db.enquiries || []).filter(x => x.enquiry_id !== enquiryId);
        LocalDB.save(db);
        broadcastDeepuSync("ENQUIRY_DELETED", { enquiry_id: enquiryId });
        return { deleted: true };
    },

    async getRemoteSales() {
        const remote = await this.callAppsScript("getAllData");
        const db = LocalDB.load();
        if (remote && Array.isArray(remote.sales) && remote.sales.length > 0) {
            db.sales = remote.sales;
            LocalDB.save(db);
            return remote.sales;
        }
        return (db.sales && db.sales.length > 0) ? db.sales : (SEED_DATA.sales || []);
    },

    // 2. Products CRUD
    async getProducts() {
        const remote = await this.callAppsScript("getProducts");
        const db = LocalDB.load();
        if (remote && Array.isArray(remote)) {
            db.products = remote;
            LocalDB.save(db);
        }
        return db.products.filter(p => p.is_active != 0);
    },

    async saveProduct(product) {
        const db = LocalDB.load();
        product.product_id = product.product_id || ("P" + Date.now().toString(36).toUpperCase());
        product.is_active = 1;

        const idx = db.products.findIndex(p => p.product_id === product.product_id);
        if (idx >= 0) {
            db.products[idx] = { ...db.products[idx], ...product };
        } else {
            db.products.unshift(product);
            if (Number(product.stock_quantity) > 0) {
                db.movements.unshift({
                    movement_id: "MOV-" + Date.now(),
                    product_name: product.name,
                    sku: product.sku,
                    movement_type: "Stock In",
                    quantity: Number(product.stock_quantity),
                    previous_stock: 0,
                    new_stock: Number(product.stock_quantity),
                    reference_id: product.sku,
                    reason: "Initial product creation",
                    performed_by: "Admin",
                    created_at: new Date().toLocaleString()
                });
            }
        }
        LocalDB.save(db);
        broadcastDeepuSync("INVENTORY_UPDATED", { product });

        // Remote push
        this.callAppsScript("saveProduct", { product });
        return product;
    },

    async updatePrices(productId, prices) {
        const db = LocalDB.load();
        const product = db.products.find(item => item.product_id === productId);
        if (!product) throw new Error("Product not found");

        Object.assign(product, prices);
        LocalDB.save(db);
        broadcastDeepuSync("INVENTORY_UPDATED", { productId, prices });
        await this.callAppsScript("updatePrices", { product_id: productId, prices });
        return product;
    },

    async deleteProduct(productId) {
        const db = LocalDB.load();
        const p = db.products.find(x => x.product_id === productId);
        if (p) p.is_active = 0;
        LocalDB.save(db);
        broadcastDeepuSync("INVENTORY_UPDATED", { productId });

        this.callAppsScript("deleteProduct", { product_id: productId });
        return { deleted: true };
    },

    async adjustStock(productId, delta, movementType, reason) {
        const db = LocalDB.load();
        const p = db.products.find(x => x.product_id === productId);
        if (!p) throw new Error("Product not found");

        const prev = Number(p.stock_quantity || 0);
        const newStock = Math.max(0, prev + Number(delta));
        p.stock_quantity = newStock;

        db.movements.unshift({
            movement_id: "MOV-" + Date.now(),
            product_name: p.name,
            sku: p.sku,
            movement_type: movementType,
            quantity: Number(delta),
            previous_stock: prev,
            new_stock: newStock,
            reference_id: "MANUAL",
            reason: reason || "Manual adjustment",
            performed_by: "Admin",
            created_at: new Date().toLocaleString()
        });
        LocalDB.save(db);
        broadcastDeepuSync("INVENTORY_UPDATED", { productId, delta, newStock });

        this.callAppsScript("adjustStock", {
            product_id: productId,
            delta: delta,
            movement_type: movementType,
            reason: reason
        });

        return { product_id: productId, previous_stock: prev, new_stock: newStock };
    },

    // 3. Sales & POS Billing
    async createSale(sale) {
        const db = LocalDB.load();
        const saleId = "SAL-" + Date.now().toString(36).toUpperCase();
        const invoiceNo = "SAL-" + new Date().getFullYear() + "-" + String(db.sales.length + 101).padStart(5, "0");

        let subtotal = 0;
        const lineItems = [];

        (sale.items || []).forEach(itm => {
            const p = db.products.find(x => x.product_id === itm.product_id);
            if (p) {
                const qty = Number(itm.quantity || 1);
                const rate = Number(itm.unit_price || p.selling_price);
                subtotal += qty * rate;

                lineItems.push({
                    product_id: itm.product_id,
                    product_name: p.name,
                    sku: p.sku,
                    quantity: qty,
                    unit_price: rate,
                    line_total: qty * rate
                });

                // Decrement stock
                const prev = Number(p.stock_quantity || 0);
                p.stock_quantity = Math.max(0, prev - qty);

                db.movements.unshift({
                    movement_id: "MOV-" + Date.now(),
                    product_name: p.name,
                    sku: p.sku,
                    movement_type: "Sale",
                    quantity: -qty,
                    previous_stock: prev,
                    new_stock: p.stock_quantity,
                    reference_id: invoiceNo,
                    reason: `Sold to ${sale.customer_name || 'Walk-in'}`,
                    performed_by: "Admin",
                    created_at: new Date().toLocaleString()
                });
            }
        });

        const discount = Number(sale.discount_amount || 0);
        const taxRate = Number(sale.tax_rate || 0);
        const taxable = Math.max(0, subtotal - discount);
        const tax = taxable * (taxRate / 100);
        const grandTotal = taxable + tax;
        const paid = Number(sale.paid_amount || grandTotal);

        const rec = {
            sale_id: saleId,
            invoice_no: invoiceNo,
            customer_name: sale.customer_name || "Walk-in Customer",
            customer_phone: sale.customer_phone || "",
            subtotal: subtotal,
            discount_amount: discount,
            tax_amount: tax,
            grand_total: grandTotal,
            paid_amount: paid,
            balance_amount: Math.max(0, grandTotal - paid),
            payment_mode: sale.payment_mode || "Cash",
            status: "Completed",
            items: lineItems,
            items_count: lineItems.length,
            total_quantity: lineItems.reduce((acc, x) => acc + x.quantity, 0),
            created_at: new Date().toLocaleString(),
            shop_info: db.settings
        };

        db.sales.unshift(rec);
        LocalDB.save(db);
        broadcastDeepuSync("SALE_CREATED", { sale: rec });

        this.callAppsScript("createSale", { sale: rec });
        return rec;
    },

    async returnSale(saleId, reason) {
        const db = LocalDB.load();
        const sale = db.sales.find(s => s.sale_id === saleId);
        if (sale) {
            sale.status = "Returned";
            LocalDB.save(db);
        }
        this.callAppsScript("returnSale", { sale_id: saleId, reason });
        return { status: "success" };
    },

    // 4. Purchases
    async createPurchase(po) {
        const db = LocalDB.load();
        const pid = "PO-" + Date.now().toString(36).toUpperCase();
        const poNum = "PO-" + new Date().getFullYear() + "-" + String(db.purchases.length + 1).padStart(4, "0");

        let total = 0;
        let totalQty = 0;
        const lineItems = [];

        (po.items || []).forEach(itm => {
            const p = db.products.find(x => x.product_id === itm.product_id);
            if (p) {
                const qty = Number(itm.quantity || 1);
                const cost = Number(itm.purchase_price || 0);
                total += qty * cost;
                totalQty += qty;

                lineItems.push({
                    product_id: p.product_id,
                    product_name: p.name,
                    sku: p.sku,
                    quantity: qty,
                    purchase_price: cost,
                    line_total: qty * cost
                });

                // Inward stock increment
                const prev = Number(p.stock_quantity || 0);
                p.stock_quantity = prev + qty;
                p.purchase_price = cost;

                db.movements.unshift({
                    movement_id: "MOV-" + Date.now(),
                    product_name: p.name,
                    sku: p.sku,
                    movement_type: "Stock In",
                    quantity: qty,
                    previous_stock: prev,
                    new_stock: p.stock_quantity,
                    reference_id: poNum,
                    reason: `Inward shipment from ${po.supplier_name || 'Supplier'}`,
                    performed_by: "Admin",
                    created_at: new Date().toLocaleString()
                });
            }
        });

        const rec = {
            purchase_id: pid,
            po_number: poNum,
            supplier_name: po.supplier_name || "Supplier",
            invoice_number: po.invoice_number || "",
            total_amount: total,
            paid_amount: Number(po.paid_amount || total),
            payment_status: "Paid",
            items_count: lineItems.length,
            total_quantity: totalQty,
            items: lineItems,
            created_at: new Date().toLocaleString()
        };

        db.purchases.unshift(rec);
        LocalDB.save(db);

        this.callAppsScript("createPurchase", { purchase: rec });
        return rec;
    },

    // 5. Suppliers & Customers
    async saveSupplier(sup) {
        const db = LocalDB.load();
        sup.supplier_id = sup.supplier_id || ("SUP" + Date.now().toString(36).toUpperCase());
        const idx = db.suppliers.findIndex(s => s.supplier_id === sup.supplier_id);
        if (idx >= 0) db.suppliers[idx] = sup;
        else db.suppliers.unshift(sup);
        LocalDB.save(db);
        this.callAppsScript("saveSupplier", { supplier: sup });
        return sup;
    },

    async deleteSupplier(id) {
        const db = LocalDB.load();
        db.suppliers = db.suppliers.filter(s => s.supplier_id !== id);
        LocalDB.save(db);
        this.callAppsScript("deleteSupplier", { supplier_id: id });
        return { deleted: true };
    },

    async saveCustomer(cust) {
        const db = LocalDB.load();
        cust.customer_id = cust.customer_id || ("CUST" + Date.now().toString(36).toUpperCase());
        const idx = db.customers.findIndex(c => c.customer_id === cust.customer_id);
        if (idx >= 0) db.customers[idx] = cust;
        else db.customers.unshift(cust);
        LocalDB.save(db);
        this.callAppsScript("saveCustomer", { customer: cust });
        return cust;
    },

    async deleteCustomer(id) {
        const db = LocalDB.load();
        db.customers = db.customers.filter(c => c.customer_id !== id);
        LocalDB.save(db);
        this.callAppsScript("deleteCustomer", { customer_id: id });
        return { deleted: true };
    },

    // 6. Toast Notifications
    showToast(message, type = "success") {
        let container = document.getElementById("toastContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "toastContainer";
            container.className = "toast-container";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = `toast toast-${type} toast-enter`;
        const icon = type === "success" ? "✓" : (type === "error" ? "⚠" : "ℹ");
        toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-msg">${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove("toast-enter");
            toast.classList.add("toast-exit");
            setTimeout(() => toast.remove(), 400);
        }, 3200);
    }
};
