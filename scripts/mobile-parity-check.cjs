/* Render the application without opening a TCP port. In restricted Windows
   environments a private named pipe carries intercepted browser requests. */
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const os = require("node:os");
const crypto = require("node:crypto");
const next = require("next");
let playwright;
try { playwright = require("playwright"); } catch {
  const bundled = path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
  playwright = require(process.env.PARITY_PLAYWRIGHT_MODULE || bundled);
}
const { chromium } = playwright;

const root = path.resolve(__dirname, "..");
const output = process.env.PARITY_OUTPUT || path.join(root, "artifacts/mobile-parity");
const pipe = process.platform === "win32" ? `\\\\.\\pipe\\LOCAL\\leimu-parity-${process.pid}` : path.join(os.tmpdir(), `leimu-parity-${process.pid}.sock`);
const origin = "http://leimu.test";
function sourceHash() {
  const digest = crypto.createHash("sha256");
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (/\.(tsx?|css|woff2)$/.test(entry.name)) digest.update(path.relative(root, file)).update("\0").update(fs.readFileSync(file));
    }
  };
  walk(path.join(root, "src"));
  return digest.digest("hex");
}
const report = { started: new Date().toISOString(), production: process.env.PARITY_PRODUCTION === "1", buildId: fs.existsSync(path.join(root, ".next/BUILD_ID")) ? fs.readFileSync(path.join(root, ".next/BUILD_ID"), "utf8").trim() : null, sourceSha256: sourceHash(), transport: "private-windows-named-pipe-html-and-generated-local-assets", pipe, cases: [], failures: [] };
const check = (condition, label) => { if (!condition) report.failures.push(label); return !!condition; };
let app;
let server;
let browser;

const mime = { ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".svg": "image/svg+xml", ".woff": "font/woff", ".woff2": "font/woff2", ".mp4": "video/mp4", ".webm": "video/webm" };
function localAsset(url) {
  const address = new URL(url, origin);
  let base = path.join(root, "public");
  let relative = address.pathname;
  if (relative.startsWith("/_next/static/")) {
    base = path.join(root, ".next", "static");
    relative = relative.slice("/_next/static".length);
  } else if (relative === "/_next/image") {
    relative = address.searchParams.get("url");
    if (!relative?.startsWith("/") || relative.startsWith("//")) return null;
  }
  let file;
  try { file = path.resolve(base, "." + decodeURIComponent(relative)); } catch { return null; }
  if (!file.startsWith(base + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return null;
  return file;
}
function staticResponse(request, response) {
  const file = localAsset(request.url);
  if (!file) return false;
  response.writeHead(200, { "content-type": mime[path.extname(file).toLowerCase()] || "application/octet-stream", "cache-control": "no-store" });
  fs.createReadStream(file).pipe(response);
  return true;
}

function save() {
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, "results.json"), JSON.stringify(report, null, 2));
}

function requestPipe(url, method = "GET", inputHeaders = {}, body) {
  return new Promise((resolve, reject) => {
    const address = new URL(url, origin);
    const headers = { ...inputHeaders, host: "leimu.test", "x-forwarded-host": "leimu.test", "x-forwarded-proto": "http", "accept-encoding": "identity" };
    delete headers.connection;
    const request = http.request({ socketPath: pipe, path: address.pathname + address.search, method, headers }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("error", reject);
      response.on("end", () => resolve({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks) }));
    });
    request.setTimeout(120000, () => request.destroy(new Error(`Pipe request timed out: ${address.pathname}`)));
    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
}

