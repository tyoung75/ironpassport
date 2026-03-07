/**
 * sync-gyms.mjs — Pull gym data from Supabase and write to src/data/gyms-synced.json
 *
 * Usage: node scripts/sync-gyms.mjs
 *
 * This script:
 * 1. Fetches all gyms from Supabase
 * 2. Generates slugs for any gyms missing them
 * 3. Writes a JSON file that can be imported by the static build
 *
 * Run this before `npm run build` to ensure gym pages are up-to-date.
 * Recommended: run at least weekly to prevent stale data.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = resolve(__dirname, "..", ".env.local");
try {
  const envFile = readFileSync(envPath, "utf-8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
} catch (e) {
  console.error("Could not read .env.local:", e.message);
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function generateSlug(name, city) {
  return `${name} ${city || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateCitySlug(city) {
  return (city || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  console.log("Syncing gyms from Supabase...");
  console.log(`URL: ${SUPABASE_URL}\n`);

  // Fetch all gyms
  const { data: gyms, error } = await supabase
    .from("gyms")
    .select("*")
    .order("city", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch gyms:", error.message);
    process.exit(1);
  }

  console.log(`Fetched ${gyms.length} gyms from Supabase.`);

  // Transform to frontend format
  const transformed = gyms.map((g) => {
    const slug = g.slug || generateSlug(g.name, g.city);
    const citySlug = generateCitySlug(g.city);
    const scores = g.scores || {};

    const overallScore = Math.round(
      (scores.equipment || 0) * 0.20 +
      (scores.cleanliness || 0) * 0.18 +
      (scores.amenities || 0) * 0.14 +
      (scores.staff || 0) * 0.12 +
      (scores.atmosphere || 0) * 0.11 +
      (scores.value || 0) * 0.10 +
      (scores.recovery || 0) * 0.08 +
      (scores.classes || 0) * 0.07
    );

    return {
      id: g.id,
      name: g.name,
      type: g.type || "Gym",
      address: g.address || "",
      neighborhood: g.neighborhood || null,
      city: g.city || "",
      country: g.country || "",
      slug,
      citySlug,
      description: g.description || "",
      scores,
      overallScore,
      dayPassPrice: g.day_pass_price || null,
      weekPassPrice: g.week_pass_price || null,
      passNotes: g.pass_notes || null,
      contactPhone: g.contact_phone || null,
      contactEmail: g.contact_email || null,
      contactWebsite: g.contact_website || null,
      contactInstagram: g.contact_instagram || null,
      tags: g.tags || [],
      highlights: g.highlights || [],
      equipmentList: g.equipment_list || [],
      recoveryAmenities: g.recovery_amenities || [],
      hotelProximity: g.hotel_proximity || null,
      nearbyHotels: g.nearby_hotels || [],
      latitude: g.latitude || null,
      longitude: g.longitude || null,
      photos: g.photos || [],
      updatedAt: g.updated_at ? g.updated_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
    };
  });

  // Detect slug collisions
  const slugCounts = {};
  for (const g of transformed) {
    slugCounts[g.slug] = (slugCounts[g.slug] || 0) + 1;
  }
  const collisions = Object.entries(slugCounts).filter(([, c]) => c > 1);
  if (collisions.length > 0) {
    console.warn("\nSlug collisions detected:");
    for (const [slug, count] of collisions) {
      console.warn(`  "${slug}" appears ${count} times`);
    }
    console.warn("Resolve these before building.\n");
  }

  // Write output
  const outPath = resolve(__dirname, "..", "src", "data", "gyms-synced.json");
  writeFileSync(outPath, JSON.stringify(transformed, null, 2));
  console.log(`\nWrote ${transformed.length} gyms to ${outPath}`);
  console.log("Done! Run `npm run build` to generate static pages.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
