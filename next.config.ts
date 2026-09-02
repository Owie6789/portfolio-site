import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The original markup links to "index.html" (canonical, skip link, nav
  // "Home"). Serving that path from the same page keeps those links working
  // without touching the markup.
  async rewrites() {
    return [{ source: "/index.html", destination: "/" }];
  },
  // main.js@v1.0.2 has no .js extension, so it would be served as
  // application/octet-stream and refused by the browser.
  async headers() {
    return [
      {
        source: "/dist/main.js@v1.0.2",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=UTF-8" },
        ],
      },
    ];
  },
};

export default nextConfig;
