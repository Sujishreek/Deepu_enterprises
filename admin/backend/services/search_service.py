"""Multilingual search for electrical products: English, Kannada and Tanglish spellings."""
import re
import difflib

# Kannada-script and common Latin transliteration variants for electrical products.
KANNADA_SYNONYMS = {
    "bulb": ["bulb", "bulbu", "balb", "pelbu", "lightu", "ಬಲ್ಬ್", "ಬಲ್ಬು", "ದೀಪ"],
    "led": ["led", "el e di", "el.e.di", "ಎಲ್ ಇ ಡಿ", "ಎಲ್ಇಡಿ"],
    "tube": ["tube", "tubelight", "toob", "toobulaight", "ಟ್ಯೂಬ್", "ಟ್ಯೂಬ್ ಲೈಟ್"],
    "downlight": ["downlight", "down light", "daun laight", "ಡೌನ್‌ಲೈಟ್"],
    "panel": ["panel", "panal", "paenal", "ಪ್ಯಾನೆಲ್"],
    "lamp": ["lamp", "laampu", "ದೀಪ", "ಲ್ಯಾಂಪ್"],
    "wire": ["wire", "vayar", "vaayar", "vaiyer", "vaiyaru", "kambi", "ತಂತಿ", "ತಂತಿಗಳು", "ವೈರ್"],
    "cable": ["cable", "kabel", "kaybil", "keppil", "ಕೇಬಲ್", "ತಂತಿ"],
    "copper": ["copper", "koppar", "kappar", "ತಾಮ್ರ", "ಕಾಪರ್"],
    "fr": ["fr", "flame retardant", "thee pidikkatha", "ಅಗ್ನಿ ನಿರೋಧಕ"],
    "switch": ["switch", "suvich", "suwitch", "suvitch", "swich", "ಸ್ವಿಚ್", "ಗುಂಡಿ"],
    "socket": ["socket", "saaket", "saakket", "plug point", "ಸಾಕೆಟ್"],
    "plug": ["plug", "pilak", "pilaku", "ಪ್ಲಗ್"],
    "regulator": ["regulator", "fan speed", "ರೆಗ್ಯುಲೇಟರ್"],
    "mcb": ["mcb", "emcebee", "breaker", "sarkyoot", "ಬ್ರೇಕರ್", "ಎಂಸಿಬಿ"],
    "fuse": ["fuse", "fyoos", "pyoos", "kattu", "ಫ್ಯೂಸ್"],
    "isolator": ["isolator", "aisolator", "ಐಸೋಲೇಟರ್"],
    "rccb": ["rccb", "elcb", "shock", "ಅರ್ಥ್ ಲೀಕೇಜ್"],
    "fan": ["fan", "faan", "pan", "kaathadi", "katradi", "ಫ್ಯಾನ್", "ಗಾಳಿ ಬೀಸಣಿಗೆ"],
    "exhaust": ["exhaust", "egaas", "egaast", "ಹೊಗೆ ಹೊರಹಾಕುವ ಫ್ಯಾನ್", "ಎಕ್ಸಾಸ್ಟ್"],
    "motor": ["motor", "motar", "mottar", "ಮೋಟಾರ್"],
    "pump": ["pump", "pampu", "ಪಂಪ್"],
    "plier": ["plier", "cutting plier", "katting playar", "ಪ್ಲಯರ್", "ಕಟಿಂಗ್ ಪ್ಲಯರ್"],
    "tester": ["tester", "testar", "laing testar", "ಟೆಸ್ಟರ್"],
    "tape": ["tape", "tepu", "insulation tape", "ಇನ್ಸುಲೇಷನ್ ಟೇಪ್", "ಟೇಪ್"],
    "philips": ["philips", "filips", "philps", "felips", "ಫಿಲಿಪ್ಸ್"],
    "syska": ["syska", "siska", "cyska", "sysca", "ಸಿಸ್ಕಾ"],
    "havells": ["havells", "havels", "havelz", "ಹ್ಯಾವೆಲ್ಸ್"],
    "crompton": ["crompton", "krompton", "cromptan", "ಕ್ರಾಂಪ್ಟನ್"],
    "finolex": ["finolex", "finolekz", "fino", "ಫಿನೋಲೆಕ್ಸ್"],
    "anchor": ["anchor", "aankar", "angkar", "enkar", "ಆಂಕರ್"],
    "polycab": ["polycab", "policab", "polikab", "ಪಾಲಿಕ್ಯಾಬ್"],
    "bajaj": ["bajaj", "bajaaj", "ಬಜಾಜ್"],
    "legrand": ["legrand", "legraand", "ಲೆಗ್ರಾಂಡ್"],
}


