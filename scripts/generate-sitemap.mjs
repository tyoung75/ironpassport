/**
 * generate-sitemap.mjs — Generate a static sitemap.xml for the gym pages.
 *
 * Usage: node scripts/generate-sitemap.mjs
 * Run after `next build` to place sitemap.xml in the output directory.
 */

import { writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = "https://www.ironpassport.com";

// Import gym data — we dynamically import to handle ESM
async function main() {
  const { GYMS, getAllCities } = await import("../src/data/gyms.js");

  const today = new Date().toISOString().slice(0, 10);

  const urls = [
    { loc: `${SITE_URL}/`, changefreq: "daily", priority: "1.0", lastmod: today },
  ];

  // Gym pages
  for (const gym of GYMS) {
    urls.push({
      loc: `${SITE_URL}/gym/${gym.slug}/`,
      changefreq: "weekly",
      priority: "0.8",
      lastmod: gym.updatedAt || today,
    });
  }

  // City pages
  for (const city of getAllCities()) {
    urls.push({
      loc: `${SITE_URL}/city/${city.citySlug}/`,
      changefreq: "weekly",
      priority: "0.7",
      lastmod: today,
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  // Try to place in out/ (static export) or public/
  const outDir = resolve(__dirname, "..", "out");
  const publicDir = resolve(__dirname, "..", "public");
  const targetDir = existsSync(outDir) ? outDir : publicDir;
  const outPath = resolve(targetDir, "sitemap.xml");

  writeFileSync(outPath, xml);
  console.log(`Sitemap generated: ${outPath}`);
  console.log(`  ${urls.length} URLs (${GYMS.length} gyms, ${getAllCities().length} cities)`);
}

main().catch((e) => {
  console.error("Error generating sitemap:", e);
  process.exit(1);
});
