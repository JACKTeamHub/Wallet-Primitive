"use client";

import { motion } from "framer-motion";
import { appPath } from "@/constants/urls";

const MOCKUPS = [
  { title: "Customer dashboard", rotate: -3, path: "/dashboard/customers" },
  { title: "Wallet ledger", rotate: 2, path: "/dashboard/wallets" },
  { title: "Webhook events", rotate: -2, path: "/dashboard/webhooks" },
  { title: "Reconciliation run", rotate: 3, path: "/dashboard/reconciliation" },
];

export function BrowserMockups() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="mb-14 text-center font-display text-3xl font-semibold text-paper-50">
        The dashboard behind the API.
      </h2>
      <div className="grid gap-8 sm:grid-cols-2">
        {MOCKUPS.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, rotate: 0, y: 20 }}
            whileInView={{ opacity: 1, rotate: m.rotate, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ rotate: 0, scale: 1.02 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="overflow-hidden rounded-xl border border-white/10 bg-ink-800 shadow-2xl shadow-black/40"
          >
            <div className="flex items-center gap-2 border-b border-white/5 bg-ink-700 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-signal-red/60" />
              <span className="h-2 w-2 rounded-full bg-amber-500/60" />
              <span className="h-2 w-2 rounded-full bg-signal-green/60" />
              <span className="ml-2 truncate text-[11px] text-paper-200/40">{appPath(m.path)}</span>
            </div>
            <div className="flex h-40 items-center justify-center bg-gradient-to-br from-ink-800 to-ink-900">
              <span className="font-display text-sm text-paper-200/40">{m.title}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
