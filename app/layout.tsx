import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `${site.name} – ${site.role}`,
  description:
    "Portfolio of a product designer focused on design systems, accessibility, and human-centered product work.",
  openGraph: {
    title: `${site.name} – ${site.role}`,
    description: "Design systems, accessibility, and human-centered product work.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to main content ↓
        </a>
        {children}
      </body>
    </html>
  );
}
