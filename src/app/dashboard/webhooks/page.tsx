"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { webhooksApi } from "@/api/webhooks";
import { TableSkeleton, EmptyState, ErrorState } from "@/components/ui/AsyncStates";
import { cn } from "@/utils/cn";

export default function WebhooksPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["webhooks"],
    queryFn: () => webhooksApi.list({ page: 1, pageSize: 30 }),
  });

  const selected = data?.data.find((w) => w.id === selectedId) ?? null;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-paper-50">Webhooks</h1>
      <div className="mt-5 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {isPending && <TableSkeleton />}
          {isError && <ErrorState message={(error as { message: string }).message} />}
          {!isPending && !isError && data?.data.length === 0 && (
            <EmptyState title="No webhook events yet" description="Inbound events from Nomba will be logged here as they arrive." />
          )}
          {!isPending && !isError && data && data.data.length > 0 && (
            <div className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10">
              {data.data.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setSelectedId(w.id)}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-3 text-left text-sm transition hover:bg-white/5",
                    selectedId === w.id && "bg-white/5"
                  )}
                >
                  <span className="font-mono text-paper-100">{w.type}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      w.deliveredAt ? "bg-signal-green/10 text-signal-green" : "bg-blue-500/10 text-blue-400"
                    )}
                  >
                    {w.deliveredAt ? "Delivered" : "Pending"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
          {selected ? (
            <pre className="max-h-96 overflow-auto rounded-xl border border-white/10 bg-ink-950 p-4 font-mono text-xs text-paper-100">
              {JSON.stringify(selected.payload, null, 2)}
            </pre>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-paper-200/40">
              Select an event to inspect its payload
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
