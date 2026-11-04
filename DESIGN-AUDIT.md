# LEIMU design and conversion audit

Review date: 2 November 2026. Covers the homepage, products and ordering, story, navigation, dialogs, and footer.

The redesign preserves the original scene durations, candle and portrait effects, seal ceremony, Finnish/English toggle, five scents, jar options, pricing tiers, and manual payment process. Existing work in the checkout has been retained.

## Collection and message revision

The follow-up restores the original homepage hero: its copy, amber accent, contact action, order destination, wrapping and desktop proportions. The stable root size and responsive scene support remain in place.

Both scent sections now use a compact botanical cabinet. At 1440px the five scents occupy a 412px-high grid: one featured specimen beside four horizontal entries. On phones they become individual rows. Names, prices and notes sit on solid paper, outside the animated artwork. Pointer movement adds subtle specimen depth; hover, keyboard focus and touch have visible feedback. Reduced motion removes these transforms. Mobile artwork appears with the card, without requiring another scroll to uncover it.

The message heading is now “Sinetöity viesti. Sinun sanoillasi.” Three concise Finnish/English paragraphs explain the handwritten card, gold seal and optional surprise message. The homepage envelope measures approximately 616px wide at 1440px and 304px at 390px. The floating order shortcut yields to the ceremony so it cannot cover its own action. The product message panel, opening photo, craft film and gift photo share the top and foot of their paired text columns on desktop.

Current production screenshots and geometry checks are in `artifacts/redesign/collection/`; the responsive and checkout regression run is in `artifacts/redesign/revision/`. These supersede the initial redesign captures below for the changed sections.

Final revision verification: production build, lint and TypeScript pass. **124 collection checks** across seven profiles produced 44 captures; **136 responsive, checkout and resilience checks** produced 27 opening captures plus checkout states. **80 cinematic samples** across home/products at 320 × 568 and 568 × 320 passed in four cases. No failed checks or page errors. The scene run verified the same source hash before and after execution. Hover artwork and selection feedback were also inspected in the production browser.

Machine-readable revision evidence: [collection checks](artifacts/redesign/collection/report.json), [responsive and checkout checks](artifacts/redesign/revision/report.json), [scene checks](artifacts/redesign/revision-scenes/results.json). Checkout submissions were stubbed locally.

| Revised view | Screenshot |
| --- | --- |
| Original hero restored | [Desktop opening](artifacts/redesign/collection/desktop1440-home-opening.png) |
| Compact homepage collection | [Desktop collection](artifacts/redesign/collection/desktop1440-home-collection.png) |
| Revised products collection | [Desktop collection](artifacts/redesign/collection/desktop1440-products-collection.png) |
| English mobile collection | [390px collection](artifacts/redesign/collection/english390-products-collection.png) |
| Enlarged sealed message | [Desktop ceremony](artifacts/redesign/collection/desktop1440-home-message.png), [320px ceremony](artifacts/redesign/collection/mobile320-home-message.png) |
| Aligned product imagery | [Opening](artifacts/redesign/collection/desktop1440-products-opening.png), [craft film](artifacts/redesign/collection/desktop1440-products-craft-columns.png), [gift](artifacts/redesign/collection/desktop1440-products-gift-columns.png) |

## Findings and resolution

