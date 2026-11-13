/**
 * Deepu Enterprises - Electrical & Electronics Inventory Management System
 * Pure HTML5, CSS3, JavaScript SPA Controller with local inventory data
 */

// Global Application State
const STATE = {
    currentView: "dashboard",
    products: [],
    racks: [],
    categories: [],
    brands: [],
    sales: [],
    salesSourceAvailable: false,
    purchases: [],
    purchaseItems: [],
    suppliers: [],
    customers: [],
    movements: [],
    enquiries: [],
    orders: [],
    settings: {},
    cart: [],
    selectedRack: null,
    selectedBrand: null,
    selectedSalesYear: null,
    salesActiveTab: "orders",
    productViewMode: "grid", // 'grid' or 'table'
};

// ----------------- Initialization -----------------

async function initializeAdminApp() {
    setupEventListeners();
    await loadInitialData();
    navigateTo(STATE.currentView);
    setupRealtimeSync();
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.adminAuthenticated === "false") {
        document.addEventListener("admin-authenticated", initializeAdminApp, { once: true });
        return;
    }

    initializeAdminApp();
});

async function loadInitialData() {
    try {
        const data = await API.getAllData();
        const products = data.products || [];
        const cellsAssigned = assignDefaultRackCells(products);
        STATE.products = products;
        if (cellsAssigned) {
            const db = LocalDB.load();
            db.products = products;
            LocalDB.save(db);
        }
        STATE.racks = data.racks || [];
        STATE.categories = data.categories || [];
        STATE.brands = data.brands || [];
        STATE.sales = data.sales || [];
        STATE.purchases = data.purchases || [];
        STATE.purchaseItems = data.purchaseItems || [];
        STATE.suppliers = data.suppliers || [];
        STATE.customers = data.customers || [];
        STATE.movements = data.movements || [];
        STATE.enquiries = data.enquiries || [];
        STATE.orders = data.orders || [];
        STATE.settings = data.settings || {};
    } catch (e) {
        console.error("Initial data load failed:", e);
    }
}

function assignDefaultRackCells(products) {
    const nextCellByRack = new Map();
    let changed = false;
    products.forEach(product => {
        if (!product.rack_id) return;
        const cell = Number(product.rack_cell);
        if (Number.isInteger(cell) && cell >= 1 && cell <= 5) return;
        const nextCell = nextCellByRack.get(product.rack_id) || 1;
        product.rack_cell = String(nextCell);
        nextCellByRack.set(product.rack_id, nextCell % 5 + 1);
        changed = true;
    });
    return changed;
}

function renderCurrentAdminView() {
    if (STATE.currentView === "dashboard") renderDashboardView();
    else if (STATE.currentView === "sales") renderSalesView(STATE.salesActiveTab);
    else if (STATE.currentView === "products") renderProductsView();
    else if (STATE.currentView === "stock") renderStockAlertsView();
    else if (STATE.currentView === "reports") renderReportsView(true);
    else if (STATE.currentView === "enquiries") renderEnquiriesView();
    else if (STATE.currentView === "prices") renderPricesView();
    else if (STATE.currentView === "purchases") renderPurchasesView();
    else if (STATE.currentView === "suppliers") renderSuppliersView();
    else if (STATE.currentView === "settings") renderSettingsView();
}

function setupRealtimeSync() {
    function isUserBusy() {
        if (document.body.classList.contains("modal-open") || document.querySelector(".modal-backdrop.open")) {
            return true;
        }
        const active = document.activeElement;
        if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT")) {
            return true;
        }
        return false;
    }

    function dataHasChanged(newData) {
        if (!newData) return false;
        if (Array.isArray(newData.orders) && JSON.stringify(newData.orders) !== JSON.stringify(STATE.orders)) return true;
        if (Array.isArray(newData.products) && JSON.stringify(newData.products) !== JSON.stringify(STATE.products)) return true;
        if (Array.isArray(newData.sales) && JSON.stringify(newData.sales) !== JSON.stringify(STATE.sales)) return true;
        if (Array.isArray(newData.enquiries) && JSON.stringify(newData.enquiries) !== JSON.stringify(STATE.enquiries)) return true;
        return false;
    }

    function handleLiveSync() {
        const db = LocalDB.load();
        if (!dataHasChanged(db)) return;

        STATE.products = db.products || [];
        STATE.orders = db.orders || [];
        STATE.sales = (db.sales && db.sales.length > 0) ? db.sales : (SEED_DATA.sales || []);
        STATE.enquiries = db.enquiries || [];
        STATE.movements = db.movements || [];
        STATE.customers = db.customers || [];
        STATE.suppliers = db.suppliers || [];
        STATE.purchases = db.purchases || [];
        STATE.settings = db.settings || {};

        if (!isUserBusy()) {
            renderCurrentAdminView();
        }
    }

    if ("BroadcastChannel" in window) {
        try {
            const bus = new BroadcastChannel("deepu_sync_bus");
            bus.onmessage = (event) => {
                handleLiveSync();
            };
            window.__deepu_bus = bus;
        } catch (e) {}
    }

    window.addEventListener("storage", e => {
        if (e.key === "deepu_electrical_v3_kn" || e.key === "deepu_orders" || e.key === "deepu_user_orders") {
            handleLiveSync();
        }
    });

    setInterval(async () => {
        try {
            if (!API.getApiUrl()) return;

            if (STATE.currentView === "reports") {
                const remoteSales = await API.getRemoteSales();
                if (Array.isArray(remoteSales) && remoteSales.length > 0) {
                    if (JSON.stringify(remoteSales) !== JSON.stringify(STATE.sales)) {
                        STATE.sales = remoteSales;
                        if (!isUserBusy()) {
                            renderReportsView(true);
                        }
                    }
                }
                return;
            }

            const data = await API.getAllData();
            if (data && dataHasChanged(data)) {
                if (Array.isArray(data.products) && data.products.length > 0) STATE.products = data.products;
                if (Array.isArray(data.orders)) STATE.orders = data.orders;
                if (Array.isArray(data.sales) && data.sales.length > 0) STATE.sales = data.sales;
                if (Array.isArray(data.enquiries)) STATE.enquiries = data.enquiries;

                if (!isUserBusy()) {
                    if (STATE.currentView === "dashboard") {
                        renderDashboardView();
                    } else if (STATE.currentView === "sales") {
                        renderSalesView(STATE.salesActiveTab);
                    }
                }
            }
        } catch (e) {
            // silent sync
        }
    }, 15000);
}

// ----------------- Statistics Computations -----------------

function computeDashboardStats() {
    const prods = STATE.products.filter(p => p.is_active != 0);
    const total_products = prods.length;
    const total_stock_units = prods.reduce((acc, p) => acc + Number(p.stock_quantity || 0), 0);
    const total_inventory_value = prods.reduce((acc, p) => acc + (Number(p.stock_quantity || 0) * Number(p.selling_price || 0)), 0);
    const low_stock_count = prods.filter(p => Number(p.stock_quantity || 0) <= Number(p.min_stock_level || 15) && Number(p.stock_quantity || 0) > 0).length;
    const in_stock_count = prods.filter(p => Number(p.stock_quantity || 0) > Number(p.min_stock_level || 15)).length;

    const completedSales = STATE.sales.filter(s => s.status === 'Completed');
    const total_sales_revenue = completedSales.reduce((acc, s) => acc + Number(s.grand_total || 0), 0);
    const total_orders = completedSales.length;
    const avg_order_value = total_orders ? Math.round(total_sales_revenue / total_orders) : 0;
    const total_units_sold = completedSales.reduce((acc, s) => acc + Number(s.total_quantity || 0), 0);

    return {
        total_products,
        total_stock_units,
        total_inventory_value,
        low_stock_count,
        in_stock_count,
        total_sales_revenue,
        total_orders,
        avg_order_value,
        total_units_sold,
        sales_growth: "+12.6%",
        recent_sales: STATE.sales.slice(0, 5),
        top_products: prods.slice(0, 5).map(p => ({
            product_name: p.name,
            sku: p.sku,
            unit: p.unit,
            image_url: p.image_url,
            quantity_sold: Math.floor(Math.random() * 40) + 20,
            sales_amount: p.selling_price * 25
        }))
    };
}

function computeDashboardCharts() {
    return {
        sales_trend: {
            labels: ["01 Nov", "02 Nov", "03 Nov", "04 Nov", "05 Nov", "06 Nov", "Today"],
            revenue: [18200, 22750, 19600, 28900, 35050, 24500, 28400]
        }
    };
}

// ----------------- Navigation & Routing -----------------

function navigateTo(viewName, params = {}) {
    if (viewName === "customers") viewName = "dashboard";

    if (viewName === "products") {
        STATE.selectedRack = params.rackId || null;
        STATE.selectedBrand = params.brandId || null;
    } else {
        if (params.rackId) STATE.selectedRack = params.rackId;
        if (params.brandId) STATE.selectedBrand = params.brandId;
    }
    STATE.currentView = viewName;
    document.getElementById("sidebar")?.classList.remove("mobile-open");
    document.getElementById("mobileMenuToggle")?.setAttribute("aria-expanded", "false");
    document.getElementById("sidebarBackdrop")?.classList.remove("open");

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.toggle("active", item.dataset.view === viewName);
    });

    renderCurrentView();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

window.renderCurrentView = function() {
    const container = document.getElementById("mainContent");
    if (!container) return;

    switch (STATE.currentView) {
        case "dashboard":
            renderDashboardView();
            break;
        case "products":
            renderProductsView();
            break;
        case "sales":
            renderSalesView(STATE.salesActiveTab);
            break;
        case "stock":
            renderStockAlertsView();
            break;
        case "purchases":
            renderPurchasesView();
            break;
        case "suppliers":
            renderSuppliersView();
            break;
        case "prices":
            renderPricesView();
            break;
        case "reports":
            renderReportsView();
            break;
        case "enquiries":
            renderEnquiriesView();
            break;
        case "settings":
            renderSettingsView();
            break;
        default:
            renderDashboardView();
    }
};

// ----------------- View 1: Dashboard -----------------

