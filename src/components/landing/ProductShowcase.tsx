"use client";

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SAMPLE_SCENARIOS } from "@/constants/code-samples";
import { cn } from "@/utils/cn";
import { CodeWindow } from "./CodeWindow";
import { LiveResponsePanel } from "./LiveResponsePanel";
import { TerminalAnimation } from "./TerminalAnimation";

export function ProductShowcase() {
  const [scenarioId, setScenarioId] = useState(SAMPLE_SCENARIOS[0]!.id);
  const scenario = SAMPLE_SCENARIOS.find((s) => s.id === scenarioId) ?? SAMPLE_SCENARIOS[0]!;

  return (
    <section id="product" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-12 max-w-lg">
        <p className="text-xs font-medium uppercase tracking-wider text-blue-500">
          One request in, a live account out
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-paper-50">
          Every language, one contract.
        </h2>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {SAMPLE_SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setScenarioId(s.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
              scenarioId === s.id
                ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                : "border-white/10 text-paper-200/50 hover:border-white/20 hover:text-paper-200/80"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <motion.p
        key={scenario.id}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-sm text-paper-200/55"
      >
        {scenario.description}
      </motion.p>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <CodeWindow key={scenario.id} scenario={scenario} />
        </div>
        <div className="lg:col-span-2">
          <LiveResponsePanel scenario={scenario} />
        </div>
      </div>

      <div className="mt-6">
        <TerminalAnimation />
      </div>
    </section>
  );
}
