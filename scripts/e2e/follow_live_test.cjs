// Live end-to-end test of Lifecast follow mode against real Orbis. Always disconnects.
const { chromium } = require("playwright"); const fs = require("fs");
const B = process.env.BASE_URL || "http://localhost:3000"; const OUT = process.argv[2];
const PW = process.env.SITE_PASSWORD || "";
const du = (f) => "data:image/jpeg;base64," + fs.readFileSync(__dirname + "/../../public/assets/" + f).toString("base64");
const t0 = Date.now(); const log = (s) => console.log(((Date.now() - t0) / 1000).toFixed(1).padStart(6) + "s " + s);
const P = (path, title, vertical, types, price, text) => ({ url: B + path, title, siteName: title.split(" | ").pop(), price, jsonLdTypes: types, keywords: [], vertical, text });
const JACKET = P("/shop/p/glacier-jacket?story=powder", "Glacier Teal Insulated Snowboard Jacket | Summit Supply Co.", "apparel", ["Product"], "289.95 USD", "Insulated snowboard jacket in glacier teal.");
const RESORT = P("/shop/stay/powder-peak?story=powder", "Powder Peak Resort | Powder Peak Resort", "travel", ["SkiResort"], null, "Red base-to-summit gondola, timber base village, 18 in fresh powder.");
const SUV = P("/shop/cars/trailhead-suv?story=powder", "Northline Trailhead AWD SUV | Northline Motors", "auto", ["Car", "Offer"], "38990 USD", "AWD SUV with roof rails and snow mode.");
const H = (p, ts) => ({ url: p.url, title: p.title, vertical: p.vertical, keywords: [], price: p.price, ts });
(async () => {
  const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 860 } })).newPage();
  const errs = []; page.on("pageerror", (e) => errs.push(e.message));
  const shot = async (n) => { try { await page.locator(".player").first().screenshot({ path: `${OUT}/${n}.png` }); log("  📸 " + n); } catch (e) { log("  shot failed " + n); } };
  const send = (ctx) => page.evaluate((c) => window.postMessage({ type: "omni:context", version: 1, historyEnabled: true, ...c }, "*"), ctx);
  const deadline = Date.now() + 11 * 60_000;
  try {
    if (PW) { await page.goto(B + "/login"); await page.fill('input[type="password"]', PW); await page.click("button.primary"); await page.waitForURL(B + "/"); }
    await page.goto(B + "/omni?embed=1"); await page.evaluate(() => localStorage.removeItem("omni.wardrobe")); await page.reload();
    await page.waitForFunction(() => !!localStorage.getItem("omni.userPhoto"), null, { timeout: 15000 });
    await send({ page: JACKET, images: [{ dataUrl: du("jacket-glacier.jpg") }], history: [], historyImages: [] });
    await page.waitForSelector(".omni-banner"); await page.waitForSelector(".player-still", { timeout: 60000 }); log("jacket plan + prerendered hero ready");
    await page.click("button.go-live"); log("Go live clicked (connecting)…");
    await page.waitForSelector(".live-badge", { timeout: 8 * 60_000 }); log("LIVE: generation started");
    const takes = async () => page.$$eval(".log li .log-kind", (els) => els.map((e) => e.textContent).filter((t) => /take|cut/.test(t || "")).reverse());
    await page.waitForTimeout(6000); await shot("1-jacket-hero");
    await page.waitForTimeout(6000); await shot("2-jacket-autocut");
    log("takes so far: " + JSON.stringify(await takes()));
    log("→ browse to resort");
    const tNav = Date.now();
    await send({ page: RESORT, images: [{ dataUrl: du("resort-powder-peak.jpg") }], history: [H(JACKET, 1)], historyImages: [{ dataUrl: du("jacket-glacier.jpg"), title: JACKET.title, url: JACKET.url, vertical: "apparel" }] });
    await page.waitForFunction(() => [...document.querySelectorAll(".log li .log-kind")].some((e) => /Powder Peak/i.test(e.textContent || "")), null, { timeout: 90000 });
    log(`cut to resort issued ${((Date.now() - tNav) / 1000).toFixed(1)}s after navigation`);
    await page.waitForTimeout(6000); await shot("3-resort");
    log("→ browse to SUV");
    const tNav2 = Date.now();
    await send({ page: SUV, images: [{ dataUrl: du("car-suv.jpg") }], history: [H(RESORT, 2), H(JACKET, 1)],
      historyImages: [{ dataUrl: du("jacket-glacier.jpg"), title: JACKET.title, url: JACKET.url, vertical: "apparel" }, { dataUrl: du("resort-powder-peak.jpg"), title: RESORT.title, url: RESORT.url, vertical: "travel" }] });
    await page.waitForFunction(() => [...document.querySelectorAll(".log li .log-kind")].some((e) => /Trailhead/i.test(e.textContent || "")), null, { timeout: 90000 });
    log(`cut to SUV issued ${((Date.now() - tNav2) / 1000).toFixed(1)}s after navigation`);
    for (let i = 0; i < 6; i++) { await page.waitForTimeout(7000); await shot(`4-journey-${i}`); }
    log("takes: " + JSON.stringify(await takes()));
    log("paused at end: " + (await page.$(".live-badge") === null ? "yes (no LIVE badge)" : "still live"));
    log("latency readouts seen: " + (await page.textContent(".hud .latency").catch(() => "-")));
  } catch (e) { log("ERROR " + e.message.split("\n")[0]); await shot("error"); }
  finally {
    try { const b = page.locator("button", { hasText: "Disconnect" }); if (await b.count()) { await b.first().click(); log("disconnected"); await page.waitForTimeout(2000); } } catch {}
    console.log("page errors:", errs.length ? errs.slice(0, 5) : "none");
    await browser.close();
  }
})();
