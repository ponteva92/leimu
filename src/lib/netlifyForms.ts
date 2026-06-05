/**
 * Submit a form to Netlify Forms via AJAX.
 *
 * Netlify detects the forms at deploy time from the static markup in
 * `public/__forms.html`, then captures any POST whose `form-name` matches one
 * of them. Submissions appear in the Netlify dashboard (Site → Forms) and can
 * trigger email notifications — no third-party webhook, no CORS, no 401.
 *
 * IMPORTANT: Netlify Forms only works on the deployed Netlify site. On
 * localhost there is no Netlify backend to receive the POST, so we short-
 * circuit in dev (resolve after a short delay) — this lets the form UX be
 * tested locally without a confusing network error. Real submissions happen
 * only on the deployed site.
 */
export async function submitNetlifyForm(
  formName: string,
  data: Record<string, string>,
): Promise<void> {
  const body = new URLSearchParams({ "form-name": formName, ...data }).toString();

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") {
      // Dev: no Netlify backend here — mimic latency so the success UI still shows.
      // eslint-disable-next-line no-console
      console.info(`[netlify-forms] dev mode — "${formName}" not sent locally:`, data);
      await new Promise((r) => setTimeout(r, 600));
      return;
    }
  }

  const res = await fetch("/__forms.html", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Netlify Forms responded ${res.status}`);
}
