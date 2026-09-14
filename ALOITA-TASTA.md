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

The browser posts cart lines to `/api/submit`. The server recomputes price (`calcPrice` + optional env discount + 8€ postage) and forwards to Make.com.

Required env:

```
MAKE_WEBHOOK_URL=https://hook.eu2.make.com/your-rotated-hook
MAKE_API_KEY=optional
DISCOUNT_CODE=LEIMU29
DISCOUNT_PERCENT=15
```

Rotate the Make webhook if the old URL was ever committed. The app no longer ships a fallback URL.

Scents live in `src/lib/scents.ts`. Display order (Mustikka first) is `featuredScents()`.
