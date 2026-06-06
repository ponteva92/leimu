/* ════════════════════════════════════════════════════════════════════════
   LEIMU — client-side form submitter
   ------------------------------------------------------------------------
   Posts clean semantic data to our own /api/submit endpoint (a Next.js Route
   Handler that runs as a Netlify Function). That endpoint builds the exact
   Make.com payload and forwards it to the server-only webhook — so the webhook
   URL is never exposed to the browser and there are no CORS issues.

   Numeric order fields are sent as real numbers (not strings) so Airtable
   accepts them; the server coerces them again as a safety net.
   ════════════════════════════════════════════════════════════════════════ */

export type ContactSubmission = {
  formType: "leimu-contact";
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type OrderSubmission = {
  formType: "leimu-order";
  tilaaja: string;
  email: string;
  address: string;
  zip: string;
  city: string;
  delivery: string;
  totalCandles: number;
  price: number;
  havu: number;
  havuVanilja: number;
  vanilja: number;
  mustikka: number;
  mustikkaVanilja: number;
  white: number;
  green: number;
  red: number;
  items: string;
  personalMessage: string;
};

export async function submitForm(payload: ContactSubmission | OrderSubmission): Promise<void> {
  const res = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = ((await res.json()) as { error?: string })?.error ?? "";
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new Error(`Submit failed (${res.status})${detail ? `: ${detail}` : ""}`);
  }
}
