// Mechanical HTML -> JSX converter.
//
// One exception to "no content is rewritten": applyIdentity() below swaps the
// site owner's name in the two places the user asked for. It is a scripted
// transform on the parsed tree rather than an edit to the original HTML, so
// tools/original-index.html stays the untouched reference and the change is
// listed in one place.
// Parses the original index.html with parse5 and emits JSX that produces an
// identical DOM. No content is rewritten: text, attribute values and element
// order are copied verbatim. Only the attribute *names* are mapped to their
// React equivalents (class -> className, etc.), which is required by JSX.
import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "parse5";

const SRC = "tools/original-index.html";
const html = readFileSync(SRC, "utf8");
const doc = parse(html, { sourceCodeLocationInfo: true });

const find = (node, tag) => {
  if (!node.childNodes) return null;
  for (const c of node.childNodes) {
    if (c.tagName === tag) return c;
    const r = find(c, tag);
    if (r) return r;
  }
  return null;
};

/* Identity swap. Five places:
     - .logo, the stacked name at the top of the page
     - .logomark, the giant hero wordmark, whose seven hand-drawn KHAGWAL paths
       are replaced by OWIE drawn from Inter by tools/make-wordmark.py
     - the first line of .caption, the greeting
     - .geo, the location and timezone line
     - .nav-list, whose Interactions / Blog / X entries become About / Works /
       Github. TODO: real destinations; they are placeholders, as in the footer
   Everything else that says Nitish Khagwal (page title, meta, JSON-LD, the
   portrait alt text, image filenames) is left alone deliberately. */
const NAME = { first: "Owie", last: "Emmanuel" };
const GREETING = "Hey! I’m Emmanuel Owie";
const GEO = { place: "Based in Edo State, NG", zone: "WAT" };
const NAV = [
  { was: "Interactions", label: "About", href: "#" },
  { was: "Blog", label: "Works", href: "#" },
  { was: "X", label: "Github", href: "#" },
];
// Placeholder only. app/local-time.tsx overwrites this with live WAT once the
// original bundle has finished grabbing the node. Baked at generate time so a
// no-JS visitor still sees a plausible Lagos time rather than an IST one.
const CLOCK = new Intl.DateTimeFormat("en-US", {
  timeZone: "Africa/Lagos",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
}).format(new Date()).toLowerCase();
const wordmark = JSON.parse(readFileSync("tools/wordmark.json", "utf8"));

const classOf = (n) =>
  n.attrs?.find((a) => a.name === "class")?.value ?? "";

const setAttr = (n, name, value) => {
  const a = n.attrs.find((x) => x.name === name);
  if (a) a.value = value;
  else n.attrs.push({ name, value });
};

function walk(node, fn) {
  fn(node);
  (node.childNodes ?? []).forEach((c) => walk(c, fn));
}