async function snapshotStage(page, index) {
  return page.evaluate((trackIndex) => {
    const tracks = [...document.querySelectorAll(".story-track")].filter((el) => el.getClientRects().length && getComputedStyle(el).display !== "none");
    const track = tracks[trackIndex];
    const stage = track?.querySelector(".story-stage");
    if (!track || !stage) return { missing: true };
    const s = stage.getBoundingClientRect();
    const rect = (r) => ({ x: +r.x.toFixed(1), y: +r.y.toFixed(1), width: +r.width.toFixed(1), height: +r.height.toFixed(1), bottom: +r.bottom.toFixed(1), right: +r.right.toFixed(1) });
    function visible(el) {
      let opacity = 1;
      for (let cursor = el; cursor && cursor !== stage.parentElement; cursor = cursor.parentElement) {
        const style = getComputedStyle(cursor);
        if (style.display === "none" || style.visibility === "hidden" || cursor.getAttribute("aria-hidden") === "true") return false;
        opacity *= Number(style.opacity);
      }
      return opacity > 0.12 && el.getClientRects().length > 0;
    }
    const text = [...stage.querySelectorAll("h1,h2,h3,p,button,a,li")].filter((el) => visible(el) && el.textContent.trim()).map((el) => {
      const r = el.getBoundingClientRect();
      return { tag: el.tagName.toLowerCase(), text: el.textContent.trim().replace(/\s+/g, " ").slice(0, 140), ...rect(r), outside: r.left < s.left - 2 || r.right > s.right + 2 || r.top < s.top - 2 || r.bottom > s.bottom + 2 };
    });
    return {
      id: track.id || track.closest("section[id]")?.id || `stage-${trackIndex}`,
      position: getComputedStyle(stage).position,
      stage: rect(s), trackHeight: track.offsetHeight, viewport: { width: innerWidth, height: innerHeight },
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 2,
      canvases: [...stage.querySelectorAll("canvas")].map((canvas) => ({ ...rect(canvas.getBoundingClientRect()), bufferWidth: canvas.width, bufferHeight: canvas.height })),
      videos: [...stage.querySelectorAll("video")].map((video) => ({ paused: video.paused, readyState: video.readyState, muted: video.muted, playsInline: video.playsInline })),
      transforms: [...stage.querySelectorAll("[style]")].filter((el) => getComputedStyle(el).transform !== "none").slice(0, 45).map((el) => ({ tag: el.tagName, class: typeof el.className === "string" ? el.className.slice(0, 110) : "svg", transform: getComputedStyle(el).transform, opacity: getComputedStyle(el).opacity })),
      text,
    };
  }, index);
}

