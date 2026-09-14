import type { DeliveryMode, OrderLineInput, PaymentMethod, PriceOk } from "@/types";

export type ContactSubmission = {
  formType: "leimu-contact";
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
};

export type OrderSubmission = {
  formType: "leimu-order";
  tilaaja: string;
  email: string;
  address: string;
  zip: string;
  city: string;
  delivery: DeliveryMode;
  items: OrderLineInput[];
  personalMessage: string;
  paymentMethod: PaymentMethod;
  code?: string;
  website?: string;
};

export type PricePreview = {
  items: OrderLineInput[];
  delivery: DeliveryMode;
  code?: string;
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data: { error?: string } & Partial<T> = {};
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    throw new Error(data.error || `Submit failed (${res.status})`);
  }
  return data as T;
}

export async function submitForm(
  payload: ContactSubmission | OrderSubmission,
): Promise<{ ok: true; total?: number }> {
  return postJson("/api/submit", payload);
}

export async function previewPrice(payload: PricePreview): Promise<PriceOk> {
  return postJson("/api/price", payload);
}
