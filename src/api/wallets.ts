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

export const walletsApi = {
  create: (payload: { customerId: string }) =>
    client.post<Wallet>("/wallets", payload).then((r) => r.data),

  list: (params?: { page?: number; pageSize?: number; status?: WalletStatus }) =>
    client.get<Paginated<Wallet>>("/wallets", { params }).then((r) => r.data),

  getById: (id: string) => client.get<Wallet>(`/wallets/${id}`).then((r) => r.data),

  getBalance: (id: string) =>
    client.get<{ balanceKobo: number }>(`/wallets/${id}/balance`).then((r) => r.data),

  getLedger: (id: string, params?: { page?: number; pageSize?: number }) =>
    client.get<Paginated<LedgerEntry>>(`/wallets/${id}/ledger`, { params }).then((r) => r.data),

  getStatement: (id: string, params?: StatementParams) =>
    client.get<Paginated<LedgerEntry>>(`/wallets/${id}/statement`, { params }).then((r) => r.data),

  getStatementPdf: (id: string, params?: StatementParams) =>
    client
      .get(`/wallets/${id}/statement/pdf`, { params, responseType: "blob" })
      .then((r) => r.data as Blob),

  updateStatus: (id: string, status: WalletStatus) =>
    client.patch<Wallet>(`/wallets/${id}/status`, { status }).then((r) => r.data),

  updateKyc: (id: string, kyc: Partial<KYCDetails>) =>
    client.patch<Wallet>(`/wallets/${id}/kyc`, kyc).then((r) => r.data),

  transfer: (payload: {
    fromWalletId: string;
    toWalletId: string;
    amountKobo: number;
    merchantTxRef: string;
  }) => client.post("/wallets/transfer", payload).then((r) => r.data),
};
