"use client";

import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { reconciliationApi } from "@/api/reconciliation";
import { workspacesApi } from "@/api/workspaces";
import { TableSkeleton, EmptyState, ErrorState } from "@/components/ui/AsyncStates";
import { useToast } from "@/providers/toast-provider";
import { Check, X, ShieldAlert, FileSearch, RefreshCw } from "lucide-react";
import { cn } from "@/utils/cn";

function formatKobo(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);
}

const RECON_STATUS_STYLES: Record<string, string> = {
  MATCHED: "text-signal-green bg-signal-green/10",
  MISMATCHED: "text-signal-red bg-signal-red/10",
  PENDING: "text-amber-400 bg-amber-500/10",
};

export default function ReconciliationPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"quarantine" | "diff">("quarantine");
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Queries
  const {
    data: diffData,
    isPending: isDiffPending,
    isError: isDiffError,
    error: diffError
  } = useQuery({
    queryKey: ["reconciliation"],
    queryFn: () => reconciliationApi.list({ page: 1, pageSize: 30 }),
    enabled: activeTab === "diff",
  });

  const {
    data: quarantineData,
    isPending: isQuarantinePending,
    isError: isQuarantineError,
    error: quarantineError
  } = useQuery({
    queryKey: ["quarantine"],
    queryFn: () => workspacesApi.quarantine.list(),
    enabled: activeTab === "quarantine",
  });

  // Mutations
  const runReconMutation = useMutation({
    mutationFn: reconciliationApi.run,
    onSuccess: () => {
      toast("Reconciliation comparison completed", "success");
      qc.invalidateQueries({ queryKey: ["reconciliation"] });
    },
    onError: (err: any) => {
      toast(err.message || "Failed to run reconciliation", "error");
    }
  });

  const releaseMutation = useMutation({
    mutationFn: (id: string) => workspacesApi.quarantine.release(id),
    onMutate: (id) => setActioningId(id),
    onSettled: () => setActioningId(null),
    onSuccess: () => {
      toast("Transaction released and wallet credited", "success");
      qc.invalidateQueries({ queryKey: ["quarantine"] });
    },
    onError: (err: any) => {
      toast(err.message || "Release failed. Ensure target wallet is active.", "error");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => workspacesApi.quarantine.reject(id),
    onMutate: (id) => setActioningId(id),
    onSettled: () => setActioningId(null),
    onSuccess: () => {
      toast("Transaction rejected and flagged as failed", "success");
      qc.invalidateQueries({ queryKey: ["quarantine"] });
    },
    onError: (err: any) => {
      toast(err.message || "Failed to reject transaction", "error");
    }
  });

  return (
    <div className="space-y-6">
      {/* Tab Switcher Header */}
      <div className="flex flex-col gap-4 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-paper-50">Operations & Reconciliation</h1>
          <p className="mt-1 text-xs text-paper-200/40">Review discrepancies and release quarantined funds</p>
        </div>
        <div className="flex rounded-lg bg-ink-950 p-1 self-start sm:self-center">
          <button
            onClick={() => setActiveTab("quarantine")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition",
              activeTab === "quarantine"
                ? "bg-blue-500 text-white"
                : "text-paper-200/50 hover:text-paper-100"
            )}
          >
            Quarantine Ledger
          </button>
          <button
            onClick={() => setActiveTab("diff")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition",
              activeTab === "diff"
                ? "bg-blue-500 text-white"
                : "text-paper-200/50 hover:text-paper-100"
            )}
          >
            Diff Reconciliation
          </button>
        </div>
      </div>

      {/* Tab 1: Quarantine Ledger */}
      {activeTab === "quarantine" && (
        <div className="mt-5">
          {isQuarantinePending && <TableSkeleton />}
          {isQuarantineError && <ErrorState message={(quarantineError as { message: string }).message} />}
          {!isQuarantinePending && !isQuarantineError && (!quarantineData || quarantineData.length === 0) && (
            <EmptyState
              title="Quarantine is clear"
              description="Deposits exceeding KYC tier limits or routed to frozen/closed accounts will appear here for review."
            />
          )}
          {!isQuarantinePending && !isQuarantineError && quarantineData && quarantineData.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-800 animate-tick">
              <table className="w-full text-left text-sm">
                <thead className="bg-ink-950 text-xs text-paper-200/50">
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-3 font-medium">Merchant Ref</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">Flagged On</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {quarantineData.map((q: any) => (
                    <tr key={q.id} className="hover:bg-white/2 text-xs">
                      <td className="px-4 py-3 font-mono text-paper-100">{q.merchantTxRef}</td>
                      <td className="ledger-num px-4 py-3 text-paper-100">{formatKobo(q.amountKobo)}</td>
                      <td className="px-4 py-3 text-paper-200/60 max-w-xs truncate">{q.description}</td>
                      <td className="px-4 py-3 text-paper-200/40">{new Date(q.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            disabled={actioningId !== null}
                            onClick={() => releaseMutation.mutate(q.id)}
                            className="flex h-7 w-7 items-center justify-center rounded bg-signal-green/10 text-signal-green hover:bg-signal-green/20 disabled:opacity-40 transition"
                            title="Release funds to wallet"
                          >
                            {actioningId === q.id ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            disabled={actioningId !== null}
                            onClick={() => rejectMutation.mutate(q.id)}
                            className="flex h-7 w-7 items-center justify-center rounded bg-signal-red/10 text-signal-red hover:bg-signal-red/20 disabled:opacity-40 transition"
                            title="Reject deposit"
                          >
                            {actioningId === q.id ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <X className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Diff Reconciliation */}
      {activeTab === "diff" && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-paper-200/50 uppercase tracking-wider">Discrepancy Journals</h3>
            <button
              onClick={() => runReconMutation.mutate()}
              disabled={runReconMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-50 transition"
            >
              {runReconMutation.isPending ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileSearch className="h-3.5 w-3.5" />
              )}
              Run Reconciliation Diff
            </button>
          </div>

          <div>
            {isDiffPending && <TableSkeleton />}
            {isDiffError && <ErrorState message={(diffError as { message: string }).message} />}
            {!isDiffPending && !isDiffError && (!diffData || diffData.data.length === 0) && (
              <EmptyState
                title="Nothing to reconcile yet"
                description="Run a reconciliation to diff your ledger entries against Nomba bank transactions."
              />
            )}
            {!isDiffPending && !isDiffError && diffData && diffData.data.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-800 animate-tick">
                <table className="w-full text-left text-sm">
                  <thead className="bg-ink-950 text-xs text-paper-200/50">
                    <tr className="border-b border-white/5">
                      <th className="px-4 py-3 font-medium">Merchant Tx Ref</th>
                      <th className="px-4 py-3 font-medium">Diff Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {diffData.data.map((r) => (
                      <tr key={r.id} className="hover:bg-white/5 text-xs">
                        <td className="px-4 py-3 font-mono text-paper-100">{r.merchantTxRef}</td>
                        <td className="ledger-num px-4 py-3 text-paper-100">{formatKobo(r.diff)}</td>
                        <td className="px-4 py-3">
                          <span className={cn("rounded-full px-2 py-0.5 text-2xs font-semibold tracking-wide", RECON_STATUS_STYLES[r.status])}>
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
      )}
    </div>
  );
}
