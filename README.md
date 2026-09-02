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

## Identity swap

`tools/html-to-jsx.mjs` renames the site owner in exactly two places, as a
scripted transform on the parsed tree so `tools/original-index.html` stays the
untouched reference:

- `.logo`, the stacked name at the top, becomes Owie / Emmanuel.
- `.caption`'s first line becomes "Emmanuel Owie".
- `.geo` becomes "Based in Edo State, NG — WAT", and its clock placeholder is
  baked at generate time from `Africa/Lagos`.
- `.nav-list`: Interactions / Blog / X become About / Works / Github. **No
  destinations yet**, same as the footer pair, so they are `href="#"` with the
  `target="_blank"` removed.
- `.logomark`, the giant hero wordmark, drops its seven hand-drawn KHAGWAL
  paths for OWIE drawn from Inter (opsz 32, wght 700, -0.02em) by
  `tools/make-wordmark.py` into `tools/wordmark.json`. Outlines rather than
  live text, so the mark does not wait on a font request, and the paths keep
  `fill="var(--on-neutral-inverse)"` so theming still works. Four letters at the
  same 160-unit width makes the mark taller than the original: the viewBox goes
  from `0 0 160 32` to `-3 -3 166 54.29`, the margin being air so scroll
  transforms cannot clip it.

  On scroll the mark also scales toward its own centre, down to 0.72. That
  transform goes on an inner `<g>`, since GSAP already animates a transform on
  the `<svg>` itself and the two would overwrite each other.

  Each letter also carries the same outline at weight 100 in `data-thin`.
  Because both are instances of one variable font their point structure is
  identical, so `app/wordmark-weight.tsx` blends them number for number as the
  mark scrolls out of view, and back on the way up. Both weights are laid out
  on the heavy layout, so the letters do not shift, only their strokes. No font
  is loaded at runtime, and reduced motion leaves the heavy outlines alone.

**Still saying Nitish Khagwal**, deliberately, pending a decision: the page
title and meta description, the Open Graph and Twitter tags, the JSON-LD
person block, the hero caption ("Hey! I’m Nitish Khagwal."), the portrait alt
text and the image filenames.

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
year. The email is now a plain `mailto:heyowie@proton.me` on the user's instruction,
which retires the Cloudflare obfuscation the original used. The decode script
still loads and is now a no-op on this page; it can be re-encoded for the new
address if scraper protection matters. `npm run verify` checks
those seven items and compares the rest of the page as before.

It adds two display faces under `public/live/font/`, both cut and subset by
`tools/measure-headline.py` to only the glyphs the headline draws: Inter pinned
to opsz 32 / wght 400 for "Let’s" (1 KB, down from a 116 KB variable font) and
ITC Garamond Std Light Narrow for "talk" (1.5 KB, converted from the OTF the
user supplied in `footer fonts.zip` on `main`). The same script prints the ink
metrics the SVG headline needs; re-run it if the copy or the fonts change. Note
that it subsets the Garamond in place, so restore it from `main` first.

## Signature

`app/signature.tsx` writes "Emmanuel" across the hero wordmark as the page
scrolls, and unwrites it on the way back up. `app/hero-signature.tsx` portals
it into `.logomark` at runtime rather than injecting markup through the
generator, so the ported DOM stays untouched.

Set in Graflo Italic, from `graflo-urban-graffiti-font.zip` on `main`, and
converted to outlines by `tools/make-signature.py` so nothing is fetched at
runtime. Four SIL OFL alternatives are generated alongside it (`alexbrush`,
`stylescript`, `zeyada`, `nothingyoucoulddo`); switch by changing the import at
the top of `app/signature.tsx`.

Each letter is a separate path with its own dash offset, and they run in
sequence across the scroll range with a 35% overlap, so the word draws
continuously letter by letter. Each letter's fill comes up over the last 30% of
its own stroke. Progress is read from `scrollY`, so at the top of the page it
is exactly zero: nothing draws until the page moves. It is revealed through a mask rather than a wipe: one thick
stroke runs the length of the word along the writing line, and its dash offset
is tied to scroll position, so the letters uncover in writing order. The path
length is measured from the DOM with `getTotalLength()` rather than estimated.

`mix-blend-mode: difference` means it carries no colour of its own. It renders
black over the moon panel and white where it crosses the ink checker.

## The clock

`dist/main.js@v1.0.2` hardcodes IST: it grabs `.timestamp` once, adds 330
minutes to UTC and rewrites it on every animation frame. The bundle is a
verbatim copy, so that 330 cannot be changed, and writing into the same node
would lose a race sixty times a second.

`app/local-time.tsx` waits for the bundle's first write, which proves it has
already captured its reference, then swaps the element for a clone. The bundle
carries on updating the original, now detached and off-screen, while the clone
on the page shows `Africa/Lagos` time. If nothing writes within two seconds the
bundle failed to load and the component takes over regardless.

## Smooth scrolling

`app/smooth-scroll.tsx` adds Lenis, mounted from `app/scripts.tsx` after the
original bundle.

GSAP's own ScrollSmoother is not used, and cannot be: it is a Club GreenSock
plugin rather than part of the free distribution, and it is not in
`dist/main.js@v1.0.2`. That bundle also keeps `gsap` and `ScrollTrigger`
private, with nothing exposed on `window`, so a smoother could not be given the
same gsap instance even if the file were licensed and dropped in.

Lenis drives the real window scroll position instead of transforming a wrapper,
so every ScrollTrigger in the original bundle keeps reading scroll exactly as
before and the existing pinning and scrubbing still work. Native scrolling is
left in place for touch and for `prefers-reduced-motion`.

## Overrides on ported elements

`app/overrides.css` is the one place where the port's own elements get
restyled, kept separate so `public/dist/main.css@v1.0.10.css` stays a verbatim
copy. It currently holds three:

- `.glass-overlay { pointer-events: none }`. Fixed across the bottom of the
  viewport at `z-index: 1`, painting only a blur, but intercepting every
  pointer event aimed at the footer links beneath it.
- `.logomark svg { overflow: visible }`, so scroll transforms cannot clip the
  wordmark against its own viewport.
- Hero headline: line-height from 1.2 down to 1.02 with tighter tracking, and
  one sentence per line below 980px. The original collapses them onto one
  running line there with `.hero h1 span{display:inline}`. The same 1.02 ratio
  is applied to `.display-large`, `.display-medium`, `.display-small` and
  `.title-large`, and relaxes to 1.06 below 768px.
- Body text: the original sets `Some Sans, sans-serif` on `*`; that is
  overridden to `Geist, "Some Sans", sans-serif`. Geist is cut to weights 400
  and 600 and subset to Latin plus the punctuation the page uses, 11 KB each,
  by `tools/make-body-font.py`. Some Sans stays in the stack as the fallback.

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
