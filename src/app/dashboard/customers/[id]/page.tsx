"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Calendar, Edit2, Wallet, Plus, RefreshCw } from "lucide-react";
import { customersApi } from "@/api/customers";
import { walletsApi } from "@/api/wallets";
import { TableSkeleton, ErrorState, EmptyState } from "@/components/ui/AsyncStates";
import { useToast } from "@/providers/toast-provider";
import { cn } from "@/utils/cn";

function formatKobo(kobo: number) {
  const val = typeof kobo === "number" && !isNaN(kobo) ? kobo : 0;
  const num = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val / 100);
  return `₦${num}`;
}

export default function CustomerDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const id = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showCreateWalletModal, setShowCreateWalletModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [bvn, setBvn] = useState("");

  // Queries
  const { data: customer, isPending: isCustomerPending, isError: isCustomerError, error: customerError } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => customersApi.getById(id),
  });

  const { data: walletsData, isPending: isWalletsPending } = useQuery({
    queryKey: ["wallets"],
    queryFn: () => walletsApi.list({ page: 1, pageSize: 100 }),
    enabled: !!customer,
  });

  const customerWallets = walletsData?.data.filter((w) => w.customerId === id) || [];

  // Mutations
  const renameMutation = useMutation({
    mutationFn: (name: string) => customersApi.rename(id, name),
    onSuccess: (data) => {
      toast("Customer renamed successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      setShowRenameModal(false);
    },
    onError: (err: any) => {
      toast(err.message || "Failed to rename customer", "error");
    }
  });

  const createWalletMutation = useMutation({
    mutationFn: (payload: { customerId: string; bvn: string }) =>
      walletsApi.create(payload),
    onSuccess: () => {
      toast("NUBAN virtual wallet provisioned successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      setShowCreateWalletModal(false);
      setBvn("");
    },
    onError: (err: any) => {
      toast(err.message || "Failed to provision wallet", "error");
    }
  });

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    renameMutation.mutate(newName);
  };

  const handleCreateWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bvn || bvn.length !== 11) {
      toast("Please enter a valid 11-digit BVN", "error");
      return;
    }
    createWalletMutation.mutate({ customerId: id, bvn });
  };

  if (isCustomerPending) {
    return (
      <div className="py-10">
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (isCustomerError || !customer) {
    return <ErrorState message={customerError?.message || "Customer details not found"} />;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/customers"
          className="flex items-center gap-2 text-sm text-paper-200/50 hover:text-paper-100 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to customers list
        </Link>
      </div>

      {/* Customer profile card */}
      <div className="rounded-xl border border-white/5 bg-ink-800 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-blue-500/10 p-3.5 text-blue-400">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-paper-50 flex items-center gap-2">
              {customer.name}
              <button
                onClick={() => {
                  setNewName(customer.name);
                  setShowRenameModal(true);
                }}
                className="text-paper-200/40 hover:text-paper-100 transition"
                title="Rename customer"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </h2>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-paper-200/50">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {customer.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Registered: {new Date(customer.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => setShowCreateWalletModal(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 hover:bg-blue-600 active:bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white transition w-full md:w-auto"
          >
            <Plus className="h-4 w-4" />
            Provision NUBAN Wallet
          </button>
        </div>
      </div>

      {/* Linked Wallets */}
      <div className="rounded-xl border border-white/5 bg-ink-800 p-6">
        <h3 className="font-display text-base font-semibold text-paper-50 flex items-center gap-2 mb-4">
          <Wallet className="h-5 w-5 text-paper-200/50" />
          Associated Wallets
        </h3>

        {isWalletsPending ? (
          <TableSkeleton rows={3} />
        ) : customerWallets.length === 0 ? (
          <EmptyState
            title="No wallets linked"
            description="This customer does not have any dedicated virtual wallets configured yet."
          />
        ) : (
          <div className="space-y-4">
            {/* Desktop Table view (md and up) */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-white/10 bg-ink-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-ink-950 text-paper-200/50">
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-3 font-medium">NUBAN Account</th>
                    <th className="px-4 py-3 font-medium">Bank</th>
                    <th className="px-4 py-3 font-medium">Balance</th>
                    <th className="px-4 py-3 font-medium">KYC Tier</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customerWallets.map((w) => (
                    <tr key={w.id} className="hover:bg-white/2 cursor-pointer">
                      <td className="px-4 py-3 font-mono text-paper-100 font-semibold">
                        <Link href={`/dashboard/wallets/${w.id}`} className="block">
                          {w.accountNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-paper-200/60">
                        <Link href={`/dashboard/wallets/${w.id}`} className="block">
                          {w.bank}
                        </Link>
                      </td>
                      <td className="ledger-num px-4 py-3 text-paper-100 font-semibold">
                        <Link href={`/dashboard/wallets/${w.id}`} className="block">
                          {formatKobo(w.balanceKobo)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-paper-200/60">
                        <Link href={`/dashboard/wallets/${w.id}`} className="block">
                          {w.kyc?.tier ? w.kyc.tier.replace("TIER_", "Tier ") : "Tier 1"}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/wallets/${w.id}`} className="block">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider",
                              w.status === "ACTIVE" && "text-signal-green bg-signal-green/10",
                              w.status === "FROZEN" && "text-amber-500 bg-amber-500/10",
                              w.status === "CLOSED" && "text-signal-red bg-signal-red/10"
                            )}
                          >
                            {w.status.charAt(0) + w.status.slice(1).toLowerCase()}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card view (under md) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {customerWallets.map((w) => (
                <div
                  key={w.id}
                  onClick={() => router.push(`/dashboard/wallets/${w.id}`)}
                  className="rounded-xl border border-white/5 bg-ink-900 p-4 hover:border-white/10 active:bg-ink-900/80 transition cursor-pointer flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-sm font-semibold text-paper-100">{w.accountNumber}</span>
                      <p className="text-3xs text-paper-200/40 mt-0.5">{w.bank}</p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-3xs font-semibold tracking-wider",
                        w.status === "ACTIVE" && "text-signal-green bg-signal-green/10",
                        w.status === "FROZEN" && "text-amber-500 bg-amber-500/10",
                        w.status === "CLOSED" && "text-signal-red bg-signal-red/10"
                      )}
                    >
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

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-ink-800 p-6 shadow-2xl animate-tick">
            <h3 className="font-display text-base font-semibold text-paper-50">Rename Customer Profile</h3>
            <form onSubmit={handleRename} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-paper-200/70">New Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full legal name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-paper-50 outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="rounded-lg border border-white/10 hover:bg-white/5 px-4 py-2.5 font-semibold text-paper-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renameMutation.isPending}
                  className="rounded-lg bg-blue-500 hover:bg-blue-600 px-5 py-2.5 font-semibold text-white transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {renameMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  {renameMutation.isPending ? "Renaming..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Wallet Modal */}
      {showCreateWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-ink-800 p-6 shadow-2xl animate-tick">
            <h3 className="font-display text-base font-semibold text-paper-50">Provision Dedicated NUBAN</h3>
            <form onSubmit={handleCreateWallet} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-paper-200/70">Bank Verification Number (BVN)</label>
                <input
                  type="text"
                  maxLength={11}
                  required
                  placeholder="11-digit BVN"
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-paper-50 outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowCreateWalletModal(false)}
                  className="rounded-lg border border-white/10 hover:bg-white/5 px-4 py-2.5 font-semibold text-paper-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createWalletMutation.isPending}
                  className="rounded-lg bg-blue-500 hover:bg-blue-600 px-5 py-2.5 font-semibold text-white transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {createWalletMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  {createWalletMutation.isPending ? "Provisioning..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
