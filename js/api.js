/**
 * Unified Google Apps Script Web App Client & Offline Sync Engine
 * Connects directly to Google Spreadsheet database via Google Apps Script Web App.
 */

const API = {
    getApiUrl() {
        const db = LocalDB.load();
        return (db.settings && db.settings.APPS_SCRIPT_URL) ? db.settings.APPS_SCRIPT_URL.trim() : "";
    },

    setApiUrl(url) {
        const db = LocalDB.load();
        db.settings = db.settings || {};
        db.settings.APPS_SCRIPT_URL = url.trim();
        LocalDB.save(db);
    },

    async callAppsScript(action, payload = {}) {
        const url = this.getApiUrl();
        if (!url) return null; // Fall back to LocalDB

        try {
            // Note: Sending 'text/plain;charset=utf-8' is standard for Google Apps Script Web Apps to avoid CORS OPTIONS preflight
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action, ...payload })
            });

            const result = await response.json();
            if (!result.ok) throw new Error(result.error || "Google Sheets API Error");
            return result.data;
        } catch (err) {
            console.warn("Apps Script remote call warning, using local cache:", err);
            return null;
        }
    },

    // 1. Initial Data Load & Sync
    async getAllData() {
        const remote = await this.callAppsScript("getAllData");
        const local = LocalDB.load();

        if (remote && remote.products && remote.products.length) {
            local.products = remote.products;
            if (remote.sales) local.sales = remote.sales;
            if (remote.suppliers) local.suppliers = remote.suppliers;
            if (remote.customers) local.customers = remote.customers;
            LocalDB.save(local);
            return local;
        }
        return local;
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

        // Remote push
        this.callAppsScript("saveProduct", { product });
        return product;
    },

    async deleteProduct(productId) {
        const db = LocalDB.load();
        const p = db.products.find(x => x.product_id === productId);
        if (p) p.is_active = 0;
        LocalDB.save(db);

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

        (po.items || []).forEach(itm => {
            const p = db.products.find(x => x.product_id === itm.product_id);
            if (p) {
                const qty = Number(itm.quantity || 1);
                const cost = Number(itm.purchase_price || 0);
                total += qty * cost;
                totalQty += qty;

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
            items_count: (po.items || []).length,
            total_quantity: totalQty,
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
