import { client } from "./client";
import type { TemporaryAccount, Paginated } from "@/types/domain";

export const temporaryAccountsApi = {
  create: (payload: { expiresInMinutes: number }) =>
    client.post<TemporaryAccount>("/temporary-accounts", payload).then((r) => r.data),

  list: (params?: { page?: number; pageSize?: number }) =>
    client.get<Paginated<TemporaryAccount>>("/temporary-accounts", { params }).then((r) => r.data),

  getById: (id: string) =>
    client.get<TemporaryAccount>(`/temporary-accounts/${id}`).then((r) => r.data),
};
