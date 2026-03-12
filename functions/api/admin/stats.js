/**
 * GET /api/admin/stats
 *
 * Cloudflare Pages Function that returns a JSON summary of platform statistics.
 * Requires the `x-admin-secret` header to match the ADMIN_STATS_SECRET env var.
 *
 * Set these environment variables in Cloudflare Pages dashboard:
 *   - ADMIN_STATS_SECRET
 *   - SUPABASE_URL
 *   - SUPABASE_ANON_KEY
 */

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS_HEADERS });
}

async function supabaseRpc(url, key, path) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "count=exact",
    },
  });
  const count = parseInt(res.headers.get("content-range")?.split("/")[1], 10);
  return { count: Number.isNaN(count) ? 0 : count, data: await res.json() };
}

export async function onRequestGet(context) {
  const { env, request } = context;

  // --- Auth ---
  const secret = env.ADMIN_STATS_SECRET;
  if (!secret) {
    return json({ error: "ADMIN_STATS_SECRET is not configured" }, 500);
  }
  if (request.headers.get("x-admin-secret") !== secret) {
    return json({ error: "Unauthorized" }, 401);
  }

  // --- Supabase config ---
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    return json({ error: "Supabase is not configured" }, 500);
  }

  // --- Gather counts in parallel ---
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 86400000).toISOString();

  const [gyms, cities, pageViews, stamps, battles, votes, recentViews, gymRows] =
    await Promise.all([
      supabaseRpc(url, key, "gyms?select=*&limit=0"),
      supabaseRpc(url, key, "cities?select=*&limit=0"),
      supabaseRpc(url, key, "page_views?select=*&limit=0"),
      supabaseRpc(url, key, "stamps?select=*&limit=0"),
      supabaseRpc(url, key, "gym_battles?select=*&limit=0"),
      supabaseRpc(url, key, "battle_votes?select=*&limit=0"),
      supabaseRpc(
        url,
        key,
        `page_views?select=*&limit=0&created_at=gte.${oneDayAgo}`,
      ),
      // Fetch city + city_slug for top-cities breakdown
      (async () => {
        const res = await fetch(
          `${url}/rest/v1/gyms?select=city,city_slug`,
          {
            headers: {
              apikey: key,
              Authorization: `Bearer ${key}`,
            },
          },
        );
        return { data: await res.json() };
      })(),
    ]);

  // Compute top cities
  const cityCounts = {};
  for (const row of gymRows.data || []) {
    const k = row.city_slug || row.city;
    if (!cityCounts[k]) cityCounts[k] = { name: row.city, count: 0 };
    cityCounts[k].count++;
  }
  const topCities = Object.values(cityCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return json({
    generatedAt: now.toISOString(),
    totals: {
      gyms: gyms.count,
      cities: cities.count,
      pageViews: pageViews.count,
      stamps: stamps.count,
      gymBattles: battles.count,
      battleVotes: votes.count,
    },
    last24h: {
      pageViews: recentViews.count,
    },
    topCitiesByGymCount: topCities,
  });
}
