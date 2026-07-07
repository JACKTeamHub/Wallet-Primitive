import { API_BASE_URL } from "./urls";

export interface CodeSample {
  id: string;
  label: string;
  code: string;
}

export interface SampleScenario {
  id: string;
  label: string;
  description: string;
  statusCode: number;
  response: Record<string, string | number>;
  samples: CodeSample[];
}

export interface PlaygroundSample {
  id: string;
  label: string;
  fn: string;
  response: Record<string, string | number>;
}

const CREATE_CUSTOMER_SAMPLES: CodeSample[] = [
  {
    id: "curl",
    label: "curl",
    code: `curl -X POST ${API_BASE_URL}/customers \\
  -H "Authorization: Bearer wp_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Ada Obi","email":"ada@customer.dev"}'`,
  },
  {
    id: "node",
    label: "Node.js SDK",
    code: `import { WalletPrimitive } from "wallet-primitive";

const wp = new WalletPrimitive(process.env.WP_KEY);

const customer = await wp.customers.create({
  name: "Ada Obi",
  email: "ada@customer.dev",
});`,
  },
  {
    id: "typescript",
    label: "TypeScript",
    code: `const res = await fetch("${API_BASE_URL}/customers", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.WP_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name: "Ada Obi", email: "ada@customer.dev" }),
});
const customer: Customer = await res.json();`,
  },
  {
    id: "python",
    label: "Python",
    code: `from wallet_primitive import Client

client = Client(api_key=os.environ["WP_KEY"])

customer = client.customers.create(
    name="Ada Obi",
    email="ada@customer.dev",
)`,
  },
  {
    id: "go",
    label: "Go",
    code: `client := walletprimitive.New(os.Getenv("WP_KEY"))

customer, err := client.Customers.Create(ctx, &walletprimitive.CreateCustomerParams{
    Name:  "Ada Obi",
    Email: "ada@customer.dev",
})`,
  },
  {
    id: "php",
    label: "PHP",
    code: `$wallet = new WalletPrimitive\\Client(getenv('WP_KEY'));

$customer = $wallet->customers()->create([
    'name' => 'Ada Obi',
    'email' => 'ada@customer.dev',
]);`,
  },
  {
    id: "java",
    label: "Java",
    code: `WalletPrimitiveClient client = new WalletPrimitiveClient(System.getenv("WP_KEY"));

Customer customer = client.customers().create(
    CreateCustomerParams.builder()
        .name("Ada Obi")
        .email("ada@customer.dev")
        .build()
);`,
  },
  {
    id: "csharp",
    label: "C#",
    code: `var client = new WalletPrimitiveClient(Environment.GetEnvironmentVariable("WP_KEY"));

var customer = await client.Customers.CreateAsync(new CreateCustomerParams {
    Name = "Ada Obi",
    Email = "ada@customer.dev",
});`,
  },
];

