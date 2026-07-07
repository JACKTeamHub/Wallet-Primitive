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
  const val = typeof kobo === "number" && !isNaN(kobo) ? kobo : 0;
  const num = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val / 100);
  return `₦${num}`;
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
  const [activeTab, setActiveTab] = useState<"overview" | "compliance" | "ledger">("overview");

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
    mutationFn: (payload: { recipientAccountNumber: string; amount: number; description?: string }) =>
      walletsApi.transfer({
        senderAccountNumber: wallet?.accountNumber || "",
        recipientAccountNumber: payload.recipientAccountNumber,
        amount: payload.amount,
        description: payload.description,
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
    mutationFn: () => walletsApi.getStatementPdf(id, { startDate: startDate || undefined, endDate: endDate || undefined }),
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

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast("Please enter a valid amount", "error");
      return;
    }

    transferMutation.mutate({
      recipientAccountNumber: recipientAccount,
      amount,
      description: transferDesc || undefined,
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/dashboard/wallets"
            className="flex items-center gap-2 text-sm text-paper-200/50 hover:text-paper-100 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to wallets list
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold text-paper-50 flex items-center gap-2">
            Wallet Details
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
          </h1>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="border-b border-white/5 pb-px">
        <nav className="flex gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 transition border-b-2 ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-paper-200/50 hover:text-paper-50"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("compliance")}
            className={`pb-3 transition border-b-2 ${
              activeTab === "compliance"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-paper-200/50 hover:text-paper-50"
            }`}
          >
            Compliance & KYC
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`pb-3 transition border-b-2 ${
              activeTab === "ledger"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-paper-200/50 hover:text-paper-50"
            }`}
          >
            Transaction History
          </button>
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="grid gap-6 md:grid-cols-2">
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
                    <span className="font-mono text-paper-200/50">{wallet.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="max-w-2xl rounded-xl border border-white/5 bg-ink-800 p-6">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-display text-base font-semibold text-paper-50">KYC Compliance</h3>
                  <p className="mt-0.5 text-xs text-paper-200/50">KYC tier verification limits and requirements.</p>
                </div>
                <span className="rounded bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400 uppercase">
                  {(wallet.kyc?.tier || "TIER_1").replace("TIER_", "Tier ")}
                </span>
              </div>
              <div className="mt-6 space-y-4 text-sm text-paper-200">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-paper-200/40">Single Transaction Limit</span>
                  <span className="font-mono text-paper-50 font-semibold">
                    {formatKobo(TIER_LIMITS[wallet.kyc?.tier || "TIER_1"].single * 100)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-paper-200/40">Daily Cumulative Limit</span>
                  <span className="font-mono text-paper-50 font-semibold">
                    {formatKobo(TIER_LIMITS[wallet.kyc?.tier || "TIER_1"].daily * 100)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-paper-200/40">Identity Document (NIN)</span>
                  <span className="font-mono text-paper-50">
                    {wallet.kyc?.nin ? `Verified (${wallet.kyc.nin.slice(-4)})` : "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-paper-200/40">Verification Document (BVN)</span>
                  <span className="font-mono text-paper-50">
                    {wallet.kyc?.bvn ? `Verified (${wallet.kyc.bvn.slice(-4)})` : "Not provided"}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 border-t border-white/5 pt-4">
              <button
                onClick={() => {
                  setSelectedTier(wallet.kyc?.tier || "TIER_1");
                  setBvn(wallet.kyc?.bvn || "");
                  setNin(wallet.kyc?.nin || "");
                  setProofOfAddress(wallet.kyc?.proofOfAddress || false);
                  setShowKycModal(true);
                }}
                className="rounded-lg bg-blue-500 hover:bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition"
              >
                Configure KYC Compliance
              </button>
            </div>
          </div>
        )}

        {activeTab === "ledger" && (
          <div className="rounded-xl border border-white/5 bg-ink-800 p-6">
            <div className="flex flex-col gap-4 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-base font-semibold text-paper-50">Ledger History</h3>
                <p className="mt-0.5 text-xs text-paper-200/50">Chronological transaction history of this virtual account.</p>
              </div>

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
                  Export PDF Statement
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
                <div className="space-y-4">
                  {/* Desktop Table view (md and up) */}
                  <div className="hidden md:block overflow-x-auto">
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
                              <span className={cn(l.type === "CREDIT" ? "text-signal-green" : "text-signal-red")}>
                                {l.type.charAt(0) + l.type.slice(1).toLowerCase()}
                              </span>
                            </td>
                            <td className="ledger-num py-3 text-paper-50 font-semibold">{formatKobo(l.amountKobo)}</td>
                            <td className="ledger-num py-3 text-paper-200/60 font-semibold">{formatKobo(l.runningBalanceKobo)}</td>
                            <td className="py-3 text-paper-200/50 max-w-xs truncate">{l.description}</td>
                            <td className="py-3 text-paper-200/40">{new Date(l.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Stacked Card view (under md) */}
                  <div className="grid grid-cols-1 gap-3 md:hidden">
                    {ledger.data.map((l) => (
                      <div
                        key={l.id}
                        className="rounded-lg border border-white/5 bg-ink-950/40 p-3.5 flex flex-col gap-2.5 text-xs animate-tick"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-paper-200/50 text-[10px]">{l.merchantTxRef}</span>
                          <span className="text-3xs text-paper-200/40">{new Date(l.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={cn("text-3xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider", l.type === "CREDIT" ? "text-signal-green bg-signal-green/10" : "text-signal-red bg-signal-red/10")}>
                            {l.type === "CREDIT" ? "Credit" : "Debit"}
                          </span>
                          <div className="text-right">
                            <span className={cn("font-semibold font-mono text-sm", l.type === "CREDIT" ? "text-signal-green" : "text-signal-red")}>
                              {l.type === "CREDIT" ? "+" : "-"}{formatKobo(l.amountKobo)}
                            </span>
                            <p className="text-[10px] text-paper-200/40 mt-0.5">Bal: {formatKobo(l.runningBalanceKobo)}</p>
                          </div>
                        </div>
                        {l.description && (
                          <p className="text-3xs text-paper-200/40 border-t border-white/5 pt-2 mt-1 truncate">{l.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal 1: Transfer Funds */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-ink-800 p-6 shadow-2xl animate-tick">
            <h3 className="font-display text-lg font-semibold text-paper-50">Transfer Ledger Funds</h3>
            <form onSubmit={handleTransfer} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-paper-200/70">Recipient Account Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1950215058"
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-paper-50 outline-none focus:border-blue-500/50 font-mono"
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
