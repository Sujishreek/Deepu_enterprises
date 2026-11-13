/**
 * Deepu Enterprises – Voice + Text Assistant (user page)
 * Type or speak a product, brand, section or any word → the page scrolls to it.
 * Relies on globals from user.js (view, db, LANG, activeProducts, brandList, renderFilters, renderCatalog, SearchEngine…).
 */
(function () {
  "use strict";

  const T = {
    en: {
      name: "Deepu Assistant", tip: "I am your assistant", hello: "Hi! I am your assistant. Type or speak a product, brand or section — I will take you there.",
      ph: "Type or speak… e.g. Test Switch", send: "Search", mic: "Speak", listening: "Listening…", close: "Close",
      chips: ["Test Switch", "Havells", "Contact", "Become a dealer"],
      toProduct: n => `Showing “${n}” in the catalog.`, toBrand: n => `Showing ${n} products.`, toSection: n => `Taking you to ${n}.`,
      toText: "Found it on this page — taking you there.", none: q => `Sorry, I couldn't find “${q}”. Try another word.`,
      noVoice: "Voice is not supported in this browser. Please type instead.", micDenied: "Microphone permission is blocked. Please allow it or type instead.",
      noSpeech: "I didn't hear anything. Tap the mic and try again.", more: "Also matching:"
    },
    kn: {
      name: "ದೀಪು ಸಹಾಯಕ", tip: "ನಾನು ನಿಮ್ಮ ಸಹಾಯಕ", hello: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಸಹಾಯಕ. ಉತ್ಪನ್ನ, ಬ್ರಾಂಡ್ ಅಥವಾ ವಿಭಾಗವನ್ನು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಹೇಳಿ — ನಾನು ಅಲ್ಲಿಗೆ ಕರೆದುಕೊಂಡು ಹೋಗುತ್ತೇನೆ.",
      ph: "ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಹೇಳಿ…", send: "ಹುಡುಕಿ", mic: "ಮಾತನಾಡಿ", listening: "ಕೇಳುತ್ತಿದ್ದೇನೆ…", close: "ಮುಚ್ಚಿ",
      chips: ["Test Switch", "Havells", "ಸಂಪರ್ಕ", "ಡೀಲರ್"],
      toProduct: n => `ಕ್ಯಾಟಲಾಗ್‌ನಲ್ಲಿ “${n}” ತೋರಿಸುತ್ತಿದ್ದೇನೆ.`, toBrand: n => `${n} ಉತ್ಪನ್ನಗಳನ್ನು ತೋರಿಸುತ್ತಿದ್ದೇನೆ.`, toSection: n => `${n} ಗೆ ಕರೆದೊಯ್ಯುತ್ತಿದ್ದೇನೆ.`,
      toText: "ಈ ಪುಟದಲ್ಲಿ ಸಿಕ್ಕಿತು — ಅಲ್ಲಿಗೆ ಕರೆದೊಯ್ಯುತ್ತಿದ್ದೇನೆ.", none: q => `ಕ್ಷಮಿಸಿ, “${q}” ಸಿಗಲಿಲ್ಲ. ಬೇರೆ ಪದ ಪ್ರಯತ್ನಿಸಿ.`,
      noVoice: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಬೆಂಬಲವಿಲ್ಲ. ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ.", micDenied: "ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನಿರ್ಬಂಧಿತವಾಗಿದೆ. ಅನುಮತಿಸಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.",
      noSpeech: "ಏನೂ ಕೇಳಿಸಲಿಲ್ಲ. ಮೈಕ್ ಒತ್ತಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", more: "ಇವೂ ಹೊಂದುತ್ತವೆ:"
    }
  };
  const L = () => T[(typeof LANG !== "undefined" && LANG === "kn") ? "kn" : "en"];

  // Page sections the assistant can jump to (English, Tanglish and Kannada words)
  const SECTIONS = [
    { id: "home", en: "Home", kn: "ಮುಖಪುಟ", words: ["home", "top", "start", "main", "ಮುಖಪುಟ", "ಮನೆ"] },
    { id: "sections", en: "Shop by Section", kn: "ವಿಭಾಗಗಳು", words: ["section", "sections", "shop by section", "racks", "rack", "categories", "ವಿಭಾಗ", "ವಿಭಾಗಗಳು"] },
    { id: "catalog", en: "Catalog", kn: "ಕ್ಯಾಟಲಾಗ್", words: ["catalog", "catalogue", "products", "product", "items", "ಕ್ಯಾಟಲಾಗ್", "ಉತ್ಪನ್ನ", "ಉತ್ಪನ್ನಗಳು"] },
    { id: "brands", en: "Brands", kn: "ಬ್ರಾಂಡ್‌ಗಳು", words: ["brands", "brand", "ಬ್ರಾಂಡ್", "ಬ್ರಾಂಡ್‌ಗಳು"] },
    { id: "about", en: "About", kn: "ನಮ್ಮ ಬಗ್ಗೆ", words: ["about", "about us", "who are you", "ಬಗ್ಗೆ", "ನಮ್ಮ ಬಗ್ಗೆ"] },
    { id: "logistics", en: "Logistics", kn: "ಸಾಗಣೆ", words: ["logistics", "delivery", "shipping", "transport", "routes", "ಸಾಗಣೆ", "ಡೆಲಿವರಿ"] },
    { id: "dealer", en: "Become a Dealer", kn: "ಡೀಲರ್ ಆಗಿ", words: ["dealer", "dealership", "become a dealer", "distributor", "apply", "ಡೀಲರ್", "ಡೀಲರ್‌ಶಿಪ್"] },
    { id: "contact", en: "Contact", kn: "ಸಂಪರ್ಕ", words: ["contact", "contact us", "phone", "address", "location", "email", "enquiry", "inquiry", "send enquiry", "ಸಂಪರ್ಕ", "ವಿಳಾಸ", "ಫೋನ್"] }
  ];
  const ACTIONS = [
    { words: ["track order", "track", "order status", "my order", "ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್"], run: () => window.openTrackOrderModal && window.openTrackOrderModal(), en: "Track Order", kn: "ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್" },
    { words: ["cart", "cart & order", "cart and order", "my cart", "basket", "ಕಾರ್ಟ್"], run: () => { const b = document.querySelector(".btn-enquiry"); if (b) b.click(); }, en: "Cart & Order", kn: "ಕಾರ್ಟ್" }
  ];
  const FILLER = /^(please\s+)?(go to|goto|take me to|take me|show me|show|open|find|search for|search|look for|where is|where are|i want|i need|need|want|get me|navigate to)\s+/i;

  const $q = s => document.querySelector(s);
  const norm = s => (typeof SearchEngine !== "undefined" ? SearchEngine.normalize(s) : String(s).toLowerCase()).replace(/[.?!]+$/g, "").trim();
  const sim = (a, b) => (typeof SearchEngine !== "undefined" ? SearchEngine.similarity(a, b) : (a === b ? 1 : 0));
  const escH = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- UI ---------- */
  const root = document.createElement("div");
  root.id = "assistant";
  root.innerHTML = `
    <button type="button" class="as-fab" id="asFab" aria-haspopup="dialog" aria-expanded="false">
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><rect x="9" y="2.5" width="6" height="11" rx="3" fill="#fff"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.2M8.8 21.2h6.4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M19.4 3.2l.55 1.45 1.45.55-1.45.55-.55 1.45-.55-1.45-1.45-.55 1.45-.55z" fill="#FFE14D"/></svg>
      <span class="as-tip" id="asTip" role="tooltip"></span>
    </button>
    <section class="as-panel" id="asPanel" role="dialog" aria-modal="false" aria-labelledby="asTitle" hidden>
      <header><span class="as-dot"></span><b id="asTitle"></b><button type="button" class="as-x" id="asClose">×</button></header>
      <div class="as-log" id="asLog" aria-live="polite"></div>
      <div class="as-chips" id="asChips"></div>
      <form class="as-form" id="asForm" autocomplete="off">
        <input id="asInput" type="text" enterkeyhint="search">
        <button type="button" class="as-mic" id="asMic" aria-label="Speak"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="9" y="2.5" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.2M8.8 21.2h6.4" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg></button>
        <button type="submit" class="as-go" id="asGo">→</button>
      </form>
    </section>`;
  document.body.appendChild(root);

  const fab = $q("#asFab"), panel = $q("#asPanel"), log = $q("#asLog"), input = $q("#asInput"), mic = $q("#asMic");

  function label() {
    const t = L();
    $q("#asTip").textContent = t.tip; fab.setAttribute("aria-label", t.tip);
    $q("#asTitle").textContent = t.name; input.placeholder = t.ph;
    mic.setAttribute("aria-label", t.mic); mic.title = t.mic; $q("#asGo").setAttribute("aria-label", t.send); $q("#asClose").setAttribute("aria-label", t.close);
    $q("#asChips").innerHTML = t.chips.map(c => `<button type="button">${escH(c)}</button>`).join("");
  }
  function say(text, who = "bot", extraHtml = "") {
    const d = document.createElement("div");
    d.className = "as-msg " + who; d.innerHTML = `<span>${escH(text)}</span>${extraHtml}`;
    log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  function open() {
    panel.hidden = false; requestAnimationFrame(() => panel.classList.add("show"));
    fab.setAttribute("aria-expanded", "true");
    if (!log.children.length) say(L().hello);
    setTimeout(() => input.focus(), 120);
  }
  function close() {
    stopListening(); panel.classList.remove("show"); fab.setAttribute("aria-expanded", "false");
    setTimeout(() => { if (!panel.classList.contains("show")) panel.hidden = true; }, 180);
  }
  fab.addEventListener("click", () => (panel.hidden ? open() : close()));
  $q("#asClose").addEventListener("click", close);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) close(); });
  $q("#asChips").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { input.value = b.textContent; handle(b.textContent, false); } });
  $q("#asForm").addEventListener("submit", e => { e.preventDefault(); handle(input.value, false); });
  const langBtn = $q("#langToggle");
  if (langBtn) langBtn.addEventListener("click", () => setTimeout(() => { label(); recog && (recog.lang = recLang()); }, 0));

  /* ---------- Highlight + scroll ---------- */
  function flash(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: el.matches("section") ? "start" : "center" });
    el.classList.remove("as-hit"); void el.offsetWidth; el.classList.add("as-hit");
    setTimeout(() => el.classList.remove("as-hit"), 3200);
  }
  const goSection = id => { const el = document.getElementById(id); if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); if (id !== "home") flash2(el); } };
  function flash2(el) { const h = el.querySelector("h2, h3") || el; h.classList.remove("as-hit"); void h.offsetWidth; h.classList.add("as-hit"); setTimeout(() => h.classList.remove("as-hit"), 3200); }

  /* ---------- Search logic ---------- */
  function matchSection(q) {
    let best = null;
    SECTIONS.forEach(s => s.words.forEach(w => {
      const nw = norm(w); const score = nw === q ? 1 : (q.length > 3 && nw.length > 3 ? sim(q, nw) : 0);
      if (score >= 0.84 && (!best || score > best.score)) best = { s, score };
    }));
    return best && best.s;
  }
  function matchAction(q) { return ACTIONS.find(a => a.words.some(w => norm(w) === q)); }
  function matchBrand(q) {
    if (typeof brandList !== "function") return null;
    const toks = q.split(/\s+/);
    let hit = null;
    brandList().forEach(b => {
      const nb = norm(b.name);
      if (nb === q || (toks.length === 1 && nb.length > 3 && sim(q, nb) >= 0.8)) hit = hit || b;
    });
    if (!hit && typeof SearchEngine !== "undefined" && toks.length === 1) {
      const canon = Object.keys(SearchEngine.SYNONYMS).find(k => k === q || SearchEngine.SYNONYMS[k].includes(q));
      if (canon) hit = brandList().find(b => norm(b.name) === canon) || null;
    }
    return hit;
  }
  function showInCatalog(patch) {
    Object.assign(view, { q: "", cat: "", brand: "", rack: "", showAll: false }, patch);
    renderFilters(); renderCatalog(); if (typeof renderRacks === "function") renderRacks();
  }
  function textSearch(q) {
    const toks = q.split(/\s+/).filter(t => t.length > 1);
    if (!toks.length) return null;
    const nodes = [...document.querySelectorAll("main h1, main h2, main h3, main p, main .contact-item, main .value-card, main .route-place, main .rack-tile, main .brand-card, main label, main .section-kicker, footer b")];
    let best = null;
    nodes.forEach(n => {
      if (n.closest("#assistant")) return;
      const t = norm(n.textContent); if (!t) return;
      let sc = 0; toks.forEach(k => { if (t.includes(k)) sc += 1 + k.length / 20; });
      if (t.includes(q)) sc += 3;
      if (sc > 0 && (!best || sc > best.sc || (sc === best.sc && t.length < best.len))) best = { n, sc, len: t.length };
    });
    return best && best.sc >= Math.min(toks.length, 2) ? best.n : null;
  }

  function handle(raw, spoken) {
    let q = norm(raw);
    if (!q) return;
    say(raw.trim(), "me");
    input.value = "";
    q = q.replace(FILLER, "").replace(/\s+(please|section|page)$/i, "").trim() || q;
    const t = L(), isKn = t === T.kn;
    let reply = "", extra = "";

    const action = matchAction(q);
    const sec = !action && matchSection(q);
    if (action) { reply = t.toSection(isKn ? action.kn : action.en); action.run(); }
    else if (sec) { reply = t.toSection(isKn ? sec.kn : sec.en); goSection(sec.id); }
    else {
      const brand = matchBrand(q);
      const prods = typeof activeProducts === "function" ? activeProducts() : [];
      if (brand) {
        showInCatalog({ brand: brand.name });
        reply = t.toBrand(brand.name);
        setTimeout(() => { flash($q("#catalog")); }, 60);
      } else {
        const res = typeof SearchEngine !== "undefined" ? SearchEngine.search(prods, q, 500) : [];
        if (res.length) {
          const top = res[0], nm = (typeof pName === "function" ? pName(top) : top.name);
          showInCatalog({ q: raw.trim().replace(FILLER, "").replace(/[.?!]+$/g, "") });
          reply = t.toProduct(nm);
          setTimeout(() => {
            const card = document.querySelector("#productGrid .product-card");
            flash(card || $q("#catalog"));
          }, 80);
          if (res.length > 1) {
            extra = `<div class="as-more"><small>${t.more}</small>` + res.slice(1, 5).map(p => `<button type="button" data-q="${escH(p.name)}">${escH(typeof pName === "function" ? pName(p) : p.name)}</button>`).join("") + `</div>`;
          }
        } else {
          const node = textSearch(q);
          if (node) { reply = t.toText; setTimeout(() => flash(node), 30); }
          else reply = t.none(raw.trim());
        }
      }
    }
    const m = say(reply, "bot", extra);
    m.querySelectorAll("[data-q]").forEach(b => b.addEventListener("click", () => { input.value = b.dataset.q; handle(b.dataset.q, false); }));
    if (spoken && "speechSynthesis" in window) {
      try { const u = new SpeechSynthesisUtterance(reply); u.lang = recLang(); speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {}
    }
    // On phones, tuck the panel away so the result is visible
    if (window.matchMedia("(max-width: 700px)").matches && reply !== t.none(raw.trim())) setTimeout(close, 900);
  }

  /* ---------- Voice ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recLang = () => (typeof LANG !== "undefined" && LANG === "kn") ? "kn-IN" : "en-IN";
  let recog = null, listening = false, gotResult = false;
  function stopListening() { if (recog && listening) { try { recog.stop(); } catch (e) {} } listening = false; mic.classList.remove("on"); }
  mic.addEventListener("click", () => {
    if (!SR) { say(L().noVoice); return; }
    if (listening) { stopListening(); return; }
    recog = new SR(); recog.lang = recLang(); recog.interimResults = true; recog.maxAlternatives = 1; recog.continuous = false;
    gotResult = false;
    recog.onstart = () => { listening = true; mic.classList.add("on"); input.placeholder = L().listening; };
    recog.onresult = ev => {
      let txt = "", final = false;
      for (const r of ev.results) { txt += r[0].transcript; if (r.isFinal) final = true; }
      input.value = txt;
      if (final) { gotResult = true; stopListening(); handle(txt, true); }
    };
    recog.onerror = ev => { if (ev.error === "not-allowed" || ev.error === "service-not-allowed") say(L().micDenied); else if (ev.error === "no-speech") say(L().noSpeech); };
    recog.onend = () => { listening = false; mic.classList.remove("on"); input.placeholder = L().ph; if (!gotResult && input.value.trim()) handle(input.value, true); };
    try { recog.start(); } catch (e) {}
  });
  if (!SR) mic.title = "Voice not supported in this browser";

  label();
})();
