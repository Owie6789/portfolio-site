# AGENTS.md

Operating instructions for any agent working in this repo. Read this first.

## What this repo is

A 1:1 port of the static site `khagwal.com` to Next.js 15 App Router, React 19,
TypeScript. The original design is the specification. Nothing in it was
redesigned, rewritten, or "improved".

- `tools/original-index.html` is the source of truth. `app/layout.tsx` and
  `app/page.tsx` are generated from it by `npm run port`. Do not hand-edit the
  generated files, edit the original and regenerate.
- Original CSS, JS, fonts, videos and favicons are served byte-for-byte from
  `public/`.
- `npm run verify` diffs the rendered DOM against the original. Current state:
  head 38/38 nodes identical, body identical at 339 nodes.
- `npm run smoke` runs the original `main.js` against both DOMs in jsdom.
- 57 image files are missing from the source archive, which is why 14 grey
  `picture.skeleton` placeholders are still on the page. Not a bug to fix in
  code. See README.md.

Run `npm run verify` and `npm run smoke` before claiming any change is safe.

## Non-negotiables

These come from direct user corrections. Breaking one of them is a failure, not
a style difference.

1. Never invent content, copy, images, or design to fill a gap. If source
   material is missing or a fetch fails, stop and say so.
2. Never substitute a generic scaffold for the user's actual material.
3. Report blockers immediately with the specific error. Do not quietly route
   around them.
4. Verify claims with a tool, then quote the result. No "should work".
5. Preserve original markup, CSS and JS exactly. Any deviation forced by the
   framework gets documented in README.md with the reason.
6. Do not start work the user has explicitly deferred, such as the responsive
   and mobile pass.
7. Apply `skills/unslop` to everything written, including chat replies, commit
   messages and docs.

## Skills

Full text lives in `skills/<name>/SKILL.md`, fetched verbatim from source with
provenance in each `SOURCE.txt`. Load the full file before acting on one.

### Design and taste

| Skill | Use when |
| --- | --- |
| `impeccable` | The main design toolkit. Design, redesign, critique, audit, polish, clarify, harden, animate, adapt. Modes live in `skills/impeccable/reference/*.md`, including `delight.md`, `polish.md`, `craft.md`, `critique.md`, `audit.md`, `animate.md`, `typeset.md`, `layout.md` |
| `design-better` | Building or refactoring UI and it needs to look designed. 50-item heuristics catalogue |
| `high-end-visual-design` | Agency-tier visual work. Names exact fonts, spacing, shadows, card structures, motion, and blocks the defaults that read as cheap |
| `design-taste-frontend` / `design-taste-frontend-v1` | Landing pages, portfolios, redesigns that must not look templated. Audit-first on redesigns |
| `emil-design-eng` | Animation decisions, easing, spring config, perceived performance, invisible details |
| `better-ui` | Concentric radius, optical alignment, elevation, interruptible animation, stagger, hit areas |
| `make-interfaces-feel-better` | Same territory, checklist form. Good for a final pass |
| `premium-web-design-psychology` | Judging whether something feels expensive. Halo effect, cognitive load, peak-end rule |
| `ui-ux-pro-max` | Large searchable dataset. 79 styles, 192 palettes, accessibility, responsive, charts |
| `redesign-existing-projects` | Upgrading an existing site without breaking it |
| `minimalist-ui`, `industrial-brutalist-ui`, `gpt-taste`, `stitch-design-taste` | Specific aesthetic directions |
| `brandkit`, `imagegen-frontend-web`, `imagegen-frontend-mobile`, `image-to-code` | Generating design imagery and turning it into code |
| `shadcn-ui`, `better-icons` | Component library and icon sourcing |

### Process and quality

| Skill | Use when |
| --- | --- |
| `interview-me` | Unknowns remain before implementation. One question at a time |
| `grill-me` | Pressure-test a plan or design before building |
| `implement` | Building from a spec or tickets |
| `review-loop` | Worker plus critic subagent, scores 1 to 10, revises until the gate is met |
| `code-review` | Two axes, standards and spec, run as parallel subagents |
| `code-review-and-quality` | Five axes: correctness, readability, architecture, security, performance |
| `improve` | Read-only audit of a codebase producing prioritized plans. Never edits source |
| `full-output-enforcement` | Long generation tasks. Bans placeholders and truncation |
| `find-skills` | Looking for a capability that might already exist as a skill |
| `unslop` | Always. Every piece of writing |

## Loading skills into context

The skills folder holds about 1 MB of instructions, roughly 250k tokens. No
agent loads it all at once. Load on demand, in this order:

1. This file, always.
2. `skills/unslop/SKILL.md`, always, before writing anything.
3. The 2 to 4 skills the current task names. Full file, not a skim.
4. For impeccable, load `SKILL.md` to route, then the one
   `reference/<command>.md` you need, then `reference/craft-floor.md` right
   before editing UI.

Never load the data files. `impeccable/scripts/data/font-index.json` is 1.1 MB,
`ui-ux-pro-max/data/` holds 800 KB of icon JSON and 732 KB of Google Fonts CSV.
Query them with grep when a specific lookup is needed.

## When a skill conflicts with this repo

The non-negotiables win. `high-end-visual-design` bans certain fonts and
demands a fresh layout archetype every time. `impeccable` craft-floor refuses
kickers and same-size card grids. This repo is a verbatim port of someone
else's design, so none of that applies to `app/page.tsx` or the original CSS.
Apply those skills to new surfaces the user asks for, never retroactively to
the ported page. If a skill's rule would change the original design, say so and
ask first.

