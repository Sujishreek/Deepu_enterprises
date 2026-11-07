/**
 * Deepu Enterprises - Electrical & Electronics Inventory Management System
 * Pure HTML5, CSS3, JavaScript SPA Controller with Google Apps Script & Google Sheets Database
 */

// Global Application State
const STATE = {
    currentView: "dashboard",
    products: [],
    racks: [],
    categories: [],
    brands: [],
    sales: [],
    purchases: [],
    suppliers: [],
    customers: [],
    movements: [],
    settings: {},
    cart: [],
    selectedRack: null,
    selectedBrand: null,
    productViewMode: "grid", // 'grid' or 'table'
    userRole: sessionStorage.getItem("deepu_role") || "Admin"
};

// ----------------- Initialization -----------------

document.addEventListener("DOMContentLoaded", async () => {
    setupEventListeners();
    await loadInitialData();
    navigateTo(STATE.currentView);
    setupRealtimeSync();
});

async function loadInitialData() {
    try {
        const data = await API.getAllData();
        STATE.products = data.products || [];
        STATE.racks = data.racks || [];
        STATE.categories = data.categories || [];
        STATE.brands = data.brands || [];
        STATE.sales = data.sales || [];
        STATE.purchases = data.purchases || [];
        STATE.suppliers = data.suppliers || [];
        STATE.customers = data.customers || [];
        STATE.movements = data.movements || [];
        STATE.settings = data.settings || {};
    } catch (e) {
        console.error("Initial data load failed:", e);
    }
}

