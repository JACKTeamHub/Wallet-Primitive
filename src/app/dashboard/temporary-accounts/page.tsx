"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Timer, RefreshCw } from "lucide-react";
import { temporaryAccountsApi } from "@/api/temporaryAccounts";
import { TableSkeleton, EmptyState, ErrorState } from "@/components/ui/AsyncStates";
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

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "text-amber-500 bg-amber-500/10",
  PENDING: "text-amber-500 bg-amber-500/10",
  FUNDED: "text-signal-green bg-signal-green/10",
  EXPIRED: "text-paper-200/50 bg-white/5",
};

export default function TemporaryAccountsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expiresInMinutes, setExpiresInMinutes] = useState(60);
  const [expectedAmount, setExpectedAmount] = useState("");
  const [accountName, setAccountName] = useState("");

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["temporary-accounts"],
    queryFn: () => temporaryAccountsApi.list({ page: 1, pageSize: 20 }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      temporaryAccountsApi.create({
        expectedAmount: parseFloat(expectedAmount),
        expiresInSeconds: expiresInMinutes * 60,
        accountName: accountName.trim() || undefined,
      }),
    onSuccess: () => {
      toast("Temporary checkout account created", "success");
      queryClient.invalidateQueries({ queryKey: ["temporary-accounts"] });
      setShowCreateModal(false);
      setExpectedAmount("");
      setAccountName("");
    },
    onError: (err: any) => {
      toast(err.message || "Failed to create checkout account", "error");
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expectedAmount.trim() || parseFloat(expectedAmount) <= 0) return;
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-paper-50">Temporary Accounts</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 active:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          Create Checkout
        </button>
      </div>

      <div className="mt-5">
        {isPending && <TableSkeleton />}
        {isError && <ErrorState message={(error as { message: string }).message} />}
        {!isPending && !isError && data?.data.length === 0 && (
          <EmptyState title="No temporary accounts" description="Short-lived checkout accounts will appear here until they expire." />
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
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.data.map((a) => {
                    const isExpired = new Date() > new Date(a.expiresAt);
                    const displayStatus = isExpired ? "EXPIRED" : ((a.status as string) === "ACTIVE" ? "PENDING" : a.status);
                    return (
                      <tr key={a.id} className="hover:bg-white/5 cursor-pointer">
                        <td className="px-4 py-3 font-mono text-paper-100">
                          <Link href={`/dashboard/temporary-accounts/${a.id}`} className="block">
                            {a.accountNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-paper-200/60">
                          <Link href={`/dashboard/temporary-accounts/${a.id}`} className="block">
                            {a.bank}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/dashboard/temporary-accounts/${a.id}`} className="block">
                            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider", STATUS_STYLES[displayStatus])}>
                              {displayStatus.charAt(0) + displayStatus.slice(1).toLowerCase()}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-paper-200/60">
                          <Link href={`/dashboard/temporary-accounts/${a.id}`} className="block">
                            {new Date(a.expiresAt).toLocaleString()}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card view (under md) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {data.data.map((a) => {
                const isExpired = new Date() > new Date(a.expiresAt);
                const displayStatus = isExpired ? "EXPIRED" : ((a.status as string) === "ACTIVE" ? "PENDING" : a.status);
                return (
                  <div
                    key={a.id}
                    onClick={() => router.push(`/dashboard/temporary-accounts/${a.id}`)}
                    className="rounded-xl border border-white/5 bg-ink-800 p-4 hover:border-white/10 active:bg-ink-800/80 transition cursor-pointer flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-sm font-semibold text-paper-100">{a.accountNumber}</span>
                        <p className="text-3xs text-paper-200/40 mt-0.5">{a.bank}</p>
                      </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-3xs font-semibold tracking-wider", STATUS_STYLES[displayStatus])}>
                      {displayStatus.charAt(0) + displayStatus.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-3 text-3xs text-paper-200/50">
                    <span>Expected: <span className="font-semibold font-mono text-paper-50">{formatKobo((a.expectedAmount || 0) * 100)}</span></span>
                      <span className="text-4xs text-paper-200/40 font-mono">
                        Expires: {new Date(a.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-ink-800 p-6 shadow-2xl animate-tick">
            <h3 className="font-display text-lg font-semibold text-paper-50 flex items-center gap-2">
              <Timer className="h-5 w-5 text-blue-500" />
              Provision Checkout Account
            </h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-paper-200/70">Expected Amount (NGN)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={expectedAmount}
                  onChange={(e) => setExpectedAmount(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-paper-50 outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-paper-200/70">Account Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Invoice #1024"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-paper-50 outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-paper-200/70">Expiration Window</label>
                <select
                  value={expiresInMinutes}
                  onChange={(e) => setExpiresInMinutes(parseInt(e.target.value, 10))}
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-paper-50 outline-none focus:border-blue-500/50"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">1 Hour (Standard)</option>
                  <option value="720">12 Hours</option>
                  <option value="1440">24 Hours</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-white/10 hover:bg-white/5 px-4 py-2.5 font-semibold text-paper-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!expectedAmount.trim() || parseFloat(expectedAmount) <= 0 || createMutation.isPending}
                  className="rounded-lg bg-blue-500 hover:bg-blue-600 px-5 py-2.5 font-semibold text-white transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {createMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  {createMutation.isPending ? "Creating..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
