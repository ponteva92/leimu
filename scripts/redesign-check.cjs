/* Production browser verification. Orders are intercepted locally, never forwarded. */
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const assert = require("node:assert/strict");
let playwright;
try { playwright = require("playwright"); } catch {
  playwright = require(path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"));
}
const origin = process.env.REDESIGN_ORIGIN || "http://127.0.0.1:3001";
const phase = process.env.REDESIGN_PHASE || "after";
const output = path.resolve("artifacts/redesign", phase);
fs.mkdirSync(output, { recursive: true });
const report = { phase, captures: [], checks: [], errors: [] };
const check = (value, description) => { assert.ok(value, description); report.checks.push(description); };

(async () => {
  const cached = playwright.chromium.executablePath();
  const browser = await playwright.chromium.launch({ headless: true, executablePath: fs.existsSync(cached) ? cached : "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  try {
    const profiles = phase === "before" ? [
      { name: "desktop1440", width: 1440, height: 900 }, { name: "mobile390", width: 390, height: 844, mobile: true },
    ] : [
      { name: "desktop1440", width: 1440, height: 900 }, { name: "mobile390", width: 390, height: 844, mobile: true },
      { name: "mobile320", width: 320, height: 568, mobile: true }, { name: "tablet768", width: 768, height: 1024, mobile: true },
      { name: "landscape844", width: 844, height: 390, mobile: true },
      { name: "landscape568", width: 568, height: 320, mobile: true },
      { name: "reduced390", width: 390, height: 844, mobile: true, reduce: true },
      { name: "english390", width: 390, height: 844, mobile: true, english: true },
      { name: "largeText390", width: 390, height: 844, mobile: true, largeText: true },
    ];
    for (const profile of profiles) {
      const context = await browser.newContext({ viewport: { width: profile.width, height: profile.height }, deviceScaleFactor: profile.mobile ? 2 : 1,
        isMobile: !!profile.mobile, hasTouch: !!profile.mobile, reducedMotion: profile.reduce ? "reduce" : "no-preference" });
      await context.route("**/*", (route) => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
      const page = await context.newPage();
      page.on("pageerror", (error) => report.errors.push(`${profile.name}: ${error.message}`));
      page.on("console", (message) => {
        if (message.type() === "warning" && /non-static position|animate opacity from.*undefined/.test(message.text())) report.errors.push(`${profile.name}: ${message.text()}`);
      });
      for (const route of ["/", "/tuotteet", "/tarina"]) {
        await page.goto(origin + route, { waitUntil: "networkidle" });
        if (profile.english && await page.locator("html").getAttribute("lang") !== "en") await page.getByRole("button", { name: /Vaihda kieli/ }).click();
        if (profile.largeText) await page.addStyleTag({ content: "html { font-size: 20px !important; }" });
        await page.waitForTimeout(1400);
        const name = `${profile.name}-${route === "/" ? "home" : route.slice(1)}.png`;
        await page.screenshot({ path: path.join(output, name), scale: "css" });
        report.captures.push(name);
        if (phase !== "before") {
          const geometry = await page.evaluate(() => ({ width: innerWidth, body: document.documentElement.scrollWidth }));
          check(geometry.body <= geometry.width + 2, `${profile.name} ${route}: no horizontal overflow`);
          check(await page.locator("h1:visible").first().isVisible(), `${profile.name} ${route}: heading available`);
          const actions = await page.locator("main [data-order-entry] a:visible").evaluateAll((links) => links.map((link) => {
            const r = link.getBoundingClientRect();
            return { text: link.textContent, x: r.x, y: r.y, right: r.right, bottom: r.bottom };
          }));
          for (const action of actions) check(action.x >= -1 && action.right <= profile.width + 1 && action.y >= 60 && action.bottom <= profile.height + 1,
            `${profile.name} ${route}: opening action fits (${action.text.trim()})`);
          const stages = await page.locator(".story-track").evaluateAll((tracks) => tracks.filter((track) => track.getClientRects().length > 0).map((track) => ({ height: track.getBoundingClientRect().height })));
          check(profile.reduce || stages.length > 0, `${profile.name} ${route}: cinematic stages retained`);
        }
      }
      await context.close();
    }
    if (phase !== "before") { await checkoutChecks(browser); await resilienceChecks(browser); }
  } catch (error) {
    report.errors.push(error.stack || error.message);
    process.exitCode = 1;
  } finally {
    fs.writeFileSync(path.join(output, "report.json"), JSON.stringify(report, null, 2));
    if (report.errors.length) process.exitCode = 1;
    await browser.close();
    console.log(JSON.stringify({ phase, captures: report.captures.length, checks: report.checks.length, errors: report.errors }, null, 2));
  }
})();

async function checkoutChecks(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await context.route("**/*", (route) => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  let submissions = [];
  await context.route(`${origin}/api/submit`, async (route) => {
    submissions.push(route.request().postDataJSON());
    await new Promise((resolve) => setTimeout(resolve, 450));
    await route.fulfill({ status: submissions.length === 1 ? 502 : 200, contentType: "application/json", body: JSON.stringify(submissions.length === 1 ? { error: "Stubbed failure" } : { ok: true, price: 30 }) });
  });
  const page = await context.newPage();
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.locator('header a[href="/tuotteet#configurator"]').click();
  await page.waitForURL("**/tuotteet#configurator");
  await page.waitForFunction(() => { const r = document.getElementById("configurator")?.getBoundingClientRect(); return r && r.top >= 60 && r.top <= 130; });
  check(true, "homepage navigation action lands directly at configuration");
  await page.getByRole("button", { name: "Vihreä", exact: true }).click();
  await page.getByRole("button", { name: "Lisää Havu", exact: true }).click();
  await page.getByRole("button", { name: "Lisää Mustikka", exact: true }).click({ clickCount: 2 });
  await page.getByRole("button", { name: "+ Lisää koriin", exact: true }).click();
  await page.waitForFunction(() => /3 kpl/.test(document.querySelector(".mobile-cart-dock")?.textContent || ""));
  check(true, "mixed scent selection added to cart");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() => /3 kpl/.test(document.querySelector(".mobile-cart-dock")?.textContent || ""));
  check(true, "cart restored after reload");
  const dock = page.locator(".mobile-cart-dock");
  await dock.getByRole("button", { name: /^Jatka/ }).click();
  await page.getByLabel("Etunimi", { exact: true }).waitFor();
  check(await page.getByLabel("Osoite", { exact: true }).count() === 0, "pickup has no address fields");
  await page.getByLabel("Etunimi", { exact: true }).fill("QA");
  await page.getByLabel("Sukunimi", { exact: true }).fill("Testi");
  await page.getByLabel("Sähköposti", { exact: true }).fill("qa@example.com");
  await page.getByRole("radio", { name: /Postitus/ }).check();
  check(await page.getByLabel("Osoite", { exact: true }).getAttribute("required") !== null, "postage requires an address");
  await page.getByLabel("Osoite", { exact: true }).fill("Testikatu 1");
  await page.getByLabel("Postinumero", { exact: true }).fill("90100");
  await page.getByLabel("Kaupunki", { exact: true }).fill("Oulu");
  await page.getByRole("radio", { name: /Nouto/ }).check();
  check(await page.getByLabel("Osoite", { exact: true }).count() === 0, "switching to pickup removes address requirements");
  await page.getByRole("radio", { name: /Postitus/ }).check();
  check(await page.getByLabel("Osoite", { exact: true }).inputValue() === "Testikatu 1", "delivery details survive switching methods");
  await page.locator("#personalMsg").check();
  await page.locator("#personal-message").fill("QA — vain paikallinen testi.");
  await page.getByRole("button", { name: "Seuraava →", exact: true }).click();
  await page.getByLabel("Alekoodi", { exact: true }).fill("invalid");
  await page.getByRole("button", { name: "OK", exact: true }).click();
  check(await page.getByLabel("Alekoodi", { exact: true }).getAttribute("aria-invalid") === "true", "invalid discount has inline feedback");
  await page.getByLabel("Alekoodi", { exact: true }).fill(" leimu29 ");
  await page.getByRole("button", { name: "OK", exact: true }).click();
  check(await page.getByText("Alennus 15% lisätty", { exact: true }).isVisible(), "valid discount applies");
  check(await page.locator("#configurator").getByText(/MobilePay/).isVisible(), "payment method explained before confirmation");
  await page.getByRole("button", { name: "tietosuojaselosteen", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  check(await page.getByRole("button", { name: "tietosuojaselosteen", exact: true }).evaluate((el) => el === document.activeElement), "privacy dialog returns keyboard focus");
  await page.locator("#privacyConsent").check();
  const confirm = page.getByRole("button", { name: "Vahvista tilaus →", exact: true });
  await confirm.click();
  await page.getByRole("alert").filter({ hasText: /lähetys epäonnistui/ }).waitFor();
  check(submissions.length === 1 && JSON.parse(await page.evaluate(() => sessionStorage.getItem("leimu-cart-v1"))).cart.length === 1, "failed order keeps the cart and one submission");
  await page.screenshot({ path: path.join(output, "mobile390-checkout-recovery.png"), scale: "css" });
  await confirm.click();
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((button) => button.disabled && /Käsitellään/.test(button.textContent)));
  await page.evaluate(() => { const button = [...document.querySelectorAll("button")].find((el) => /Käsitellään/.test(el.textContent)); button?.click(); button?.click(); });
  await page.getByRole("heading", { name: /Kiitos tilauksestasi/ }).waitFor();
  await page.waitForFunction(() => {
    const heading = document.querySelector("#configurator h1");
    const box = heading?.getBoundingClientRect();
    return box && box.top >= 60 && box.top <= 300;
  });
  check(true, "confirmation settles at its heading after the page height changes");
  check(await page.locator(".chapter-mobile").count() === 0, "chapter navigation does not cover the confirmation heading");
  check(submissions.length === 2, "successful retry submits once despite repeated clicks");
  const order = submissions[1];
  check(order.totalCandles === 3 && order.green === 3 && order.havu === 1 && order.mustikka === 2 && order.price === 30, "checkout payload has correct quantities, discount, and postage");
  const storage = await page.evaluate(() => JSON.parse(sessionStorage.getItem("leimu-cart-v1")));
  check(storage.cart.length === 0 && !JSON.stringify(storage).includes("qa@example.com") && !JSON.stringify(storage).includes("paikallinen"), "successful order clears cart without storing personal data");
  await page.screenshot({ path: path.join(output, "mobile390-confirmation.png"), scale: "css" });
  await context.close();
}

async function resilienceChecks(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await context.route("**/*", (route) => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.locator("#tuoksut").scrollIntoViewIfNeeded();
  await page.locator(".order-shortcut").waitFor();
  check(true, "order shortcut appears beyond the opening action");
  await page.locator(".scent-card").first().click();
  await page.getByRole("dialog").waitFor();
  check(await page.locator(".order-shortcut").evaluate((el) => getComputedStyle(el).visibility === "hidden"), "order shortcut hides behind dialogs");
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page.locator(".studio-fallback").scrollIntoViewIfNeeded();
  check(await page.locator(".studio-fallback img").count() === 3, "blocked Instagram retains three real studio photographs");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.getByRole("button", { name: "Avaa valikko", exact: true }).click();
  check(await page.getByRole("button", { name: "Ota yhteyttä", exact: true }).first().isVisible(), "contact remains in mobile menu");
  await page.keyboard.press("Escape");
  check(await page.getByRole("button", { name: "Avaa valikko", exact: true }).getAttribute("aria-expanded") === "false", "Escape closes mobile menu");
  await context.close();

  const feedContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await feedContext.route("**/*", (route) => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  await feedContext.route("https://w.behold.so/widget.js", (route) => route.fulfill({ contentType: "application/javascript", body: `customElements.define('behold-widget', class extends HTMLElement { connectedCallback() { this.style.display = 'block'; this.style.height = '320px'; const img = document.createElement('img'); img.src = '/images/Setti.jpg'; img.alt = 'Local feed test'; img.style.height = '300px'; img.onload = () => this.dispatchEvent(new Event('load')); this.append(img); } });` }));
  const feedPage = await feedContext.newPage();
  await feedPage.goto(origin, { waitUntil: "networkidle" });
  check(await feedPage.locator("script[data-behold]").count() === 0, "Instagram script is deferred until its section approaches");
  await feedPage.locator(".studio-fallback").scrollIntoViewIfNeeded();
  await feedPage.locator(".studio-fallback").waitFor({ state: "hidden" });
  check(await feedPage.locator("behold-widget").isVisible(), "Instagram load event replaces fallback with the feed");
  await feedContext.close();

  const fallback = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) { return /webgl/.test(type) ? null : original.call(this, type, ...args); };
    Storage.prototype.setItem = () => { throw new Error("Storage unavailable"); };
    Storage.prototype.getItem = () => { throw new Error("Storage unavailable"); };
  });
  const fallbackPage = await fallback.newPage();
  const errors = [];
  fallbackPage.on("pageerror", (error) => errors.push(error.message));
  await fallbackPage.goto(origin, { waitUntil: "networkidle" });
  check(await fallbackPage.locator("canvas").count() === 0 && await fallbackPage.locator('img[src="/images/hero-candle-black.webp"]').first().isVisible(), "WebGL unavailable retains the candle photograph");
  await fallbackPage.goto(origin + "/tuotteet#configurator", { waitUntil: "networkidle" });
  await fallbackPage.getByRole("button", { name: "Lisää Havu", exact: true }).click();
  await fallbackPage.getByRole("button", { name: "+ Lisää koriin", exact: true }).click();
  check(errors.length === 0, "ordering still works with storage unavailable");
  await fallback.close();

  const noScript = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const staticPage = await noScript.newPage();
  for (const route of ["/", "/tuotteet"]) {
    await staticPage.goto(origin + route, { waitUntil: "load" });
    const visible = await staticPage.locator("h1:visible").first().evaluate((el) => {
      const spans = [...el.querySelectorAll("span")];
      return [el, ...spans].every((node) => getComputedStyle(node).opacity !== "0");
    });
    check(visible, `${route}: opening headline survives without JavaScript`);
  }
  await noScript.close();
}
