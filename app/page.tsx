import Image from "next/image";
import LocalTime from "@/components/LocalTime";
import {
  site,
  work,
  values,
  plugins,
  threads,
  certifications,
  gallery,
} from "@/content/site";

function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`mx-auto w-full max-w-6xl px-6 py-20 sm:py-28 ${className}`}
    >
      {children}
    </section>
  );
}

export default function Home() {
  return (
    <main id="main">
      {/* Hero */}
      <Section className="pt-24 sm:pt-32">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div className="reveal">
            <p className="mb-6 text-sm uppercase tracking-[0.2em] text-muted">
              {site.name} — {site.role}
            </p>
            <h1 className="text-balance text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
              {site.headline[0]}
              <span className="block text-muted">{site.headline[1]}</span>
            </h1>
            <div className="mt-10 flex items-baseline gap-3">
              <span className="text-5xl font-semibold tabular-nums">
                {site.years}
              </span>
              <span className="max-w-xs text-sm text-muted">
                Yrs. {site.yearsCopy}
              </span>
            </div>
          </div>

          <div className="reveal">
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-black/5">
              <Image
                src={site.portrait}
                alt={site.name}
                fill
                priority
                sizes="(min-width: 768px) 30vw, 90vw"
                className="object-cover"
              />
            </div>
            <p className="mt-4 text-sm text-muted">
              Based in {site.location} —{" "}
              <LocalTime timezone={site.timezone} label={site.timezoneLabel} />
            </p>
          </div>
        </div>
      </Section>

      {/* Selected work */}
      <Section id="work">
        <h2 className="mb-10 text-sm uppercase tracking-[0.2em] text-muted">
          Selected work
        </h2>
        {work.map((item) => (
          <article
            key={item.title}
            className="group overflow-hidden rounded-3xl bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)] ring-1 ring-black/5"
          >
            <div className="relative aspect-16/9 w-full overflow-hidden">
              <Image
                src={item.cover}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 1100px, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
            <div className="grid gap-8 p-8 md:grid-cols-[1fr_1fr] sm:p-10">
              <div>
                <p className="text-sm text-muted">{item.period}</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-4 max-w-md text-lg text-muted">
                  {item.summary}
                </p>
              </div>
              <ul className="flex flex-wrap content-start gap-2">
                {item.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-black/5 px-3 py-1.5 text-sm text-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </Section>

      {/* Values */}
      <Section id="values">
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          My design values —
        </h2>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {values.map((v, i) => (
            <div key={v.title} className="border-t border-black/10 pt-6">
              <span className="text-sm tabular-nums text-muted">
                0{i + 1}
              </span>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                {v.title}
              </h3>
              <p className="mt-3 text-muted">{v.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Plugins */}
      <Section id="plugins">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">
          Figma plugins & widgets
        </p>
        <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          I make things for people who design things.
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {plugins.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-5 rounded-2xl bg-white p-6 ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`size-16 shrink-0 rounded-2xl bg-linear-to-br ${p.accent}`}
              />
              <div>
                <p className="text-xl font-semibold tracking-tight">{p.name}</p>
                <p className="text-sm text-muted">{p.kind} ↗</p>
              </div>
            </a>
          ))}
        </div>
      </Section>

      {/* Threads */}
      <Section id="writing">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          I share threads about design systems & tools —
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {threads.map((t) => (
            <a
              key={t.title}
              href={t.href}
              target="_blank"
              rel="noreferrer"
              className={`group flex aspect-4/5 flex-col justify-end rounded-2xl bg-linear-to-br ${t.accent} p-6 text-white transition hover:-translate-y-1 hover:shadow-lg`}
            >
              <span className="text-xl font-semibold leading-tight">
                {t.title}
              </span>
              <span className="mt-2 text-sm opacity-80">Read ↗</span>
            </a>
          ))}
        </div>
        <p className="mt-8 text-muted">
          find out more at{" "}
          <a
            className="underline underline-offset-4 hover:text-ink"
            href="https://twitter.com/nitishkmrk"
            target="_blank"
            rel="noreferrer"
          >
            Twitter ↗
          </a>
        </p>
      </Section>

      {/* Certifications */}
      <Section id="certifications">
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Certifications
        </h2>
        <ul className="mt-10 divide-y divide-black/10 border-y border-black/10">
          {certifications.map((c) => (
            <li
              key={c.title}
              className="flex flex-wrap items-baseline justify-between gap-2 py-5"
            >
              <span className="text-lg font-medium">{c.title}</span>
              <a
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted underline underline-offset-4 hover:text-ink"
              >
                {c.issuer} ↗
              </a>
            </li>
          ))}
        </ul>
      </Section>

      {/* Gallery */}
      <Section id="gallery">
        <div className="grid gap-4 sm:grid-cols-3">
          {gallery.map((g) => (
            <div
              key={g.src + g.alt}
              className="relative aspect-square overflow-hidden rounded-2xl bg-black/5"
            >
              <Image
                src={g.src}
                alt={g.alt}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-black/10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-12">
          <a
            href={`mailto:${site.email}`}
            className="text-2xl font-semibold tracking-tight underline underline-offset-4"
          >
            {site.email}
          </a>
          <nav className="flex gap-6 text-sm text-muted">
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink"
              >
                {s.label} ↗
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  );
}