| Priority | Evidence from the original site | Customer impact | Implemented change |
| --- | --- | --- | --- |
| High | The homepage scent section started approximately 4,205px down a 732px viewport. The main order links opened the product introduction. | Visitors ready to shop had to find their way through another cinematic opening. | Direct configuration shortcuts in navigation, product hero controls, chapter links and the compact order dock. The original homepage hero actions were restored in the follow-up. The long chapters remain intact. |
| High | Payment methods and the delivery estimate appeared on the thank-you screen. | Customers confirmed before learning how to pay or when to expect delivery. | Gift inclusion, postage, delivery timing, and manual payment explained near configuration and before confirmation. |
| High | Pickup required street address, postcode, and city. | Unnecessary data entry made a local order harder to complete. | Explicit pickup/postage choices. Postal fields appear and become required only for postage. Switching methods retains draft field values. |
| High | The endpoint coerced quantities and forwarded the client price. | Invalid or inconsistent orders could reach the order system. | Strict integer and total checks, validated delivery details, shared pricing and discount rules, authoritative server price, and unchanged Make/Airtable output keys. |
| Medium | Large desktop headline wrapping crowded the fixed header. Logo sizes differed markedly between light and dark treatments. | The opening felt inconsistent and important copy could sit beneath the bar. | Stable 16px root, fitted hero composition, normalized logo, controlled typography, and visible first-render copy/actions. |
| Medium | Botanical artwork was enlarged into deep crops. | Scent cards lost detail and hid the full specimen. | Bounded artwork within paper mounts. Opaque, consistently aligned captions and clear exploration actions stay outside the animated image. |
| Medium | Ink animation began at 16% opacity; the original testimonial contrast was approximately 1.38:1. Story numerals used the divider color. | Meaningful words and numbers were difficult to read before their animation completed. | Readable 86% ink base and dark ledger numerals, with the animated emphasis retained. |
| Medium | Language-toggle accessible text did not contain its visible label. | Voice and assistive navigation could identify a different control name. | Accessible name begins with the exact visible `FI/EN` text. Scent controls use their visible content as their accessible name. |
| Medium | Refreshing emptied the cart. | Interrupted shoppers lost their selections. | Validated session restoration for cart and draft product selections. Contact details and personal messages are excluded. |
| Medium | The Instagram section relied entirely on a third-party widget. | A blocked or failed widget left an empty section. | Real studio-photo fallback, viewport-deferred script loading, native widget readiness event, timeout recovery, and reserved layout height. |
| Polish | Mobile actions, chapter navigation, and purchase details used different presentation patterns. | The journey felt less cohesive between storytelling and ordering. | Shared action styles, refined borders and paper surfaces, concise ordering feedback, consistent purchase notes, keyboard focus on each new checkout heading, and a final order chapter before the footer. |

## Visual review

Original desktop and mobile captures are stored in `artifacts/redesign/before/`. Updated captures and checkout states are in `artifacts/redesign/after/`.

| Screen | Before | After |
| --- | --- | --- |
| Desktop home | [Original](artifacts/redesign/before/desktop1440-home.png) | [Redesigned](artifacts/redesign/after/desktop1440-home.png) |
| Desktop products | [Original](artifacts/redesign/before/desktop1440-tuotteet.png) | [Redesigned](artifacts/redesign/after/desktop1440-tuotteet.png) |
| Desktop story | [Original](artifacts/redesign/before/desktop1440-tarina.png) | [Redesigned](artifacts/redesign/after/desktop1440-tarina.png) |
| Mobile home | [Original](artifacts/redesign/before/mobile390-home.png) | [Redesigned](artifacts/redesign/after/mobile390-home.png) |
| Mobile products | [Original](artifacts/redesign/before/mobile390-tuotteet.png) | [Redesigned](artifacts/redesign/after/mobile390-tuotteet.png) |
| Mobile story | [Original](artifacts/redesign/before/mobile390-tarina.png) | [Redesigned](artifacts/redesign/after/mobile390-tarina.png) |
| Short landscape products | — | [568 × 320](artifacts/redesign/after/landscape568-tuotteet.png) |
| Failed order recovery | — | [Retained order and retry](artifacts/redesign/after/mobile390-checkout-recovery.png) |
| Confirmation | — | [Successful order](artifacts/redesign/after/mobile390-confirmation.png) |

## Verification

