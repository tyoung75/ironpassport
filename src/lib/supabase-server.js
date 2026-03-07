import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for build-time data fetching.
 * Used by generateStaticParams and page data loaders.
 */
let serverClient = null;

export function getSupabaseServer() {
  if (!serverClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    serverClient = createClient(url, key);
  }
  return serverClient;
}
