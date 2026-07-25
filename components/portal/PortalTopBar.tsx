"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/site/ThemeToggle";

export function PortalTopBar({ cohortName }: { cohortName?: string | null }) {
  const router = useRouter();

  async function signOut() {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line/15 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/portal/exams" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white ring-1 ring-gold/30">
            <Image
              src="/logo-shepherds-crew.png"
              alt="The Shepherd's Crew"
              width={36}
              height={36}
              className="h-[86%] w-[86%] object-contain"
              priority
            />
          </span>
          <span>
            <span className="block text-sm font-semibold leading-none">Class Portal</span>
            {cohortName && (
              <span className="mt-0.5 block text-[11px] uppercase tracking-[0.2em] text-faint">{cohortName}</span>
            )}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={signOut}
            className="rounded-full border border-line/25 px-4 py-1.5 text-xs font-bold transition-colors hover:border-gold hover:text-gold"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
