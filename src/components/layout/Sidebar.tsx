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
} from "lucide-react";
import { cn } from "@/utils/cn";

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
] as const; // <-- Added 'as const' here to solve the TypeScript error

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 border-r border-white/5 bg-ink-950 md:block">
      <div className="px-5 py-5">
        <Link href="/" className="font-display text-sm font-semibold text-paper-50">
          wallet<span className="text-blue-500">/</span>primitive
        </Link>
      </div>
      <nav className="px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          // Explicitly cast to string here just to safely check path equality
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
    </aside>
  );
}