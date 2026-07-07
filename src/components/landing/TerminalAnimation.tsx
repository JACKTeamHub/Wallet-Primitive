"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TERMINAL_SCENARIOS, type TerminalLine } from "@/constants/terminal-scenarios";
import { cn } from "@/utils/cn";

const LINE_DELAY_MS = 380;
const RESULT_HOLD_MS = 2200;
const SCENARIO_GAP_MS = 600;

function lineClass(type: TerminalLine["type"]) {
  switch (type) {
    case "string":
      return "text-amber-400";
    case "comment":
      return "text-paper-200/35";
    case "ok":
      return "text-signal-green";
    case "muted":
      return "text-paper-200/50";
    default:
      return "text-paper-100/90";
  }
}

export function TerminalAnimation() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [typingLine, setTypingLine] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = TERMINAL_SCENARIOS[scenarioIndex]!;

  useEffect(() => {
    const active = TERMINAL_SCENARIOS[scenarioIndex]!;
    const clear = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };

    const schedule = (fn: () => void, ms: number) => {
      clear();
      timerRef.current = setTimeout(fn, ms);
    };

    setVisibleLines(0);
    setShowResult(false);
    setTypingLine("");

    let lineIdx = 0;
    let charIdx = 0;

    const typeNextChar = () => {
      const line = active.lines[lineIdx];
      if (!line) {
        schedule(() => setShowResult(true), 200);
        schedule(() => {
          setShowResult(false);
          setScenarioIndex((i) => (i + 1) % TERMINAL_SCENARIOS.length);
        }, RESULT_HOLD_MS);
        return;
      }

      if (line.text === "") {
        setVisibleLines(lineIdx + 1);
        setTypingLine("");
        lineIdx += 1;
        schedule(typeNextChar, LINE_DELAY_MS / 2);
        return;
      }

      charIdx += 1;
      setTypingLine(line.text.slice(0, charIdx));
      setVisibleLines(lineIdx);

      if (charIdx >= line.text.length) {
        setVisibleLines(lineIdx + 1);
        setTypingLine("");
        lineIdx += 1;
        charIdx = 0;
        schedule(typeNextChar, LINE_DELAY_MS);
        return;
      }

      schedule(typeNextChar, 22);
    };

    schedule(typeNextChar, SCENARIO_GAP_MS);

    return clear;
  }, [scenarioIndex]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-950 shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-signal-red/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-signal-green/70" />
          <AnimatePresence mode="wait">
            <motion.span
              key={scenario.filename}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 4 }}
              className="ml-2 font-mono text-xs text-paper-200/50"
            >
              {scenario.filename}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="flex gap-1">
          {TERMINAL_SCENARIOS.map((s, i) => (
            <span
              key={s.id}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition",
                i === scenarioIndex ? "bg-amber-500" : "bg-white/15"
              )}
            />
          ))}
        </div>
      </div>

      <div className="min-h-[240px] p-5 font-mono text-[13px] leading-relaxed">
        <AnimatePresence mode="wait">
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {scenario.lines.slice(0, visibleLines).map((line, i) => (
              <div key={`${scenario.id}-${i}`} className={lineClass(line.type)}>
                {line.text || "\u00A0"}
              </div>
            ))}

            {typingLine && (
              <div className="text-paper-100/90">
                {typingLine}
                <span className="inline-block h-3.5 w-2 animate-pulse bg-amber-500/70 align-middle" />
              </div>
            )}

            {!typingLine && visibleLines < scenario.lines.length && (
              <span className="inline-block h-3.5 w-2 animate-pulse bg-amber-500/70 align-middle" />
            )}

            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-signal-green"
              >
                {scenario.result}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
