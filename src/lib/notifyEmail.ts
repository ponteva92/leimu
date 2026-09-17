import { CONTACTS } from "./contacts";

/** Live Make.com scenario that receives every LEIMU contact + order form. */
export const DEFAULT_MAKE_WEBHOOK =
  "https://hook.eu2.make.com/iu9qhalsmhgi5ymkcivgwu0u4jw22qpq";

export const LEIMU_INBOX = CONTACTS.email;
export const SHOP_OWNER_EMAIL = "heikki.niemimaki@gmail.com";

/** Same To list Make/Outlook used for shop order notices (owner first). */
export const SHOP_NOTIFY_EMAILS = [SHOP_OWNER_EMAIL, LEIMU_INBOX] as const;

/** Same To list Make/Outlook used for contact notices (LEIMU first). */
export const CONTACT_NOTIFY_EMAILS = [LEIMU_INBOX, SHOP_OWNER_EMAIL] as const;

export const AIRTABLE_BASE_ID = "appAfcOd4tYQYsH6G";
export const AIRTABLE_ORDERS_TABLE_ID = "tbl8YDbIST3cTK4TO";

export function makeWebhookUrl(): string {
  // Always use the live hook. Vercel production still has MAKE_WEBHOOK_URL set to
  // an older URL from 4a6de4e; honoring that env would skip the listening scenario.
  return DEFAULT_MAKE_WEBHOOK;
}

export type SubmissionPayload = Record<string, unknown>;

export type OutboundEmail = {
  to: string | string[];
  subject: string;
  text: string;
};

export type EmailPlan = {
  leimu: OutboundEmail;
  customer: OutboundEmail | null;
};

const str = (payload: SubmissionPayload, key: string) => String(payload[key] ?? "").trim();

function kpl(payload: SubmissionPayload): string {
  const raw = payload["Kpl yhteensä"];
  const n = typeof raw === "number" ? raw : parseFloat(String(raw ?? "").replace(",", "."));
  if (Number.isFinite(n)) return `${n} kpl`;
  const fallback = str(payload, "Kpl yhteensä");
  return fallback ? `${fallback} kpl` : "";
}

function euro(payload: SubmissionPayload): string {
  const raw = payload["Hinta"];
  const n = typeof raw === "number" ? raw : parseFloat(String(raw ?? "").replace(",", "."));
  if (Number.isFinite(n)) return `${n}€`;
  const fallback = str(payload, "Hinta");
  return fallback ? `${fallback}€` : "";
}

/**
 * Make/Outlook customer template:
 * pickup → `, Oulu`
 * post   → `Testikatu 1, 90100 Oulu`
 */
export function formatDeliveryAddress(payload: SubmissionPayload): string {
  const address = str(payload, "Osoite");
  const zip = str(payload, "Postinumero");
  const city = str(payload, "Kaupunki") || "Oulu";
  if (address && zip) return `${address}, ${zip} ${city}`;
  if (address) return `${address}, ${city}`;
  return `, ${city}`;
}

export function customerOrderSubject(recordId?: string): string {
  return recordId
    ? `Tilausvahvistus LEIMU Candles, ${recordId}`
    : "Tilausvahvistus LEIMU Candles";
}

function customerOrderBody(payload: SubmissionPayload): string {
  const tilaaja = str(payload, "Tilaaja");
  return [
    `Hei ${tilaaja},`,
    "",
    "Kiitos paljon tilauksestasi – arvostamme sitä suuresti! Tässä on vahvistus tilauksesi tiedoista:",
    "",
    "Toimitustiedot:",
    `Nimi: ${tilaaja}`,
    `Sähköposti: ${str(payload, "Sähköposti")}`,
    `Toimitusosoite: ${formatDeliveryAddress(payload)}`,
    `Toimitustapa: ${str(payload, "Toimitus")}`,
    "",
    "Tilauksen yhteenveto:",
    `Kynttilöitä yhteensä: ${kpl(payload)}`,
    `Yhteishinta: ${euro(payload)}`,
    "",
    "Tilauksen erittely:",
    str(payload, "Tuotteet (erittely)"),
    "",
    "Personoidut viestit:",
    str(payload, "Viesti kuoreen"),
    "",
    `Jos jokin yllä olevista tiedoista kaipaa korjausta tai haluat lisätä jotakin, voit lähettää sähköpostia osoitteeseen: ${LEIMU_INBOX}.`,
    "",
    "Lämpimin terveisin,",
    "LEIMU Candles",
  ].join("\n");
}