async function renderDashboardView() {
    const container = document.getElementById("mainContent");
    const s = computeDashboardStats();
    const c = computeDashboardCharts();
    const isKn = CURRENT_LANG === "kn";

    const racksHtml = renderRackCards(isKn);

    const ordersList = STATE.orders || [];
    let ordersRows = ordersList.map(ord => {
        const curStatus = ord.status || "Pending";
        let statusStyle = "background: #FEF3C7; color: #B45309; border: 1px solid #FCD34D;";
        if (curStatus === "Confirmed") statusStyle = "background: #DBEAFE; color: #1E40AF; border: 1px solid #93C5FD;";
        else if (curStatus === "Shipped") statusStyle = "background: #E0E7FF; color: #4338CA; border: 1px solid #A5B4FC;";
        else if (curStatus === "Delivered") statusStyle = "background: #D1FAE5; color: #065F46; border: 1px solid #6EE7B7;";
        else if (curStatus === "Cancelled") statusStyle = "background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5;";

        let itemsDisplay = ord.purchased_items || "";
        if (!itemsDisplay && Array.isArray(ord.items)) {
            itemsDisplay = ord.items.map(i => (i.product_name || i.name || i.product_id) + ' (x' + (i.quantity || 1) + ')').join(', ');
        }
        if (!itemsDisplay) itemsDisplay = "Standard Electrical Lot";

        return `
            <tr>
                <td><b style="color: var(--primary-blue); font-family: monospace; font-size: 0.95rem;">${ord.order_id}</b></td>
                <td><span style="font-size: 0.82rem; color: var(--text-secondary);">${ord.order_date || ord.created_at || '—'}</span></td>
                <td>
                    <div style="font-weight: 700;">${ord.customer_name || 'Customer'}</div>
                    <small style="color: var(--text-muted); font-size: 0.78rem;">📞 ${ord.customer_phone || '—'}</small>
                </td>
                <td style="max-width: 250px; font-size: 0.85rem;" title="${itemsDisplay}">
                    <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${itemsDisplay}
                    </div>
                </td>
                <td><span class="badge" style="background: var(--bg-hover, #F1F5F9); color: var(--text-primary); font-weight: 700; padding: 2px 8px; border-radius: 4px;">${ord.quantity || 1} pcs</span></td>
                <td><b style="font-size: 0.95rem; color: var(--text-primary);">₹ ${Number(ord.total_price || 0).toLocaleString('en-IN')}</b></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; ${statusStyle}">
                            ${curStatus}
                        </span>
                        <select onchange="handleOrderStatusChange('${ord.order_id}', this.value)" style="padding: 2px 6px; font-size: 0.75rem; border-radius: 4px; border: 1px solid var(--border-light, #CBD5E1); background: var(--bg-surface, #FFF); cursor: pointer;" title="Update order status">
                            <option value="Pending" ${curStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Confirmed" ${curStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="Shipped" ${curStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="Delivered" ${curStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="Cancelled" ${curStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                </td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="openOrderDetailsModal('${ord.order_id}')" title="View Order Details">👁 ${t('btn_view_invoice')}</button>
                </td>
            </tr>
        `;
    }).join("") || `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);">${isKn ? "ಯಾವುದೇ ಹೊಸ ಆನ್‌ಲೈನ್ ಆರ್ಡರ್‌ಗಳು ದಾಖಲಾಗಿಲ್ಲ. ವೆಬ್‌ಸೈಟ್ ಖರೀದಿಯ ಮಾಹಿತಿಯು ಇಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪ್ರಕಟಗೊಳ್ಳುತ್ತದೆ." : "No customer orders yet. Purchases completed on the User Page will automatically appear here."}</td></tr>`;

    let recentSalesRows = (s.recent_sales || []).map(sale => `
        <tr>
            <td><b>${sale.invoice_no}</b></td>
            <td>${sale.created_at}</td>
            <td>${sale.customer_name}</td>
            <td>${sale.items_count || 1} (${sale.total_quantity || 1} pcs)</td>
            <td><b>₹ ${Number(sale.grand_total).toLocaleString('en-IN')}</b></td>
            <td><span class="chip-payment ${(sale.payment_mode || 'cash').toLowerCase()}">${sale.payment_mode}</span></td>
            <td><span class="badge-stock in">${isKn ? "ಪೂರ್ಣಗೊಂಡಿದೆ" : "Completed"}</span></td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="openInvoiceModal('${sale.sale_id}')">👁 ${t('btn_view_invoice')}</button>
            </td>
        </tr>
    `).join("") || `<tr><td colspan="8">${isKn ? "ಇತ್ತೀಚಿನ ಮಾರಾಟ ದಾಖಲೆಗಳಿಲ್ಲ" : "No recent sales."}</td></tr>`;

    let topProductsRows = (s.top_products || []).map((tp, idx) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-light);">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-weight: 700; color: var(--text-muted); width: 18px;">${idx + 1}</span>
                <img src="${tp.image_url || 'https://images.unsplash.com/photo-1550524514-9b6058e59265?w=100'}" style="width: 38px; height: 38px; border-radius: 6px; object-fit: cover;">
                <div>
                    <div style="font-size: 0.9rem; font-weight: 700;">${tp.product_name}</div>
                    <small style="color: var(--text-muted);">${tp.sku || ''}</small>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 0.88rem; font-weight: 600;">${tp.quantity_sold} ${tp.unit || 'Units'}</div>
                <div style="font-weight: 800; color: var(--primary-indigo);">₹ ${Number(tp.sales_amount).toLocaleString('en-IN')}</div>
            </div>
        </div>
    `).join("");

    container.innerHTML = `
        <div class="page-header">
            <div class="page-title-group">
                <h1>⚡ ${t('dash_title')}</h1>
                <p>${isKn ? "ಎಲೆಕ್ಟ್ರಿಕಲ್ ಮತ್ತು ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಅಂಗಡಿಯ ಸರಕು ಹಾಗೂ ಮಾರಾಟ ನಿರ್ವಹಣೆ" : "Electrical & electronics inventory, sales tracking and warehouse racks."}</p>
            </div>
            <div class="page-header-actions">
                <button class="btn btn-primary" onclick="openAddProductModal()">+ ${t('btn_add_product')}</button>
                <button class="btn btn-teal" onclick="navigateTo('sales')">🛒 ${t('tab_new_sale')}</button>
            </div>
        </div>

        <div class="stats-grid-4">
            <div class="stat-card">
                <div class="stat-icon-badge blue">📦</div>
                <div class="stat-content">
                    <span class="stat-label">${t('stat_total_stock')}</span>
                    <span class="stat-value">${(s.total_stock_units || 0).toLocaleString('en-IN')}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-badge rose">⚠️</div>
                <div class="stat-content">
                    <span class="stat-label">${t('stat_low_stock')}</span>
                    <span class="stat-value" style="color: var(--danger-red);">${s.low_stock_count || 0}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-badge green">✓</div>
                <div class="stat-content">
                    <span class="stat-label">${t('stat_in_stock')}</span>
                    <span class="stat-value">${s.in_stock_count || 0}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-badge purple">₹</div>
                <div class="stat-content">
                    <span class="stat-label">${t('stat_total_val')}</span>
                    <span class="stat-value">₹ ${((s.total_inventory_value || 0) / 100000).toFixed(1)}L</span>
                </div>
            </div>
        </div>

        <div class="dashboard-chart-grid">
            <div class="table-card" style="padding: 1.5rem; margin-bottom: 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div>
                        <h3 style="font-size: 1.15rem; font-weight: 700;">📈 ${t('sec_stock_trend')}</h3>
                        <small style="color: var(--text-secondary);">${isKn ? "ಕಳೆದ 7 ದಿನಗಳ ಮಾರಾಟ ಆದಾಯ" : "Last 7 days daily sales revenue in INR"}</small>
                    </div>
                    <span class="stat-badge-trend">+12.6% Growth</span>
                </div>
                <div style="position: relative; height: 220px; width: 100%;">
                    <canvas id="salesTrendCanvas" width="600" height="220" style="width: 100%; height: 100%;"></canvas>
                </div>
            </div>

            <div class="table-card" style="padding: 1.5rem; margin-bottom: 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <h3 style="font-size: 1.1rem; font-weight: 700;">🏆 ${t('sec_top_products')}</h3>
                    <a href="javascript:void(0)" onclick="navigateTo('sales')" style="font-size: 0.8rem; font-weight: 600; color: var(--primary-blue); text-decoration: none;">${t('view_all')} →</a>
                </div>
                <div>${topProductsRows}</div>
            </div>
        </div>

        <div class="racks-section-header">
            <div>
                <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary);">🗄️ ${t('sec_racks')}</h2>
                <small style="color: var(--text-secondary);">${isKn ? "ರ್ಯಾಕ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಅದರಲ್ಲಿರುವ ಉತ್ಪನ್ನಗಳನ್ನು ವೀಕ್ಷಿಸಿ" : "Click any rack to filter and manage its electrical stock"}</small>
            </div>
            <button class="btn btn-outline btn-sm" onclick="navigateTo('products')">${t('view_all')} Products</button>
        </div>
        <div class="racks-grid">${racksHtml}</div>

        <div class="table-card" style="margin-bottom: 1.5rem;">
            <div class="table-header-bar" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span class="table-header-title">📦 ${isKn ? "ಗ್ರಾಹಕರ ಆರ್ಡರ್‌ಗಳು" : "Customer Orders"}</span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-outline btn-sm" onclick="syncOrdersNow()" title="Refresh orders">🔄 Refresh</button>
                    <button class="btn btn-outline btn-sm" onclick="navigateTo('sales')">${t('view_all')} Orders & Sales</button>
                </div>
            </div>
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date & Time</th>
                            <th>Customer</th>
                            <th>Purchased Items</th>
                            <th>Quantity</th>
                            <th>Total Price</th>
                            <th>Order Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${ordersRows}</tbody>
                </table>
            </div>
        </div>

        <div class="table-card">
            <div class="table-header-bar">
                <span class="table-header-title">🧾 ${t('sec_recent_sales')}</span>
                <button class="btn btn-outline btn-sm" onclick="navigateTo('sales')">${t('view_all')} Sales</button>
            </div>
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>${t('col_invoice_no')}</th>
                            <th>${t('col_date_time')}</th>
                            <th>${t('col_customer')}</th>
                            <th>${t('col_items')}</th>
                            <th>${t('col_amount')}</th>
                            <th>${t('col_payment_mode')}</th>
                            <th>${t('col_status')}</th>
                            <th>${t('col_actions')}</th>
                        </tr>
                    </thead>
                    <tbody>${recentSalesRows}</tbody>
                </table>
            </div>
        </div>
    `;

    setTimeout(() => {
        renderSalesTrendChart(c.sales_trend);
    }, 50);
}

function renderRackCards(isKn) {
    return (STATE.racks || []).map(r => {
        const nameDisplay = isKn ? (r.name_kn || r.name) : r.name;
        const statusClass = r.capacity_pct > 80 ? "active" : (r.capacity_pct < 30 ? "warning" : "capacity");
        const statusText = r.capacity_pct > 80 ? (isKn ? "ಸಕ್ರಿಯ" : "Active") : `${r.capacity_pct}% ${isKn ? "ಸ್ಟಾಕ್" : "Capacity"}`;

        return `
            <button type="button" class="rack-card" aria-label="Open ${r.rack_id} - ${nameDisplay} rack cells" onclick="navigateTo('products', { rackId: '${r.rack_id}' })">
                <span class="rack-card-top">
                    <span>
                        <span class="rack-code">${r.rack_id}</span>
                        <span class="rack-name">${nameDisplay}</span>
                    </span>
                    <span class="rack-icon">${r.icon || '⚡'}</span>
                </span>
                <span class="rack-card-bottom">
                    <span class="rack-items-count">${STATE.products.filter(p => p.rack_id === r.rack_id).length} ${isKn ? "ಉತ್ಪನ್ನಗಳು" : "Items"}</span>
                    <span class="rack-status-pill ${statusClass}">${statusText}</span>
                </span>
            </button>
        `;
    }).join("");
}

// ----------------- Interactive Canvas Chart -----------------

function renderSalesTrendChart(trendData) {
    const canvas = document.getElementById("salesTrendCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const labels = trendData?.labels || ["01 Nov", "02 Nov", "03 Nov", "04 Nov", "05 Nov", "06 Nov", "Today"];
    const values = trendData?.revenue || [18200, 22750, 19600, 28900, 35050, 24500, 28400];
    const maxVal = Math.max(...values, 1000) * 1.25;

    ctx.clearRect(0, 0, width, height);

    const pLeft = 45;
    const pRight = 20;
    const pTop = 20;
    const pBottom = 35;
    const chartW = width - pLeft - pRight;
    const chartH = height - pTop - pBottom;

    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 1;
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#94A3B8";

    for (let i = 0; i <= 4; i++) {
        const y = pTop + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(pLeft, y);
        ctx.lineTo(width - pRight, y);
        ctx.stroke();

        const gridVal = Math.round(maxVal - (maxVal / 4) * i);
        ctx.fillText(`₹${(gridVal / 1000).toFixed(0)}k`, 5, y + 4);
    }

    const points = values.map((val, idx) => {
        const x = pLeft + (chartW / (values.length - 1)) * idx;
        const y = pTop + chartH - (val / maxVal) * chartH;
        return { x, y, val, label: labels[idx] };
    });

    const grad = ctx.createLinearGradient(0, pTop, 0, height - pBottom);
    grad.addColorStop(0, "rgba(99, 102, 241, 0.35)");
    grad.addColorStop(1, "rgba(99, 102, 241, 0.0)");

    ctx.beginPath();
    ctx.moveTo(points[0].x, height - pBottom);
    points.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(points[points.length - 1].x, height - pBottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.strokeStyle = "#4F46E5";
    ctx.lineWidth = 3;
    ctx.stroke();

    points.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#4F46E5";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#FFFFFF";
        ctx.stroke();

        ctx.fillStyle = "#64748B";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(pt.label, pt.x, height - 10);
    });
}

// ----------------- Customer Orders Management Handlers -----------------

window.handleOrderStatusChange = async function(orderId, newStatus) {
    try {
        API.showToast(`Updating order ${orderId} status to "${newStatus}"...`, "info");
        await API.updateOrderStatus(orderId, newStatus);

        const ord = (STATE.orders || []).find(o => o.order_id === orderId);
        if (ord) ord.status = newStatus;

        const sale = (STATE.sales || []).find(s => s.sale_id === orderId || s.invoice_no === orderId);
        if (sale) sale.status = newStatus;

        API.showToast(`Order ${orderId} updated to "${newStatus}"!`, "success");
        if (STATE.currentView === "dashboard") renderDashboardView();
        else if (STATE.currentView === "sales") renderSalesView(STATE.salesActiveTab);
    } catch (err) {
        API.showToast(`Failed to update order status: ${err.message}`, "error");
    }
};

window.syncOrdersNow = async function() {
    try {
        API.showToast("Refreshing latest orders...", "info");
        const data = await API.getAllData();
        if (data) {
            STATE.orders = data.orders || [];
            STATE.products = data.products || [];
            if (Array.isArray(data.sales) && data.sales.length > 0) {
                STATE.sales = data.sales;
            }
            if (STATE.currentView === "dashboard") renderDashboardView();
            else if (STATE.currentView === "sales") renderSalesView(STATE.salesActiveTab);
            API.showToast("Orders updated successfully!", "success");
        }
    } catch (err) {
        API.showToast(`Sync error: ${err.message}`, "error");
    }
};

window.openOrderDetailsModal = function(orderId) {
    const ord = (STATE.orders || []).find(o => o.order_id === orderId) || (LocalDB.load().orders || []).find(o => o.order_id === orderId);
    if (!ord) {
        API.showToast("Order not found.", "error");
        return;
    }

    let items = [];
    if (Array.isArray(ord.items)) items = ord.items;
    else if (ord.items_json) {
        try { items = JSON.parse(ord.items_json); } catch (e) { items = []; }
    }

    const itemsHtml = items.map((it, idx) => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${idx + 1}</td>
            <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;"><b>${it.product_name || it.name || it.product_id}</b></td>
            <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${it.sku || '—'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${it.quantity || it.qty || 1}</td>
            <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">₹ ${Number(it.unit_price || it.selling_price || 0).toLocaleString('en-IN')}</td>
            <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;"><b>₹ ${Number((it.quantity || it.qty || 1) * (it.unit_price || it.selling_price || 0)).toLocaleString('en-IN')}</b></td>
        </tr>
    `).join("") || `<tr><td colspan="6" style="padding: 8px;">${ord.purchased_items || 'Standard lot'}</td></tr>`;

    const modalBody = document.getElementById("invoiceModalBody");
    if (!modalBody) return;

    modalBody.innerHTML = `
        <div class="invoice-sheet" style="padding: 1.5rem; max-width: 650px; margin: 0 auto; background: #fff; font-family: Inter, sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #E2E8F0; padding-bottom: 1rem; margin-bottom: 1rem;">
                <div>
                    <h2 style="font-size: 1.4rem; font-weight: 800; color: #0F172A; margin: 0;">Deepu Enterprises</h2>
                    <p style="font-size: 0.8rem; color: #64748B; margin: 2px 0;">Electrical & Electronics Wholesale & Retail</p>
                    <p style="font-size: 0.75rem; color: #64748B; margin: 0;">Main Hub, B.M. Road, Channarayapatna, Karnataka - 573116</p>
                </div>
                <div style="text-align: right;">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.85rem; background: #FEF3C7; color: #B45309;">${ord.status || 'Pending'}</span>
                    <div style="font-family: monospace; font-size: 0.95rem; font-weight: 700; margin-top: 4px;">${ord.order_id}</div>
                    <small style="color: #64748B;">${ord.order_date || ord.created_at || ''}</small>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 1.25rem; font-size: 0.85rem;">
                <div>
                    <strong style="color: #475569;">CUSTOMER DETAILS:</strong>
                    <div style="font-size: 1rem; font-weight: 700; color: #0F172A; margin-top: 2px;">${ord.customer_name || 'Customer'}</div>
                    <div>📞 ${ord.customer_phone || '—'}</div>
                    <div>📍 ${ord.customer_address || 'Channarayapatna'}</div>
                </div>
                <div style="text-align: right;">
                    <strong style="color: #475569;">PAYMENT MODE:</strong>
                    <div style="font-weight: 700; color: #0F172A;">Cash on Delivery</div>
                    <div style="margin-top: 4px;"><strong style="color: #475569;">CHANNEL:</strong> Online Web Store</div>
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 0.85rem;">
                <thead>
                    <tr style="background: #F8FAFC; border-bottom: 1px solid #CBD5E1; text-align: left;">
                        <th style="padding: 8px;">#</th>
                        <th style="padding: 8px;">Item Description</th>
                        <th style="padding: 8px;">SKU</th>
                        <th style="padding: 8px;">Qty</th>
                        <th style="padding: 8px;">Rate</th>
                        <th style="padding: 8px;">Amount</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #E2E8F0; padding-top: 1rem;">
                <div>
                    <label style="font-size: 0.8rem; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">Update Status:</label>
                    <select onchange="handleOrderStatusChange('${ord.order_id}', this.value); closeModal('invoicePrintModal');" style="padding: 6px 10px; border-radius: 6px; border: 1px solid #CBD5E1; font-weight: 600; cursor: pointer;">
                        <option value="Pending" ${ord.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${ord.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Shipped" ${ord.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${ord.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${ord.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.85rem; color: #64748B;">Total Quantity: <b>${ord.quantity || 1} pcs</b></div>
                    <div style="font-size: 1.25rem; font-weight: 800; color: #0F172A; margin-top: 2px;">Total: ₹ ${Number(ord.total_price || 0).toLocaleString('en-IN')}</div>
                </div>
            </div>
        </div>
    `;

    openModal("invoicePrintModal");
};

