# Reading Theme

The tracked source of the blog UI lives here. The `theme` directory is an upstream
submodule; do not commit local overrides there or rely on its dirty working copy.

## Build

```sh
node scripts/apply-theme.mjs
forester build forest.toml
node scripts/check-reading-ui.mjs
```

GitHub Pages uses the same application step. CSS and JS are copied as theme files,
not ordinary Forester assets (unreferenced assets are not emitted by this version).
The query version on both resource URLs in `tree.xsl` must change when publishing
later visual revisions, so cached styles do not conceal updates.

## Design

- The site name is 數林廣記; its author entry is 依然范德彪.
- `shulin-mark.svg` is the shared header mark and favicon: a blue-green square
  seal with two trees above an open-book contour. Its vector paths need no font
  or remote image service. The adjacent traditional-Chinese wordmark uses Songti.
- White reading surface, generous margins, blue links, quiet metadata.
- Chinese serif headings and sans-serif text; Latin Inria Sans is self-hosted by
  the upstream theme. No external font or analytics requests are added.
- Definitions, conventions and constructions: pale ivory with an ochre rule.
- Theorems, propositions, lemmas and corollaries: pale blue with a blue rule.
- Proofs: unfilled. Keep written taxon labels, not color alone, to identify types.
- Outlines are flat lists, the subject index is a two-column directory on desktop.
- Backlinks and related notes remain complete, with clickable titles and subdued
  dates. There is no duplicate hand-written related section.
- Long displays scroll locally; Sterling SVGs retain their aspect ratios.
- Native disclosure controls, visible keyboard focus, a skip link, reduced-motion
  support and a mobile collapsible table of contents remain available.

`tree.xsl` controls semantic markup and Chinese UI labels; `reading.css` is layered
after upstream CSS; `reading.js` adds search and accessible TOC navigation. Keep
mathematical text, stable note IDs and prerequisite dependencies outside UI changes.

## Browser Regression

Run a local server for `output/` on port 8083. With Playwright installed outside
the repository, set `PLAYWRIGHT_MODULE` to its absolute `index.mjs` path and run
`node scripts/check-reading-ui.mjs`. Optionally set `BROWSER_EXECUTABLE` to an
installed Chromium executable and `PREVIEW_URL` to another local base URL.

This tests six representative pages at 1440, 390 and 320 pixels: horizontal
overflow, resource loading, math, SVGs, search, keyboard shortcut, disclosure and
related links. It also saves screenshots in a temporary directory for visual review.
An isolated XML fixture checks nested statement styling, long equations, mobile
TOC collapse and keyboard navigation into a closed proof; it is never built into
the public forest. Static transformation tests require `xsltproc` (installed in CI).
