"use client";

import { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Send,
  ShieldAlert,
  Lock,
  Unlock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { walletsApi } from "@/api/wallets";
import { useToast } from "@/providers/toast-provider";
import { TableSkeleton, ErrorState } from "@/components/ui/AsyncStates";
import { cn } from "@/utils/cn";

function formatKobo(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);
}

const TIER_LIMITS = {
  TIER_1: { single: 50000, daily: 100000 },
  TIER_2: { single: 200000, daily: 500000 },
  TIER_3: { single: 5000000, daily: 10000000 }
};

export default function WalletDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const id = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [ledgerPage, setLedgerPage] = useState(1);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showConfirmStatusModal, setShowConfirmStatusModal] = useState<"FREEZE" | "ACTIVATE" | "CLOSE" | null>(null);

  // Statement date states (default last 30 days)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Transfer form state
  const [recipientAccount, setRecipientAccount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDesc, setTransferDesc] = useState("");

  // KYC form state
  const [selectedTier, setSelectedTier] = useState<"TIER_1" | "TIER_2" | "TIER_3">("TIER_1");
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");
  const [proofOfAddress, setProofOfAddress] = useState(false);

  // Queries
  const { data: wallet, isPending: isWalletPending, isError: isWalletError, error: walletError } = useQuery({
    queryKey: ["wallet", id],
    queryFn: () => walletsApi.getById(id),
  });

  const { data: ledger, isPending: isLedgerPending } = useQuery({
    queryKey: ["ledger", id, ledgerPage],
    queryFn: () => walletsApi.getLedger(id, { page: ledgerPage, pageSize: 10 }),
    enabled: !!wallet,
  });

  // Mutations
  const transferMutation = useMutation({
    mutationFn: (payload: { toWalletId: string; amountKobo: number; merchantTxRef: string }) =>
      walletsApi.transfer({
        fromWalletId: id,
        toWalletId: payload.toWalletId,
        amountKobo: payload.amountKobo,
        merchantTxRef: payload.merchantTxRef,
      }),
    onSuccess: () => {
      toast("Transfer completed successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["wallet", id] });
      queryClient.invalidateQueries({ queryKey: ["ledger", id] });
      setShowTransferModal(false);
      setTransferAmount("");
      setRecipientAccount("");
      setTransferDesc("");
    },
    onError: (err: any) => {
      toast(err.message || "Transfer failed. Check balance and limits.", "error");
    }
  });

  const kycMutation = useMutation({
    mutationFn: (kyc: { tier: "TIER_1" | "TIER_2" | "TIER_3"; bvn?: string; nin?: string; proofOfAddress: boolean }) =>
      walletsApi.updateKyc(id, kyc),
    onSuccess: () => {
      toast("KYC tier updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["wallet", id] });
      setShowKycModal(false);
    },
    onError: (err: any) => {
      toast(err.message || "Failed to update KYC", "error");
    }
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: "ACTIVE" | "FROZEN" | "CLOSED") =>
      walletsApi.updateStatus(id, newStatus),
    onSuccess: (data) => {
      toast(`Wallet status updated to ${data.status}`, "success");
      queryClient.invalidateQueries({ queryKey: ["wallet", id] });
      setShowConfirmStatusModal(null);
    },
    onError: (err: any) => {
      toast(err.message || "Failed to update wallet status", "error");
    }
  });

  const downloadPdfMutation = useMutation({
    mutationFn: () => walletsApi.getStatementPdf(id, { from: startDate, to: endDate }),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `statement_${wallet?.accountNumber || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast("PDF Statement downloaded", "success");
    },
    onError: (err: any) => {
      toast(err.message || "Failed to generate PDF statement", "error");
    }
  });

  // Action Triggers
  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientAccount || !transferAmount) return;

    const amountKobo = Math.round(parseFloat(transferAmount) * 100);
    if (isNaN(amountKobo) || amountKobo <= 0) {
      toast("Please enter a valid amount", "error");
      return;
    }

    transferMutation.mutate({
      toWalletId: recipientAccount,
      amountKobo,
      merchantTxRef: transferDesc || `tx_desk_${Date.now()}`
    });
  };

  const handleKycUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTier === "TIER_2" && !bvn) {
      toast("BVN is required for Tier 2", "error");
      return;
    }
    if (selectedTier === "TIER_3" && (!bvn || !nin || !proofOfAddress)) {
      toast("BVN, NIN and Proof of Address are required for Tier 3", "error");
      return;
    }

    kycMutation.mutate({
      tier: selectedTier,
      bvn: bvn || undefined,
      nin: nin || undefined,
      proofOfAddress
    });
  };

  if (isWalletPending) {
    return (
      <div className="py-10">
        <TableSkeleton rows={8} />
      </div>
    );
  }

  if (isWalletError || !wallet) {
    return <ErrorState message={walletError?.message || "Wallet details not found"} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/wallets"
          className="flex items-center gap-2 text-sm text-paper-200/50 hover:text-paper-100 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to wallets list
        </Link>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wider uppercase",
            wallet.status === "ACTIVE" && "text-signal-green bg-signal-green/10",
            wallet.status === "FROZEN" && "text-amber-500 bg-amber-500/10",
            wallet.status === "CLOSED" && "text-signal-red bg-signal-red/10"
          )}
        >
          {wallet.status}
        </span>
      </div>

      {/* Main Info Blocks */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Wallet Balance Info */}
        <div className="rounded-xl border border-white/5 bg-ink-800 p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-paper-200/50 uppercase tracking-wider">Account Balance</p>
            <h2 className="ledger-num mt-2 text-3xl font-bold text-paper-50">{formatKobo(wallet.balanceKobo)}</h2>
          </div>
          <div className="mt-6 flex gap-2">
            <button
              disabled={wallet.status !== "ACTIVE"}
              onClick={() => setShowTransferModal(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-500 py-2.5 text-xs font-semibold text-white hover:bg-blue-600 active:bg-blue-700 disabled:opacity-30 transition"
            >
              <Send className="h-3.5 w-3.5" />
              Transfer
            </button>
            {wallet.status === "ACTIVE" ? (
              <button
                onClick={() => setShowConfirmStatusModal("FREEZE")}
                className="flex items-center justify-center rounded-lg border border-white/10 px-3 py-2.5 text-xs font-semibold text-paper-100 hover:bg-white/5 active:bg-white/10 transition"
                title="Freeze wallet"
              >
                <Lock className="h-3.5 w-3.5" />
              </button>
            ) : wallet.status === "FROZEN" ? (
              <button
                onClick={() => setShowConfirmStatusModal("ACTIVATE")}
                className="flex items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 transition"
                title="Unfreeze wallet"
              >
                <Unlock className="h-3.5 w-3.5" />
              </button>
            ) : null}
            {wallet.status !== "CLOSED" && (
              <button
                onClick={() => setShowConfirmStatusModal("CLOSE")}
                className="flex items-center justify-center rounded-lg border border-signal-red/20 text-signal-red hover:bg-signal-red/5 px-3 py-2.5 text-xs font-semibold transition"
                title="Close wallet permanently"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* NUBAN Details */}
        <div className="rounded-xl border border-white/5 bg-ink-800 p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-paper-200/50 uppercase tracking-wider">NUBAN Details</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                <span className="text-paper-200/40">Account No</span>
                <span className="font-mono text-paper-100 font-medium">{wallet.accountNumber}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                <span className="text-paper-200/40">Bank Name</span>
                <span className="text-paper-100 font-medium">{wallet.bank}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-paper-200/40">Assigned ID</span>
                <span className="font-mono text-paper-200/50">{wallet.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Compliance Info */}
        <div className="rounded-xl border border-white/5 bg-ink-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-paper-200/50 uppercase tracking-wider">KYC Compliance</p>
              <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-2xs font-semibold text-blue-400 uppercase">
                {wallet.kyc.tier.replace("TIER_", "Tier ")}
              </span>
            </div>
            <div className="mt-4 space-y-1.5 text-2xs text-paper-200/40">
              <div className="flex justify-between">
                <span>Single Transaction Limit</span>
                <span className="font-mono text-paper-100 font-medium">
                  {formatKobo(TIER_LIMITS[wallet.kyc.tier].single * 100)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Daily Cumulative Limit</span>
                <span className="font-mono text-paper-100 font-medium">
                  {formatKobo(TIER_LIMITS[wallet.kyc.tier].daily * 100)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Identity Document (NIN)</span>
                <span className="font-mono text-paper-100">
                  {wallet.kyc.nin ? `Verified (${wallet.kyc.nin.slice(-4)})` : "Not provided"}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-5 border-t border-white/5 pt-4">
            <button
              onClick={() => {
                setSelectedTier(wallet.kyc.tier);
                setBvn(wallet.kyc.bvn || "");
                setNin(wallet.kyc.nin || "");
                setProofOfAddress(wallet.kyc.proofOfAddress);
                setShowKycModal(true);
              }}
              className="w-full text-center rounded-lg border border-white/10 hover:bg-white/5 text-xs font-semibold py-2 text-paper-100 transition"
            >
              Configure KYC
            </button>
          </div>
        </div>
      </div>

      {/* Statement Export & Ledger Table */}
      <div className="rounded-xl border border-white/5 bg-ink-800 p-6">
        <div className="flex flex-col gap-4 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-display text-base font-semibold text-paper-50">Ledger History</h3>

          {/* Date range picker + Download */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-ink-900 px-3 py-1.5 text-paper-200">
              <Calendar className="h-3.5 w-3.5 text-paper-200/50" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-paper-100 outline-none w-28"
              />
              <span className="text-paper-200/40">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-paper-100 outline-none w-28"
              />
            </div>
            <button
              disabled={downloadPdfMutation.isPending}
              onClick={() => downloadPdfMutation.mutate()}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-paper-50 px-3 py-2 font-semibold border border-white/10 transition disabled:opacity-50"
            >
              {downloadPdfMutation.isPending ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Export PDF
            </button>
          </div>
        </div>

        <div className="mt-4">
          {isLedgerPending ? (
            <TableSkeleton rows={5} />
          ) : !ledger || ledger.data.length === 0 ? (
            <div className="py-12 text-center text-xs text-paper-200/40">
              No transactions found for this wallet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-paper-200/40 border-b border-white/5">
                    <th className="pb-2 font-medium">Transaction ID</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Running Balance</th>
                    <th className="pb-2 font-medium">Description</th>
                    <th className="pb-2 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ledger.data.map((l) => (
                    <tr key={l.id} className="hover:bg-white/2 cursor-pointer">
                      <td className="py-3 font-mono text-paper-200/70">{l.merchantTxRef}</td>
                      <td className="py-3 font-semibold">
                        <span
                          className={cn(
                            l.type === "CREDIT" ? "text-signal-green" : "text-signal-red"
                          )}
                        >
                          {l.type}
                        </span>
                      </td>
                      <td className="ledger-num py-3 text-paper-50">{formatKobo(l.amountKobo)}</td>
                      <td className="ledger-num py-3 text-paper-200/60">{formatKobo(l.runningBalanceKobo)}</td>
                      <td className="py-3 text-paper-200/50 max-w-xs truncate">{l.description}</td>
                      <td className="py-3 text-paper-200/40">{new Date(l.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Transfer Funds */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-ink-800 p-6 shadow-2xl animate-tick">
            <h3 className="font-display text-lg font-semibold text-paper-50">Transfer Ledger Funds</h3>
            <form onSubmit={handleTransfer} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-paper-200/70">Recipient Wallet ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 341c8f1a-b620-4e1b-8533-875fba18cf23"
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-paper-50 outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-paper-200/70">Amount (NGN)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-paper-50 outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-paper-200/70">Narration / Reference</label>
                <input
                  type="text"
                  placeholder="Payout description"
                  value={transferDesc}
                  onChange={(e) => setTransferDesc(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-paper-50 outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="rounded-lg border border-white/10 hover:bg-white/5 px-4 py-2.5 font-semibold text-paper-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferMutation.isPending}
                  className="rounded-lg bg-blue-500 hover:bg-blue-600 px-5 py-2.5 font-semibold text-white transition disabled:opacity-50"
                >
                  {transferMutation.isPending ? "Executing..." : "Confirm & Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: KYC Editor */}
      {showKycModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-ink-800 p-6 shadow-2xl animate-tick">
            <h3 className="font-display text-lg font-semibold text-paper-50">Configure KYC compliance</h3>
            <form onSubmit={handleKycUpdate} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-paper-200/70">KYC Level Tier</label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value as "TIER_1" | "TIER_2" | "TIER_3")}
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-paper-50 outline-none focus:border-blue-500/50"
                >
                  <option value="TIER_1">Tier 1 (Base limit)</option>
                  <option value="TIER_2">Tier 2 (NIN / BVN verification)</option>
                  <option value="TIER_3">Tier 3 (BVN + Address verification)</option>
                </select>
              </div>

              {selectedTier !== "TIER_1" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-paper-200/70">Bank Verification Number (BVN)</label>
                  <input
                    type="text"
                    maxLength={11}
                    required
                    placeholder="11 digits BVN"
                    value={bvn}
                    onChange={(e) => setBvn(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-paper-50 outline-none focus:border-blue-500/50"
                  />
                </div>
              )}

              {selectedTier === "TIER_3" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-paper-200/70">National Identity Number (NIN)</label>
                    <input
                      type="text"
                      maxLength={11}
                      required
                      placeholder="11 digits NIN"
                      value={nin}
                      onChange={(e) => setNin(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-paper-50 outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="proofOfAddress"
                      checked={proofOfAddress}
                      onChange={(e) => setProofOfAddress(e.target.checked)}
                      className="rounded border-white/10 bg-ink-900 accent-blue-500"
                    />
                    <label htmlFor="proofOfAddress" className="text-xs text-paper-200/70 select-none cursor-pointer">
                      Verified Utility Bill / Proof of Address Document
                    </label>
                  </div>
                </>
              )}

              <div className="mt-6 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowKycModal(false)}
                  className="rounded-lg border border-white/10 hover:bg-white/5 px-4 py-2.5 font-semibold text-paper-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={kycMutation.isPending}
                  className="rounded-lg bg-blue-500 hover:bg-blue-600 px-5 py-2.5 font-semibold text-white transition disabled:opacity-50"
                >
                  {kycMutation.isPending ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Destructive Actions confirmation */}
      {showConfirmStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-signal-red/20 bg-ink-800 p-6 shadow-2xl animate-tick">
            <div className="flex items-center gap-3 text-signal-red">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="font-display text-base font-semibold">
                {showConfirmStatusModal === "FREEZE" && "Freeze Customer Wallet?"}
                {showConfirmStatusModal === "ACTIVATE" && "Unfreeze Customer Wallet?"}
                {showConfirmStatusModal === "CLOSE" && "Close Wallet Permanently?"}
              </h3>
            </div>
            <p className="mt-3 text-xs text-paper-200/60 leading-relaxed">
              {showConfirmStatusModal === "FREEZE" &&
                "This will temporarily block all outgoing transactions. Incoming payments will be quarantined."}
              {showConfirmStatusModal === "ACTIVATE" &&
                "This will restore regular transfer capabilities and release the wallet block."}
              {showConfirmStatusModal === "CLOSE" &&
                "WARNING: This action is irreversible. The NUBAN connection will be severed, and no further operations can occur."}
            </p>
            <div className="mt-6 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowConfirmStatusModal(null)}
                className="rounded-lg border border-white/10 hover:bg-white/5 px-4 py-2.5 font-semibold text-paper-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showConfirmStatusModal === "FREEZE") statusMutation.mutate("FROZEN");
                  if (showConfirmStatusModal === "ACTIVATE") statusMutation.mutate("ACTIVE");
                  if (showConfirmStatusModal === "CLOSE") statusMutation.mutate("CLOSED");
                }}
                disabled={statusMutation.isPending}
                className={cn(
                  "rounded-lg px-5 py-2.5 font-semibold text-white transition",
                  showConfirmStatusModal === "ACTIVATE" ? "bg-blue-500 hover:bg-blue-600" : "bg-signal-red hover:bg-red-600"
                )}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
