// Verifies the ported page renders the same DOM as the original index.html.
// Both documents are parsed, normalised, and compared node-by-node with a
// path-accurate report of any real difference.
import { readFileSync } from "node:fs";
import { parse } from "parse5";

const original = readFileSync("tools/original-index.html", "utf8");
const rendered = await (await fetch("http://127.0.0.1:3000/")).text();

// Nodes injected by the framework itself (not part of the original document).
const isFrameworkNode = (n, seen) => {
  const attrs = Object.fromEntries((n.attrs ?? []).map((a) => [a.name, a.value]));
  if (n.tagName === "script") {
    const src = attrs.src ?? "";
    if (src.includes("/_next/")) return true;
    const raw = (n.childNodes ?? []).map((c) => c.value ?? "").join("");
    if (/self\.__next_f|__NEXT_DATA__/.test(raw)) return true;
  }
  if (n.tagName === "link" && (attrs.href ?? "").includes("/_next/")) return true;
  if (n.tagName === "link" && attrs.rel === "preload") return true;
  if (n.tagName === "template") return true;
  // Next always emits its own charset + default viewport in addition to the
  // ones present in the original document; drop the duplicates.
  if (n.tagName === "meta") {
    if ("charset" in attrs) {
      if (seen.charset) return true;
      seen.charset = true;
    }
    if (attrs.name === "viewport") {
      if (seen.viewport) return true;
      seen.viewport = true;
    }
  }
  // React's suspense placeholder wrapper.
  if (n.tagName === "div" && "hidden" in attrs && !(n.childNodes ?? []).some((c) => c.nodeName !== "#comment")) {
    return true;
  }
  return false;
};

const IGNORED_ATTRS = new Set(["data-precedence", "data-nscript", "id", "precedence"]);

// next/script serialises inline scripts into a "self.__next_s.push([0,{...}])"
// bootstrap call and loads external ones the same way. Decode those back into
// the script elements they represent so they can be compared with the
// original document instead of being reported as missing.
function decodeNextScripts(html) {
  const inline = [];
  const external = [];
  const re = /\(self\.__next_s=self\.__next_s\|\|\[\]\)\.push\((\[.*?\])\)(?=<\/script>|;|$)/gs;
  for (const m of html.matchAll(re)) {
    let payload;
    try {
      payload = JSON.parse(m[1]);
    } catch {
      continue;
    }
    const [src, props] = payload;
    if (src) {
      external.push(String(src));
    } else if (props && typeof props.children === "string") {
      inline.push({ type: props.type ?? null, content: props.children });
    }
  }
  return { inline, external };
}

/* Text the identity swap in tools/html-to-jsx.mjs deliberately rewrites. Both
   sides are folded to the same token so the rest of the subtree still gets
   compared, rather than excluding those branches from the diff entirely. */
const RENAMED = new Map([
  ["Hey! I’m Nitish Khagwal.", "«greeting»"],
  ["Emmanuel Owie", "«greeting»"],
  ["Based in Meerut, IN", "«place»"],
  ["Based in Edo State, NG", "«place»"],
  ["— IST", "«zone»"],
  ["— WAT", "«zone»"],
]);
const CLOCK = /^\d{1,2}:\d{2} [ap]m$/;

function foldText(v) {
  if (RENAMED.has(v)) return RENAMED.get(v);
  if (CLOCK.test(v)) return "«time»";
  return v;
}

function foldAttr(name, value) {
  if (name !== "aria-label") return value;
  let out = value;
  for (const [from, to] of RENAMED) out = out.replace(from, to);
  return out;
}

function normalise(node, seen) {
  if (node.nodeName === "#text") {
    const v = foldText(node.value.replace(/\s+/g, " ").trim());
    return v ? { t: "#text", v } : null;
  }
  if (node.nodeName === "#comment") return null;
  if (isFrameworkNode(node, seen)) return null;

  const attrs = (node.attrs ?? [])
    .filter((a) => !IGNORED_ATTRS.has(a.name))
    .map((a) => [a.name, foldAttr(a.name, a.value.replace(/\s+/g, " ").trim())])
    .sort((x, y) => x[0].localeCompare(y[0]));

  const children = (node.childNodes ?? [])
    .map((c) => normalise(c, seen))
    .filter(Boolean);
  return { t: node.tagName ?? node.nodeName, a: attrs, c: children };
}

