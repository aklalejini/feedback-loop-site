import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid gap-3">
      <h1 className="text-2xl font-display font-semibold">Not found</h1>
      <p className="text-[var(--muted)]">
        That page doesn&apos;t exist (or your batch lives in another browser).
      </p>
      <Link href="/" className="underline">Back to all batches</Link>
    </div>
  );
}
