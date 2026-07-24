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

/**
 * Turn a Supabase/Postgres error into an actionable message. A row-level
 * security violation on a server write almost always means
 * SUPABASE_SERVICE_ROLE_KEY holds the wrong key (the anon/publishable key, or a
 * truncated service_role key) — the service-role key is what bypasses RLS.
 */
export function describeDbError(error: { message?: string } | null | undefined): string {
  const msg = error?.message ?? "Database error.";
  if (/row-level security|permission denied|not authorized|violates row-level/i.test(msg)) {
    return (
      "Supabase refused the write because of row-level security. This means " +
      "SUPABASE_SERVICE_ROLE_KEY is not the service-role secret. Copy the " +
      "service_role key from Supabase → Project Settings → API, set it on your " +
      "host (SUPABASE_SERVICE_ROLE_KEY), and redeploy. Do not use the anon/publishable key."
    );
  }
  return msg;
}
