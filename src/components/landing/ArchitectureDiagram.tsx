"use client";

import { motion } from "framer-motion";

const LAYERS = ["Developer", "Workspace", "Customer", "Wallet", "Ledger", "Webhook", "Analytics"];

export function ArchitectureDiagram() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="mb-10 text-center font-display text-3xl font-semibold text-paper-50">
        Everything nests under a workspace.
      </h2>
      <div className="flex flex-col items-center gap-2">
        {LAYERS.map((layer, i) => (
          <motion.div key={layer} className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ borderColor: "rgba(245,166,35,0.5)" }}
              transition={{ delay: i * 0.07 }}
              className="w-56 rounded-lg border border-white/10 bg-ink-800 py-3 text-center text-sm text-paper-100"
            >
              {layer}
            </motion.div>
            {i < LAYERS.length - 1 && <div className="h-6 w-px bg-white/10" />}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