const TRANSFER_SAMPLES: CodeSample[] = [
  {
    id: "curl",
    label: "curl",
    code: `curl -X POST ${API_BASE_URL}/wallets/transfer \\
  -H "Authorization: Bearer wp_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fromWalletId": "wal_4e9b7d",
    "toWalletId": "wal_9c1f4a",
    "amountKobo": 500000,
    "merchantTxRef": "order_28491"
  }'`,
  },
  {
    id: "node",
    label: "Node.js SDK",
    code: `const transfer = await wp.wallets.transfer({
  fromWalletId: "wal_4e9b7d",
  toWalletId: "wal_9c1f4a",
  amountKobo: 500_000,
  merchantTxRef: "order_28491",
});`,
  },
  {
    id: "typescript",
    label: "TypeScript",
    code: `const res = await fetch("${API_BASE_URL}/wallets/transfer", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.WP_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    fromWalletId: "wal_4e9b7d",
    toWalletId: "wal_9c1f4a",
    amountKobo: 500_000,
    merchantTxRef: "order_28491",
  }),
});`,
  },
  {
    id: "python",
    label: "Python",
    code: `transfer = client.wallets.transfer(
    from_wallet_id="wal_4e9b7d",
    to_wallet_id="wal_9c1f4a",
    amount_kobo=500_000,
    merchant_tx_ref="order_28491",
)`,
  },
  {
    id: "go",
    label: "Go",
    code: `transfer, err := client.Wallets.Transfer(ctx, &walletprimitive.TransferParams{
    FromWalletID:  "wal_4e9b7d",
    ToWalletID:    "wal_9c1f4a",
    AmountKobo:    500_000,
    MerchantTxRef: "order_28491",
})`,
  },
  {
    id: "php",
    label: "PHP",
    code: `$transfer = $wallet->wallets()->transfer([
    'fromWalletId' => 'wal_4e9b7d',
    'toWalletId' => 'wal_9c1f4a',
    'amountKobo' => 500_000,
    'merchantTxRef' => 'order_28491',
]);`,
  },
  {
    id: "java",
    label: "Java",
    code: `Transfer transfer = client.wallets().transfer(
    TransferParams.builder()
        .fromWalletId("wal_4e9b7d")
        .toWalletId("wal_9c1f4a")
        .amountKobo(500_000L)
        .merchantTxRef("order_28491")
        .build()
);`,
  },
  {
    id: "csharp",
    label: "C#",
    code: `var transfer = await client.Wallets.TransferAsync(new TransferParams {
    FromWalletId = "wal_4e9b7d",
    ToWalletId = "wal_9c1f4a",
    AmountKobo = 500_000,
    MerchantTxRef = "order_28491",
});`,
  },
];

const TEMP_ACCOUNT_SAMPLES: CodeSample[] = [
  {
    id: "curl",
    label: "curl",
    code: `curl -X POST ${API_BASE_URL}/temporary-accounts \\
  -H "Authorization: Bearer wp_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"expiresInMinutes": 30}'`,
  },
  {
    id: "node",
    label: "Node.js SDK",
    code: `const account = await wp.temporaryAccounts.create({
  expiresInMinutes: 30,
});`,
  },
  {
    id: "typescript",
    label: "TypeScript",
    code: `const res = await fetch("${API_BASE_URL}/temporary-accounts", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.WP_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ expiresInMinutes: 30 }),
});`,
  },
  {
    id: "python",
    label: "Python",
    code: `account = client.temporary_accounts.create(
    expires_in_minutes=30,
)`,
  },
  {
    id: "go",
    label: "Go",
    code: `account, err := client.TemporaryAccounts.Create(ctx, &walletprimitive.CreateTempAccountParams{
    ExpiresInMinutes: 30,
})`,
  },
  {
    id: "php",
    label: "PHP",
    code: `$account = $wallet->temporaryAccounts()->create([
    'expiresInMinutes' => 30,
]);`,
  },
  {
    id: "java",
    label: "Java",
    code: `TemporaryAccount account = client.temporaryAccounts().create(
    CreateTempAccountParams.builder()
        .expiresInMinutes(30)
        .build()
);`,
  },
  {
    id: "csharp",
    label: "C#",
    code: `var account = await client.TemporaryAccounts.CreateAsync(new CreateTempAccountParams {
    ExpiresInMinutes = 30,
});`,
  },
];

