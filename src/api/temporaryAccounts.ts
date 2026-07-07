import { client } from "./client";
import type { TemporaryAccount } from "@/types/domain";

type RawRecord = Record<string, any>;

function normalizeTemporaryAccount(raw: RawRecord): TemporaryAccount {
  return {
    ...raw,
    bank: raw.bank ?? raw.bankName ?? "Nomba Sandbox Bank",
  } as TemporaryAccount;
}

export const temporaryAccountsApi = {
  create: (payload: { expectedAmount: number; expiresInSeconds: number; accountName?: string }) =>
    client.post<RawRecord>("/temporary-accounts", payload).then((r) => normalizeTemporaryAccount(r.data)),

  list: (params?: { page?: number; pageSize?: number }) =>
    client
      .get<RawRecord[]>("/temporary-accounts", { params })
      .then((r) => {
        const all = r.data || [];
        const normalized = all.map(normalizeTemporaryAccount);
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 20;
        const start = (page - 1) * pageSize;
        const data = normalized.slice(start, start + pageSize);

        return {
          data,
          page,
          pageSize,
          total: normalized.length,
        };
      }),

  getById: (id: string) =>
    client.get<RawRecord>(`/temporary-accounts/${id}`).then((r) => normalizeTemporaryAccount(r.data)),
};