## Condensed rules

### Writing, from `unslop`

Applies always, including chat. No em dashes at all, use a period or comma. No
parentheses as a substitute. Sentence case headings. No decorative emoji.
Straight quotes. Active voice, name the actor. One idea per sentence. Cut
adverbs propping up weak verbs. Plain words: use, not utilize or leverage.
No puffery, no vague attributions, no "not just X but Y", no forced groups of
three. Drop chatbot filler and sycophancy, answer directly. Say what a thing
does with a mechanism or number, not how it feels. If a sentence would fit
unchanged in another project's docs, cut it. Have an opinion, vary the rhythm,
use "I" when it fits.

### Design

Judge the first impression first. The hero decides whether everything after it
reads as credible. Cut cognitive load: white space is a tool, one primary goal
per section, predictable navigation over clever navigation. Spend the polish
budget on peaks and endings, that is what people remember.

Concrete craft: concentric border radius, optical over geometric alignment,
shadows for elevation and borders for structure, interruptible animations,
staggered entrances, subtle exits, generous hit areas, controlled text
wrapping, image outlines, scale on press, no animation on first page load, no
transitions during theme switch, transition only the property that changes,
`will-change` sparingly.

Motion: ask whether it should animate at all, then what the purpose is, then
easing, then duration. Perceived performance beats measured duration.

Accessibility is not a later pass. WCAG 2.2 AA, keyboard paths, focus states,
reduced-motion, real contrast.

### Process

Resolve unknowns by asking one question at a time before building, not by
guessing. Pressure-test the plan. Implement against the spec. Review on the
five axes and against the spec separately. Iterate with a critic until the
quality gate is met. Audits stay read-only and produce plans, they do not
silently refactor.

## Keeping this file current

Whenever the user corrects, nudges, prohibits, or states a preference, add it
to the corrections log below in the same turn, without being asked. Do this for
anything reusable: a rule, a tool that does not work here, a naming or workflow
preference, a thing they never want to see again.

How to write an entry: one line, imperative, specific enough to act on months
later, dated, with a short "why" when the reason is not obvious. Delete or
amend an entry when the user reverses it. Keep the log short by folding
repeated corrections into the non-negotiables above. Mention in your reply that
you added it.

## Corrections log

- 2026-09-02 Do not generate placeholder content or AI imagery to stand in for
  the user's real material. The user's word for it is "slop". When a fetch or
  mirror fails, report the failure and stop.
- 2026-09-02 `curl` and `wget` cannot reach the public internet from this
  sandbox, TLS handshakes fail even for `example.com`. Working alternatives:
  `gh api`, the npm registry, and the built-in fetch and search tools. Say this
  up front instead of retrying.
- 2026-09-02 No headless browser is available. Playwright's Chromium download
  is blocked. Verify rendering through DOM diffing and jsdom, and say plainly
  that visual confirmation is not possible.
- 2026-09-02 Port work means transfer, not interpretation. Convert markup
  mechanically with a script so nothing drifts, then prove it with a diff.
- 2026-09-02 Third-party scripts that mutate the DOM must run after hydration,
  via `next/script` `afterInteractive`. Running them earlier lets React clobber
  their work. This broke GSAP transforms and the Cloudflare email decode.
- 2026-09-02 Leave responsiveness and the mobile viewport alone until the user
  starts that pass.
- 2026-09-02 The footer is now a designed component, not a port, at the user's
  request. New design work is allowed when asked for by name; the rest of the
  page stays verbatim. Keep original content, only the treatment changes.
- 2026-09-02 Design direction for this site: cold moon-white greyish surfaces,
  checkerboard edge, very condensed Instrument Sans display type, springy
  half-spin on the asterisk. Mobile gets the same treatment, not a cut-down.
- 2026-09-02 Licensed fonts come from the user, in `footer fonts.zip` on
  `main`. Check that branch for supplied assets before concluding something
  cannot be fetched.
- 2026-09-02 `dist/main.js@v1.0.2` bundles gsap and ScrollTrigger privately;
  `window.gsap` and `window.ScrollTrigger` are undefined. Anything that needs to
  cooperate with the site's animations has to work through real scroll position,
  not the gsap instance. ScrollSmoother is a paid Club plugin and is not present.
- 2026-09-02 Restyle ported elements in `app/overrides.css`, never by editing
  `public/dist/main.css@v1.0.10.css`. CSS modules reject bare `:global()`
  selectors, so a plain global sheet imported from a hand-written component is
  the route.
- 2026-09-02 Footer link set is About and Works only; the six social links are
  gone. Destinations still needed.
- 2026-09-02 Interaction preferences for this site: micro-interactions belong
  on the element itself, never on its parent container. Magnetic pull plus a
  springy half spin on the asterisk. Links carry a permanent underline that
  thickens on hover, with the arrow travelling up and to the right.
- 2026-09-02 Display type must be visibly tracked out. Tight default spacing
  reads as cramped at large sizes.
- 2026-09-02 `public/dist/` is excluded from the workspace snapshot layer, the
  name `dist` is on the platform's ignore list. Those two files disappear
  between sessions even though git tracks them. Run `npm run check-assets`, now
  wired into dev, build and verify, before trusting a local run.
- 2026-09-02 Load the relevant SKILL.md files into context before design or
  review work, do not work from the condensed summary alone.
- 2026-09-02 Answer the actual question. When the user points at one element,
  identify that element, do not restate the whole situation.
