"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import type { SampleScenario } from "@/constants/code-samples";
import { cn } from "@/utils/cn";

interface CodeWindowProps {
  scenario: SampleScenario;
}

export function CodeWindow({ scenario }: CodeWindowProps) {
  const [activeId, setActiveId] = useState(scenario.samples[0]!.id);
  const [copied, setCopied] = useState(false);

  const active =
    scenario.samples.find((s) => s.id === activeId) ??
    scenario.samples[0]!;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(active.code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      console.error("Failed to copy code.");
    }
  };

  return (
    <div className="min-h-[240px] leading-relaxed mx-auto w-full min-w-[300px] overflow-hidden rounded-lg border border-white/10 bg-ink-800 shadow-xl shadow-black/40 sm:max-w-full sm:rounded-2xl sm:shadow-2xl">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-white/5 px-1.5 py-1.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
        {/* Tabs */}
        <div className="flex w-full gap-1 overflow-x-auto whitespace-nowrap scrollbar-none [-webkit-overflow-scrolling:touch]">
          {scenario.samples.map((sample) => (
            <button
              key={sample.id}
              onClick={() => setActiveId(sample.id)}
              className={cn(
                "relative shrink-0 rounded px-1.5 py-1 text-[9px] font-medium transition-colors sm:px-3 sm:py-2 sm:text-xs",
                activeId === sample.id
                  ? "bg-white/5 text-paper-50"
                  : "text-paper-200/50 hover:bg-white/5 hover:text-paper-50"
              )}
            >
              {sample.label}

              {activeId === sample.id && (
                <motion.div
                  layoutId="code-tab-underline"
                  className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-amber-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* Copy */}
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-md border border-white/10 text-paper-200/60 transition-colors hover:bg-white/5 hover:text-paper-50 sm:h-auto sm:w-auto sm:self-auto sm:px-2.5 sm:py-2"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-signal-green sm:h-4 sm:w-4" />
          ) : (
            <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          )}

          <span className="ml-2 hidden sm:inline">
            {copied ? "Copied" : "Copy"}
          </span>
        </button>
      </div>

      {/* Code */}
      <div className="h-[220px] overflow-x-auto overflow-y-auto p-1.5 sm:h-[320px] sm:p-5 [-webkit-overflow-scrolling:touch]">
        <AnimatePresence mode="wait">
          <motion.pre
            key={`${scenario.id}-${active.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="min-w-max whitespace-pre font-mono text-[8px] leading-4 text-paper-100/90 sm:text-[11px] sm:leading-5 md:text-[12px] lg:text-[13px]"
          >
            <code>{active.code}</code>
          </motion.pre>
        </AnimatePresence>
      </div>
    </div>
  );
}