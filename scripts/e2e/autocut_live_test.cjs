const { chromium } = require("playwright"); const fs = require("fs");
const B = process.env.BASE_URL || "http://localhost:3000";
const PW = process.env.SITE_PASSWORD || "";
const img = "data:image/jpeg;base64," + fs.readFileSync(__dirname + "/../../public/assets/jacket-glacier.jpg").toString("base64");
(async () => {
  const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 860 } })).newPage();
  if (PW) { await page.goto(B + "/login"); await page.fill('input[type="password"]', PW); await page.click("button.primary"); await page.waitForURL(B + "/"); }
  await page.goto(B + "/omni?embed=1"); await page.waitForFunction(() => !!localStorage.getItem("omni.userPhoto"), null, { timeout: 15000 });
  const ctx = { type: "omni:context", version: 1, historyEnabled: true, page: { url: B + "/shop/p/glacier-jacket?story=powder", title: "Glacier Teal Insulated Snowboard Jacket | Summit Supply Co.", siteName: "Summit Supply Co.", price: "289.95 USD", jsonLdTypes: ["Product"], keywords: [], vertical: "apparel", text: "" }, images: [{ dataUrl: img }], history: [], historyImages: [] };
  await page.evaluate((c) => window.postMessage(c, "*"), ctx);
  await page.waitForSelector(".player-still", { timeout: 60000 });
  await page.click("button.go-live"); await page.waitForSelector(".live-badge", { timeout: 5 * 60000 });
  await page.waitForTimeout(48000);
  const client = await page.evaluate(() => document.cookie && "");
  try { await page.locator("button", { hasText: "Disconnect" }).first().click(); await page.waitForTimeout(3000); } catch {}
  await browser.close(); console.log("done");
})().catch((e) => { console.log("FAILED", e.message.split("\n")[0]); process.exit(1); });
