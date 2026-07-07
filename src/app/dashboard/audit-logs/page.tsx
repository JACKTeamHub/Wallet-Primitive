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

            {/* Mobile Timeline view (under md) */}
            <div className="md:hidden px-2 py-1">
              <div className="relative border-l border-white/5 pl-4 ml-2 space-y-6">
                {data.data.map((log) => {
                  const act = log.action || "";
                  let dotColor = "bg-blue-500";
                  if (act.includes("CREATE") || act.includes("GENERATE") || act.includes("ONBOARD")) {
                    dotColor = "bg-signal-green";
                  } else if (act.includes("DELETE") || act.includes("REVOKE") || act.includes("REJECT") || act.includes("REMOVE")) {
                    dotColor = "bg-signal-red";
                  } else if (act.includes("LOGIN")) {
                    dotColor = "bg-amber-500";
                  }

                  return (
                    <div key={log.id} className="relative group">
                      {/* Timeline Dot */}
                      <span className={`absolute -left-[21px] top-1.5 flex h-2.5 w-2.5 rounded-full ring-4 ring-ink-950 ${dotColor}`} />
                      
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs font-semibold text-paper-100 break-all select-all">
                          {log.action}
                        </span>
                        <div className="text-3xs text-paper-200/50 flex flex-col gap-0.5">
                          <span className="break-all font-medium text-paper-200/70">{log.actor}</span>
                          <span className="text-paper-200/30">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
