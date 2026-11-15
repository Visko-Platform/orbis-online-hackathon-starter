// UI smoke test (Playwright): BASE_URL=... SITE_PASSWORD=... node scripts/e2e/ui_smoke.cjs <outdir>
const { chromium } = require("playwright");
const fs = require("fs");
const OUT = process.argv[2]; const B = process.env.BASE_URL || "http://localhost:3000";
const PW = process.env.SITE_PASSWORD || "";
const A = __dirname + "/../../public/assets/";
const du = (f) => "data:image/jpeg;base64," + fs.readFileSync(A + f).toString("base64");
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 200)); });
  const t0 = Date.now(); const log = (s) => console.log(((Date.now() - t0) / 1000).toFixed(1) + "s " + s);

  await page.goto(B + "/shop");
  log("at " + page.url());
  if (PW) { await page.fill('input[type="password"]', PW); await page.click("button.primary");
    await page.waitForURL(B + "/shop"); log("logged in"); }
  await page.screenshot({ path: OUT + "/01-shop.png" });
  await page.goto(B + "/shop/p/tidal-wetsuit?story=surf"); await page.screenshot({ path: OUT + "/02-wetsuit.png" });

  // Lifecast embed: preload the shopper photo + wardrobe, then send the extension context (City Move, final stop)
  await page.goto(B + "/omni?embed=1");
  await page.evaluate(([photo, trench]) => {
    localStorage.setItem("omni.userPhoto", JSON.stringify(photo));
    localStorage.setItem("omni.wardrobe", JSON.stringify([{ dataUrl: trench, label: "Camel Wool Belted Trench Coat", description: "long camel wool trench coat with a belt", ts: 1 }]));
  }, [du("street-model.jpg"), du("trench-coat.jpg")]);
  await page.reload(); await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + "/03-omni-empty.png" });
  const context = {
    type: "omni:context", version: 1,
    page: { url: B + "/shop/cars/volt-gt", title: "Northline Volt GT Coupe | Northline Motors", siteName: "Northline Motors", price: "52990 USD", jsonLdTypes: ["Car", "Offer"], keywords: ["ev"], vertical: "auto", text: "Dark blue dual-motor electric sports coupe with a glass roof." },
    images: [{ dataUrl: du("car-coupe.jpg") }],
    history: [
      { url: B + "/shop/cars", title: "New SUVs, Trucks & EVs | Northline Motors", vertical: "auto", keywords: ["suv"], ts: 3 },
      { url: B + "/shop/homes/downtown-loft", title: "Downtown Brick Loft · 2 bd · 2 ba · 1,480 sqft | Harbor & Main Realty", vertical: "real_estate", keywords: ["for sale"], price: "895000 USD", ts: 2 },
      { url: B + "/shop/p/camel-trench", title: "Camel Wool Belted Trench Coat | Fold & Field", vertical: "apparel", keywords: ["coat"], price: "420.00 USD", ts: 1 },
    ],
    historyImages: [
      { dataUrl: du("trench-coat.jpg"), title: "Camel Wool Belted Trench Coat | Fold & Field", url: B + "/shop/p/camel-trench", vertical: "apparel" },
      { dataUrl: du("home-downtown-loft.jpg"), title: "Downtown Brick Loft | Harbor & Main Realty", url: B + "/shop/homes/downtown-loft", vertical: "real_estate" },
    ],
    historyEnabled: true,
  };
  await page.evaluate((c) => window.postMessage(c, "*"), context);
  log("context sent");
  await page.waitForSelector(".omni-banner", { timeout: 60000 }); log("plan ready");
  await page.waitForSelector(".prerender-done", { timeout: 60000 }).catch(() => log("no prerender-done badge"));
  await page.waitForFunction(() => document.querySelectorAll(".shot-ready img, .shot-grid .shot img").length >= 5, null, { timeout: 30000 }).catch(() => log("shots not all visible"));
  log("prerender badge: " + (await page.textContent(".prerender-badge").catch(() => "none")));
  log("shot images visible: " + (await page.$$eval(".shot-grid .shot img", (els) => els.length)));
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + "/04-studio.png", fullPage: true });
  await page.click("button.game-launch"); await page.waitForSelector(".ls-root", { timeout: 5000 }); log("game mode on");
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + "/05-game.png" });
  await page.keyboard.press("Escape"); await page.waitForTimeout(300);
  log("esc -> game visible: " + (await page.$(".ls-root") !== null));
  await page.click("button.game-launch");
  await page.setViewportSize({ width: 420, height: 860 }); await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + "/06-game-narrow.png" });
  console.log("ERRORS:\n" + (errors.join("\n") || "(none)"));
  await browser.close();
})().catch((e) => { console.error("FAILED", e); process.exit(1); });
