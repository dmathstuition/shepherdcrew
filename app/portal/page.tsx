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

export default async function PortalPage({ searchParams }: { searchParams: { ended?: string } }) {
  // Already signed in? Skip the login screen.
  let signedIn = false;
  try {
    signedIn = Boolean(await currentMember());
  } catch {
    signedIn = false; // portal not configured yet — show the login screen
  }
  if (signedIn) redirect("/portal/exams");

  const endedByProctor = searchParams?.ended === "proctor";

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        {endedByProctor && (
          <p className="mb-8 rounded-2xl border border-ember/40 bg-ember/10 px-5 py-4 text-center text-sm text-ember">
            Your exam was ended and submitted because you left the exam screen too many times.
          </p>
        )}
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white ring-1 ring-gold/30">
            <Image
              src="/logo-shepherds-crew.png"
              alt="The Shepherd's Crew"
              width={64}
              height={64}
              className="h-[86%] w-[86%] object-contain"
            />
          </span>
          <h1 className="mt-8 font-display text-4xl font-semibold leading-none">Class Portal</h1>
          <p className="mt-4 text-muted">
            Enter your name and the access code your coordinator gave you. No password to remember.
          </p>
        </div>

        <LoginForm />

        <p className="mt-8 text-center text-sm text-faint">
          Lost your code?{" "}
          <a href={`tel:${site.contacts[0].phone}`} className="text-gold hover:underline">
            Call {site.contacts[0].name}
          </a>
        </p>
      </div>
    </main>
  );
}
