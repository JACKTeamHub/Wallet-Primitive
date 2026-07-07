"use client";

import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { reconciliationApi } from "@/api/reconciliation";
import { workspacesApi } from "@/api/workspaces";
import { TableSkeleton, EmptyState, ErrorState } from "@/components/ui/AsyncStates";
import { useToast } from "@/providers/toast-provider";
import { Check, X, FileSearch, RefreshCw, Plus } from "lucide-react";
import { cn } from "@/utils/cn";

function formatKobo(kobo: number) {
  const val = typeof kobo === "number" && !isNaN(kobo) ? kobo : 0;
  const num = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val / 100);
  return `₦${num}`;
}

const RECON_STATUS_STYLES: Record<string, string> = {
  CREDIT: "text-signal-green bg-signal-green/10",
  DEBIT: "text-signal-red bg-signal-red/10",
};

export default function ReconciliationPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"quarantine" | "diff">("quarantine");
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Manual Reconciliation Modal States
  const [showReconModal, setShowReconModal] = useState(false);
  const [txRef, setTxRef] = useState("");
  const [reconAction, setReconAction] = useState<"CREDIT" | "REFUND">("CREDIT");

  const {
    data: quarantineData,
    isPending: isQuarantinePending,
    isError: isQuarantineError,
    error: quarantineError,
  } = useQuery({
    queryKey: ["quarantine"],
    queryFn: () => workspacesApi.quarantine.list(),
  });

  const {
    data: diffData,
    isPending: isDiffPending,
    isError: isDiffError,
    error: diffError,
  } = useQuery({
    queryKey: ["reconciliation"],
    queryFn: () => reconciliationApi.list(),
  });

  // Mutations
  const runReconMutation = useMutation({
    mutationFn: (dto: { transactionId: string; action: "CREDIT" | "REFUND" }) => reconciliationApi.run(dto),
    onSuccess: () => {
      toast("Transaction manually reconciled successfully", "success");
      setTxRef("");
      setShowReconModal(false);
      qc.invalidateQueries({ queryKey: ["reconciliation"] });
    },
    onError: (err: any) => {
      toast(err.message || "Manual reconciliation failed.", "error");
    }
  });

  const releaseMutation = useMutation({
    mutationFn: (id: string) => workspacesApi.quarantine.release(id),
    onMutate: (id) => setActioningId(id),
    onSettled: () => setActioningId(null),
    onSuccess: () => {
      toast("Quarantine released and credited", "success");
      qc.invalidateQueries({ queryKey: ["quarantine"] });
    },
    onError: (err: any) => {
      toast(err.message || "Release failed.", "error");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => workspacesApi.quarantine.reject(id),
    onMutate: (id) => setActioningId(id),
    onSettled: () => setActioningId(null),
    onSuccess: () => {
      toast("Quarantine transaction rejected", "success");
      qc.invalidateQueries({ queryKey: ["quarantine"] });
    },
    onError: (err: any) => {
      toast(err.message || "Failed to reject transaction", "error");
    }
  });

  const handleReconcile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txRef.trim()) return;
    runReconMutation.mutate({ transactionId: txRef, action: reconAction });
  };

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
            Manual Logs
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
            <div className="space-y-4 animate-tick">
              {/* Desktop Table view (md and up) */}
              <div className="hidden md:block overflow-hidden rounded-xl border border-white/10 bg-ink-800">
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
                        <td className="ledger-num px-4 py-3 text-paper-100 font-semibold">{formatKobo(q.amountKobo)}</td>
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

              {/* Mobile Stacked Card view (under md) */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {quarantineData.map((q: any) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-white/5 bg-ink-800 p-4 flex flex-col gap-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-paper-100 font-semibold">{q.merchantTxRef}</span>
                      <span className="text-3xs text-paper-200/40">{new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <div>
                        <p className="text-4xs uppercase tracking-wider text-paper-200/30 font-semibold">Amount</p>
                        <p className="text-sm font-bold text-paper-50 font-mono mt-0.5">{formatKobo(q.amountKobo)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          disabled={actioningId !== null}
                          onClick={() => releaseMutation.mutate(q.id)}
                          className="flex h-8 px-3 gap-1 items-center justify-center rounded bg-signal-green/10 text-signal-green hover:bg-signal-green/20 disabled:opacity-40 transition text-2xs font-semibold animate-tick"
                          title="Release funds"
                        >
                          {actioningId === q.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>Release</span>
                            </>
                          )}
                        </button>
                        <button
                          disabled={actioningId !== null}
                          onClick={() => rejectMutation.mutate(q.id)}
                          className="flex h-8 px-3 gap-1 items-center justify-center rounded bg-signal-red/10 text-signal-red hover:bg-signal-red/20 disabled:opacity-40 transition text-2xs font-semibold animate-tick"
                          title="Reject deposit"
                        >
                          {actioningId === q.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <X className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    {q.description && (
                      <p className="text-3xs text-paper-200/40 bg-white/2 p-2 rounded truncate">{q.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Diff Reconciliation */}
      {activeTab === "diff" && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-paper-200/50 uppercase tracking-wider">Reconciled Transactions</h3>
            <button
              onClick={() => setShowReconModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Run Manual Reconciliation
            </button>
          </div>

          <div>
            {isDiffPending && <TableSkeleton />}
            {isDiffError && <ErrorState message={(diffError as { message: string }).message} />}
            {!isDiffPending && !isDiffError && (!diffData || diffData.data.length === 0) && (
              <EmptyState
                title="No reconciled entries yet"
                description="Use the button above to manually credit or refund a transaction using its Nomba reference."
              />
            )}
            {!isDiffPending && !isDiffError && diffData && diffData.data.length > 0 && (
              <div className="space-y-4 animate-tick">
                {/* Desktop Table view (md and up) */}
                <div className="hidden md:block overflow-hidden rounded-xl border border-white/10 bg-ink-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-ink-950 text-xs text-paper-200/50">
                      <tr className="border-b border-white/5">
                        <th className="px-4 py-3 font-medium">Merchant Tx Ref</th>
                        <th className="px-4 py-3 font-medium">Target Account</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {diffData.data.map((r: any) => (
                        <tr key={r.id} className="hover:bg-white/5 text-xs">
                          <td className="px-4 py-3 font-mono text-paper-100 font-semibold">{r.merchantTxRef || r.id.slice(0, 8)}</td>
                          <td className="px-4 py-3 font-mono text-paper-200/60">
                            {r.wallet?.accountNumber ? (
                              <span>{r.wallet.accountNumber} <span className="text-[10px] text-paper-200/30">({r.wallet.bankName})</span></span>
                            ) : (
                              <span className="italic text-paper-200/30">Unknown Wallet</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("rounded-full px-2 py-0.5 text-3xs font-semibold tracking-wider uppercase", r.type === "CREDIT" ? RECON_STATUS_STYLES.CREDIT : RECON_STATUS_STYLES.DEBIT)}>
                              {r.type === "CREDIT" ? "Credit" : "Refund"}
                            </span>
                          </td>
                          <td className="ledger-num px-4 py-3 text-paper-100 font-semibold">{formatKobo(parseFloat(r.amount) * 100)}</td>
                          <td className="px-4 py-3 text-paper-200/40">{new Date(r.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Stacked Card view (under md) */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {diffData.data.map((r: any) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-white/5 bg-ink-800 p-4 flex flex-col gap-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-paper-100 font-semibold">{r.merchantTxRef || r.id.slice(0, 8)}</span>
                        <span className={cn("rounded-full px-2 py-0.5 text-3xs font-semibold tracking-wider uppercase", r.type === "CREDIT" ? RECON_STATUS_STYLES.CREDIT : RECON_STATUS_STYLES.DEBIT)}>
                          {r.type === "CREDIT" ? "Credit" : "Refund"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                        <div className="flex items-center justify-between text-3xs">
                          <span className="text-paper-200/40">Target Account</span>
                          <span className="font-mono text-paper-100">{r.wallet?.accountNumber || "Unknown"}</span>
                        </div>
                        <div className="flex items-center justify-between text-3xs">
                          <span className="text-paper-200/40">Date</span>
                          <span className="text-paper-200/50">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-end justify-between border-t border-white/5 pt-3">
                        <div>
                          <p className="text-4xs uppercase tracking-wider text-paper-200/30 font-semibold">Reconciled Amount</p>
                          <p className="text-sm font-semibold text-paper-50 font-mono mt-0.5">{formatKobo(parseFloat(r.amount) * 100)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Reconciliation Modal */}
      {showReconModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-ink-800 p-6 shadow-2xl animate-tick">
            <h3 className="font-display text-lg font-semibold text-paper-50 flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-blue-500" />
              Manual Reconciliation
            </h3>
            <p className="mt-1 text-xs text-paper-200/50">Look up a specific Nomba transaction to manually credit or refund a virtual wallet.</p>
            <form onSubmit={handleReconcile} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-paper-200/70">Nomba Transaction Ref</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TX-123456789"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-paper-50 outline-none focus:border-blue-500/50 placeholder:text-paper-200/20 font-mono"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-paper-200/70">Reconciliation Action</label>
                <select
                  value={reconAction}
                  onChange={(e) => setReconAction(e.target.value as "CREDIT" | "REFUND")}
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-paper-50 outline-none focus:border-blue-500/50"
                >
                  <option value="CREDIT">Credit Wallet (Verify Deposit)</option>
                  <option value="REFUND">Refund Wallet (Verify Debit)</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-2 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setShowReconModal(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-paper-200 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!txRef || runReconMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-xs font-medium text-white hover:bg-blue-600 active:bg-blue-700 disabled:opacity-40 transition animate-tick"
                >
                  {runReconMutation.isPending ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Reconciling…</span>
                    </>
                  ) : (
                    <span>Reconcile transaction</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
