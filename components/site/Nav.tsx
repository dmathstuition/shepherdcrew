"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#programs", label: "Programs" },
  { href: "/believers-foundational-class", label: "Foundational class" },
  { href: "/#testimonies", label: "Testimonies" },
  { href: "/#beliefs", label: "Beliefs" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open ? "bg-midnight/90 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-shell items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-shepherds-crew.png"
            alt="The Shepherd's Crew"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            priority
          />
          <span className="hidden font-display text-lg leading-none tracking-wide sm:block">
            THE SHEPHERD&rsquo;S CREW
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-white/65 transition-colors hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/#join"
            className="rounded-full bg-ember px-6 py-2.5 text-sm font-bold text-midnight transition-transform hover:-translate-y-0.5"
          >
            Join a program
          </Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
        >
          <span className={`h-[2px] w-6 bg-white transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`h-[2px] w-6 bg-white transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`h-[2px] w-6 bg-white transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-midnight px-6 py-5 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 font-display text-2xl tracking-wide"
            >
              {l.label.toUpperCase()}
            </Link>
          ))}
          <Link
            href="/#join"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-full bg-ember py-3 text-center font-bold text-midnight"
          >
            Join a program
          </Link>
        </nav>
      )}
    </header>
  );
}