const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");
const toggleMobileMenu = () => {
    const isOpen = document.getElementById("sidebar").classList.toggle("mobile-open");
    mobileMenuToggle?.setAttribute("aria-expanded", String(isOpen));
    sidebarBackdrop?.classList.toggle("open", isOpen);
};
mobileMenuToggle?.addEventListener("click", toggleMobileMenu);
sidebarBackdrop?.addEventListener("click", toggleMobileMenu);

let salesChartResizeTimer;
window.addEventListener("resize", () => {
    if (STATE.currentView !== "reports") return;
    clearTimeout(salesChartResizeTimer);
    salesChartResizeTimer = setTimeout(() => {
        renderSalesAnalyticsCharts(getSalesAnalytics());
    }, 120);
});

// ----------------- View 2: Products Management -----------------

async function renderProductsView() {
    const container = document.getElementById("mainContent");
    const isKn = CURRENT_LANG === "kn";

    let prods = STATE.products.filter(p => p.is_active != 0);
    if (STATE.selectedRack) {
        prods = prods.filter(p => p.rack_id === STATE.selectedRack);
    }
    if (STATE.selectedBrand) {
        prods = prods.filter(p => p.brand_id === STATE.selectedBrand || p.brand_name === STATE.selectedBrand);
    }

    const brandsHtml = `
        <button class="brand-pill ${!STATE.selectedBrand ? 'active' : ''}" onclick="filterByBrand(null)">${t('filter_all_brands')}</button>
        ${(STATE.brands || []).map(b => `
            <button class="brand-pill ${STATE.selectedBrand === b.brand_id ? 'active' : ''}" onclick="filterByBrand('${b.brand_id}')">
                ${b.name}
            </button>
        `).join("")}
    `;

    const rackOptions = `
        <option value="">${t('filter_all_racks')}</option>
        ${(STATE.racks || []).map(r => `
            <option value="${r.rack_id}" ${STATE.selectedRack === r.rack_id ? 'selected' : ''}>
                ${r.rack_id} - ${isKn ? r.name_kn : r.name}
            </option>
        `).join("")}
    `;

    const activeRackObj = STATE.racks.find(r => r.rack_id === STATE.selectedRack);
    const rackHeading = activeRackObj ? `${activeRackObj.rack_id} - ${isKn ? activeRackObj.name_kn : activeRackObj.name}` : t('prod_title');

    let contentHtml = "";
    if (STATE.selectedRack) {
        contentHtml = `
            <div class="rack-cells-grid">
                ${[1, 2, 3, 4, 5].map(cell => {
                    const cellProducts = prods.filter(product => String(product.rack_cell) === String(cell));
                    return `
                        <section class="rack-cell-card">
                            <div class="rack-cell-header">
                                <div>
                                    <strong>${isKn ? "ಸೆಲ್" : "Cell"} ${cell}</strong>
                                    <small style="display: block; color: var(--text-muted);">${cellProducts.length} ${isKn ? "ಉತ್ಪನ್ನಗಳು" : "products"}</small>
                                </div>
                                <button class="btn btn-primary btn-sm" onclick="openAddProductModal('${STATE.selectedRack}', '${cell}')">+ ${isKn ? "ಸೇರಿಸಿ" : "Add"}</button>
                            </div>
                            ${cellProducts.map(product => `
                                <div class="rack-cell-product">
                                    <div class="rack-cell-product-main">
                                        <div class="rack-cell-product-thumb-wrap">
                                            <img src="${product.image_url || 'https://images.unsplash.com/photo-1550524514-9b6058e59265?w=200'}" 
                                                 alt="${product.name}" 
                                                 class="rack-cell-product-thumb" 
                                                 loading="lazy" 
                                                 onerror="this.src='https://images.unsplash.com/photo-1550524514-9b6058e59265?w=200'">
                                        </div>
                                        <div class="rack-cell-product-info">
                                            <div class="rack-cell-product-title" title="${product.name}">${isKn ? (product.name_kn || product.name) : product.name}</div>
                                            <small class="rack-cell-product-sku">${product.sku} · ${product.brand_name || "Generic"}</small>
                                        </div>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin: 0.4rem 0;">
                                        <span>${isKn ? "ಸ್ಟಾಕ್" : "Stock"}: <b>${product.stock_quantity} ${product.unit || "Piece"}</b></span>
                                        <b style="color: var(--primary-indigo);">₹ ${product.selling_price}</b>
                                    </div>
                                    <div class="rack-cell-actions">
                                        <button class="btn btn-outline-blue btn-sm rack-cell-stock-button" onclick="openUpdateStockModal('${product.product_id}')">⚡ Update Stock</button>
                                        <button class="btn btn-outline btn-sm" onclick="openEditProductModal('${product.product_id}')">✏️</button>
                                        <button class="btn btn-outline-red btn-sm" onclick="confirmDeleteProduct('${product.product_id}')">🗑️</button>
                                    </div>
                                </div>
                            `).join("") || `<div style="padding: 1.25rem 0.5rem; color: var(--text-muted); text-align: center;">${isKn ? "ಖಾಲಿ ಸೆಲ್" : "Empty cell"}</div>`}
                        </section>
                    `;
                }).join("")}
            </div>
        `;
    } else if (!STATE.selectedRack) {
        contentHtml = `<div class="racks-grid product-racks-grid">${renderRackCards(isKn)}</div>`;
    } else if (STATE.productViewMode === "grid") {
        contentHtml = `
            <div class="product-grid-4">
                ${prods.map(p => {
                    const statusClass = p.stock_quantity > p.min_stock_level ? "in" : (p.stock_quantity > 0 ? "low" : "out");
                    const statusText = p.stock_quantity > p.min_stock_level ? t('status_in_stock') : (p.stock_quantity > 0 ? t('status_low_stock') : t('status_out_of_stock'));
                    const prodName = isKn ? (p.name_kn || p.name) : p.name;

                    return `
                        <div class="product-card">
                            <div>
                                <div class="product-card-thumb-wrap">
                                    <img src="${p.image_url || 'https://images.unsplash.com/photo-1550524514-9b6058e59265?w=200'}" class="product-card-thumb" alt="${p.name}">
                                </div>
                                <div class="product-card-brand">${p.brand_name || 'Generic'} · <span style="color: var(--primary-blue); font-weight: 700;">${p.rack_id}</span></div>
                                <div class="product-card-title">${prodName}</div>
                                <div class="product-card-sku">SKU: ${p.sku}</div>
                            </div>

                            <div>
                                <div class="product-card-metrics">
                                    <div>
                                        <small style="color: var(--text-muted); display: block;">${isKn ? "ಸ್ಟಾಕ್" : "Current Stock"}</small>
                                        <span class="stock-value-large">${p.stock_quantity} <small style="font-size: 0.75rem;">${p.unit || 'Piece'}</small></span>
                                    </div>
                                    <div style="text-align: right;">
                                        <small style="color: var(--text-muted); display: block;">${isKn ? "ಬೆಲೆ" : "Price"}</small>
                                        <span class="price-value-large">₹ ${p.selling_price}</span>
                                    </div>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <span class="badge-stock ${statusClass}">${statusText}</span>
                                </div>
                                <div class="product-card-actions">
                                    <button class="btn btn-outline-blue btn-sm" style="flex: 1;" onclick="openUpdateStockModal('${p.product_id}')">⚡ ${t('btn_update_stock')}</button>
                                    <button class="btn btn-outline btn-sm" onclick="openEditProductModal('${p.product_id}')">✏️</button>
                                    <button class="btn btn-outline-red btn-sm" onclick="confirmDeleteProduct('${p.product_id}')">🗑️</button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join("") || `<div style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--text-muted);">${isKn ? "ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಕಂಡುಬಂದಿಲ್ಲ" : "No products found matching filters."}</div>`}
            </div>
        `;
    } else {
        contentHtml = `
            <div class="table-card">
                <div style="overflow-x: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>${t('col_image')}</th>
                                <th>${t('col_name')}</th>
                                <th>${t('col_sku')}</th>
                                <th>${t('col_rack')}</th>
                                <th>${t('col_category')}</th>
                                <th>${t('col_stock')}</th>
                                <th>${t('col_price')}</th>
                                <th>${t('col_actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${prods.map(p => {
                                const prodName = isKn ? (p.name_kn || p.name) : p.name;
                                return `
                                    <tr>
                                        <td><img src="${p.image_url || 'https://images.unsplash.com/photo-1550524514-9b6058e59265?w=100'}" class="table-thumb"></td>
                                        <td>
                                            <div style="font-weight: 700;">${prodName}</div>
                                            <small style="color: var(--text-muted);">${p.brand_name || ''}</small>
                                        </td>
                                        <td><code>${p.sku}</code></td>
                                        <td><span class="rack-status-pill capacity">${p.rack_id}</span></td>
                                        <td>${p.category_id || ''}</td>
                                        <td><b>${p.stock_quantity}</b> ${p.unit || 'Piece'}</td>
                                        <td><b style="color: var(--primary-indigo);">₹ ${p.selling_price}</b></td>
                                        <td>
                                            <div style="display: flex; gap: 0.4rem;">
                                                <button class="btn btn-outline-blue btn-sm" onclick="openUpdateStockModal('${p.product_id}')">${t('btn_update_stock')}</button>
                                                <button class="btn btn-outline btn-sm" onclick="openEditProductModal('${p.product_id}')">✏️</button>
                                                <button class="btn btn-outline-red btn-sm" onclick="confirmDeleteProduct('${p.product_id}')">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join("") || `<tr><td colspan="8" style="text-align: center; padding: 2rem;">${isKn ? "ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಕಂಡುಬಂದಿಲ್ಲ" : "No products found."}</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="page-header">
            <div class="page-title-group">
                <h1>📦 ${rackHeading}</h1>
                <p>${t('prod_sub')}</p>
            </div>
            <div class="page-header-actions">
                <select class="form-control" style="width: 190px;" onchange="filterByRack(this.value)">
                    ${rackOptions}
                </select>
                <button class="btn btn-primary" onclick="openAddProductModal()">+ ${t('btn_add_product')}</button>
            </div>
        </div>

        ${STATE.selectedRack ? `<div class="brand-pills-row">${brandsHtml}</div>` : `<p class="rack-picker-hint">${isKn ? "ರ್ಯಾಕ್ ಆಯ್ಕೆ ಮಾಡಿ ಅದರ ಐದು ಸೆಲ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ." : "Select a rack to open and manage its five storage cells."}</p>`}
        ${contentHtml}
    `;
}

function filterByBrand(brandId) {
    STATE.selectedBrand = brandId;
    renderProductsView();
}

function filterByRack(rackId) {
    STATE.selectedRack = rackId || null;
    if (!STATE.selectedRack) STATE.selectedBrand = null;
    renderProductsView();
}

function switchProductView(mode) {
    STATE.productViewMode = mode;
    renderProductsView();
}

// ----------------- View 3: Sales & POS Billing -----------------

async function renderSalesView(activeTab) {
    if (activeTab) {
        STATE.salesActiveTab = activeTab;
    } else if (!STATE.salesActiveTab) {
        STATE.salesActiveTab = "orders";
    }
    activeTab = STATE.salesActiveTab;
    const container = document.getElementById("mainContent");
    const isKn = CURRENT_LANG === "kn";
    const salesList = STATE.sales || [];
    const s = computeDashboardStats();

    let tabContent = "";

    if (activeTab === "orders") {
        const ordersList = STATE.orders || [];
        const rows = ordersList.map(ord => {
            const curStatus = ord.status || "Pending";
            let statusStyle = "background: #FEF3C7; color: #B45309; border: 1px solid #FCD34D;";
            if (curStatus === "Confirmed") statusStyle = "background: #DBEAFE; color: #1E40AF; border: 1px solid #93C5FD;";
            else if (curStatus === "Shipped") statusStyle = "background: #E0E7FF; color: #4338CA; border: 1px solid #A5B4FC;";
            else if (curStatus === "Delivered") statusStyle = "background: #D1FAE5; color: #065F46; border: 1px solid #6EE7B7;";
            else if (curStatus === "Cancelled") statusStyle = "background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5;";

            let itemsDisplay = ord.purchased_items || "";
            if (!itemsDisplay && Array.isArray(ord.items)) {
                itemsDisplay = ord.items.map(i => (i.product_name || i.name || i.product_id) + ' (x' + (i.quantity || 1) + ')').join(', ');
            }
            if (!itemsDisplay) itemsDisplay = "Standard Electrical Lot";

            return `
                <tr>
                    <td><b style="color: var(--primary-blue); font-family: monospace;">${ord.order_id}</b></td>
                    <td><span style="font-size: 0.82rem; color: var(--text-secondary);">${ord.order_date || ord.created_at || '—'}</span></td>
                    <td>
                        <div style="font-weight: 700;">${ord.customer_name || 'Customer'}</div>
                        <small style="color: var(--text-muted);">📞 ${ord.customer_phone || '—'}</small>
                    </td>
                    <td style="max-width: 260px; font-size: 0.85rem;" title="${itemsDisplay}">
                        <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${itemsDisplay}</div>
                    </td>
                    <td><span class="badge" style="background: var(--bg-hover, #F1F5F9); color: var(--text-primary); font-weight: 700; padding: 2px 8px; border-radius: 4px;">${ord.quantity || 1} pcs</span></td>
                    <td><b>₹ ${Number(ord.total_price || 0).toLocaleString('en-IN')}</b></td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.4rem;">
                            <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; ${statusStyle}">${curStatus}</span>
                            <select onchange="handleOrderStatusChange('${ord.order_id}', this.value)" style="padding: 2px 6px; font-size: 0.75rem; border-radius: 4px; border: 1px solid var(--border-light); background: var(--bg-surface); cursor: pointer;">
                                <option value="Pending" ${curStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Confirmed" ${curStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                                <option value="Shipped" ${curStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="Delivered" ${curStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="Cancelled" ${curStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-outline btn-sm" onclick="openOrderDetailsModal('${ord.order_id}')">👁 Details</button>
                    </td>
                </tr>
            `;
        }).join("") || `<tr><td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">${isKn ? "ಯಾವುದೇ ಆನ್‌ಲೈನ್ ಆರ್ಡರ್‌ಗಳು ಇಲ್ಲ" : "No web customer orders found yet."}</td></tr>`;

        tabContent = `
            <div class="table-card">
                <div class="table-header-bar" style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="table-header-title">📦 Customer Web Orders</span>
                    <button class="btn btn-outline btn-sm" onclick="syncOrdersNow()">🔄 Refresh Orders</button>
                </div>
                <div style="overflow-x: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date & Time</th>
                                <th>Customer</th>
                                <th>Purchased Items</th>
                                <th>Quantity</th>
                                <th>Total Price</th>
                                <th>Order Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>
        `;
    } else if (activeTab === "details") {
        const rows = salesList.map(sale => `
            <tr>
                <td><b>${sale.invoice_no}</b></td>
                <td>${sale.created_at}</td>
                <td>${sale.customer_name}</td>
                <td>${sale.items_count || 1}</td>
                <td>${sale.total_quantity || 1}</td>
                <td><b>₹ ${Number(sale.grand_total).toLocaleString('en-IN')}</b></td>
                <td><span class="chip-payment ${(sale.payment_mode || 'cash').toLowerCase()}">${sale.payment_mode}</span></td>
                <td><span class="badge-stock ${sale.status === 'Completed' ? 'in' : 'out'}">${sale.status === 'Completed' ? (isKn ? 'ಪೂರ್ಣಗೊಂಡಿದೆ' : 'Completed') : (isKn ? 'ಹಿಂತಿರುಗಿಸಲಾಗಿದೆ' : 'Returned')}</span></td>
                <td>
                    <div style="display: flex; gap: 0.4rem;">
                        <button class="btn btn-outline btn-sm" onclick="openInvoiceModal('${sale.sale_id}')">👁 ${t('btn_view_invoice')}</button>
                        ${sale.status === 'Completed' ? `<button class="btn btn-outline-red btn-sm" onclick="openReturnSaleModal('${sale.sale_id}')">↩</button>` : ''}
                    </div>
                </td>
            </tr>
        `).join("") || `<tr><td colspan="9" style="text-align: center; padding: 2rem;">No sales records found.</td></tr>`;

        tabContent = `
            <div class="table-card">
                <div style="overflow-x: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>${t('col_invoice_no')}</th>
                                <th>${t('col_date_time')}</th>
                                <th>${t('col_customer')}</th>
                                <th>${t('col_items')}</th>
                                <th>${t('col_qty')}</th>
                                <th>${t('col_amount')}</th>
                                <th>${t('col_payment_mode')}</th>
                                <th>${t('col_status')}</th>
                                <th>${t('col_actions')}</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>
        `;
    } else if (activeTab === "pos") {
        tabContent = renderPOSInterfaceHtml();
    }

    container.innerHTML = `
        <div class="page-header">
            <div class="page-title-group">
                <h1>📊 ${t('sales_title')}</h1>
                <p>${t('sales_sub')}</p>
            </div>
            <div class="page-header-actions">
                <button class="btn btn-outline" onclick="exportDataAsCSV('sales')">📥 ${t('btn_export_csv')}</button>
                <button class="btn btn-primary" onclick="renderSalesView('pos')">🛒 ${t('tab_new_sale')}</button>
            </div>
        </div>

        <div class="stats-grid-5">
            <div class="stat-card">
                <div class="stat-icon-badge purple">🛒</div>
                <div class="stat-content">
                    <span class="stat-label">${t('stat_total_sales')}</span>
                    <span class="stat-value">₹ ${(s.total_sales_revenue || 0).toLocaleString('en-IN')}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-badge green">📦</div>
                <div class="stat-content">
                    <span class="stat-label">${t('stat_orders')}</span>
                    <span class="stat-value">${s.total_orders || 0}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-badge blue">👥</div>
                <div class="stat-content">
                    <span class="stat-label">${isKn ? "ಮಾರಾಟವಾದ ಒಟ್ಟು ಪ್ರಮಾಣ" : "Total Quantity Sold"}</span>
                    <span class="stat-value">${s.total_units_sold || 0} Units</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-badge yellow">📊</div>
                <div class="stat-content">
                    <span class="stat-label">${t('stat_avg_order')}</span>
                    <span class="stat-value">₹ ${s.avg_order_value || 0}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-badge rose">📈</div>
                <div class="stat-content">
                    <span class="stat-label">${t('stat_sales_growth')}</span>
                    <span class="stat-value" style="color: var(--success-green);">${s.sales_growth || '+12.6%'}</span>
                </div>
            </div>
        </div>

        <div style="display: flex; gap: 0.75rem; border-bottom: 1px solid var(--border-light); margin-bottom: 1.5rem; flex-wrap: wrap;">
            <button class="btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}" onclick="renderSalesView('orders')">📦 Customer Orders (${(STATE.orders || []).length})</button>
            <button class="btn ${activeTab === 'details' ? 'btn-primary' : 'btn-outline'}" onclick="renderSalesView('details')">📋 ${t('tab_sales_list')}</button>
            <button class="btn ${activeTab === 'pos' ? 'btn-primary' : 'btn-outline'}" onclick="renderSalesView('pos')">⚡ ${t('tab_new_sale')}</button>
        </div>

        ${tabContent}
    `;

    if (activeTab === "pos") {
        setupPOSCartListeners();
    }
}

// ----------------- Fast POS Billing Cart -----------------

function renderPOSInterfaceHtml() {
    const isKn = CURRENT_LANG === "kn";
    return `
        <div class="pos-layout-grid">
            <div class="table-card" style="padding: 1.5rem;">
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem;">🔍 ${t('pos_search_product')}</h3>
                <input type="text" id="posProductSearch" class="form-control" placeholder="${t('pos_search_product')}" style="margin-bottom: 1rem;">
                
                <div id="posProductGrid" class="pos-product-grid">
                    ${(STATE.products || []).slice(0, 15).map(p => `
                        <div class="rack-card" style="cursor: pointer; padding: 0.85rem;" onclick="addToPOSCart('${p.product_id}')">
                            <div style="font-size: 0.85rem; font-weight: 700; line-height: 1.25; margin-bottom: 0.2rem;">${isKn ? (p.name_kn || p.name) : p.name}</div>
                            <small style="color: var(--text-muted);">${p.sku}</small>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                                <span style="font-weight: 800; color: var(--primary-indigo);">₹ ${p.selling_price}</span>
                                <span class="badge-stock in">${p.stock_quantity} left</span>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>

            <div class="table-card" style="padding: 1.5rem;">
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem;">🧾 ${isKn ? "ಬಿಲ್ಲಿಂಗ್ ಕೌಂಟರ್" : "POS Billing Cart"}</h3>
                
                <div class="form-grid-2">
                    <div class="form-group">
                        <label class="form-label">${t('pos_customer_name')}</label>
                        <input type="text" id="posCustomerName" class="form-control" placeholder="Walk-in Customer" value="Walk-in Customer">
                    </div>
                    <div class="form-group">
                        <label class="form-label">${t('pos_customer_phone')}</label>
                        <input type="text" id="posCustomerPhone" class="form-control" placeholder="9876543210">
                    </div>
                </div>

                <div id="posCartItemsList" style="min-height: 180px; max-height: 250px; overflow-y: auto; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 0.75rem; margin-bottom: 1rem; background: var(--surface-subtle);">
                </div>

                <div style="border-top: 1px dashed var(--border-light); padding-top: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
                        <span>${t('pos_subtotal')}</span>
                        <b id="posSubtotal">₹ 0.00</b>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                        <span>${t('pos_discount')}</span>
                        <input type="number" id="posDiscount" class="form-control" style="width: 90px; height: 30px; text-align: right;" value="0" min="0" oninput="updatePOSCartTotals()">
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                        <span>${t('pos_tax')} (GST %)</span>
                        <select id="posTaxRate" class="form-control" style="width: 90px; height: 32px;" onchange="updatePOSCartTotals()">
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18" selected>18%</option>
                        </select>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 800; border-top: 2px solid var(--text-primary); padding-top: 0.6rem; color: var(--primary-indigo);">
                        <span>${t('pos_grand_total')}</span>
                        <span id="posGrandTotal">₹ 0.00</span>
                    </div>
                </div>

                <div class="form-group" style="margin-top: 1rem;">
                    <label class="form-label">${t('pos_payment_mode')}</label>
                    <select id="posPaymentMode" class="form-control">
                        <option value="Cash">💵 Cash on Counter</option>
                        <option value="UPI" selected>📱 UPI (PhonePe / GPay / Paytm)</option>
                        <option value="Bank Transfer">🏦 Bank NEFT / IMPS</option>
                        <option value="Card">💳 Credit / Debit Card</option>
                        <option value="Credit">📝 Shop Credit / Customer Ledger</option>
                    </select>
                </div>

                <div style="display: flex; gap: 0.75rem; margin-top: 1.25rem;">
                    <button class="btn btn-outline" style="flex: 1;" onclick="clearPOSCart()">🗑️ ${t('btn_clear_cart')}</button>
                    <button class="btn btn-primary" style="flex: 2;" onclick="submitPOSSale()">⚡ ${t('btn_generate_invoice')}</button>
                </div>
            </div>
        </div>
    `;
}

function addToPOSCart(productId) {
    const p = STATE.products.find(x => x.product_id === productId);
    if (!p) return;

    const existing = STATE.cart.find(x => x.product_id === productId);
    if (existing) {
        if (existing.quantity < Number(p.stock_quantity || 0)) {
            existing.quantity++;
        } else {
            API.showToast("Maximum stock limit reached for this item.", "error");
        }
    } else {
        STATE.cart.push({
            product_id: p.product_id,
            name: p.name,
            sku: p.sku,
            unit_price: Number(p.selling_price || 0),
            quantity: 1,
            max_stock: Number(p.stock_quantity || 0)
        });
    }

    renderPOSCartItems();
    updatePOSCartTotals();
}

function renderPOSCartItems() {
    const container = document.getElementById("posCartItemsList");
    if (!container) return;

    if (!STATE.cart.length) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">${t('pos_cart_empty')}</div>`;
        return;
    }

    container.innerHTML = STATE.cart.map((item, idx) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-light);">
            <div style="flex: 1; padding-right: 0.5rem;">
                <div style="font-size: 0.88rem; font-weight: 700;">${item.name}</div>
                <small style="color: var(--text-muted);">₹ ${item.unit_price} each</small>
            </div>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
                <button class="btn btn-outline btn-sm" style="padding: 2px 7px;" onclick="changeCartItemQty(${idx}, -1)">-</button>
                <span style="font-weight: 700; min-width: 20px; text-align: center;">${item.quantity}</span>
                <button class="btn btn-outline btn-sm" style="padding: 2px 7px;" onclick="changeCartItemQty(${idx}, 1)">+</button>
            </div>
            <div style="font-weight: 700; width: 70px; text-align: right; margin-left: 0.5rem;">
                ₹ ${(item.quantity * item.unit_price).toFixed(2)}
            </div>
            <button style="background: none; border: none; color: var(--danger-red); cursor: pointer; margin-left: 0.5rem; font-size: 1.1rem;" onclick="removeCartItem(${idx})">×</button>
        </div>
    `).join("");
}

function changeCartItemQty(index, delta) {
    const item = STATE.cart[index];
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
        STATE.cart.splice(index, 1);
    } else if (newQty > item.max_stock) {
        API.showToast("Exceeds current available stock", "error");
    } else {
        item.quantity = newQty;
    }
    renderPOSCartItems();
    updatePOSCartTotals();
}

function removeCartItem(index) {
    STATE.cart.splice(index, 1);
    renderPOSCartItems();
    updatePOSCartTotals();
}

function clearPOSCart() {
    STATE.cart = [];
    renderPOSCartItems();
    updatePOSCartTotals();
}

function updatePOSCartTotals() {
    let subtotal = 0;
    STATE.cart.forEach(item => {
        subtotal += item.quantity * item.unit_price;
    });

    const discount = parseFloat(document.getElementById("posDiscount")?.value || 0);
    const taxRate = parseFloat(document.getElementById("posTaxRate")?.value || 0);
    const taxable = Math.max(0, subtotal - discount);
    const tax = taxable * (taxRate / 100);
    const grandTotal = taxable + tax;

    if (document.getElementById("posSubtotal")) document.getElementById("posSubtotal").textContent = `₹ ${subtotal.toFixed(2)}`;
    if (document.getElementById("posGrandTotal")) document.getElementById("posGrandTotal").textContent = `₹ ${grandTotal.toFixed(2)}`;
}

async function submitPOSSale() {
    if (!STATE.cart.length) {
        API.showToast("Cannot generate empty invoice. Add products first.", "error");
        return;
    }

    const customerName = document.getElementById("posCustomerName")?.value || "Walk-in Customer";
    const customerPhone = document.getElementById("posCustomerPhone")?.value || "";
    const paymentMode = document.getElementById("posPaymentMode")?.value || "Cash";
    const discount = parseFloat(document.getElementById("posDiscount")?.value || 0);
    const taxRate = parseFloat(document.getElementById("posTaxRate")?.value || 0);

    const salePayload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        payment_mode: paymentMode,
        discount_amount: discount,
        tax_rate: taxRate,
        items: STATE.cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price
        }))
    };

    try {
        const created = await API.createSale(salePayload);
        STATE.sales = [created, ...(STATE.sales || []).filter(sale => sale.sale_id !== created.sale_id)];
        STATE.salesSourceAvailable = true;
        if (STATE.currentView === "reports") renderReportsView(true);
        API.showToast(`Invoice ${created.invoice_no} created & saved!`, "success");
        clearPOSCart();
        openInvoiceModal(created.sale_id);
    } catch (e) {
        API.showToast(e.message, "error");
    }
}

function setupPOSCartListeners() {
    renderPOSCartItems();
    updatePOSCartTotals();

    const input = document.getElementById("posProductSearch");
    if (input) {
        input.addEventListener("input", e => {
            const val = e.target.value.trim();
            const filtered = SearchEngine.search(STATE.products, val);
            const grid = document.getElementById("posProductGrid");
            if (grid) {
                grid.innerHTML = filtered.slice(0, 15).map(p => `
                    <div class="rack-card" style="cursor: pointer; padding: 0.85rem;" onclick="addToPOSCart('${p.product_id}')">
                        <div style="font-size: 0.85rem; font-weight: 700; line-height: 1.25; margin-bottom: 0.2rem;">${p.name}</div>
                        <small style="color: var(--text-muted);">${p.sku}</small>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                            <span style="font-weight: 800; color: var(--primary-indigo);">₹ ${p.selling_price}</span>
                            <span class="badge-stock in">${p.stock_quantity} left</span>
                        </div>
                    </div>
                `).join("");
            }
        });
    }
}

// ----------------- View 4: Stock Alerts -----------------

async function renderStockAlertsView() {
    const container = document.getElementById("mainContent");
    let products;
    try {
        products = await API.getProducts();
    } catch (error) {
        console.error("Stock alerts failed to load:", error);
        API.showToast(error.message, "error");
        return;
    }

    STATE.products = products;
    const alerts = products
        .map(product => {
            const minStockValue = Number(product.min_stock_level);
            const minStock = product.min_stock_level === null || product.min_stock_level === undefined || product.min_stock_level === "" || !Number.isFinite(minStockValue)
                ? 15
                : minStockValue;
            return { ...product, minStock, currentStock: Number(product.stock_quantity || 0) };
        })
        .filter(product => product.currentStock <= product.minStock)
        .sort((a, b) => a.currentStock - b.currentStock);

    const rows = alerts.map(product => {
        const outOfStock = product.currentStock <= 0;
        const unit = product.unit || "Piece";
        return `
            <tr>
                <td><b>${product.name}</b></td>
                <td>${product.minStock} ${unit}</td>
                <td><b>${product.currentStock} ${unit}</b></td>
                <td><span class="badge-stock ${outOfStock ? "out" : "low"}">${outOfStock ? t("status_out_of_stock") : t("status_low_stock")}</span></td>
            </tr>
        `;
    }).join("") || `<tr><td colspan="4" style="text-align: center; padding: 2rem;">${t("stock_alert_empty")}</td></tr>`;

    container.innerHTML = `
        <div class="page-header">
            <div class="page-title-group">
                <h1>🔔 ${t("stock_title")}</h1>
                <p>${t("stock_alert_subtitle")}</p>
            </div>
        </div>

        <div class="table-card">
            <div class="table-header-bar">
                <span class="table-header-title">⚠️ ${t("stock_alert_table_title")}</span>
            </div>
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>${t("stock_alert_product")}</th>
                            <th>${t("stock_alert_minimum")}</th>
                            <th>${t("stock_alert_current")}</th>
                            <th>${t("col_status")}</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
}

// ----------------- View 5: Purchases -----------------

async function renderPurchasesView() {
    const container = document.getElementById("mainContent");
    const isKn = CURRENT_LANG === "kn";
    const purchases = STATE.purchases || [];

    const rows = purchases.map(po => `
        <tr>
            <td><b>${po.po_number}</b></td>
            <td>${po.created_at}</td>
            <td><b>${po.supplier_name}</b></td>
            <td><code>${po.invoice_number || '—'}</code></td>
            <td>${po.items_count || 1} (${po.total_quantity || 1} pcs)</td>
            <td><b>₹ ${Number(po.total_amount).toLocaleString('en-IN')}</b></td>
            <td><span class="badge-stock in">${po.payment_status}</span></td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="openPurchaseItemsModal('${escapeEnq(po.purchase_id || po.po_number)}')">👁 View Items</button>
            </td>
        </tr>
    `).join("") || `<tr><td colspan="8" style="text-align: center; padding: 2rem;">No purchase orders recorded yet.</td></tr>`;

    container.innerHTML = `
        <div class="page-header">
            <div class="page-title-group">
                <h1>🚚 ${t('purchase_title')}</h1>
                <p>${isKn ? "ಪೂರೈಕೆದಾರರ ಬಿಲ್‌ಗಳು ಮತ್ತು ಒಳಬರುವ ಸರಕು ನಿರ್ವಹಣೆ" : "Procure items from suppliers and automatically restock inventory."}</p>
            </div>
            <div class="page-header-actions">
                <button class="btn btn-primary" onclick="openNewPurchaseModal()">+ ${t('btn_new_purchase')}</button>
            </div>
        </div>

        <div class="table-card">
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>${t('lbl_po_number')}</th>
                            <th>Date</th>
                            <th>${t('lbl_supplier')}</th>
                            <th>${t('lbl_supplier_inv')}</th>
                            <th>Items</th>
                            <th>${t('lbl_total_amount')}</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
}

// ----------------- View 6: Suppliers & Customers -----------------

async function renderSuppliersView() {
    const container = document.getElementById("mainContent");
    const isKn = CURRENT_LANG === "kn";
    const suppliers = STATE.suppliers || [];

    const rows = suppliers.map(s => `
        <tr>
            <td><b>${s.name}</b></td>
            <td>${s.contact_person || '—'}</td>
            <td><b>${s.phone}</b></td>
            <td>${s.gstin || '—'}</td>
            <td>${s.city || '—'}</td>
            <td><b style="color: ${s.outstanding_balance > 0 ? 'var(--danger-red)' : 'var(--success-green)'};">₹ ${Number(s.outstanding_balance).toLocaleString('en-IN')}</b></td>
            <td>
                <div style="display: flex; gap: 0.4rem;">
                    <button class="btn btn-outline btn-sm" onclick="openEditSupplierModal('${s.supplier_id}')">✏️</button>
                    <button class="btn btn-outline-red btn-sm" onclick="confirmDeleteSupplier('${s.supplier_id}')">🗑️</button>
                </div>
            </td>
        </tr>
    `).join("") || `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No suppliers found.</td></tr>`;

    container.innerHTML = `
        <div class="page-header">
            <div class="page-title-group">
                <h1>🏭 ${t('sup_title')}</h1>
                <p>${isKn ? "ಎಲೆಕ್ಟ್ರಿಕಲ್ ವಿತರಕರು ಮತ್ತು ಬಾಕಿ ಪಾವತಿ ಖಾತೆಗಳು" : "Authorized electrical distributors, contacts and outstanding payables."}</p>
            </div>
            <div class="page-header-actions">
                <button class="btn btn-primary" onclick="openAddSupplierModal()">+ ${t('btn_add_supplier')}</button>
            </div>
        </div>

        <div class="table-card">
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Company Name</th>
                            <th>Contact Person</th>
                            <th>Phone</th>
                            <th>GSTIN</th>
                            <th>City</th>
                            <th>Balance Due</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
}

function openAddSupplierModal() {
    document.getElementById("supplierForm").reset();
    document.getElementById("supplierFormId").value = "";
    document.getElementById("supplierFormBalance").value = "0";
    document.getElementById("supplierModalTitle").textContent = "Add Supplier";
    openModal("supplierModal");
}

function openEditSupplierModal(supplierId) {
    const supplier = STATE.suppliers.find(item => item.supplier_id === supplierId);
    if (!supplier) {
        API.showToast("Supplier not found.", "error");
        return;
    }

    document.getElementById("supplierFormId").value = supplier.supplier_id;
    document.getElementById("supplierFormName").value = supplier.name || "";
    document.getElementById("supplierFormContact").value = supplier.contact_person || "";
    document.getElementById("supplierFormPhone").value = supplier.phone || "";
    document.getElementById("supplierFormEmail").value = supplier.email || "";
    document.getElementById("supplierFormGstin").value = supplier.gstin || "";
    document.getElementById("supplierFormCity").value = supplier.city || "";
    document.getElementById("supplierFormBalance").value = supplier.outstanding_balance || 0;
    document.getElementById("supplierFormAddress").value = supplier.address || "";
    document.getElementById("supplierModalTitle").textContent = "Edit Supplier";
    openModal("supplierModal");
}

async function handleSupplierFormSubmit(event) {
    event.preventDefault();
    const supplierId = document.getElementById("supplierFormId").value;
    const supplier = {
        supplier_id: supplierId || undefined,
        name: document.getElementById("supplierFormName").value.trim(),
        contact_person: document.getElementById("supplierFormContact").value.trim(),
        phone: document.getElementById("supplierFormPhone").value.trim(),
        email: document.getElementById("supplierFormEmail").value.trim(),
        gstin: document.getElementById("supplierFormGstin").value.trim(),
        city: document.getElementById("supplierFormCity").value.trim(),
        outstanding_balance: Number(document.getElementById("supplierFormBalance").value || 0),
        address: document.getElementById("supplierFormAddress").value.trim()
    };

    try {
        await API.saveSupplier(supplier);
        API.showToast("Supplier saved successfully.", "success");
        closeModal("supplierModal");
        await loadInitialData();
        renderSuppliersView();
    } catch (error) {
        API.showToast(error.message, "error");
    }
}

async function confirmDeleteSupplier(supplierId) {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    try {
        await API.deleteSupplier(supplierId);
        API.showToast("Supplier deleted successfully.", "success");
        await loadInitialData();
        renderSuppliersView();
    } catch (error) {
        API.showToast(error.message, "error");
    }
}

// ----------------- View 7: Price & Margin Management -----------------

async function renderPricesView() {
    const container = document.getElementById("mainContent");
    const isKn = CURRENT_LANG === "kn";

    const prices = STATE.products.filter(p => p.is_active != 0).map(p => {
        const pp = Number(p.purchase_price || 0);
        const sp = Number(p.selling_price || 0);
        const margin = pp > 0 ? (((sp - pp) / pp) * 100).toFixed(1) : 0;
        const profit = (sp - pp).toFixed(2);
        return { ...p, profit_margin_pct: margin, profit_amount: profit };
    });

    const rows = prices.map(p => `
        <tr>
            <td>
                <b>${isKn ? (p.name_kn || p.name) : p.name}</b>
                <br><small style="color: var(--text-muted);">${p.brand_name || ''} · ${p.sku}</small>
            </td>
            <td><b>${p.stock_quantity}</b> ${p.unit || 'Piece'}</td>
            <td>₹ ${p.purchase_price}</td>
            <td><b style="color: var(--primary-indigo);">₹ ${p.selling_price}</b></td>
            <td>₹ ${p.wholesale_price}</td>
            <td><span class="stat-badge-trend">${p.profit_margin_pct}%</span></td>
            <td><b>₹ ${p.profit_amount}</b></td>
            <td><button class="btn btn-outline-blue btn-sm" onclick="openEditPriceModal('${p.product_id}')">✏️ Edit Prices</button></td>
        </tr>
    `).join("");

    container.innerHTML = `
        <div class="page-header">
            <div class="page-title-group">
                <h1>🏷️ ${t('nav_prices')}</h1>
                <p>${isKn ? "ಖರೀದಿ ವೆಚ್ಚ, ಚಿಲ್ಲರೆ ಬೆಲೆ, ಸಗಟು ಬೆಲೆ ಮತ್ತು ಲಾಭದ ಪ್ರಮಾಣ ನಿರ್ವಹಣೆ" : "Monitor purchase costs, retail margins, wholesale discounts and profit markup."}</p>
            </div>
        </div>

        <div class="table-card">
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Product Details</th>
                            <th>Stock</th>
                            <th>Cost Price (₹)</th>
                            <th>Selling Price (₹)</th>
                            <th>Wholesale Price (₹)</th>
                            <th>Profit Margin %</th>
                            <th>Gross Profit (₹)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
}

function openEditPriceModal(productId) {
    const product = STATE.products.find(item => item.product_id === productId);
    if (!product) {
        API.showToast("Product not found.", "error");
        return;
    }

    document.getElementById("priceFormProductId").value = product.product_id;
    document.getElementById("priceFormProductName").value = product.name || "";
    document.getElementById("priceFormSelling").value = product.selling_price ?? 0;
    openModal("priceModal");
}

async function handlePriceFormSubmit(event) {
    event.preventDefault();
    const productId = document.getElementById("priceFormProductId").value;
    const prices = {
        selling_price: Number(document.getElementById("priceFormSelling").value)
    };

    try {
        await API.updatePrices(productId, prices);
        API.showToast("Product prices updated successfully.", "success");
        closeModal("priceModal");
        await loadInitialData();
        renderPricesView();
    } catch (error) {
        API.showToast(error.message, "error");
    }
}

// ----------------- View 8: Reports -----------------

async function renderReportsView(salesAlreadyLoaded = false) {
    const container = document.getElementById("mainContent");
    const isKn = CURRENT_LANG === "kn";

    if (!salesAlreadyLoaded) {
        try {
            const remoteSales = await API.getRemoteSales();
            if (Array.isArray(remoteSales) && remoteSales.length > 0) {
                STATE.sales = remoteSales;
            } else {
                const db = LocalDB.load();
                STATE.sales = (db.sales && db.sales.length > 0) ? db.sales : (SEED_DATA.sales || []);
            }
            STATE.salesSourceAvailable = true;
        } catch (error) {
            console.error("Sales report data fallback to local:", error);
            const db = LocalDB.load();
            STATE.sales = (db.sales && db.sales.length > 0) ? db.sales : (SEED_DATA.sales || []);
            STATE.salesSourceAvailable = true;
        }
    } else {
        if (!STATE.sales || !STATE.sales.length) {
            const db = LocalDB.load();
            STATE.sales = (db.sales && db.sales.length > 0) ? db.sales : (SEED_DATA.sales || []);
            STATE.salesSourceAvailable = true;
        }
    }

    if (STATE.currentView !== "reports") return;
    const salesAnalytics = getSalesAnalytics();
    const totalRevenue = salesAnalytics.completedRevenue;
    const cogs = Math.round(totalRevenue * 0.65);
    const gross_profit = totalRevenue - cogs;
    const margin = totalRevenue > 0 ? ((gross_profit / totalRevenue) * 100).toFixed(1) : 0;

    container.innerHTML = `
        <div class="page-header">
            <div class="page-title-group">
                <h1>📈 ${t('rep_title')}</h1>
                <p>${isKn ? "ಮಾರಾಟ ಆದಾಯ, ಸ್ಟಾಕ್ ಮೌಲ್ಯ ಮತ್ತು ಲಾಭ-ನಷ್ಟ ವರದಿ" : "Comprehensive electrical shop business analytics."}</p>
            </div>
            <div class="page-header-actions">
                <button class="btn btn-outline" onclick="exportDataAsCSV('sales')">📥 Export Sales CSV</button>
                <button class="btn btn-primary" onclick="exportDataAsCSV('products')">📥 Export Stock CSV</button>
            </div>
        </div>

        <div class="stats-grid-4">
            <div class="stat-card">
                <div class="stat-icon-badge purple">₹</div>
                <div class="stat-content">
                    <span class="stat-label">Total Revenue</span>
                    <span class="stat-value">${formatINR(totalRevenue)}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-badge yellow">📦</div>
                <div class="stat-content">
                    <span class="stat-label">Estimated COGS</span>
                    <span class="stat-value">${formatINR(cogs)}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-badge green">📈</div>
                <div class="stat-content">
                    <span class="stat-label">Estimated Gross Profit</span>
                    <span class="stat-value" style="color: var(--success-green);">${formatINR(gross_profit)}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-badge blue">%</div>
                <div class="stat-content">
                    <span class="stat-label">Gross Margin</span>
                    <span class="stat-value">${margin}%</span>
                </div>
            </div>
        </div>

        ${salesAnalytics.hasSalesData ? `<div class="sales-chart-grid">
            <section class="table-card sales-chart-card">
                <div class="sales-chart-header">
                    <div>
                        <div class="sales-chart-title-row">
                            <h2>Monthly Sales</h2>
                            <label class="sales-year-select-label">
                                <span>${t("rep_year")}</span>
                                <select id="salesYearSelect" class="form-control sales-year-select" aria-label="Select year for monthly sales">
                                    ${salesAnalytics.availableYears.map(year => `<option value="${year}" ${year === salesAnalytics.monthlyYear ? "selected" : ""}>${year}</option>`).join("")}
                                </select>
                            </label>
                        </div>
                        <small style="color: var(--text-secondary);">${t("rep_monthly_subtitle")}</small>
                    </div>
                    <span class="sales-chart-value">${formatINR(salesAnalytics.monthlyTotal)}</span>
                </div>
                <div class="sales-chart-canvas-wrap">
                    <canvas id="monthlySalesCanvas" role="img" aria-label="Monthly sales bar chart for ${salesAnalytics.monthlyYear}"></canvas>
                    <div class="sales-chart-tooltip" id="monthlySalesTooltip" role="tooltip" hidden></div>
                </div>
            </section>
            <section class="table-card sales-chart-card">
                <div class="sales-chart-header">
                    <div>
                        <h2>${t("rep_yearly_sales")}</h2>
                        <small style="color: var(--text-secondary);">${t("rep_yearly_subtitle")}</small>
                    </div>
                    <span class="sales-chart-value">${formatINR(salesAnalytics.yearlyTotal)}</span>
                </div>
                <div class="sales-chart-canvas-wrap">
                    <canvas id="yearlySalesCanvas" role="img" aria-label="Yearly sales line chart"></canvas>
                    <div class="sales-chart-tooltip" id="yearlySalesTooltip" role="tooltip" hidden></div>
                </div>
            </section>
        </div>` : `<div class="table-card sales-no-data" role="status">${STATE.salesSourceAvailable
            ? t("rep_no_sales_data")
            : (API.getApiUrl() ? t("rep_sheets_unavailable") : t("rep_sheets_not_configured"))}</div>`}
    `;

    if (salesAnalytics.hasSalesData) {
        document.getElementById("salesYearSelect")?.addEventListener("change", event => {
            STATE.selectedSalesYear = Number(event.target.value);
            renderReportsView(true);
        });
        setTimeout(() => renderSalesAnalyticsCharts(salesAnalytics), 50);
        setTimeout(() => renderSalesAnalyticsCharts(salesAnalytics), 200);
    }
}

function getSalesAnalytics(requestedYear = STATE.selectedSalesYear) {
    const monthTotals = new Map();
    const yearTotals = new Map();
    const validSales = [];

    const list = (STATE.sales && STATE.sales.length > 0) ? STATE.sales : (LocalDB.load().sales || SEED_DATA.sales || []);

    list.forEach(sale => {
        if (sale.status === "Returned" || sale.status === "Cancelled") return;
        const date = parseSaleDate(sale.created_at || sale.order_date);
        const revenue = Number(sale.grand_total || sale.total_price || sale.subtotal || 0);
        if (!date || !Number.isFinite(revenue) || revenue <= 0) return;

        const year = date.getFullYear();
        validSales.push({ year, revenue });
        const monthKey = `${year}-${date.getMonth()}`;
        monthTotals.set(monthKey, (monthTotals.get(monthKey) || 0) + revenue);
        yearTotals.set(year, (yearTotals.get(year) || 0) + revenue);
    });

    const availableYears = [...yearTotals.keys()].sort((a, b) => b - a);
    if (!availableYears.length) availableYears.push(new Date().getFullYear());
    const monthlyYear = availableYears.includes(Number(requestedYear)) ? Number(requestedYear) : availableYears[0];
    const monthlyLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyValues = monthlyLabels.map((_, month) => monthTotals.get(`${monthlyYear}-${month}`) || 0);
    const years = [...yearTotals.keys()].sort((a, b) => a - b);
    const completedRevenue = validSales.reduce((total, sale) => total + sale.revenue, 0);

    return {
        hasSalesData: validSales.length > 0 || list.length > 0,
        availableYears,
        monthlyYear,
        monthlyLabels,
        monthlyValues,
        monthlyTotal: monthlyValues.reduce((total, value) => total + value, 0),
        yearlyLabels: years.length ? years.map(String) : [String(monthlyYear)],
        yearlyValues: years.length ? years.map(year => yearTotals.get(year) || 0) : [completedRevenue],
        yearlyTotal: completedRevenue,
        completedRevenue
    };
}

function formatINR(amount) {
    return `₹ ${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function parseSaleDate(value) {
    if (!value) return new Date();
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;

    const match = String(value).match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})(?:,\s*(\d{1,2}):(\d{2})\s*(AM|PM))?/i);
    if (match) {
        const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const month = months.indexOf(match[2].slice(0, 3).toLowerCase());
        if (month >= 0) {
            let hour = Number(match[4] || 0);
            const meridiem = (match[6] || "").toUpperCase();
            if (meridiem === "PM" && hour < 12) hour += 12;
            if (meridiem === "AM" && hour === 12) hour = 0;
            return new Date(Number(match[3]), month, Number(match[1]), hour, Number(match[5] || 0));
        }
    }
    return new Date();
}

