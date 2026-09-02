/* Footer: moon-white panel with a stamp-edge checker and a fitted headline.
 *
 * The only part of the page that is not a verbatim port. The generator swaps
 * the original <footer> for this; the original markup is preserved at
 * tools/generated-footer-original.jsx.txt. All original content is carried
 * over, including the Cloudflare email markup byte-for-byte.
 *
 * The headline is SVG, not styled text. Its viewBox comes from the real ink
 * bounds of the string in Instrument Sans at wdth 75 / wght 700, measured by
 * tools/measure-headline.py and recorded in app/headline-metrics.json. That
 * makes it fill the panel width exactly at every viewport instead of being
 * guessed at with clamp(), and it cannot silently fall back to a wrong face.
 */
import styles from "./footer.module.css";

// Ink bounds of "Let’s talk" in font units, from app/headline-metrics.json.
const HEADLINE = "Let’s talk";
const INK = { x0: 50, x1: 3278, yTop: 742, yBottom: -10 };
const BOX = { w: INK.x1 - INK.x0, h: INK.yTop - INK.yBottom };

// The font's own asterisk outline, so the shape matches the headline and
// rotation happens around the true centre of the ink.
const ASTERISK =
  "M144 410 170 518 89 441 30 544 137 575 30 606 89 709 170 632 144 740H262L236 632L317 709L376 606L269 575L376 544L317 441L236 518L262 410Z";

const SOCIALS = [
  { label: "X", href: "https://twitter.com/nitishkmrk" },
  { label: "Behance", href: "https://www.behance.net/nitishkmrk" },
  { label: "Dribbble", href: "https://dribbble.com/nitishkmrk/" },
  { label: "Medium", href: "https://medium.com/@nitishkmrk" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/nitishkmrk/" },
  { label: "Instagram", href: "https://www.instagram.com/nitishkmrk/" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.panel}>
        {/* Stamp edge: solid band, then square teeth biting into the panel. */}
        <div className={styles.edge} aria-hidden="true">
          <span className={styles.edgeBand} />
          <span className={styles.edgeTeeth} />
        </div>

        <div className={styles.body}>
          <svg
            className={styles.asterisk}
            viewBox="0 0 346 330"
            aria-hidden="true"
          >
            <path d={ASTERISK} transform="translate(-30, 740) scale(1, -1)" />
          </svg>

          <h2 className={styles.headline}>
            <svg
              viewBox={`0 0 ${BOX.w} ${BOX.h}`}
              role="img"
              aria-label={HEADLINE}
            >
              <text x={-INK.x0} y={INK.yTop} fontSize={1000}>
                {HEADLINE}
              </text>
            </svg>
          </h2>

          <div className={styles.meta}>
            <div className={styles.metaLeft}>
              <a
                className={styles.email}
                href="https://khagwal.com/cdn-cgi/l/email-protection#f69e938fb69d9e979181979ad895999b"
                target="_blank"
                rel="noopenner"
              >
                <span
                  className="__cf_email__"
                  data-cfemail="95fdf0ecd5fefdf4f2e2f4f9bbf6faf8"
                >
                  [email&#160;protected]
                </span>
              </a>
              <p className={styles.copy}>© 2025 Nitish Khagwal</p>
            </div>

            <ul className={styles.links}>
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopenner">
                    {s.label}
                    <span aria-hidden="true"> ↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
