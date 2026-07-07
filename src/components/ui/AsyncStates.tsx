import { Inbox, TriangleAlert } from "lucide-react";

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-11 w-full animate-pulse rounded-lg bg-white/5" />
      ))}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16 text-center">
      <Inbox className="mb-3 h-6 w-6 text-paper-200/30" />
      <p className="text-sm font-medium text-paper-100">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-paper-200/45">{description}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-signal-red/20 bg-signal-red/5 py-16 text-center">
      <TriangleAlert className="mb-3 h-6 w-6 text-signal-red" />
      <p className="text-sm font-medium text-paper-100">Couldn&apos;t load this page</p>
      <p className="mt-1 max-w-xs text-xs text-paper-200/45">{message}</p>
    </div>
  );
}
