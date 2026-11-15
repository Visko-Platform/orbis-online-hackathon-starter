const { chromium } = require("playwright"); const fs = require("fs");
const B = process.env.BASE_URL || "http://localhost:3000";
const PW = process.env.SITE_PASSWORD || "";
const img = "data:image/jpeg;base64," + fs.readFileSync(__dirname + "/../../public/assets/jacket-glacier.jpg").toString("base64");
const t0 = Date.now(); const log = (s) => console.log(((Date.now() - t0) / 1000).toFixed(1).padStart(6) + "s " + s);
(async () => {
  const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  if (PW) { await page.goto(B + "/login"); await page.fill('input[type="password"]', PW); await page.click("button.primary"); await page.waitForURL(B + "/"); }
  await page.goto(B + "/omni?embed=1"); await page.waitForFunction(() => !!localStorage.getItem("omni.userPhoto"), null, { timeout: 15000 });
  await page.evaluate((c) => window.postMessage(c, "*"), { type: "omni:context", version: 1, historyEnabled: true, page: { url: B + "/shop/p/glacier-jacket?story=powder", title: "Glacier Teal Insulated Snowboard Jacket | Summit Supply Co.", siteName: "Summit Supply Co.", price: "289.95 USD", jsonLdTypes: ["Product"], keywords: [], vertical: "apparel", text: "" }, images: [{ dataUrl: img }], history: [], historyImages: [] });
  await page.waitForSelector(".player-still", { timeout: 60000 }); log("controller visible: " + (await page.$(".controller") !== null));
  await page.click("button.go-live"); await page.waitForSelector(".live-badge", { timeout: 5 * 60000 }); log("LIVE");
  await page.waitForTimeout(5000);
  await page.keyboard.press("d"); log("pressed D (right)");
  await page.waitForTimeout(4500); log("HUD: " + (await page.textContent(".hud").catch(() => "")));
  await page.locator(".player").first().screenshot({ path: "rt/1-after-D.png" });
  await page.keyboard.press(" "); log("pressed Space (jump)");
  await page.waitForTimeout(4500); log("HUD: " + (await page.textContent(".hud").catch(() => "")));
  await page.locator(".player").first().screenshot({ path: "rt/2-after-space.png" });
  await page.evaluate(() => window.postMessage({ type: "omni:interact", prompt: "The person's jacket changes color to sunset orange.", label: "Sunset jacket" }, "*")); log("page swatch: Sunset jacket");
  await page.waitForTimeout(800); log("page-input bar: " + (await page.textContent(".page-input").catch(() => "none")));
  await page.waitForTimeout(5000); log("HUD: " + (await page.textContent(".hud").catch(() => "")));
  await page.locator(".player").first().screenshot({ path: "rt/3-after-swatch.png" });
  await page.waitForTimeout(6000); await page.locator(".player").first().screenshot({ path: "rt/4-later.png" });
  try { await page.locator("button", { hasText: "Disconnect" }).first().click(); await page.waitForTimeout(2500); } catch {}
  await browser.close(); log("done");
})().catch((e) => { console.log("FAILED", e.message.split("\n")[0]); process.exit(1); });
