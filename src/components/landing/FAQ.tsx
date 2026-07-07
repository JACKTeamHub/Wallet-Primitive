"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

const FAQS = [
  { q: "Do amounts settle in Naira or kobo?", a: "All amounts are represented as integers in kobo throughout the API and ledger, to avoid floating-point rounding on money." },
  { q: "How do I avoid double-processing a webhook?", a: "Every webhook carries a requestId. Check it against your own store before crediting a ledger; Wallet Primitive also dedupes on its side." },
  { q: "What happens to a misdirected payment?", a: "It's held in a quarantine ledger and surfaced in your dashboard rather than silently applied or dropped." },
  { q: "Can I use my own Nomba credentials?", a: "Yes — each workspace connects its own Nomba client credentials under Settings." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="mb-8 font-display text-3xl font-semibold text-paper-50">Questions, answered.</h2>
      <div className="divide-y divide-white/10 rounded-xl border border-white/10">
        {FAQS.map((f, i) => (
          <div key={f.q}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-paper-50"
              aria-expanded={open === i}
            >
              {f.q}
              <ChevronDown className={cn("h-4 w-4 text-paper-200/40 transition", open === i && "rotate-180")} />
            </button>
            {open === i && <p className="px-5 pb-4 text-sm text-paper-200/60">{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
