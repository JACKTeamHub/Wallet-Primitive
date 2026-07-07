import { client } from "./client";
import type { TemporaryAccount, Paginated } from "@/types/domain";

export const temporaryAccountsApi = {
  create: (payload: { expectedAmount: number; expiresInSeconds: number; accountName?: string }) =>
    client.post<TemporaryAccount>("/temporary-accounts", payload).then((r) => r.data),

  list: (params?: { page?: number; pageSize?: number }) =>
    client
      .get<TemporaryAccount[]>("/temporary-accounts", { params })
      .then((r) => {
        const all = r.data || [];
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 20;
        const start = (page - 1) * pageSize;
        const data = all.slice(start, start + pageSize);

        return {
          data,
          page,
          pageSize,
          total: all.length,
        };
      }),

  getById: (id: string) =>
    client.get<TemporaryAccount>(`/temporary-accounts/${id}`).then((r) => r.data),
};
