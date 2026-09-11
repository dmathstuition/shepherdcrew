"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * First-visit promo for AOWAP 2026. Shows the event flyer in a modal the first
 * time someone opens the site in a browsing session, with a clear call to the
 * registration page. Dismissal is remembered in sessionStorage so it appears
 * once per session rather than on every internal navigation.
 */
const SEEN_KEY = "aowap-2026-popup";

export function AowapPopup() {
  // Start closed; a first paint with the modal open would flash for returning
  // visitors. We decide whether to open in an effect, after reading storage.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // Storage blocked (private mode) — just show it.
    }
    if (!seen) {
      // A short beat after load feels intentional, not jarring.
      const t = setTimeout(() => setOpen(true), 650);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  // Lock scroll + wire Escape while open.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Atmosphere of Worship and Praise 2026"
      onClick={close}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-pop relative my-auto w-full max-w-[400px] overflow-hidden rounded-3xl bg-surface shadow-2xl ring-1 ring-gold/30"
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/70"
        >
          <span aria-hidden className="text-lg leading-none">
            &times;
          </span>
        </button>

        <Link href="/aowap" onClick={close} className="block">
          <Image
            src="/flyers/aowap-2026.jpg"
            alt="Atmosphere of Worship and Praise 2026 — 20th November 2026, Epe, Lagos"
            width={2048}
            height={2560}
            priority
            className="h-auto w-full"
          />
        </Link>

        <div className="space-y-3 p-5">
          <Link
            href="/aowap"
            onClick={close}
            className="block w-full rounded-full bg-ember py-3.5 text-center font-bold text-midnight transition-transform hover:-translate-y-0.5"
          >
            Register for AOWAP 2026
          </Link>
          <button
            onClick={close}
            className="block w-full text-center text-sm font-medium text-faint transition-colors hover:text-ink"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
