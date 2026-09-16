# LEIMU Candles — Next.js site

Handmade soy-wax candles from Oulu. App Router, TypeScript, Tailwind.

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Pages

- `/` — Home: WebGL hero, stats, story, horizontal scent row, gift card, reviews, Instagram, materials
- `/tuotteet` — Horizontal scent row, configurator, checkout (pickup vs post, payment on summary)
- `/tarina` — Founder story, process, materials, values

## Orders

The browser posts contact and order forms to `/api/submit`. The server recomputes price (`calcPrice` + optional env discount + 8€ postage) and forwards every submission to Make.com:

```
https://hook.eu2.make.com/iu9qhalsmhgi5ymkcivgwu0u4jw22qpq
```

`formType` is `leimu-contact` (global contact modal) or `leimu-order` (`/tuotteet` checkout). Make.com sends mail: order confirmation to the customer, and notifications to `leimucandles@gmail.com`. If the webhook fails, `/api/submit` can also send mail via Resend or Gmail SMTP when those env vars are set.

Optional env:

```
MAKE_WEBHOOK_URL=https://hook.eu2.make.com/iu9qhalsmhgi5ymkcivgwu0u4jw22qpq
MAKE_API_KEY=optional
RESEND_API_KEY=optional
GMAIL_APP_PASSWORD=optional
DISCOUNT_CODE=LEIMU29
DISCOUNT_PERCENT=15
```

Scents live in `src/lib/scents.ts`. Display order (Mustikka first) is `featuredScents()`.