def normalize_text(text: str) -> str:
    """Normalize text by lowercasing and removing punctuation."""
    if not text:
        return ""
    text = text.lower().strip()
    return re.sub(r'[\(\)\[\]\{\}\-_,\./\\]', ' ', text)


def expand_query_terms(query: str):
    """Expand English, Kannada and Tanglish query terms into related spellings."""
    normalized = normalize_text(query)
    raw_tokens = [token for token in normalized.split() if token]
    expanded = set(raw_tokens)
    for token in raw_tokens:
        for canonical, variants in KANNADA_SYNONYMS.items():
            if token == canonical or token in variants or any(
                difflib.SequenceMatcher(None, token, variant).ratio() > 0.82 for variant in variants
            ):
                expanded.add(canonical)
                expanded.update(variants)
    return raw_tokens, list(expanded)


def score_product(product: dict, raw_tokens: list, expanded_terms: list) -> float:
    """Score a product against query tokens, product metadata and aliases."""
    name = (product.get("name") or "").lower()
    name_kn = (product.get("name_kn") or product.get("name_ta") or "").lower()
    sku = (product.get("sku") or "").lower()
    brand = (product.get("brand_name") or product.get("brand_id") or "").lower()
    category = (product.get("category_name") or product.get("category_id") or "").lower()
    rack = (product.get("rack_id") or "").lower()
    desc = (product.get("description") or "").lower()
    searchable_blob = f"{name} {name_kn} {sku} {brand} {category} {rack} {desc}"
    score = 0.0
    query_full = " ".join(raw_tokens)
    if query_full:
        if query_full in sku:
            score += 100.0
        if query_full in name or query_full in name_kn:
            score += 80.0
        elif query_full in brand or query_full in category:
            score += 50.0
    for token in raw_tokens:
        if token in sku:
            score += 40.0
        elif token in name or token in name_kn:
            score += 30.0
        elif token in brand or token in category or token in rack:
            score += 20.0
        elif token in desc:
            score += 10.0
        else:
            best_ratio = max([difflib.SequenceMatcher(None, token, word).ratio() for word in searchable_blob.split()] or [0])
            if best_ratio >= 0.80:
                score += best_ratio * 25.0
    for term in expanded_terms:
        if term not in raw_tokens:
            if term in name or term in name_kn:
                score += 18.0
            elif term in category or term in brand:
                score += 14.0
    return score


def search_products(products_list: list, query: str, limit: int = 50) -> list:
    """Filter and rank products using multilingual and fuzzy matching."""
    if not query or not query.strip():
        return products_list[:limit]
    raw_tokens, expanded = expand_query_terms(query)
    scored = []
    for product in products_list:
        score = score_product(product, raw_tokens, expanded)
        if score > 15.0:
            scored.append((score, product))
    scored.sort(key=lambda item: item[0], reverse=True)
    return [item[1] for item in scored[:limit]]


def get_search_suggestions(products_list: list, query: str, limit: int = 8) -> dict:
    """Return ranked products plus unique matching brands and categories."""
    if not query or len(query.strip()) < 1:
        return {"products": [], "brands": [], "categories": []}
    ranked_products = search_products(products_list, query, limit=limit)
    matched_brands, matched_cats = set(), set()
    for product in ranked_products:
        if product.get("brand_name"):
            matched_brands.add(product["brand_name"])
        if product.get("category_name"):
            matched_cats.add(product["category_name"])
    return {
        "products": [{
            "id": product["product_id"],
            "name": product["name"],
            "name_kn": product.get("name_kn") or product.get("name_ta", ""),
            "sku": product["sku"],
            "price": product["selling_price"],
            "stock": product["stock_quantity"],
            "rack": product.get("rack_id", ""),
        } for product in ranked_products],
        "brands": sorted(matched_brands),
        "categories": sorted(matched_cats),
    }