function renderSalesAnalyticsCharts(analytics) {
    if (!analytics) return;
    drawSalesChart("monthlySalesCanvas", analytics.monthlyLabels, analytics.monthlyValues, "bar", "monthlySalesTooltip");
    drawSalesChart("yearlySalesCanvas", analytics.yearlyLabels, analytics.yearlyValues, "line", "yearlySalesTooltip");
}

function drawSalesChart(canvasId, labels, values, chartType, tooltipId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !labels.length) return;

    let bounds = canvas.getBoundingClientRect();
    let width = bounds.width;
    let height = bounds.height;
    if (!width || !height) {
        const parent = canvas.parentElement?.getBoundingClientRect();
        width = (parent && parent.width) ? parent.width : 540;
        height = (parent && parent.height) ? parent.height : 260;
    }
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const left = 58;
    const right = 12;
    const top = 14;
    const bottom = 34;
    const chartWidth = Math.max(1, width - left - right);
    const chartHeight = Math.max(1, height - top - bottom);
    const maxValue = Math.max(...values, 1) * 1.15;

    ctx.clearRect(0, 0, width, height);
    ctx.font = "11px sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";

    for (let index = 0; index <= 4; index++) {
        const y = top + chartHeight * index / 4;
        const amount = maxValue * (1 - index / 4);
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(width - right, y);
        ctx.strokeStyle = "#E2E8F0";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#64748B";
        ctx.fillText(`₹${Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(amount)}`, 2, y);
    }

    const slotWidth = chartWidth / labels.length;
    const points = values.map((value, index) => ({
        x: left + slotWidth * (index + 0.5),
        y: top + chartHeight * (1 - value / maxValue),
        value,
        label: labels[index]
    }));

    if (chartType === "bar") {
        const barWidth = Math.max(3, Math.min(34, slotWidth * 0.62));
        points.forEach(point => {
            const barHeight = Math.max(0, top + chartHeight - point.y);
            ctx.fillStyle = "#4F46E5";
            ctx.fillRect(point.x - barWidth / 2, point.y, barWidth, barHeight);
        });
    } else {
        if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
            ctx.strokeStyle = "#2563EB";
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#2563EB";
            ctx.fill();
        });
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#64748B";
    labels.forEach((label, index) => {
        const labelStep = Math.ceil(labels.length / Math.max(1, Math.floor(chartWidth / 36)));
        if (index % labelStep !== 0 && index !== labels.length - 1) return;
        ctx.fillText(label, points[index].x, height - 8);
    });

    const tooltip = document.getElementById(tooltipId);
    if (!tooltip) return;
    canvas.setAttribute("tabindex", "0");
    canvas.addEventListener("pointermove", event => {
        const rect = canvas.getBoundingClientRect();
        const pointerX = event.clientX - rect.left;
        const pointerY = event.clientY - rect.top;
        if (pointerX < left || pointerX > width - right || pointerY < top || pointerY > top + chartHeight) {
            tooltip.hidden = true;
            return;
        }
        const pointIndex = Math.max(0, Math.min(points.length - 1, Math.floor((pointerX - left) / slotWidth)));
        const point = points[pointIndex];
        tooltip.textContent = `${point.label}: ${formatINR(point.value)}`;
        tooltip.hidden = false;
        const tooltipX = Math.max(4, Math.min(width - tooltip.offsetWidth - 4, point.x - tooltip.offsetWidth / 2));
        const tooltipY = Math.max(4, point.y - tooltip.offsetHeight - 8);
        tooltip.style.left = `${tooltipX}px`;
        tooltip.style.top = `${tooltipY}px`;
    });
    canvas.addEventListener("pointerleave", () => { tooltip.hidden = true; });
    canvas.addEventListener("focus", () => {
        const point = points[0];
        tooltip.textContent = `${point.label}: ${formatINR(point.value)}`;
        tooltip.hidden = false;
        tooltip.style.left = `${Math.max(4, Math.min(width - tooltip.offsetWidth - 4, point.x - tooltip.offsetWidth / 2))}px`;
        tooltip.style.top = `${Math.max(4, point.y - tooltip.offsetHeight - 8)}px`;
    });
    canvas.addEventListener("blur", () => { tooltip.hidden = true; });
}

