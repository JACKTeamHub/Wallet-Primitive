"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatedBackground } from "./AnimatedBackground";
import { Globe } from "./Globe";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 md:pt-32 min-h-screen md:min-h-[90vh]">
      <AnimatedBackground />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-stretch h-full lg:h-auto">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center py-8 md:py-0"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-paper-200/70"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              Developer-first infrastructure
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display text-5xl font-bold leading-[1.1] tracking-tight text-paper-50 sm:text-6xl"
            >
              Virtual Accounts
              <br />
              Infrastructure
              <br />
              built for{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                developers
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-6 max-w-md text-base text-paper-200/60 leading-relaxed"
            >
              Give every customer a real Nigerian account number on Nomba&apos;s
              banking rails. Build, scale and move money with our simple,
              powerful APIs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Start building <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://jack-wallet-primitive.mintlify.site/"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-paper-100 transition hover:border-white/25 hover:bg-white/5"
              >
                Read the docs
              </a>
            </motion.div>

            {/* Feature badges */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <div className="flex items-center gap-2 text-xs text-paper-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Nigerian NUBANs
              </div>
              <div className="flex items-center gap-2 text-xs text-paper-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Real-time webhooks
              </div>
              <div className="flex items-center gap-2 text-xs text-paper-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Bank-grade security
              </div>
            </motion.div>
          </motion.div>

          {/* Right column - Globe */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-[60vh] md:h-[80vh] lg:h-full min-h-[400px] lg:min-h-[600px] flex items-center justify-center"
          >
            <Globe />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
