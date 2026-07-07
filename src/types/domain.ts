// All monetary amounts are integers in kobo, per the locked architecture decision.

export type KYCTier = "TIER_1" | "TIER_2" | "TIER_3";
export type WalletStatus = "ACTIVE" | "FROZEN" | "CLOSED";
export type ReconciliationStatus = "MATCHED" | "MISMATCHED" | "PENDING";

export interface Workspace {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface KYCDetails {
  nin: string; // primary identity document
  bvn?: string; // optional
  proofOfAddress: boolean; // checkbox
  tier: KYCTier; // derived: NIN only = 1, +BVN = 2, +BVN+address = 3
}

export interface Wallet {
  id: string;
  customerId: string;
  accountNumber: string;
  bank: string;
  balanceKobo: number;
  status: WalletStatus;
  kyc: KYCDetails;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  walletId: string;
  type: "CREDIT" | "DEBIT";
  amountKobo: number;
  runningBalanceKobo: number; // computed over full account history
  merchantTxRef: string;
  description: string;
  createdAt: string;
}

export interface TemporaryAccount {
  id: string;
  accountNumber: string;
  bank: string;
  expiresAt: string;
  status: "PENDING" | "FUNDED" | "EXPIRED";
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  type: "virtual_account.funded" | string;
  requestId: string;
  payload: Record<string, unknown>;
  deliveredAt: string | null;
  createdAt: string;
}

export interface ReconciliationRecord {
  id: string;
  merchantTxRef: string;
  status: ReconciliationStatus;
  diff: number;
  createdAt: string;
}

export interface DashboardSummary {
  totalWallets: number;
  totalCustomers: number;
  totalBalanceKobo: number;
  pendingReconciliations: number;
  recentWebhooks: WebhookEvent[];
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}
