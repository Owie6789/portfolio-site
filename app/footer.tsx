/* Footer: moon-white panel with a stamp-edge checker and a fitted headline.
 *
 * The only part of the page that is not a verbatim port. The generator swaps
 * the original <footer> for this; the original markup is preserved at
 * tools/generated-footer-original.jsx.txt. All original content is carried
 * over, including the Cloudflare email markup byte-for-byte.
 *
 * The headline is SVG, not styled text. Its viewBox is built from the real ink
 * bounds of the string in Instrument Sans at wdth 75 / wght 700, measured by
 * tools/measure-headline.py and recorded in app/headline-metrics.json, plus
 * the tracking added below. It therefore fills the panel width exactly at
 * every viewport, and the letter spacing is real spacing rather than a
 * stretched font.
 */
import FooterAsterisk from "./footer-asterisk";
import styles from "./footer.module.css";

const HEADLINE = "Let’s talk";

// Ink bounds in font units (upm 1000), from app/headline-metrics.json.
const INK = { x0: 50, x1: 3278, yTop: 742, yBottom: -10 };

// Tracking, in the same units. The reference sits wide and open, so the
// letters get 5.2% of an em between them and the word gap is opened further.
const LETTER = 52;
const WORD = 120;

const gaps = HEADLINE.length - 1;
const spaces = (HEADLINE.match(/ /g) || []).length;
const BOX = {
  w: INK.x1 - INK.x0 + LETTER * gaps + WORD * spaces,
  h: INK.yTop - INK.yBottom,
};

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
          <div className={styles.top}>
            <FooterAsterisk
              path={ASTERISK}
              className={styles.asterisk}
              fieldClassName={styles.asteriskField}
            />
          </div>

          <h2 className={styles.headline}>
            <svg
              viewBox={`0 0 ${BOX.w} ${BOX.h}`}
              role="img"
              aria-label={HEADLINE}
            >
              <text
                x={-INK.x0}
                y={INK.yTop}
                fontSize={1000}
                letterSpacing={LETTER}
                wordSpacing={WORD}
              >
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
                    <span className={styles.linkLabel}>{s.label}</span>
                    <span className={styles.arrow} aria-hidden="true">
                      ↗
                    </span>
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
