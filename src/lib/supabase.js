import { createClient } from "@supabase/supabase-js";

let supabase = null;

function getSupabase() {
  if (!supabase && typeof window !== "undefined") {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return supabase;
}

export default getSupabase;
