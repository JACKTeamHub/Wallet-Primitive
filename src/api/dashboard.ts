import { client } from "./client";
import type { DashboardSummary } from "@/types/domain";

export const dashboardApi = {
  getSummary: () => client.get<DashboardSummary>("/dashboard").then((r) => r.data),
};
