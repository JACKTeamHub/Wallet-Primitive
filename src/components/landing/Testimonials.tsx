const QUOTES = [
  { name: "Chidi A.", role: "Founder, checkout startup", quote: "We shipped virtual accounts in a weekend instead of a quarter." },
  { name: "Ifeoma N.", role: "Backend lead", quote: "The webhook contract just works — idempotency keys saved us twice already." },
  { name: "Tunde K.", role: "Indie developer", quote: "Reconciliation used to be a spreadsheet. Now it's a dashboard tab." },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="mb-10 font-display text-3xl font-semibold text-paper-50">Builders on the rails.</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {QUOTES.map((q) => (
          <figure key={q.name} className="rounded-xl border border-white/10 bg-ink-800/60 p-5">
            <blockquote className="text-sm text-paper-200/75">&ldquo;{q.quote}&rdquo;</blockquote>
            <figcaption className="mt-4 text-xs text-paper-200/45">
              {q.name} · {q.role}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
