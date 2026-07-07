"use client";

import { useQuery } from "@tanstack/react-query";
import { auditLogsApi } from "@/api/auditLogs";
import { TableSkeleton, EmptyState, ErrorState } from "@/components/ui/AsyncStates";

export default function AuditLogsPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => auditLogsApi.list({ page: 1, pageSize: 30 }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-paper-50">Audit logs</h1>
      <div className="mt-5">
        {isPending && <TableSkeleton />}
        {isError && <ErrorState message={(error as { message: string }).message} />}
        {!isPending && !isError && data?.data.length === 0 && (
          <EmptyState title="No activity yet" description="Every mutation in this workspace will be attributed and logged here." />
        )}
        {!isPending && !isError && data && data.data.length > 0 && (
          <div className="space-y-4">
            {/* Desktop Table view (md and up) */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-ink-800 text-xs text-paper-200/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Actor</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.data.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-paper-100">{log.actor}</td>
                      <td className="px-4 py-3 font-mono text-xs text-paper-200/70">{log.action}</td>
                      <td className="px-4 py-3 text-paper-200/60">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card view (under md) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {data.data.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-white/5 bg-ink-800 p-4 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-paper-100 text-sm">{log.actor}</span>
                    <span className="text-3xs text-paper-200/40">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-3xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded self-start border border-blue-500/10">
                    {log.action}
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
