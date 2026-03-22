/**
 * Push Iron Passport stats to ruhrohhalp stats relay.
 *
 * Called by Vercel cron every 6 hours.
 * Reads stats from Supabase, then POSTs to ruhrohhalp.com/api/app-stats/ironpassport.
 *
 * Env vars required:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  — already in Iron Passport env
 *   RUHROHHALP_WEBHOOK_SECRET                            — add to Vercel env
 *   RUHROHHALP_URL                                       — default: https://ruhrohhalp.com
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RUHROHHALP_URL = process.env.RUHROHHALP_URL || 'https://ruhrohhalp.com';
const RUHROHHALP_SECRET = process.env.RUHROHHALP_WEBHOOK_SECRET;

async function gatherIronPassportStats() {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  // Total users (profiles or auth.users — adjust table name to your schema)
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Pro subscribers
  const { count: proSubscribers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'active');

  // Free users
  const freeUsers = (totalUsers || 0) - (proSubscribers || 0);

  // New signups in last 24h
  const { count: newSignups24h } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', twentyFourHoursAgo);

  // Gym searches in last 24h (adjust table/column names to your schema)
  let gymSearches24h = 0;
  let topSearchedCities = [];
  try {
    const { count } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo);
    gymSearches24h = count || 0;

    // Top searched cities — aggregate from gym searches or page views
    const { data: cityData } = await supabase
      .from('page_views')
      .select('city')
      .gte('created_at', twentyFourHoursAgo)
      .not('city', 'is', null)
      .limit(500);

    if (cityData && cityData.length > 0) {
      const cityCounts = {};
      cityData.forEach((row) => {
        const city = row.city;
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      });
      topSearchedCities = Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([city, count]) => ({ city, count }));
    }
  } catch (err) {
    console.warn('Could not fetch gym search stats:', err.message);
  }

  return {
    app: 'ironpassport',
    updated_at: now.toISOString(),
    total_users: totalUsers || 0,
    pro_subscribers: proSubscribers || 0,
    free_users: freeUsers,
    new_signups_24h: newSignups24h || 0,
    gym_searches_24h: gymSearches24h,
    top_searched_cities: topSearchedCities,
    errors_24h: [],
  };
}

export default async function handler(req, res) {
  // Auth: Vercel cron secret or manual admin secret
  const cronSecret = req.headers['x-vercel-cron-secret'];
  const adminSecret = req.headers['x-admin-secret'];
  const authHeader = req.headers['authorization'];

  const isAuthorized =
    cronSecret === process.env.CRON_SECRET ||
    adminSecret === process.env.ADMIN_SECRET ||
    authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!RUHROHHALP_SECRET) {
    return res.status(500).json({
      error: 'RUHROHHALP_WEBHOOK_SECRET not configured in env vars',
    });
  }

  try {
    const stats = await gatherIronPassportStats();

    const response = await fetch(
      `${RUHROHHALP_URL}/api/app-stats/ironpassport`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': RUHROHHALP_SECRET,
        },
        body: JSON.stringify(stats),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ruhrohhalp push failed:', response.status, errorText);
      return res.status(502).json({
        error: 'Failed to push stats to ruhrohhalp',
        upstream_status: response.status,
        upstream_error: errorText,
      });
    }

    const result = await response.json();
    return res.status(200).json({
      success: true,
      pushed_at: stats.updated_at,
      ruhrohhalp_response: result,
      stats_summary: {
        total_users: stats.total_users,
        pro_subscribers: stats.pro_subscribers,
        gym_searches_24h: stats.gym_searches_24h,
      },
    });
  } catch (error) {
    console.error('push-stats-to-ruhrohhalp error:', error);
    return res.status(500).json({ error: error.message });
  }
}
