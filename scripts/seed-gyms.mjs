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
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const API = "https://ironpassport.tylerjyoung5.workers.dev";

const GYM_CRITERIA = [
  "equipment (20%)", "cleanliness (18%)", "amenities (14%)", "staff (12%)",
  "atmosphere (11%)", "value (10%)", "recovery (8%)", "classes (7%)",
];

const US_CITIES = [
  "New York City", "Los Angeles", "Chicago", "Houston", "Phoenix",
  "Philadelphia", "San Antonio", "San Diego", "Dallas", "Austin",
  "San Francisco", "Seattle", "Denver", "Washington DC", "Nashville",
  "Miami", "Atlanta", "Boston", "Minneapolis", "Portland",
  "Las Vegas", "Charlotte", "Detroit", "Tampa", "Orlando",
];

const CA_CITIES = [
  "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton",
  "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Halifax",
  "Victoria", "Saskatoon", "Regina", "Kelowna", "London ON",
  "Kitchener", "St Johns", "Barrie", "Windsor", "Oshawa",
  "Mississauga", "Brampton", "Surrey", "Burnaby", "Markham",
];

const MX_CITIES = [
  "Mexico City", "Guadalajara", "Monterrey", "Cancun", "Puebla",
  "Tijuana", "Merida", "Leon", "Queretaro", "Playa del Carmen",
  "San Miguel de Allende", "Oaxaca", "Puerto Vallarta", "Cabo San Lucas", "Tulum",
  "Aguascalientes", "Chihuahua", "Morelia", "Hermosillo", "Toluca",
  "San Luis Potosi", "Mazatlan", "Veracruz", "Villahermosa", "Durango",
];

const INTL_CITIES = [
  // Europe
  "London", "Paris", "Berlin", "Madrid", "Rome", "Amsterdam", "Barcelona",
  "Vienna", "Prague", "Budapest", "Warsaw", "Lisbon", "Stockholm", "Oslo",
  "Copenhagen", "Helsinki", "Dublin", "Brussels", "Zurich", "Edinburgh",
  "Athens", "Istanbul", "Bucharest", "Belgrade",
  // East Asia
  "Tokyo", "Seoul", "Shanghai", "Beijing", "Hong Kong", "Taipei", "Singapore",
  // Southeast Asia
  "Bangkok", "Kuala Lumpur", "Jakarta", "Manila", "Ho Chi Minh City",
  // South Asia
  "Mumbai", "Delhi", "Bangalore",
  // Africa
  "Cape Town", "Johannesburg", "Nairobi", "Lagos", "Cairo", "Casablanca",
  // South America
  "Sao Paulo", "Rio de Janeiro", "Buenos Aires", "Bogota", "Lima",
  "Santiago", "Medellin", "Montevideo", "Quito",
  // Oceania
  "Sydney", "Melbourne", "Auckland", "Brisbane", "Perth",
  // Middle East
  "Dubai", "Tel Aviv", "Doha", "Riyadh", "Abu Dhabi",
];

const NA_CITIES = [...US_CITIES, ...CA_CITIES, ...MX_CITIES];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchGyms(city, count) {
  const sys = `You are IronPassport. Find the top ${count} real gyms in ${city} stack-ranked for travelers.
SCORING (0-100 per criterion):
${GYM_CRITERIA.map(c => `- ${c}`).join("\n")}
Return JSON array of exactly ${count}:
{"name":string,"type":string,"address":string,"neighborhood":string,"city":string,"country":string,"whyRecommended":string,"description":string,"scores":{"equipment":0-100,"cleanliness":0-100,"amenities":0-100,"staff":0-100,"atmosphere":0-100,"value":0-100,"recovery":0-100,"classes":0-100},"dayPassAvailable":bool,"dayPassPrice":"$XX"|null,"weekPassAvailable":bool,"weekPassPrice":"$XX"|null,"passNotes":string|null,"contactPhone":string|null,"contactEmail":string|null,"contactWebsite":string|null,"contactInstagram":string|null,"tags":[3-6 strings],"highlights":[{"icon":emoji,"label":string,"value":string}x4-5]}
Use real gym names. Include real contact info where known. Differentiate scores. Respond ONLY with valid JSON array.`;

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: count > 10 ? 8000 : 4000,
      system: sys,
      messages: [{ role: "user", content: `Best gyms in ${city}` }],
    }),
  });

  const data = await res.json();
  const text = data.content?.map(b => b.text || "").join("") || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

function makeSlug(name, city) {
  const n = (name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const c = (city || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${n}-${c}`;
}

async function upsertGyms(gyms) {
  let count = 0;
  for (const g of gyms) {
    const { error } = await supabase.from("gyms").upsert({
      slug: makeSlug(g.name, g.city),
      name: g.name,
      type: g.type,
      address: g.address,
      neighborhood: g.neighborhood || null,
      city: g.city || null,
      country: g.country || null,
      description: g.description || g.whyRecommended || null,
      day_pass_price: g.dayPassPrice || null,
      week_pass_price: g.weekPassPrice || null,
      pass_notes: g.passNotes || null,
      contact_phone: g.contactPhone || null,
      contact_email: g.contactEmail || null,
      contact_website: g.contactWebsite || null,
      contact_instagram: g.contactInstagram || null,
      scores: g.scores || null,
      amenities: g.amenities || null,
      latitude: g.latitude || null,
      longitude: g.longitude || null,
      photos: g.photos || null,
      data_source: "seed",
      updated_at: new Date().toISOString(),
    }, { onConflict: "name,address" });
    if (error) console.error(`  ✗ ${g.name}: ${error.message}`);
    else count++;
  }
  return count;
}

async function seedCity(city, count) {
  console.log(`\n→ ${city} (${count} gyms)…`);
  try {
    const gyms = await fetchGyms(city, count);
    const saved = await upsertGyms(gyms);
    console.log(`  ✓ ${saved}/${gyms.length} gyms saved`);
  } catch (e) {
    console.error(`  ✗ Error: ${e.message}`);
  }
}

async function main() {
  console.log("🏋️ Iron Passport Gym Seeder");
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log(`API: ${API}\n`);

  const allCities = [
    ...NA_CITIES.map(c => ({ city: c, count: 20 })),
    ...INTL_CITIES.map(c => ({ city: c, count: 5 })),
  ];

  console.log(`Total: ${allCities.length} cities`);
  const totalGyms = allCities.reduce((a, c) => a + c.count, 0);
  console.log(`Expected: ~${totalGyms} gyms\n`);

  for (let i = 0; i < allCities.length; i++) {
    const { city, count } = allCities[i];
    console.log(`[${i + 1}/${allCities.length}]`);
    await seedCity(city, count);
    if (i < allCities.length - 1) await sleep(2000);
  }

  console.log("\n✅ Seeding complete!");
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
