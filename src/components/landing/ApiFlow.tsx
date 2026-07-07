"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const STEPS = [
  "Developer",
  "Wallet Primitive",
  "Nomba",
  "NIBSS",
  "Customer wallet",
  "Webhook",
  "Developer server",
];

export function ApiFlow() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="mb-10 text-center font-display text-2xl font-semibold text-paper-50 sm:text-3xl">
        A funds movement, traced end to end.
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-3 overflow-x-auto">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="whitespace-nowrap rounded-full border border-white/10 bg-ink-800 px-4 py-2 text-sm text-paper-100"
            >
              {step}
            </motion.div>
            {i < STEPS.length - 1 && (
              <ArrowRight className="h-4 w-4 shrink-0 text-paper-200/25" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
