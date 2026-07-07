"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  RotateCcw,
  Download,
  Files,
  Settings,
  ChevronRight,
  FileCode,
  Terminal,
  Braces,
  SlidersHorizontal
} from "lucide-react";

type Sample = {
  id: string;
  label: string;
  filename: string;
  language: string;
  code: string;
  response?: string;
};

const SAMPLES: Sample[] = [
  {
    id: "curl",
    label: "cURL",
    filename: "curl.sh",
    language: "bash",
    code: `curl -X POST https://jackwalletprimitive.onrender.com/api/v1/customers \\
  -H "Authorization: Bearer wp_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name":"Ada Obi",
    "email":"ada@customer.dev"
  }'`,
    response: `{
  "customerId": "cus_8f2a1c",
  "walletId": "wal_4e9b7d",
  "accountNumber": "5234819201",
  "bank": "Nombank MFB",
  "status": "ACTIVE"
}`
  },
  {
    id: "node",
    label: "Node.js",
    filename: "index.js",
    language: "javascript",
    code: `import WalletPrimitive from "@walletprimitive/sdk";

const client = new WalletPrimitive({
  apiKey: process.env.WP_API_KEY
});

const customer = await client.customers.create({
  name: "Ada Obi",
  email: "ada@customer.dev"
});

console.log(customer);`,
    response: `{
  "id": "cus_8f2a1c",
  "walletId": "wal_4e9b7d",
  "accountNumber": "5234819201",
  "bank": "Nombank MFB",
  "status": "ACTIVE"
}`
  },
  {
    id: "ts",
    label: "TypeScript",
    filename: "index.ts",
    language: "typescript",
    code: `import { WalletPrimitive } from "@walletprimitive/sdk";

const client = new WalletPrimitive({
  apiKey: process.env.WP_API_KEY!
});

const customer = await client.customers.create({
  name: "Ada Obi",
  email: "ada@customer.dev"
});

console.log(customer);`,
    response: `{
  "id": "cus_8f2a1c",
  "walletId": "wal_4e9b7d",
  "accountNumber": "5234819201",
  "bank": "Nombank MFB",
  "status": "ACTIVE"
}`
  },
  {
    id: "python",
    label: "Python",
    filename: "main.py",
    language: "python",
    code: `from walletprimitive import WalletPrimitive

client = WalletPrimitive(api_key="wp_live_xxx")

customer = client.customers.create(
    name="Ada Obi",
    email="ada@customer.dev"
)

print(customer)`,
    response: `{
    'id': 'cus_8f2a1c',
    'wallet_id': 'wal_4e9b7d',
    'account_number': '5234819201',
    'bank': 'Nombank MFB',
    'status': 'ACTIVE'
}`
  },
  {
    id: "go",
    label: "Go",
    filename: "main.go",
    language: "go",
    code: `package main

import "github.com/walletprimitive/go-sdk"

func main() {
    client := walletprimitive.New("wp_live_xxx")

    customer, _ := client.Customers.Create(
        "Ada Obi",
        "ada@customer.dev",
    )

    println(customer.CustomerID)
}`,
    response: `"cus_8f2a1c"`
  },
  {
    id: "php",
    label: "PHP",
    filename: "index.php",
    language: "php",
    code: `<?php

use WalletPrimitive\\Client;

$client = new Client("wp_live_xxx");

$customer = $client->customers()->create([
    "name" => "Ada Obi",
    "email" => "ada@customer.dev"
]);

print_r($customer);`,
    response: `stdClass Object
(
    [id] => cus_8f2a1c
    [walletId] => wal_4e9b7d
    [accountNumber] => 5234819201
    [bank] => Nombank MFB
    [status] => ACTIVE
)`
  },
  {
    id: "java",
    label: "Java",
    filename: "Main.java",
    language: "java",
    code: `WalletPrimitive client =
    new WalletPrimitive("wp_live_xxx");

Customer customer =
    client.customers().create(
        "Ada Obi",
        "ada@customer.dev"
    );

System.out.println(customer);`,
    response: `Customer{id='cus_8f2a1c', walletId='wal_4e9b7d', accountNumber='5234819201', bank='Nombank MFB', status='ACTIVE'}`
  },
  {
    id: "csharp",
    label: "C#",
    filename: "Program.cs",
    language: "csharp",
    code: `using WalletPrimitive;

var client = new WalletPrimitiveClient("wp_live_xxx");

var customer = await client.Customers.CreateAsync(
    new CustomerRequest
    {
        Name = "Ada Obi",
        Email = "ada@customer.dev"
    });

Console.WriteLine(customer);`,
    response: `{
  "Id": "cus_8f2a1c",
  "WalletId": "wal_4e9b7d",
  "AccountNumber": "5234819201",
  "Bank": "Nombank MFB",
  "Status": "ACTIVE"
}`
  }
];

