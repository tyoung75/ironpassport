/**
 * Generates sitemap.xml in the public/ directory.
 * Run before `next build` or as part of the build pipeline.
 *
 * Usage: node scripts/generate-sitemap.mjs
 */

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = "https://ironpassport.com";

// City slugs — keep in sync with src/lib/city-data.js
const CITY_SLUGS = [
  "new-york",
  "austin",
  "london",
  "los-angeles",
  "tokyo",
  "miami",
  "chicago",
  "denver",
  "barcelona",
  "dubai",
  "sydney",
  "singapore",
];

const now = new Date().toISOString().split("T")[0];

async function main() {
  const urls = [
    { loc: BASE_URL, priority: "1.0", changefreq: "weekly" },
    { loc: `${BASE_URL}/best-gyms`, priority: "0.9", changefreq: "weekly" },
    ...CITY_SLUGS.map((slug) => ({
      loc: `${BASE_URL}/best-gyms/${slug}`,
      priority: "0.8",
      changefreq: "monthly",
    })),
  ];

  // Add individual gym profile pages if gym data is available
  try {
    const { GYMS } = await import("../src/data/gyms.js");
    for (const gym of GYMS) {
      urls.push({
        loc: `${BASE_URL}/gym/${gym.slug}/`,
        priority: "0.7",
        changefreq: "monthly",
      });
    }
  } catch {
    console.log("Note: No gym data found, skipping individual gym pages in sitemap");
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n")}
</urlset>`;

  const outPath = resolve(__dirname, "..", "public", "sitemap.xml");
  writeFileSync(outPath, xml, "utf-8");
  console.log(`✓ Sitemap written to ${outPath} (${urls.length} URLs)`);
}

main().catch((e) => {
  console.error("Error generating sitemap:", e);
  process.exit(1);
});
