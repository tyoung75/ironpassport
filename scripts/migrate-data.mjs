/**
 * migrate-data.mjs — One-time migration of hardcoded gym + city data into Supabase
 *
 * Usage: node scripts/migrate-data.mjs
 *
 * This script:
 * 1. Reads 24 gyms from src/data/gyms.js → upserts into Supabase gyms table
 * 2. Reads 60+ gyms from src/lib/city-data.js → upserts (gyms.js data wins on conflict)
 * 3. Reads 12 cities from city-data.js → inserts into cities table
 * 4. Backfills city_slug on all gym rows
 * 5. Verifies every gym has a unique slug and every city has at least one gym
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
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
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function generateGymSlug(name, city) {
  return `${name} ${city}`
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

// ─── Raw gym data from src/data/gyms.js (24 gyms) ───────────────────────────
// We import dynamically to avoid ESM issues
async function loadGymsJsData() {
  const { GYMS } = await import("../src/data/gyms.js");
  return GYMS;
}

// ─── City data from src/lib/city-data.js ─────────────────────────────────────
async function loadCityData() {
  const mod = await import("../src/lib/city-data.js");
  const cities = {};
  for (const slug of mod.ALL_CITY_SLUGS) {
    const data = mod.getCityData(slug);
    if (data) cities[slug] = data;
  }
  return cities;
}

function gymToRow(gym, source = "gyms-js") {
  const slug = gym.slug || generateGymSlug(gym.name, gym.city);
  const citySlug = gym.citySlug || generateCitySlug(gym.city);
  return {
    name: gym.name,
    type: gym.type || "Gym",
    address: gym.address || "",
    neighborhood: gym.neighborhood || null,
    city: gym.city || "",
    country: gym.country || "",
    slug,
    city_slug: citySlug,
    description: gym.description || "",
    scores: gym.scores || {},
    day_pass_price: gym.dayPassPrice || null,
    week_pass_price: gym.weekPassPrice || null,
    pass_notes: gym.passNotes || null,
    contact_phone: gym.contactPhone || null,
    contact_email: gym.contactEmail || null,
    contact_website: gym.contactWebsite || null,
    contact_instagram: gym.contactInstagram || null,
    tags: gym.tags || [],
    highlights: gym.highlights || [],
    equipment_list: gym.equipmentList || [],
    recovery_amenities: gym.recoveryAmenities || [],
    hotel_proximity: gym.hotelProximity || null,
    nearby_hotels: gym.nearbyHotels || [],
    data_source: source,
  };
}

async function main() {
  console.log("=== Iron Passport Data Migration ===\n");

  // 1. Load hardcoded data
  console.log("Loading hardcoded data...");
  const gymsJsData = await loadGymsJsData();
  const cityData = await loadCityData();

  console.log(`  gyms.js: ${gymsJsData.length} gyms`);
  console.log(`  city-data.js: ${Object.keys(cityData).length} cities`);

  // 2. Upsert gyms.js data (canonical, wins conflicts)
  console.log("\nUpserting gyms.js gyms (canonical data)...");
  const gymsJsRows = gymsJsData.map((g) => gymToRow(g, "gyms-js"));

  for (const row of gymsJsRows) {
    const { error } = await supabase
      .from("gyms")
      .upsert(row, { onConflict: "slug" });
    if (error) {
      console.error(`  Error upserting "${row.name}": ${error.message}`);
    } else {
      console.log(`  ✓ ${row.name} (${row.city})`);
    }
  }

  // 3. Upsert city-data.js gyms (only if they don't conflict with gyms.js slugs)
  console.log("\nUpserting city-data.js gyms...");
  const existingSlugs = new Set(gymsJsRows.map((r) => r.slug));
  let cityGymCount = 0;

  for (const [citySlug, city] of Object.entries(cityData)) {
    for (const gym of city.gyms) {
      const slug = generateGymSlug(gym.name, gym.city);

      // Skip if already covered by gyms.js (canonical data wins)
      if (existingSlugs.has(slug)) {
        console.log(`  ⊘ Skipped "${gym.name}" (already in gyms.js)`);
        continue;
      }

      const row = gymToRow(gym, "city-data");
      row.slug = slug;
      row.city_slug = citySlug;

      const { error } = await supabase
        .from("gyms")
        .upsert(row, { onConflict: "slug" });

      if (error) {
        console.error(`  Error upserting "${gym.name}": ${error.message}`);
      } else {
        console.log(`  ✓ ${gym.name} (${gym.city})`);
        cityGymCount++;
        existingSlugs.add(slug);
      }
    }
  }

  console.log(`  Added ${cityGymCount} additional gyms from city-data.js`);

  // 4. Insert cities
  console.log("\nInserting cities...");
  for (const [slug, city] of Object.entries(cityData)) {
    const row = {
      slug,
      name: city.name,
      country: city.country,
      region: city.region || null,
      description: city.description || null,
      nearby_destinations: city.nearbyDestinations || [],
      related_cities: city.relatedCities || [],
      faqs: city.faqs || null,
    };

    const { error } = await supabase
      .from("cities")
      .upsert(row, { onConflict: "slug" });

    if (error) {
      console.error(`  Error inserting city "${city.name}": ${error.message}`);
    } else {
      console.log(`  ✓ ${city.name} (${slug})`);
    }
  }

  // 5. Also create city rows for cities that only exist in gyms.js but not city-data.js
  console.log("\nCreating city rows for gyms.js-only cities...");
  const cityDataSlugs = new Set(Object.keys(cityData));

  // Collect unique cities from gyms.js
  const gymsJsCities = new Map();
  for (const g of gymsJsData) {
    const cs = generateCitySlug(g.city);
    if (!cityDataSlugs.has(cs) && !gymsJsCities.has(cs)) {
      gymsJsCities.set(cs, { name: g.city, country: g.country });
    }
  }

  for (const [slug, info] of gymsJsCities) {
    const row = {
      slug,
      name: info.name,
      country: info.country,
      nearby_destinations: [],
      related_cities: [],
    };

    const { error } = await supabase
      .from("cities")
      .upsert(row, { onConflict: "slug" });

    if (error) {
      console.error(`  Error inserting city "${info.name}": ${error.message}`);
    } else {
      console.log(`  ✓ ${info.name} (${slug})`);
    }
  }

  // 6. Backfill city_slug on all gym rows
  console.log("\nBackfilling city_slug on all gym rows...");
  const { data: allGyms } = await supabase
    .from("gyms")
    .select("id, city, city_slug")
    .is("city_slug", null);

  if (allGyms && allGyms.length > 0) {
    for (const g of allGyms) {
      const cs = generateCitySlug(g.city);
      await supabase.from("gyms").update({ city_slug: cs }).eq("id", g.id);
    }
    console.log(`  Updated ${allGyms.length} gym rows`);
  } else {
    console.log("  All gym rows already have city_slug");
  }

  // 7. Verification
  console.log("\n=== Verification ===");

  const { count: gymCount } = await supabase
    .from("gyms")
    .select("*", { count: "exact", head: true });
  console.log(`Total gyms in Supabase: ${gymCount}`);

  const { count: cityCount } = await supabase
    .from("cities")
    .select("*", { count: "exact", head: true });
  console.log(`Total cities in Supabase: ${cityCount}`);

  // Check for gyms without city_slug
  const { count: noCitySlug } = await supabase
    .from("gyms")
    .select("*", { count: "exact", head: true })
    .is("city_slug", null);
  if (noCitySlug > 0) {
    console.warn(`⚠ ${noCitySlug} gyms missing city_slug`);
  } else {
    console.log("✓ All gyms have city_slug");
  }

  // Check for slug uniqueness
  const { data: slugCheck } = await supabase
    .from("gyms")
    .select("slug");
  const slugSet = new Set();
  const dupes = [];
  for (const g of slugCheck || []) {
    if (slugSet.has(g.slug)) dupes.push(g.slug);
    slugSet.add(g.slug);
  }
  if (dupes.length > 0) {
    console.warn(`⚠ Duplicate slugs: ${dupes.join(", ")}`);
  } else {
    console.log("✓ All gym slugs are unique");
  }

  // Check cities have gyms
  const { data: citiesData } = await supabase.from("cities").select("slug, name");
  for (const city of citiesData || []) {
    const { count } = await supabase
      .from("gyms")
      .select("*", { count: "exact", head: true })
      .eq("city_slug", city.slug);
    if (!count || count === 0) {
      console.warn(`⚠ City "${city.name}" (${city.slug}) has no gyms`);
    }
  }

  console.log("\n✓ Migration complete!");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
