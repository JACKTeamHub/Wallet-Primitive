import { client } from "./client";

export const dashboardApi = {
  getSummary: () => client.get<any>("/dashboard").then((r) => r.data),
};
