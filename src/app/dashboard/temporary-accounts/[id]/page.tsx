"use client";

import { use, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Timer, Calendar, CheckCircle2, Clock, AlertOctagon } from "lucide-react";
import { temporaryAccountsApi } from "@/api/temporaryAccounts";
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

const STATUS_STYLES: Record<string, string> = {
  PENDING: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  FUNDED: "text-signal-green bg-signal-green/10 border-signal-green/20",
  EXPIRED: "text-paper-200/50 bg-white/5 border-white/5",
};

export default function TemporaryAccountDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const id = params.id;

  const [timeLeft, setTimeLeft] = useState<string>("");

  const { data: account, isPending, isError, error } = useQuery({
    queryKey: ["temporary-account", id],
    queryFn: () => temporaryAccountsApi.getById(id),
    refetchInterval: (query) => {
      const data = query.state.data as any;
      if (data && (data.status === "FUNDED" || data.status === "EXPIRED")) {
        return false;
      }
      return 3000; // Poll every 3 seconds while pending payment
    },
  });

  const isExpired = account ? new Date() > new Date(account.expiresAt) : false;
  const mappedStatus = account
    ? (isExpired ? "EXPIRED" : ((account.status as string) === "ACTIVE" ? "PENDING" : account.status))
    : "";

  // Countdown timer logic
  useEffect(() => {
    if (!account || mappedStatus !== "PENDING") {
      setTimeLeft("");
      return;
    }

    const interval = setInterval(() => {
      const difference = +new Date(account.expiresAt) - +new Date();
      if (difference <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
      } else {
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const formatted = `${hours}h ${minutes}m remaining`;
        setTimeLeft(formatted);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [account, mappedStatus]);

  if (isPending) {
    return (
      <div className="py-10">
        <TableSkeleton rows={6} />
      </div>
    );
  }

  if (isError || !account) {
    return <ErrorState message={error?.message || "Temporary account details not found"} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/temporary-accounts"
          className="flex items-center gap-2 text-sm text-paper-200/50 hover:text-paper-100 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to checkout accounts
        </Link>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-3xs font-semibold tracking-wider",
            STATUS_STYLES[mappedStatus]
          )}
        >
          {mappedStatus.charAt(0) + mappedStatus.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Detail Block */}
      <div className="max-w-xl mx-auto rounded-xl border border-white/5 bg-ink-800 p-8 shadow-xl">
        <div className="flex flex-col items-center text-center border-b border-white/5 pb-6">
          <div className="rounded-full bg-blue-500/10 p-3 text-blue-400">
            <Timer className="h-8 w-8" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-paper-50">Checkout Payment Account</h2>
          <p className="mt-1 text-xs text-paper-200/40">Short-lived checkout endpoint for guest payments</p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs text-paper-200/40">NUBAN Account</span>
            <span className="font-mono text-sm font-semibold text-paper-50">{account.accountNumber}</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs text-paper-200/40">Expected Amount</span>
            <span className="font-mono text-sm font-semibold text-paper-50">{formatKobo((account.expectedAmount || 0) * 100)}</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs text-paper-200/40">Received Amount</span>
            <span className="font-mono text-sm font-semibold text-signal-green">{formatKobo((account.receivedAmount || 0) * 100)}</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs text-paper-200/40">Bank Name</span>
            <span className="text-xs font-medium text-paper-100">{account.bank}</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs text-paper-200/40">Expiry Date</span>
            <div className="flex items-center gap-1 text-xs text-paper-100">
              <Calendar className="h-3.5 w-3.5 text-paper-200/50" />
              <span>{new Date(account.expiresAt).toLocaleString()}</span>
            </div>
          </div>

          {mappedStatus === "PENDING" && timeLeft && (
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs text-paper-200/40">Status Countdown</span>
              <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                <Clock className="h-3.5 w-3.5" />
                <span>{timeLeft}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-paper-200/40">Checkout ID</span>
            <span className="font-mono text-2xs text-paper-200/30">{account.id}</span>
          </div>
        </div>

        {/* State Notice Cards */}
        <div className="mt-8">
          {mappedStatus === "FUNDED" && (
            <div className="flex items-start gap-3 rounded-lg border border-signal-green/20 bg-signal-green/5 p-4 text-xs text-signal-green">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Checkout Payment Verified</p>
                <p className="mt-0.5 text-paper-200/50">This invoice has been funded. The transaction is balanced and closed.</p>
              </div>
            </div>
          )}
          {mappedStatus === "PENDING" && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-500">
              <Clock className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Awaiting Deposit</p>
                <p className="mt-0.5 text-paper-200/50">Transfer funds to the NUBAN above. The status will transition to funded immediately upon verification.</p>
              </div>
            </div>
          )}
          {mappedStatus === "EXPIRED" && (
            <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/2 p-4 text-xs text-paper-200/60">
              <AlertOctagon className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Checkout Account Expired</p>
                <p className="mt-0.5 text-paper-200/40">This short-lived virtual account has passed its expiration timeframe. Any incoming deposits will trigger system reject errors.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
