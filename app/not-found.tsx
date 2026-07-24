import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-[clamp(5rem,20vw,12rem)] leading-none text-ember/30">404</p>
      <h1 className="mt-2 font-display text-3xl">This page isn&rsquo;t here</h1>
      <p className="mt-4 max-w-[40ch] text-muted">
        The link may be old, or the page may have moved. Everything else is one tap away.
      </p>
      <Link
        href="/"
        className="mt-9 rounded-full bg-ember px-9 py-3.5 font-bold text-midnight transition-transform hover:-translate-y-0.5"
      >
        Back to the home page
      </Link>
    </main>
  );
}
