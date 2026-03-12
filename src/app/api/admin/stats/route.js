import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/stats
 *
 * Returns a JSON summary of platform statistics.
 * Requires the `x-admin-secret` header to match the ADMIN_STATS_SECRET env var.
 */
export const dynamic = "force-dynamic";

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request) {
  // --- Auth: require x-admin-secret header ---
  const secret = process.env.ADMIN_STATS_SECRET;
  if (!secret) {
    return Response.json(
      { error: "ADMIN_STATS_SECRET is not configured on the server" },
      { status: 500 },
    );
  }

  const provided = request.headers.get("x-admin-secret");
  if (!provided || provided !== secret) {
    return unauthorized();
  }

  // --- Supabase client ---
  const supabase = getSupabase();
  if (!supabase) {
    return Response.json(
      { error: "Supabase is not configured" },
      { status: 500 },
    );
  }

  // --- Gather stats in parallel ---
  const [
    gymsResult,
    citiesResult,
    pageViewsResult,
    stampsResult,
    battlesResult,
    votesResult,
    recentViewsResult,
    topCitiesResult,
  ] = await Promise.all([
    // Total gyms
    supabase.from("gyms").select("*", { count: "exact", head: true }),
    // Total cities
    supabase.from("cities").select("*", { count: "exact", head: true }),
    // Total page views
    supabase.from("page_views").select("*", { count: "exact", head: true }),
    // Total stamps
    supabase.from("stamps").select("*", { count: "exact", head: true }),
    // Total battles
    supabase.from("gym_battles").select("*", { count: "exact", head: true }),
    // Total votes
    supabase.from("battle_votes").select("*", { count: "exact", head: true }),
    // Page views in last 24 hours
    supabase
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 86400000).toISOString()),
    // Top 10 cities by gym count
    supabase.from("gyms").select("city, city_slug"),
  ]);

  // Compute top cities from gym rows
  const cityCounts = {};
  for (const row of topCitiesResult.data || []) {
    const key = row.city_slug || row.city;
    cityCounts[key] = (cityCounts[key] || { name: row.city, count: 0 });
    cityCounts[key].count++;
  }
  const topCities = Object.values(cityCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return Response.json({
    generatedAt: new Date().toISOString(),
    totals: {
      gyms: gymsResult.count ?? 0,
      cities: citiesResult.count ?? 0,
      pageViews: pageViewsResult.count ?? 0,
      stamps: stampsResult.count ?? 0,
      gymBattles: battlesResult.count ?? 0,
      battleVotes: votesResult.count ?? 0,
    },
    last24h: {
      pageViews: recentViewsResult.count ?? 0,
    },
    topCitiesByGymCount: topCities,
  });
}
