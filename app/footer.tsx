/* Footer: moon-white panel.
 *
 * This is the one part of the page that is NOT a verbatim port. Everything
 * else is generated from tools/original-index.html; the generator swaps the
 * original <footer> for this component. The original markup is preserved at
 * tools/generated-footer-original.jsx.txt.
 *
 * Content is unchanged from the original footer: same six social links, same
 * copyright, and the Cloudflare-obfuscated email markup byte-for-byte so the
 * decode script still resolves it.
 */
import styles from "./footer.module.css";

// The original heading. Switch to "Let's talk" to match the reference exactly.
const HEADLINE = "Let’s connect async";

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
        <div className={styles.checker} aria-hidden="true">
          <span className={styles.checkerBand} />
          <span className={styles.checkerTeeth} />
        </div>

        <div className={styles.body}>
          <span className={styles.asterisk} aria-hidden="true">
            *
          </span>

          <h2 className={styles.headline}>
            {HEADLINE.split(" ").map((word, i) => (
              <span key={i} className={styles.word}>
                {word}
              </span>
            ))}
          </h2>

          <div className={styles.meta}>
            <p className={styles.copy}>© 2025 Nitish Khagwal</p>

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

            <ul className={styles.links}>
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopenner">
                    {s.label} <span aria-hidden="true">↗</span>
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
