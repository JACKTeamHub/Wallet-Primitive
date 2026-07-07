"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/analytics";
import { ErrorState } from "@/components/ui/AsyncStates";
import { cn } from "@/utils/cn";

function formatKobo(kobo: number) {
  const val = typeof kobo === "number" && !isNaN(kobo) ? kobo : 0;
  const num = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val / 100);
  return `₦${num}`;
}

interface Point {
  date: string;
  value: number;
}

function InteractiveChart({
  points,
  title,
  isCurrency = false,
  barColorClass = "from-blue-600/70 to-blue-400/90 hover:from-blue-500 hover:to-blue-300",
  shadowColorClass = "shadow-blue-500/5 hover:shadow-blue-500/20",
}: {
  points: Point[];
  title: string;
  isCurrency?: boolean;
  barColorClass?: string;
  shadowColorClass?: string;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);

  if (points.length === 0) return null;
  const max = Math.max(...points.map((p) => p.value), 1);
  const lastPoint = points[points.length - 1];
  const activeValue = hoveredPoint
    ? (isCurrency ? formatKobo(hoveredPoint.value * 100) : hoveredPoint.value)
    : (lastPoint ? (isCurrency ? formatKobo(lastPoint.value * 100) : lastPoint.value) : 0);
  const activeDate = hoveredPoint ? hoveredPoint.date : (lastPoint ? lastPoint.date : "—");

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <p className="text-2xs font-semibold text-paper-200/50">{title}</p>
          <p className="mt-1 text-lg font-bold text-paper-50 font-display">
            {activeValue}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xs text-paper-200/35">Active date</p>
          <p className="mt-1 text-2xs font-semibold text-paper-100 font-mono">
            {activeDate}
          </p>
        </div>
      </div>

      {/* Bars Grid */}
      <div className="flex h-24 items-end gap-1.5 pt-6">
        {points.map((p, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredPoint(p)}
            onMouseLeave={() => setHoveredPoint(null)}
            className="flex-1 flex flex-col items-center group cursor-pointer"
          >
            <div className="relative w-full flex items-end justify-center h-20">
              <div
                className={cn(
                  "w-full rounded-t bg-gradient-to-t transition-all duration-300 shadow-md",
                  barColorClass,
                  shadowColorClass,
                  hoveredPoint?.date === p.date ? "scale-x-110 opacity-100" : "opacity-80"
                )}
                style={{ height: `${Math.max((p.value / max) * 100, 6)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const volume = useQuery({ queryKey: ["analytics-volume"], queryFn: () => analyticsApi.getVolume() });
  const growth = useQuery({ queryKey: ["analytics-wallets"], queryFn: () => analyticsApi.getWalletGrowth() });
  const summary = useQuery({ queryKey: ["analytics-summary"], queryFn: () => analyticsApi.getSummary() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-paper-50">Analytics</h1>
        <p className="text-xs text-paper-200/50">Chronological transaction statistics and compliance volume metrics.</p>
      </div>

      {/* Interactive Charts */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-ink-800/60 p-5">
          {volume.isPending && <div className="h-32 animate-pulse rounded bg-white/5" />}
          {volume.isError && <ErrorState message={(volume.error as { message: string }).message} />}
          {volume.data && (
            <InteractiveChart
              points={volume.data.points}
              title="Transaction Volume Trend"
              isCurrency={true}
              barColorClass="from-blue-600/70 to-blue-400/90 hover:from-blue-500 hover:to-blue-300"
              shadowColorClass="shadow-blue-500/5 hover:shadow-blue-500/20"
            />
          )}
        </div>
        <div className="rounded-xl border border-white/10 bg-ink-800/60 p-5">
          {growth.isPending && <div className="h-32 animate-pulse rounded bg-white/5" />}
          {growth.isError && <ErrorState message={(growth.error as { message: string }).message} />}
          {growth.data && (
            <InteractiveChart
              points={growth.data.points}
              title="Wallet Onboarding Growth"
              isCurrency={false}
              barColorClass="from-amber-600/70 to-amber-400/90 hover:from-amber-500 hover:to-amber-300"
              shadowColorClass="shadow-amber-500/5 hover:shadow-amber-500/20"
            />
          )}
        </div>
      </div>

      {/* Stats Summary Cards Grid */}
      <div className="mt-6">
        <h2 className="font-display text-sm font-semibold text-paper-50 mb-4">Workspace Summary</h2>
        
        {summary.isPending && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        )}
        
        {summary.isError && <ErrorState message={(summary.error as { message: string }).message} />}

        {summary.data && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/5 bg-ink-800 p-5 flex flex-col justify-between">
              <p className="text-2xs text-paper-200/50 font-medium">Net liquidity</p>
              <h3 className="mt-2 text-xl font-bold text-paper-50 font-mono">
                {formatKobo((summary.data.netLiquidity || 0) * 100)}
              </h3>
            </div>
            <div className="rounded-xl border border-white/5 bg-ink-800 p-5 flex flex-col justify-between">
              <p className="text-2xs text-paper-200/50 font-medium">Total inbound volume</p>
              <h3 className="mt-2 text-xl font-bold text-signal-green font-mono">
                {formatKobo((summary.data.inboundVolume || 0) * 100)}
              </h3>
            </div>
            <div className="rounded-xl border border-white/5 bg-ink-800 p-5 flex flex-col justify-between">
              <p className="text-2xs text-paper-200/50 font-medium">Total outbound volume</p>
              <h3 className="mt-2 text-xl font-bold text-signal-red font-mono">
                {formatKobo((summary.data.outboundVolume || 0) * 100)}
              </h3>
            </div>
            <div className="rounded-xl border border-white/5 bg-ink-800 p-5 flex flex-col justify-between">
              <p className="text-2xs text-paper-200/50 font-medium">Virtual accounts</p>
              <h3 className="mt-2 text-xl font-bold text-paper-50 font-mono">
                {(summary.data.walletAccountsCount || 0) + (summary.data.tempAccountsCount || 0)}
              </h3>
              <p className="mt-1 text-3xs text-paper-200/40">
                {summary.data.walletAccountsCount || 0} wallets • {summary.data.tempAccountsCount || 0} checkouts
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Auxiliary Stats */}
      {summary.data && (
        <div className="grid gap-6 sm:grid-cols-3 mt-6">
          <div className="rounded-xl border border-white/5 bg-ink-800 p-5">
            <p className="text-2xs text-paper-200/50 font-medium">Onboarded customers</p>
            <h4 className="mt-2 text-2xl font-bold text-paper-50">{summary.data.totalCustomers || 0}</h4>
          </div>
          <div className="rounded-xl border border-white/5 bg-ink-800 p-5">
            <p className="text-2xs text-paper-200/50 font-medium">Checkout success rate</p>
            <h4 className="mt-2 text-2xl font-bold text-amber-500">{summary.data.checkoutSuccessRate || 0}%</h4>
          </div>
          <div className="rounded-xl border border-white/5 bg-ink-800 p-5">
            <p className="text-2xs text-paper-200/50 font-medium">Processed webhook events</p>
            <h4 className="mt-2 text-2xl font-bold text-paper-50">{summary.data.totalProcessedWebhooks || 0}</h4>
          </div>
        </div>
      )}
    </div>
  );
}
