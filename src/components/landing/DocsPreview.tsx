import { ArrowUpRight, BookOpen } from "lucide-react";

export function DocsPreview() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <a
        href="https://jack-wallet-primitive.mintlify.site/"
        target="_blank"
        rel="noreferrer"
        className="group flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-ink-800 to-ink-900 p-8 transition hover:border-amber-500/30 sm:flex-row sm:items-center"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-amber-500/10 p-3">
            <BookOpen className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-paper-50">
              Full API reference, guides, and SDK docs
            </h3>
            <p className="mt-1 text-sm text-paper-200/55">
              Every endpoint, request shape, and webhook payload — versioned and searchable.
            </p>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm text-paper-100 transition group-hover:border-amber-500/40">
          Read documentation <ArrowUpRight className="h-4 w-4" />
        </span>
      </a>
    </section>
  );
}
