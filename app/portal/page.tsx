import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { site } from "@/lib/site";
import { currentMember } from "@/lib/current-member";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Class portal",
  robots: { index: false, follow: false },
};

export default async function PortalPage() {
  // Already signed in? Skip the login screen.
  let signedIn = false;
  try {
    signedIn = Boolean(await currentMember());
  } catch {
    signedIn = false; // portal not configured yet — show the login screen
  }
  if (signedIn) redirect("/portal/exams");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Image
            src="/logo-shepherds-crew.png"
            alt=""
            width={64}
            height={64}
            className="mx-auto h-16 w-16 object-contain"
          />
          <h1 className="mt-8 font-display text-4xl leading-none">CLASS PORTAL</h1>
          <p className="mt-4 text-white/60">
            Enter your name and the access code your coordinator gave you. No password to remember.
          </p>
        </div>

        <LoginForm />

        <p className="mt-8 text-center text-sm text-white/50">
          Lost your code?{" "}
          <a href={`tel:${site.contacts[0].phone}`} className="text-gold hover:underline">
            Call {site.contacts[0].name}
          </a>
        </p>
      </div>
    </main>
  );
}
