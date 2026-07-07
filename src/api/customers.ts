import { client } from "./client";
import type { Customer, Paginated } from "@/types/domain";

export const customersApi = {
  create: (payload: { name: string; email: string }) =>
    client.post<Customer>("/customers", payload).then((r) => r.data),

  list: (params?: { page?: number; pageSize?: number; search?: string }) =>
    client.get<Paginated<Customer>>("/customers", { params }).then((r) => r.data),

  getById: (id: string) => client.get<Customer>(`/customers/${id}`).then((r) => r.data),

  rename: (id: string, name: string) =>
    client.patch<Customer>(`/customers/${id}/rename`, { name }).then((r) => r.data),
};
