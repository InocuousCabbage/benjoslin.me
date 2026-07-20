import Link from "next/link";

/**
 * Placeholder component used by route stubs (/career, /education, /projects,
 * /photo, /music) until each phase lands. Keeps the /route responsive and
 * navigable so preview URLs never 404 during the phase-by-phase rollout.
 */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center gap-6 px-6 py-24">
      <p className="text-sm uppercase tracking-widest text-muted-foreground">
        Coming soon
      </p>
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="text-lg text-muted-foreground">
        This section is being built out. Back to{" "}
        <Link href="/" className="underline underline-offset-4">
          home
        </Link>
        .
      </p>
    </div>
  );
}
