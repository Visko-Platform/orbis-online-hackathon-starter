const { chromium } = require("playwright"); const fs = require("fs");
const B = process.env.BASE_URL || "http://localhost:3000";
const PW = process.env.SITE_PASSWORD || "";
const du = (f) => "data:image/jpeg;base64," + fs.readFileSync(__dirname + "/../../public/assets/" + f).toString("base64");
const t0 = Date.now(); const log = (s) => console.log(((Date.now() - t0) / 1000).toFixed(1).padStart(6) + "s " + s);
const J = B + "/shop/p/glacier-jacket?story=powder", R = B + "/shop/stay/powder-peak?story=powder", S = B + "/shop/cars/trailhead-suv?story=powder";
(async () => {
  const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  const errs = []; page.on("pageerror", (e) => errs.push(e.message));
  const labels = async () => (await page.$$eval(".ctl", (b) => b.map((x) => x.textContent.trim()))).join(" | ");
  const title = async () => (await page.textContent(".ctl-title").catch(() => "")).split("·")[0].trim();
  const hud = async () => (await page.textContent(".hud").catch(() => "")).replace(/\s+/g, " ");
  const shot = (n) => page.locator(".player").first().screenshot({ path: `ctx/${n}.png` }).catch(() => {});
  const send = (c) => page.evaluate((x) => window.postMessage(x, "*"), { type: "omni:context", version: 1, historyEnabled: true, ...c });
  try {
    if (PW) { await page.goto(B + "/login"); await page.fill('input[type="password"]', PW); await page.click("button.primary"); await page.waitForURL(B + "/"); }
    await page.goto(B + "/omni?embed=1"); await page.waitForFunction(() => !!localStorage.getItem("omni.userPhoto"), null, { timeout: 15000 });
    await send({ page: { url: J, title: "Glacier Teal Insulated Snowboard Jacket | Summit Supply Co.", vertical: "apparel", jsonLdTypes: ["Product"] }, images: [{ dataUrl: du("jacket-glacier.jpg") }], history: [], historyImages: [] });
    await page.waitForSelector(".player-still", { timeout: 60000 });
    await page.click("button.go-live"); await page.waitForSelector(".live-badge", { timeout: 300000 }); log("LIVE (jacket hero)");
    await page.waitForFunction(() => (document.querySelector(".ctl-title")?.textContent || "").includes("✨"), null, { timeout: 15000 }).catch(() => {});
    log(`controls: [${await title()}] ${await labels()}`);
    await page.waitForTimeout(3000); await page.keyboard.press("w"); log("pressed ↑");
    await page.waitForTimeout(4500); log("HUD: " + (await hud())); await shot("1-up");
    await page.keyboard.press(" "); log("pressed Space");
    await page.waitForTimeout(4500); log("HUD: " + (await hud())); await shot("2-action");
    // wait for the auto-cut to the next shot (20 s after last input) -> controls should change
    const before = await labels();
    await page.waitForFunction((b) => { const l = [...document.querySelectorAll(".ctl")].map((x) => x.textContent.trim()).join(" | "); return l !== b && (document.querySelector(".ctl-title")?.textContent || "").includes("✨"); }, before, { timeout: 40000 }).catch(() => log("controls did not change within 40s"));
    log(`after auto-cut controls: [${await title()}] ${await labels()}`);
    await page.waitForTimeout(3000); await shot("3-next-shot");
    // browse to SUV (journey)
    await send({ page: { url: S, title: "Northline Trailhead AWD SUV | Northline Motors", vertical: "auto", jsonLdTypes: ["Car"] }, images: [{ dataUrl: du("car-suv.jpg") }],
      history: [{ url: R, title: "Powder Peak", vertical: "travel", ts: 2 }, { url: J, title: "Glacier", vertical: "apparel", ts: 1 }],
      historyImages: [{ dataUrl: du("jacket-glacier.jpg"), url: J, title: "jacket", vertical: "apparel" }, { dataUrl: du("resort-powder-peak.jpg"), url: R, title: "resort", vertical: "travel" }] });
    log("→ browsed to SUV");
    await page.waitForFunction(() => (document.querySelector(".omni-banner")?.textContent || "").includes("Journey"), null, { timeout: 30000 });
    await page.waitForTimeout(9000);
    log(`SUV controls: [${await title()}] ${await labels()}`);
    await page.keyboard.press("w"); await page.waitForTimeout(5000); log("HUD: " + (await hud())); await shot("4-suv-up");
  } catch (e) { log("ERROR " + e.message.split("\n")[0]); await shot("error"); }
  finally {
    try { await page.locator("button", { hasText: "Disconnect" }).first().click(); await page.waitForTimeout(2500); log("disconnected"); } catch {}
    console.log("page errors:", errs.length ? errs.slice(0, 3) : "none"); await browser.close();
  }
})();
