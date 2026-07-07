import Link from "next/link";
import { GITHUB_URL } from "@/constants/urls";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24 text-center">
      <h2 className="font-display text-3xl font-semibold text-paper-50 sm:text-4xl">Ready to build?</h2>
      <p className="mt-3 text-paper-200/55">Provision your first virtual account in the next five minutes.</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/signup" className="rounded-full bg-amber-500 px-6 py-3 text-sm font-medium text-ink-950 hover:bg-amber-400">
          Get started
        </Link>
        <a href="https://jack-wallet-primitive.mintlify.site/" target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-paper-100 hover:border-white/25">
          Documentation
        </a>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-paper-100 hover:border-white/25">
          GitHub
        </a>
      </div>
    </section>
  );
}