const BALANCE_SAMPLES: CodeSample[] = [
  {
    id: "curl",
    label: "curl",
    code: `curl ${API_BASE_URL}/wallets/wal_4e9b7d/balance \\
  -H "Authorization: Bearer wp_live_xxx"`,
  },
  {
    id: "node",
    label: "Node.js SDK",
    code: `const { balanceKobo } = await wp.wallets.getBalance("wal_4e9b7d");`,
  },
  {
    id: "typescript",
    label: "TypeScript",
    code: `const res = await fetch(
  "${API_BASE_URL}/wallets/wal_4e9b7d/balance",
  { headers: { Authorization: \`Bearer \${process.env.WP_KEY}\` } },
);
const { balanceKobo } = await res.json();`,
  },
  {
    id: "python",
    label: "Python",
    code: `balance = client.wallets.get_balance("wal_4e9b7d")
print(balance.balance_kobo)  # 1250000`,
  },
  {
    id: "go",
    label: "Go",
    code: `balance, err := client.Wallets.GetBalance(ctx, "wal_4e9b7d")`,
  },
  {
    id: "php",
    label: "PHP",
    code: `$balance = $wallet->wallets()->getBalance('wal_4e9b7d');`,
  },
  {
    id: "java",
    label: "Java",
    code: `Balance balance = client.wallets().getBalance("wal_4e9b7d");`,
  },
  {
    id: "csharp",
    label: "C#",
    code: `var balance = await client.Wallets.GetBalanceAsync("wal_4e9b7d");`,
  },
];

const WEBHOOK_SAMPLES: CodeSample[] = [
  {
    id: "curl",
    label: "curl",
    code: `# Verify the X-WP-Signature header on inbound webhooks
SIGNATURE=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$WP_WEBHOOK_SECRET" | awk '{print $2}')

curl -X POST https://yourapp.com/webhooks/wallet-primitive \\
  -H "X-WP-Signature: sha256=$SIGNATURE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "virtual_account.funded",
    "requestId": "req_a8f3c2",
    "accountNumber": "5234819201",
    "amountKobo": 250000,
    "merchantTxRef": "inv_10294"
  }'`,
  },
  {
    id: "node",
    label: "Node.js SDK",
    code: `import { createHmac, timingSafeEqual } from "crypto";

function verifyWebhook(body: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// On POST /webhooks/wallet-primitive
const valid = verifyWebhook(rawBody, req.headers["x-wp-signature"], process.env.WP_WEBHOOK_SECRET);
if (!valid) return res.status(401).end();`,
  },
  {
    id: "typescript",
    label: "TypeScript",
    code: `type FundedEvent = {
  event: "virtual_account.funded";
  requestId: string;
  accountNumber: string;
  amountKobo: number;
  merchantTxRef: string;
};

async function handleWebhook(req: Request, event: FundedEvent) {
  // Dedupe on requestId before crediting ledger
  if (await seen(event.requestId)) return;
  await creditWallet(event.accountNumber, event.amountKobo);
}`,
  },
  {
    id: "python",
    label: "Python",
    code: `import hmac, hashlib

def verify_webhook(body: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature, expected)

# Credit ledger once per requestId
if not store.seen(event["requestId"]):
    wallets.credit(event["accountNumber"], event["amountKobo"])`,
  },
  {
    id: "go",
    label: "Go",
    code: `func verifyWebhook(body []byte, sig, secret string) bool {
    mac := hmac.New(sha256.New, []byte(secret))
    mac.Write(body)
    expected := hex.EncodeToString(mac.Sum(nil))
    return hmac.Equal([]byte(sig), []byte(expected))
}`,
  },
  {
    id: "php",
    label: "PHP",
    code: `$expected = hash_hmac('sha256', $rawBody, getenv('WP_WEBHOOK_SECRET'));
if (!hash_equals($expected, $_SERVER['HTTP_X_WP_SIGNATURE'])) {
    http_response_code(401);
    exit;
}`,
  },
  {
    id: "java",
    label: "Java",
    code: `String expected = HmacUtils.hmacSha256Hex(secret, rawBody);
if (!MessageDigest.isEqual(expected.getBytes(), signature.getBytes())) {
    return Response.status(401).build();
}`,
  },
  {
    id: "csharp",
    label: "C#",
    code: `var expected = HMACSHA256.HashData(
    Encoding.UTF8.GetBytes(secret),
    Encoding.UTF8.GetBytes(rawBody));
if (!CryptographicOperations.FixedTimeEquals(expected, signature))
    return Results.Unauthorized();`,
  },
];

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: "create-customer",
    label: "Create customer",
    description: "Provision a customer and their first NUBAN wallet in one call.",
    statusCode: 200,
    response: {
      customerId: "cus_8f2a1c",
      walletId: "wal_4e9b7d",
      accountNumber: "5234819201",
      bank: "Nombank MFB",
      status: "ACTIVE",
    },
    samples: CREATE_CUSTOMER_SAMPLES,
  },
  {
    id: "transfer",
    label: "Transfer funds",
    description: "Move kobo between wallets with an idempotent merchant reference.",
    statusCode: 200,
    response: {
      transferId: "txn_3k8m2p",
      fromWalletId: "wal_4e9b7d",
      toWalletId: "wal_9c1f4a",
      amountKobo: 500000,
      merchantTxRef: "order_28491",
      status: "COMPLETED",
    },
    samples: TRANSFER_SAMPLES,
  },
  {
    id: "temp-account",
    label: "Temp checkout account",
    description: "Issue a short-lived NUBAN for one-off collections.",
    statusCode: 201,
    response: {
      id: "tmp_7h3n6q",
      accountNumber: "9012345678",
      bank: "Nombank MFB",
      expiresAt: "2026-04-07T04:30:00Z",
      status: "PENDING",
    },
    samples: TEMP_ACCOUNT_SAMPLES,
  },
  {
    id: "balance",
    label: "Get balance",
    description: "Read a wallet balance in kobo — no floats, ever.",
    statusCode: 200,
    response: {
      walletId: "wal_4e9b7d",
      balanceKobo: 1250000,
    },
    samples: BALANCE_SAMPLES,
  },
  {
    id: "webhook",
    label: "Inbound webhook",
    description: "Verify and handle a virtual_account.funded event.",
    statusCode: 200,
    response: {
      event: "virtual_account.funded",
      requestId: "req_a8f3c2",
      accountNumber: "5234819201",
      amountKobo: 250000,
      merchantTxRef: "inv_10294",
      fundedAt: "2026-04-07T03:12:44Z",
    },
    samples: WEBHOOK_SAMPLES,
  },
];