function labeled(label: string, value: string): string {
  return value ? `${label}: ${value}` : `${label}:`;
}

function shopOrderBody(payload: SubmissionPayload): string {
  return [
    "Uusi tilaus vastaanotettu. Tässä tilauksen tiedot jäsenneltynä:",
    "",
    "Tilaajan tiedot:",
    labeled("Nimi", str(payload, "Tilaaja")),
    labeled("Sähköposti", str(payload, "Sähköposti")),
    labeled("Osoite", str(payload, "Osoite")),
    labeled("Postinumero", str(payload, "Postinumero")),
    labeled("Kaupunki", str(payload, "Kaupunki")),
    "",
    "Tilauksen tiedot:",
    labeled("Toimitus", str(payload, "Toimitus")),
    labeled("Kynttilöitä yhteensä", kpl(payload)),
    labeled("Hinta", euro(payload)),
    "",
    "Erittely:",
    str(payload, "Tuotteet (erittely)"),
    "",
    "Personoidut viestit:",
    str(payload, "Viesti kuoreen"),
  ].join("\n");
}

function contactBody(payload: SubmissionPayload): string {
  const nimi = str(payload, "Nimi");
  const aihe = str(payload, "Aihe");
  return [
    "Hei!",
    "",
    `${nimi} on lähettänyt sinulle yhteydenottopyynnön ${str(payload, "Saapunut")}!`,
    "",
    aihe ? `Aihe: : ${aihe}` : "Aihe: :",
    labeled("Viesti", str(payload, "Viesti")),
    labeled("Lähettäjä", nimi),
    labeled("Sähköposti", str(payload, "Sähköposti")),
  ].join("\n");
}

export type EmailPlanOptions = {
  /** Airtable record id Make/Outlook appended after creating the Tilaukset row. */
  recordId?: string;
};

export function emailPlan(
  payload: SubmissionPayload,
  opts?: EmailPlanOptions,
): EmailPlan | null {
  const formType = str(payload, "formType");
  if (formType === "leimu-contact") {
    return {
      leimu: {
        to: [...CONTACT_NOTIFY_EMAILS],
        subject: "Uusi yhteydenottopyyntö!",
        text: contactBody(payload),
      },
      customer: null,
    };
  }
  if (formType === "leimu-order") {
    const customerTo = str(payload, "Sähköposti");
    const tilaaja = str(payload, "Tilaaja") || "Tilaus";
    return {
      leimu: {
        to: [...SHOP_NOTIFY_EMAILS],
        subject: `Uusi tilaus vastaanotettu asiakkalta ${tilaaja}`,
        text: shopOrderBody(payload),
      },
      customer: customerTo
        ? {
            to: customerTo,
            subject: customerOrderSubject(opts?.recordId),
            text: customerOrderBody(payload),
          }
        : null,
    };
  }
  return null;
}

export function hasEmailTransport(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() || process.env.GMAIL_APP_PASSWORD?.trim());
}

/**
 * Outlook/Make mail is on a daily cap (ErrorExceededMessageLimit). The site is
 * the mailer: LEIMU always, customer only for orders. Make is Airtable only.
 */
export function shouldEmailCustomer(payload: SubmissionPayload): boolean {
  return str(payload, "formType") === "leimu-order";
}

