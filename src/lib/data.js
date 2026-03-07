/**
 * Unified data layer — fetches gyms and cities from Supabase.
 * Replaces src/data/gyms.js and src/lib/city-data.js.
 */

import { getSupabaseServer } from "./supabase-server";
import { generateGymSlug, generateCitySlug } from "./slugify";
import { calcOverallScore, generateCityFAQs } from "./city-helpers";

const CURRENT_YEAR = new Date().getFullYear();

// ─── Gym transform ──────────────────────────────────────────────────────────

/** Convert a Supabase gym row (snake_case) to frontend camelCase object */
export function transformGym(row) {
  const scores = row.scores || {};
  const slug = row.slug || generateGymSlug(row.name, row.city);
  const citySlug = row.city_slug || generateCitySlug(row.city);

  return {
    id: row.id,
    name: row.name,
    type: row.type || "Gym",
    address: row.address || "",
    neighborhood: row.neighborhood || null,
    city: row.city || "",
    country: row.country || "",
    slug,
    citySlug,
    description: row.description || "",
    scores,
    overallScore: calcOverallScore(scores),
    dayPassPrice: row.day_pass_price || null,
    weekPassPrice: row.week_pass_price || null,
    passNotes: row.pass_notes || null,
    contactPhone: row.contact_phone || null,
    contactEmail: row.contact_email || null,
    contactWebsite: row.contact_website || null,
    contactInstagram: row.contact_instagram || null,
    tags: row.tags || [],
    highlights: row.highlights || [],
    equipmentList: row.equipment_list || [],
    recoveryAmenities: row.recovery_amenities || [],
    hotelProximity: row.hotel_proximity || null,
    nearbyHotels: row.nearby_hotels || [],
    latitude: row.latitude || null,
    longitude: row.longitude || null,
    photos: row.photos || [],
    updatedAt: row.updated_at
      ? new Date(row.updated_at).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  };
}

// ─── Gym queries ─────────────────────────────────────────────────────────────

/** Get all gyms from Supabase */
export async function getAllGyms() {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("gyms")
    .select("*")
    .order("city")
    .order("name");
  if (error) {
    console.error("getAllGyms error:", error.message);
    return [];
  }
  return (data || []).map(transformGym);
}

/** Get a single gym by slug */
export async function getGymBySlug(slug) {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("gyms")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  return transformGym(data);
}

/** Get all gyms in a city by city_slug */
export async function getGymsByCity(citySlug) {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("gyms")
    .select("*")
    .eq("city_slug", citySlug)
    .order("name");
  if (error) {
    console.error("getGymsByCity error:", error.message);
    return [];
  }
  return (data || []).map(transformGym);
}

/** Get similar gyms (same city or same type, excluding self) */
export async function getSimilarGyms(gym, limit = 4) {
  const supabase = getSupabaseServer();
  if (!supabase) return [];

  // Get gyms in same city
  const { data: cityGyms } = await supabase
    .from("gyms")
    .select("*")
    .eq("city_slug", gym.citySlug)
    .neq("slug", gym.slug)
    .limit(limit);

  // Get gyms of same type
  const { data: typeGyms } = await supabase
    .from("gyms")
    .select("*")
    .eq("type", gym.type)
    .neq("slug", gym.slug)
    .limit(limit);

  // Merge, deduplicate, prefer same-city
  const seen = new Set();
  const results = [];

  for (const g of [...(cityGyms || []), ...(typeGyms || [])]) {
    if (!seen.has(g.slug)) {
      seen.add(g.slug);
      results.push(transformGym(g));
    }
    if (results.length >= limit) break;
  }

  return results;
}

/** Get all gym slugs (for generateStaticParams) */
export async function getAllGymSlugs() {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("gyms")
    .select("slug");
  if (error) return [];
  return (data || []).map((g) => g.slug);
}

// ─── City queries ────────────────────────────────────────────────────────────

/** Get a city by slug, including its gyms */
export async function getCityBySlug(slug) {
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  const { data: city, error } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !city) return null;

  // Get gyms for this city
  const gyms = await getGymsByCity(slug);

  // Sort by overall score descending
  gyms.sort((a, b) => b.overallScore - a.overallScore);

  // Add profilePath to each gym
  const gymsWithPaths = gyms.map((g) => ({
    ...g,
    profilePath: `/gym/${g.slug}`,
  }));

  return {
    slug: city.slug,
    name: city.name,
    country: city.country,
    region: city.region,
    description: city.description,
    nearbyDestinations: city.nearby_destinations || [],
    relatedCities: city.related_cities || [],
    gyms: gymsWithPaths,
    faqs: city.faqs || generateCityFAQs(city.name, city.country),
    year: CURRENT_YEAR,
  };
}

/** Get all cities with basic info (for index page) */
export async function getAllCities() {
  const supabase = getSupabaseServer();
  if (!supabase) return [];

  const { data: cities, error } = await supabase
    .from("cities")
    .select("slug, name, country, region")
    .order("name");

  if (error) {
    console.error("getAllCities error:", error.message);
    return [];
  }

  // Get gym counts per city
  const result = await Promise.all(
    (cities || []).map(async (city) => {
      const { count } = await supabase
        .from("gyms")
        .select("*", { count: "exact", head: true })
        .eq("city_slug", city.slug);
      return {
        slug: city.slug,
        name: city.name,
        country: city.country,
        region: city.region,
        gymCount: count || 0,
      };
    })
  );

  return result;
}

/** Get all city slugs (for generateStaticParams) */
export async function getAllCitySlugs() {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("cities")
    .select("slug");
  if (error) return [];
  return (data || []).map((c) => c.slug);
}

/** Get nearby destination data for internal linking */
export async function getNearbyDestinations(slug) {
  const supabase = getSupabaseServer();
  if (!supabase) return [];

  const { data: city } = await supabase
    .from("cities")
    .select("nearby_destinations")
    .eq("slug", slug)
    .single();

  if (!city || !city.nearby_destinations) return [];

  const results = [];
  for (const destSlug of city.nearby_destinations) {
    const { data: dest } = await supabase
      .from("cities")
      .select("slug, name, country")
      .eq("slug", destSlug)
      .single();

    if (dest) {
      const { count } = await supabase
        .from("gyms")
        .select("*", { count: "exact", head: true })
        .eq("city_slug", destSlug);

      results.push({
        slug: dest.slug,
        name: dest.name,
        country: dest.country,
        gymCount: count || 0,
      });
    }
  }

  return results;
}

/** Get related city data for internal linking */
export async function getRelatedCities(slug) {
  const supabase = getSupabaseServer();
  if (!supabase) return [];

  const { data: city } = await supabase
    .from("cities")
    .select("related_cities")
    .eq("slug", slug)
    .single();

  if (!city || !city.related_cities) return [];

  const results = [];
  for (const relSlug of city.related_cities) {
    const { data: rel } = await supabase
      .from("cities")
      .select("slug, name, country")
      .eq("slug", relSlug)
      .single();

    if (rel) {
      const { count } = await supabase
        .from("gyms")
        .select("*", { count: "exact", head: true })
        .eq("city_slug", relSlug);

      results.push({
        slug: rel.slug,
        name: rel.name,
        country: rel.country,
        gymCount: count || 0,
      });
    }
  }

  return results;
}
