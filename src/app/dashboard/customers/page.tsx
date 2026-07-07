"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { customersApi } from "@/api/customers";
import { TableSkeleton, EmptyState, ErrorState } from "@/components/ui/AsyncStates";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["customers", { search, page }],
    queryFn: () => customersApi.list({ search, page, pageSize: 20 }),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-paper-50">Customers</h1>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-lg border border-white/10 bg-ink-800 px-3 py-2 sm:max-w-xs">
        <Search className="h-4 w-4 text-paper-200/40" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search customers"
          className="w-full bg-transparent text-sm text-paper-50 outline-none placeholder:text-paper-200/30"
        />
      </div>

      <div className="mt-5">
        {isPending && <TableSkeleton />}
        {isError && <ErrorState message={(error as { message: string }).message} />}
        {!isPending && !isError && data?.data.length === 0 && (
          <EmptyState title="No customers yet" description="Customers created via the API will show up here." />
        )}
        {!isPending && !isError && data && data.data.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-800 text-xs text-paper-200/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.data.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-paper-100">{c.name}</td>
                    <td className="px-4 py-3 text-paper-200/60">{c.email}</td>
                    <td className="px-4 py-3 text-paper-200/60">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data && data.total > data.pageSize && (
        <div className="mt-4 flex justify-end gap-2 text-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-white/10 px-3 py-1.5 text-paper-200/60 disabled:opacity-30"
          >
            Previous
          </button>
          <button
            disabled={page * data.pageSize >= data.total}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-white/10 px-3 py-1.5 text-paper-200/60 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
