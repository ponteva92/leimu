/* Visual regression checks for the requested collection and envelope revision.
   External services are blocked; this script never submits an order. */
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
let pw;
try { pw = require("playwright"); } catch {
  pw = require(path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"));
}
const origin = process.env.REDESIGN_ORIGIN || "http://127.0.0.1:3001";
const output = path.resolve("artifacts/redesign/collection");
fs.mkdirSync(output, { recursive: true });
const report = { checks: [], errors: [], measurements: [], captures: [] };
function check(ok, label) { (ok ? report.checks : report.errors).push(label); }
const profiles = [
  { name: "desktop1440", width: 1440, height: 900 },
  { name: "mobile390", width: 390, height: 844, mobile: true },
  { name: "mobile320", width: 320, height: 568, mobile: true },
  { name: "tablet768", width: 768, height: 1024, mobile: true },
  { name: "landscape568", width: 568, height: 320, mobile: true },
  { name: "english390", width: 390, height: 844, mobile: true, english: true },
  { name: "reduced390", width: 390, height: 844, mobile: true, reduce: true },
];
async function snap(page, name) {
  await page.screenshot({ path: path.join(output, `${name}.png`), scale: "css" });
  report.captures.push(`${name}.png`);
}
async function jump(page, selector, offset = 96) {
  await page.evaluate(({ selector, offset }) => {
    const el = document.querySelector(selector);
    window.scrollTo({ top: scrollY + el.getBoundingClientRect().top - offset, behavior: "instant" });
  }, { selector, offset });
  await page.waitForTimeout(800);
}
async function columns(page, name, gridSelector, imageSelector, copySelector) {
  const pair = await page.evaluate(({ gridSelector, imageSelector, copySelector }) => {
    const grid = document.querySelector(gridSelector);
    const image = grid.querySelector(imageSelector).getBoundingClientRect();
    const copy = grid.querySelector(copySelector).getBoundingClientRect();
    return { image: image.toJSON(), copy: copy.toJSON() };
  }, { gridSelector, imageSelector, copySelector });
  report.measurements.push({ name, ...pair });
  check(Math.abs(pair.image.top - pair.copy.top) <= 2 && Math.abs(pair.image.bottom - pair.copy.bottom) <= 2, `${name}: photograph and text columns share top and foot`);
}
(async () => {
  const cached = pw.chromium.executablePath();
  const browser = await pw.chromium.launch({ headless: true, executablePath: fs.existsSync(cached) ? cached : "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  try {
    for (const profile of profiles) {
      const context = await browser.newContext({ viewport: { width: profile.width, height: profile.height }, deviceScaleFactor: profile.mobile ? 2 : 1, isMobile: !!profile.mobile, hasTouch: !!profile.mobile, reducedMotion: profile.reduce ? "reduce" : "no-preference" });
      await context.route("**/*", route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
      const page = await context.newPage();
      page.on("pageerror", e => report.errors.push(`${profile.name}: ${e.message}`));
      try {
        for (const route of ["/", "/tuotteet"]) {
          const prefix = `${profile.name}-${route === "/" ? "home" : "products"}`;
          await page.goto(origin + route, { waitUntil: "networkidle" });
          if (profile.english && await page.locator("html").getAttribute("lang") !== "en") await page.getByRole("button", { name: /Vaihda kieli/ }).click();
          await page.waitForTimeout(1000);
          await snap(page, `${prefix}-opening`);
          if (route === "/") {
            check(await page.locator("[data-order-entry]").getByRole("link", { name: profile.english ? "Design yours" : "Suunnittele oma", exact: true }).getAttribute("href") === "/tuotteet", `${prefix}: original hero action restored`);
            check(await page.locator("[data-order-entry]").getByRole("button", { name: profile.english ? "Contact us" : "Ota yhteyttä", exact: true }).count() === 1, `${prefix}: original contact action restored`);
          } else if (!profile.mobile) {
            await columns(page, "product opening", ".product-still-layout", ".product-still-visual", ".product-still-copy");
          }
          await jump(page, "#tuoksut");
          const cards = page.locator(".scent-card");
          check(await cards.count() === 5, `${prefix}: five scents retained`);
          const bounds = await cards.evaluateAll(els => els.map(el => {
            const r = el.getBoundingClientRect();
            const caption = el.querySelector(".scent-caption").getBoundingClientRect();
            const inside = [...el.querySelectorAll(".scent-name,.scent-price,.scent-notes,.scent-action")].every(part => {
              const p = part.getBoundingClientRect();
              return p.left >= caption.left - 1 && p.right <= caption.right + 1 && p.top >= caption.top - 1 && p.bottom <= caption.bottom + 1;
            });
            return { name: el.getAttribute("aria-label"), height: r.height, width: r.width, inside };
          }));
          report.measurements.push({ name: `${prefix}-cards`, bounds });
          check(bounds.every(b => b.inside), `${prefix}: names, prices, notes and actions fit their reading surfaces`);
          check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${prefix}: no horizontal overflow`);
          if (!profile.mobile) check(await page.locator(".scent-grid").evaluate(el => el.offsetHeight <= 440), `${prefix}: desktop collection stays compact`);
          await snap(page, `${prefix}-collection`);
          await cards.last().scrollIntoViewIfNeeded();
          await page.waitForTimeout(450);
          await cards.last().focus();
          await page.keyboard.press("Enter");
          await page.getByRole("dialog").waitFor();
          check(await page.getByRole("dialog").isVisible(), `${prefix}: keyboard opens scent details`);
          await page.keyboard.press("Escape");
          await page.getByRole("dialog").waitFor({ state: "hidden" });
          check(await cards.last().evaluate(el => document.activeElement === el), `${prefix}: Escape restores card focus`);
          if (route === "/") {
            if (!profile.reduce) {
              await page.evaluate(() => {
                const track = document.querySelector(".seal-track");
                window.scrollTo({ top: scrollY + track.getBoundingClientRect().top + (track.offsetHeight - innerHeight) * .74, behavior: "instant" });
              });
            } else await jump(page, "#sinetti");
          } else await jump(page, ".seal-flow");
          await page.waitForTimeout(800);
          await snap(page, `${prefix}-message`);
          const seal = await page.locator(route === "/" && !profile.reduce ? ".seal-stage" : ".seal-flow").evaluate(el => {
            const image = el.querySelector('img[alt*="kirjekuori"],img[alt*="envelope"]');
            return { image: image.getBoundingClientRect().toJSON(), text: el.textContent, height: innerHeight };
          });
          report.measurements.push({ name: `${prefix}-envelope`, width: seal.image.width, height: seal.image.height });
          check(seal.text.includes(profile.english ? "In your own words." : "Sinun sanoillasi."), `${prefix}: corrected message copy rendered`);
          check(seal.image.width >= (profile.width >= 768 ? 300 : profile.width * (profile.width > profile.height ? .27 : .6)), `${prefix}: envelope has a substantial visual size`);
          if (route === "/" && !profile.reduce) check(await page.locator(".order-shortcut").count() === 0, `${prefix}: order dock yields to the ceremony's own action`);
          if (route === "/tuotteet" && !profile.mobile) {
            await columns(page, "sealed message", ".seal-flow", ".seal-flow-visual", ":scope > :last-child");
            await jump(page, ".product-gift-layout");
            await columns(page, "gift photography", ".product-gift-layout", ".product-gift-visual", ":scope > :first-child");
            await snap(page, `${prefix}-gift-columns`);
            await jump(page, ".product-craft-track", -100);
            await columns(page, "craft film", ".product-craft-layout", ".product-craft-well", ".product-craft-copy");
            await snap(page, `${prefix}-craft-columns`);
          }
        }
      } catch (error) { report.errors.push(`${profile.name}: ${error.stack || error}`); }
      await context.close();
      console.log(`${profile.name}: checked`);
    }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(output, "report.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ checks: report.checks.length, captures: report.captures.length, errors: report.errors }, null, 2));
    if (report.errors.length) process.exitCode = 1;
  }
})();
