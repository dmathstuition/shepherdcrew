import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/current-admin";
import { AdminLoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  let signedIn = false;
  try {
    signedIn = Boolean(await currentAdmin());
  } catch {
    signedIn = false;
  }
  if (signedIn) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white ring-1 ring-gold/30">
          <Image src="/logo-shepherds-crew.png" alt="The Shepherd's Crew" width={64} height={64} className="h-[86%] w-[86%] object-contain" />
        </span>
        <p className="mt-6 text-center text-[11px] font-bold uppercase tracking-[0.4em] text-gold">
          The Shepherd&rsquo;s Crew
        </p>
        <h1 className="mt-3 text-center font-display text-4xl font-semibold leading-none">Admin</h1>
        <p className="mt-4 text-center text-muted">Sign in to manage the class portal.</p>
        <AdminLoginForm />
      </div>
    </main>
  );
}