function setupRealtimeSync() {
    setInterval(async () => {
        try {
            if (API.getApiUrl()) {
                const data = await API.getAllData();
                STATE.products = data.products || [];
                STATE.sales = data.sales || [];
                if (STATE.currentView === "dashboard") {
                    renderDashboardView();
                }
            }
        } catch (e) {
            // silent sync
        }
    }, 30000);
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
    STATE.currentView = viewName;
    if (params.rackId) STATE.selectedRack = params.rackId;
    if (params.brandId) STATE.selectedBrand = params.brandId;

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
            renderSalesView();
            break;
        case "stock":
            renderStockView();
            break;
        case "purchases":
            renderPurchasesView();
            break;
        case "suppliers":
            renderSuppliersView();
            break;
        case "customers":
            renderCustomersView();
            break;
        case "prices":
            renderPricesView();
            break;
        case "reports":
            renderReportsView();
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

    let racksHtml = (STATE.racks || []).map(r => {
        const nameDisplay = isKn ? r.name_kn : r.name;
        const statusClass = r.capacity_pct > 80 ? "active" : (r.capacity_pct < 30 ? "warning" : "capacity");
        const statusText = r.capacity_pct > 80 ? (isKn ? "செயலில்" : "Active") : `${r.capacity_pct}% ${isKn ? "இருப்பு" : "Capacity"}`;
        
        return `
            <div class="rack-card" onclick="navigateTo('products', { rackId: '${r.rack_id}' })">
                <div class="rack-card-top">
                    <div>
                        <span class="rack-code">${r.rack_id}</span>
                        <div class="rack-name">${nameDisplay}</div>
                    </div>
                    <span class="rack-icon">${r.icon || '⚡'}</span>
                </div>
                <div class="rack-card-bottom">
                    <span class="rack-items-count">${STATE.products.filter(p => p.rack_id === r.rack_id).length} ${isKn ? "பொருட்கள்" : "Items"}</span>
                    <span class="rack-status-pill ${statusClass}">${statusText}</span>
                </div>
            </div>
        `;
    }).join("");

    let recentSalesRows = (s.recent_sales || []).map(sale => `
        <tr>
            <td><b>${sale.invoice_no}</b></td>
            <td>${sale.created_at}</td>
            <td>${sale.customer_name}</td>
            <td>${sale.items_count || 1} (${sale.total_quantity || 1} pcs)</td>
            <td><b>₹ ${Number(sale.grand_total).toLocaleString('en-IN')}</b></td>
            <td><span class="chip-payment ${(sale.payment_mode || 'cash').toLowerCase()}">${sale.payment_mode}</span></td>
            <td><span class="badge-stock in">${isKn ? "முடிந்தது" : "Completed"}</span></td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="openInvoiceModal('${sale.sale_id}')">👁 ${t('btn_view_invoice')}</button>
            </td>
        </tr>
    `).join("") || `<tr><td colspan="8">${isKn ? "விற்பனை பதிவுகள் இல்லை" : "No recent sales."}</td></tr>`;

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
                <p>${isKn ? "மின் மற்றும் மின்னணு கடை சரக்கு & கூகிள் ஸ்ப்ரெட்ஷீட் நிலவரம்" : "Live Electrical & Electronics inventory, sales tracking and Google Sheets warehouse racks."}</p>
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

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
            <div class="table-card" style="padding: 1.5rem; margin-bottom: 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div>
                        <h3 style="font-size: 1.15rem; font-weight: 700;">📈 ${t('sec_stock_trend')}</h3>
                        <small style="color: var(--text-secondary);">${isKn ? "கடந்த 7 நாட்களின் விற்பனை வருவாய்" : "Last 7 days daily sales revenue in INR"}</small>
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
                <small style="color: var(--text-secondary);">${isKn ? "ரேக் மீது கிளிக் செய்து அந்த ரேக்கின் பொருட்களைப் பார்க்கவும்" : "Click any rack to filter and manage its electrical stock"}</small>
            </div>
            <button class="btn btn-outline btn-sm" onclick="navigateTo('products')">${t('view_all')} Products</button>
        </div>
        <div class="racks-grid">${racksHtml}</div>

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
    if (STATE.productViewMode === "grid") {
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
                                        <small style="color: var(--text-muted); display: block;">${isKn ? "இருப்பு" : "Current Stock"}</small>
                                        <span class="stock-value-large">${p.stock_quantity} <small style="font-size: 0.75rem;">${p.unit || 'Piece'}</small></span>
                                    </div>
                                    <div style="text-align: right;">
                                        <small style="color: var(--text-muted); display: block;">${isKn ? "விலை" : "Price"}</small>
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
                }).join("") || `<div style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--text-muted);">${isKn ? "பொருட்கள் எதுவும் கிடைக்கவில்லை" : "No products found matching filters."}</div>`}
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
                            }).join("") || `<tr><td colspan="8" style="text-align: center; padding: 2rem;">${isKn ? "பொருட்கள் எதுவும் கிடைக்கவில்லை" : "No products found."}</td></tr>`}
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
                <div style="display: flex; border: 1px solid var(--border-light); border-radius: var(--radius-md); overflow: hidden;">
                    <button class="btn ${STATE.productViewMode === 'grid' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="switchProductView('grid')">▦ ${t('btn_grid_view')}</button>
                    <button class="btn ${STATE.productViewMode === 'table' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="switchProductView('table')">☰ ${t('btn_table_view')}</button>
                </div>
                <button class="btn btn-primary" onclick="openAddProductModal()">+ ${t('btn_add_product')}</button>
            </div>
        </div>

        <div class="brand-pills-row">${brandsHtml}</div>
        ${contentHtml}
    `;
}

function filterByBrand(brandId) {
    STATE.selectedBrand = brandId;
    renderProductsView();
}

function filterByRack(rackId) {
    STATE.selectedRack = rackId || null;
    renderProductsView();
}

function switchProductView(mode) {
    STATE.productViewMode = mode;
    renderProductsView();
}

// ----------------- View 3: Sales & POS Billing -----------------

async function renderSalesView(activeTab = "details") {
    const container = document.getElementById("mainContent");
    const isKn = CURRENT_LANG === "kn";
    const salesList = STATE.sales || [];
    const s = computeDashboardStats();

    let tabContent = "";

    if (activeTab === "details") {
        const rows = salesList.map(sale => `
            <tr>
                <td><b>${sale.invoice_no}</b></td>
                <td>${sale.created_at}</td>
                <td>${sale.customer_name}</td>
                <td>${sale.items_count || 1}</td>
                <td>${sale.total_quantity || 1}</td>
                <td><b>₹ ${Number(sale.grand_total).toLocaleString('en-IN')}</b></td>
                <td><span class="chip-payment ${(sale.payment_mode || 'cash').toLowerCase()}">${sale.payment_mode}</span></td>
                <td><span class="badge-stock ${sale.status === 'Completed' ? 'in' : 'out'}">${sale.status === 'Completed' ? (isKn ? 'முடிந்தது' : 'Completed') : (isKn ? 'திருப்பித்தரப்பட்டது' : 'Returned')}</span></td>
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
                    <span class="stat-label">${isKn ? "விற்ற அளவு" : "Total Quantity Sold"}</span>
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

        <div style="display: flex; gap: 0.75rem; border-bottom: 1px solid var(--border-light); margin-bottom: 1.5rem;">
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
        <div style="display: grid; grid-template-columns: 1.6fr 1.2fr; gap: 1.5rem;">
            <div class="table-card" style="padding: 1.5rem;">
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem;">🔍 ${t('pos_search_product')}</h3>
                <input type="text" id="posProductSearch" class="form-control" placeholder="${t('pos_search_product')}" style="margin-bottom: 1rem;">
                
                <div id="posProductGrid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.85rem; max-height: 480px; overflow-y: auto; padding-right: 4px;">
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
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem;">🧾 ${isKn ? "பில்லிங் கவுண்டர்" : "POS Billing Cart"}</h3>
                
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

