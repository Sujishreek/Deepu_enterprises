/** Deepu Enterprises Apps Script API
 * Deploy as Web App: Execute as owner; access: Anyone (public endpoints only).
 * Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH using setupAdmin() before production.
 * For production, use a managed identity provider for dealer accounts and never share demo credentials.
 */
const SHEETS = {
  Products:["id","name","categoryId","brandId","sku","description","unit","stock","active","rack","price","updatedAt"],
  Categories:["id","name","description","active"],
  Brands:["id","name","description","website","active","demo"],
  Inquiries:["id","name","businessName","phone","email","message","type","itemsJson","status","createdAt"],
  DealerApplications:["id","contactName","businessName","phone","email","gstin","city","address","interest","status","createdAt"],
  Orders:["id","dealerId","orderNumber","itemsJson","status","paymentStatus","createdAt"],
  InventoryMovements:["id","productId","type","quantity","reason","by","createdAt"],
  Locations:["id","name","kind","deliveryDays","active"]
};
function doGet(){return ContentService.createTextOutput(JSON.stringify({ok:true,service:"Deepu Enterprises API",version:"1.0",message:"POST JSON actions to this endpoint."})).setMimeType(ContentService.MimeType.JSON);}
function doPost(e){
  try{
    const body=JSON.parse(e.postData.contents||"{}");
    const action=String(body.action||"");
    let result;
    if(action==="submitInquiry") result=saveInquiry(body.inquiry||{});
    else if(action==="submitDealerApplication") result=saveDealer(body.application||{});
    else if(action==="submitContact") result=saveInquiry(body.inquiry||{});
    else if(action==="publicData") result=getPublicData();
    else if(action==="login") result=login(body);
    else if(action==="adminData") {requireRole(body.token,"admin");result=getAdminData();}
    else if(action==="saveProduct") {requireRole(body.token,"admin");result=saveProduct(body.product||{});}
    else if(action==="adjustStock") {requireRole(body.token,"admin");result=adjustStock(body);}
    else if(action==="updateStatus") {requireRole(body.token,"admin");result=updateStatus(body);}
    else throw new Error("Unknown action");
    return json({ok:true,data:result});
  }catch(err){return json({ok:false,error:String(err.message||err)});}
}
function json(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function ss(){const id=PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");if(!id)throw new Error("Run setupDatabase() first.");return SpreadsheetApp.openById(id);}
function setupDatabase(){
  const p=PropertiesService.getScriptProperties();let id=p.getProperty("SPREADSHEET_ID");
  if(!id){const s=SpreadsheetApp.create("Deepu Enterprises – Business Data");id=s.getId();p.setProperty("SPREADSHEET_ID",id);}
  const book=SpreadsheetApp.openById(id);
  Object.keys(SHEETS).forEach(name=>{let sh=book.getSheetByName(name)||book.insertSheet(name);sh.clear();sh.appendRow(SHEETS[name]);sh.setFrozenRows(1);});
  seedDemoData(book);
  Logger.log("Database ready: "+book.getUrl());
}
function seedDemoData(book){
  const add=(name,rows)=>{const sh=book.getSheetByName(name);if(rows.length)sh.getRange(2,1,rows.length,rows[0].length).setValues(rows);};
  add("Categories",[["C1","Hardware & Plumbing","Pipes, fittings, tools and plumbing essentials.",true],["C2","Electrical & Wiring","Lighting, switches and wiring accessories.",true],["C3","Agro Products","Agricultural supply products.",true],["C4","FMCG & Consumer Goods","Everyday consumer products.",true]]);
  add("Brands",[["B1","Astral","Pipes, fittings and adhesives","",true,true],["B2","Supreme","Pipes and building materials","",true,true],["B3","Havells","Electrical products and lighting","",true,true],["B4","Panasonic","Electrical products and lighting","",true,true],["B5","Hansa Green","LED lighting products","",true,true],["B6","Klassey","Lighting and electrical products","",true,true],["B7","Generic Hardware","General hardware and tools","",true,true]]);
  const products=[
    ["P001","Astral PVC Pipe 1 inch","C1","B1","AST-PVC-001","PVC pipe for plumbing applications.","Length",120,true,"B-01-02","",new Date()],
    ["P002","Astral BondTite Fast & Clear 1 kg","C1","B1","AST-ADH-001","Multipurpose adhesive pack.","Pack",45,true,"B-01-03","",new Date()],
    ["P003","Supreme PVC Elbow 1 inch","C1","B2","SUP-FIT-EL01","PVC elbow fitting.","Piece",300,true,"A-02-01","",new Date()],
    ["P004","Combination Plier 8 inch","C1","B7","GEN-TOOL-PL8","General purpose hand tool.","Piece",25,true,"C-01-04","",new Date()],
    ["P005","Panasonic LED Bulb 23W","C2","B4","PAN-LED-023","Energy-efficient LED bulb.","Piece",80,true,"D-01-01","",new Date()],
    ["P006","Hansa Green LED Panel Light","C2","B5","HAN-LED-PL01","LED panel light.","Piece",35,true,"D-02-02","",new Date()],
    ["P007","Klassey LED Batten Light","C2","B6","KLA-LED-BT01","LED batten light.","Piece",50,true,"D-02-03","",new Date()],
    ["P008","Havells Modular Switch","C2","B3","HAV-SW-001","Modular electrical switch.","Piece",150,true,"D-03-01","",new Date()],
    ["P009","Electrical Insulation Tape","C2","B7","GEN-TAPE-001","PVC insulation tape.","Roll",200,true,"D-03-02","",new Date()],
    ["P010","Agricultural Water Hose","C3","B7","AGR-HOSE-001","Flexible agricultural water hose.","Meter",500,true,"E-01-01","",new Date()],
    ["P011","LED Night Lamp","C4","B7","CON-LED-NL01","Compact LED night lamp.","Piece",60,true,"F-01-01","",new Date()],
    ["P012","Extension Board 4 Socket","C2","B7","CON-EXT-004","Four-socket extension board.","Piece",20,true,"D-04-01","",new Date()]
  ];add("Products",products);
  add("Locations",["Channarayapatna","Hassan City","Holenarasipura","Arsikere","Belur","Sakleshpur","Arkalgud","Alur"].map((n,i)=>["L"+(i+1),n,i===0?"Primary hub":"Published coverage area","To be confirmed",true]));
}
function rows(name){const sh=ss().getSheetByName(name);const v=sh.getDataRange().getValues();return v.slice(1).filter(r=>r.some(x=>x!==""));}
function objects(name){const sh=ss().getSheetByName(name),v=sh.getDataRange().getValues(),h=v.shift();return v.filter(r=>r.some(x=>x!=="")).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]])));}
function append(name,obj){const h=SHEETS[name];ss().getSheetByName(name).appendRow(h.map(k=>obj[k]===undefined?"":obj[k]));}
function saveInquiry(x){if(!x.phone||!x.name&&!x.customerName)throw new Error("Name and phone are required.");append("Inquiries",{id:x.id||Utilities.getUuid(),name:x.name||x.customerName,businessName:x.businessName||"",phone:String(x.phone),email:x.email||"",message:x.message||"",type:x.type||"Quote",itemsJson:JSON.stringify(x.items||[]),status:"New",createdAt:new Date()});return {id:x.id||"saved"};}
function saveDealer(x){if(!x.contactName||!x.businessName||!x.phone||!x.city)throw new Error("Required dealer details are missing.");if(x.gstin&&!/^[0-9A-Z]{15}$/i.test(x.gstin))throw new Error("GSTIN format is invalid.");append("DealerApplications",{id:x.id||Utilities.getUuid(),contactName:x.contactName,businessName:x.businessName,phone:String(x.phone),email:x.email||"",gstin:x.gstin||"",city:x.city,address:x.address||"",interest:x.interest||"",status:"Pending",createdAt:new Date()});return {status:"Pending"};}
function getPublicData(){return {categories:objects("Categories").filter(x=>x.active),brands:objects("Brands").filter(x=>x.active),products:objects("Products").filter(x=>x.active).map(({rack,price,...p})=>p),locations:objects("Locations").filter(x=>x.active).map(x=>x.name)};}
function setupAdmin(){const p=PropertiesService.getScriptProperties();p.setProperty("ADMIN_EMAIL","admin@deepuenterprises.com");p.setProperty("ADMIN_PASSWORD_HASH",sha256("CHANGE-THIS-INITIAL-PASSWORD"));Logger.log("Admin created. Change initial password immediately by updating Script Properties.");}
function sha256(s){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,s).map(b=>(b+256).toString(16).slice(-2)).join("");}
function login(x){const email=PropertiesService.getScriptProperties().getProperty("ADMIN_EMAIL"),hash=PropertiesService.getScriptProperties().getProperty("ADMIN_PASSWORD_HASH");if(x.role!=="admin"||x.username!==email||sha256(String(x.password||""))!==hash)throw new Error("Invalid credentials or role. Dealer authentication requires account provisioning.");const token=Utilities.getUuid()+Utilities.getUuid();CacheService.getScriptCache().put("auth_"+token,"admin",21600);return {token,role:"admin"};}
function requireRole(token,role){if(!token||CacheService.getScriptCache().get("auth_"+token)!==role)throw new Error("Session expired. Sign in again.");}
function getAdminData(){return {products:objects("Products"),categories:objects("Categories"),brands:objects("Brands"),inquiries:objects("Inquiries"),dealerApplications:objects("DealerApplications"),locations:objects("Locations"),movements:objects("InventoryMovements")};}
function saveProduct(p){if(!p.name||!p.sku)throw new Error("Product name and SKU are required.");const sh=ss().getSheetByName("Products"),data=sh.getDataRange().getValues(),head=data[0],idx=data.findIndex((r,i)=>i>0&&r[0]===p.id);const row=head.map(k=>p[k]===undefined?"":p[k]);if(idx>0)sh.getRange(idx+1,1,1,row.length).setValues([row]);else{p.id=p.id||Utilities.getUuid();append("Products",p);}return {saved:true};}
function adjustStock(x){const sh=ss().getSheetByName("Products"),v=sh.getDataRange().getValues(),i=v.findIndex((r,n)=>n>0&&r[0]===x.productId);if(i<1)throw new Error("Product not found.");const old=Number(v[i][7]),delta=Number(x.delta);if(!Number.isFinite(delta)||old+delta<0)throw new Error("Invalid stock adjustment.");sh.getRange(i+1,8).setValue(old+delta);append("InventoryMovements",{id:Utilities.getUuid(),productId:x.productId,type:delta>=0?"Receipt":"Issue",quantity:delta,reason:x.reason||"Admin adjustment",by:"Admin",createdAt:new Date()});return {stock:old+delta};}
function updateStatus(x){const map={inquiry:["Inquiries","status"],dealer:["DealerApplications","status"]},cfg=map[x.kind];if(!cfg)throw new Error("Invalid record type.");const sh=ss().getSheetByName(cfg[0]),v=sh.getDataRange().getValues(),col=v[0].indexOf(cfg[1]),i=v.findIndex((r,n)=>n>0&&r[0]===x.id);if(i<1)throw new Error("Record not found.");sh.getRange(i+1,col+1).setValue(x.status);return {updated:true};}
