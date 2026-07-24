import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client, authenticated with the SERVICE ROLE key.
 *
 * The service role key bypasses Row Level Security, so it must NEVER be
 * imported into a client component or exposed to the browser. It is read from
 * SUPABASE_SERVICE_ROLE_KEY, which has no NEXT_PUBLIC_ prefix and therefore
 * never reaches the client bundle.
 *
 * Returns null when the environment is not configured yet, so callers can
 * degrade gracefully (log the submission) instead of crashing before the
 * project is wired up.
 */
let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (cached) return cached;
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
