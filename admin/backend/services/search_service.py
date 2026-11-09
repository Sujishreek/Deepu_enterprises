"""
Intelligent Multilingual & Tanglish Fuzzy Search Engine for Electrical & Electronics Inventory
Supports English, Tamil Unicode, Tanglish phonetic mapping, and typo tolerance.
"""

import re
import difflib

# Tanglish (Tamil written in Latin script) & Synonym Dictionary
TANGLISH_SYNONYMS = {
    # Bulbs & Lights
    "bulb": ["bulb", "bulbu", "balb", "pelbu", "lightu", "பல்பு", "விளக்கு"],
    "led": ["led", "el e di", "el.e.di", "எல்.இ.டி", "எல்இடி"],
    "tube": ["tube", "tubelight", "toob", "toobulaight", "டியூப்", "குழல்"],
    "downlight": ["downlight", "down light", "daun laight", "டவுன்லைட்"],
    "panel": ["panel", "panal", "paenal", "பேனல்"],
    "lamp": ["lamp", "laampu", "விளக்கு", "தீபம்"],

    # Wires & Cables
    "wire": ["wire", "vayar", "vaayar", "vaiyer", "vaiyaru", "kambi", "கம்பி", "வயர்", "ஒயர்"],
    "cable": ["cable", "kabel", "kaybil", "keppil", "கேபிள்", "வடம்"],
    "copper": ["copper", "koppar", "kappar", "செம்பு", "தாமிரம்"],
    "fr": ["fr", "flame retardant", "thee pidikkatha", "தீ"],

    # Switches & Sockets
    "switch": ["switch", "suvich", "suwitch", "suvitch", "swich", "சுவிட்ச்", "பொத்தான்"],
    "socket": ["socket", "saaket", "saakket", "plug point", "சாக்கெட்"],
    "plug": ["plug", "pilak", "pilaku", "பிளக்"],
    "regulator": ["regulator", "fan speed", "ரெகுலேட்டர்"],

    # Protection & Circuit
    "mcb": ["mcb", "emcebee", "breaker", "sarkyoot", "பிரேக்கர்", "எம்.சி.பி"],
    "fuse": ["fuse", "fyoos", "pyoos", "kattu", "ஃப்யூஸ்"],
    "isolator": ["isolator", "aisolator", "ஐசோலேட்டர்"],
    "rccb": ["rccb", "elcb", "shock", "எர்த் லீக்கேஜ்"],

    # Fans & Motors
    "fan": ["fan", "faan", "pan", "kaathadi", "katradi", "மின் விசிறி", "விசிறி", "ஃபேன்"],
    "exhaust": ["exhaust", "egaas", "egaast", "புகை போக்கி", "எக்ஸாஸ்ட்"],
    "motor": ["motor", "motar", "mottar", "மோட்டார்"],
    "pump": ["pump", "pampu", "பம்பு"],

    # Tools & Hardware
    "plier": ["plier", "cutting plier", "katting playar", "பிளேயர்", "இடுக்கட்டி"],
    "tester": ["tester", "testar", "laing testar", "டெஸ்டர்"],
    "tape": ["tape", "tepu", "insulation tape", "செல்லோடேப்", "டேப்"],

    # Brands
    "philips": ["philips", "filips", "philps", "felips", "பிலிப்ஸ்"],
    "syska": ["syska", "siska", "cyska", "sysca", "சிஸ்கா"],
    "havells": ["havells", "havels", "havelz", "ஹேவல்ஸ்"],
    "crompton": ["crompton", "krompton", "cromptan", "கிராம்ப்டன்"],
    "finolex": ["finolex", "finolekz", "fino", "பினோலெக்ஸ்"],
    "anchor": ["anchor", "aankar", "angkar", "enkar", "ஆங்கர்"],
    "polycab": ["polycab", "policab", "polikab", "பாலிகேப்"],
    "bajaj": ["bajaj", "bajaaj", "பஜாஜ்"],
    "legrand": ["legrand", "legraand", "லெக்ராண்ட்"]
}

def normalize_text(text: str) -> str:
    """Normalize text by lowercasing and removing punctuation."""
    if not text:
        return ""
    text = text.lower().strip()
    return re.sub(r'[\(\)\[\]\{\}\-_,\./\\]', ' ', text)

