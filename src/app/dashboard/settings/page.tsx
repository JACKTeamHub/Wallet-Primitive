"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workspacesApi } from "@/api/workspaces";
import { walletsApi } from "@/api/wallets";
import { temporaryAccountsApi } from "@/api/temporaryAccounts";
import { TextField } from "@/components/ui/TextField";
import { Copy, Check, Trash2, Key, ShieldAlert } from "lucide-react";
import { useToast } from "@/providers/toast-provider";

function CredentialsCard() {
  const { toast } = useToast();
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [accountId, setAccountId] = useState("");
  const [subAccountId, setSubAccountId] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const [hasCredentials, setHasCredentials] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nombaCredentials");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setClientId(parsed.clientId || "");
        setClientSecret(parsed.clientSecret || "");
        setAccountId(parsed.accountId || "");
        setSubAccountId(parsed.subAccountId || "");
        setIsEditing(false);
        setHasCredentials(true);
      } catch {
        setIsEditing(true);
      }
    }
  }, []);

  const update = useMutation({
    mutationFn: () =>
      workspacesApi.credentials.update({
        clientId,
        clientSecret,
        accountId,
        subAccountId: subAccountId.trim() || undefined,
      }),
    onSuccess: () => {
      localStorage.setItem(
        "nombaCredentials",
        JSON.stringify({
          clientId,
          clientSecret,
          accountId,
          subAccountId,
        })
      );
      setHasCredentials(true);
      setIsEditing(false);
      toast("Nomba credentials saved successfully", "success");
    },
    onError: (err: any) => {
      toast(err.message || "Failed to save Nomba credentials", "error");
    }
  });

  const isValid = clientId.trim() && clientSecret.trim() && accountId.trim();

  const mask = (str: string) => {
    if (str.length <= 8) return "••••••••";
    return `${str.substring(0, 4)}••••${str.substring(str.length - 4)}`;
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-ink-800/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-paper-50">Active credentials</h2>
            <span className="flex items-center gap-1.5 rounded-full bg-signal-green/10 px-2.5 py-0.5 text-[10px] font-semibold text-signal-green">
              <span className="h-1 w-1 rounded-full bg-signal-green" />
              Connected
            </span>
          </div>
          <p className="mt-1 text-xs text-paper-200/50">Your workspace is connected to the Nomba Sandbox API using these credentials.</p>
          
          <ul className="mt-4 divide-y divide-white/5 rounded-lg border border-white/5 bg-ink-950/20 px-3">
            <li className="flex items-center justify-between py-4 text-sm">
              <div>
                <span className="font-medium text-paper-100">Nomba Sandbox Account</span>
                <div className="mt-0.5 hidden sm:flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-paper-200/40">
                  <span>Client ID: {mask(clientId)}</span>
                  <span>•</span>
                  <span>Account ID: {mask(accountId)}</span>
                  {subAccountId && (
                    <>
                      <span>•</span>
                      <span>Sub-Account: {mask(subAccountId)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded bg-white/5 px-2.5 py-1 text-xs font-semibold text-paper-200 hover:bg-white/10 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to disconnect your Nomba credentials?")) {
                      localStorage.removeItem("nombaCredentials");
                      setClientId("");
                      setClientSecret("");
                      setAccountId("");
                      setSubAccountId("");
                      setHasCredentials(false);
                      setIsEditing(true);
                      toast("Nomba credentials disconnected", "info");
                    }
                  }}
                  className="rounded bg-signal-red/10 px-2.5 py-1 text-xs font-semibold text-signal-red hover:bg-signal-red/20 transition"
                >
                  Disconnect
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-ink-800/60 p-6">
      <h2 className="font-display text-sm font-semibold text-paper-50">Configure credentials</h2>
      <p className="mt-1 text-xs text-paper-200/50">Connect the credentials for your own Nomba account.</p>
      <div className="mt-4 space-y-3">
        <TextField label="Client ID" value={clientId} onChange={(e) => setClientId(e.target.value)} />
        <TextField
          label="Client secret"
          type="password"
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
        />
        <TextField label="Account ID" value={accountId} onChange={(e) => setAccountId(e.target.value)} />
        <TextField label="Sub-Account ID (Optional)" value={subAccountId} onChange={(e) => setSubAccountId(e.target.value)} />
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => update.mutate()}
            disabled={!isValid || update.isPending}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-amber-400 disabled:opacity-50 transition"
          >
            {update.isPending ? "Saving…" : "Save credentials"}
          </button>
          {hasCredentials && (
            <button
              onClick={() => setIsEditing(false)}
              className="rounded-lg border border-white/10 hover:bg-white/5 px-4 py-2 text-sm font-medium text-paper-100 transition"
            >
              Cancel
            </button>
          )}
        </div>
        {update.isSuccess && <p className="text-xs text-signal-green">Saved.</p>}
      </div>
    </div>
  );
}

