"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Timer,
  Webhook,
  BarChart3,
  FileClock,
  RefreshCw,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useTheme } from "next-themes";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/wallets", label: "Wallets", icon: Wallet },
  { href: "/dashboard/temporary-accounts", label: "Temporary accounts", icon: Timer },
  { href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/audit-logs", label: "Audit logs", icon: FileClock },
  { href: "/dashboard/reconciliation", label: "Reconciliation", icon: RefreshCw },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile sidebar on pathname change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const currentTheme = mounted ? theme : "dark";

  return (
    <>
      {/* 1. Mobile Header (sticky top, visible md:hidden) */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/5 bg-ink-950/80 px-4 backdrop-blur-md md:hidden">
        <Link href="/" className="font-display text-sm font-semibold text-paper-50">
          wallet<span className="text-blue-500">/</span>primitive
        </Link>

        {/* Animated Hamburger Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors focus:outline-none"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <span
            className={cn(
              "h-0.5 w-5 rounded bg-paper-100 transition-all duration-300 ease-out origin-center",
              isOpen && "rotate-45 translate-y-[8px]"
            )}
          />
          <span
            className={cn(
              "h-0.5 w-5 rounded bg-paper-100 transition-all duration-300 ease-out",
              isOpen && "opacity-0 scale-x-0"
            )}
          />
          <span
            className={cn(
              "h-0.5 w-5 rounded bg-paper-100 transition-all duration-300 ease-out origin-center",
              isOpen && "-rotate-45 -translate-y-[8px]"
            )}
          />
        </button>
      </header>

      {/* 2. Mobile Drawer Menu Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* 3. Mobile Navigation Drawer Panel */}
      <aside
        className={cn(
          "fixed top-16 left-0 bottom-0 z-30 flex w-64 flex-col border-r border-white/5 bg-ink-950 p-5 transition-transform duration-300 ease-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex-1 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === (href as string);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-paper-200/60 hover:bg-white/5 hover:text-paper-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/5 pt-4">
          <button
            onClick={() => setTheme(currentTheme === "light" ? "dark" : "light")}
            className="flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2.5 text-xs font-medium text-paper-200 hover:bg-white/10 hover:text-paper-50 transition"
          >
            <span className="capitalize">{currentTheme} Mode</span>
            {currentTheme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
          </button>
        </div>
      </aside>

      {/* 4. Desktop Sidebar (hidden on mobile, visible md:flex) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/5 bg-ink-950 md:flex">
        <div className="px-5 py-5">
          <Link href="/" className="font-display text-sm font-semibold text-paper-50">
            wallet<span className="text-blue-500">/</span>primitive
          </Link>
        </div>
        <nav className="flex-1 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === (href as string);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-paper-200/60 hover:bg-white/5 hover:text-paper-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/5 p-4">
          <button
            onClick={() => setTheme(currentTheme === "light" ? "dark" : "light")}
            className="flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2.5 text-xs font-medium text-paper-200 hover:bg-white/10 hover:text-paper-50 transition"
            aria-label="Toggle visual theme"
          >
            <span className="capitalize">{currentTheme} Mode</span>
            {currentTheme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
          </button>
        </div>
      </aside>
    </>
  );
}