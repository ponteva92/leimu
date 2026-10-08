---
name: LEIMU Candles
description: Dense craft-museum for a sealed-letter candle studio in Oulu
colors:
  paper: "#F7F2EA"
  paper-2: "#EDE7DB"
  paper-3: "#E3DBCB"
  ink: "#1A1814"
  ink-soft: "#322F28"
  ink-mute: "#3A362E"
  line: "#D8D0BF"
  wax-amber: "#C47A3A"
  wax-amber-text: "#5A3512"
  foliage: "#2E3D2A"
  hero-tan: "#CBB799"
  on-dark: "#F7F2EA"
  plaque: "#1A1814"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "Space Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.16em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  gutter: "24px"
  section-tight: "48px"
  section-base: "80px"
  section-vast: "140px"
  maxw: "1200px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    padding: "12px 28px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.wax-amber-text}"
    textColor: "{colors.paper}"
  button-on-dark:
    backgroundColor: "{colors.on-dark}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "12px 28px"
  caption-plaque:
    backgroundColor: "{colors.plaque}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.sm}"
    padding: "16px 20px"
  paper-well:
    backgroundColor: "{colors.paper-2}"
    rounded: "{rounded.lg}"
    padding: "6px"
  nav-glass-paper:
    backgroundColor: "#F7F2EA8C"
  nav-glass-dark:
    backgroundColor: "#1A181473"
---

# Design System: LEIMU Candles

## 1. Overview

**Creative North Star: "The Sealed Herbarium"**

A craft-museum for five Finnish scents. Warm paper is the room; dark photography is the specimen. Cut-out botanicals sit in paper wells so the black of the photo never reads as a hole in the page. Type lives on opaque plaques. Gold appears as a wax seal and a hairline, never as a costume.