- **Production build:** Next.js build, lint, and TypeScript checks pass. No dependency or framework changes.
- **52 focused checks:** Existing bundle prices through seven candles, discount rounding, postage, strict quantities, totals, postal details, corrupted sessions, private-data exclusion, canonical prices, Make field compatibility, contact submissions, and upstream failures. Upstream requests were stubbed.
- **145 browser checks:** 27 captures across 1440 × 900, 390 × 844, 320 × 568, 768 × 1024, 844 × 390, and 568 × 320; additional English, reduced-motion, and enlarged-text profiles. Includes direct configuration landing, cart restoration, delivery switching, handwritten message, discounts, privacy dialog focus, failed order recovery, duplicate-click prevention, and confirmation landing without a chapter-navigation overlap.
- **128 cinematic samples:** Eight positions in each visible scene, across all three pages at 320 × 568 and 568 × 320. Checks sticky positioning, readable text boundaries, chapter controls, scent captions, contact fields, video controls, and locally stubbed checkout. Six cases, no failures.
- **Resilience:** Missing WebGL, unavailable session storage, blocked Instagram, successful Instagram readiness, and essential opening copy without JavaScript.
- **Keyboard:** Menu Escape, dialog Escape and focus return, and checkout heading focus. Docks are hidden while menus/dialogs are open.

Machine-readable evidence: [browser checks](artifacts/redesign/after/report.json), [cinematic checks](artifacts/redesign/scenes/results.json).

### Performance and accessibility

The original desktop Lighthouse accessibility snapshot scored 96. The original local mobile production trace recorded 0.46s LCP and 0.00 CLS. A redesigned local production trace recorded 0.60s LCP and 0.00 CLS. These are individual unthrottled lab observations, not a measured speed improvement or real-user percentiles.

A cold mobile run with Fast 4G network emulation and 4× CPU slowdown recorded **2.295s LCP and 0.00 CLS**. Sampled language-switch click timings without CPU throttling were **80ms and 72ms**. Under 4× slowdown, language switching took 400–728ms and menu interactions took 72–128ms; the page-wide language update is the remaining interaction-cost hotspot on slower hardware. These interaction samples are not a field INP measurement.

Production first-load JavaScript is approximately 177kB on home, 168kB on story, and 184kB on products, compared with approximately 176/168/182kB before the redesign. Instagram no longer loads during the initial page view.

Initial redesign Lighthouse snapshots scored **100 accessibility, 100 best practices, and 100 SEO on all three pages**: [home](artifacts/redesign/lighthouse-home.html), [products](artifacts/redesign/lighthouse-products.html), [story](artifacts/redesign/lighthouse-story.html). Those snapshots predate the requested hero restoration and collection revision.

The collection's ink text on solid paper and the message's light text on dark backgrounds follow the project's contrast targets. The original hero's amber accent and scrim are restored as requested; the original low-contrast accent remains an exception to those targets. Automated checks complement visual and keyboard inspection; they do not establish full WCAG conformance.

Testing used Chromium desktop and mobile emulation. Physical iOS/Android browsers and production field performance have not been measured. INP requires interaction/field measurement; no field INP result is claimed. No live test orders or messages were sent.

## Reproduce

Start the local production preview with `npm run build` and `npm run start -- -p 3001`. Then run:

```powershell
node scripts/order-check.cjs
node scripts/redesign-check.cjs
node scripts/collection-check.cjs
$env:PARITY_PRODUCTION = '1'
$env:PARITY_PROFILES = 'mobile320,landscape568'
$env:PARITY_OUTPUT = 'artifacts/redesign/scenes'
node scripts/mobile-parity-check.cjs
```

The browser scripts use installed Playwright or the existing bundled runtime. Their order submissions are intercepted locally. Generated screenshots/reports are ignored by Git; source checks and this report remain reviewable.

## Measurement after launch

Use received orders as the primary outcome and orders with handwritten messages as a secondary measure. Compare equivalent periods using the existing order records. No conversion uplift is claimed without traffic and order data.

References: [W3C enhanced contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html), [Core Web Vitals](https://web.dev/articles/vitals), [Behold's official readiness event](https://github.com/BeholdSocial/behold-react/blob/main/src/index.tsx).
