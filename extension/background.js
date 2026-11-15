// Try It On: Omni - background service worker (MV3).
// No DOM / window here: only fetch, createImageBitmap, OffscreenCanvas, chrome.* APIs.

const HISTORY_KEY = "omniHistory";
const HISTORY_ENABLED_KEY = "historyEnabled";
const HISTORY_MAX = 30;
const MAX_IMAGES = 3;
const MAX_HISTORY_IMAGES = 2;
const MAX_SIDE = 1280;
const MIN_SIDE = 200;
const JPEG_QUALITY = 0.88;
const FETCH_TIMEOUT_MS = 8000;
const ACCENT = "#ff6a3d";

// ---------- side panel behavior ----------
function enablePanelOnActionClick() {
  try {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((e) => console.warn("[omni] setPanelBehavior failed", e));
  } catch (e) {
    console.warn("[omni] chrome.sidePanel unavailable (needs Chrome 116+)", e);
  }
}
chrome.runtime.onInstalled.addListener(enablePanelOnActionClick);
chrome.runtime.onStartup.addListener(enablePanelOnActionClick);
enablePanelOnActionClick();

// ---------- per-tab page context (memory + storage.session) ----------
const tabContexts = new Map();
const ctxKey = (tabId) => `ctx_${tabId}`;

async function setTabContext(tabId, page) {
  tabContexts.set(tabId, page);
  try {
    await chrome.storage.session.set({ [ctxKey(tabId)]: page });
  } catch (_) {
    /* session storage quota (10MB) - memory copy still works */
  }
}

async function getTabContext(tabId) {
  if (tabContexts.has(tabId)) return tabContexts.get(tabId);
  try {
    const key = ctxKey(tabId);
    const got = await chrome.storage.session.get(key);
    if (got[key]) {
      tabContexts.set(tabId, got[key]);
      return got[key];
    }
  } catch (_) {}
  return null;
}

async function clearTabContext(tabId) {
  tabContexts.delete(tabId);
  try {
    await chrome.storage.session.remove(ctxKey(tabId));
  } catch (_) {}
}

chrome.tabs.onRemoved.addListener((tabId) => {
  clearTabContext(tabId);
});

// ---------- badge ----------
async function updateBadge(tabId, page) {
  const on = !!page && page.vertical && page.vertical !== "none";
  try {
    await chrome.action.setBadgeText({ tabId, text: on ? "✓" : "" });
    if (on) {
      await chrome.action.setBadgeBackgroundColor({ tabId, color: ACCENT });
      if (chrome.action.setBadgeTextColor) {
        await chrome.action.setBadgeTextColor({ tabId, color: "#ffffff" });
      }
    }
  } catch (_) {
    /* tab may have closed */
  }
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const page = await getTabContext(tabId);
  updateBadge(tabId, page);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (!changeInfo.url) return;
  const page = await getTabContext(tabId);
  if (page && stripHash(page.url) !== stripHash(changeInfo.url)) {
    // Navigated away: drop stale context; the content script will report the new page.
    await clearTabContext(tabId);
    updateBadge(tabId, null);
  }
});

// ---------- history (local only, shopping pages only) ----------
function stripHash(u) {
  try {
    const x = new URL(u);
    x.hash = "";
    return x.href;
  } catch (_) {
    return u || "";
  }
}

async function isHistoryEnabled() {
  const got = await chrome.storage.local.get(HISTORY_ENABLED_KEY);
  return got[HISTORY_ENABLED_KEY] !== false; // default true
}

async function getHistory() {
  const got = await chrome.storage.local.get(HISTORY_KEY);
  return Array.isArray(got[HISTORY_KEY]) ? got[HISTORY_KEY] : [];
}