// ----------------- View: Customer Enquiries (from the user website) -----------------

function escapeEnq(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function renderEnquiriesView() {
    const container = document.getElementById("mainContent");
    const isKn = CURRENT_LANG === "kn";
    const db = LocalDB.load();
    STATE.enquiries = db.enquiries || [];
    const filter = STATE.enquiryFilter || "All";
    const all = STATE.enquiries.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    const list = filter === "All" ? all : all.filter(e => e.type === filter);
    const newCount = all.filter(e => e.status === "New").length;
    const typeLabel = { Quote: "🧾 Quote request", Dealer: "🤝 Dealer application", Contact: "✉️ Contact enquiry" };
    const statusLabel = status => ({
        New: isKn ? "ಹೊಸದು" : "New",
        "In Progress": isKn ? "ಪ್ರಗತಿಯಲ್ಲಿದೆ" : "In Progress",
        Closed: isKn ? "ಮುಚ್ಚಲಾಗಿದೆ" : "Closed",
        Approved: isKn ? "ಅನುಮೋದಿಸಲಾಗಿದೆ" : "Approved"
    }[status] || escapeEnq(status || "New"));

    const tabs = ["All", "Quote", "Dealer", "Contact"].map(f =>
        `<button class="btn ${filter === f ? "btn-primary" : "btn-outline"} btn-sm" onclick="setEnquiryFilter('${f}')">${f === "All" ? (isKn ? "ಎಲ್ಲಾ" : "All") : f} (${f === "All" ? all.length : all.filter(e => e.type === f).length})</button>`
    ).join(" ");

    const rows = list.map(e => {
        let items = e.items || [];
        if (!items.length && e.items_json) { try { items = JSON.parse(e.items_json); } catch (err) {} }
        const itemsHtml = items.length
            ? `<ul class="enquiry-items">${items.map(i => `<li>${escapeEnq(i.name)} <b>× ${escapeEnq(i.qty)}</b> <span>${escapeEnq(i.sku || "")}</span></li>`).join("")}</ul>` : "";
        const when = e.created_at ? new Date(e.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
        const phoneDigits = String(e.phone || "").replace(/\D/g, "");
        const waNumber = phoneDigits.length === 10 ? "91" + phoneDigits : phoneDigits;
        const contactLinks = [
            e.phone ? `<a href="tel:${escapeEnq(e.phone)}" class="enquiry-contact-link">☎ ${isKn ? "ಕರೆ ಮಾಡಿ" : "Call"}</a>` : "",
            waNumber ? `<a href="https://wa.me/${escapeEnq(waNumber)}" target="_blank" rel="noopener" class="enquiry-contact-link">WhatsApp</a>` : "",
            e.email ? `<a href="mailto:${escapeEnq(e.email)}" class="enquiry-contact-link">✉ ${isKn ? "ಇಮೇಲ್" : "Email"}</a>` : ""
        ].filter(Boolean).join(" ");
        const isDealer = e.type === "Dealer";
        const approvalAction = isDealer
            ? (e.status === "Approved"
                ? `<span class="enquiry-approved">✓ ${isKn ? "ಅನುಮೋದಿಸಲಾಗಿದೆ" : "Approved"}</span>`
                : `<button class="btn btn-primary btn-sm" onclick="approveDealer('${escapeEnq(e.enquiry_id)}')">✓ ${isKn ? "ಡೀಲರ್ ಅನುಮೋದಿಸಿ" : "Approve dealer"}</button>`)
            : "";
        return `<tr>
            <td><b>${escapeEnq(e.enquiry_id)}</b><br><span class="enquiry-meta">${when}</span></td>
            <td>${typeLabel[e.type] || escapeEnq(e.type)}</td>
            <td><b>${escapeEnq(e.name)}</b>${e.business_name ? `<br><span>${escapeEnq(e.business_name)}</span>` : ""}${e.city ? `<br><span class="enquiry-meta">📍 ${escapeEnq(e.city)}</span>` : ""}<div class="enquiry-contact-actions">${contactLinks}</div></td>
            <td class="enquiry-details">${e.subject ? `<b>${escapeEnq(e.subject)}</b><br>` : ""}${escapeEnq(e.message)}${e.gstin ? `<br><span>GSTIN: ${escapeEnq(e.gstin)}</span>` : ""}${e.address ? `<br><span>${escapeEnq(e.address)}</span>` : ""}${itemsHtml}</td>
            <td><div class="enquiry-status-actions"><select class="form-control" onchange="changeEnquiryStatus('${escapeEnq(e.enquiry_id)}', this.value)">
                ${["New", "In Progress", "Closed", ...(isDealer ? ["Approved"] : [])].map(st => `<option value="${st}" ${e.status === st ? "selected" : ""}>${statusLabel(st)}</option>`).join("")}
            </select>${approvalAction}</div></td>
            <td><button class="btn btn-outline-red btn-sm" onclick="removeEnquiry('${escapeEnq(e.enquiry_id)}')" aria-label="${isKn ? "ಅಳಿಸಿ" : "Delete enquiry"}">🗑️</button></td>
        </tr>`;
    }).join("") || `<tr><td colspan="6" class="enquiry-empty">${isKn ? "ಇನ್ನೂ ಯಾವುದೇ ವಿಚಾರಣೆಗಳಿಲ್ಲ." : "No enquiries yet. Requests sent from the user website will appear here."}</td></tr>`;

    container.innerHTML = `
        <div class="page-header">
            <div class="page-title-group">
                <h1>📨 ${t('enq_title')}</h1>
                <p>${isKn ? "ವೆಬ್‌ಸೈಟ್‌ನಿಂದ ಬಂದ ಬೆಲೆ ವಿಚಾರಣೆಗಳು, ಡೀಲರ್ ಅರ್ಜಿಗಳು ಮತ್ತು ಸಂದೇಶಗಳು." : "Quote requests, dealer applications and messages sent from the customer website."} <b>${newCount}</b> ${isKn ? "ಹೊಸ" : "new"}.</p>
            </div>
            <div class="page-header-actions">
                <a class="btn btn-outline" href="../../user/index.html" target="_blank" rel="noopener">🌐 ${isKn ? "ವೆಬ್‌ಸೈಟ್ ವೀಕ್ಷಿಸಿ" : "View website"}</a>
            </div>
        </div>
        <div class="enquiry-tabs">${tabs}</div>
        <div class="table-card"><div class="table-responsive">
            <table class="data-table enquiry-table"><thead><tr>
                <th>${isKn ? "ಐಡಿ / ದಿನಾಂಕ" : "ID / Date"}</th><th>${isKn ? "ವಿಧ" : "Type"}</th><th>${isKn ? "ಗ್ರಾಹಕ" : "Customer"}</th><th>${isKn ? "ವಿವರಗಳು" : "Details"}</th><th>${isKn ? "ಸ್ಥಿತಿ / ಕ್ರಮ" : "Status / Action"}</th><th></th>
            </tr></thead><tbody>${rows}</tbody></table>
        </div></div>`;
}

function setEnquiryFilter(f) { STATE.enquiryFilter = f; renderEnquiriesView(); }

async function changeEnquiryStatus(id, status) {
    await API.updateEnquiry(id, { status });
    API.showToast("Enquiry marked: " + status, "success");
    renderEnquiriesView();
}

async function approveDealer(id) {
    const isKn = CURRENT_LANG === "kn";
    const record = (LocalDB.load().enquiries || []).find(item => item.enquiry_id === id && item.type === "Dealer");
    if (!record) {
        API.showToast(isKn ? "ಡೀಲರ್ ಅರ್ಜಿ ಕಂಡುಬಂದಿಲ್ಲ." : "Dealer application was not found.", "error");
        return;
    }
    if (record.status === "Approved") return;
    const confirmed = confirm(isKn
        ? `${record.business_name || record.name} ಅವರ ಡೀಲರ್ ಅರ್ಜಿಯನ್ನು ಅನುಮೋದಿಸಬೇಕೇ?`
        : `Approve the dealer application for ${record.business_name || record.name}?`);
    if (!confirmed) return;
    await API.updateEnquiry(id, { status: "Approved" });
    API.showToast(isKn ? "ಡೀಲರ್ ಅರ್ಜಿ ಅನುಮೋದಿಸಲಾಗಿದೆ." : "Dealer application approved.", "success");
    await renderEnquiriesView();
}

async function removeEnquiry(id) {
    if (!confirm("Delete this enquiry?")) return;
    await API.deleteEnquiry(id);
    renderEnquiriesView();
}

// ----------------- View 9: Settings

async function renderSettingsView() {
    const container = document.getElementById("mainContent");
    const isKn = CURRENT_LANG === "kn";

    container.innerHTML = `
        <div class="page-header">
            <div class="page-title-group">
                <h1>⚙️ ${isKn ? "ಸೆಟ್ಟಿಂಗ್‌ಗಳು" : "Settings"}</h1>
                <p>${isKn ? "ಅಂಗಡಿ ವಿವರಗಳು ಮತ್ತು ಇನ್‌ವಾಯ್ಸ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ." : "Manage your shop details and invoice profile."}</p>
            </div>
        </div>

        <div class="settings-grid">
            <div class="table-card settings-profile-card">
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem;">🏢 Shop Profile & Invoice Settings</h3>
                <form id="shopProfileForm" onsubmit="saveShopSettings(event)">
                    <div class="form-group">
                        <label class="form-label">Shop Name</label>
                        <input type="text" id="cfgShopName" class="form-control" value="${STATE.settings.SHOP_NAME || 'Deepu Enterprises'}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Business Tagline</label>
                        <input type="text" id="cfgShopTagline" class="form-control" value="${STATE.settings.SHOP_TAGLINE || 'Electrical & Electronics Wholesale & Retail'}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">GSTIN / Tax Number</label>
                        <input type="text" id="cfgShopGstin" class="form-control" value="${STATE.settings.SHOP_GSTIN || '29ABCDE1234F1Z5'}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Contact Phone</label>
                        <input type="text" id="cfgShopPhone" class="form-control" value="${STATE.settings.SHOP_PHONE || '+91 98450 12345'}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Address</label>
                        <textarea id="cfgShopAddress" class="form-control" rows="2">${STATE.settings.SHOP_ADDRESS || 'Main Hub, B.M. Road, Channarayapatna, Karnataka - 573116'}</textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Save Shop Profile</button>
                </form>
            </div>
        </div>
    `;
}

function saveShopSettings(e) {
    e.preventDefault();
    const db = LocalDB.load();
    db.settings = {
        ...db.settings,
        SHOP_NAME: document.getElementById("cfgShopName")?.value,
        SHOP_TAGLINE: document.getElementById("cfgShopTagline")?.value,
        SHOP_GSTIN: document.getElementById("cfgShopGstin")?.value,
        SHOP_PHONE: document.getElementById("cfgShopPhone")?.value,
        SHOP_ADDRESS: document.getElementById("cfgShopAddress")?.value
    };
    LocalDB.save(db);
    STATE.settings = db.settings;
    API.showToast("Shop profile saved successfully!", "success");
}

function exportDataAsCSV(type) {
    let rows = [];
    let filename = "";

    if (type === "sales") {
        rows.push(["Invoice No", "Date", "Customer", "Amount (INR)", "Payment Mode", "Status"]);
        STATE.sales.forEach(s => {
            rows.push([s.invoice_no, s.created_at, s.customer_name, s.grand_total, s.payment_mode, s.status]);
        });
        filename = "sales_report.csv";
    } else {
        rows.push(["Product Name", "SKU", "Rack", "Stock Units", "Cost Price", "Selling Price"]);
        STATE.products.forEach(p => {
            rows.push([p.name, p.sku, p.rack_id, p.stock_quantity, p.purchase_price, p.selling_price]);
        });
        filename = "inventory_report.csv";
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
}

// ----------------- Modals (Product Add/Edit, Stock, Invoices) -----------------

function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (!el) return;
    el.classList.add("open");
    document.body.classList.add("modal-open");
    const body = el.querySelector(".modal-body");
    if (body) body.scrollTop = 0;
    el.querySelector(".modal-body input:not([type='hidden']), .modal-body select, .modal-body textarea")?.focus({ preventScroll: true });
}

function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (!el) return;
    el.classList.remove("open");
    if (!document.querySelector(".modal-backdrop.open")) document.body.classList.remove("modal-open");
}

function openAddProductModal(rackId = STATE.selectedRack, rackCell = "1") {
    const form = document.getElementById("addProductForm");
    if (form) form.reset();
    document.getElementById("prodModalTitle").textContent = t('modal_add_title');
    document.getElementById("prodFormId").value = "";
    populateProductDropdowns();
    if (rackId) document.getElementById("prodFormRack").value = rackId;
    document.getElementById("prodFormRackCell").value = rackCell || "1";
    if (document.getElementById("prodFormImageFile")) document.getElementById("prodFormImageFile").value = "";
    if (document.getElementById("prodFormImagePreviewWrap")) document.getElementById("prodFormImagePreviewWrap").style.display = "none";
    openModal("productModal");
}

function openEditProductModal(productId) {
    const p = STATE.products.find(x => x.product_id === productId);
    if (!p) return;

    populateProductDropdowns();

    document.getElementById("prodModalTitle").textContent = t('modal_edit_title');
    document.getElementById("prodFormId").value = p.product_id;
    document.getElementById("prodFormNameEn").value = p.name || "";
    document.getElementById("prodFormNameKn").value = p.name_kn || "";
    document.getElementById("prodFormSku").value = p.sku || "";
    document.getElementById("prodFormRack").value = p.rack_id || "";
    document.getElementById("prodFormRackCell").value = p.rack_cell || "";
    document.getElementById("prodFormCategory").value = p.category_id || "";
    document.getElementById("prodFormBrand").value = p.brand_id || "";
    document.getElementById("prodFormModel").value = p.model_number || "";
    document.getElementById("prodFormUnit").value = p.unit || "Piece";
    document.getElementById("prodFormPP").value = p.purchase_price || 0;
    document.getElementById("prodFormSP").value = p.selling_price || 0;
    document.getElementById("prodFormWP").value = p.wholesale_price || 0;
    document.getElementById("prodFormStock").value = p.stock_quantity || 0;
    document.getElementById("prodFormMinStock").value = p.min_stock_level || 10;
    document.getElementById("prodFormImage").value = p.image_url || "";
    document.getElementById("prodFormDesc").value = p.description || "";

    if (document.getElementById("prodFormImageFile")) document.getElementById("prodFormImageFile").value = "";
    const prevWrap = document.getElementById("prodFormImagePreviewWrap");
    const prevImg = document.getElementById("prodFormImagePreview");
    if (p.image_url && prevWrap && prevImg) {
        prevImg.src = p.image_url;
        prevWrap.style.display = "flex";
    } else if (prevWrap) {
        prevWrap.style.display = "none";
    }

    openModal("productModal");
}

function populateProductDropdowns() {
    const isKn = CURRENT_LANG === "kn";
    const rackSelect = document.getElementById("prodFormRack");
    if (rackSelect) {
        rackSelect.innerHTML = (STATE.racks || []).map(r => `
            <option value="${r.rack_id}">${r.rack_id} - ${isKn ? r.name_kn : r.name}</option>
        `).join("");
    }

    const catSelect = document.getElementById("prodFormCategory");
    if (catSelect) {
        catSelect.innerHTML = (STATE.categories || []).map(c => `
            <option value="${c.category_id}">${isKn ? c.name_kn : c.name}</option>
        `).join("");
    }

    const brandSelect = document.getElementById("prodFormBrand");
    if (brandSelect) {
        brandSelect.innerHTML = (STATE.brands || []).map(b => `
            <option value="${b.brand_id}">${b.name}</option>
        `).join("");
    }
}

async function handleProductFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("prodFormId").value;
    const catId = document.getElementById("prodFormCategory").value;
    const brandId = document.getElementById("prodFormBrand").value;
    const rackId = document.getElementById("prodFormRack").value;

    const brand = (STATE.brands || []).find(b => b.brand_id === brandId);
    const cat = (STATE.categories || []).find(c => c.category_id === catId);
    const rack = (STATE.racks || []).find(r => r.rack_id === rackId);

    const payload = {
        product_id: id || undefined,
        name: document.getElementById("prodFormNameEn").value.trim(),
        name_kn: document.getElementById("prodFormNameKn").value.trim(),
        sku: document.getElementById("prodFormSku").value.trim(),
        rack_id: rackId,
        rack_cell: document.getElementById("prodFormRackCell").value.trim(),
        category_id: catId,
        category_name: cat ? cat.name : "",
        brand_id: brandId,
        brand_name: brand ? brand.name : "",
        rack_name: rack ? rack.name : "",
        model_number: document.getElementById("prodFormModel").value.trim(),
        unit: document.getElementById("prodFormUnit").value,
        purchase_price: parseFloat(document.getElementById("prodFormPP").value || 0),
        selling_price: parseFloat(document.getElementById("prodFormSP").value || 0),
        wholesale_price: parseFloat(document.getElementById("prodFormWP").value || 0),
        stock_quantity: parseInt(document.getElementById("prodFormStock").value || 0),
        min_stock_level: parseInt(document.getElementById("prodFormMinStock").value || 10),
        image_url: document.getElementById("prodFormImage").value.trim(),
        description: document.getElementById("prodFormDesc").value.trim()
    };

    try {
        await API.saveProduct(payload);
        API.showToast("Product saved successfully!", "success");
        closeModal("productModal");
        await loadInitialData();
        renderProductsView();
    } catch (err) {
        API.showToast(err.message, "error");
    }
}

