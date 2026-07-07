"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";

const LINKS = [
  { href: "#product", label: "Product" },
  { href: "#code-editor", label: "Code Editor" },
  { href: "#playground", label: "Playground" },
  { href: "https://jack-wallet-primitive.mintlify.site/", label: "Docs", external: true },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-ink-900/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-[15px] font-semibold tracking-tight text-paper-50">
          wallet<span className="text-blue-500">/</span>primitive
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noreferrer" : undefined}
              className="flex items-center gap-1 text-sm text-paper-200/70 transition hover:text-paper-50"
            >
              {l.label}
              {l.external && <ArrowUpRight className="h-3.5 w-3.5" />}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm text-paper-200/70 hover:text-paper-50">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-amber-400"
          >
            Get started
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/5 px-6 py-4 md:hidden">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="block py-2 text-sm text-paper-200/80">
              {l.label}
            </a>
          ))}
          <Link href="/signup" className="mt-2 block rounded-full bg-amber-500 px-4 py-2 text-center text-sm font-medium text-ink-950">
            Get started
          </Link>
        </div>
      )}
    </header>
  );
}
