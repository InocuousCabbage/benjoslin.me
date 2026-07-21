import Link from "next/link";

/**
 * Placeholder for still-stub route pages (currently /projects, /photo,
 * /music). Dark-themed to match the enzosison visual clone. /career
 * and /education graduated to dedicated pages in Phase 2 and no longer
 * use this component.
 */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center gap-6 px-6 py-24">
      <p className="text-sm uppercase tracking-widest text-white/40">
        Coming soon
      </p>
      <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
        {title}
      </h1>
      <p className="text-lg text-white/60">
        This section is being built out. Back to{" "}
        <Link
          href="/"
          className="text-white/80 underline underline-offset-4 transition-colors hover:text-white"
        >
          home
        </Link>
        .
      </p>
    </div>
  );
}
