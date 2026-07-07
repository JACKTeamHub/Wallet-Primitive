"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/analytics";
import { ErrorState } from "@/components/ui/AsyncStates";

function Sparkline({ points }: { points: { date: string; value: number }[] }) {
  if (points.length === 0) return null;
  const max = Math.max(...points.map((p) => p.value), 1);
  return (
    <div className="flex h-24 items-end gap-1">
      {points.map((p) => (
        <div
          key={p.date}
          className="flex-1 rounded-t bg-amber-500/60"
          style={{ height: `${Math.max((p.value / max) * 100, 4)}%` }}
          title={`${p.date}: ${p.value}`}
        />
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const volume = useQuery({ queryKey: ["analytics-volume"], queryFn: () => analyticsApi.getVolume() });
  const growth = useQuery({ queryKey: ["analytics-wallets"], queryFn: () => analyticsApi.getWalletGrowth() });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-paper-50">Analytics</h1>
      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-ink-800/60 p-5">
          <p className="text-xs text-paper-200/50">Transaction volume</p>
          <div className="mt-4">
            {volume.isPending && <div className="h-24 animate-pulse rounded bg-white/5" />}
            {volume.isError && <ErrorState message={(volume.error as { message: string }).message} />}
            {volume.data && <Sparkline points={volume.data.points} />}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-ink-800/60 p-5">
          <p className="text-xs text-paper-200/50">Wallet growth</p>
          <div className="mt-4">
            {growth.isPending && <div className="h-24 animate-pulse rounded bg-white/5" />}
            {growth.isError && <ErrorState message={(growth.error as { message: string }).message} />}
            {growth.data && <Sparkline points={growth.data.points} />}
          </div>
        </div>
      </div>
    </div>
  );
}