function ApiKeysCard() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [label, setLabel] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const { data } = useQuery({ queryKey: ["api-keys"], queryFn: workspacesApi.apiKeys.list });
  
  const create = useMutation({
    mutationFn: () => workspacesApi.apiKeys.create(label),
    onSuccess: (res) => {
      setCopiedKey(res.key);
      setLabel("");
      toast("API key generated successfully", "success");
      if (res.key) {
        localStorage.setItem("apiKey", res.key);
      }
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (err: any) => {
      toast(err.message || "Failed to create API key", "error");
    }
  });

  const revoke = useMutation({
    mutationFn: workspacesApi.apiKeys.revoke,
    onSuccess: () => {
      toast("API key revoked", "success");
      setRevokeId(null);
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (err: any) => {
      toast(err.message || "Failed to revoke API key", "error");
    }
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-ink-800/60 p-6">
        <h2 className="font-display text-sm font-semibold text-paper-50 flex items-center gap-2">
          <Key className="h-4 w-4 text-blue-400" />
          Generate API key
        </h2>
        <p className="mt-1 text-xs text-paper-200/50">Create a new key to authenticate requests with your sandbox API.</p>
        <div className="mt-4 flex gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Key label, e.g. production"
            className="flex-1 rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-paper-50 outline-none placeholder:text-paper-200/25 focus:border-blue-500/50"
          />
          <button
            onClick={() => create.mutate()}
            disabled={!label || create.isPending}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 transition"
          >
            Create
          </button>
        </div>

        {copiedKey && (
          <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 rounded bg-amber-500/10 p-1 flex items-center justify-center">
                <span className="text-amber-500 font-semibold text-xs leading-none">⚠️</span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-amber-400">Save this API key</h4>
                <p className="mt-0.5 text-[11px] text-paper-200/60 leading-relaxed">
                  Copy this key and save it somewhere safe. For security reasons, <strong>you will not be able to see it again</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded bg-ink-950 px-3 py-2 border border-white/5">
              <code className="truncate font-mono text-xs text-paper-50">{copiedKey}</code>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(copiedKey);
                  toast("Copied key to clipboard", "success");
                }}
                className="ml-2 hover:bg-white/5 p-1 rounded transition"
                aria-label="Copy key to clipboard"
              >
                <Copy className="h-3.5 w-3.5 text-paper-200 hover:text-paper-50" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-ink-800/60 p-6">
        <h3 className="font-display text-sm font-semibold text-paper-50">Active API Keys</h3>
        <p className="mt-1 text-xs text-paper-200/50">These keys currently have active access to provision virtual accounts.</p>
        
        {data?.length === 0 ? (
          <p className="mt-4 text-xs text-paper-200/30 italic">No API keys generated yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5 rounded-lg border border-white/5 bg-ink-950/20 px-3">
            {data?.map((k) => (
              <li key={k.id} className="flex items-center justify-between py-3.5 text-sm">
                <div>
                  <span className="font-medium text-paper-100">{k.label}</span>
                  <div className="mt-0.5 flex gap-2 text-[10px] text-paper-200/40">
                    <span>Created: {k.lastUsedAt}</span>
                    <span>•</span>
                    <span className="text-signal-green">Active</span>
                  </div>
                </div>
                {revokeId === k.id ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-signal-red font-medium">Revoke?</span>
                    <button
                      onClick={() => revoke.mutate(k.id)}
                      disabled={revoke.isPending}
                      className="rounded bg-signal-red/10 px-2.5 py-1 text-signal-red hover:bg-signal-red/20 transition"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setRevokeId(null)}
                      className="rounded bg-white/5 px-2.5 py-1 text-paper-200 hover:bg-white/10 transition"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setRevokeId(k.id)}
                    aria-label={`Revoke ${k.label}`}
                    className="hover:bg-white/5 p-1.5 rounded transition group"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-paper-200/30 group-hover:text-signal-red transition" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function WebhookSimulatorCard() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [sent, setSent] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [simAmount, setSimAmount] = useState("5000");
  const [simNarration, setSimNarration] = useState("Simulated Webhook Deposit");

  const { data: wallets } = useQuery({
    queryKey: ["wallets"],
    queryFn: () => walletsApi.list({ page: 1, pageSize: 100 }),
  });

  const { data: tempAccounts } = useQuery({
    queryKey: ["temporary-accounts"],
    queryFn: () => temporaryAccountsApi.list({ page: 1, pageSize: 100 }),
  });

  const activeWallets = wallets?.data.filter((w) => w.status === "ACTIVE") || [];
  const activeTempAccounts = tempAccounts?.data.filter((a) => a.status === "PENDING" && new Date() <= new Date(a.expiresAt)) || [];

  // Auto-select first active account if none selected
  useEffect(() => {
    if (!selectedAccount) {
      if (activeWallets.length > 0) {
        setSelectedAccount(activeWallets[0]?.accountNumber || "");
      } else if (activeTempAccounts.length > 0) {
        setSelectedAccount(activeTempAccounts[0]?.accountNumber || "");
      }
    }
  }, [activeWallets, activeTempAccounts, selectedAccount]);

  const simulate = useMutation({
    mutationFn: () =>
      workspacesApi.simulateWebhook({
        accountNumber: selectedAccount,
        amount: parseFloat(simAmount),
        narration: simNarration,
      }),
    onSuccess: () => {
      toast("Test webhook event simulated successfully", "success");
      setSent(true);
      qc.invalidateQueries();
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["wallets"] });
        qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
        qc.invalidateQueries({ queryKey: ["webhooks"] });
        qc.invalidateQueries({ queryKey: ["reconciliation"] });
        qc.invalidateQueries({ queryKey: ["quarantine"] });
      }, 1500);
      setTimeout(() => setSent(false), 2000);
    },
    onError: (err: any) => {
      toast(err.message || "Failed to simulate webhook", "error");
    },
  });

  const isValid = selectedAccount && parseFloat(simAmount) > 0;

  return (
    <div className="rounded-xl border border-white/10 bg-ink-800/60 p-6 space-y-4">
      <div>
        <h2 className="font-display text-sm font-semibold text-paper-50">Webhook simulator</h2>
        <p className="mt-1 text-xs text-paper-200/50">Fire a simulated virtual account deposit event directly at your workspace receiver.</p>
      </div>

      {activeWallets.length === 0 && activeTempAccounts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 p-5 text-center text-xs text-paper-200/40">
          Provision at least one Active virtual wallet or checkout account to test deposits.
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-2xs font-semibold text-paper-200/50">Target Account</label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-xs text-paper-50 outline-none focus:border-blue-500/50"
            >
              {activeWallets.length > 0 && (
                <optgroup label="Persistent Wallets">
                  {activeWallets.map((w) => (
                    <option key={w.id} value={w.accountNumber}>
                      {w.accountNumber}{w.bank ? ` (${w.bank})` : ""}
                    </option>
                  ))}
                </optgroup>
              )}
              {activeTempAccounts.length > 0 && (
                <optgroup label="Active Checkout Accounts">
                  {activeTempAccounts.map((a) => (
                    <option key={a.id} value={a.accountNumber}>
                      {a.accountNumber} (Checkout NGN {a.expectedAmount})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-2xs font-semibold text-paper-200/50">Deposit Amount (NGN)</label>
              <input
                type="number"
                value={simAmount}
                onChange={(e) => setSimAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-xs text-paper-50 outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-2xs font-semibold text-paper-200/50">Narration</label>
              <input
                type="text"
                value={simNarration}
                onChange={(e) => setSimNarration(e.target.value)}
                placeholder="e.g. Test Deposit"
                className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-xs text-paper-50 outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <button
            onClick={() => simulate.mutate()}
            disabled={!isValid || simulate.isPending}
            className="flex items-center gap-2 rounded-lg bg-blue-500 hover:bg-blue-600 active:bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white transition disabled:opacity-40"
          >
            {sent ? <Check className="h-4 w-4 text-signal-green" /> : null}
            {simulate.isPending ? "Simulating deposit…" : sent ? "Success" : "Simulate deposit"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"keys" | "credentials" | "webhooks">("keys");

  const tabs = [
    { id: "keys", label: "API Keys" },
    { id: "credentials", label: "Nomba Credentials" },
    { id: "webhooks", label: "Webhook Simulator" },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-paper-50">Settings</h1>
        <p className="text-xs text-paper-200/50">Manage your workspace API access keys and client integrations.</p>
      </div>

      <div className="border-b border-white/5 pb-px overflow-x-auto whitespace-nowrap scrollbar-none">
        <nav className="flex gap-6 text-sm font-medium min-w-max">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 transition border-b-2 ${
                  active
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-paper-200/50 hover:text-paper-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="max-w-3xl">
        {activeTab === "keys" && <ApiKeysCard />}
        {activeTab === "credentials" && <CredentialsCard />}
        {activeTab === "webhooks" && <WebhookSimulatorCard />}
      </div>
    </div>
  );
}
