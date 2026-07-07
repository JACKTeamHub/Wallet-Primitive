"use client";

import { motion } from "framer-motion";
import {
  Landmark,
  Timer,
  KeyRound,
  RefreshCw,
  Webhook,
  Building2,
  ShieldAlert,
  FileClock,
  BarChart3,
} from "lucide-react";

const FEATURES = [
  { icon: Landmark, title: "Persistent virtual accounts", desc: "One NUBAN per customer, live for the lifetime of the relationship." },
  { icon: Timer, title: "Temporary checkout accounts", desc: "Short-lived accounts for one-off collections and checkouts." },
  { icon: KeyRound, title: "Developer API keys", desc: "Scoped, rotatable keys per workspace." },
  { icon: RefreshCw, title: "Automatic reconciliation", desc: "Nightly diffs against your own merchantTxRef, not ours." },
  { icon: Webhook, title: "Webhook processing", desc: "HMAC-verified, deduplicated, retried until acknowledged." },
  { icon: Building2, title: "Multi-tenancy", desc: "Isolated workspaces, credentials, and ledgers per team." },
  { icon: ShieldAlert, title: "Quarantine ledger", desc: "Misdirected payments held and surfaced, never silently dropped." },
  { icon: FileClock, title: "Audit logs", desc: "Every mutation, attributed and timestamped." },
  { icon: BarChart3, title: "Analytics", desc: "Volume, wallet growth, and reconciliation health at a glance." },
];

export function FeatureCards() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-12 max-w-lg">
        <p className="text-xs font-medium uppercase tracking-wider text-blue-500">Infrastructure, not a wrapper</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-paper-50">
          Everything a ledger needs to be trusted.
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 3) * 0.06 }}
            className="rounded-xl border border-white/10 bg-ink-800/60 p-5 transition hover:border-amber-500/30"
          >
            <Icon className="mb-3 h-5 w-5 text-blue-500" />
            <h3 className="font-display text-sm font-semibold text-paper-50">{title}</h3>
            <p className="mt-1.5 text-sm text-paper-200/55">{desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