function applyIdentity(root) {
  let logo = 0;
  let mark = 0;
  let greeting = 0;
  let geo = 0;
  let nav = 0;

  walk(root, (n) => {
    if (classOf(n).split(/\s+/).includes("logo")) {
      setAttr(n, "aria-label", `${NAME.first} ${NAME.last}`);
      const spans = (n.childNodes ?? []).filter((c) => c.tagName === "span");
      const words = [NAME.first, NAME.last];
      spans.forEach((span, i) => {
        const text = (span.childNodes ?? []).find((c) => c.nodeName === "#text");
        if (text && words[i]) {
          text.value = words[i];
          logo++;
        }
      });
    }

    if (classOf(n).split(/\s+/).includes("caption")) {
      const first = [];
      walk(n, (c) => {
        if (c.tagName === "span" && !first.length) first.push(c);
      });
      const text = (first[0]?.childNodes ?? []).find((c) => c.nodeName === "#text");
      if (text) {
        const label = n.attrs?.find((a) => a.name === "aria-label");
        if (label) label.value = label.value.replace(text.value.trim(), GREETING);
        text.value = GREETING;
        greeting++;
      }
    }

    if (classOf(n) === "geo") {
      const spans = (n.childNodes ?? []).filter((c) => c.tagName === "span");
      const place = (spans[0]?.childNodes ?? []).find((c) => c.nodeName === "#text");
      if (place) {
        place.value = GEO.place;
        geo++;
      }
      // second span is "— IST <span class=timestamp>…</span>"
      const zone = (spans[1]?.childNodes ?? []).find(
        (c) => c.nodeName === "#text" && c.value.includes("—")
      );
      if (zone) zone.value = `— ${GEO.zone} `;
      walk(spans[1] ?? {}, (c) => {
        if (classOf(c) === "timestamp") {
          const t = (c.childNodes ?? []).find((x) => x.nodeName === "#text");
          if (t) t.value = CLOCK;
        }
      });
    }

    if (classOf(n) === "nav-list") {
      walk(n, (a) => {
        if (a.tagName !== "a") return;
        const text = (a.childNodes ?? []).find((c) => c.nodeName === "#text");
        const entry = NAV.find((e) => e.was === text?.value.trim());
        if (!entry) return;
        text.value = entry.label;
        setAttr(a, "href", entry.href);
        // placeholders should not open a new tab
        a.attrs = a.attrs.filter((x) => x.name !== "target");
        nav++;
      });
    }

    if (classOf(n) === "logomark") {
      const svg = (n.childNodes ?? []).find((c) => c.tagName === "svg");
      if (!svg) return;
      setAttr(svg, "viewBox", wordmark.viewBox);
      svg.childNodes = wordmark.paths.map((d) => ({
        nodeName: "path",
        tagName: "path",
        attrs: [
          { name: "d", value: d },
          { name: "fill", value: "var(--on-neutral-inverse)" },
        ],
        childNodes: [],
        parentNode: svg,
        namespaceURI: svg.namespaceURI,
      }));
      mark++;
    }
  });

  console.log(
    `identity: ${logo} logo words -> ${NAME.first} ${NAME.last}, ` +
      `${mark} wordmark -> ${wordmark.word} (${wordmark.paths.length} paths), ` +
      `${greeting} greeting -> ${GREETING}, ${geo} geo -> ${GEO.place} / ${GEO.zone}, ` +
      `${nav} nav -> ${NAV.map((e) => e.label).join(" / ")}`
  );
}

applyIdentity(doc);

// Attribute name mapping (HTML -> JSX). Anything not listed and not
// data-/aria- prefixed is emitted through a spread so the value survives.
const ATTR = {
  class: "className",
  for: "htmlFor",
  charset: "charSet",
  tabindex: "tabIndex",
  colspan: "colSpan",
  rowspan: "rowSpan",
  maxlength: "maxLength",
  minlength: "minLength",
  readonly: "readOnly",
  autoplay: "autoPlay",
  playsinline: "playsInline",
  autocomplete: "autoComplete",
  autofocus: "autoFocus",
  crossorigin: "crossOrigin",
  novalidate: "noValidate",
  contenteditable: "contentEditable",
  spellcheck: "spellCheck",
  srcset: "srcSet",
  usemap: "useMap",
  accesskey: "accessKey",
  enctype: "encType",
  formaction: "formAction",
  "http-equiv": "httpEquiv",
  datetime: "dateTime",
  // SVG
  viewbox: "viewBox",
  preserveaspectratio: "preserveAspectRatio",
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
  "clip-path": "clipPath",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-opacity": "strokeOpacity",
  "fill-opacity": "fillOpacity",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-weight": "fontWeight",
  "text-anchor": "textAnchor",
  "dominant-baseline": "dominantBaseline",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  gradientunits: "gradientUnits",
  gradienttransform: "gradientTransform",
  patternunits: "patternUnits",
  maskunits: "maskUnits",
  markerwidth: "markerWidth",
  markerheight: "markerHeight",
  xmlnsxlink: "xmlnsXlink",
};

const BOOLEAN = new Set([
  "autoplay",
  "muted",
  "loop",
  "controls",
  "playsinline",
  "defer",
  "async",
  "disabled",
  "checked",
  "selected",
  "readonly",
  "required",
  "hidden",
  "open",
  "multiple",
  "novalidate",
  "autofocus",
  "reversed",
  "default",
  "itemscope",
]);

const VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
  "meta", "param", "source", "track", "wbr", "path", "circle", "rect",
  "line", "polyline", "polygon", "ellipse", "stop", "use",
]);

const jsStr = (s) => JSON.stringify(s);

// Parse an inline style attribute into a React style object, preserving
// declarations and values exactly.
function styleObject(value) {
  const out = [];
  for (const decl of value.split(";")) {
    const i = decl.indexOf(":");
    if (i === -1) continue;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop) continue;
    const key = prop.startsWith("--")
      ? jsStr(prop)
      : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    out.push(`${key}: ${jsStr(val)}`);
  }
  return `{ ${out.join(", ")} }`;
}

