import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line/15 bg-surface py-16">
      <div className="mx-auto max-w-shell px-6 lg:px-10">
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
          <Link href="/" className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white ring-1 ring-gold/30">
              <Image
                src="/logo-shepherds-crew.png"
                alt=""
                width={48}
                height={48}
                className="h-[86%] w-[86%] object-contain"
              />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold leading-none tracking-wide">
                The Shepherd&rsquo;s Crew
              </span>
              <span className="mt-1.5 block text-xs uppercase tracking-[0.28em] text-faint">
                Est. {site.established} &middot; {site.scripture}
              </span>
            </span>
          </Link>

          <p className="max-w-[40ch] text-sm text-faint">
            {site.pillars.join(" · ")}
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line/15 pt-8 text-xs text-faint sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