def expand_query_terms(query: str):
    """
    Expands input search query terms using the Tanglish/Tamil synonym table.
    e.g. 'vayar' -> ['vayar', 'wire', 'finolex', 'polycab', ...]
    """
    normalized = normalize_text(query)
    raw_tokens = [t for t in normalized.split() if t]
    
    expanded = set(raw_tokens)
    target_categories = set()
    target_brands = set()

    for token in raw_tokens:
        # Check against Tanglish dictionary
        for canonical, variants in TANGLISH_SYNONYMS.items():
            # If token matches canonical or any variant or is high fuzzy match
            if token == canonical or token in variants or any(difflib.SequenceMatcher(None, token, v).ratio() > 0.82 for v in variants):
                expanded.add(canonical)
                expanded.update(variants)
                
    return raw_tokens, list(expanded)

def score_product(product: dict, raw_tokens: list, expanded_terms: list) -> float:
    """
    Calculates a relevance score for a product based on tokens, fuzzy matching, and metadata.
    """
    name = (product.get("name") or "").lower()
    name_ta = (product.get("name_ta") or "").lower()
    sku = (product.get("sku") or "").lower()
    brand = (product.get("brand_name") or product.get("brand_id") or "").lower()
    category = (product.get("category_name") or product.get("category_id") or "").lower()
    rack = (product.get("rack_id") or "").lower()
    desc = (product.get("description") or "").lower()

    searchable_blob = f"{name} {name_ta} {sku} {brand} {category} {rack} {desc}"
    score = 0.0

    # 1. Exact query match in name or SKU
    query_full = " ".join(raw_tokens)
    if query_full:
        if query_full in sku:
            score += 100.0
        if query_full in name or query_full in name_ta:
            score += 80.0
        elif query_full in brand or query_full in category:
            score += 50.0

    # 2. Token-level matching
    for token in raw_tokens:
        if token in sku:
            score += 40.0
        elif token in name or token in name_ta:
            score += 30.0
        elif token in brand or token in category or token in rack:
            score += 20.0
        elif token in desc:
            score += 10.0
        else:
            # Fuzzy match with words in product name
            words = searchable_blob.split()
            best_ratio = max([difflib.SequenceMatcher(None, token, w).ratio() for w in words] or [0])
            if best_ratio >= 0.80:
                score += (best_ratio * 25.0)

    # 3. Expanded Tanglish / Tamil term matches
    for term in expanded_terms:
        if term not in raw_tokens: # only bonus for mapped synonyms
            if term in name or term in name_ta:
                score += 18.0
            elif term in category or term in brand:
                score += 14.0

    return score

def search_products(products_list: list, query: str, limit: int = 50) -> list:
    """
    Filters and ranks products using smart multilingual and Tanglish fuzzy search.
    """
    if not query or not query.strip():
        return products_list[:limit]

    raw_tokens, expanded = expand_query_terms(query)
    scored = []

    for p in products_list:
        score = score_product(p, raw_tokens, expanded)
        if score > 15.0: # Minimum relevance threshold
            scored.append((score, p))

    # Sort descending by score
    scored.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in scored[:limit]]

def get_search_suggestions(products_list: list, query: str, limit: int = 8) -> dict:
    """
    Provides fast autocomplete suggestions for search input.
    Returns: { "products": [...], "brands": [...], "categories": [...] }
    """
    if not query or len(query.strip()) < 1:
        return {"products": [], "brands": [], "categories": []}

    ranked_products = search_products(products_list, query, limit=limit)
    
    # Extract unique matching brands and categories
    q_norm = normalize_text(query)
    matched_brands = set()
    matched_cats = set()

    for p in ranked_products:
        if p.get("brand_name"):
            matched_brands.add(p["brand_name"])
        if p.get("category_name"):
            matched_cats.add(p["category_name"])

    return {
        "products": [
            {
                "id": p["product_id"],
                "name": p["name"],
                "name_ta": p.get("name_ta", ""),
                "sku": p["sku"],
                "price": p["selling_price"],
                "stock": p["stock_quantity"],
                "rack": p.get("rack_id", ""),
                "image_url": p.get("image_url", "")
            }
            for p in ranked_products[:limit]
        ],
        "brands": list(matched_brands)[:4],
        "categories": list(matched_cats)[:4]
    }