/** @deprecated Use SAMPLE_SCENARIOS[0].samples instead */
export const CODE_SAMPLES = CREATE_CUSTOMER_SAMPLES;

/** @deprecated Use SAMPLE_SCENARIOS[0].response instead */
export const SAMPLE_RESPONSE = SAMPLE_SCENARIOS[0]!.response;

export const PLAYGROUND_SAMPLES: PlaygroundSample[] = [
  {
    id: "create-customer",
    label: "Create customer",
    fn: 'create_customer("Ada Obi", "ada@customer.dev")',
    response: {
      customerId: "cus_8f2a1c",
      walletId: "wal_4e9b7d",
      accountNumber: "5234819201",
      status: "ACTIVE",
    },
  },
  {
    id: "transfer",
    label: "Transfer funds",
    fn: 'transfer("wal_4e9b7d", "wal_9c1f4a", 500_000, "order_28491")',
    response: {
      transferId: "txn_3k8m2p",
      amountKobo: 500000,
      merchantTxRef: "order_28491",
      status: "COMPLETED",
    },
  },
  {
    id: "temp-account",
    label: "Temp checkout account",
    fn: "create_temp_account(expires_in_minutes=30)",
    response: {
      id: "tmp_7h3n6q",
      accountNumber: "9012345678",
      bank: "Nombank MFB",
      expiresAt: "2026-04-07T04:30:00Z",
      status: "PENDING",
    },
  },
  {
    id: "balance",
    label: "Get balance",
    fn: 'get_balance("wal_4e9b7d")',
    response: {
      walletId: "wal_4e9b7d",
      balanceKobo: 1250000,
    },
  },
  {
    id: "webhook",
    label: "Simulate inbound transfer",
    fn: 'simulate_webhook("virtual_account.funded", amount_kobo=250_000)',
    response: {
      event: "virtual_account.funded",
      requestId: "req_a8f3c2",
      accountNumber: "5234819201",
      amountKobo: 250000,
      status: "DELIVERED",
    },
  },
];
