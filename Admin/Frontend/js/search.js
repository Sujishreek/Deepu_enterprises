/**
 * Intelligent Multilingual & Tanglish Fuzzy Search Engine (Pure JavaScript)
 * Supports English, Kannada Unicode, Tanglish phonetics, and typo tolerance without external libraries.
 */

const SearchEngine = {
    // Kannada-script and Tanglish phonetic synonyms for electrical products.
    SYNONYMS: {
        "bulb": ["bulb", "bulbu", "balb", "pelbu", "lightu", "laight", "ಬಲ್ಬ್", "ಬಲ್ಬು", "ದೀಪ"],
        "led": ["led", "el e di", "el.e.di", "ಎಲ್ ಇ ಡಿ", "ಎಲ್ಇಡಿ"],
        "tube": ["tube", "tubelight", "toob", "toobulaight", "ಟ್ಯೂಬ್", "ಟ್ಯೂಬ್ ಲೈಟ್"],
        "downlight": ["downlight", "down light", "daun laight", "ಡೌನ್‌ಲೈಟ್"],
        "panel": ["panel", "panal", "paenal", "ಪ್ಯಾನೆಲ್"],
        "lamp": ["lamp", "laampu", "ದೀಪ", "ಲ್ಯಾಂಪ್"],
        "wire": ["wire", "vayar", "vaayar", "vaiyer", "vaiyaru", "kambi", "ತಂತಿ", "ತಂತಿಗಳು", "ವೈರ್"],
        "cable": ["cable", "kabel", "kaybil", "keppil", "ಕೇಬಲ್", "ತಂತಿ"],
        "copper": ["copper", "koppar", "kappar", "ತಾಮ್ರ", "ಕಾಪರ್"],
        "switch": ["switch", "suvich", "suwitch", "suvitch", "swich", "ಸ್ವಿಚ್", "ಗುಂಡಿ"],
        "socket": ["socket", "saaket", "saakket", "plug point", "ಸಾಕೆಟ್"],
        "plug": ["plug", "pilak", "pilaku", "ಪ್ಲಗ್"],
        "regulator": ["regulator", "fan speed", "ರೆಗ್ಯುಲೇಟರ್"],
        "mcb": ["mcb", "emcebee", "breaker", "ಬ್ರೇಕರ್", "ಎಂಸಿಬಿ"],
        "fuse": ["fuse", "fyoos", "pyoos", "kattu", "ಫ್ಯೂಸ್"],
        "isolator": ["isolator", "aisolator", "ಐಸೋಲೇಟರ್"],
        "rccb": ["rccb", "elcb", "shock", "ಅರ್ಥ್ ಲೀಕೇಜ್"],
        "fan": ["fan", "faan", "pan", "kaathadi", "katradi", "ಫ್ಯಾನ್", "ಗಾಳಿ ಬೀಸಣಿಗೆ"],
        "exhaust": ["exhaust", "egaas", "egaast", "ಹೊಗೆ ಹೊರಹಾಕುವ ಫ್ಯಾನ್", "ಎಕ್ಸಾಸ್ಟ್"],
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
        "legrand": ["legrand", "legraand", "ಲೆಗ್ರಾಂಡ್"]
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
            const nameKn = this.normalize(p.name_kn || p.name_ta || p.name);
            const sku = this.normalize(p.sku);
            const brand = this.normalize(p.brand_name || p.brand_id);
            const rack = this.normalize(p.rack_id);
            const blob = `${name} ${nameKn} ${sku} ${brand} ${rack}`;

            let score = 0;

            // 1. Exact match bonus
            if (sku.includes(fullQuery)) score += 100;
            if (name.includes(fullQuery) || nameKn.includes(fullQuery)) score += 80;
            if (brand.includes(fullQuery) || rack.includes(fullQuery)) score += 40;

            // 2. Token match
            rawTokens.forEach(tok => {
                if (sku.includes(tok)) score += 40;
                else if (name.includes(tok) || nameKn.includes(tok)) score += 30;
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
                    if (name.includes(term) || nameKn.includes(term)) score += 18;
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
