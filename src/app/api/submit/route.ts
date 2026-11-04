/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Form submit proxy (Next.js Route Handler → Netlify Function)
   ------------------------------------------------------------------------
   The browser POSTs clean semantic JSON here; this server endpoint:
     • validates `formType` (the Make.com Router condition),
     • builds the EXACT Make payload (Finnish keys Make/Airtable expect),
     • validates quantities and computes prices from the shared pricing rules,
     • stamps `Saapunut` server-side (trusted clock),
     • forwards it to the Make webhook stored in MAKE_WEBHOOK_URL.

   Why server-side: the webhook URL never reaches the browser bundle (no spam /
   quota abuse), and there are no CORS problems (server-to-server).
   ════════════════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server";
import { validEmail, validateOrder } from "@/lib/order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const str = (v: unknown) => typeof v === "string" ? v.trim() : "";

export async function POST(req: NextRequest) {
  // Make.com webhook — read server-side only (never shipped to the browser).
  // Overridable via the MAKE_WEBHOOK_URL env var; falls back to the LEIMU hook.
  const WEBHOOK =
    process.env.MAKE_WEBHOOK_URL ||
    "https://hook.eu2.make.com/iu9qhalsmhgi5ymkcivgwu0u4jw22qpq";

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "Invalid submission." }, { status: 400 });
  }

  const Saapunut = new Date().toISOString();
  let payload: Record<string, unknown>;

  if (body.formType === "leimu-contact") {
    payload = {
      formType: "leimu-contact",
      "Nimi": str(body.name),
      "Sähköposti": str(body.email),
      "Aihe": str(body.subject),
      "Viesti": str(body.message),
      "Saapunut": Saapunut,
    };
    if (!payload["Nimi"] || !validEmail(str(body.email)) || !payload["Viesti"]) {
      return NextResponse.json({ ok: false, error: "Pakollisia kenttiä puuttuu." }, { status: 400 });
    }
  } else if (body.formType === "leimu-order") {
    const validation = validateOrder(body);
    if (!validation.ok) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
    }
    const order = validation.order;
    payload = {
      formType: "leimu-order",
      // Asiakkaan tiedot
      "Tilaaja": order.tilaaja,
      "Sähköposti": order.email,
      "Osoite": order.address,
      "Postinumero": order.zip,
      "Kaupunki": order.city,
      // Tilauksen perustiedot
      "Toimitus": order.delivery,
      "Kpl yhteensä": order.totalCandles,
      "Hinta": order.price,
      // Maut (numeroita)
      "Havu": order.havu,
      "Havu-Vanilja": order.havuVanilja,
      "Vanilja": order.vanilja,
      "Mustikka": order.mustikka,
      "Mustikka-Vanilja": order.mustikkaVanilja,
      // Purkkien värit (numeroita)
      "Valkoiset purkit": order.white,
      "Vihreät purkit": order.green,
      "Punaiset purkit": order.red,
      // Lisätiedot
      "Tuotteet (erittely)": order.items,
      "Viesti kuoreen": order.personalMessage,
      "Saapunut": Saapunut,
    };
    if (!payload["Tilaaja"] || !payload["Sähköposti"]) {
      return NextResponse.json({ ok: false, error: "Pakollisia kenttiä puuttuu." }, { status: 400 });
    }
  } else {
    return NextResponse.json({ ok: false, error: "Tuntematon formType." }, { status: 400 });
  }

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    // The Make webhook has API-key auth ("x-make-apikey"). Provide the key via the
    // MAKE_API_KEY env var (kept out of the public repo). If unset, no key is sent.
    if (process.env.MAKE_API_KEY) headers["x-make-apikey"] = process.env.MAKE_API_KEY;
    const res = await fetch(WEBHOOK, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[submit] Make webhook responded", res.status, detail.slice(0, 300));
      return NextResponse.json({ ok: false, error: `Webhook ${res.status}` }, { status: 502 });
    }
    return NextResponse.json({ ok: true, ...(body.formType === "leimu-order" ? { price: payload["Hinta"] } : {}) });
  } catch (err) {
    console.error("[submit] Failed to reach Make webhook:", err);
    return NextResponse.json({ ok: false, error: "Upstream request failed." }, { status: 502 });
  }
}
