"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="text-xs uppercase tracking-[0.28em] text-faint transition-colors hover:text-gold"
    >
      Sign out
    </button>
  );
}
