/* The two <script src> tags that closed the original <body>.
 *
 * IMPORTANT — timing. In the original static page these ran immediately after
 * the DOM was parsed, and nothing touched the DOM afterwards. Under React that
 * is no longer safe: a plain <script defer> executes BEFORE hydration, so
 * anything it writes into the DOM is then clobbered when React hydrates.
 *
 * That breaks two things:
 *   - main.js (GSAP) sets inline transforms on .grd-cut span, .sticky-arrow,
 *     .magic-* etc. Losing that inline transform also destroys the containing
 *     block for their position:absolute ::before squares, so those grey blocks
 *     jump out of place.
 *   - Cloudflare's email-decode rewrites "[email protected]" to the real
 *     address; hydration restores the server-rendered placeholder text.
 *
 * strategy="afterInteractive" runs them after hydration, with the full DOM
 * present — same DOM, same scripts, just no longer racing React.
 */
import Script from "next/script";
import SmoothScroll from "./smooth-scroll";

export default function Scripts() {
  return (
    <>
      <Script
        data-cfasync="false"
        src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"
        strategy="afterInteractive"
      />
      <Script src="/dist/main.js@v1.0.2" strategy="afterInteractive" />
      <SmoothScroll />
    </>
  );
}