// Serialize read-modify-write cycles so concurrent page reports don't clobber each other.
let historyChain = Promise.resolve();
function recordHistory(page) {
  historyChain = historyChain
    .then(async () => {
      if (!page || !page.vertical || page.vertical === "none") return;
      if (!(await isHistoryEnabled())) return;
      const url = stripHash(page.url);
      if (!/^https?:/i.test(url)) return;
      const item = {
        url,
        title: page.title || url,
        vertical: page.vertical,
        keywords: Array.isArray(page.keywords) ? page.keywords.slice(0, 20) : [],
        price: page.price || null,
        imageUrl:
          Array.isArray(page.imageUrls) && page.imageUrls[0] && !page.imageUrls[0].startsWith("data:")
            ? page.imageUrls[0]
            : null,
        ts: Date.now(),
      };
      const hist = (await getHistory()).filter((h) => h && h.url !== url);
      hist.unshift(item);
      await chrome.storage.local.set({ [HISTORY_KEY]: hist.slice(0, HISTORY_MAX) });
    })
    .catch((e) => console.warn("[omni] history write failed", e));
  return historyChain;
}

// ---------- page extraction from a tab ----------
async function extractFromTab(tabId) {
  const ask = () => chrome.tabs.sendMessage(tabId, { type: "omni:extract" });
  let res = null;
  try {
    res = await ask();
  } catch (_) {
    // No content script (tab opened before install, or extension reloaded): inject it.
    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
      res = await ask();
    } catch (e) {
      res = null; // chrome://, Web Store, PDF viewer, etc. can't be scripted
    }
  }
  if (res && res.ok && res.page) {
    await setTabContext(tabId, res.page);
    return res.page;
  }
  return null;
}

async function fallbackPageFromTab(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    let siteName = "";
    try {
      siteName = new URL(tab.url).hostname.replace(/^www\./, "");
    } catch (_) {}
    return {
      url: tab.url || "",
      title: tab.title || "",
      description: "",
      siteName,
      price: null,
      jsonLdTypes: [],
      keywords: [],
      vertical: "none",
      text: "",
      imageUrls: [],
    };
  } catch (_) {
    return null;
  }
}

async function resolveTabId(tabId) {
  if (typeof tabId === "number") return tabId;
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab ? tab.id : null;
}

// ---------- image pipeline ----------
function arrayBufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  const CHUNK = 0x8000;
  let bin = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

async function fetchBlob(url) {
  if (url.startsWith("data:")) {
    const r = await fetch(url);
    return r.blob();
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(url, { credentials: "omit", signal: ctrl.signal, redirect: "follow" });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.blob();
  } finally {
    clearTimeout(timer);
  }
}

// Returns {dataUrl, width, height, sourceUrl} or null on any failure / too small.
async function loadImage(url) {
  let bitmap = null;
  try {
    const blob = await fetchBlob(url);
    if (blob.type && /svg/i.test(blob.type)) return null; // can't decode SVG in a worker
    bitmap = await createImageBitmap(blob);
    const w0 = bitmap.width;
    const h0 = bitmap.height;
    if (w0 < MIN_SIDE || h0 < MIN_SIDE) return null;
    const scale = Math.min(1, MAX_SIDE / Math.max(w0, h0));
    const width = Math.max(1, Math.round(w0 * scale));
    const height = Math.max(1, Math.round(h0 * scale));
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff"; // flatten transparency for JPEG
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    const jpeg = await canvas.convertToBlob({ type: "image/jpeg", quality: JPEG_QUALITY });
    const b64 = arrayBufferToBase64(await jpeg.arrayBuffer());
    return { dataUrl: `data:image/jpeg;base64,${b64}`, width, height, sourceUrl: url };
  } catch (e) {
    console.debug("[omni] image skipped", url, e && e.message);
    return null;
  } finally {
    if (bitmap && bitmap.close) bitmap.close();
  }
}

// Load candidates in parallel; keep the first `max` successes in candidate order.
async function loadImages(urls, max) {
  const results = await Promise.all((urls || []).map((u) => loadImage(u)));
  return results.filter(Boolean).slice(0, max);
}

