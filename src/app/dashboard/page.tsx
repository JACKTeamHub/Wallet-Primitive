"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboard";
import { ErrorState } from "@/components/ui/AsyncStates";
import { cn } from "@/utils/cn";
import { ArrowUpRight, ArrowDownLeft, Users, Wallet, Timer, Activity, ChevronRight } from "lucide-react";
import Link from "next/link";

function formatKobo(kobo: number) {
  const val = typeof kobo === "number" && !isNaN(kobo) ? kobo : 0;
  const num = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val / 100);
  return `₦${num}`;
}

type ActivityPoint = {
  date: string;
  valueKobo: number;
  creditsKobo: number;
  debitsKobo: number;
  count: number;
};

type DashboardEvent = {
  id: string;
  type?: string;
  createdAt?: string;
  processedAt?: string | null;
  payload?: Record<string, any>;
  eventRef?: string;
  requestId?: string;
  accountNumber?: string;
  amount?: number;
  amountKobo?: number;
  customerName?: string;
};

function toKobo(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value * 100);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
  }
  return 0;
}

function getActivityAmountKobo(activity: any) {
  if (typeof activity.amountKobo === "number") return activity.amountKobo;
  const payloadAmount =
    activity.payload?.data?.transaction?.transactionAmount ??
    activity.payload?.transaction?.transactionAmount ??
    activity.payload?.transactionAmount ??
    activity.payload?.amount;
  return toKobo(activity.amount ?? payloadAmount ?? activity.transactionAmount ?? activity.value ?? 0);
}

function getActivityType(activity: DashboardEvent) {
  const rawType =
    activity.type ??
    activity.payload?.event_type ??
    activity.payload?.type ??
    activity.payload?.data?.transaction?.type ??
    "";
  const normalized = String(rawType).toLowerCase();
  if (normalized.includes("debit") || normalized.includes("refund")) return "DEBIT";
  return "CREDIT";
}

function getActivityDate(activity: DashboardEvent) {
  return (
    activity.processedAt ??
    activity.createdAt ??
    activity.payload?.data?.transaction?.time ??
    activity.payload?.time ??
    activity.payload?.createdAt ??
    null
  );
}

function getActivityLabel(activity: DashboardEvent) {
  return (
    activity.customerName ??
    activity.payload?.data?.merchant?.userId ??
    activity.payload?.data?.transaction?.narration ??
    activity.payload?.data?.transaction?.aliasAccountNumber ??
    "Sandbox User"
  );
}

function getAccountNumber(activity: DashboardEvent) {
  return (
    activity.accountNumber ??
    activity.payload?.data?.transaction?.aliasAccountNumber ??
    activity.payload?.data?.merchant?.walletId ??
    activity.eventRef ??
    "—"
  );
}

function normalizeSeriesPoint(point: any): ActivityPoint | null {
  const rawDate = point.date ?? point.day ?? point.createdAt ?? point.label;
  if (!rawDate) return null;

  const date = new Date(rawDate);
  const label = Number.isNaN(date.getTime())
    ? String(rawDate)
    : date.toLocaleDateString("en-US", { weekday: "short" });
  const creditsKobo =
    typeof point.creditsKobo === "number" ? point.creditsKobo : toKobo(point.credits ?? point.inbound ?? 0);
  const debitsKobo =
    typeof point.debitsKobo === "number" ? point.debitsKobo : toKobo(point.debits ?? point.outbound ?? 0);
  const valueKobo =
    typeof point.valueKobo === "number"
      ? point.valueKobo
      : toKobo(point.value ?? point.total ?? 0) || creditsKobo + debitsKobo;

  return {
    date: label,
    valueKobo,
    creditsKobo,
    debitsKobo,
    count: point.count ?? point.transactions ?? 0,
  };
}

function buildActivityPoints(data: any, recentEvents: DashboardEvent[]): ActivityPoint[] {
  const backendSeries =
    data?.transactionActivity ??
    data?.activitySeries ??
    data?.volumeSeries ??
    data?.metrics?.transactionActivity ??
    data?.metrics?.activitySeries ??
    data?.metrics?.volumeSeries;

  if (Array.isArray(backendSeries) && backendSeries.length > 0) {
    return backendSeries.map(normalizeSeriesPoint).filter(Boolean) as ActivityPoint[];
  }

  const buckets = new Map<string, ActivityPoint>();

  Array.from({ length: 7 }).forEach((_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);

    buckets.set(key, {
      date: date.toLocaleDateString("en-US", { weekday: "short" }),
      valueKobo: 0,
      creditsKobo: 0,
      debitsKobo: 0,
      count: 0,
    });
  });

  recentEvents.forEach((activity) => {
    const createdAt = getActivityDate(activity);
    const date = createdAt ? new Date(createdAt) : null;
    if (!date || Number.isNaN(date.getTime())) return;

    const key = date.toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) return;

    const amountKobo = getActivityAmountKobo(activity);
    if (!amountKobo) return;
    bucket.valueKobo += amountKobo;
    bucket.count += 1;

    if (getActivityType(activity) === "DEBIT") {
      bucket.debitsKobo += amountKobo;
    } else {
      bucket.creditsKobo += amountKobo;
    }
  });

  return Array.from(buckets.values());
}

