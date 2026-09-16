import { NextRequest, NextResponse } from "next/server";
import { EMAIL_RE } from "@/lib/contacts";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { priceOrder, SCENTS } from "@/lib/scents";
import { discountFromEnv } from "@/lib/discountEnv";
import { makeWebhookUrl, sendSubmissionEmails } from "@/lib/notifyEmail";
import type { DeliveryMode, JarColor, OrderLineInput, PaymentMethod } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function num(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
const str = (v: unknown) => String(v ?? "").trim();

function parseItems(raw: unknown): OrderLineInput[] | null {
  if (!Array.isArray(raw)) return null;
  const items: OrderLineInput[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") return null;
    const r = row as Record<string, unknown>;
    items.push({
      scentId: String(r.scentId ?? ""),
      jarColor: String(r.jarColor ?? "") as JarColor,
      qty: Number(r.qty),
    });
  }
  return items;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (str(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const Saapunut = new Date().toISOString();
  let payload: Record<string, unknown>;
  let orderTotal: number | undefined;

  if (body.formType === "leimu-contact") {
    const email = str(body.email);
    payload = {
      formType: "leimu-contact",
      "Nimi": str(body.name),
      "Sähköposti": email,
      "Aihe": str(body.subject),
      "Viesti": str(body.message),
      "Saapunut": Saapunut,
    };
    if (!payload["Nimi"] || !payload["Sähköposti"] || !payload["Viesti"]) {
      return NextResponse.json({ ok: false, error: "Pakollisia kenttiä puuttuu." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email." }, { status: 400 });
    }
  } else if (body.formType === "leimu-order") {
    const items = parseItems(body.items);
    if (!items) {
      return NextResponse.json({ ok: false, error: "Invalid items." }, { status: 400 });
    }
    const delivery: DeliveryMode = body.delivery === "post" ? "post" : "pickup";
    const payment = str(body.paymentMethod) as PaymentMethod;
    if (payment !== "mobilepay" && payment !== "siirto" && payment !== "cash") {
      return NextResponse.json({ ok: false, error: "Invalid payment method." }, { status: 400 });
    }
    if (payment === "cash" && delivery === "post") {
      return NextResponse.json({ ok: false, error: "Cash is only for pickup." }, { status: 400 });
    }
    const priced = priceOrder(items, delivery, str(body.code), discountFromEnv());
    if (!priced.ok) {
      return NextResponse.json(priced, { status: 400 });
    }
    orderTotal = priced.total;

    const email = str(body.email);
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email." }, { status: 400 });
    }

    const scentQty: Record<string, number> = {};
    const jarQty: Record<JarColor, number> = { white: 0, green: 0, red: 0 };
    for (const line of items) {
      scentQty[line.scentId] = (scentQty[line.scentId] ?? 0) + line.qty;
      jarQty[line.jarColor] += line.qty;
    }
    const itemsLabel = items
      .map((line) => {
        const name = SCENTS.find((s) => s.id === line.scentId)?.name ?? line.scentId;
        return `${line.jarColor}: ${name} x${line.qty}`;
      })
      .join(" | ");

    payload = {
      formType: "leimu-order",
      "Tilaaja": str(body.tilaaja),
      "Sähköposti": email,
      "Osoite": delivery === "post" ? str(body.address) : "",
      "Postinumero": delivery === "post" ? str(body.zip) : "",
      "Kaupunki": delivery === "post" ? str(body.city) : "Oulu",
      "Toimitus": delivery === "post" ? "Posti (+8 €)" : "Nouto",
      "Maksutapa": payment,
      "Kpl yhteensä": priced.totalCandles,
      "Hinta": priced.total,
      "Havu": num(scentQty["havu"]),
      "Havu-Vanilja": num(scentQty["havu-vanilja"]),
      "Vanilja": num(scentQty["vanilja"]),
      "Mustikka": num(scentQty["mustikka"]),
      "Mustikka-Vanilja": num(scentQty["mustikka-vanilja"]),
      "Valkoiset purkit": jarQty.white,
      "Vihreät purkit": jarQty.green,
      "Punaiset purkit": jarQty.red,
      "Tuotteet (erittely)": itemsLabel,
      "Viesti kuoreen": str(body.personalMessage),
      "Saapunut": Saapunut,
    };
    if (!payload["Tilaaja"] || !payload["Sähköposti"]) {
      return NextResponse.json({ ok: false, error: "Pakollisia kenttiä puuttuu." }, { status: 400 });
    }
    if (delivery === "post" && (!payload["Osoite"] || !payload["Postinumero"] || !payload["Kaupunki"])) {
      return NextResponse.json({ ok: false, error: "Pakollisia kenttiä puuttuu." }, { status: 400 });
    }
  } else {
    return NextResponse.json({ ok: false, error: "Tuntematon formType." }, { status: 400 });
  }

  let makeOk = false;
  let makeStatus = 0;
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.MAKE_API_KEY) headers["x-make-apikey"] = process.env.MAKE_API_KEY;
    const res = await fetch(makeWebhookUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    makeStatus = res.status;
    makeOk = res.ok;
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[submit] Make webhook responded", res.status, detail.slice(0, 300));
    }
  } catch (err) {
    console.error("[submit] Failed to reach Make webhook:", err);
  }

  const emailResult = await sendSubmissionEmails(payload, {
    includeCustomer: payload.formType === "leimu-order" && !makeOk,
  });
  if (emailResult.attempted && emailResult.sent < emailResult.attempted) {
    console.error("[submit] Email backup partial", emailResult);
  }

  if (makeOk || emailResult.sent > 0) {
    return NextResponse.json({ ok: true, total: orderTotal });
  }
  return NextResponse.json(
    { ok: false, error: makeStatus ? `Webhook ${makeStatus}` : "Upstream request failed." },
    { status: 502 },
  );
}
