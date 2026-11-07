/**
 * Intelligent Multilingual & Tanglish Fuzzy Search Engine (Pure JavaScript)
 * Supports English, Tamil Unicode, Tanglish phonetics, and typo tolerance without external libraries.
 */

const SearchEngine = {
    // Tanglish Phonetic Synonym Dictionary for Electrical & Electronics Goods
    SYNONYMS: {
        // Bulbs & Lighting
        "bulb": ["bulb", "bulbu", "balb", "pelbu", "lightu", "laight", "பல்பு", "விளக்கு"],
        "led": ["led", "el e di", "el.e.di", "எல்.இ.டி", "எல்இடி"],
        "tube": ["tube", "tubelight", "toob", "toobulaight", "டியூப்", "குழல்"],
        "downlight": ["downlight", "down light", "daun laight", "டவுன்லைட்"],
        "panel": ["panel", "panal", "paenal", "பேனல்"],
        "lamp": ["lamp", "laampu", "விளக்கு", "தீபம்"],

        // Wires & Cables
        "wire": ["wire", "vayar", "vaayar", "vaiyer", "vaiyaru", "kambi", "கம்பி", "வயர்", "ஒயர்"],
        "cable": ["cable", "kabel", "kaybil", "keppil", "கேபிள்", "வடம்"],
        "copper": ["copper", "koppar", "kappar", "செம்பு", "தாமிரம்"],

        // Switches & Accessories
        "switch": ["switch", "suvich", "suwitch", "suvitch", "swich", "சுவிட்ச்", "பொத்தான்"],
        "socket": ["socket", "saaket", "saakket", "plug point", "சாக்கெட்"],
        "plug": ["plug", "pilak", "pilaku", "பிளக்"],
        "regulator": ["regulator", "fan speed", "ரெகுலேட்டர்"],

        // Circuit Protection
        "mcb": ["mcb", "emcebee", "breaker", "பிரேக்கர்", "எம்.சி.பி"],
        "fuse": ["fuse", "fyoos", "pyoos", "kattu", "ஃப்யூஸ்"],
        "isolator": ["isolator", "aisolator", "ஐசோலேட்டர்"],

        // Fans & Ventilation
        "fan": ["fan", "faan", "pan", "kaathadi", "katradi", "மின் விசிறி", "விசிறி", "ஃபேன்"],
        "exhaust": ["exhaust", "egaas", "egaast", "புகை போக்கி", "எக்ஸாஸ்ட்"],

        // Tools & Tape
        "plier": ["plier", "cutting plier", "katting playar", "பிளேயர்", "இடுக்கட்டி"],
        "tester": ["tester", "testar", "laing testar", "டெஸ்டர்"],
        "tape": ["tape", "tepu", "insulation tape", "செல்லோடேப்", "டேப்"],

        // Brands
        "philips": ["philips", "filips", "philps", "felips", "பிலிப்ஸ்"],
        "syska": ["syska", "siska", "cyska", "sysca", "சிஸ்கா"],
        "havells": ["havells", "havels", "havelz", "ஹேவல்ஸ்"],
        "crompton": ["crompton", "krompton", "cromptan", "கிராம்ப்டன்"],
        "finolex": ["finolex", "finolekz", "fino", "பினோலெக்ஸ்"],
        "anchor": ["anchor", "aankar", "angkar", "enkar", "ஆங்கர்"],
        "polycab": ["polycab", "policab", "polikab", "பாலிகேப்"],
        "bajaj": ["bajaj", "bajaaj", "பஜாஜ்"],
        "legrand": ["legrand", "legraand", "லெக்ராண்ட்"]
    },

    // Levenshtein string distance algorithm for spelling typos
    levenshtein(a, b) {
        if (!a || !b) return (a || b).length;
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    },

    similarity(s1, s2) {
        const longer = s1.length > s2.length ? s1 : s2;
        const shorter = s1.length > s2.length ? s2 : s1;
        if (longer.length === 0) return 1.0;
        return (longer.length - this.levenshtein(longer, shorter)) / parseFloat(longer.length);
    },

    normalize(text) {
        if (!text) return "";
        return String(text).toLowerCase().replace(/[\(\)\[\]\{\}\-_,\./\\]/g, " ").trim();
    },

    expandTerms(query) {
        const norm = this.normalize(query);
        const tokens = norm.split(/\s+/).filter(Boolean);
        const expanded = new Set(tokens);

        tokens.forEach(tok => {
            Object.keys(this.SYNONYMS).forEach(canonical => {
                const variants = this.SYNONYMS[canonical];
                if (tok === canonical || variants.includes(tok) || variants.some(v => this.similarity(tok, v) >= 0.8)) {
                    expanded.add(canonical);
                    variants.forEach(v => expanded.add(v));
                }
            });
        });

        return { rawTokens: tokens, expanded: Array.from(expanded) };
    },

    search(products, query, limit = 50) {
        if (!query || !query.trim()) {
            return products.slice(0, limit);
        }

        const { rawTokens, expanded } = this.expandTerms(query);
        const fullQuery = rawTokens.join(" ");

        const scored = products.map(p => {
            const name = this.normalize(p.name);
            const nameTa = this.normalize(p.name_ta);
            const sku = this.normalize(p.sku);
            const brand = this.normalize(p.brand_name || p.brand_id);
            const rack = this.normalize(p.rack_id);
            const blob = `${name} ${nameTa} ${sku} ${brand} ${rack}`;

            let score = 0;

            // 1. Exact match bonus
            if (sku.includes(fullQuery)) score += 100;
            if (name.includes(fullQuery) || nameTa.includes(fullQuery)) score += 80;
            if (brand.includes(fullQuery) || rack.includes(fullQuery)) score += 40;

            // 2. Token match
            rawTokens.forEach(tok => {
                if (sku.includes(tok)) score += 40;
                else if (name.includes(tok) || nameTa.includes(tok)) score += 30;
                else if (brand.includes(tok) || rack.includes(tok)) score += 20;
                else {
                    // Word fuzzy match
                    const words = blob.split(/\s+/);
                    const best = Math.max(...words.map(w => this.similarity(tok, w)), 0);
                    if (best >= 0.78) {
                        score += best * 25;
                    }
                }
            });

            // 3. Synonym bonus
            expanded.forEach(term => {
                if (!rawTokens.includes(term)) {
                    if (name.includes(term) || nameTa.includes(term)) score += 18;
                    else if (brand.includes(term) || rack.includes(term)) score += 12;
                }
            });

            return { score, product: p };
        });

        return scored
            .filter(x => x.score > 15)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(x => x.product);
    },

    getSuggestions(products, query, limit = 8) {
        if (!query || query.trim().length < 1) {
            return { products: [], brands: [] };
        }

        const matched = this.search(products, query, limit);
        const brands = new Set();
        matched.forEach(p => {
            if (p.brand_name) brands.add(p.brand_name);
        });

        return {
            products: matched.slice(0, limit),
            brands: Array.from(brands).slice(0, 4)
        };
    }
};
