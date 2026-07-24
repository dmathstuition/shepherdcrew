"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll reveal with no animation library.
 * Falls straight to visible when the reader has asked for reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        timer = window.setTimeout(() => setShown(true), delay);
        observer.disconnect();
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[900ms] ease-reveal ${
        shown ? "translate-y-0 scale-100 opacity-100 blur-0" : "translate-y-10 scale-[0.98] opacity-0 blur-[2px]"
      } ${className}`}
    >
      {children}
    </div>
  );
}
