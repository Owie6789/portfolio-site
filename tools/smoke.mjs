// Smoke test: run the original main.js against the ported page's DOM (jsdom)
// and against the original index.html, then compare the outcomes. Any element
// the script expects must be found in both.
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

const js = readFileSync("public/dist/main.js@v1.0.2", "utf8");

// Selectors main.js queries on start-up.
const SELECTORS = [
  ".nav-control",
  ".navigation",
  "main",
  ".timestamp",
  ".sticky-arrow .dense",
  ".mosaic-keyboard video",
  ".glass-overlay",
  ".skip",
];

async function run(label, html) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => errors.push(e.message.split("\n")[0]));
  const dom = new JSDOM(html, {
    runScripts: "outside-only",
    pretendToBeVisual: true,
    virtualConsole: vc,
    url: "http://localhost:3000/",
  });
  const { window } = dom;
  window.matchMedia ??= () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  window.scrollTo ??= () => {};

  const found = {};
  for (const sel of SELECTORS) found[sel] = !!window.document.querySelector(sel);

  let threw = null;
  try {
    window.eval(js);
    window.document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));
    window.dispatchEvent(new window.Event("load"));
    await new Promise((r) => setTimeout(r, 300));
  } catch (e) {
    threw = e.message.split("\n")[0];
  }
  dom.window.close();
  return { label, found, threw, errors };
}

const original = readFileSync("tools/original-index.html", "utf8");
const ported = await (await fetch("http://127.0.0.1:3000/")).text();

const a = await run("original", original);
const b = await run("ported", ported);

let bad = 0;
for (const sel of SELECTORS) {
  const same = a.found[sel] === b.found[sel];
  if (!same) bad++;
  console.log(`${same ? "✔" : "✘"} ${sel.padEnd(26)} original=${a.found[sel]} ported=${b.found[sel]}`);
}
for (const r of [a, b]) {
  console.log(`${r.threw ? "✘" : "✔"} ${r.label}: script executed${r.threw ? ` — threw: ${r.threw}` : " without throwing"}`);
  if (r.threw) bad++;
}
process.exit(bad ? 1 : 0);
