// Try It On: Omni - side panel.
// Hosts the web app in an iframe and hands it the page context via postMessage.
"use strict";

const DEFAULT_BASE = "http://localhost:3000"; // change with ⚙ in the panel (your deployed Lifecast URL)
const ICONS = { apparel: "👕", real_estate: "🏠", auto: "🚗", travel: "🏔", none: "❔" };
const NO_IMAGES_MSG = "No product images found. You can still upload photos in the app.";

const $ = (id) => document.getElementById(id);
const els = {
  chip: $("chip"),
  chipIcon: $("chipIcon"),
  chipText: $("chipText"),
  tryBtn: $("tryBtn"),
  follow: $("follow"),
  error: $("error"),
  status: $("status"),
  iframe: $("app"),
  openFull: $("openFull"),
  settings: $("settings"),
  settingsForm: $("settingsForm"),
  baseInput: $("baseInput"),
  baseReset: $("baseReset"),
  historyEnabled: $("historyEnabled"),
  clearHistory: $("clearHistory"),
  historyList: $("historyList"),
  histCount: $("histCount"),
};

let BASE = DEFAULT_BASE;
let BASE_ORIGIN = new URL(DEFAULT_BASE).origin;
let myWindowId = null;
let activeTabId = null;
let currentPage = null;

let iframeReady = false;
let pendingPayload = null; // collected before the app said omni:ready
let autoSendArmed = false; // panel opened on a detected page -> send once on first ready
let autoSent = false;
let busy = false;

// ---------- base URL ----------
function normalizeBase(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    const u = new URL(raw.trim());
    if (!/^https?:$/.test(u.protocol)) return null;
    return (u.origin + u.pathname).replace(/\/+$/, "");
  } catch (_) {
    return null;
  }
}

async function loadBase() {
  const { omniBase } = await chrome.storage.local.get("omniBase");
  BASE = normalizeBase(omniBase) || DEFAULT_BASE;
  BASE_ORIGIN = new URL(BASE).origin;
}

function loadIframe() {
  iframeReady = false;
  els.iframe.src = BASE + "/omni?embed=1";
}

// ---------- UI helpers ----------
function showError(text) {
  els.error.textContent = text || "";
  els.error.hidden = !text;
}

function showStatus(text) {
  els.status.textContent = text || "";
  els.status.hidden = !text;
}

function setBusy(on) {
  busy = on;
  els.tryBtn.disabled = on;
  els.tryBtn.textContent = on ? "Reading page…" : "Try this page";
}

