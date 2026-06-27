# LEIMU Candles — Next.js verkkosivusto

## Projektirakenne

```
leimu-candles/
├── public/images/          ← Brändi-kuvat (kopioitu automaattisesti)
├── src/
│   ├── app/
│   │   ├── layout.tsx      ← Root layout: fontit, Navbar, Marquee, Footer
│   │   ├── globals.css     ← Kaikki design-tokenut (CSS muuttujat)
│   │   ├── page.tsx        ← Etusivu (/)
│   │   ├── HomeClient.tsx  ← Hero, Stats, Story, Featured, Kiitoskortti, Arvostelut, Benefits
│   │   ├── tuotteet/       ← /tuotteet — Tuoksuruudukko, Modal, Konfiguraattori, Kiitoskortti, Hinnoittelu
│   │   └── tarina/         ← /tarina — Perustajan tarina, Timeline, Materiaalit, Arvot
│   ├── components/
│   │   ├── CandleSVG.tsx   ← Interaktiivinen kynttilä-SVG (white | green | red)
│   │   ├── Navbar.tsx      ← Sticky nav, backdrop-blur, FI/EN toggle
│   │   ├── Marquee.tsx     ← Päättymätön marquee-teksti
│   │   └── ScentModal.tsx  ← Glassmorphism-modaali (Framer Motion)
│   ├── context/store.ts    ← Zustand store (konfiguraattori + modaali + kieli)
│   ├── lib/scents.ts       ← Kaikki 5 tuoksua + hinnoittelu
│   └── types/index.ts      ← TypeScript-tyypit
├── tailwind.config.ts      ← Tailwind + design token -värit
├── package.json
└── tsconfig.json
```

## Pika-aloitus

```bash
# 1. Asenna riippuvuudet
cd leimu-candles
npm install

# 2. Käynnistä dev-palvelin
npm run dev

# 3. Avaa selaimessa
# http://localhost:3000
```

## Deploy Verceliin

```bash
# Vaihtoehto A: Vercel CLI
npx vercel

# Vaihtoehto B: GitHub → vercel.com/new
# Push GitHubiin → Tuo projekti Vercelissä → Deploy automaattisesti
```

## Mitä sivustossa on

### Kaikki sivut
- **`/`** — Etusivu: Hero, Stats, Tarina, Featured bento-grid, Kiitoskortti, Arvostelut, Hyödyt
- **`/tuotteet`** — Tuoteruudukko, Glassmorphism-modaali, Konfiguraattori, Kiitoskortti (vahasinetti), Hinnoittelu
- **`/tarina`** — Perustajan tarina Drop Cap -efektillä, 6-vaiheen prosessijana, Materiaalit hover-animaatiolla, Arvot

### Komponentit
- **CandleSVG** — Täysin SVG-pohjainen animoitu kynttilä, 3 purkkiväriä
- **ScentModal** — Framer Motion spring-animaatio, glassmorphism
- **Konfiguraattori** — Live-esikatselu + purkin/tuoksun/viestin valinta
- **GiftCeremony** — "Sinetöity viesti": musta kiitoskortti + kultainen vahasinetti (kortti.png), parallax + kulta-shimmer

### Teknologiat
- **Next.js 14** App Router + TypeScript
- **Tailwind CSS** + custom design tokens
- **Framer Motion** animaatiot
- **Zustand** tilan hallinta
- **Google Fonts**: Cormorant Garamond + Inter + JetBrains Mono

## Muokkaa tuoksuja

Lisää tai muokkaa tuoksuja tiedostossa `src/lib/scents.ts`:

```ts
{
  id: "uusi-tuoksu",
  name: "Tuoksun Nimi",
  nameEn: "Scent Name",
  description: "Kuvaus...",
  // mapX: 0 = Raikas, 100 = Makea
  // mapY: 0 = Kevyt, 100 = Syvä
  mapX: 50,
  mapY: 50,
  jarColor: "white", // "white" | "green" | "red"
  waxColor: "#c47a3a",
  ...
}
```

## Tilausjärjestelmä

Tällä hetkellä "Tilaa tämä LEIMU" -nappi avaa alert-ikkunan. 
Integrointi Stripe / WooCommerce / omaan backendiin: muokkaa `TuotteetClient.tsx`:n `Configurator`-komponentin CTA-painikkeen `onClick`-funktio.
