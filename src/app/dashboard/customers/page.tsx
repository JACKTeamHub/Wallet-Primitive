"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Search, Plus, User, RefreshCw } from "lucide-react";
import { customersApi } from "@/api/customers";
import { TableSkeleton, EmptyState, ErrorState } from "@/components/ui/AsyncStates";
import { useToast } from "@/providers/toast-provider";

export default function CustomersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["customers", { search, page }],
    queryFn: () => customersApi.list({ search, page, pageSize: 20 }),
  });

  const createMutation = useMutation({
    mutationFn: () => customersApi.create({ name, email }),
    onSuccess: () => {
      toast("Customer profile created successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setShowCreateModal(false);
      setName("");
      setEmail("");
    },
    onError: (err: any) => {
      toast(err.message || "Failed to create customer", "error");
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-paper-50">Customers</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 active:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          Create Customer
        </button>
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
          <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-950 text-xs text-paper-200/50">
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.data.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/dashboard/customers/${c.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        router.push(`/dashboard/customers/${c.id}`);
                      }
                    }}
                    tabIndex={0}
                    className="hover:bg-white/5 cursor-pointer outline-none focus:bg-white/10 transition"
                  >
                    <td className="px-4 py-3 text-paper-100 font-semibold">{c.name}</td>
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

      {/* Create Customer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-ink-800 p-6 shadow-2xl">
            <h3 className="font-display text-lg font-semibold text-paper-50 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Onboard Customer
            </h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-paper-200/70">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-paper-50 outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-paper-200/70">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-paper-50 outline-none focus:border-blue-500/50"
                />
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
                  disabled={createMutation.isPending}
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
