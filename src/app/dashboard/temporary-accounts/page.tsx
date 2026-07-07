"use client";

import { useQuery } from "@tanstack/react-query";
import { temporaryAccountsApi } from "@/api/temporaryAccounts";
import { TableSkeleton, EmptyState, ErrorState } from "@/components/ui/AsyncStates";

export default function TemporaryAccountsPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["temporary-accounts"],
    queryFn: () => temporaryAccountsApi.list({ page: 1, pageSize: 20 }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-paper-50">Temporary accounts</h1>
      <div className="mt-5">
        {isPending && <TableSkeleton />}
        {isError && <ErrorState message={(error as { message: string }).message} />}
        {!isPending && !isError && data?.data.length === 0 && (
          <EmptyState title="No temporary accounts" description="Short-lived checkout accounts will appear here until they expire." />
        )}
        {!isPending && !isError && data && data.data.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-800 text-xs text-paper-200/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-4 py-3 font-medium">Bank</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.data.map((a) => (
                  <tr key={a.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-paper-100">{a.accountNumber}</td>
                    <td className="px-4 py-3 text-paper-200/60">{a.bank}</td>
                    <td className="px-4 py-3 text-paper-200/60">{a.status}</td>
                    <td className="px-4 py-3 text-paper-200/60">{new Date(a.expiresAt).toLocaleString()}</td>
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
