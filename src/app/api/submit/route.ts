/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Form submit proxy (Next.js Route Handler → Netlify Function)
   ------------------------------------------------------------------------
   The browser POSTs clean semantic JSON here; this server endpoint:
     • validates `formType` (the Make.com Router condition),
     • builds the EXACT Make payload (Finnish keys Make/Airtable expect),
     • forces numeric fields to real numbers (so Airtable accepts them),
     • stamps `Saapunut` server-side (trusted clock),
     • forwards it to the Make webhook stored in MAKE_WEBHOOK_URL.

   Why server-side: the webhook URL never reaches the browser bundle (no spam /
   quota abuse), and there are no CORS problems (server-to-server).
   ════════════════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Coerce anything to a finite number (Airtable number fields), default 0. */
function num(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
const str = (v: unknown) => String(v ?? "").trim();

export async function POST(req: NextRequest) {
  const WEBHOOK = process.env.MAKE_WEBHOOK_URL;
  if (!WEBHOOK) {
    console.error("[submit] MAKE_WEBHOOK_URL is not configured");
    return NextResponse.json(
      { ok: false, error: "Server not configured (MAKE_WEBHOOK_URL missing)." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
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
    if (!payload["Nimi"] || !payload["Sähköposti"] || !payload["Viesti"]) {
      return NextResponse.json({ ok: false, error: "Pakollisia kenttiä puuttuu." }, { status: 400 });
    }
  } else if (body.formType === "leimu-order") {
    payload = {
      formType: "leimu-order",
      // Asiakkaan tiedot
      "Tilaaja": str(body.tilaaja),
      "Sähköposti": str(body.email),
      "Osoite": str(body.address),
      "Postinumero": str(body.zip),
      "Kaupunki": str(body.city),
      // Tilauksen perustiedot
      "Toimitus": str(body.delivery),
      "Kpl yhteensä": num(body.totalCandles),
      "Hinta": num(body.price),
      // Maut (numeroita)
      "Havu": num(body.havu),
      "Havu-Vanilja": num(body.havuVanilja),
      "Vanilja": num(body.vanilja),
      "Mustikka": num(body.mustikka),
      "Mustikka-Vanilja": num(body.mustikkaVanilja),
      // Purkkien värit (numeroita)
      "Valkoiset purkit": num(body.white),
      "Vihreät purkit": num(body.green),
      "Punaiset purkit": num(body.red),
      // Lisätiedot
      "Tuotteet (erittely)": str(body.items),
      "Viesti kuoreen": str(body.personalMessage),
      "Saapunut": Saapunut,
    };
    if (!payload["Tilaaja"] || !payload["Sähköposti"]) {
      return NextResponse.json({ ok: false, error: "Pakollisia kenttiä puuttuu." }, { status: 400 });
    }
  } else {
    return NextResponse.json({ ok: false, error: "Tuntematon formType." }, { status: 400 });
  }

  try {
    const res = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[submit] Make webhook responded", res.status, detail.slice(0, 300));
      return NextResponse.json({ ok: false, error: `Webhook ${res.status}` }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[submit] Failed to reach Make webhook:", err);
    return NextResponse.json({ ok: false, error: "Upstream request failed." }, { status: 502 });
  }
}
