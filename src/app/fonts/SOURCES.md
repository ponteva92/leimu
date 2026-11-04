# Self-hosted LEIMU fonts

These are the site's original three font families. `next/font/local` serves
the checked-in WOFF2 files; the production build requires no font download.
The `--font-serif`, `--font-sans`, and `--font-mono` variables, `display: swap`,
preloading and automatic fallback metric adjustment remain in `layout.tsx`.

## Sources and licenses

- **Cormorant Garamond 4.002:** the designer's official
  [CatharsisFonts/Cormorant](https://github.com/CatharsisFonts/Cormorant/tree/master/fonts/webfonts)
  WOFF2 releases, normal and true italic at 400/500/600/700. The Google Fonts
  Roman variable TTF exceeds GitHub Contents' binary-content limit, so these
  matching official static faces are used. This retains the family and all
  requested weights/styles; it does not replace them with a fallback family.
  License: [Cormorant-Garamond-OFL.txt](./Cormorant-Garamond-OFL.txt).
- **Instrument Sans:** official
  [google/fonts](https://github.com/google/fonts/tree/main/ofl/instrumentsans)
  normal/italic variable TTFs. The width axis is pinned to its original
  default, 100; weight remains variable from 400 to 700.
  License: [Instrument-Sans-OFL.txt](./Instrument-Sans-OFL.txt).
- **Space Mono:** official
  [google/fonts](https://github.com/google/fonts/tree/main/ofl/spacemono)
  regular (400) and bold (700) TTFs, as in the original layout.
  License: [Space-Mono-OFL.txt](./Space-Mono-OFL.txt).

`sources.json` records each exact upstream path, URL and Git blob SHA.
`font-manifest.json` records each resulting WOFF2 SHA-256 and byte count.
All upstream blob hashes were verified before conversion.
`source-text-coverage.json` checks the final glyph maps against source
string literals and JSX text. Every required Latin character, euro sign,
multiplication sign and left/right arrow is present in every face. The
remaining chevron and emoji use the same browser fallback as the original
upstream fonts; the box-drawing separator occurs only in a shader comment.

## Subsetting

The files retain Latin characters required for Finnish/English, combining
marks, the euro sign, nonbreaking/thin spaces, curly quotes, dashes and
common punctuation. Coverage includes ÅÄÖ/åäö. This matches the original
site's Latin-focused loading policy. Browser fallback handles characters
outside this subset.

Kerning, standard/contextual ligatures, contextual alternates, localized
forms, composition and mark positioning are retained. These include every
feature enabled by the site's `font-feature-settings` (`kern`, `liga`,
`calt`). Unused discretionary stylistic sets are omitted to avoid pulling
thousands of alternate glyphs into the Latin subset. Hinting, original
advance widths and copyright/license name records are retained.

The 12 final WOFF2 files total **416,176 bytes**. Static Cormorant faces cost
more than a single variable file, but avoid substituting the font or relying
on an unavailable download. No original multi-megabyte TTFs or encoded
transfer files are shipped.

To reproduce: download the exact sources listed in `sources.json` into a
temporary directory, install `fontTools[woff]` (conversion used fontTools
4.63.0 and Brotli), then run:

```powershell
python src/app/fonts/subset_fonts.py --source-dir C:/path/to/original-fonts
```

The script verifies Git blob hashes, constrains variable axes, subsets and
compresses to WOFF2, and checks the required Finnish/English alphabet,
numbers, euro sign and punctuation in each final file. It runs only when
deliberately regenerating fonts, never during build or in the browser.
