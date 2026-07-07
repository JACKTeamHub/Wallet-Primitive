import { client } from "./client";
import type { Customer, Paginated } from "@/types/domain";

export const customersApi = {
  create: (payload: { name: string; email: string }) =>
    client.post<Customer>("/customers", payload).then((r) => r.data),

  list: (params?: { page?: number; pageSize?: number; search?: string }) =>
    client
      .get<Customer[]>("/customers", { params })
      .then((r) => {
        const all = r.data || [];
        const search = params?.search?.toLowerCase() || "";
        const filtered = search
          ? all.filter(
              (c) =>
                c.name.toLowerCase().includes(search) ||
                c.email.toLowerCase().includes(search)
            )
          : all;
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 20;
        const start = (page - 1) * pageSize;
        const data = filtered.slice(start, start + pageSize);

        return {
          data,
          page,
          pageSize,
          total: filtered.length,
        };
      }),

  getById: (id: string) => client.get<Customer>(`/customers/${id}`).then((r) => r.data),

  rename: (id: string, name: string) =>
    client.patch<Customer>(`/customers/${id}/rename`, { name }).then((r) => r.data),
};
