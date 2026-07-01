import { createClient } from "@supabase/supabase-js";

/** Optional Supabase client — configure env vars when migrating orders to Postgres */
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