Density is curated, not cockpit: more frames and more facts per fold than an airy editorial, fewer identical cards than a template. Hero tan (#CBB799) dissolves into paper (#F7F2EA). Dark photo chapters stay dark.

**Key Characteristics:**

- Paper + dark-photo chapters, not one flat cream site
- Opaque caption plaques on every photograph that carries words
- One italic accent word per heading; roman otherwise
- Amber for seals, rules, and short words — never long text
- Rounded 8/12/16/24, pills on CTAs
- Custom flame cursor on desktop only

## 2. Colors

Warm paper, resinous ink, one wax-amber accent, foliage reserved for Havu and success.

### Primary
- **Wax amber** (#C47A3A): seals, hairline centres, filled marks, short accent words on dark. Not body text.

### Secondary
- **Foliage** (#2E3D2A): Havu wax/jar language and semantic success. Not a second UI accent.

### Neutral
- **Paper** (#F7F2EA): body ground
- **Paper 2 / 3** (#EDE7DB / #E3DBCB): wells, ledger bands
- **Ink** (#1A1814): text, plaques, primary fills
- **Ink soft / mute** (#322F28 / #3A362E): secondary text at AAA on paper
- **Hero tan** (#CBB799): home hero only; fades into paper
- **On-dark** (#F7F2EA): type on plaques and dark glass

### Named Rules
**The Plaque Rule.** Type never sits on a photograph. Mount the photo in a paper well; put the name on a solid ink or paper plaque.

**The Amber Rule.** Amber is a seal, a rule, or a single word. Long sentences stay ink (or on-dark).

**The Glass Rule.** Frosted glass only over a dark scrim (nav on the hero, scent modal). No glass cards on paper.

## 3. Typography

**Display Font:** Cormorant Garamond (Georgia)
**Body Font:** Instrument Sans (system-ui)
**Label/Mono Font:** Space Mono

**Character:** A high-contrast garamond with a true italic, set against a quiet grotesque. Mono is the studio ledger — prices, indexes, kickers — not a tech costume.

### Hierarchy
- **Display** (500, clamp 2.5–4.5rem, 1.1): page titles. One italic word. Ink, not amber.
- **Headline** (500, ~2–2.5rem): chapter titles.
- **Body** (400, 16px mobile / 17–18px desktop, 1.65, max ~65ch).
- **Label** (Space Mono, 12px, 0.16em, uppercase): the LEIMU kicker system — keep it, do not shrink below 12px, do not fade it to 55% opacity.

### Named Rules
**The One Italic Rule.** One accent word per heading. The rest is roman.

**The LEIMU Kicker Rule.** Tracked mono labels are a named brand system, not disposable eyebrows. Keep them. Make them readable.

## 4. Elevation

Tonal layering first (paper / paper-2 / ink plaques). Shadows are ink-tinted and quiet. Depth also comes from overlapping photography and the paper well around a cut-out.

### Shadow Vocabulary
- **e1** (`0 1px 2px rgba(26,24,20,0.04), 0 2px 8px rgba(26,24,20,0.05)`): rest
- **e2** (`0 2px 6px rgba(26,24,20,0.05), 0 8px 20px rgba(26,24,20,0.07)`): hover on wells
- **e4** (`0 24px 64px -20px rgba(26,24,20,0.22)`): modal / ceremonial object

### Named Rules
**The Mount Rule.** A botanical on black is a specimen. Give it a paper mount (well + ring) so the page does not look punctured.

## 5. Components

### Buttons
- **Shape:** full pill (9999px), 12px 28px, 13px tracked sans
- **Primary:** ink fill, paper type. On dark heroes: paper fill, ink type
- **Order** is the only nav CTA. Contact lives in the hero, the menu, and the footer
- **Hover / Focus:** scale ~1.03, visible 2px amber focus ring

### Caption plaque
- Solid ink (#1A1814) or solid paper. Cream or ink type at full opacity. 12px+ labels. Never `white/55`.

### Paper well
- Paper-2 tray, 6px pad, 1px line ring, inner radius 6px tighter than the shell. Holds the cut-out.

### Cards / Containers
- Do not ship three equal feature cards. Same horizontal specimen grid on home and /tuotteet: one featured plate (2 cols) + four portrait cards. Featured scent differs (home: Havu, tuotteet: Mustikka-Vanilja). Materials as an index, not icon boxes.

### Inputs / Fields
- Paper fill, field-border ≥3:1, 12px radius, 16px padding. Error in destructive brick.

### Navigation
- Hide on scroll down, show on up. Stay glassy. Force a dark glass treatment while the hero is under the bar; paper glass after scroll. Mobile: Order pill + hamburger.

### Scent modal
- Keep the dark glass panel shape. Ledger labels (Tuoksu, Materiaalit, Paloaika, Hinta) and body copy are white (`#fff`), never mute ink. Image side uses a paper plaque for the name. Fact panel is solid plaque so glass blur cannot wash the type.

### Footer
- Ceremonial colophon on ink: oversized LEIMU, wax seal, specimen still, sign-off line. Not a three-column link farm.

## 6. Do's and Don'ts

### Do:
- **Do** put every scent name on an opaque plaque or below the photo on paper.
- **Do** keep WebGL candle, still-life hero, and living portrait as the one show per page.
- **Do** keep the craft ledger facts (100% / ~36 h / 5 tuoksua).
- **Do** set prices as `9 €`.
- **Do** vary section padding (flush ledger, vast ceremony, tight index).
- **Do** keep hairline dividers that warm to amber at centre — a brand rule.
- **Do** keep GiftCeremony as a signature chapter.
- **Do** keep the custom flame cursor on fine-pointer desktop.

### Don't:
- **Don't** set cream italic on white orchids, blueberries, or any cut-out.
- **Don't** ship three equal feature cards, four equal icon columns, or a bland template grid.
- **Don't** use amber for long sentences.
- **Don't** blur type in or out; animate opacity and transform only.
- **Don't** rewrite brand claims or luxury wording (`Jokapäiväinen luksus`).
- **Don't** play audio when a modal opens.
- **Don't** put Contact in the nav bar (Order only).
- **Don't** leave duplicate `* - Copy` images in `/public`.
