# khagwal.com → Next.js port

A 1:1 port of the original static site (`khagwal.com.zip`) to Next.js 15 (App
Router) + React 19 + TypeScript. **No design, content, markup or CSS changes.**

The original CSS, JS, fonts, videos and favicons are served byte-for-byte from
`public/`; the markup was converted to JSX mechanically by a script, not by
hand, so nothing can drift.

## Run

```bash
npm install
npm run build && npm run start   # http://localhost:3000
npm run dev                      # dev server
```

## Checks

```bash
npm run verify   # diffs the rendered DOM against the original index.html
npm run smoke    # runs the original main.js against both DOMs in jsdom
npm run port     # regenerates app/layout.tsx + app/page.tsx from the original
```

Current results: `<head>` — all 38 nodes present and identical; `<body>` —
identical DOM tree, 339 nodes, order included; `main.js` executes against the
ported DOM and finds every element it queries.

## Layout

| Path | What it is |
| --- | --- |
| `tools/original-index.html` | the original file, kept as the source of truth |
| `tools/html-to-jsx.mjs` | parses it with parse5 and emits JSX verbatim |
| `tools/assemble.mjs` | writes `app/layout.tsx` and `app/page.tsx` |
| `tools/verify.mjs` / `tools/smoke.mjs` | the checks above |
| `app/scripts.tsx` | the two closing `<script src>` tags |
| `public/dist`, `public/live`, `public/static`, `public/cdn-cgi` | original assets, unmodified |

`app/layout.tsx` and `app/page.tsx` are generated — edit the original HTML and
re-run `npm run port` rather than editing them directly.

## Framework-level differences

Nothing in the document was changed. These are the only deltas, all forced by
Next.js/React and none of them visible:

1. **Head tag order** — React hoists `<meta>`/`<link>`/`<title>` into `<head>`
   itself, so their order differs from the source. All 38 nodes are present
   with identical attributes and content.
2. **Duplicate `charset`/`viewport`** — Next always emits its own
   `<meta charSet="utf-8">` and a default viewport tag alongside the
   original ones. Same values, harmless.
3. **`precedence` on `<style>`/`<link rel=stylesheet>`** — required for React
   to keep them in the head instead of flushing them into the body. Adds a
   `data-precedence` attribute to the tag.
4. **`defer` on the two closing scripts** — they are served from `/public`, so
   their `src` gains a leading slash, and `defer` preserves the end-of-body
   execution timing they relied on.
5. **`/index.html` rewrite** — the markup links to `index.html` (canonical, the
   skip link, nav "Home"). `next.config.ts` rewrites that path to `/` so those
   links keep working without editing the markup.
6. **Content-Type header for `dist/main.js@v1.0.2`** — the file has no `.js`
   extension, so it would be served as `application/octet-stream` and refused
   by the browser. Set in `next.config.ts`.
7. Next's own runtime `<script>`/preload tags are added to the page.

## The footer is not a port

Everything on the page is generated verbatim from `tools/original-index.html`
except the `<footer>`, which the user asked to redesign. The generator swaps
the original footer for `app/footer.tsx`; the original markup is kept at
`tools/generated-footer-original.jsx.txt` and can be restored by deleting the
`__FOOTER__` branch in `tools/html-to-jsx.mjs`.

It also drops the single `<hr>` that sat directly above the footer, since the
panel is now full bleed. That is the only element removed from the page;
`npm run verify` accounts for it and the body is otherwise identical.

On the user's instruction the footer's link set changed: the six social links
were dropped and replaced by About and Works. **Those two have no destination
yet** — the original site has no such pages, so they are `href="#"` until real
URLs are supplied. The copyright is now just the mark and an auto-updating
year. The Cloudflare-obfuscated email markup is unchanged byte-for-byte, so the
decode script still resolves it to hey@khagwal.com. `npm run verify` checks
those seven items and compares the rest of the page as before.

It adds two display faces under `public/live/font/`, both cut and subset by
`tools/measure-headline.py` to only the glyphs the headline draws: Inter pinned
to opsz 32 / wght 500 for "Let’s" (1 KB, down from a 116 KB variable font) and
ITC Garamond Std Light Narrow for "talk" (1.5 KB, converted from the OTF the
user supplied in `footer fonts.zip` on `main`). The same script prints the ink
metrics the SVG headline needs; re-run it if the copy or the fonts change. Note
that it subsets the Garamond in place, so restore it from `main` first.

## Overrides on ported elements

`app/overrides.css` is the one place where the port's own elements get
restyled, kept separate so `public/dist/main.css@v1.0.10.css` stays a verbatim
copy. It currently holds a single rule: `.glass-overlay { pointer-events: none }`.
That element is fixed across the bottom of the viewport at `z-index: 1` and
paints only a blur, but it was intercepting every pointer event aimed at the
footer links beneath it.

## Known issues

**Grey boxes** — two different things, and only one is a bug:

1. *14 lazy-load skeletons.* Every `<picture>` in the page carries
   `class="skeleton"`, which paints a grey/striped placeholder and sets
   `picture.skeleton img{opacity:0}`. `main.js` only removes that class in the
   image's `load` handler. All 14 images are missing from the archive, so
   `load` never fires and the placeholders stay forever. They disappear on
   their own once the files are added — see below. Not a port issue.
2. *Decorative grey squares.* `.sticky-grd .sticky`, `.sticky-arrow .sticky`,
   `.grd-cut span::before` and `.grd-fold-h h2::before` are part of the
   original design. They look orphaned right now because the images they sit
   next to are blank.

**Script timing (fixed).** The closing scripts must run *after* React
hydration, not before — see the comment in `app/scripts.tsx`. Running them
before means React clobbers what they wrote: GSAP's inline `transform` on
`.grd-cut span` is what makes that element the containing block for its
`position:absolute` ::before square, so losing it sends the grey square off to
the top-left of the page, and Cloudflare's decoded email address reverts to
`[email protected]`.

To identify any remaining stray box, paste `tools/inspect-boxes.js` into the
browser console — it prints every grey block with its live position and flags
any element whose `transform` has been lost.

**Responsiveness** — untouched for now, as agreed. The original ships
breakpoints at 1600/1400/1200/980/768/576px; the mobile viewport work is a
separate pass.

## Missing from the archive

The export contains 21 of the 78 local assets the page references. **57 image
files are absent**, so those `<img>`/`<source>` tags 404:

- all 8 `static/bitmap/nitish_khagwal_portrait_*` (portrait, 1x/2x, jpg+webp)
- all `static/bitmap/cover_*` (design system case study + the 4 thread covers)
- all `static/bitmap/logo_ink_wireframe_*` and `logo_sticky_note_*`
- all `static/bitmap/snap_*` (workspace, candid, event, hall of fame, reading
  book, session)
- `static/favicon/ms-icon-144x144.png`

Present and working: `main.css@v1.0.10.css`, `main.js@v1.0.2`, both `.woff2`
fonts, all 3 `.mp4` videos and their poster jpgs, all 13 favicons,
`email-decode.min.js`, `robots.txt`.

Drop the missing files into `public/static/bitmap/` (same filenames) and they
will be picked up — no code changes needed.
