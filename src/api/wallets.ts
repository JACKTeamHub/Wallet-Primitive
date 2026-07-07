import { client } from "./client";
import type {
  Wallet,
  LedgerEntry,
  Paginated,
  WalletStatus,
  KYCDetails,
} from "@/types/domain";

export interface StatementParams {
  from?: string; // defaults server-side to last 30 days if omitted
  to?: string;
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

function normalizeWallet(raw: RawRecord): Wallet {
  return {
    ...raw,
    bank: raw.bank ?? raw.bankName ?? raw.provider ?? "Nomba",
    balanceKobo:
      typeof raw.balanceKobo === "number"
        ? raw.balanceKobo
        : toKobo(raw.balance ?? raw.availableBalance ?? raw.currentBalance ?? 0),
    kyc: raw.kyc ?? {
      tier: raw.kycTier ?? "TIER_1",
      bvn: raw.bvn,
      nin: raw.nin,
      proofOfAddress: Boolean(raw.proofOfAddress),
    },
  } as Wallet;
}

function normalizeLedgerEntry(raw: RawRecord): LedgerEntry {
  return {
    ...raw,
    amountKobo:
      typeof raw.amountKobo === "number" ? raw.amountKobo : toKobo(raw.amount ?? 0),
    runningBalanceKobo:
      typeof raw.runningBalanceKobo === "number"
        ? raw.runningBalanceKobo
        : toKobo(raw.runningBalance ?? raw.balanceAfter ?? 0),
    merchantTxRef: raw.merchantTxRef ?? raw.transactionId ?? raw.eventRef ?? raw.id,
    description: raw.description ?? raw.narration ?? "",
  } as LedgerEntry;
}

function normalizePaginated<T>(
  raw: T[] | (Partial<Paginated<T>> & { limit?: number }) | undefined,
  mapItem: (item: RawRecord) => T,
  page = 1,
  pageSize = 20
): Paginated<T> {
  const list = Array.isArray(raw) ? raw : raw?.data ?? [];
  const data = list.map((item) => mapItem(item as RawRecord));
  return {
    data,
    page: Array.isArray(raw) ? page : raw?.page ?? page,
    pageSize: Array.isArray(raw) ? pageSize : raw?.pageSize ?? raw?.limit ?? pageSize,
    total: Array.isArray(raw) ? data.length : raw?.total ?? data.length,
  };
}

export const walletsApi = {
  create: (payload: { customerId: string; bvn?: string }) =>
    client.post<RawRecord>("/wallets", payload).then((r) => normalizeWallet(r.data)),

  list: (params?: { page?: number; pageSize?: number; status?: WalletStatus }) =>
    client
      .get<Paginated<RawRecord> | RawRecord[]>("/wallets", {
        params: {
          page: params?.page,
          limit: params?.pageSize,
          status: params?.status,
        },
      })
      .then((r) =>
        normalizePaginated(r.data, normalizeWallet, params?.page, params?.pageSize)
      ),

  getById: (id: string) =>
    client.get<RawRecord>(`/wallets/${id}`).then((r) => normalizeWallet(r.data)),

  getBalance: (id: string) =>
    client.get<RawRecord>(`/wallets/${id}/balance`).then((r) => ({
      balanceKobo:
        typeof r.data.balanceKobo === "number"
          ? r.data.balanceKobo
          : toKobo(r.data.balance ?? r.data.availableBalance ?? r.data.currentBalance ?? 0),
    })),

  getLedger: (id: string, params?: { page?: number; pageSize?: number }) =>
    client
      .get<Paginated<RawRecord> | RawRecord[]>(`/wallets/${id}/ledger`, {
        params: { page: params?.page, limit: params?.pageSize },
      })
      .then((r) =>
        normalizePaginated(r.data, normalizeLedgerEntry, params?.page, params?.pageSize)
      ),

  getStatement: (id: string, params?: StatementParams) =>
    client
      .get<Paginated<RawRecord> | RawRecord[]>(`/wallets/${id}/statement`, {
        params: { startDate: params?.from, endDate: params?.to },
      })
      .then((r) => normalizePaginated(r.data, normalizeLedgerEntry)),

  getStatementPdf: (id: string, params?: StatementParams) =>
    client
      .get(`/wallets/${id}/statement/pdf`, {
        params: { startDate: params?.from, endDate: params?.to },
        responseType: "blob",
      })
      .then((r) => r.data as Blob),

  updateStatus: (id: string, status: WalletStatus) =>
    client.patch<RawRecord>(`/wallets/${id}/status`, { status }).then((r) => normalizeWallet(r.data)),

  updateKyc: (id: string, kyc: Partial<KYCDetails>) =>
    client
      .patch<RawRecord>(`/wallets/${id}/kyc`, {
        kycTier: kyc.tier,
        bvn: kyc.bvn,
        nin: kyc.nin,
      })
      .then((r) => normalizeWallet(r.data)),

  transfer: (payload: {
    fromWalletId: string;
    toWalletId: string;
    amountKobo: number;
    merchantTxRef: string;
  }) =>
    client
      .post("/wallets/transfer", {
        senderWalletId: payload.fromWalletId,
        recipientWalletId: payload.toWalletId,
        amount: payload.amountKobo / 100,
        description: payload.merchantTxRef,
      })
      .then((r) => r.data),
};