function attrs(node) {
  const parts = [];
  for (const { name, value } of node.attrs ?? []) {
    if (name === "style") {
      parts.push(`style={${styleObject(value)}}`);
      continue;
    }
    if (BOOLEAN.has(name) && (value === "" || value === name)) {
      parts.push(`${ATTR[name] ?? name}={true}`);
      continue;
    }
    if (name.startsWith("data-") || name.startsWith("aria-")) {
      parts.push(`${name}=${jsStr(value)}`);
      continue;
    }
    const mapped = ATTR[name];
    if (mapped) {
      parts.push(`${mapped}=${jsStr(value)}`);
      continue;
    }
    if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(name)) {
      parts.push(`${name}=${jsStr(value)}`);
    } else {
      // names JSX cannot express literally (e.g. xmlns:xlink)
      parts.push(`{...{${jsStr(name)}: ${jsStr(value)}}}`);
    }
  }
  return parts;
}

// Text is emitted as a JS string expression so entities, non-breaking spaces
// and curly braces survive untouched.
function textNode(text) {
  if (text.trim() === "") return text.includes("\n") ? "" : `{${jsStr(text)}}`;
  return `{${jsStr(text)}}`;
}

let footerJsx = "";

function serializeRaw(node, indent) {
  const saved = footerJsx;
  footerJsx = "__SKIP__";
  const out = serialize(node, indent);
  footerJsx = saved;
  return out;
}

function serialize(node, indent) {
  const pad = "  ".repeat(indent);

  if (node.nodeName === "#text") {
    const t = textNode(node.value);
    return t ? pad + t : "";
  }
  if (node.nodeName === "#comment") {
    return `${pad}{/*${node.data.replace(/\*\//g, "*\\/")}*/}`;
  }

  const tag = node.tagName;

  // The <footer> is replaced by a designed React component. Emit a marker and
  // keep the original JSX in a separate file for reference and rollback.
  // The <hr> immediately above the footer belonged to the old footer's
  // divider. The redesigned panel is full bleed, so it goes with it.
  if (tag === "hr" && footerJsx !== "__SKIP__") {
    const siblings = node.parentNode?.childNodes ?? [];
    const after = siblings
      .slice(siblings.indexOf(node) + 1)
      .find((n) => n.tagName);
    if (after?.tagName === "footer") return "";
  }

  if (tag === "footer" && footerJsx !== "__SKIP__") {
    footerJsx = serializeRaw(node, indent);
    return `${pad}__FOOTER__`;
  }

  const a = attrs(node);
  const attrStr = a.length ? " " + a.join(" ") : "";

  // Raw-text elements: keep their contents byte-for-byte.
  if (tag === "script" || tag === "style" || tag === "noscript") {
    const raw = (node.childNodes ?? []).map((c) => c.value ?? "").join("");
    if (!raw) return `${pad}<${tag}${attrStr} />`;
    return `${pad}<${tag}${attrStr} dangerouslySetInnerHTML={{ __html: ${jsStr(
      raw
    )} }} />`;
  }

  const children = (node.childNodes ?? [])
    .map((c) => serialize(c, indent + 1))
    .filter(Boolean);

  if (!children.length) {
    if (VOID.has(tag)) return `${pad}<${tag}${attrStr} />`;
    return `${pad}<${tag}${attrStr}></${tag}>`;
  }

  return [`${pad}<${tag}${attrStr}>`, ...children, `${pad}</${tag}>`].join("\n");
}

const body = find(doc, "body");
const head = find(doc, "head");

// Split the body: everything except the two trailing <script src> tags, which
// are loaded through next/script so they still execute after the DOM exists.
const bodyChildren = body.childNodes.filter(
  (n) => !(n.tagName === "script" && (n.attrs ?? []).some((a) => a.name === "src"))
);

const bodyJsx = bodyChildren
  .map((n) => serialize(n, 3))
  .filter(Boolean)
  .join("\n");

const headJsx = head.childNodes
  .map((n) => serialize(n, 3))
  .filter(Boolean)
  .join("\n");

writeFileSync("tools/generated-body.jsx.txt", bodyJsx);
writeFileSync("tools/generated-footer-original.jsx.txt", footerJsx);
writeFileSync("tools/generated-head.jsx.txt", headJsx);
console.log(
  `body children: ${bodyChildren.length}, head children: ${head.childNodes.length}`
);
