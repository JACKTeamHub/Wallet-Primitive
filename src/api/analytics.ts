import { client } from "./client";

export interface AnalyticsSeries {
  label: string;
  points: { date: string; value: number }[];
}

export const analyticsApi = {
  getVolume: (params?: { from?: string; to?: string }) =>
    client.get<AnalyticsSeries>("/workspaces/analytics/volume", { params }).then((r) => r.data),
  getWalletGrowth: (params?: { from?: string; to?: string }) =>
    client.get<AnalyticsSeries>("/workspaces/analytics/wallets", { params }).then((r) => r.data),
};
