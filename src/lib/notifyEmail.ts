import { CONTACTS } from "./contacts";

/** Live Make.com scenario that receives every LEIMU contact + order form. */
export const DEFAULT_MAKE_WEBHOOK =
  "https://hook.eu2.make.com/iu9qhalsmhgi5ymkcivgwu0u4jw22qpq";

export const LEIMU_INBOX = CONTACTS.email;

export function makeWebhookUrl(): string {
  // Always use the live hook. Vercel production still has MAKE_WEBHOOK_URL set to
  // an older URL from 4a6de4e; honoring that env would skip the listening scenario.
  return DEFAULT_MAKE_WEBHOOK;
}

export type SubmissionPayload = Record<string, unknown>;

export type OutboundEmail = {
  to: string;
  subject: string;
  text: string;
};

export type EmailPlan = {
  leimu: OutboundEmail;
  customer: OutboundEmail | null;
};

const str = (payload: SubmissionPayload, key: string) => String(payload[key] ?? "").trim();

function lines(rows: Array<[string, string]>): string {
  return rows
    .filter(([, v]) => v.length > 0)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

export function emailPlan(payload: SubmissionPayload): EmailPlan | null {
  const formType = str(payload, "formType");
  if (formType === "leimu-contact") {
    const aihe = str(payload, "Aihe") || "Ei aihetta";
    return {
      leimu: {
        to: LEIMU_INBOX,
        subject: `LEIMU-yhteydenotto: ${aihe}`,
        text: [
          "Uusi yhteydenotto leimucandles.fi-sivustolta.",
          "",
          lines([
            ["Nimi", str(payload, "Nimi")],
            ["Sähköposti", str(payload, "Sähköposti")],
            ["Aihe", str(payload, "Aihe")],
            ["Viesti", str(payload, "Viesti")],
            ["Saapunut", str(payload, "Saapunut")],
          ]),
        ].join("\n"),
      },
      customer: null,
    };
  }
  if (formType === "leimu-order") {
    const tilaaja = str(payload, "Tilaaja") || "Tilaus";
    const customerTo = str(payload, "Sähköposti");
    const summary = lines([
      ["Tilaaja", tilaaja],
      ["Sähköposti", customerTo],
      ["Toimitus", str(payload, "Toimitus")],
      ["Osoite", str(payload, "Osoite")],
      ["Postinumero", str(payload, "Postinumero")],
      ["Kaupunki", str(payload, "Kaupunki")],
      ["Maksutapa", str(payload, "Maksutapa")],
      ["Kpl yhteensä", str(payload, "Kpl yhteensä")],
      ["Hinta", str(payload, "Hinta") ? `${str(payload, "Hinta")}€` : ""],
      ["Tuotteet", str(payload, "Tuotteet (erittely)")],
      ["Viesti kuoreen", str(payload, "Viesti kuoreen")],
      ["Saapunut", str(payload, "Saapunut")],
    ]);
    return {
      leimu: {
        to: LEIMU_INBOX,
        subject: `LEIMU-tilaus: ${tilaaja}`,
        text: ["Uusi tilaus leimucandles.fi-sivustolta.", "", summary].join("\n"),
      },
      customer: customerTo
        ? {
            to: customerTo,
            subject: "Tilausvahvistus LEIMU Candles",
            text: [
              `Hei ${tilaaja},`,
              "",
              "Kiitos paljon tilauksestasi – arvostamme sitä suuresti! Tässä on vahvistus tilauksesi tiedoista:",
              "",
              summary,
              "",
              `Jos jokin yllä olevista tiedoista kaipaa korjausta tai haluat lisätä jotakin, voit lähettää sähköpostia osoitteeseen: ${LEIMU_INBOX}.`,
              "",
              "Lämpimin terveisin,",
              "LEIMU Candles",
            ].join("\n"),
          }
        : null,
    };
  }
  return null;
}

export function hasEmailTransport(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() || process.env.GMAIL_APP_PASSWORD?.trim());
}

async function deliver(email: OutboundEmail): Promise<boolean> {
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
        to: [email.to],
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
      to: email.to,
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
 * Customer order mail is only sent when `includeCustomer` is true (Make failed),
 * so we do not double-send the Make.com tilausvahvistus.
 */
export async function sendSubmissionEmails(
  payload: SubmissionPayload,
  opts: { includeCustomer: boolean },
): Promise<EmailSendResult> {
  const plan = emailPlan(payload);
  if (!plan || !hasEmailTransport()) return { attempted: 0, sent: 0 };

  const queue: OutboundEmail[] = [plan.leimu];
  if (opts.includeCustomer && plan.customer) queue.push(plan.customer);

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