function airtableToken(): string {
  return (
    process.env.AIRTABLE_PAT?.trim() ||
    process.env.AIRTABLE_API_KEY?.trim() ||
    process.env.AIRTABLE_TOKEN?.trim() ||
    ""
  );
}

function formulaString(value: string): string {
  return `'${value.replace(/'/g, "\\'")}'`;
}

/**
 * Make appends the Airtable row id to the customer subject. After the webhook
 * returns we look up the newest matching Tilaukset row when a PAT is set.
 */
export async function lookupAirtableOrderId(
  payload: SubmissionPayload,
): Promise<string | undefined> {
  const token = airtableToken();
  if (!token) return undefined;
  const email = str(payload, "Sähköposti");
  const tilaaja = str(payload, "Tilaaja");
  if (!email) return undefined;

  const formula = tilaaja
    ? `AND({Sähköposti}=${formulaString(email)},{Tilaaja}=${formulaString(tilaaja)})`
    : `{Sähköposti}=${formulaString(email)}`;
  const params = new URLSearchParams({
    filterByFormula: formula,
    maxRecords: "1",
    "sort[0][field]": "Saapunut",
    "sort[0][direction]": "desc",
  });
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_ORDERS_TABLE_ID}?${params}`;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        console.error("[email] Airtable lookup", res.status, detail.slice(0, 200));
        return undefined;
      }
      const data = (await res.json()) as { records?: Array<{ id?: string }> };
      const id = data.records?.[0]?.id;
      if (id) return id;
    } catch (err) {
      console.error("[email] Airtable lookup failed", err);
      return undefined;
    }
  }
  return undefined;
}

function toList(to: string | string[]): string[] {
  return (Array.isArray(to) ? to : [to]).map((addr) => addr.trim()).filter(Boolean);
}

async function deliver(email: OutboundEmail): Promise<boolean> {
  const recipients = toList(email.to);
  if (!recipients.length) return false;

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    const from =
      process.env.EMAIL_FROM?.trim() || "LEIMU Candles <noreply@leimucandles.fi>";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject: email.subject,
        text: email.text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[email] Resend responded", res.status, detail.slice(0, 300));
      return false;
    }
    return true;
  }

  const appPassword = process.env.GMAIL_APP_PASSWORD?.trim();
  if (appPassword) {
    const user = process.env.GMAIL_SMTP_USER?.trim() || LEIMU_INBOX;
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass: appPassword },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_FROM?.trim() || `LEIMU Candles <${user}>`,
      to: recipients.join(", "),
      subject: email.subject,
      text: email.text,
    });
    return true;
  }

  return false;
}

export type EmailSendResult = { attempted: number; sent: number };

/**
 * Sends LEIMU a copy of every submission when a transport is configured.
 * Customer mail is sent for orders (Make/Outlook is quota-blocked and a 200
 * webhook does not mean the Outlook step succeeded).
 */
export async function sendSubmissionEmails(
  payload: SubmissionPayload,
  opts?: { includeCustomer?: boolean; recordId?: string },
): Promise<EmailSendResult> {
  if (!hasEmailTransport()) return { attempted: 0, sent: 0 };

  const includeCustomer = opts?.includeCustomer ?? shouldEmailCustomer(payload);
  let recordId = opts?.recordId;
  if (!recordId && includeCustomer && str(payload, "formType") === "leimu-order") {
    recordId = await lookupAirtableOrderId(payload);
  }

  const plan = emailPlan(payload, { recordId });
  if (!plan) return { attempted: 0, sent: 0 };

  const queue: OutboundEmail[] = [plan.leimu];
  if (includeCustomer && plan.customer) queue.push(plan.customer);

  let sent = 0;
  for (const email of queue) {
    try {
      if (await deliver(email)) sent += 1;
    } catch (err) {
      console.error("[email] Failed to send", email.subject, err);
    }
  }
  return { attempted: queue.length, sent };
}
