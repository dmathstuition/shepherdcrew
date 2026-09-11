import type { Metadata } from "next";
import Image from "next/image";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { Eyebrow } from "@/components/site/Eyebrow";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "AOWAP 2026 — Register",
  description:
    "Register for the Atmosphere of Worship & Praise 2026 — a prophetic worship encounter holding 20th November 2026 at Epe, Lagos.",
};

export default function AowapRegisterPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative overflow-hidden pb-20 pt-32 lg:pt-40">
          <div aria-hidden className="hero-aura absolute inset-0" />
          <div className="relative shell">
            <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <Reveal>
                <div className="mx-auto max-w-[360px] overflow-hidden rounded-3xl ring-1 ring-gold/25 lg:mx-0">
                  <Image
                    src="/flyers/aowap-2026.jpg"
                    alt="Atmosphere of Worship and Praise 2026 flyer"
                    width={2048}
                    height={2560}
                    priority
                    className="h-auto w-full"
                  />
                </div>
              </Reveal>

              <Reveal delay={120}>
                <Eyebrow>Atmosphere of Worship &amp; Praise</Eyebrow>
                <h1 className="mt-3 font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.9]">
                  AOWAP 2026
                </h1>
                <p className="mt-6 text-lg leading-[1.7] text-muted">
                  Welcome to the Atmosphere of Worship and Praise 2026! This prophetic meeting holds{" "}
                  <span className="font-semibold text-ink">20th November 2026</span> at{" "}
                  <span className="font-semibold text-ink">Epe, Lagos State</span>, with the{" "}
                  <span className="font-semibold text-ink">red carpet from 8:00 PM</span>.
                </p>
                <p className="mt-4 text-lg leading-[1.7] text-muted">
                  Fill in your details below to register. We can&rsquo;t wait to have you be a part
                  of this encounter.
                </p>
                <div className="mt-8 flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full border border-gold/30 bg-gold/[0.06] px-4 py-2 font-semibold text-gold">
                    20 Nov 2026
                  </span>
                  <span className="rounded-full border border-line/20 bg-surface2 px-4 py-2 font-medium text-muted">
                    Epe, Lagos
                  </span>
                  <span className="rounded-full border border-line/20 bg-surface2 px-4 py-2 font-medium text-muted">
                    Red carpet 8:00 PM
                  </span>
                  <span className="rounded-full border border-line/20 bg-surface2 px-4 py-2 font-medium text-muted">
                    Worship · Revival · Praise
                  </span>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="relative pb-28 lg:pb-36">
          <div className="relative mx-auto w-full max-w-[720px] px-6">
            <div className="rounded-3xl border border-line/15 bg-surface p-6 shadow-sm sm:p-10">
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">Registration form</h2>
              <p className="mt-2 text-sm text-muted">
                Takes under a minute. You&rsquo;ll get an email confirmation right away.
              </p>
              <div className="mt-8">
                <RegisterForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
