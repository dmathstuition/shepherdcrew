import { createHmac } from "crypto";

/**
 * Access codes are never stored in plaintext. We store
 * HMAC-SHA256(PORTAL_SESSION_SECRET, normalizedCode) and look members up by
 * that hash. Because the HMAC key is a server secret, a leaked database cannot
 * be brute-forced back to working codes without also stealing the secret.
 *
 * Node.js `crypto` is used here (not Web Crypto) because hashing only ever runs
 * in Node API routes and the seed script, and the sync API keeps callers tidy.
 */
export function normalizeAccessCode(code: string): string {
  return code.trim().toUpperCase().replace(/[\s-]+/g, "");
}

export function hashAccessCode(code: string): string {
  const secret = process.env.PORTAL_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("PORTAL_SESSION_SECRET is missing or too short (need >= 16 chars).");
  }
  return createHmac("sha256", secret).update(`code:${normalizeAccessCode(code)}`).digest("hex");
}

/**
 * Generate a human-friendly access code like `BFC-7K4Q-2M`. Excludes easily
 * confused characters (0/O, 1/I). Prefix defaults to the cohort's flavour.
 */
export function generateAccessCode(prefix = "SC"): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = (n: number) =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `${prefix}-${pick(4)}-${pick(2)}`;
}
