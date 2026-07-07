"use client";

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

  return (
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
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2.5 text-xs font-medium text-paper-200 hover:bg-white/10 hover:text-paper-50 transition"
          aria-label="Toggle visual theme"
        >
          <span className="capitalize">{theme ?? "dark"} Mode</span>
          {theme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
        </button>
      </div>
    </aside>
  );
}