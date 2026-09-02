# Portfolio Site

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4.

Structure and content are seeded from khagwal.com as a starting reference; all
copy and data live in `content/site.ts` so they can be swapped in one place.

## Develop
```bash
npm install
npm run dev   # http://localhost:3000
```

## Layout
- `app/layout.tsx` – metadata, skip link, global styles
- `app/page.tsx`   – all page sections (hero, work, values, plugins, threads, certs, gallery, footer)
- `components/`    – client components (e.g. live local time)
- `content/site.ts`– single source of truth for content
- `public/images/` – placeholder imagery (AI-generated, to be replaced)
