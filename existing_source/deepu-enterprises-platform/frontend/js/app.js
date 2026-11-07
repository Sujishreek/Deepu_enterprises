/* Deepu Enterprises front-end. Demo mode works without deployment; set API_URL to your Apps Script web-app URL for live data. */
const API_URL = ""; // Example: https://script.google.com/macros/s/DEPLOYMENT_ID/exec
const DEMO_KEY = "deepu_demo_v1";
const seed = {
 categories:[
  {id:"C1",name:"Hardware & Plumbing",description:"Pipes, fittings, tools and plumbing essentials."},
  {id:"C2",name:"Electrical & Wiring",description:"Lighting, switches, wiring and electrical accessories."},
  {id:"C3",name:"Agro Products",description:"Agricultural supply and water-management products."},
  {id:"C4",name:"FMCG & Consumer Goods",description:"Everyday household and consumer essentials."}
 ],
 brands:[
  {id:"B1",name:"Astral",description:"Pipes, fittings and adhesives",demo:true},
  {id:"B2",name:"Supreme",description:"Pipes and building materials",demo:true},
  {id:"B3",name:"Havells",description:"Electrical products and lighting",demo:true},
  {id:"B4",name:"Panasonic",description:"Electrical products and lighting",demo:true},
  {id:"B5",name:"Hansa Green",description:"LED lighting products",demo:true},
  {id:"B6",name:"Klassey",description:"Lighting and electrical products",demo:true},
  {id:"B7",name:"Generic Hardware",description:"General hardware and tools",demo:true}
 ],
 products:[
  ["P001","Astral PVC Pipe 1 inch","C1","B1","AST-PVC-001","PVC pipe for general plumbing applications.","Length",120,true],
  ["P002","Astral BondTite Fast & Clear 1 kg","C1","B1","AST-ADH-001","Multipurpose adhesive pack.","Pack",45,true],
  ["P003","Supreme PVC Elbow 1 inch","C1","B2","SUP-FIT-EL01","PVC elbow pipe fitting.","Piece",300,false],
  ["P004","Combination Plier 8 inch","C1","B7","GEN-TOOL-PL8","General-purpose hand tool.","Piece",25,false],
  ["P005","Panasonic LED Bulb 23W","C2","B4","PAN-LED-023","Energy-efficient LED bulb.","Piece",80,true],
  ["P006","Hansa Green LED Panel Light","C2","B5","HAN-LED-PL01","LED panel light for indoor use.","Piece",35,false],
  ["P007","Klassey LED Batten Light","C2","B6","KLA-LED-BT01","LED batten light.","Piece",50,false],
  ["P008","Havells Modular Switch","C2","B3","HAV-SW-001","Modular electrical switch.","Piece",150,false],
  ["P009","Electrical Insulation Tape","C2","B7","GEN-TAPE-001","PVC insulation tape.","Roll",200,false],
  ["P010","Agricultural Water Hose","C3","B7","AGR-HOSE-001","Flexible hose for agricultural water use.","Meter",500,true],
  ["P011","LED Night Lamp","C4","B7","CON-LED-NL01","Compact LED night lamp.","Piece",60,false],
  ["P012","Extension Board 4 Socket","C2","B7","CON-EXT-004","Four-socket extension board.","Piece",20,false]
 ].map(p=>({id:p[0],name:p[1],categoryId:p[2],brandId:p[3],sku:p[4],description:p[5],unit:p[6],stock:p[7],featured:p[8],active:true,price:null,rack:"B-01-02"})),
 locations:["Channarayapatna","Hassan City","Holenarasipura","Arsikere","Belur","Sakleshpur","Arkalgud","Alur"],
 inquiries:[],dealerApplications:[],orders:[],movements:[]
};
function loadDB(){try{return JSON.parse(localStorage.getItem(DEMO_KEY))||structuredClone(seed)}catch{return structuredClone(seed)}}
let db=loadDB(), cart=[];
try { cart=JSON.parse(localStorage.getItem("deepu_cart")||"[]"); if(!Array.isArray(cart)) cart=[]; } catch { cart=[]; }
let viewState={showAll:false,category:""};
// Persist the demo seed once so the admin dashboard reads the same initial inventory.
if(!localStorage.getItem(DEMO_KEY)) localStorage.setItem(DEMO_KEY,JSON.stringify(db));
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function save(){localStorage.setItem(DEMO_KEY,JSON.stringify(db))}
function persistCart(){localStorage.setItem("deepu_cart",JSON.stringify(cart));$("#cartCount").textContent=cart.reduce((n,x)=>n+x.qty,0)}
function notify(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}
async function api(action,payload={}){if(!API_URL)return null;try{const r=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,...payload})});return await r.json()}catch(e){console.error(e);return null}}
const catName=id=>db.categories.find(x=>x.id===id)?.name||"Other";
const brandName=id=>db.brands.find(x=>x.id===id)?.name||"Unbranded";
function renderCatalog(){
 const q=$("#productSearch").value.toLowerCase(),cat=$("#categoryFilter").value,brand=$("#brandFilter").value;
 const list=db.products.filter(p=>p.active!==false&&(!cat||p.categoryId===cat)&&(!brand||p.brandId===brand)&&`${p.name} ${p.sku} ${brandName(p.brandId)}`.toLowerCase().includes(q));
 const shown=viewState.showAll?list:list.slice(0,8);
 $("#productGrid").innerHTML=shown.map(p=>`<article class="product-card"><div class="product-visual"><span class="stock-tag">${p.stock>0?"In stock":"Check availability"}</span><div class="product-symbol">${escapeHTML(p.name.split(" ").slice(0,2).map(x=>x[0]).join(""))}</div></div><div class="product-body"><span class="product-brand">${escapeHTML(brandName(p.brandId))}</span><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description||"Contact us for product details.")}</p><div class="product-meta"><small>${escapeHTML(p.sku||"") } · ${p.stock>0?"Available":"On request"}</small><button onclick="addToCart('${p.id}')">+ Add inquiry</button></div></div></article>`).join("")||"<p>No matching products found.</p>";
 $("#showMore").hidden=list.length<=8;$("#showMore").textContent=viewState.showAll?"Show fewer":"Show all products";
}
function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderFilters(){
 $("#categoryFilter").innerHTML='<option value="">All categories</option>'+db.categories.map(c=>`<option value="${c.id}">${escapeHTML(c.name)}</option>`).join("");
 $("#brandFilter").innerHTML='<option value="">All brands</option>'+db.brands.map(b=>`<option value="${b.id}">${escapeHTML(b.name)}</option>`).join("");
 $("#categoryPills").innerHTML=`<button class="pill active" data-cat="">All</button>`+db.categories.map(c=>`<button class="pill" data-cat="${c.id}">${escapeHTML(c.name)}</button>`).join("");
 $("#categoryPills").addEventListener("click",e=>{const b=e.target.closest("[data-cat]");if(!b)return;$("#categoryFilter").value=b.dataset.cat;$$(".pill").forEach(x=>x.classList.toggle("active",x===b));renderCatalog()});
}
function renderBrands(){$("#brandGrid").innerHTML=db.brands.filter(b=>b.active!==false).map(b=>`<div class="brand-card"><div class="brand-monogram">${escapeHTML(b.name.slice(0,2).toUpperCase())}</div><div><b>${escapeHTML(b.name)}</b><small>${escapeHTML(b.description||"Product partner")}</small></div>${b.demo?'<span class="demo-label">DEMO</span>':""}</div>`).join("")}
function renderRoutes(){$("#routeList").innerHTML=db.locations.map(x=>`<div class="route-place">${escapeHTML(x)}</div>`).join("")}
function addToCart(id){const p=db.products.find(x=>x.id===id);if(!p)return;const item=cart.find(x=>x.id===id);item?item.qty++:cart.push({id,qty:1});persistCart();notify("Added to your inquiry list")}
function openModal(html){$("#modalContent").innerHTML=html;$("#modalBackdrop").classList.add("open")}
function closeModal(){$("#modalBackdrop").classList.remove("open")}
function inquiryModal(){
 const rows=cart.map(x=>{const p=db.products.find(y=>y.id===x.id);return p?`<div class="inquiry-row"><span><b>${escapeHTML(p.name)}</b><br><small>${escapeHTML(p.sku)}</small></span><input type="number" min="1" max="99999" value="${x.qty}" data-qty="${p.id}"><button data-remove="${p.id}">×</button></div>`:""}).join("");
 openModal(`<h2>Your inquiry list</h2><p>Submit products and quantities. The sales team can respond with availability and wholesale pricing.</p>${rows||"<p>Your inquiry list is empty. Add products from the catalog first.</p>"}<form id="quoteForm" class="modal-form"><label>Your name<input name="name" required></label><label>Shop / business<input name="businessName" required></label><label>Mobile number<input name="phone" required pattern="[6-9][0-9]{9}"></label><label>Email<input name="email" type="email"></label><label class="full">Notes<textarea name="message" rows="2"></textarea></label><button class="btn btn-primary full" ${cart.length?"":"disabled"}>Send quote request</button></form>`);
 $$("[data-qty]").forEach(i=>i.addEventListener("change",()=>{const x=cart.find(y=>y.id===i.dataset.qty);if(x)x.qty=Math.max(1,Number(i.value)||1);persistCart()}));
 $$("[data-remove]").forEach(b=>b.addEventListener("click",()=>{cart=cart.filter(x=>x.id!==b.dataset.remove);persistCart();inquiryModal()}));
 $("#quoteForm").addEventListener("submit",submitQuote);
}
async function submitQuote(e){e.preventDefault();if(!cart.length)return;const f=Object.fromEntries(new FormData(e.target));const inquiry={id:"INQ-"+Date.now(),...f,items:cart.map(x=>({...x,productName:db.products.find(p=>p.id===x.id)?.name})),status:"New",createdAt:new Date().toISOString()};const remote=await api("submitInquiry",{inquiry});db.inquiries.unshift(inquiry);save();cart=[];persistCart();closeModal();notify(remote?.ok?"Inquiry submitted":"Demo inquiry saved locally. Configure Apps Script for live submission.");}
function dealerForm(){
 $("#dealerForm").addEventListener("submit",async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));const rec={id:"DEA-"+Date.now(),...data,status:"Pending",createdAt:new Date().toISOString()};const remote=await api("submitDealerApplication",{application:rec});db.dealerApplications.unshift(rec);save();$("#dealerMessage").textContent=remote?.ok?"Application submitted successfully.":"Demo application saved. Configure Apps Script for live submission.";e.target.reset()});
 $("#contactForm").addEventListener("submit",async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));const rec={id:"MSG-"+Date.now(),...data,status:"New",createdAt:new Date().toISOString()};const remote=await api("submitContact",{inquiry:rec});db.inquiries.unshift(rec);save();$("#contactMessage").textContent=remote?.ok?"Thank you. Your enquiry was sent.":"Demo enquiry saved locally. Configure Apps Script for live submission.";e.target.reset()});
}
function showLogin(kind){openModal(`<h2>${kind==="admin"?"Admin":"Dealer"} sign in</h2><p>${kind==="admin"?"Access inventory and business operations.":"Access dealer-only pricing and order information."}</p><form id="loginForm" class="modal-form"><label class="full">Email / username<input name="username" required></label><label class="full">Password<input type="password" name="password" required></label><button class="btn btn-primary full">Sign in</button></form><p class="small-muted">${kind==="admin"?"Demo admin: admin@deepu.local / Demo@12345. Live credentials must be configured in Apps Script.":"Dealer accounts require admin approval; live authentication is enabled after backend setup."}</p>`);
 $("#loginForm").addEventListener("submit",async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));if(!API_URL&&kind==="admin"&&d.username==="admin@deepu.local"&&d.password==="Demo@12345"){sessionStorage.setItem("deepu_demo_admin","1");closeModal();location.href="pages/admin/dashboard.html";return}const r=await api("login",{username:d.username,password:d.password,role:kind});if(r?.ok){sessionStorage.setItem("deepu_token",r.token);closeModal();location.href=kind==="admin"?"pages/admin/dashboard.html":"pages/dealer.html"}else notify("Sign-in failed. Configure the backend or check credentials.")});
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-view]");if(!b)return;if(b.dataset.view==="inquiry")inquiryModal();if(b.dataset.view==="admin-login")showLogin("admin");if(b.dataset.view==="dealer-login")showLogin("dealer")});
$("#modalClose").addEventListener("click",closeModal);$("#modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});
$("#productSearch").addEventListener("input",renderCatalog);$("#categoryFilter").addEventListener("change",renderCatalog);$("#brandFilter").addEventListener("change",renderCatalog);$("#showMore").addEventListener("click",()=>{viewState.showAll=!viewState.showAll;renderCatalog()});
$("#menuToggle").addEventListener("click",()=>$("#mainNav").classList.toggle("open"));$$("#mainNav a").forEach(a=>a.addEventListener("click",()=>$("#mainNav").classList.remove("open")));
$("#year").textContent=new Date().getFullYear();$("#whatsappLink").href="https://wa.me/?text="+encodeURIComponent("Hi Deepu Enterprises, I am checking your online catalog and would like to inquire about bulk prices.");
renderFilters();renderCatalog();renderBrands();renderRoutes();persistCart();dealerForm();
