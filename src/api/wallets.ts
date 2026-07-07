import { client } from "./client";
import type {
  Wallet,
  LedgerEntry,
  Paginated,
  WalletStatus,
  KYCDetails,
} from "@/types/domain";

export interface StatementParams {
  startDate?: string;
  endDate?: string;
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
      proofOfAddress: raw.kycTier === "TIER_3" || Boolean(raw.proofOfAddress),
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

export const walletsApi = {
  create: (payload: { customerId: string }) =>
    client.post<RawRecord>("/wallets", payload).then((r) => normalizeWallet(r.data)),

  list: (params?: { page?: number; pageSize?: number; status?: WalletStatus }) =>
    client
      .get<Paginated<RawRecord>>("/wallets", { params })
      .then((r) => ({
        ...r.data,
        data: r.data.data.map(normalizeWallet),
      })),

  getById: (id: string) =>
    client.get<RawRecord>(`/wallets/${id}`).then((r) => normalizeWallet(r.data)),

  getBalance: (id: string) =>
    client.get<{ balanceKobo: number }>(`/wallets/${id}/balance`).then((r) => r.data),

  getLedger: (id: string, params?: { page?: number; pageSize?: number }) =>
    client
      .get<Paginated<RawRecord>>(`/wallets/${id}/ledger`, { params })
      .then((r) => ({
        ...r.data,
        data: r.data.data.map(normalizeLedgerEntry),
      })),

  getStatement: (id: string, params?: StatementParams) =>
    client
      .get<Paginated<RawRecord>>(`/wallets/${id}/statement`, { params })
      .then((r) => ({
        ...r.data,
        data: r.data.data.map(normalizeLedgerEntry),
      })),

  getStatementPdf: (id: string, params?: StatementParams) =>
    client
      .get(`/wallets/${id}/statement/pdf`, { params, responseType: "blob" })
      .then((r) => r.data as Blob),

  updateStatus: (id: string, status: WalletStatus) =>
    client.patch<RawRecord>(`/wallets/${id}/status`, { status }).then((r) => normalizeWallet(r.data)),

  updateKyc: (id: string, kyc: Partial<KYCDetails> & { proofOfAddress?: boolean }) =>
    client
      .patch<RawRecord>(`/wallets/${id}/kyc`, {
        kycTier: kyc.tier,
        bvn: kyc.bvn,
        nin: kyc.nin,
        proofOfAddress: kyc.proofOfAddress,
      })
      .then((r) => normalizeWallet(r.data)),

  transfer: (payload: {
    senderAccountNumber: string;
    recipientAccountNumber: string;
    amount: number;
    description?: string;
  }) => client.post("/wallets/transfer", payload).then((r) => r.data),
};
