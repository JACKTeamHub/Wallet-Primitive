"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { PLAYGROUND_SAMPLES } from "@/constants/code-samples";
import { cn } from "@/utils/cn";

function formatResponse(response: Record<string, string | number>) {
  const lines = Object.entries(response).map(([key, value]) => {
    const formatted = typeof value === "number" ? value : `"${value}"`;
    return `  "${key}": ${formatted}`;
  });
  return `{\n${lines.join(",\n")}\n}`;
}

export function Playground() {
  const [activeId, setActiveId] = useState(PLAYGROUND_SAMPLES[0]!.id);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const sample = PLAYGROUND_SAMPLES.find((s) => s.id === activeId) ?? PLAYGROUND_SAMPLES[0]!;

  const selectSample = (id: string) => {
    setActiveId(id);
    setDone(false);
    setRunning(false);
  };

  const run = () => {
    setDone(false);
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setDone(true);
    }, 900);
  };

  return (
    <section id="playground" className="mx-auto max-w-4xl px-6 py-24">
      <h2 className="mb-2 font-display text-3xl font-semibold text-paper-50">Try it, no signup.</h2>
      <p className="mb-8 text-sm text-paper-200/55">
        Sandboxed calls — nothing here touches a real workspace.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {PLAYGROUND_SAMPLES.map((s) => (
          <button
            key={s.id}
            onClick={() => selectSample(s.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
              activeId === s.id
                ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                : "border-white/10 text-paper-200/50 hover:border-white/20 hover:text-paper-200/80"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-ink-800 p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-sm text-paper-100">{sample.fn}</span>
          <button
            onClick={run}
            disabled={running}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-amber-400 disabled:opacity-60"
          >
            <Play className="h-3.5 w-3.5" /> Run
          </button>
        </div>

        <div className="mt-5 min-h-[120px] rounded-lg bg-ink-950 p-4 font-mono text-xs">
          {running && <span className="text-paper-200/50">Running…</span>}
          <AnimatePresence mode="wait">
            {done && (
              <motion.pre
                key={sample.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-pre-wrap text-signal-green"
              >
                {formatResponse(sample.response)}
              </motion.pre>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
