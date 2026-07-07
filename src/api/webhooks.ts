import { client } from "./client";
import type { WebhookEvent, Paginated } from "@/types/domain";

export const webhooksApi = {
  list: (params?: { page?: number; pageSize?: number; type?: string }) =>
    client.get<Paginated<WebhookEvent>>("/webhooks", { params }).then((r) => r.data),

  getById: (id: string) => client.get<WebhookEvent>(`/webhooks/${id}`).then((r) => r.data),
};
