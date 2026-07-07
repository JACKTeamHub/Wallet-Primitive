import { client } from "./client";
import type { WebhookEvent } from "@/types/domain";

export interface AnalyticsSeries {
  label: string;
  points: { date: string; value: number }[];
}

type RawRecord = Record<string, any>;

function toKobo(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value * 100);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
  }
  return 0;
}

function getEventDate(event: any) {
  return (
    event.processedAt ??
    event.createdAt ??
    event.payload?.data?.transaction?.time ??
    event.payload?.time ??
    null
  );
}

function getEventAmountKobo(event: any) {
  const payloadAmount =
    event.payload?.data?.transaction?.transactionAmount ??
    event.payload?.transaction?.transactionAmount ??
    event.payload?.transactionAmount ??
    event.payload?.amount;
  return toKobo(event.amount ?? event.amountKobo ?? payloadAmount ?? 0);
}

function isCreditEvent(event: any) {
  const rawType =
    event.type ??
    event.payload?.event_type ??
    event.payload?.type ??
    event.payload?.data?.transaction?.type ??
    "";
  return !String(rawType).toLowerCase().includes("debit") && !String(rawType).toLowerCase().includes("refund");
}

function buildSeriesFromEvents(events: Array<WebhookEvent | RawRecord>) {
  const buckets = new Map<string, number>();

  Array.from({ length: 7 }).forEach((_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    buckets.set(date.toISOString().slice(0, 10), 0);
  });

  events.forEach((event) => {
    const dateValue = getEventDate(event);
    const date = dateValue ? new Date(dateValue) : null;
    if (!date || Number.isNaN(date.getTime())) return;

    const key = date.toISOString().slice(0, 10);
    if (!buckets.has(key)) return;

    const amountKobo = getEventAmountKobo(event);
    if (!amountKobo) return;

    buckets.set(key, (buckets.get(key) || 0) + amountKobo);
  });

  return Array.from(buckets.entries()).map(([key, value]) => ({
    date: new Date(key).toLocaleDateString("en-US", { weekday: "short" }),
    value: value / 100,
  }));
}

export const analyticsApi = {
  getSummary: () => client.get<any>("/workspaces/analytics").then((r) => r.data),
  getVolume: () =>
    client
      .get<any>("/workspaces/analytics")
      .then((r) => {
        const backendSeries =
          r.data.transactionActivity ??
          r.data.activitySeries ??
          r.data.volumeSeries ??
          r.data.series;

        const points = Array.isArray(backendSeries) && backendSeries.length > 0
          ? backendSeries.map((point: RawRecord) => ({
              date: new Date(point.date ?? point.day ?? point.createdAt ?? point.label ?? Date.now())
                .toLocaleDateString("en-US", { weekday: "short" }),
              value:
                typeof point.value === "number"
                  ? point.value
                  : typeof point.valueKobo === "number"
                    ? point.valueKobo / 100
                    : toKobo(point.total ?? point.amount ?? point.inbound ?? 0) / 100,
            }))
          : Array.isArray(r.data.recentWebhooks)
            ? buildSeriesFromEvents(r.data.recentWebhooks)
            : Array.isArray(r.data.recentActivity)
              ? buildSeriesFromEvents(r.data.recentActivity.filter((event: RawRecord) => isCreditEvent(event)))
              : buildSeriesFromEvents([]);
        return { label: "Transaction Volume", points };
      }),
  getWalletGrowth: () =>
    client
      .get<any>("/wallets", { params: { page: 1, pageSize: 100 } })
      .then((r) => {
        const wallets = r.data?.data || [];
        const points = Array.from({ length: 7 }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dateStr = date.toLocaleDateString();

          // Count wallets created on or before this day
          const count = wallets.filter((w: any) => {
            const createdDate = new Date(w.createdAt);
            const targetDate = new Date(date);
            targetDate.setHours(23, 59, 59, 999);
            return createdDate <= targetDate;
          }).length;

          return {
            date: dateStr,
            value: count,
          };
        });
        return { label: "Wallet Growth", points };
      }),
};
