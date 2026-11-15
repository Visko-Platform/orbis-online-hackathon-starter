const { chromium } = require("playwright"); const fs = require("fs");
const B = process.env.BASE_URL || "http://localhost:3000";
const PW = process.env.SITE_PASSWORD || "";
const img = "data:image/jpeg;base64," + fs.readFileSync(__dirname + "/../../public/assets/jacket-glacier.jpg").toString("base64");
(async () => {
  const browser = await chromium.launch(); const page = await (await browser.newContext()).newPage();
  const errs = []; page.on("pageerror", (e) => errs.push(e.message));
  if (PW) { await page.goto(B + "/login"); await page.fill('input[type="password"]', PW); await page.click("button.primary"); await page.waitForURL(B + "/"); }
  await page.goto(B + "/omni?embed=1"); await page.evaluate(() => localStorage.removeItem("omni.wardrobe")); await page.reload();
  await page.waitForFunction(() => !!localStorage.getItem("omni.userPhoto"), null, { timeout: 15000 });
  await page.evaluate((c) => window.postMessage(c, "*"), { type: "omni:context", version: 1, historyEnabled: true, page: { url: B + "/shop/p/glacier-jacket?story=powder", title: "Glacier Teal Insulated Snowboard Jacket | Summit Supply Co.", vertical: "apparel", jsonLdTypes: ["Product"] }, images: [{ dataUrl: img }], history: [], historyImages: [] });
  await page.waitForSelector(".omni-banner", { timeout: 60000 }); await page.waitForTimeout(1500);
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem("omni.wardrobe") || "[]").map((w) => w.label));
  console.log("before reset: studio=", !!(await page.$(".omni-banner")), "wardrobe=", JSON.stringify(before));
  await page.evaluate(() => window.postMessage({ type: "omni:reset" }, "*")); await page.waitForTimeout(800);
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("omni.wardrobe") || "[]").length);
  console.log("after reset: studio=", !!(await page.$(".omni-banner")), "waiting screen=", !!(await page.$(".omni-waiting")), "wardrobe items=", after);
  console.log("errors:", errs.length ? errs : "none"); await browser.close();
})();
