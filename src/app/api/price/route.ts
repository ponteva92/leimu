import { NextRequest, NextResponse } from "next/server";
import { priceOrder } from "@/lib/scents";
import { discountFromEnv } from "@/lib/discountEnv";
import type { DeliveryMode, JarColor, OrderLineInput } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseItems(raw: unknown): OrderLineInput[] | null {
  if (!Array.isArray(raw)) return null;
  const items: OrderLineInput[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") return null;
    const r = row as Record<string, unknown>;
    const scentId = String(r.scentId ?? "");
    const jarColor = String(r.jarColor ?? "") as JarColor;
    const qty = Number(r.qty);
    items.push({ scentId, jarColor, qty });
  }
  return items;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const items = parseItems(body.items);
  if (!items) {
    return NextResponse.json({ ok: false, error: "Invalid items." }, { status: 400 });
  }
  const delivery: DeliveryMode = body.delivery === "post" ? "post" : "pickup";
  const priced = priceOrder(items, delivery, String(body.code ?? ""), discountFromEnv());
  if (!priced.ok) {
    return NextResponse.json(priced, { status: 400 });
  }
  return NextResponse.json(priced);
}
