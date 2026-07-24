import type { Metadata } from "next";
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
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.4em] text-gold">
          The Shepherd&rsquo;s Crew
        </p>
        <h1 className="mt-3 text-center font-display text-4xl font-semibold leading-none">Admin</h1>
        <p className="mt-4 text-center text-mist/55">Sign in to manage the class portal.</p>
        <AdminLoginForm />
      </div>
    </main>
  );
}