async function confirmDeleteProduct(productId) {
    if (confirm("Are you sure you want to remove this product from the inventory?")) {
        try {
            await API.deleteProduct(productId);
            API.showToast("Product deleted successfully.", "success");
            await loadInitialData();
            renderProductsView();
        } catch (err) {
            API.showToast(err.message, "error");
        }
    }
}

function openUpdateStockModal(productId) {
    const p = STATE.products.find(x => x.product_id === productId);
    if (!p) return;

    document.getElementById("stockAdjustProdId").value = p.product_id;
    document.getElementById("stockAdjustProdName").textContent = p.name;
    document.getElementById("stockAdjustCurrent").textContent = `${p.stock_quantity} ${p.unit || 'Piece'}`;
    document.getElementById("stockAdjustDelta").value = "10";
    openModal("stockAdjustModal");
}

async function handleStockAdjustSubmit(e) {
    e.preventDefault();
    const pid = document.getElementById("stockAdjustProdId").value;
    const delta = parseInt(document.getElementById("stockAdjustDelta").value || 0);
    const mType = document.getElementById("stockAdjustType").value;
    const reason = document.getElementById("stockAdjustReason").value;

    try {
        await API.adjustStock(pid, delta, mType, reason);
        API.showToast("Stock updated successfully!", "success");
        closeModal("stockAdjustModal");
        await loadInitialData();
        if (STATE.currentView === "products") renderProductsView();
        if (STATE.currentView === "dashboard") renderDashboardView();
        if (STATE.currentView === "stock") renderStockAlertsView();
    } catch (err) {
        API.showToast(err.message, "error");
    }
}