async function interactionChecks(page, result, profile, route) {
  const prefix = `${profile.name} ${route}`;
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(300);
  const menu = page.getByRole("button", { name: /^(Avaa valikko|Open menu)$/ });
  await menu.click();
  await page.evaluate(() => window.scrollBy({ top: 160, behavior: "instant" }));
  await page.waitForTimeout(600);
  const header = await page.locator("header").first().boundingBox();
  result.interactions.menuStaysVisible = check(header && header.y >= -2, `${prefix}: open mobile menu moved offscreen`);
  await page.getByRole("button", { name: /^(Sulje valikko|Close menu)$/ }).click();

  if (!profile.reduce) {
    await page.evaluate(() => {
      const track = [...document.querySelectorAll(".story-track")].filter((el) => el.getClientRects().length && getComputedStyle(el).display !== "none")[1];
      if (track) window.scrollTo({ top: track.getBoundingClientRect().top + scrollY + 100, behavior: "instant" });
    });
    const picker = page.locator(".chapter-mobile");
    await picker.waitFor({ state: "visible", timeout: 5000 });
    await picker.locator("summary").click();
    const destination = route === "/" ? "sinetti" : route === "/tarina" ? "aineet" : "kasityo";
    await picker.locator(`a[href="#${destination}"]`).click();
    await page.waitForTimeout(1900);
    result.interactions.chapterPicker = check(await picker.isVisible() && !(await picker.getAttribute("open")), `${prefix}: chapter picker did not close after navigating`);
    result.interactions.chapterLabel = await picker.locator("summary").innerText();
    if (route === "/") {
      const cta = await page.locator("#sinetti a[href='/tuotteet#configurator']").boundingBox();
      result.interactions.sealCtaParked = check(cta && cta.y >= 0 && cta.y + cta.height <= profile.viewport.height + 1, `${prefix}: seal chapter navigation missed readable CTA`);
    }
  }

  if (route === "/") {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await menu.click();
    await page.getByRole("button", { name: /^(Ota yhteyttä|Contact us)$/ }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible" });
    const field = page.locator("#contact-name");
    await field.fill("QA");
    const font = await field.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    result.interactions.contactFieldFont = font;
    check(font >= 16, `${prefix}: mobile field text is smaller than 16px`);
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden", timeout: 8000 });
    result.interactions.contactClosed = true;
  }

  if (route === "/tuotteet") {
    const plus = page.getByRole("button", { name: profile.english ? /^Add one / : /^Lisää / }).first();
    await plus.click();
    const dock = page.locator(".mobile-cart-dock");
    await dock.waitFor({ state: "visible" });
    await dock.getByRole("button", { name: /^(Lisää 1 koriin|Add 1 to cart)$/ }).click();
    await page.waitForFunction(() => /1 (kpl|pcs)/.test(document.querySelector(".mobile-cart-dock")?.textContent || ""));
    result.interactions.cartAdded = true;
    const expand = dock.getByRole("button", { name: /^(Ostoskori|Cart)/ });
    await expand.click();
    result.interactions.cartExpanded = check(await expand.getAttribute("aria-expanded") === "true", `${prefix}: cart did not expand`);
    await expand.click();
    await dock.getByRole("button", { name: /^(Jatka →|Continue →)$/ }).click();
    await page.locator("#configurator input[type='email']").waitFor({ state: "visible", timeout: 10000 });
    await dock.waitFor({ state: "hidden", timeout: 8000 });
    result.interactions.checkoutReached = true;

    await page.evaluate(() => {
      const track = document.querySelector(".product-craft-track");
      const target = track && getComputedStyle(track).display !== "none" ? track : document.querySelector("#kasityo");
      if (target) window.scrollTo({ top: target.getBoundingClientRect().top + scrollY + 100, behavior: "instant" });
    });
    const control = page.locator(".product-film-controls button:visible").first();
    await control.scrollIntoViewIfNeeded();
    const label = await control.getAttribute("aria-label");
    await control.click();
    await page.waitForTimeout(300);
    result.interactions.videoControl = check(label !== await control.getAttribute("aria-label"), `${prefix}: video play/pause did not respond`);
    const frame = await control.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const parent = el.closest(".relative.isolate").getBoundingClientRect();
      return { width: r.width, height: r.height, inside: r.left >= parent.left && r.right <= parent.right + 1 && r.top >= parent.top && r.bottom <= parent.bottom + 1 };
    });
    result.interactions.videoControlGeometry = frame;
    check(frame.inside && frame.width >= 43 && frame.height >= 43, `${prefix}: video control clipped or smaller than 44px`);
    // The complete checkout runs against a browser-local stub. Its POST
    // never reaches Next's API, an email service, or an order system.
    let interceptedOrders = 0;
    await page.route(`${origin}/api/submit`, async (request) => {
      interceptedOrders++;
      await request.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    await page.getByRole("radio", { name: /Postitus|Postage/ }).check();
    for (const [label, value] of [
      [profile.english ? "First name" : "Etunimi", "QA"],
      [profile.english ? "Last name" : "Sukunimi", "Testi"],
      [profile.english ? "Email" : "Sähköposti", "qa@example.com"],
      [profile.english ? "Address" : "Osoite", "Testikatu 1"],
      [profile.english ? "Postcode" : "Postinumero", "90100"],
      [profile.english ? "City" : "Kaupunki", "Oulu"],
    ]) await page.getByLabel(label, { exact: true }).fill(value);
    await page.locator("#personalMsg").check();
    await page.locator("#personal-message").fill("QA — vain paikallinen selaintesti.");
    await page.getByRole("button", { name: /^(Seuraava →|Next →)$/ }).click();
    await page.locator("#privacyConsent").check();
    await page.getByRole("button", { name: /^(Vahvista tilaus →|Confirm order →)$/ }).click();
    await page.getByRole("heading", { name: /Kiitos tilauksestasi|Thank you for your order/ }).waitFor({ state: "visible", timeout: 10000 });
    result.interactions.mockCheckoutCompleted = check(interceptedOrders === 1, `${prefix}: checkout did not complete exactly one local mock request`);
    await page.waitForTimeout(750);
    const screenshot = path.join(output, `${profile.name}-tuotteet-thank-you.png`);
    await page.screenshot({ path: screenshot, scale: "css", timeout: 15000 }).then(() => result.screenshots.push(screenshot)).catch(() => {});
  }
}

async function inspectCaptions(page, result, profile, route) {
  const cards = page.locator(".scent-card");
  const duringReveal = [];
  for (let i = 0; i < await cards.count(); i++) {
    await cards.nth(i).evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
    await page.waitForTimeout(220);
    const caption = await cards.nth(i).evaluate((el) => {
      const card = el.getBoundingClientRect();
      return [...el.querySelectorAll(".scent-caption")].filter((label) => label.getClientRects().length > 0).map((label) => {
        const r = label.getBoundingClientRect();
        const frame = label.closest(".scent-image-frame")?.getBoundingClientRect() || card;
        return { name: el.getAttribute("aria-label"), top: r.top, bottom: r.bottom, inside: r.top >= frame.top - 2 && r.bottom <= frame.bottom + 2 && r.left >= frame.left - 2 && r.right <= frame.right + 2 };
      });
    });
    duringReveal.push(...caption);
  }
  result.captionRevealSamples = duringReveal;
  // A grid-wide scrub may still be wiping a card when that card is centred.
  // Inspect final content geometry at end/end (shared grid p=1), also past
  // start/35% for the last card (individual compact-card p=1).
  await cards.last().evaluate((el) => {
    const grid = el.parentElement.getBoundingClientRect();
    const last = el.getBoundingClientRect();
    window.scrollTo({ top: Math.max(scrollY + grid.bottom - innerHeight + 2, scrollY + last.top - innerHeight * 0.3), behavior: "instant" });
  });
  await page.waitForTimeout(900);
  const captions = await cards.evaluateAll((elements) => elements.flatMap((el) => {
    const card = el.getBoundingClientRect();
    return [...el.querySelectorAll(".scent-caption")].filter((label) => label.getClientRects().length > 0).map((label) => {
      const r = label.getBoundingClientRect();
      const frame = label.closest(".scent-image-frame");
      const box = frame?.getBoundingClientRect() || card;
      const movingLayers = [];
      for (let parent = label.parentElement; frame && parent && parent !== frame; parent = parent.parentElement) {
        const transform = getComputedStyle(parent).transform;
        if (transform !== "none") {
          const matrix = new DOMMatrixReadOnly(transform);
          if (Math.abs(matrix.m41) > 0.1 || Math.abs(matrix.m42) > 0.1 || Math.abs(matrix.m11 - 1) > 0.001 || Math.abs(matrix.m22 - 1) > 0.001) movingLayers.push(transform);
        }
      }
      return { name: el.getAttribute("aria-label"), top: r.top, bottom: r.bottom, inside: r.top >= box.top - 2 && r.bottom <= box.bottom + 2 && r.left >= box.left - 2 && r.right <= box.right + 2, revealSettled: movingLayers.length === 0, movingLayers };
    });
  }));
  result.captions = captions;
  check(captions.every((caption) => caption.revealSettled), `${profile.name} ${route}: scent reveal did not reach its resting position`);
  check(captions.every((caption) => caption.inside), `${profile.name} ${route}: scent caption clipped`);
  if (await cards.count()) {
    const screenshot = path.join(output, `${profile.name}-${route === "/" ? "home" : route.slice(1)}-scents.png`);
    await page.screenshot({ path: screenshot, scale: "css", timeout: 15000 }).then(() => result.screenshots.push(screenshot)).catch(() => {});
  }
}

async function inspectValues(page, result, profile) {
  if (profile.reduce) return;
  const positions = [];
  for (const offset of [220, 340]) {
    await page.evaluate((offset) => {
      const section = document.getElementById("arvot");
      window.scrollTo({ top: section.getBoundingClientRect().top + scrollY + offset, behavior: "instant" });
    }, offset);
    await page.waitForTimeout(250);
    positions.push(await page.locator(".tarina-values-heading").evaluate((el) => ({ position: getComputedStyle(el).position, y: el.getBoundingClientRect().top })));
  }
  result.valuesHeading = positions;
  check(positions.every((p) => p.position === "sticky") && Math.abs(positions[0].y - positions[1].y) < 2, `${profile.name} /tarina: values heading does not hold while reading`);
  const screenshot = path.join(output, `${profile.name}-tarina-values.png`);
  await page.screenshot({ path: screenshot, scale: "css", timeout: 15000 }).then(() => result.screenshots.push(screenshot)).catch(() => {});
}

async function inspectFrameCadence(page, result) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(350);
  result.frameCadence = await page.evaluate(() => new Promise((resolve) => {
    const intervals = [];
    const longTasks = [];
    const observer = PerformanceObserver.supportedEntryTypes?.includes("longtask") ? new PerformanceObserver((entries) => {
      longTasks.push(...entries.getEntries().map((entry) => entry.duration));
    }) : null;
    observer?.observe({ type: "longtask", buffered: false });
    let start;
    let previous;
    const tick = (time) => {
      start ??= time;
      if (previous !== undefined) intervals.push(time - previous);
      previous = time;
      window.scrollTo({ top: Math.min(600, (time - start) / 4), behavior: "instant" });
      if (time - start < 2400) return requestAnimationFrame(tick);
      observer?.disconnect();
      const sorted = [...intervals].sort((a, b) => a - b);
      const percentile = (p) => Number(sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]?.toFixed(2));
      resolve({ environment: "headless Chromium; native scroll, live WebGL; not a physical phone measurement", frames: intervals.length, durationMs: time - start, medianMs: percentile(0.5), p95Ms: percentile(0.95), maxMs: percentile(1), longTasks: longTasks.length });
    };
    requestAnimationFrame(tick);
  }));
}