// ----------------- View 4: Stock Management -----------------

async function renderStockView() {
    const container = document.getElementById("mainContent");
    const isKn = CURRENT_LANG === "kn";
    const movements = STATE.movements || [];

    const rows = movements.map(m => `
        <tr>
            <td>${m.created_at}</td>
            <td>
                <b>${m.product_name}</b>
                <br><small style="color: var(--text-muted);">${m.sku}</small>
            </td>
            <td><span class="chip-payment ${m.quantity >= 0 ? 'cash' : 'bank'}">${m.movement_type}</span></td>
            <td><b style="color: ${m.quantity >= 0 ? 'var(--success-green)' : 'var(--danger-red)'};">${m.quantity >= 0 ? '+' : ''}${m.quantity} pcs</b></td>
            <td>${m.previous_stock}</td>
            <td><b>${m.new_stock}</b></td>
            <td><code>${m.reference_id || '—'}</code></td>
            <td>${m.reason || '—'}</td>
            <td><small>${m.performed_by || 'Admin'}</small></td>
        </tr>
    `).join("") || `<tr><td colspan="9" style="text-align: center; padding: 2rem;">No stock movement records.</td></tr>`;

    container.innerHTML = `
        <div class="page-header">
            <div class="page-title-group">
                <h1>📦 ${t('stock_title')}</h1>
                <p>${isKn ? "சரக்கு இருப்பு மாற்றங்கள், ரசீதுகள் மற்றும் தணிக்கை வரலாறு" : "Complete audit history of stock adjustments, receipts, sales and damages."}</p>
            </div>
            <div class="page-header-actions">
                <button class="btn btn-primary" onclick="openQuickAdjustStockModal()">⚡ ${t('btn_adjust_stock')}</button>
            </div>
        </div>

        <div class="table-card">
            <div class="table-header-bar">
                <span class="table-header-title">📜 ${isKn ? "இருப்பு மாற்ற வரலாறு" : "Stock Movement Audit Log"}</span>
            </div>
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>${t('col_mov_date')}</th>
                            <th>${t('col_mov_prod')}</th>
                            <th>${t('col_mov_type')}</th>
                            <th>${t('col_mov_delta')}</th>
                            <th>${t('col_mov_prev')}</th>
                            <th>${t('col_mov_after')}</th>
                            <th>${t('col_mov_ref')}</th>
                            <th>${t('col_mov_reason')}</th>
                            <th>${t('col_mov_user')}</th>
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
                <button class="btn btn-outline btn-sm" onclick="alert('PO Reference: ' + '${po.po_number}')">👁 View Items</button>
            </td>
        </tr>
    `).join("") || `<tr><td colspan="8" style="text-align: center; padding: 2rem;">No purchase orders recorded yet.</td></tr>`;

    container.innerHTML = `
        <div class="page-header">
            <div class="page-title-group">
                <h1>🚚 ${t('purchase_title')}</h1>
                <p>${isKn ? "சப்ளையர் பில்கள் மற்றும் உள்வரும் சரக்கு மேலாண்மை" : "Procure items from suppliers and automatically restock inventory."}</p>
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
                <p>${isKn ? "மின்சாதன விநியோகஸ்தர்கள் மற்றும் கடன் கணக்கு" : "Authorized electrical distributors, contacts and outstanding payables."}</p>
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

async function renderCustomersView() {
    const container = document.getElementById("mainContent");
    const isKn = CURRENT_LANG === "kn";
    const customers = STATE.customers || [];

    const rows = customers.map(c => `
        <tr>
            <td><b>${c.name}</b></td>
            <td><b>${c.phone}</b></td>
            <td>${c.business_name || 'Retail Client'}</td>
            <td><span class="chip-payment ${c.customer_type === 'Wholesale' ? 'upi' : 'cash'}">${c.customer_type || 'Retail'}</span></td>
            <td>${c.city || '—'}</td>
            <td><b style="color: ${c.credit_balance > 0 ? 'var(--danger-red)' : 'var(--text-primary)'};">₹ ${Number(c.credit_balance || 0).toLocaleString('en-IN')}</b></td>
            <td>
                <div style="display: flex; gap: 0.4rem;">
                    <button class="btn btn-outline btn-sm" onclick="openEditCustomerModal('${c.customer_id}')">✏️</button>
                    <button class="btn btn-outline-red btn-sm" onclick="confirmDeleteCustomer('${c.customer_id}')">🗑️</button>
                </div>
            </td>
        </tr>
    `).join("") || `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No customers found.</td></tr>`;

    container.innerHTML = `
        <div class="page-header">
            <div class="page-title-group">
                <h1>👥 ${t('cust_title')}</h1>
                <p>${isKn ? "சில்லறை மற்றும் மொத்த வாடிக்கையாளர் கடன் ஏடு" : "Retail electricians, contractors and wholesale buyer accounts."}</p>
            </div>
            <div class="page-header-actions">
                <button class="btn btn-primary" onclick="openAddCustomerModal()">+ ${t('btn_add_customer')}</button>
            </div>
        </div>

        <div class="table-card">
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Phone</th>
                            <th>Business Name</th>
                            <th>Type</th>
                            <th>City</th>
                            <th>Credit Ledger</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
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
            <td>
                <button class="btn btn-outline-blue btn-sm" onclick="openEditProductModal('${p.product_id}')">✏️ Edit Prices</button>
            </td>
        </tr>
    `).join("");

    container.innerHTML = `
        <div class="page-header">
            <div class="page-title-group">
                <h1>🏷️ ${t('nav_prices')}</h1>
                <p>${isKn ? "அடக்கம், விற்பனை விலை, மொத்த விலை மற்றும் லாப விகித மேலாண்மை" : "Monitor purchase costs, retail margins, wholesale discounts and profit markup."}</p>
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

