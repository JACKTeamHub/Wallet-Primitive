import { client } from "./client";
import type { Paginated } from "@/types/domain";

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export const auditLogsApi = {
  list: (params?: { page?: number; pageSize?: number }) =>
    client.get<Paginated<AuditLog>>("/workspaces/audit-logs", { params }).then((r) => r.data),
};
