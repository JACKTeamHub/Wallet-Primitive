"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { walletsApi } from "@/api/wallets";
import { TableSkeleton, EmptyState, ErrorState } from "@/components/ui/AsyncStates";
import { cn } from "@/utils/cn";

function formatKobo(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "text-signal-green bg-signal-green/10",
  FROZEN: "text-blue-400 bg-blue-500/10",
  CLOSED: "text-paper-200/50 bg-white/5",
};

export default function WalletsPage() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["wallets", page],
    queryFn: () => walletsApi.list({ page, pageSize: 20 }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-paper-50">Wallets</h1>
      <div className="mt-5">
        {isPending && <TableSkeleton />}
        {isError && <ErrorState message={(error as { message: string }).message} />}
        {!isPending && !isError && data?.data.length === 0 && (
          <EmptyState title="No wallets yet" description="Wallets provisioned for customers will appear here." />
        )}
        {!isPending && !isError && data && data.data.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-800 text-xs text-paper-200/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-4 py-3 font-medium">Bank</th>
                  <th className="px-4 py-3 font-medium">Balance</th>
                  <th className="px-4 py-3 font-medium">KYC tier</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.data.map((w) => (
                  <tr key={w.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-paper-100">{w.accountNumber}</td>
                    <td className="px-4 py-3 text-paper-200/60">{w.bank}</td>
                    <td className="ledger-num px-4 py-3 text-paper-100">{formatKobo(w.balanceKobo)}</td>
                    <td className="px-4 py-3 text-paper-200/60">{w.kyc.tier.replace("TIER_", "Tier ")}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs", STATUS_STYLES[w.status])}>
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
