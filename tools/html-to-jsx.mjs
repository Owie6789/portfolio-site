// Mechanical HTML -> JSX converter.
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
writeFileSync("tools/generated-head.jsx.txt", headJsx);
console.log(
  `body children: ${bodyChildren.length}, head children: ${head.childNodes.length}`
);
