// Try It On: Omni - content script.
// Extracts a compact "page context" (what is the user shopping for?) and reports it
// to the background worker. Wrapped in an IIFE + guard so a second injection via
// chrome.scripting.executeScript does not redeclare anything.
(() => {
  if (globalThis.__omniContentLoaded) return;
  globalThis.__omniContentLoaded = true;

  const TEXT_LIMIT = 1500;
  const MAX_IMAGES = 4;
  const MIN_IMG_WIDTH = 250;

  const KEYWORDS = {
    apparel: [
      "jacket", "snowboard", "ski", "parka", "hoodie", "pants", "bib", "gloves", "goggles",
      "boots", "shoes", "sneakers", "dress", "coat", "shirt", "apparel", "outerwear",
      "beanie", "helmet", "wetsuit", "surfboard", "surf", "swimsuit", "bikini", "boardshorts",
      "trench", "sweater", "jeans", "skis", "backpack", "sunglasses", "hat", "gear", "fins",
    ],
    real_estate: [
      "for sale", "bed", "beds", "bath", "baths", "sqft", "sq ft", "listing", "mls",
      "open house", "acre", "hoa", "condo", "townhouse",
    ],
    auto: [
      "awd", "4wd", "4x4", "mpg", "suv", "sedan", "truck", "pickup", "ev", "hybrid", "vin",
      "mileage", "trim", "horsepower", "test drive", "dealer",
    ],
    travel: [
      "resort", "lift ticket", "ski area", "trail map", "snow report", "lodging", "vacation",
      "gondola", "chairlift", "season pass", "vertical feet", "base village", "ski in", "getaway",
      "surf report", "beach stay", "surf lesson", "board rental", "cottage", "boardwalk",
    ],
  };
  const ATTRIBUTE_KEYWORDS = [
    "snow", "winter", "powder", "mountain", "beach", "city", "family", "offroad", "off-road",
    "surf", "ocean", "coast", "downtown", "night", "rain",
  ];

  const DOMAINS = {
    real_estate: ["zillow.", "redfin.", "realtor.com", "trulia.", "compass.com", "homes.com"],
    auto: [
      "cars.com", "autotrader.", "carvana.", "cargurus.", "carmax.", "edmunds.", "tesla.com",
      "truecar.",
    ],
    apparel: [
      "evo.com", "rei.com", "burton.com", "backcountry.com", "patagonia.com",
      "thenorthface.com", "arcteryx.", "nike.", "zara.", "uniqlo.",
    ],
    apparelIfKeywords: ["amazon."],
    travel: ["vail.com", "epicpass.", "ikonpass.", "skiresort.info", "onthesnow.", "snow.com", "booking.com", "airbnb."],
  };
  const TRAVEL_TYPES = [
    "skiresort", "touristdestination", "touristattraction", "lodgingbusiness", "resort", "hotel",
    "campground", "sportsactivitylocation",
  ];

  const AUTO_TYPES = ["vehicle", "car", "motorcycle", "motorizedbicycle", "busorcoach"];
  const RE_TYPES = [
    "residence", "singlefamilyresidence", "house", "apartment", "apartmentcomplex",
    "realestatelisting", "accommodation", "gatedresidencecommunity",
  ];

  // ---------- helpers ----------
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const kwRegex = (kw) =>
    new RegExp("(?:^|[^a-z0-9])" + escapeRe(kw).replace(/ /g, "[\\s_-]+") + "s?(?![a-z0-9])", "gi");
  const KW_RE = {};
  for (const list of [...Object.values(KEYWORDS), ATTRIBUTE_KEYWORDS]) {
    for (const kw of list) KW_RE[kw] = kwRegex(kw);
  }
  const countHits = (re, s) => {
    if (!s) return 0;
    re.lastIndex = 0;
    const m = s.match(re);
    return m ? m.length : 0;
  };

  const collapse = (s) => (s || "").replace(/\s+/g, " ").trim();

  const meta = (...names) => {
    for (const n of names) {
      const el =
        document.querySelector(`meta[property="${n}"]`) ||
        document.querySelector(`meta[name="${n}"]`) ||
        document.querySelector(`meta[itemprop="${n}"]`);
      const v = el && el.getAttribute("content");
      if (v && v.trim()) return v.trim();
    }
    return "";
  };

  const absUrl = (u) => {
    if (!u || typeof u !== "string") return null;
    try {
      return new URL(u.trim(), location.href).href;
    } catch (_) {
      return null;
    }
  };

  // ---------- JSON-LD ----------
  function readJsonLd() {
    const objects = [];
    const walk = (node, depth) => {
      if (!node || typeof node !== "object" || depth > 8) return;
      if (Array.isArray(node)) {
        for (const n of node) walk(n, depth + 1);
        return;
      }
      objects.push(node);
      for (const [k, v] of Object.entries(node)) {
        if (k === "@context") continue;
        if (v && typeof v === "object") walk(v, depth + 1);
      }
    };
    for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        walk(JSON.parse(s.textContent || ""), 0);
      } catch (_) {
        /* malformed JSON-LD is common; ignore */
      }
    }
    const types = [];
    for (const o of objects) {
      const t = o["@type"];
      for (const v of Array.isArray(t) ? t : [t]) {
        if (typeof v === "string" && v && !types.includes(v)) types.push(v);
      }
    }
    return { objects, types };
  }

  const typesOf = (o) => {
    const t = o && o["@type"];
    return (Array.isArray(t) ? t : [t]).filter((x) => typeof x === "string").map((x) => x.toLowerCase());
  };

  function priceFromJsonLd(objects) {
    for (const o of objects) {
      if (!o.offers) continue;
      const offers = Array.isArray(o.offers) ? o.offers : [o.offers];
      for (const off of offers) {
        if (!off || typeof off !== "object") continue;
        let amount = off.price ?? off.lowPrice;
        let currency = off.priceCurrency;
        if (amount == null && off.priceSpecification) {
          const ps = Array.isArray(off.priceSpecification) ? off.priceSpecification[0] : off.priceSpecification;
          if (ps) {
            amount = ps.price;
            currency = currency || ps.priceCurrency;
          }
        }
        if (amount != null && String(amount).trim() !== "") {
          return collapse(`${amount} ${currency || ""}`);
        }
      }
    }
    return null;
  }

  function imagesFromJsonLd(objects) {
    const out = [];
    const add = (img) => {
      if (!img) return;
      if (typeof img === "string") out.push(img);
      else if (Array.isArray(img)) img.forEach(add);
      else if (typeof img === "object") add(img.url || img.contentUrl);
    };
    // Prefer the "thing being sold" objects first, then anything else with an image.
    const primary = objects.filter((o) => o.offers || typesOf(o).some((t) =>
      ["product", "vehicle", "car", "realestatelisting", "residence", "house", "singlefamilyresidence", "apartment"].includes(t)));
    for (const o of primary) add(o.image);
    for (const o of objects) if (!primary.includes(o)) add(o.image);
    return out;
  }

  // ---------- images ----------
  const BAD_IMG_RE = /(logo|icon|sprite|favicon|avatar|badge|placeholder|spinner|loader|pixel|tracking|1x1)/i;

  function isUsableImageUrl(u) {
    if (!u) return false;
    if (u.startsWith("data:")) {
      // data:URI -> approximate decoded size; skip tiny inline images (< 5KB)
      const comma = u.indexOf(",");
      const approx = comma >= 0 ? (u.length - comma - 1) * 0.75 : 0;
      return approx >= 5 * 1024 && !/^data:image\/svg/i.test(u);
    }
    if (!/^https?:/i.test(u)) return false;
    let path = u;
    try {
      path = new URL(u).pathname;
    } catch (_) {}
    if (/\.svg(\?|$)/i.test(path)) return false;
    return !BAD_IMG_RE.test(path);
  }

  function largestVisibleImages() {
    const vw = window.innerWidth || 1280;
    const candidates = [];
    for (const img of document.images) {
      const rect = img.getBoundingClientRect();
      if (rect.width < MIN_IMG_WIDTH || rect.height < 100) continue;
      // ignore things far outside the page (carousels parked off-screen are still fine)
      if (rect.right < -vw || rect.left > vw * 2) continue;
      const alt = (img.alt || "") + " " + (img.className || "") + " " + (img.id || "");
      if (/logo|icon|sprite|avatar/i.test(alt)) continue;
      const style = getComputedStyle(img);
      if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) continue;
      const src = img.currentSrc || img.src || img.getAttribute("data-src") || "";
      const url = src.startsWith("data:") ? src : absUrl(src);
      if (!isUsableImageUrl(url)) continue;
      candidates.push({ url, area: rect.width * rect.height });
    }
    candidates.sort((a, b) => b.area - a.area);
    return candidates.map((c) => c.url);
  }

  function collectImageUrls(jsonLdObjects) {
    const ordered = [
      meta("og:image:secure_url", "og:image"),
      meta("twitter:image", "twitter:image:src"),
      ...imagesFromJsonLd(jsonLdObjects),
    ]
      .map((u) => (u && u.startsWith("data:") ? u : absUrl(u)))
      .filter(isUsableImageUrl);
    const out = [];
    for (const u of [...ordered, ...largestVisibleImages()]) {
      if (u && !out.includes(u)) out.push(u);
      if (out.length >= MAX_IMAGES) break;
    }
    return out;
  }

  // ---------- text ----------
  function visibleText() {
    const root =
      document.querySelector("main") ||
      document.querySelector("article") ||
      document.querySelector('[role="main"]') ||
      document.body;
    if (!root) return "";
    let t = collapse(root.innerText || root.textContent || "");
    if (t.length < 200 && root !== document.body && document.body) {
      t = collapse(document.body.innerText || "");
    }
    return t.slice(0, TEXT_LIMIT);
  }

  // ---------- vertical heuristic ----------
  function classify({ title, description, url, text, types, jsonLdObjects, host }) {
    const urlText = decodeURIComponentSafe(url).replace(/[^a-z0-9]+/gi, " ");
    const score = { apparel: 0, real_estate: 0, auto: 0, travel: 0 };
    const kwHits = { apparel: 0, real_estate: 0, auto: 0, travel: 0 };
    const keywords = [];

    for (const [vertical, list] of Object.entries(KEYWORDS)) {
      for (const kw of list) {
        const re = KW_RE[kw];
        const hT = countHits(re, title);
        const hD = countHits(re, description);
        const hU = countHits(re, urlText);
        const hX = Math.min(countHits(re, text), 3);
        const s = hT * 3 + hD * 2 + hU * 2 + hX;
        if (s > 0) {
          score[vertical] += s;
          kwHits[vertical] += 1;
          if (!keywords.includes(kw)) keywords.push(kw);
        }
      }
    }
    const all = `${title} ${description} ${urlText} ${text}`;
    for (const kw of ATTRIBUTE_KEYWORDS) {
      if (countHits(KW_RE[kw], all) > 0) {
        const norm = kw === "off-road" ? "offroad" : kw;
        if (!keywords.includes(norm)) keywords.push(norm);
      }
    }

    // JSON-LD types
    const lower = types.map((t) => t.toLowerCase());
    if (lower.some((t) => AUTO_TYPES.includes(t))) score.auto += 8;
    if (lower.some((t) => RE_TYPES.includes(t))) score.real_estate += 8;
    if (lower.some((t) => TRAVEL_TYPES.includes(t))) score.travel += 30; // a declared destination beats gear keywords
    if (jsonLdObjects.some((o) => typesOf(o).includes("place") && o.floorSize)) score.real_estate += 6;
    if (jsonLdObjects.some((o) => o.floorSize || o.numberOfRooms || o.numberOfBedrooms)) score.real_estate += 3;
    // Generic Product/Offer leans apparel, but weakly so other signals win.
    if (lower.includes("product") || lower.includes("offer") || lower.includes("aggregateoffer")) {
      score.apparel += 3;
    }

    // Known domains
    const h = host.toLowerCase();
    const onDomain = (list) => list.some((d) => h === d.replace(/\.$/, "") || h.includes(d) || h.endsWith("." + d));
    if (onDomain(DOMAINS.real_estate)) score.real_estate += 10;
    if (onDomain(DOMAINS.auto)) score.auto += 10;
    if (onDomain(DOMAINS.apparel)) score.apparel += 6;
    if (onDomain(DOMAINS.travel)) score.travel += 10;
    if (onDomain(DOMAINS.apparelIfKeywords) && kwHits.apparel > 0) score.apparel += 4;

    let best = "none";
    let bestScore = 0;
    for (const [v, s] of Object.entries(score)) {
      if (s > bestScore) {
        best = v;
        bestScore = s;
      }
    }
    // Need a minimal amount of evidence before claiming a vertical.
    if (bestScore < 4) best = "none";
    return { vertical: best, keywords, score };
  }

  function decodeURIComponentSafe(s) {
    try {
      return decodeURIComponent(s);
    } catch (_) {
      return s;
    }
  }

  // ---------- main extract ----------
  function extract() {
    const { objects, types } = readJsonLd();
    const url = location.href;
    const host = location.hostname.replace(/^www\./, "");
    const title = collapse(meta("og:title") || document.title || "");
    const description = collapse(meta("description", "og:description", "twitter:description")).slice(0, 600);
    const siteName = meta("og:site_name") || host;
    let price = priceFromJsonLd(objects);
    if (!price) {
      const amt = meta("product:price:amount", "og:price:amount");
      if (amt) price = collapse(`${amt} ${meta("product:price:currency", "og:price:currency")}`);
    }
    const text = visibleText();
    const { vertical, keywords } = classify({
      title: document.title + " " + title,
      description,
      url,
      text,
      types,
      jsonLdObjects: objects,
      host,
    });
    return {
      url,
      title: title || document.title || url,
      description,
      siteName,
      price: price || null,
      jsonLdTypes: types,
      keywords,
      vertical,
      text,
      imageUrls: collectImageUrls(objects),
    };
  }

  // ---------- messaging ----------
  function report() {
    let page;
    try {
      page = extract();
    } catch (e) {
      return;
    }
    try {
      chrome.runtime.sendMessage({ type: "omni:page", page }).catch(() => {});
    } catch (_) {
      // Extension was reloaded: this orphaned script can no longer talk to it.
      clearInterval(urlTimer);
    }
  }

  let debounceTimer = null;
  function scheduleReport() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(report, 800);
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg && msg.type === "omni:extract") {
      try {
        sendResponse({ ok: true, page: extract() });
      } catch (e) {
        sendResponse({ ok: false, error: String(e && e.message || e) });
      }
    }
    // synchronous response; no need to return true
  });

  let lastUrl = location.href;
  const urlTimer = setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      scheduleReport();
    }
  }, 1500);

  // Realtime: page controls marked with data-lifecast-prompt (color swatches, paint, weather...) steer the live video.
  document.addEventListener(
    "click",
    (e) => {
      const el = e.target && e.target.closest ? e.target.closest("[data-lifecast-prompt]") : null;
      if (!el) return;
      try {
        chrome.runtime.sendMessage({
          type: "omni:interact",
          prompt: el.getAttribute("data-lifecast-prompt"),
          label: el.getAttribute("data-lifecast-label") || el.textContent.trim().slice(0, 40),
        });
      } catch (_) {}
    },
    true
  );

  scheduleReport();
})();
