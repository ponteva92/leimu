/* Exercise the real TypeScript pricing, persistence, and route with a stubbed upstream. */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const javascript = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const localRequire = (name) => {
    if (name.startsWith("@/")) return load(path.join(root, "src", name.slice(2)) + ".ts");
    if (name.startsWith(".")) return load(path.resolve(path.dirname(file), name) + ".ts");
    return require(name);
  };
  new Function("require", "module", "exports", javascript)(localRequire, module, module.exports);
  return module.exports;
}
const { orderPricing, validateOrder } = load(path.join(root, "src/lib/order.ts"));
const { parseCartSession } = load(path.join(root, "src/lib/cartSession.ts"));
const { POST } = load(path.join(root, "src/app/api/submit/route.ts"));
let checks = 0;
function check(value, message) { assert.ok(value, message); checks++; }
const fixture = () => ({ formType: "leimu-order", tilaaja: "QA Test", email: "qa@example.com", address: "", zip: "", city: "", delivery: "Nouto",
  totalCandles: 1, price: 0, havu: 1, havuVanilja: 0, vanilja: 0, mustikka: 0, mustikkaVanilja: 0, white: 1, green: 0, red: 0,
  items: "Valkoinen: Havu x1", personalMessage: "Paikallinen testi" });
const request = (body) => new Request("http://localhost/api/submit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

(async () => {
  for (const [quantity, total] of [[0, 0], [1, 9], [2, 18], [3, 25], [4, 34], [5, 40], [6, 47], [7, 56]]) {
    check(orderPricing(quantity, false).total === total, `bundle price for ${quantity}`);
    check(orderPricing(quantity, true).total === total + 8, `postal price for ${quantity}`);
  }
  check(orderPricing(3, true, " leimu29 ").total === 30, "discount rounding and postage");
  check(validateOrder(fixture()).order.price === 9, "server replaces untrusted price");
  for (const patch of [
    { havu: -1 }, { havu: 0.5 }, { havu: "1" }, { havu: null }, { havu: Infinity },
    { totalCandles: 2 }, { white: 0 }, { totalCandles: 0, havu: 0, white: 0 },
    { email: "invalid" }, { tilaaja: " " }, { delivery: "Express" }, { items: "" },
    { delivery: "Posti (+8 €)" }, { discountCode: "INVALID" },
  ]) check(!validateOrder({ ...fixture(), ...patch }).ok, `reject invalid ${Object.keys(patch).join(",")}`);
  const postal = { ...fixture(), delivery: "Posti (+8 €)", address: "Testikatu 1", zip: "90100", city: "Oulu" };
  check(validateOrder(postal).order.price === 17, "valid postal order");
  check(!validateOrder({ ...postal, zip: "123" }).ok, "invalid postal code");
  check(validateOrder({ ...fixture(), address: "old address" }).order.address === "", "pickup discards stale delivery details");
  check(parseCartSession("broken") === null && parseCartSession("null") === null, "corrupt session is harmless");
  const restored = parseCartSession(JSON.stringify({ cart: [{ id: "1", jarColor: "green", quantities: { havu: 2, unknown: 99 } }],
    config: { jar: "red", quantities: { mustikka: 3 }, message: "private" }, email: "private@example.com" }));
  check(restored.cart.length === 1 && restored.cart[0].quantities.havu === 2 && !restored.cart[0].quantities.unknown, "restore only known scents");
  check(restored.config.jar === "red" && restored.config.message === "" && !restored.email, "restore selections without private information");
  check(parseCartSession(JSON.stringify({ cart: [null, { jarColor: "invalid" }], config: { quantities: { havu: 100, mustikka: 3 } } })).config.quantities.havu === 6, "restore validates jar and selection limits");

  const originalFetch = global.fetch;
  const originalError = console.error;
  let calls = 0;
  let forwarded;
  try {
    global.fetch = async (_url, options) => { calls++; forwarded = JSON.parse(options.body); return new Response("{}", { status: 200 }); };
    const result = await POST(request(fixture()));
    check(result.status === 200 && (await result.json()).price === 9, "route returns authoritative price");
    check(forwarded.Hinta === 9 && forwarded["Kpl yhteensä"] === 1 && forwarded["Viesti kuoreen"] === "Paikallinen testi", "Make field compatibility");
    const before = calls;
    for (const invalid of [null, [], { formType: "bad" }, { ...fixture(), green: 2 }, { ...fixture(), havu: -1 }]) {
      check((await POST(request(invalid))).status === 400, "route rejects malformed orders");
    }
    check(calls === before, "invalid orders never reach upstream");
    const invalidJSON = new Request("http://localhost/api/submit", { method: "POST", body: "{" });
    check((await POST(invalidJSON)).status === 400, "malformed JSON");
    await POST(request({ ...postal, discountCode: "LEIMU29", price: 999 }));
    check(forwarded.Hinta === 16 && forwarded.Osoite === "Testikatu 1", "server applies discount independently");
    check((await POST(request({ formType: "leimu-contact", name: "QA", email: "qa@example.com", message: "Test", subject: "Question" }))).status === 200, "contact flow remains compatible");
    console.error = () => {};
    global.fetch = async () => new Response("stubbed failure", { status: 503 });
    check((await POST(request(fixture()))).status === 502, "upstream rejection is recoverable");
    global.fetch = async () => { throw new Error("stubbed network failure"); };
    check((await POST(request(fixture()))).status === 502, "upstream connection failure is recoverable");
  } finally { global.fetch = originalFetch; console.error = originalError; }
  console.log(`Passed ${checks} order, session, and API checks. All upstream calls were stubbed.`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
