import { client } from "./client";
import type { Workspace } from "@/types/domain";

export const workspacesApi = {
  signup: (payload: { name: string; email: string }) =>
    client.post<{ workspaceId: string }>("/workspaces", payload).then((r) => r.data),

  verifyOnboarding: (payload: { workspaceId: string; otp: string }) =>
    client
      .post<{ workspace: Workspace }>("/workspaces/verify-onboarding", payload)
      .then((r) => r.data),

  login: (payload: { email: string }) =>
    client.post<{ pending: true }>("/workspaces/login", payload).then((r) => r.data),

  verifyLogin: (payload: { email: string; otp: string }) =>
    client
      .post<{ workspace: Workspace }>("/workspaces/login/verify", payload)
      .then((r) => r.data),

  apiKeys: {
    list: () => client.get<{ id: string; label: string; lastUsedAt: string | null }[]>("/workspaces/api-keys").then((r) => r.data),
    create: (label: string) =>
      client.post<{ key: string }>("/workspaces/api-keys", { label }).then((r) => r.data),
    revoke: (id: string) => client.delete(`/workspaces/api-keys/${id}`).then((r) => r.data),
  },

  credentials: {
    get: () => client.get<{ configured: boolean }>("/workspaces/credentials").then((r) => r.data),
    update: (payload: { nombaClientId: string; nombaClientSecret: string }) =>
      client.put("/workspaces/credentials", payload).then((r) => r.data),
  },

  simulateWebhook: (payload: { type: string; body: Record<string, unknown> }) =>
    client.post("/workspaces/webhooks/simulate", payload).then((r) => r.data),

  quarantine: {
    list: () => client.get("/workspaces/quarantine").then((r) => r.data),
  },
};
