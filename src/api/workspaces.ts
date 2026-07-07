import { client } from "./client";
import type { Workspace } from "@/types/domain";

export const workspacesApi = {
  signup: (payload: { name: string; email: string; password?: string }) =>
    client.post<{ workspaceId: string }>("/workspaces", payload).then((r) => r.data),

  verifyOnboarding: (payload: { email: string; otp: string }) =>
    client
      .post<{ workspace: Workspace }>("/workspaces/verify-onboarding", payload)
      .then((r) => r.data),

  login: (payload: { email: string; password?: string }) =>
    client.post<{ pending: true }>("/workspaces/login", payload).then((r) => r.data),

  verifyLogin: (payload: { email: string; otp: string }) =>
    client
      .post<{ access_token: string; workspaceId: string }>("/workspaces/login/verify", payload)
      .then((r) => r.data),

  apiKeys: {
    list: () =>
      client
        .get<{ id: string; name?: string; label?: string; createdAt?: Date }[]>("/workspaces/api-keys")
        .then((r) =>
          r.data.map((k) => ({
            id: k.id,
            label: k.name ?? k.label ?? "api-key",
            lastUsedAt: k.createdAt ? new Date(k.createdAt).toLocaleDateString() : null,
          }))
        ),
    create: (label: string) =>
      client
        .post<{ rawKey?: string; key?: string }>("/workspaces/api-keys", { name: label })
        .then((r) => ({
          key: r.data.rawKey ?? r.data.key ?? "",
        })),
    revoke: (id: string) => client.delete(`/workspaces/api-keys/${id}`).then((r) => r.data),
  },

  credentials: {
    get: () => client.get<{ configured: boolean }>("/workspaces/credentials").then((r) => r.data),
    update: (payload: {
      clientId: string;
      clientSecret: string;
      accountId: string;
      subAccountId?: string;
    }) => client.post("/workspaces/credentials", payload).then((r) => r.data),
  },

  simulateWebhook: (payload: {
    accountNumber: string;
    amount: number;
    transactionId?: string;
    narration?: string;
  }) => client.post("/workspaces/webhooks/simulate", payload).then((r) => r.data),

  quarantine: {
    list: () => client.get<any[]>("/workspaces/quarantine").then((r) => r.data),
    release: (id: string) =>
      client.post(`/workspaces/quarantine/${id}/release`).then((r) => r.data),
    reject: (id: string) =>
      client.post(`/workspaces/quarantine/${id}/reject`).then((r) => r.data),
  },
};