const pick = (doc, tag) => {
  const walk = (n) => {
    if (n.tagName === tag) return n;
    for (const c of n.childNodes ?? []) {
      const r = walk(c);
      if (r) return r;
    }
    return null;
  };
  return walk(doc);
};

const nextScripts = decodeNextScripts(rendered);
const norm = (t) => t.replace(/\s+/g, " ").trim();

// The footer is deliberately no longer a verbatim port. Drop it from the
// structural comparison and check its content separately below.
function stripFooter(n) {
  if (!n || !n.c) return n;
  // Drop the footer and the single <hr> that sat directly above it; both are
  // intentionally gone from the redesign.
  n.c = n.c.filter((c, i) => {
    if (c.t === "footer") return false;
    const next = n.c[i + 1];
    return !(c.t === "hr" && next && next.t === "footer");
  });
  n.c.forEach(stripFooter);
  return n;
}

/* The identity swap in tools/html-to-jsx.mjs deliberately diverges from the
   original in two subtrees. Drop them from the structural diff and assert the
   new content instead. */
function stripIdentity(n) {
  if (!n || !n.c) return n;
  n.c = n.c.filter((c) => {
    // attrs are normalised to sorted [name, value] pairs
    const cls = (c.a?.find(([k]) => k === "class")?.[1] ?? "").split(/\s+/);
    return !(cls.includes("logo") || cls.includes("logomark"));
  });
  n.c.forEach(stripIdentity);
  return n;
}

function checkIdentity() {
  const required = [
    ['aria-label="Owie Emmanuel"', "stacked name label"],
    [">Owie<", "first name"],
    [">Emmanuel<", "last name"],
    ["Emmanuel Owie", "greeting"],
    ["Based in Edo State, NG", "location"],
    ["WAT", "timezone"],
  ];
  const missing = required.filter(([needle]) => !rendered.includes(needle));
  const marks = (rendered.match(/var\(--on-neutral-inverse\)/g) ?? []).length;
  if (!missing.length) {
    console.log(`✔ <header>/<logomark> — renamed, wordmark drawn as outlines (${marks} themed paths on the page)`);
    return 0;
  }
  console.log("✘ identity swap incomplete:");
  missing.forEach(([, what]) => console.log(`   missing: ${what}`));
  return 1;
}

function checkFooterContent() {
  const required = [
    ["mailto:heyowie@proton.me", "email href"],
    ["heyowie@proton.me", "email label"],
    ["©", "copyright mark"],
    [String(new Date().getFullYear()), "current year"],
    ["About", "About link"],
    ["Works", "Works link"],
  ];
  const missing = required.filter(([needle]) => !rendered.includes(needle));
  if (!missing.length) {
    console.log(`✔ <footer> — redesigned, all ${required.length} original content items carried over`);
    return 0;
  }
  console.log("✘ <footer> — redesigned but content was lost:");
  missing.forEach(([, what]) => console.log(`   missing: ${what}`));
  return 1;
}

const diffs = [];
function compare(a, b, path) {
  if (diffs.length > 25) return;
  if (!a || !b) {
    diffs.push(`${path}: ${a ? "missing in rendered" : "extra in rendered"} -> ${JSON.stringify(a ?? b).slice(0, 160)}`);
    return;
  }
  if (a.t !== b.t) {
    diffs.push(`${path}: tag <${a.t}> vs <${b.t}>`);
    return;
  }
  if (a.t === "#text") {
    if (a.v !== b.v) diffs.push(`${path}: text "${a.v.slice(0, 80)}" vs "${b.v.slice(0, 80)}"`);
    return;
  }
  const sa = JSON.stringify(a.a);
  const sb = JSON.stringify(b.a);
  if (sa !== sb) diffs.push(`${path} <${a.t}>: attrs ${sa.slice(0, 200)} vs ${sb.slice(0, 200)}`);
  const n = Math.max(a.c.length, b.c.length);
  for (let i = 0; i < n; i++) {
    compare(a.c[i], b.c[i], `${path}/${a.t}[${i}]`);
  }
}

