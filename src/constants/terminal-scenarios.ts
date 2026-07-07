import { API_BASE_URL } from "./urls";

export interface TerminalLine {
  text: string;
  type: "keyword" | "plain" | "string" | "comment" | "muted" | "ok";
}

export interface TerminalScenario {
  id: string;
  filename: string;
  lines: TerminalLine[];
  result: string;
}

export const TERMINAL_SCENARIOS: TerminalScenario[] = [
  {
    id: "create-customer",
    filename: "create-customer.ts",
    lines: [
      { text: "import { WalletPrimitive } from \"wallet-primitive\";", type: "plain" },
      { text: "", type: "plain" },
      { text: "const wp = new WalletPrimitive(process.env.WP_KEY);", type: "plain" },
      { text: "", type: "plain" },
      { text: "const customer = await wp.customers.create({", type: "plain" },
      { text: "  name: \"Ada Obi\",", type: "string" },
      { text: "  email: \"ada@customer.dev\",", type: "string" },
      { text: "});", type: "plain" },
    ],
    result: "→ { customerId: \"cus_8f2a1c\", walletId: \"wal_4e9b7d\", status: \"ACTIVE\" }",
  },
  {
    id: "transfer",
    filename: "transfer.ts",
    lines: [
      { text: "const transfer = await wp.wallets.transfer({", type: "plain" },
      { text: "  fromWalletId: \"wal_4e9b7d\",", type: "string" },
      { text: "  toWalletId: \"wal_9c1f4a\",", type: "string" },
      { text: "  amountKobo: 500_000,", type: "plain" },
      { text: "  merchantTxRef: \"order_28491\",", type: "string" },
      { text: "});", type: "plain" },
    ],
    result: "→ { transferId: \"txn_3k8m2p\", status: \"COMPLETED\" }",
  },
  {
    id: "temp-account",
    filename: "checkout-account.ts",
    lines: [
      { text: "const account = await wp.temporaryAccounts.create({", type: "plain" },
      { text: "  expiresInMinutes: 30,", type: "plain" },
      { text: "});", type: "plain" },
      { text: "", type: "plain" },
      { text: "console.log(account.accountNumber);", type: "plain" },
    ],
    result: "→ { accountNumber: \"9012345678\", bank: \"Nombank MFB\", status: \"PENDING\" }",
  },
  {
    id: "balance",
    filename: "balance.ts",
    lines: [
      { text: `const res = await fetch("${API_BASE_URL}/wallets/wal_4e9b7d/balance", {`, type: "plain" },
      { text: "  headers: { Authorization: `Bearer ${process.env.WP_KEY}` },", type: "plain" },
      { text: "});", type: "plain" },
      { text: "", type: "plain" },
      { text: "const { balanceKobo } = await res.json();", type: "plain" },
    ],
    result: "→ { walletId: \"wal_4e9b7d\", balanceKobo: 1250000 }",
  },
  {
    id: "webhook",
    filename: "webhook.ts",
    lines: [
      { text: "app.post(\"/webhooks/wallet-primitive\", async (req, res) => {", type: "plain" },
      { text: "  const event = req.body;", type: "plain" },
      { text: "  if (await seen(event.requestId)) return res.sendStatus(200);", type: "plain" },
      { text: "", type: "plain" },
      { text: "  await creditWallet(event.accountNumber, event.amountKobo);", type: "plain" },
      { text: "  res.sendStatus(200);", type: "plain" },
      { text: "});", type: "plain" },
    ],
    result: "→ virtual_account.funded · req_a8f3c2 · ₦2,500.00 credited",
  },
];