function truncate(s, n) {
  s = (s || "").trim();
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function setChip(page) {
  currentPage = page || null;
  const vertical = (page && page.vertical) || "none";
  els.chipIcon.textContent = ICONS[vertical] || ICONS.none;
  if (!page) {
    els.chipText.textContent = "No page detected";
    els.chip.title = "";
  } else {
    els.chipText.textContent = truncate(page.title || page.url, 70) || "Untitled page";
    els.chip.title = [page.title, page.siteName, page.price].filter(Boolean).join(" · ");
  }
  els.chip.classList.toggle("detected", vertical !== "none");
}

function relTime(ts) {
  const s = Math.max(0, Math.round((Date.now() - (ts || 0)) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

// ---------- history UI ----------
async function renderHistory() {
  const got = await chrome.storage.local.get(["omniHistory", "historyEnabled"]);
  const enabled = got.historyEnabled !== false;
  const hist = Array.isArray(got.omniHistory) ? got.omniHistory : [];
  els.historyEnabled.checked = enabled;
  els.historyList.classList.toggle("disabled", !enabled);
  els.histCount.textContent = hist.length ? `(${hist.length})` : "";
  els.historyList.replaceChildren();

  if (!hist.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = enabled
      ? "Nothing yet. Browse a jacket, a house, or a car."
      : "History is off.";
    els.historyList.append(li);
    return;
  }

  for (const h of hist) {
    const li = document.createElement("li");

    if (h.imageUrl && /^https?:/i.test(h.imageUrl)) {
      const img = document.createElement("img");
      img.className = "h-thumb";
      img.alt = "";
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      img.addEventListener("error", () => img.remove(), { once: true });
      img.src = h.imageUrl;
      li.append(img);
    }

    const icon = document.createElement("span");
    icon.className = "h-icon";
    icon.textContent = ICONS[h.vertical] || ICONS.none;

    const link = document.createElement("a");
    link.textContent = h.title || h.url;
    link.title = h.url;
    if (/^https?:/i.test(h.url || "")) {
      link.href = h.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }

    const time = document.createElement("span");
    time.className = "h-time";
    time.textContent = relTime(h.ts);

    li.append(icon, link, time);
    els.historyList.append(li);
  }
}

// ---------- active tab / chip ----------
async function getActiveTabId() {
  const query = myWindowId != null ? { active: true, windowId: myWindowId } : { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(query);
  return tab ? tab.id : null;
}

async function refreshChip({ refresh = false } = {}) {
  activeTabId = await getActiveTabId();
  if (activeTabId == null) {
    setChip(null);
    return null;
  }
  try {
    const res = await chrome.runtime.sendMessage({ type: "omni:getContext", tabId: activeTabId, refresh });
    const page = res && res.page;
    setChip(page);
    maybeFollow(page);
    return page;
  } catch (_) {
    setChip(null);
    return null;
  }
}

let refreshTimer = null;
function scheduleRefresh(opts) {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => refreshChip(opts), 300);
}

// ---------- talking to the web app ----------
function postToApp(payload) {
  const win = els.iframe.contentWindow;
  if (!win) return false;
  win.postMessage(payload, BASE_ORIGIN);
  return true;
}

function deliver(payload) {
  if (iframeReady && postToApp(payload)) {
    pendingPayload = null;
    showStatus("Sent to Lifecast.");
  } else {
    pendingPayload = payload;
    showStatus("Waiting for the app to load…");
  }
}

// ---------- follow mode: auto-send each new shopping page (live steering in the app) ----------
let followEnabled = true;
let lastSentUrl = null;
let followTimer = null;
const pageKey = (u) => String(u || "").split("#")[0];
function maybeFollow(page) {
  if (!followEnabled || !page || !page.vertical || page.vertical === "none") return;
  if (pageKey(page.url) === lastSentUrl) return;
  clearTimeout(followTimer);
  // let the page settle (and skip pages the user is just passing through)
  followTimer = setTimeout(() => {
    if (pageKey(page.url) === lastSentUrl || busy) return;
    showStatus("Following: steering to this page…");
    tryThisPage();
  }, 2500);
}

async function tryThisPage() {
  if (busy) return;
  setBusy(true);
  showError("");
  try {
    activeTabId = await getActiveTabId();
    const res = await chrome.runtime.sendMessage({ type: "omni:collect", tabId: activeTabId });
    if (!res || !res.ok || !res.payload) {
      throw new Error((res && res.error) || "Could not read this page.");
    }
    const payload = res.payload;
    lastSentUrl = pageKey(payload.page && payload.page.url);
    setChip(payload.page);
    if (!payload.images || payload.images.length === 0) showError(NO_IMAGES_MSG);
    deliver(payload);
  } catch (e) {
    showError(String((e && e.message) || e));
  } finally {
    setBusy(false);
  }
}

function maybeAutoSend() {
  if (autoSendArmed && !autoSent && iframeReady) {
    autoSent = true;
    tryThisPage();
  }
}

window.addEventListener("message", (event) => {
  if (event.origin !== BASE_ORIGIN) return;
  if (event.source !== els.iframe.contentWindow) return;
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "omni:ready") {
    iframeReady = true;
    if (pendingPayload) {
      deliver(pendingPayload);
    } else {
      maybeAutoSend();
    }
  } else if (data.type === "omni:status") {
    showStatus(typeof data.text === "string" ? truncate(data.text, 200) : "");
  }
});

// ---------- events ----------
els.tryBtn.addEventListener("click", () => {
  autoSent = true; // a manual click supersedes the automatic first send
  tryThisPage();
});

els.openFull.addEventListener("click", (e) => {
  e.preventDefault();
  // The full-screen tab can't read extension storage; context transfer is iframe-only.
  chrome.tabs.create({ url: BASE + "/omni" });
});

els.settings.addEventListener("click", () => {
  const show = els.settingsForm.hidden;
  els.settingsForm.hidden = !show;
  if (show) {
    els.baseInput.value = BASE;
    els.baseInput.focus();
    els.baseInput.select();
  }
});

async function applyBase(raw) {
  if (raw) {
    const norm = normalizeBase(raw);
    if (!norm) {
      showError("Invalid URL. Use something like http://localhost:3000");
      return;
    }
    await chrome.storage.local.set({ omniBase: norm });
  } else {
    await chrome.storage.local.remove("omniBase");
  }
  showError("");
  await loadBase();
  els.settingsForm.hidden = true;
  pendingPayload = null;
  loadIframe();
  showStatus(`App: ${BASE}`);
}

els.settingsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  applyBase(els.baseInput.value.trim());
});
els.baseReset.addEventListener("click", () => applyBase(""));

els.historyEnabled.addEventListener("change", () => {
  chrome.storage.local.set({ historyEnabled: els.historyEnabled.checked });
});

els.clearHistory.addEventListener("click", () => {
  chrome.storage.local.set({ omniHistory: [] });
  // Trends cleared -> reset Lifecast's context too (wardrobe, current scene, plan).
  lastSentUrl = null;
  if (iframeReady) postToApp({ type: "omni:reset" });
  showStatus("Interests cleared: Lifecast context reset.");
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.omniHistory || changes.historyEnabled)) renderHistory();
});

chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
  if (myWindowId != null && windowId !== myWindowId) return;
  activeTabId = tabId;
  showError("");
  scheduleRefresh();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab || !tab.active) return;
  if (myWindowId != null && tab.windowId !== myWindowId) return;
  if (changeInfo.status === "complete" || changeInfo.title || changeInfo.url) {
    scheduleRefresh();
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  // Realtime page input (swatch / paint / weather click on the shopping page) -> steer the live video now.
  if (msg && msg.type === "omni:interact" && msg.prompt) {
    if (iframeReady) postToApp({ type: "omni:interact", prompt: msg.prompt, label: msg.label });
    showStatus(`🛍 ${msg.label || "Page input"} → live`);
    return;
  }
  if (msg && msg.type === "omni:pageUpdated" && msg.tabId === activeTabId) {
    setChip(msg.page);
    maybeFollow(msg.page);
  }
});

// Keep relative times fresh.
setInterval(() => {
  const details = document.getElementById("interests");
  if (details && details.open) renderHistory();
}, 60000);

// ---------- init ----------
els.follow.addEventListener("change", () => {
  followEnabled = els.follow.checked;
  chrome.storage.local.set({ omniFollow: followEnabled });
  if (followEnabled) scheduleRefresh();
});

(async function init() {
  try {
    const { omniFollow } = await chrome.storage.local.get("omniFollow");
    followEnabled = omniFollow !== false;
    els.follow.checked = followEnabled;
  } catch (_) {}
  await loadBase();
  loadIframe();
  try {
    myWindowId = (await chrome.windows.getCurrent()).id;
  } catch (_) {}
  renderHistory();
  const page = await refreshChip();
  if (page && page.vertical && page.vertical !== "none") {
    autoSendArmed = true;
    maybeAutoSend(); // in case omni:ready already arrived
  }
})();