function openInvoiceModal(saleId) {
    const sale = STATE.sales.find(s => s.sale_id === saleId);
    if (!sale) return;

    const modalBody = document.getElementById("invoiceModalBody");
    const shop = STATE.settings || {};

    const itemsRows = (sale.items || []).map((itm, idx) => `
        <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td><b>${itm.product_name}</b><br><small style="color: #64748B;">SKU: ${itm.sku}</small></td>
            <td style="text-align: center;">${itm.quantity}</td>
            <td style="text-align: right;">₹ ${Number(itm.unit_price).toFixed(2)}</td>
            <td style="text-align: right;"><b>₹ ${Number(itm.line_total).toFixed(2)}</b></td>
        </tr>
    `).join("") || `<tr><td colspan="5" style="text-align: center;">Invoice Items Completed</td></tr>`;

    modalBody.innerHTML = `
        <div class="invoice-box">
            <div class="invoice-header">
                <div>
                    <div class="invoice-title">⚡ ${shop.SHOP_NAME || 'Deepu Enterprises'}</div>
                    <div style="font-weight: 600; color: #475569;">${shop.SHOP_TAGLINE || 'Electrical & Electronics Wholesale & Retail'}</div>
                    <div style="font-size: 12px; color: #64748B; margin-top: 4px;">${shop.SHOP_ADDRESS || ''}</div>
                    <div style="font-size: 12px; font-weight: 700; color: #2563EB;">GSTIN: ${shop.SHOP_GSTIN || '29ABCDE1234F1Z5'} | Phone: ${shop.SHOP_PHONE || ''}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.15rem; font-weight: 800; color: #0F172A;">TAX INVOICE</div>
                    <div style="font-size: 14px; font-weight: 700; color: #4F46E5;">${sale.invoice_no}</div>
                    <div style="font-size: 12px; color: #64748B;">Date: ${sale.created_at}</div>
                    <div style="font-size: 12px; font-weight: 700; color: #059669; text-transform: uppercase;">Status: ${sale.status}</div>
                </div>
            </div>

            <div class="invoice-meta-grid">
                <div>
                    <div style="font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase;">Billed To:</div>
                    <div style="font-size: 15px; font-weight: 700;">${sale.customer_name}</div>
                    <div style="font-size: 13px; color: #475569;">Phone: ${sale.customer_phone || 'Counter Client'}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase;">Payment Details:</div>
                    <div style="font-size: 14px; font-weight: 700;">Mode: ${sale.payment_mode}</div>
                    <div style="font-size: 12px; color: #059669;">Amount Paid: ₹ ${Number(sale.paid_amount || sale.grand_total).toFixed(2)}</div>
                </div>
            </div>

            <table class="invoice-table">
                <thead>
                    <tr>
                        <th style="width: 40px; text-align: center;">#</th>
                        <th>Product & Specification</th>
                        <th style="width: 70px; text-align: center;">Qty</th>
                        <th style="width: 100px; text-align: right;">Rate (₹)</th>
                        <th style="width: 110px; text-align: right;">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>${itemsRows}</tbody>
            </table>

            <div class="invoice-summary-box">
                <div class="invoice-summary-row">
                    <span>Subtotal:</span>
                    <span>₹ ${Number(sale.subtotal || sale.grand_total).toFixed(2)}</span>
                </div>
                ${sale.discount_amount > 0 ? `
                <div class="invoice-summary-row" style="color: #DC2626;">
                    <span>Discount:</span>
                    <span>- ₹ ${Number(sale.discount_amount).toFixed(2)}</span>
                </div>` : ''}
                <div class="invoice-total-row">
                    <span>Grand Total:</span>
                    <span style="color: #4F46E5;">₹ ${Number(sale.grand_total).toFixed(2)}</span>
                </div>
            </div>

            <div class="invoice-footer">
                <div>
                    <div style="font-size: 11px; color: #64748B;">• Electrical goods tested before counter delivery.</div>
                    <div style="font-size: 11px; color: #64748B;">• Manufacturer warranty applies on LED bulbs, tubes & fans.</div>
                    <div style="font-size: 11px; font-weight: 600; color: #0F172A; margin-top: 4px;">Thank you for shopping at Deepu Enterprises!</div>
                </div>
                <div class="signature-line">
                    Authorized Signatory
                </div>
            </div>
        </div>
    `;

    openModal("invoicePrintModal");
}