// ----------------- View 8: Reports -----------------

async function renderReportsView() {
    const container = document.getElementById("mainContent");
    const isKn = CURRENT_LANG === "kn";

    const s = computeDashboardStats();
    const cogs = Math.round(s.total_sales_revenue * 0.65);
    const gross_profit = s.total_sales_revenue - cogs;
    const margin = s.total_sales_revenue > 0 ? ((gross_profit / s.total_sales_revenue) * 100).toFixed(1) : 0;

    container.innerHTML = `
        <div class="page-header">
            <div class="page-title-group">
                <h1>📈 ${t('rep_title')}</h1>
                <p>${isKn ? "விற்பனை வருவாய், சரக்கு மதிப்பு மற்றும் லாப நஷ்ட அறிக்கை" : "Comprehensive electrical shop business analytics and Google Sheets backup."}</p>
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
                    <span class="stat-value">₹ ${(s.total_sales_revenue || 0).toLocaleString('en-IN')}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-badge yellow">📦</div>
                <div class="stat-content">
                    <span class="stat-label">Estimated COGS</span>
                    <span class="stat-value">₹ ${cogs.toLocaleString('en-IN')}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-badge green">📈</div>
                <div class="stat-content">
                    <span class="stat-label">Estimated Gross Profit</span>
                    <span class="stat-value" style="color: var(--success-green);">₹ ${gross_profit.toLocaleString('en-IN')}</span>
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
    `;
}

// ----------------- View 9: Google Sheets Sync & Settings -----------------