const KEYWORDS = [
  "import", "from", "const", "let", "await", "return", "async", "new",
  "export", "default", "if", "else", "try", "catch", "true", "false",
];

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlight(code: string) {
  let html = escapeHtml(code);
  html = html.replace(/(\/\/.*?$)/gm, `<span class="text-slate-500 italic">$1</span>`);
  html = html.replace(/(".*?"|'.*?'|`[\s\S]*?`)/g, `<span class="text-emerald-400">$1</span>`);
  html = html.replace(/\b(\d+(\.\d+)?)\b/g, `<span class="text-amber-400">$1</span>`);
  KEYWORDS.forEach((k) => {
    html = html.replace(new RegExp(`\\b${k}\\b`, "g"), `<span class="text-pink-500 font-semibold">${k}</span>`);
  });
  html = html.replace(/([A-Za-z_$][\w$]*)(?=\()/g, `<span class="text-sky-400">$1</span>`);
  return html;
}

function highlightJson(jsonStr: string) {
  let html = escapeHtml(jsonStr);
  html = html.replace(/(".*?")(?=\s*:)/g, `<span class="text-sky-400 font-medium">$1</span>`);
  html = html.replace(/(:\s*)(".*?")/g, `$1<span class="text-emerald-400">$2</span>`);
  html = html.replace(/\b(true|false|null|\d+)\b/g, `<span class="text-amber-400">$1</span>`);
  return html;
}

export default function CodeEditor() {
  const [activeId, setActiveId] = useState(SAMPLES[0]!.id);
  const [showSidebar, setShowSidebar] = useState(false);
  const [terminalTab, setTerminalTab] = useState<"terminal" | "json">("json");
  const [responseCopied, setResponseCopied] = useState(false);

  // Force TypeScript to recognize that this will never be undefined
  const active = SAMPLES.find((s) => s.id === activeId) ?? SAMPLES[0]!;
  const [code, setCode] = useState(active.code);
  const [copied, setCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    setCode(active.code);
  }, [active]);

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setShowSidebar(true);
    }
  }, []);

  const highlighted = useMemo(() => highlight(code), [code]);
  const lineNumbers = useMemo(() => code.split("\n").map((_, i) => i + 1), [code]);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const reset = () => setCode(active.code);

  const download = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = active.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const syncScroll = () => {
    if (!textareaRef.current || !preRef.current) return;
    preRef.current.scrollTop = textareaRef.current.scrollTop;
    preRef.current.scrollLeft = textareaRef.current.scrollLeft;
  };

  return (
    <section id="code-editor" className="mx-auto w-full max-w-6xl px-3 sm:px-6 py-8">
      {/* Container Frame */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0B0F19] text-[#E2E8F0] shadow-2xl flex flex-col font-sans select-none backdrop-blur-xl">
        
        {/* Header Ribbon / OS Control Window */}
        <div className="flex items-center justify-between bg-[#111827]/80 px-4 py-3 text-xs text-slate-400 border-b border-slate-800/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 transition-colors hover:bg-rose-500" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 transition-colors hover:bg-amber-500" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 transition-colors hover:bg-emerald-500" />
          </div>
          <div className="truncate px-4 text-xs font-medium tracking-wide text-slate-300 max-w-[140px] sm:max-w-none bg-slate-800/40 py-1 rounded-md border border-slate-700/30">
            {active.filename}
          </div>
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden p-1.5 rounded-md bg-slate-800/50 border border-slate-700/40 text-slate-300 hover:bg-slate-800"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <div className="hidden md:block w-12"></div>
        </div>

        {/* IDE Layout Workspace */}
        <div className="flex flex-col md:flex-row flex-1 min-h-[480px] md:min-h-[620px] overflow-hidden relative">
          
          {/* Action Activity Rail */}
          <div className="hidden md:flex w-14 bg-[#0F172A] flex-col justify-between items-center py-4 border-r border-slate-800/60 shrink-0">
            <div className="flex flex-col gap-5 w-full items-center">
              <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className={`p-2.5 rounded-xl transition-all relative group ${showSidebar ? 'text-sky-400 bg-sky-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'}`}
              >
                <Files className="h-5 w-5" />
              </button>
            </div>
            <div className="text-slate-500 hover:text-slate-300 p-2.5 rounded-xl transition-colors hover:bg-slate-800/40 cursor-pointer">
              <Settings className="h-5 w-5" />
            </div>
          </div>

          {/* Primary Nav Workspace Explorer Menu */}
          <AnimatePresence initial={false}>
            {showSidebar && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="bg-[#0F172A]/95 md:bg-[#0F172A] border-b md:border-b-0 md:border-r border-slate-800/60 flex flex-col text-xs shrink-0 overflow-hidden w-full md:w-auto absolute md:relative z-20 left-0 top-0 bottom-0 md:bottom-auto md:top-auto shadow-xl md:shadow-none"
              >
                <div className="px-4 py-3 text-[11px] font-bold tracking-wider text-slate-500 uppercase flex items-center justify-between border-b border-slate-800/30">
                  <span>Explorer</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/40 font-semibold text-slate-400">
                  <ChevronRight className="h-3.5 w-3.5 transform rotate-90 text-slate-500" />
                  <span className="uppercase text-[10px] tracking-wider">Project Files</span>
                </div>
                <div className="mt-1 flex-1 overflow-y-auto px-2 pb-3 flex flex-col gap-1">
                  {SAMPLES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        setActiveId(sample.id);
                        if(window.innerWidth < 768) setShowSidebar(false);
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all border ${
                        activeId === sample.id 
                          ? "bg-sky-500/10 text-sky-400 font-medium border-sky-500/20" 
                          : "text-slate-400 border-transparent hover:bg-slate-800/30 hover:text-slate-200"
                      }`}
                    >
                      <FileCode className={`h-4 w-4 shrink-0 ${activeId === sample.id ? 'text-sky-400' : 'text-slate-500'}`} />
                      <span className="truncate text-xs">{sample.filename}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Primary View Pane Area */}
          <div className="flex-1 flex flex-col bg-[#0B0F19] overflow-hidden min-w-0 w-full">
            
            {/* Header Toolbar Utility Row & Dynamic Tabs */}
            <div className="flex items-center justify-between bg-[#0F172A]/60 border-b border-slate-800/60 overflow-x-auto scrollbar-none w-full">
              <div className="flex overflow-x-auto max-w-full scrollbar-none">
                {SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => setActiveId(sample.id)}
                    className={`relative flex items-center gap-2 px-4 py-3 text-xs shrink-0 transition-all ${
                      activeId === sample.id
                        ? "bg-[#0B0F19] text-sky-400 border-t-2 border-t-sky-500 font-medium"
                        : "bg-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/40"
                    }`}
                  >
                    <FileCode className={`h-3.5 w-3.5 ${activeId === sample.id ? 'text-sky-400' : 'text-slate-600'}`} />
                    <span>{sample.label}</span>
                  </button>
                ))}
              </div>

              {/* Functional Utilities Action Controls */}
              <div className="flex items-center gap-1.5 px-3 py-2 shrink-0 border-l border-slate-800/60 bg-[#0F172A]/40">
                <button
                  onClick={reset}
                  title="Reset Sample"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={download}
                  title="Download File"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={copy}
                  title="Copy Code"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors min-w-[32px] flex justify-center"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Main Interactive Screen Workspace Grid */}
            <div className="flex-1 flex flex-col overflow-hidden relative w-full">
              
              {/* Editor Code Input/Display Surfaces */}
              <div className="flex flex-1 overflow-hidden relative min-h-[220px] w-full">
                {/* Line Numbers Gutter */}
                <div className="hidden sm:block select-none overflow-hidden bg-[#0B0F19] pr-3 pl-4 py-4 text-right font-mono text-xs leading-6 text-slate-600 border-r border-slate-800/40 shrink-0 min-w-[48px]">
                  {lineNumbers.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>

                {/* Fixed Editor Area Layout (Corrected for Mobile Viewports) */}
                <div className="relative flex-1 w-full h-full min-h-[220px]">
                  <pre
                    ref={preRef}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre p-4 font-mono text-xs leading-6 text-slate-300 z-0"
                    dangerouslySetInnerHTML={{ __html: highlighted + "<br />" }}
                  />
                  <textarea
                    ref={textareaRef}
                    spellCheck={false}
                    value={code}
                    onScroll={syncScroll}
                    onChange={(e) => setCode(e.target.value)}
                    className="absolute inset-0 w-full h-full resize-none overflow-auto bg-transparent p-4 font-mono text-xs leading-6 text-transparent caret-sky-400 outline-none selection:bg-sky-500/20 whitespace-pre z-10"
                  />
                </div>
              </div>

              {/* Useful & Interactive Terminal Panel Row */}
              {active.response && (
                <div className="border-t border-slate-800/80 bg-[#0A0E17] flex flex-col h-[200px] sm:h-[250px] shrink-0 w-full z-10">
                  <div className="bg-[#0F172A]/90 px-4 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setTerminalTab("terminal")}
                        className={`pb-2 pt-2 px-0.5 flex items-center gap-2 border-b-2 transition-all ${
                          terminalTab === "terminal"
                            ? "text-slate-200 border-slate-400"
                            : "text-slate-500 hover:text-slate-300 border-transparent"
                        }`}
                      >
                        <Terminal className="h-3.5 w-3.5" /> MOCK TERMINAL
                      </button>
                      <button
                        onClick={() => setTerminalTab("json")}
                        className={`pb-2 pt-2 px-0.5 flex items-center gap-2 border-b-2 transition-all ${
                          terminalTab === "json"
                            ? "text-sky-400 border-sky-500"
                            : "text-slate-500 hover:text-slate-300 border-transparent"
                        }`}
                      >
                        <Braces className="h-3.5 w-3.5" /> RESPONSE JSON
                      </button>
                    </div>

                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(active.response || "");
                        setResponseCopied(true);
                        setTimeout(() => setResponseCopied(false), 1500);
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/30 transition-all text-[10px]"
                    >
                      {responseCopied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy Output
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto p-4 font-mono text-xs bg-[#060911] leading-6 w-full">
                    {terminalTab === "terminal" ? (
                      <div className="text-slate-400">
                        <span className="text-slate-600 select-none">$</span> walletprimitive exec {active.filename}
                        <div className="text-emerald-400/90 mt-1">✓ Success: 200 OK</div>
                        <pre className="text-slate-300 mt-2 whitespace-pre-wrap sm:whitespace-pre">
                          {active.response}
                        </pre>
                      </div>
                    ) : (
                      <pre 
                        className="whitespace-pre-wrap sm:whitespace-pre"
                        dangerouslySetInnerHTML={{ __html: highlightJson(active.response) }}
                      />
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Dynamic Blue Bottom Status Ribbon Row */}
        <div className="bg-sky-600 text-white flex items-center justify-between px-4 py-1.5 text-[11px] font-medium shrink-0 select-none">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-black/20 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider">
              LIVE
            </div>
            <span className="hidden sm:inline opacity-90">UTF-8</span>
          </div>
          <div className="flex items-center gap-4 opacity-90">
            <span>{active.language}</span>
            <span>Ln {lineNumbers.length}, Col {code.length}</span>
          </div>
        </div>

      </div>
    </section>
  );
}