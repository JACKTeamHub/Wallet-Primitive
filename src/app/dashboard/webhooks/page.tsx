"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { webhooksApi } from "@/api/webhooks";
import { TableSkeleton, EmptyState, ErrorState } from "@/components/ui/AsyncStates";
import { cn } from "@/utils/cn";

function syntaxHighlightJson(obj: any) {
  const json = JSON.stringify(obj, null, 2);
  const lines = json.split("\n");
  
  return lines.map((line, i) => {
    // Match key-value structure
    const match = line.match(/^(\s*)(".*?")(\s*:\s*)(.*)$/);
    if (match && match[4] !== undefined) {
      const indent = match[1] || "";
      const key = match[2] || "";
      const colon = match[3] || "";
      const value = match[4];
      
      let highlightedValue: React.ReactNode = value;
      const cleanValue = value.trim().replace(/,$/, "");
      const hasComma = value.endsWith(",");
      
      if (cleanValue.startsWith('"')) {
        highlightedValue = <span className="text-emerald-400">{cleanValue}</span>;
      } else if (cleanValue === "true" || cleanValue === "false") {
        highlightedValue = <span className="text-purple-400">{cleanValue}</span>;
      } else if (cleanValue === "null") {
        highlightedValue = <span className="text-paper-400/50">{cleanValue}</span>;
      } else if (!isNaN(Number(cleanValue))) {
        highlightedValue = <span className="text-blue-400">{cleanValue}</span>;
      }
      
      return (
        <div key={i} className="leading-5">
          <span>{indent}</span>
          <span className="text-amber-400">{key}</span>
          <span>{colon}</span>
          {highlightedValue}
          {hasComma && <span>,</span>}
        </div>
      );
    }
    
    return (
      <div key={i} className="leading-5">
        {line}
      </div>
    );
  });
}

export default function WebhooksPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["webhooks"],
    queryFn: () => webhooksApi.list({ page: 1, pageSize: 30 }),
  });

  const selected = data?.data.find((w) => w.id === selectedId) ?? null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById("payload-viewer")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

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
                  onClick={() => handleSelect(w.id)}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-3 text-left text-sm transition hover:bg-white/5",
                    selectedId === w.id && "bg-white/5"
                  )}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-paper-100 font-semibold">{"payment_success"}</span>
                    <span className="text-3xs text-paper-200/30 font-mono">Ref: {w.eventRef}</span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-3xs font-semibold tracking-wider",
                      w.processedAt ? "bg-signal-green/10 text-signal-green" : "bg-blue-500/10 text-blue-400"
                    )}
                  >
                    {w.processedAt ? "Processed" : "Pending"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div id="payload-viewer" className="lg:col-span-2">
          {selected ? (
            <div className="space-y-2">
              <span className="text-3xs font-semibold text-paper-200/40 uppercase tracking-wider block">Raw Webhook JSON</span>
              <pre className="max-h-[500px] overflow-x-auto whitespace-pre-wrap break-all rounded-xl border border-white/10 bg-ink-950 p-4 font-mono text-[10px] md:text-2xs text-paper-100 shadow-inner select-all">
                {syntaxHighlightJson({
                  event_type: "payment_success",
                  requestId: `req_${selected.id.slice(0, 8)}`,
                  data: {
                    merchant: {
                      userId: "mock_user_id",
                      walletId: "mock_wallet_id"
                    },
                    transaction: {
                      transactionId: selected.eventRef,
                      type: "CREDIT",
                      responseCode: "00",
                      time: selected.processedAt
                    }
                  }
                })}
              </pre>
            </div>
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
