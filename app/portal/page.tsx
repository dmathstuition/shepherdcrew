import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Class portal",
  robots: { index: false, follow: false },
};

/**
 * Placeholder.
 * Replace with the real access-code entry screen once the portal is wired up.
 * See docs/portal-architecture.md for the intended flow.
 */
export default function PortalPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="w-full max-w-md text-center">
        <Image
          src="/logo-shepherds-crew.png"
          alt=""
          width={64}
          height={64}
          className="mx-auto h-16 w-16 object-contain"
        />
        <h1 className="mt-8 font-display text-4xl leading-none">CLASS PORTAL</h1>
        <p className="mt-5 text-white/60">
          The portal opens when your cohort begins. You&rsquo;ll receive an access code from your
          coordinator — no password to remember.
        </p>
        <div className="mt-10 flex flex-col gap-3">
          <Link
            href="/believers-foundational-class#enrol"
            className="rounded-full bg-ember py-3.5 font-bold text-midnight transition-transform hover:-translate-y-0.5"
          >
            Enrol in the class
          </Link>
          <a
            href={`tel:${site.contacts[0].phone}`}
            className="rounded-full border border-white/20 py-3.5 font-bold transition-colors hover:border-gold hover:text-gold"
          >
            Lost your code? Call {site.contacts[0].name}
          </a>
        </div>
      </div>
    </main>
  );
}
