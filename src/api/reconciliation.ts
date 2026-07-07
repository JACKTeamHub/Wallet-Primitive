import { client } from "./client";
import type { ReconciliationRecord, Paginated } from "@/types/domain";

export const reconciliationApi = {
  run: (dto: { transactionId: string; action: "CREDIT" | "REFUND" }) =>
    client.post<{ jobId: string }>("/reconciliation", dto).then((r) => r.data),

  list: (params?: { page?: number; pageSize?: number; status?: string }) =>
    client.get<Paginated<ReconciliationRecord>>("/reconciliation", { params }).then((r) => r.data),

  getById: (id: string) =>
    client.get<ReconciliationRecord>(`/reconciliation/${id}`).then((r) => r.data),
};
