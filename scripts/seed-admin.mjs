#!/usr/bin/env node
/**
 * Create (or update) a portal admin.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/seed-admin.mjs admin@yourchurch.org 'a-strong-password'
 *
 * Password hashing here MUST match lib/admin.ts (scrypt$saltHex$hashHex).
 */
import { randomBytes, scryptSync } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const [email, password] = process.argv.slice(2);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  process.exit(1);
}
if (!email || !password) {
  console.error("Usage: node scripts/seed-admin.mjs <email> <password>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Choose a password of at least 8 characters.");
  process.exit(1);
}

function hashPassword(pw) {
  // Hex salt string used directly as the scrypt salt — must match lib/admin.ts.
  const saltHex = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, saltHex, 64);
  return `scrypt$${saltHex}$${hash.toString("hex")}`;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const normalized = email.trim().toLowerCase();
const { error } = await supabase
  .from("admins")
  .upsert({ email: normalized, password_hash: hashPassword(password), role: "admin" }, { onConflict: "email" });

if (error) {
  console.error("Could not create admin:", error.message);
  process.exit(1);
}

console.log(`\n✅ Admin ready: ${normalized}\nSign in at /admin/login\n`);
