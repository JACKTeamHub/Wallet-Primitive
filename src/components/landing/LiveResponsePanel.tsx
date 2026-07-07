"use client";

import { motion } from "framer-motion";
import type { SampleScenario } from "@/constants/code-samples";

interface LiveResponsePanelProps {
  scenario: SampleScenario;
}

function formatValue(value: string | number) {
  if (typeof value === "number") {
    return <span className="text-signal-green">{value.toLocaleString()}</span>;
  }
  return <span className="text-amber-400">&quot;{value}&quot;</span>;
}

export function LiveResponsePanel({ scenario }: LiveResponsePanelProps) {
  const rows = Object.entries(scenario.response);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-signal-green" />
        <span className="text-xs text-paper-200/50">
          {scenario.statusCode} · application/json
        </span>
      </div>
      <div className="p-5 font-mono text-[13px] leading-relaxed">
        <span className="text-paper-200/40">{"{"}</span>
        {rows.map(([key, value], i) => (
          <motion.div
            key={`${scenario.id}-${key}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.12, duration: 0.3 }}
            className="pl-4"
          >
            <span className="text-signal-blue">&quot;{key}&quot;</span>
            <span className="text-paper-200/40">: </span>
            {formatValue(value)}
            {i < rows.length - 1 && <span className="text-paper-200/40">,</span>}
          </motion.div>
        ))}
        <span className="text-paper-200/40">{"}"}</span>
      </div>
    </div>
  );
}
