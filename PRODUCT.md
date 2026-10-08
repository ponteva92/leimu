# Product

## Register

brand

## Users

Someone at a kitchen table in Oulu after work: lamp on, wrapping paper on the wood, one candle already lit so the gold seal can be seen. Phone in the other hand. They are choosing a gift that has to arrive like a letter, not a SKU — for a sister, a colleague, or themselves.

They are buying on a phone as often as a laptop. They need to read every scent name, every price, and every material fact without hunting for contrast.

## Product Purpose

LEIMU is a small-batch soy-wax candle studio in Oulu. The site has three jobs:

- **Home = desire.** Make the sealed letter, the forest scents, and the handmade jar feel inevitable.
- **Tuotteet = buy.** Configure jar, scent, message, and send the order.
- **Tarina = proof.** Shane made this, one jar at a time, from named materials, in a real studio.

Success is an order with a handwritten message — and a visitor who can read every word on every photograph.

## Brand Personality

**Resinous, handwritten, ceremonial.**

A dense craft-museum, not a spa catalogue. Warm paper chapters and dark photo chapters. Wax, gold seal, forest botanicals, one jar at a time.

Voice lines that already belong to the brand (do not invent softer substitutes):

- Omalla viestillä varustettu, käsinkirjoitettu kirje joka suljetaan kultaisella vahasinetillä
- Jokainen kynttilä valmistettu käsityönä yksikerrallaan
- Valitse tuoksu, Valitse purkki, Valitse LEIMU
- Tarjoan valikoidut, laadukkaat raaka-aineet
- Pala luksusta jonka olet ansainnut
- Kynttilät jotka tuoksuvat Suomelta

## Anti-references

- Bland “basic” template look
- Three equal feature cards
- Spa-beige Playfair+Inter luxury
- Purple glassmorphism
- Gold-serif-on-navy costume museum
- Cream italic sitting on white orchid petals
- Anything that reads as AI slop: identical icon columns, tiny tracked eyebrows as section grammar, blur-to-clear as a personality, gradient text

## Design Principles

1. **Type never sits on pixels.** Names, prices, and captions live on an opaque plaque, a paper well, or a solid field. Photography is mounted; it is not a background for letters.
2. **Show the object.** Wax seal, botanical cut-out, milk-glass jar, handwritten card. Frames and density come from the studio, not from UI chrome.
3. **One show per page.** Home: the WebGL candle. Tuotteet: the still-life hero. Tarina: the living portrait. Everything else is quieter.
4. **Facts stay facts.** 100% soy, ~36 h, five scents, shea ~10%, cotton wick, bamboo lid, 9 €. Do not rewrite brand claims; only typeset them so they read.
5. **Ceremonial, still down to earth.** Majestic headings, one italic word, paper and ink — not costume gold.

## Accessibility & Inclusion

- **WCAG AAA** for text contrast (7:1 body, 4.5:1 large).
- Visible `:focus-visible`, skip link, 44px targets on primary controls.
- Custom flame cursor on fine-pointer desktop only; system cursor elsewhere and when `prefers-reduced-motion`.
- Motion is opacity and transform only. Existing reduced-motion paths stay; do not ship a second stripped layout.
- Finnish default, English toggle in client state (not routed).
- No audio on modal open.
- Prices as `9 €` (narrow no-break space before the euro).