async function inspectCase(profile, route) {
  const context = await browser.newContext({ viewport: profile.viewport, deviceScaleFactor: profile.dpr, isMobile: profile.mobile, hasTouch: profile.mobile, reducedMotion: profile.reduce ? "reduce" : "no-preference" });
  const page = await context.newPage();
  const result = { profile: profile.name, route, errors: [], externalErrors: [], networkFailures: [], screenshots: [], stages: [], interactions: {} };
  report.cases.push(result);
  page.on("pageerror", (error) => result.errors.push(String(error)));
  page.on("requestfailed", (request) => {
    if (request.url().includes("webpack-hmr")) return;
    result.networkFailures.push({ url: request.url(), error: request.failure()?.errorText });
    if (request.url().startsWith(origin + "/")) result.errors.push(`Application resource failed: ${request.url()}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error" && !/webpack-hmr|WebSocket|hot-update|net::ERR_ABORTED/.test(message.text())) {
      const source = message.location().url;
      (source && !source.startsWith(origin) ? result.externalErrors : result.errors).push(message.text().slice(0, 500));
    }
  });
  await page.route("**/*", async (intercept) => {
    const request = intercept.request();
    if (!request.url().startsWith(origin + "/")) {
      return process.env.PARITY_EXTERNAL_READS === "1" && ["GET", "HEAD"].includes(request.method()) ? intercept.continue() : intercept.abort();
    }
    // QA never submits orders or contact messages.
    if (!["GET", "HEAD"].includes(request.method())) return intercept.abort();
    try {
      const file = localAsset(request.url());
      if (file) return intercept.fulfill({ status: 200, contentType: mime[path.extname(file).toLowerCase()] || "application/octet-stream", body: fs.readFileSync(file), headers: { "cache-control": "no-store" } });
      const response = await requestPipe(request.url(), request.method(), request.headers(), request.postDataBuffer());
      const headers = {};
      for (const [key, value] of Object.entries(response.headers)) {
        if (value !== undefined && !["connection", "transfer-encoding", "content-length"].includes(key)) headers[key] = Array.isArray(value) ? value.join(", ") : String(value);
      }
      await intercept.fulfill({ status: response.status, headers, body: response.body });
    } catch (error) {
      result.errors.push(`Proxy ${request.url()}: ${error.message}`);
      await intercept.abort().catch(() => {});
    }
  });
  try {
    console.log(`CASE ${profile.name} ${route}`);
    const response = await page.goto(origin + route, { waitUntil: "domcontentloaded", timeout: 120000 });
    result.status = response.status();
    check(result.status === 200, `${profile.name} ${route}: HTTP ${result.status}`);
    await page.waitForLoadState("load", { timeout: process.env.PARITY_EXTERNAL_READS === "1" ? 12000 : 45000 }).catch(() => {});
    await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 5000))]));
    await page.waitForTimeout(1400);
    result.hydrated = await page.waitForFunction(() => {
      const button = document.querySelector("header button");
      return button && Object.keys(button).some((key) => key.startsWith("__reactProps$") && typeof button[key]?.onClick === "function");
    }, null, { timeout: 25000 }).then(() => true).catch(() => false);
    check(result.hydrated, `${profile.name} ${route}: client hydration not established`);
    if (profile.english) {
      await page.getByRole("button", { name: /Vaihda kieli: EN/ }).click();
      await page.getByRole("button", { name: /Change language: FI/ }).waitFor();
    }
    if (profile.textScale) await page.addStyleTag({ content: `html { font-size: ${16 * profile.textScale}px !important; }` });
    result.initial = await page.evaluate(() => ({ title: document.title, viewport: { width: innerWidth, height: innerHeight }, bodyWidth: document.body.scrollWidth, pageHeight: document.documentElement.scrollHeight, headings: [...document.querySelectorAll("h1")].map((el) => el.textContent.trim()), canvases: document.querySelectorAll("canvas").length }));
    result.fonts = await page.evaluate(() => [...document.fonts].map((font) => ({ family: font.family, weight: font.weight, style: font.style, status: font.status })));
    check(Math.abs(result.initial.viewport.width - profile.viewport.width) <= 1, `${profile.name} ${route}: viewport expanded to ${result.initial.viewport.width}px (requested ${profile.viewport.width}px)`);
    check(result.initial.bodyWidth <= profile.viewport.width + 2, `${profile.name} ${route}: initial horizontal overflow ${result.initial.bodyWidth}px`);
    const slug = route === "/" ? "home" : route.slice(1);
    const initialFile = path.join(output, `${profile.name}-${slug}-initial.png`);
    await page.screenshot({ path: initialFile, scale: "css", timeout: 15000 }).then(() => result.screenshots.push(initialFile)).catch((error) => result.errors.push(`Initial screenshot: ${error.message}`));
    const count = await page.evaluate(() => [...document.querySelectorAll(".story-track")].filter((el) => el.getClientRects().length && getComputedStyle(el).display !== "none").length);
    result.trackCount = count;
    if (!profile.reduce) check(count === ({ "/": 3, "/tarina": 3, "/tuotteet": 2 })[route], `${profile.name} ${route}: expected story stages missing (${count})`);
    for (let index = 0; index < count; index++) {
      const samples = [];
      result.stages.push(samples);
      for (const progress of [0.05, 0.2, 0.35, 0.45, 0.55, 0.65, 0.7, 0.85]) {
        await page.evaluate(({ index, progress }) => {
          const track = [...document.querySelectorAll(".story-track")].filter((el) => el.getClientRects().length && getComputedStyle(el).display !== "none")[index];
          const stage = track.querySelector(".story-stage");
          const units = parseFloat(getComputedStyle(track).getPropertyValue("--track"));
          const stableStage = units > 100 ? track.offsetHeight * 100 / units : (stage?.offsetHeight || innerHeight);
          const y = track.getBoundingClientRect().top + scrollY + (track.offsetHeight - stableStage) * progress;
          window.scrollTo({ top: y, behavior: "instant" });
        }, { index, progress });
        // Let the one-time cinematic entrance finish before measuring its readable state.
        await page.waitForTimeout(progress === 0.05 ? 1800 : 450);
        const sample = await snapshotStage(page, index);
        sample.progress = progress;
        samples.push(sample);
        if (route === "/tuotteet" && sample.id === "kasityo" && !profile.reduce) {
          check(sample.text.some((text) => text.tag === "h2"), `${profile.name} ${route}: craft heading invisible at ${progress}`);
          check(sample.text.some((text) => text.tag === "p" && text.text.length > 40), `${profile.name} ${route}: craft narrative invisible at ${progress}`);
        }
        save();
        if (!sample.missing && sample.position !== "sticky" && !profile.reduce) report.failures.push(`${profile.name} ${route} ${sample.id}: position ${sample.position}`);
        check(!sample.horizontalOverflow, `${profile.name} ${route} ${sample.id}: horizontal page overflow at ${progress}`);
        // Offscreen horizontal process cards and fading exits are expected.
        // A fully opaque, horizontally readable text block must fit vertically.
        const clipped = await page.evaluate((trackIndex) => {
          const track = [...document.querySelectorAll(".story-track")].filter((el) => el.getClientRects().length && getComputedStyle(el).display !== "none")[trackIndex];
          const stage = track?.querySelector(".story-stage");
          if (!stage) return [];
          const box = stage.getBoundingClientRect();
          return [...stage.querySelectorAll("h1,h2,h3,p,button")].filter((el) => {
            let opacity = 1;
            for (let parent = el; parent && parent !== stage.parentElement; parent = parent.parentElement) {
              const css = getComputedStyle(parent);
              if (css.display === "none" || css.visibility === "hidden" || parent.getAttribute("aria-hidden") === "true") return false;
              opacity *= Number(css.opacity);
            }
            const r = el.getBoundingClientRect();
            return opacity > 0.95 && r.width > 0 && r.left >= box.left - 2 && r.right <= box.right + 2 && (r.top < box.top - 2 || r.bottom > box.bottom + 2);
          }).map((el) => ({ text: el.textContent.trim().slice(0, 100), box: { top: el.getBoundingClientRect().top, bottom: el.getBoundingClientRect().bottom } }));
        }, index);
        sample.clippedText = clipped;
        if (!profile.reduce && progress < 0.85) check(!clipped.length, `${profile.name} ${route} ${sample.id}: clipped readable text at ${progress}: ${clipped.map((t) => t.text).join("; ")}`);
        const screenshot = path.join(output, `${profile.name}-${slug}-stage${index}-${String(progress).replace(".", "_")}.png`);
        if (process.env.PARITY_ALL_SHOTS || [0.05, 0.45, 0.7].includes(progress)) await page.screenshot({ path: screenshot, scale: "css", timeout: 15000 }).then(() => result.screenshots.push(screenshot)).catch((error) => result.errors.push(`Stage ${index}/${progress} screenshot: ${error.message}`));
      }
      console.log(`STAGE ${profile.name} ${route} ${index}: ${samples.length} samples`);
      save();
    }
    if (route !== "/tarina") await inspectCaptions(page, result, profile, route);
    if (route === "/tarina") await inspectValues(page, result, profile);
    if (profile.mobile) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      const card = page.locator(".scent-card").first();
      if (await card.count()) {
        await card.click({ timeout: 10000 });
        result.scentDialogOpened = await page.getByRole("dialog").isVisible();
        check(result.scentDialogOpened, `${profile.name} ${route}: scent modal failed to open`);
        await page.keyboard.press("Escape");
        await page.getByRole("dialog").waitFor({ state: "hidden", timeout: 8000 });
        result.scentDialogClosed = !(await page.getByRole("dialog").count());
        check(result.scentDialogClosed, `${profile.name} ${route}: scent modal failed to close`);
      }
    }
    if (profile.mobile && profile.viewport.width < 768) await interactionChecks(page, result, profile, route);
    if (process.env.PARITY_PERF === "1" && route === "/" && !profile.reduce) await inspectFrameCadence(page, result);
    check(!result.errors.some((error) => !error.includes("screenshot")), `${profile.name} ${route}: browser errors`);
  } catch (error) {
    result.error = error.stack || String(error);
    report.failures.push(`${profile.name} ${route}: ${error.message}`);
  } finally {
    save();
    await context.close();
  }
}

async function cleanup() {
  await browser?.close().catch(() => {});
  if (server) {
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
  }
  await app?.close().catch(() => {});
}

(async () => {
  save();
  app = next({ dev: process.env.PARITY_PRODUCTION !== "1", dir: root });
  await app.prepare();
  const handle = app.getRequestHandler();
  server = http.createServer((request, response) => {
    if (!staticResponse(request, response)) handle(request, response);
  });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(pipe, resolve); });
  console.log(`Named pipe listening: ${pipe}`);
  const probe = await requestPipe("/", "GET");
  report.pipeProbe = { status: probe.status, bytes: probe.body.length };
  console.log(`Named pipe HTTP probe: ${probe.status}, ${probe.body.length} bytes`);
  if (probe.status >= 500) throw new Error(`Next render failed (${probe.status}): ${probe.body.toString().slice(0, 1200)}`);
  const cachedExecutable = chromium.executablePath();
  const executablePath = fs.existsSync(cachedExecutable) ? cachedExecutable : "C:/Program Files/Google/Chrome/Application/chrome.exe";
  browser = await chromium.launch({ executablePath, headless: true });
  const profiles = [
    { name: "mobile390", viewport: { width: 390, height: 844 }, dpr: 2, mobile: true },
    { name: "mobile320", viewport: { width: 320, height: 568 }, dpr: 2, mobile: true },
    { name: "landscape568", viewport: { width: 568, height: 320 }, dpr: 2, mobile: true },
    { name: "landscape844", viewport: { width: 844, height: 390 }, dpr: 2, mobile: true },
    { name: "tablet768", viewport: { width: 768, height: 1024 }, dpr: 2, mobile: true },
    { name: "short1024", viewport: { width: 1024, height: 600 }, dpr: 1, mobile: true },
    { name: "wide1280", viewport: { width: 1280, height: 500 }, dpr: 1, mobile: false },
    { name: "desktop1440", viewport: { width: 1440, height: 900 }, dpr: 1, mobile: false },
    { name: "reduced390", viewport: { width: 390, height: 844 }, dpr: 2, mobile: true, reduce: true },
    { name: "english390", viewport: { width: 390, height: 844 }, dpr: 2, mobile: true, english: true },
    { name: "largeText390", viewport: { width: 390, height: 844 }, dpr: 2, mobile: true, textScale: 1.25 },
  ];
  const selectedProfiles = process.env.PARITY_PROFILES ? profiles.filter((profile) => process.env.PARITY_PROFILES.split(",").includes(profile.name)) : profiles;
  const routes = process.env.PARITY_ROUTES ? process.env.PARITY_ROUTES.split(",") : ["/", "/tarina", "/tuotteet"];
  for (const profile of selectedProfiles) for (const route of routes) await inspectCase(profile, route);
  report.finished = new Date().toISOString();
  report.sourceSha256After = sourceHash();
  check(report.sourceSha256 === report.sourceSha256After, "Application source changed during validation");
  report.failures = [...new Set(report.failures)];
  if (report.failures.length) process.exitCode = 1;
  save();
  console.log(JSON.stringify({ output, cases: report.cases.length, failures: report.failures, pageErrors: report.cases.map((item) => ({ profile: item.profile, route: item.route, errors: item.errors })) }, null, 2));
})().catch((error) => {
  report.fatal = error.stack || String(error);
  save();
  console.error(report.fatal);
  process.exitCode = 1;
}).finally(async () => {
  await Promise.race([cleanup(), new Promise((resolve) => setTimeout(resolve, 5000))]);
  process.exit(process.exitCode || 0);
});