function getPurchaseLineItems(po) {
    if (Array.isArray(po.items) && po.items.length) {
        return po.items.map(itm => {
            const prod = STATE.products.find(p => p.product_id === itm.product_id);
            const qty = Number(itm.quantity || 0);
            const price = itm.purchase_price != null ? Number(itm.purchase_price) : null;
            return {
                product_name: itm.product_name || prod?.name || itm.product_id || "Item",
                sku: itm.sku || prod?.sku || "",
                quantity: qty,
                purchase_price: price,
                line_total: itm.line_total != null ? Number(itm.line_total) : (price != null ? qty * price : null)
            };
        });
    }

    const syncedItems = (STATE.purchaseItems || []).filter(pi => pi.purchase_id === po.purchase_id);
    if (syncedItems.length) {
        return syncedItems.map(pi => {
            const prod = STATE.products.find(p => p.product_id === pi.product_id);
            const qty = Number(pi.quantity || 0);
            const price = pi.purchase_price != null && pi.purchase_price !== "" ? Number(pi.purchase_price) : null;
            return {
                product_name: pi.product_name || prod?.name || pi.product_id || "Item",
                sku: pi.sku || prod?.sku || "",
                quantity: qty,
                purchase_price: price,
                line_total: pi.line_total != null && pi.line_total !== "" ? Number(pi.line_total) : (price != null ? qty * price : null)
            };
        });
    }

    return (STATE.movements || [])
        .filter(m => m.reference_id === po.po_number)
        .map(m => {
            const prod = STATE.products.find(p =>
                (m.product_id && p.product_id === m.product_id) ||
                (m.sku && p.sku === m.sku)
            );
            const qty = Number(m.quantity || 0);
            const price = prod?.purchase_price != null ? Number(prod.purchase_price) : null;
            return {
                product_name: m.product_name || prod?.name || m.product_id || "Item",
                sku: m.sku || prod?.sku || "",
                quantity: qty,
                purchase_price: price,
                line_total: price != null ? qty * price : null
            };
        });
}

function openPurchaseItemsModal(purchaseRef) {
    const po = (STATE.purchases || []).find(p => p.purchase_id === purchaseRef || p.po_number === purchaseRef);
    if (!po) {
        API.showToast("Purchase order not found.", "error");
        return;
    }

    const titleEl = document.getElementById("purchaseItemsModalTitle");
    const bodyEl = document.getElementById("purchaseItemsModalBody");
    if (titleEl) titleEl.textContent = `📦 Purchase Order — ${po.po_number}`;

    const items = getPurchaseLineItems(po);
    const itemsRows = items.map((itm, idx) => `
        <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td><b>${escapeEnq(itm.product_name)}</b>${itm.sku ? `<br><small style="color: #64748B;">SKU: ${escapeEnq(itm.sku)}</small>` : ""}</td>
            <td style="text-align: center;">${itm.quantity}</td>
            <td style="text-align: right;">${itm.purchase_price != null ? `₹ ${itm.purchase_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}</td>
            <td style="text-align: right;"><b>${itm.line_total != null ? `₹ ${itm.line_total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}</b></td>
        </tr>
    `).join("") || `<tr><td colspan="5" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No item breakdown recorded for this purchase order.</td></tr>`;

    bodyEl.innerHTML = `
        <div class="invoice-meta-grid" style="margin-bottom: 1rem;">
            <div>
                <div style="font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase;">Supplier</div>
                <div style="font-size: 15px; font-weight: 700;">${escapeEnq(po.supplier_name || "Supplier")}</div>
                <div style="font-size: 13px; color: #475569;">Invoice: <code>${escapeEnq(po.invoice_number || "—")}</code></div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase;">Order Details</div>
                <div style="font-size: 13px; color: #475569;">Date: ${escapeEnq(po.created_at || "—")}</div>
                <div style="font-size: 13px; font-weight: 700; color: #059669;">${escapeEnq(po.payment_status || "Paid")} • ₹ ${Number(po.total_amount || 0).toLocaleString('en-IN')}</div>
            </div>
        </div>
        <div style="overflow-x: auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 40px; text-align: center;">#</th>
                        <th>Product</th>
                        <th style="width: 70px; text-align: center;">Qty</th>
                        <th style="width: 110px; text-align: right;">Unit Cost</th>
                        <th style="width: 120px; text-align: right;">Line Total</th>
                    </tr>
                </thead>
                <tbody>${itemsRows}</tbody>
            </table>
        </div>
    `;

    openModal("purchaseItemsModal");
}

function printCurrentInvoice() {
    window.print();
}

// ----------------- Setup Global Event Listeners & Smart Search -----------------

function setupEventListeners() {
    const toggleBtn = document.getElementById("sidebarToggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const sidebar = document.getElementById("sidebar");
            sidebar.classList.toggle("collapsed");
        });
    }

    const langBtn = document.getElementById("langToggleBtn");
    if (langBtn) {
        langBtn.addEventListener("click", () => {
            const nextLang = CURRENT_LANG === "en" ? "kn" : "en";
            setLanguage(nextLang);
            langBtn.textContent = nextLang === "en" ? "ಕನ್ನಡ" : "English";
        });
    }

    setupUserProfileMenu();

    // Universal Multilingual & Tanglish Search (pure JS, 0 latency)
    const searchInput = document.getElementById("globalSearchInput");
    const suggestionsFlyout = document.getElementById("searchSuggestions");

    if (searchInput && suggestionsFlyout) {
        searchInput.addEventListener("input", e => {
            const val = e.target.value.trim();
            if (val.length < 1) {
                suggestionsFlyout.classList.remove("open");
                return;
            }

            const sug = SearchEngine.getSuggestions(STATE.products, val);
            renderSearchSuggestions(sug, val);
        });

        document.addEventListener("click", e => {
            if (!searchInput.contains(e.target) && !suggestionsFlyout.contains(e.target)) {
                suggestionsFlyout.classList.remove("open");
            }
        });
    }

    // Product Image File Upload & Live Preview
    const imageFileInput = document.getElementById("prodFormImageFile");
    const imageUrlInput = document.getElementById("prodFormImage");
    const imagePreviewWrap = document.getElementById("prodFormImagePreviewWrap");
    const imagePreview = document.getElementById("prodFormImagePreview");

    if (imageFileInput && imageUrlInput) {
        imageFileInput.addEventListener("change", function(e) {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                const img = new Image();
                img.onload = function() {
                    const maxDim = 400;
                    let w = img.width, h = img.height;
                    if (w > maxDim || h > maxDim) {
                        if (w > h) {
                            h = Math.round((h * maxDim) / w);
                            w = maxDim;
                        } else {
                            w = Math.round((w * maxDim) / h);
                            h = maxDim;
                        }
                    }
                    const canvas = document.createElement("canvas");
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, w, h);
                    const compressed = canvas.toDataURL("image/jpeg", 0.85);
                    imageUrlInput.value = compressed;
                    if (imagePreview && imagePreviewWrap) {
                        imagePreview.src = compressed;
                        imagePreviewWrap.style.display = "flex";
                    }
                };
                img.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        });

        imageUrlInput.addEventListener("input", function() {
            const val = this.value.trim();
            if (val && imagePreview && imagePreviewWrap) {
                imagePreview.src = val;
                imagePreviewWrap.style.display = "flex";
            } else if (imagePreviewWrap) {
                imagePreviewWrap.style.display = "none";
            }
        });
    }
}

function setupUserProfileMenu() {
    const menu = document.getElementById("userProfileMenu");
    const trigger = document.getElementById("userProfileButton");
    const dropdown = document.getElementById("userProfileDropdown");
    if (!menu || !trigger || !dropdown) return;

    const setOpen = isOpen => {
        dropdown.hidden = !isOpen;
        trigger.setAttribute("aria-expanded", String(isOpen));
    };

    trigger.addEventListener("click", () => setOpen(dropdown.hidden));
    document.addEventListener("click", event => {
        if (!menu.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !dropdown.hidden) {
            setOpen(false);
            trigger.focus();
        }
    });
}

function handleDemoSignOut() {
    sessionStorage.removeItem("deepu_role");
    sessionStorage.removeItem("deepu_demo_admin");
    sessionStorage.removeItem("deepu_admin_token");
    window.location.href = "../../user/index.html";
    return;
    document.getElementById("userProfileDropdown").hidden = true;
    document.getElementById("userProfileButton").setAttribute("aria-expanded", "false");
    navigateTo("dashboard");
    API.showToast("Signed out of the demo session.", "success");
}

function renderSearchSuggestions(sug, query) {
    const flyout = document.getElementById("searchSuggestions");
    if (!flyout) return;

    const prods = sug.products || [];
    const brands = sug.brands || [];

    if (!prods.length && !brands.length) {
        flyout.innerHTML = `<div style="padding: 1rem; color: var(--text-muted); text-align: center;">No matches for "${query}"</div>`;
        flyout.classList.add("open");
        return;
    }

    let html = `<div class="suggestion-header">Matched Products (${prods.length})</div>`;
    prods.forEach(p => {
        html += `
            <div class="suggestion-item" onclick="selectSearchProduct('${p.product_id}')">
                <div class="suggestion-item-left">
                    <img src="${p.image_url || 'https://images.unsplash.com/photo-1550524514-9b6058e59265?w=100'}" class="suggestion-thumb">
                    <div>
                        <div class="suggestion-item-name">${p.name}</div>
                        <div class="suggestion-item-sku">${p.sku} · <span style="color: var(--primary-blue); font-weight: 700;">${p.rack_id}</span></div>
                    </div>
                </div>
                <div class="suggestion-item-price">₹ ${p.selling_price}</div>
            </div>
        `;
    });

    if (brands.length) {
        html += `<div class="suggestion-header" style="margin-top: 0.5rem;">Brands</div>`;
        brands.forEach(b => {
            html += `
                <div class="suggestion-item" onclick="selectSearchBrand('${b}')">
                    <b>${b}</b>
                    <small style="color: var(--primary-blue);">View Brand →</small>
                </div>
            `;
        });
    }

    flyout.innerHTML = html;
    flyout.classList.add("open");
}

function selectSearchProduct(productId) {
    document.getElementById("searchSuggestions")?.classList.remove("open");
    navigateTo("products");
    setTimeout(() => {
        openEditProductModal(productId);
    }, 150);
}

function selectSearchBrand(brandName) {
    document.getElementById("searchSuggestions")?.classList.remove("open");
    const b = STATE.brands.find(x => x.name.toLowerCase() === brandName.toLowerCase());
    navigateTo("products", { brandId: b ? b.brand_id : null });
}
