"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboard";
import { ErrorState } from "@/components/ui/AsyncStates";

function formatKobo(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);
}

export default function DashboardPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: dashboardApi.getSummary,
  });

  if (isError) return <ErrorState message={(error as { message: string }).message} />;

  const cards = [
    { label: "Total wallets", value: data?.totalWallets ?? "—" },
    { label: "Total customers", value: data?.totalCustomers ?? "—" },
    { label: "Total balance", value: data ? formatKobo(data.totalBalanceKobo) : "—" },
    { label: "Pending reconciliations", value: data?.pendingReconciliations ?? "—" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-paper-50">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-white/10 bg-ink-800/60 p-5">
            <p className="text-xs text-paper-200/50">{c.label}</p>
            <p className={`mt-2 text-xl font-semibold text-paper-50 ${isPending ? "animate-pulse" : ""}`}>
              {isPending ? "…" : c.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
