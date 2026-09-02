// Assembles app/layout.tsx and app/page.tsx from the converter output.
//
// Head handling notes (framework constraints, no content is changed):
//  - <meta>/<title>/<link rel=icon|canonical> are hoisted into <head> by React.
//  - <style> and <link rel=stylesheet> need React's `precedence` prop to be
//    hoisted into <head> instead of being flushed into the body.
//  - inline <script> tags cannot be hoisted by React, so they are emitted with
//    next/script strategy="beforeInteractive", which Next injects into the
//    initial HTML head. Their contents are unchanged.
import { readFileSync, writeFileSync } from "node:fs";

let head = readFileSync("tools/generated-head.jsx.txt", "utf8");
const body = readFileSync("tools/generated-body.jsx.txt", "utf8");

const banner = `/* AUTO-GENERATED from the original khagwal.com index.html by
 * tools/html-to-jsx.mjs + tools/assemble.mjs. Markup, attributes and text are
 * copied verbatim from the source; only JSX attribute names differ.
 * Regenerate with: npm run port
 */`;

// 1. Pull the inline <script> tags out of the head and turn them into
//    next/script beforeInteractive entries (same content, same order).
const inlineScripts = [];
head = head.replace(
  /^[ \t]*<script([^>]*?)dangerouslySetInnerHTML=\{\{ __html: (.*?) \}\} \/>[ \t]*$/gms,
  (_m, rawAttrs, html) => {
    const type = /type="([^"]+)"/.exec(rawAttrs)?.[1];
    inlineScripts.push({ type, html });
    return "__INLINE_SCRIPT__";
  }
);
head = head
  .split("\n")
  .filter((l) => !l.includes("__INLINE_SCRIPT__"))
  .join("\n");

// 2. Give <style> and <link rel="stylesheet"> a precedence so React keeps them
//    in the head, in source order.
head = head.replace(/<style /g, '<style precedence="site" ');
head = head.replace(
  /<link rel="stylesheet" /g,
  '<link rel="stylesheet" precedence="site" '
);

const scriptJsx = inlineScripts
  .map((s, i) => {
    const typeAttr = s.type ? ` type="${s.type}"` : "";
    return `        <Script
          id="inline-head-${i}"${typeAttr}
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: ${s.html} }}
        />`;
  })
  .join("\n");

const layout = `${banner}
import type { ReactNode } from "react";
import Script from "next/script";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
${scriptJsx}
${head}
      </head>
      <body>{children}</body>
    </html>
  );
}
`;

const pageBody = body.replace(/^[ \t]*__FOOTER__[ \t]*$/m, "      <Footer />");

const page = `${banner}
import Footer from "./footer";
import Scripts from "./scripts";

export default function Page() {
  return (
    <>
${pageBody}
      <Scripts />
    </>
  );
}
`;

writeFileSync("app/layout.tsx", layout);
writeFileSync("app/page.tsx", page);
console.log(
  `wrote app/layout.tsx (${inlineScripts.length} inline head scripts) and app/page.tsx`
);