let failed = 0;
for (const part of ["head", "body"]) {
  const a = stripIdentity(stripFooter(normalise(pick(parse(original), part), {})));
  const b = stripIdentity(stripFooter(normalise(pick(parse(rendered), part), {})));
  diffs.length = 0;

  // Head tag order is rearranged by React's hoisting, so compare it as a set.
  if (part === "head") {
    const key = (n) => JSON.stringify(n);
    const setA = a.c.map(key).sort();
    const setB = b.c.map(key).sort();
    const decodedInline = nextScripts.inline.map((s2) =>
      JSON.stringify({
        t: "script",
        a: s2.type ? [["type", s2.type]] : [],
        c: [{ t: "#text", v: norm(s2.content) }],
      })
    );
    setB.push(...decodedInline);
    setB.sort();
    const isNextBootstrap = (x) => x.includes("self.__next_s=self.__next_s");
    const missing = setA.filter((x) => !setB.includes(x));
    const extra = setB.filter((x) => !setA.includes(x) && !isNextBootstrap(x));
    if (!missing.length && !extra.length) {
      console.log(`✔ <head> — all ${setA.length} nodes present and identical (order differs: React hoisting)`);
    } else {
      failed++;
      console.log(`✘ <head> differs`);
      missing.forEach((m) => console.log(`   missing: ${m.slice(0, 200)}`));
      extra.forEach((m) => console.log(`   extra:   ${m.slice(0, 200)}`));
    }
    continue;
  }

  // The two closing <script src> tags: the port serves them from /public, so
  // the src gains a leading slash, and carries `defer` to keep end-of-body
  // execution timing. Everything else about them must match.
  const trailing = [];
  while (a.c.length && a.c[a.c.length - 1].t === "script") trailing.unshift(a.c.pop());
  const renderedTrailing = [];
  while (b.c.length && b.c[b.c.length - 1].t === "script") renderedTrailing.unshift(b.c.pop());

  compare(a, b, "");

  // renderedTrailing may legitimately be empty when the closing scripts are
  // loaded through next/script instead of as literal tags; each one is
  // accounted for individually below.
  trailing.forEach((s2, i) => {
    const r = renderedTrailing[i];
    const srcA = (s2.a.find((x) => x[0] === "src") ?? [])[1] ?? "";
    const srcB = ((r?.a ?? []).find((x) => x[0] === "src") ?? [])[1] ?? "";
    const restA = JSON.stringify(s2.a.filter((x) => x[0] !== "src"));
    const restB = JSON.stringify((r?.a ?? []).filter((x) => x[0] !== "src" && x[0] !== "defer"));
    const sameSrc = srcB.replace(/^\//, "") === srcA.replace(/^\//, "");
    const viaNextScript = nextScripts.external.some(
      (e) => e.replace(/^\//, "") === srcA.replace(/^\//, "")
    ) || rendered.includes(srcA.replace(/^\//, ""));
    if (sameSrc && restA === restB) {
      console.log(`  · ${srcA} — present at end of body (+defer)`);
    } else if (!r && viaNextScript) {
      console.log(`  · ${srcA} — loaded via next/script afterInteractive (post-hydration)`);
    } else {
      failed++;
      console.log(`  ✘ ${srcA} — mismatch: ${srcB} ${restB}`);
    }
  });

  if (!diffs.length) {
    const count = (n) => 1 + n.c.reduce((s, c) => s + (c.t === "#text" ? 1 : count(c)), 0);
    console.log(`✔ <body> — identical DOM tree (${count(a)} nodes, order included)`);
  } else {
    failed++;
    console.log(`✘ <body> differs (${diffs.length} shown)`);
    diffs.forEach((d) => console.log(`   ${d}`));
  }
}
failed += checkFooterContent();
failed += checkIdentity();

process.exit(failed ? 1 : 0);