function VolumeChart({ points }: { points: ActivityPoint[] }) {
  if (points.length === 0) return null;
  const max = Math.max(...points.map((p) => p.valueKobo), 1);
  return (
    <div className="flex h-48 items-end gap-2 pt-6">
      {points.map((p, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
          <div className="relative w-full flex items-end justify-center h-32">
            <div
              className="w-full rounded-t bg-gradient-to-t from-blue-600/80 to-blue-400/90 group-hover:from-blue-500 group-hover:to-blue-300 transition-all duration-300 shadow-lg shadow-blue-500/10"
              style={{ height: `${p.valueKobo > 0 ? Math.max((p.valueKobo / max) * 100, 6) : 2}%` }}
            />
            <div className="absolute -top-8 scale-0 group-hover:scale-100 transition-transform bg-ink-950 text-2xs text-paper-50 rounded px-2 py-1 border border-white/10 z-10 font-mono whitespace-nowrap shadow-xl">
              {formatKobo(p.valueKobo)}
            </div>
          </div>
          <span className="text-3xs text-paper-200/40 font-mono mt-1">{p.date}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: dashboardApi.getSummary,
  });

  if (isPending) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-white/5" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white/5" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-64 rounded-xl bg-white/5" />
          <div className="h-64 rounded-xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (isError) return <ErrorState message={(error as { message: string }).message} />;

  const metrics = data?.metrics || {};
  const recentEvents: DashboardEvent[] = data?.recentActivity || data?.recentWebhooks || [];

  const cards = [
    {
      label: "Net Balance",
      value: formatKobo((metrics.netLiquidity || 0) * 100),
      desc: "Total workspace liquidity",
      icon: Wallet,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Total Wallets",
      value: metrics.walletAccountsCount ?? 0,
      desc: "Provisioned customer accounts",
      icon: Users,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Temporary Checkouts",
      value: metrics.tempAccountsCount ?? 0,
      desc: "Short-lived payment accounts",
      icon: Timer,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      label: "Customers",
      value: metrics.totalCustomers ?? 0,
      desc: "Registered user profiles",
      icon: Activity,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  const chartPoints = buildActivityPoints(data, recentEvents);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-paper-50">Overview</h1>
        <p className="text-xs text-paper-200/50">Real-time status of your Nomba sandbox virtual accounts and transaction metrics.</p>
      </div>

      {/* Grid of Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="rounded-xl border border-white/5 bg-ink-800 p-5 flex flex-col justify-between hover:border-white/10 transition duration-300">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-semibold text-paper-200/50">{c.label}</span>
                <div className={cn("rounded-lg p-2 border", c.color)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-bold text-paper-50 font-display">{c.value}</h3>
                <p className="mt-1 text-3xs text-paper-200/40">{c.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Layout Split: Chart on Left, Recent Activity on Right */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Transaction Volume Chart */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-ink-800 p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold text-paper-50">Transaction Activity</h3>
            <p className="text-3xs text-paper-200/40">7-day aggregate credit and debit volume from processed activity.</p>
          </div>
          <VolumeChart points={chartPoints} />
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-white/5 bg-ink-800 p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold text-paper-50">Recent Transactions</h3>
            <p className="text-3xs text-paper-200/40">Latest events processed on this workspace.</p>
          </div>

          <div className="mt-4 flex-1 divide-y divide-white/5">
            {recentEvents.length === 0 ? (
              <div className="py-12 text-center text-xs text-paper-200/40">
                No recent transactions found.
              </div>
            ) : (
              recentEvents.map((activity) => (
                <div key={activity.id} className="py-3 flex items-center justify-between group hover:bg-white/1 transition rounded px-2 -mx-2">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "rounded-lg p-1.5 border",
                      getActivityType(activity) === "CREDIT" 
                        ? "text-signal-green bg-signal-green/10 border-signal-green/20" 
                        : "text-signal-red bg-signal-red/10 border-signal-red/20"
                    )}>
                      {getActivityType(activity) === "CREDIT" ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-paper-100 max-w-[120px] truncate">
                        {getActivityLabel(activity)}
                      </div>
                      <div className="text-3xs text-paper-200/40 font-mono mt-0.5">
                        NUBAN: {getAccountNumber(activity)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-xs font-bold font-mono",
                      getActivityType(activity) === "CREDIT" ? "text-signal-green" : "text-signal-red"
                    )}>
                      {getActivityType(activity) === "CREDIT" ? "+" : "-"}{formatKobo(getActivityAmountKobo(activity))}
                    </div>
                    <div className="text-3xs text-paper-200/30 mt-0.5">
                      {new Date(getActivityDate(activity) || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 border-t border-white/5 pt-4">
            <Link 
              href="/dashboard/wallets"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/2 hover:bg-white/5 py-2 text-3xs font-semibold text-paper-100 hover:text-paper-50 transition"
            >
              Manage Workspace Wallets
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
