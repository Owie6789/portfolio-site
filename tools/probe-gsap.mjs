import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
const html = readFileSync("tools/original-index.html", "utf8");
const dom = new JSDOM(html, { runScripts: "outside-only", pretendToBeVisual: true, url: "http://localhost:3000/" });
dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
try { dom.window.eval(readFileSync("public/dist/main.js@v1.0.2", "utf8")); } catch (e) { console.log("threw:", e.message); }
console.log("window.gsap:", typeof dom.window.gsap);
console.log("window.ScrollTrigger:", typeof dom.window.ScrollTrigger);
console.log("window.ScrollSmoother:", typeof dom.window.ScrollSmoother);
