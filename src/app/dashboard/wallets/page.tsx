"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { walletsApi } from "@/api/wallets";
import { TableSkeleton, EmptyState, ErrorState } from "@/components/ui/AsyncStates";
import { cn } from "@/utils/cn";
import { ChevronRight } from "lucide-react";

function formatKobo(kobo: number) {
  const val = typeof kobo === "number" && !isNaN(kobo) ? kobo : 0;
  const num = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val / 100);
  return `₦${num}`;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "text-signal-green bg-signal-green/10",
  FROZEN: "text-blue-400 bg-blue-500/10",
  CLOSED: "text-paper-200/50 bg-white/5",
};

export default function WalletsPage() {
  const router = useRouter();
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
          <div className="space-y-4">
            {/* Desktop Table view (md and up) */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-white/10 bg-ink-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-ink-950 text-xs text-paper-200/50">
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-3 font-medium">Account</th>
                    <th className="px-4 py-3 font-medium">Bank</th>
                    <th className="px-4 py-3 font-medium">Balance</th>
                    <th className="px-4 py-3 font-medium">KYC tier</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.data.map((w) => (
                    <tr
                      key={w.id}
                      onClick={() => router.push(`/dashboard/wallets/${w.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          router.push(`/dashboard/wallets/${w.id}`);
                        }
                      }}
                      tabIndex={0}
                      className="hover:bg-white/5 cursor-pointer outline-none focus:bg-white/10 transition group"
                    >
                      <td className="px-4 py-3 font-mono text-paper-100 font-semibold">{w.accountNumber}</td>
                      <td className="px-4 py-3 text-paper-200/60">{w.bank}</td>
                      <td className="ledger-num px-4 py-3 text-paper-100 font-semibold">{formatKobo(w.balanceKobo)}</td>
                      <td className="px-4 py-3 text-paper-200/60">
                        {w.kyc?.tier ? w.kyc.tier.replace("TIER_", "Tier ") : "Tier 1"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider", STATUS_STYLES[w.status])}>
                          {w.status.charAt(0) + w.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-xs text-paper-200/20 group-hover:text-blue-400 transition">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">View details</span>
                          <ChevronRight className="h-4 w-4 text-paper-200/30 group-hover:text-blue-400 transition-colors" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card view (under md) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {data.data.map((w) => (
                <div
                  key={w.id}
                  onClick={() => router.push(`/dashboard/wallets/${w.id}`)}
                  className="rounded-xl border border-white/5 bg-ink-800 p-4 hover:border-white/10 active:bg-ink-800/80 transition cursor-pointer flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-sm font-semibold text-paper-100">{w.accountNumber}</span>
                      <p className="text-3xs text-paper-200/40 mt-0.5">{w.bank}</p>
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-3xs font-semibold tracking-wider", STATUS_STYLES[w.status])}>
                      {w.status.charAt(0) + w.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-end justify-between border-t border-white/5 pt-3">
                    <div>
                      <p className="text-4xs uppercase tracking-wider text-paper-200/30 font-semibold">Balance</p>
                      <p className="text-sm font-semibold text-paper-50 font-mono mt-0.5">{formatKobo(w.balanceKobo)}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-3xs text-paper-200/50 block">
                        {w.kyc?.tier ? w.kyc.tier.replace("TIER_", "Tier ") : "Tier 1"}
                      </span>
                      <span className="text-4xs text-blue-400 font-semibold">Tap to manage</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
