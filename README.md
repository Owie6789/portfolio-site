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
