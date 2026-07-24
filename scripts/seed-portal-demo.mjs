#!/usr/bin/env node
/**
 * Create a demo portal member and print a working access code.
 *
 * Run after applying supabase/migrations + supabase/seed.sql and setting env:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... PORTAL_SESSION_SECRET=... \
 *     node scripts/seed-portal-demo.mjs
 *
 * The access-code hashing here MUST match lib/portal-auth.ts.
 */
import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PORTAL_SESSION_SECRET } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !PORTAL_SESSION_SECRET) {
  console.error("Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and PORTAL_SESSION_SECRET first.");
  process.exit(1);
}
if (PORTAL_SESSION_SECRET.length < 16) {
  console.error("PORTAL_SESSION_SECRET must be at least 16 characters.");
  process.exit(1);
}

const normalize = (c) => c.trim().toUpperCase().replace(/[\s-]+/g, "");
const hashAccessCode = (code) =>
  createHmac("sha256", PORTAL_SESSION_SECRET).update(`code:${normalize(code)}`).digest("hex");

function generateCode(prefix = "BFC") {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = (n) =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `${prefix}-${pick(4)}-${pick(2)}`;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: cohort, error: cohortErr } = await supabase
  .from("cohorts")
  .select("id, name")
  .eq("slug", "bfc-cohort-1")
  .maybeSingle();

if (cohortErr || !cohort) {
  console.error("Cohort 'bfc-cohort-1' not found. Run supabase/seed.sql first.");
  process.exit(1);
}

const fullName = "Demo Member";
const code = generateCode();

// Remove any previous demo member so the script is repeatable.
await supabase.from("members").delete().eq("cohort_id", cohort.id).eq("full_name", fullName);

const { error: insertErr } = await supabase.from("members").insert({
  cohort_id: cohort.id,
  full_name: fullName,
  access_code_hash: hashAccessCode(code),
});

if (insertErr) {
  console.error("Could not create demo member:", insertErr.message);
  process.exit(1);
}

console.log("\n✅ Demo member created.\n");
console.log(`   Cohort:      ${cohort.name}`);
console.log(`   Full name:   ${fullName}`);
console.log(`   Access code: ${code}\n`);
console.log("Log in at /portal with exactly that name and code.\n");
