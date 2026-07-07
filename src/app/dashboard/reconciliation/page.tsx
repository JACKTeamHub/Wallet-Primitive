"use client";

import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { reconciliationApi } from "@/api/reconciliation";
import { TableSkeleton, EmptyState, ErrorState } from "@/components/ui/AsyncStates";
import { cn } from "@/utils/cn";

const STATUS_STYLES: Record<string, string> = {
  MATCHED: "text-signal-green bg-signal-green/10",
  MISMATCHED: "text-signal-red bg-signal-red/10",
  PENDING: "text-amber-400 bg-amber-500/10",
};

export default function ReconciliationPage() {
  const qc = useQueryClient();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["reconciliation"],
    queryFn: () => reconciliationApi.list({ page: 1, pageSize: 30 }),
  });
  const run = useMutation({
    mutationFn: reconciliationApi.run,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reconciliation"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-paper-50">Reconciliation</h1>
        <button
          onClick={() => run.mutate()}
          disabled={run.isPending}
          className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-amber-400 disabled:opacity-50"
        >
          {run.isPending ? "Running…" : "Run reconciliation"}
        </button>
      </div>
      <div className="mt-5">
        {isPending && <TableSkeleton />}
        {isError && <ErrorState message={(error as { message: string }).message} />}
        {!isPending && !isError && data?.data.length === 0 && (
          <EmptyState title="Nothing to reconcile yet" description="Run a reconciliation to diff your ledger against merchantTxRef." />
        )}
        {!isPending && !isError && data && data.data.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-800 text-xs text-paper-200/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Merchant tx ref</th>
                  <th className="px-4 py-3 font-medium">Diff (kobo)</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.data.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-paper-100">{r.merchantTxRef}</td>
                    <td className="ledger-num px-4 py-3 text-paper-100">{r.diff}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs", STATUS_STYLES[r.status])}>
                        {r.status}
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
