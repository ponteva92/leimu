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
https://hook.eu2.make.com/5spqx7tbh2xnjujp6af9agg5dj4pohke
```

That covers the global contact modal (every page) and the `/tuotteet` order checkout.

Optional env:

```
MAKE_API_KEY=optional
DISCOUNT_CODE=LEIMU29
DISCOUNT_PERCENT=15
```

Scents live in `src/lib/scents.ts`. Display order (Mustikka first) is `featuredScents()`.
