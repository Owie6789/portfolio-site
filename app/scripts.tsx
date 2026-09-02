/* The two <script src> tags that closed the original <body>.
 *
 * They are emitted as plain script elements at the end of the page, exactly
 * where they sat in the source document. `defer` keeps the original execution
 * timing (after the document has been parsed, before DOMContentLoaded), which
 * is what an end-of-body script does and what main.js expects — it queries
 * .nav-control, main, .timestamp, .mosaic-keyboard video etc. on execution.
 */
export default function Scripts() {
  return (
    <>
      <script
        data-cfasync="false"
        src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"
        defer
      />
      <script src="/dist/main.js@v1.0.2" defer />
    </>
  );
}
