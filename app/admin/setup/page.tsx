import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { countAdmins } from "@/lib/admin";
import { SetupForm } from "./SetupForm";

export const metadata: Metadata = {
  title: "Admin setup",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  // Once any admin exists, setup is closed permanently.
  try {
    if ((await countAdmins()) > 0) redirect("/admin/login");
  } catch {
    // Supabase not reachable/configured — show the form; the API returns a clear error.
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.4em] text-gold">
          The Shepherd&rsquo;s Crew
        </p>
        <h1 className="mt-3 text-center font-display text-4xl font-semibold leading-none">
          First admin
        </h1>
        <p className="mt-4 text-center text-muted">
          Create the first admin account. This page closes automatically once an admin exists.
        </p>
        <SetupForm />
      </div>
    </main>
  );
}
