"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workspacesApi } from "@/api/workspaces";
import { TextField } from "@/components/ui/TextField";
import { Copy, Check, Trash2 } from "lucide-react";
import { useToast } from "@/providers/toast-provider";

function CredentialsCard() {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const update = useMutation({
    mutationFn: () =>
      workspacesApi.credentials.update({
        nombaClientId: clientId,
        nombaClientSecret: clientSecret,
      }),
  });

  return (
    <section className="rounded-xl border border-white/10 bg-ink-800/60 p-5">
      <h2 className="font-display text-sm font-semibold text-paper-50">Nomba credentials</h2>
      <p className="mt-1 text-xs text-paper-200/50">Connect the credentials for your own Nomba account.</p>
      <div className="mt-4 space-y-3">
        <TextField label="Client ID" value={clientId} onChange={(e) => setClientId(e.target.value)} />
        <TextField
          label="Client secret"
          type="password"
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
        />
        <button
          onClick={() => update.mutate()}
          disabled={update.isPending}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-amber-400 disabled:opacity-50"
        >
          {update.isPending ? "Saving…" : "Save credentials"}
        </button>
        {update.isSuccess && <p className="text-xs text-signal-green">Saved.</p>}
      </div>
    </section>
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
    <section className="rounded-xl border border-white/10 bg-ink-800/60 p-5">
      <h2 className="font-display text-sm font-semibold text-paper-50">API keys</h2>
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
        <div className="mt-3 flex items-center justify-between rounded-lg bg-ink-950 px-3 py-2 border border-white/5 animate-tick">
          <code className="truncate font-mono text-xs text-paper-100">{copiedKey}</code>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(copiedKey);
              toast("Copied key to clipboard", "success");
            }}
          >
            <Copy className="h-3.5 w-3.5 text-paper-200/40 hover:text-paper-100 transition" />
          </button>
        </div>
      )}

      <ul className="mt-4 divide-y divide-white/5">
        {data?.map((k) => (
          <li key={k.id} className="flex items-center justify-between py-2 text-sm">
            <span className="text-paper-100">{k.label}</span>
            {revokeId === k.id ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-signal-red font-medium">Revoke?</span>
                <button
                  onClick={() => revoke.mutate(k.id)}
                  disabled={revoke.isPending}
                  className="rounded bg-signal-red/10 px-2 py-1 text-signal-red hover:bg-signal-red/20 transition"
                >
                  Yes
                </button>
                <button
                  onClick={() => setRevokeId(null)}
                  className="rounded bg-white/5 px-2 py-1 text-paper-200 hover:bg-white/10 transition"
                >
                  No
                </button>
              </div>
            ) : (
              <button onClick={() => setRevokeId(k.id)} aria-label={`Revoke ${k.label}`}>
                <Trash2 className="h-3.5 w-3.5 text-paper-200/40 hover:text-signal-red transition" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function WebhookSimulatorCard() {
  const [sent, setSent] = useState(false);
  const simulate = useMutation({
    mutationFn: () =>
      workspacesApi.simulateWebhook({
        type: "virtual_account.funded",
        body: { accountNumber: "5234819201", amountKobo: 500000 },
      }),
    onSuccess: () => {
      setSent(true);
      setTimeout(() => setSent(false), 2000);
    },
  });

  return (
    <section className="rounded-xl border border-white/10 bg-ink-800/60 p-5">
      <h2 className="font-display text-sm font-semibold text-paper-50">Webhook simulator</h2>
      <p className="mt-1 text-xs text-paper-200/50">Fire a test virtual_account.funded event at your registered endpoint.</p>
      <button
        onClick={() => simulate.mutate()}
        disabled={simulate.isPending}
        className="mt-4 flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm text-paper-100 hover:border-amber-500/40"
      >
        {sent ? <Check className="h-4 w-4 text-signal-green" /> : null}
        {simulate.isPending ? "Sending…" : sent ? "Sent" : "Send test event"}
      </button>
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-paper-50">Settings</h1>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <CredentialsCard />
        <ApiKeysCard />
        <WebhookSimulatorCard />
      </div>
    </div>
  );
}