async function renderSettingsView() {
    const container = document.getElementById("mainContent");
    const isKn = CURRENT_LANG === "kn";
    const currentUrl = API.getApiUrl();
    const isConnected = Boolean(currentUrl);

    container.innerHTML = `
        <div class="page-header">
            <div class="page-title-group">
                <h1>⚙️ ${t('sheets_title')}</h1>
                <p>${t('sheets_desc')}</p>
            </div>
            <div class="page-header-actions">
                <button class="btn btn-teal" onclick="testGoogleSheetsConnection()">⚡ Test Connection</button>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div class="table-card" style="padding: 1.5rem;">
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem;">📊 Google Apps Script Database Connection</h3>
                
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
                    <div class="sync-pulse-dot" style="${isConnected ? '' : 'background: #F59E0B; box-shadow: none;'}"></div>
                    <span style="font-weight: 700; font-size: 1rem;">${isConnected ? '🟢 Live Google Spreadsheet Connected' : '🟡 Offline Mode (Local Storage Active)'}</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Google Apps Script Web App URL</label>
                    <input type="url" id="sheetsWebAppUrlInput" class="form-control" placeholder="https://script.google.com/macros/s/DEPLOYMENT_ID/exec" value="${currentUrl}">
                    <small style="color: var(--text-muted); margin-top: 4px; display: block;">Follow the 3-minute guide in <b>backend/GOOGLE-SHEETS-SETUP.md</b> to get your URL.</small>
                </div>

                <div style="display: flex; gap: 0.75rem;">
                    <button class="btn btn-primary" style="flex: 1;" onclick="saveGoogleSheetsUrl()">💾 Save & Connect</button>
                    <button class="btn btn-outline" onclick="testGoogleSheetsConnection()">🔄 Test Sync</button>
                </div>
            </div>

            <div class="table-card" style="padding: 1.5rem;">
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

function saveGoogleSheetsUrl() {
    const url = document.getElementById("sheetsWebAppUrlInput")?.value || "";
    API.setApiUrl(url);
    API.showToast("Google Sheets Web App URL saved!", "success");
    testGoogleSheetsConnection();
}

async function testGoogleSheetsConnection() {
    API.showToast("Testing connection with Google Sheets...", "success");
    const res = await API.callAppsScript("getAllData");
    if (res) {
        API.showToast("Connected successfully to Google Spreadsheet!", "success");
        await loadInitialData();
        renderSettingsView();
    } else {
        API.showToast("Could not reach Google Sheets. Running in local storage mode.", "error");
    }
}

function saveShopSettings(e) {
    e.preventDefault();
    const db = LocalDB.load();
    db.settings = {
        SHOP_NAME: document.getElementById("cfgShopName")?.value,
        SHOP_TAGLINE: document.getElementById("cfgShopTagline")?.value,
        SHOP_GSTIN: document.getElementById("cfgShopGstin")?.value,
        SHOP_PHONE: document.getElementById("cfgShopPhone")?.value,
        SHOP_ADDRESS: document.getElementById("cfgShopAddress")?.value,
        APPS_SCRIPT_URL: API.getApiUrl()
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
    if (el) el.classList.add("open");
}

function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove("open");
}

function openAddProductModal() {
    const form = document.getElementById("addProductForm");
    if (form) form.reset();
    document.getElementById("prodModalTitle").textContent = t('modal_add_title');
    document.getElementById("prodFormId").value = "";
    populateProductDropdowns();
    openModal("productModal");
}

function openEditProductModal(productId) {
    const p = STATE.products.find(x => x.product_id === productId);
    if (!p) return;

    populateProductDropdowns();

    document.getElementById("prodModalTitle").textContent = t('modal_edit_title');
    document.getElementById("prodFormId").value = p.product_id;
    document.getElementById("prodFormNameEn").value = p.name || "";
    document.getElementById("prodFormNameTa").value = p.name_kn || "";
    document.getElementById("prodFormSku").value = p.sku || "";
    document.getElementById("prodFormRack").value = p.rack_id || "";
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
    const payload = {
        product_id: id || undefined,
        name: document.getElementById("prodFormNameEn").value,
        name_kn: document.getElementById("prodFormNameTa").value,
        sku: document.getElementById("prodFormSku").value,
        rack_id: document.getElementById("prodFormRack").value,
        category_id: document.getElementById("prodFormCategory").value,
        brand_id: document.getElementById("prodFormBrand").value,
        model_number: document.getElementById("prodFormModel").value,
        unit: document.getElementById("prodFormUnit").value,
        purchase_price: parseFloat(document.getElementById("prodFormPP").value || 0),
        selling_price: parseFloat(document.getElementById("prodFormSP").value || 0),
        wholesale_price: parseFloat(document.getElementById("prodFormWP").value || 0),
        stock_quantity: parseInt(document.getElementById("prodFormStock").value || 0),
        min_stock_level: parseInt(document.getElementById("prodFormMinStock").value || 10),
        image_url: document.getElementById("prodFormImage").value,
        description: document.getElementById("prodFormDesc").value
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
        if (STATE.currentView === "stock") renderStockView();
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

    const roleChip = document.getElementById("userRoleChip");
    if (roleChip) {
        roleChip.addEventListener("click", () => {
            const newRole = STATE.userRole === "Admin" ? "Staff" : "Admin";
            STATE.userRole = newRole;
            sessionStorage.setItem("deepu_role", newRole);
            roleChip.textContent = newRole;
            API.showToast(`Switched role to ${newRole}`, "success");
        });
    }

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