async function loadHistoryImages(history, currentUrl) {
  const current = stripHash(currentUrl);
  const newest = (v, n) =>
    history
      .filter((h) => h && h.vertical === v && h.imageUrl && stripHash(h.url) !== current)
      .sort((a, b) => (b.ts || 0) - (a.ts || 0))
      .slice(0, n);
  // Recent apparel (to dress the shopper) + the most recent destination (to drive to).
  // Destinations: the latest trip/resort and the latest home listing.
  const picks = [...newest("apparel", MAX_HISTORY_IMAGES), ...newest("travel", 1), ...newest("real_estate", 1)];
  const loaded = await Promise.all(
    picks.map(async (h) => {
      const img = await loadImage(h.imageUrl);
      return img ? { ...img, title: h.title || "", url: h.url, vertical: h.vertical } : null;
    })
  );
  return loaded.filter(Boolean);
}

// ---------- collect: full context payload for the web app ----------
async function collect(tabId) {
  const id = await resolveTabId(tabId);
  let page = null;
  if (id != null) {
    page = (await extractFromTab(id)) || (await getTabContext(id)) || (await fallbackPageFromTab(id));
  }
  if (!page) {
    page = { url: "", title: "", description: "", siteName: "", price: null, jsonLdTypes: [], keywords: [], vertical: "none", text: "", imageUrls: [] };
  }
  if (id != null) {
    updateBadge(id, page);
    recordHistory(page);
    await historyChain;
  }

  const historyEnabled = await isHistoryEnabled();
  const history = historyEnabled ? await getHistory() : [];

  const [images, historyImages] = await Promise.all([
    loadImages(page.imageUrls, MAX_IMAGES),
    historyEnabled ? loadHistoryImages(history, page.url) : Promise.resolve([]),
  ]);

  return {
    type: "omni:context",
    version: 1,
    page: {
      url: page.url || "",
      title: page.title || "",
      description: page.description || "",
      siteName: page.siteName || "",
      price: page.price ?? null,
      jsonLdTypes: page.jsonLdTypes || [],
      keywords: page.keywords || [],
      vertical: page.vertical || "none",
      text: page.text || "",
    },
    images,
    historyImages,
    history: historyEnabled
      ? history.map((h) => ({
          url: h.url,
          title: h.title,
          vertical: h.vertical,
          keywords: h.keywords || [],
          price: h.price || null,
          imageUrl: h.imageUrl || null,
          ts: h.ts,
        }))
      : [],
    historyEnabled,
  };
}

// ---------- messages ----------
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || typeof msg.type !== "string") return;

  if (msg.type === "omni:page") {
    const tabId = sender.tab && sender.tab.id;
    if (tabId == null || !msg.page) return;
    (async () => {
      // Ignore reports from sub-frames; only the top document describes the page.
      if (sender.frameId && sender.frameId !== 0) return;
      await setTabContext(tabId, msg.page);
      updateBadge(tabId, msg.page);
      await recordHistory(msg.page);
      // Let an open side panel refresh its chip. No listener -> rejected promise; ignore.
      chrome.runtime
        .sendMessage({ type: "omni:pageUpdated", tabId, page: pageSummary(msg.page) })
        .catch(() => {});
    })();
    return; // no response
  }

  if (msg.type === "omni:getContext") {
    (async () => {
      const id = await resolveTabId(msg.tabId);
      if (id == null) return sendResponse({ ok: false, page: null });
      let page = await getTabContext(id);
      if (!page || msg.refresh) page = (await extractFromTab(id)) || page || (await fallbackPageFromTab(id));
      if (page) updateBadge(id, page);
      sendResponse({ ok: !!page, tabId: id, page: page ? pageSummary(page) : null });
    })().catch((e) => sendResponse({ ok: false, error: String(e && e.message || e) }));
    return true; // async sendResponse
  }

  if (msg.type === "omni:collect") {
    collect(msg.tabId)
      .then((payload) => sendResponse({ ok: true, payload }))
      .catch((e) => sendResponse({ ok: false, error: String(e && e.message || e) }));
    return true; // async sendResponse
  }
});

function pageSummary(page) {
  // Small summary for UI messages (no text blob).
  const { text, ...rest } = page;
  return rest;
}
