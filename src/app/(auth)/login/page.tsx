"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/components/layout/AuthCard";
import { TextField } from "@/components/ui/TextField";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { useLogin } from "@/features/auth/useSignup";

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const autoSubmittedRef = useRef(false);

  const login = useLogin();

  const emailForm = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    setMounted(true);

    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    const passwordParam = params.get("password");
    const autoSubmitParam = params.get("autoSubmit");

    if (emailParam && passwordParam && autoSubmitParam === "true" && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      emailForm.setValue("email", emailParam);
      emailForm.setValue("password", passwordParam);
      
      login.mutate({ email: emailParam, password: passwordParam }, {
        onSuccess: (res) => {
          if (res.access_token) {
            localStorage.setItem("token", res.access_token);
          }
          if (res.workspaceId) {
            localStorage.setItem("workspaceId", res.workspaceId);
          }

          const redirectToSettings = localStorage.getItem("redirectToSettings");
          if (redirectToSettings === "true") {
            localStorage.removeItem("redirectToSettings");
            router.push("/dashboard/settings");
          } else {
            router.push("/dashboard");
          }
        }
      });
    }
  }, [emailForm, login, router]);

  const onEmail = emailForm.handleSubmit(async (values) => {
    try {
      const res = await login.mutateAsync(values);
      if (res.access_token) {
        localStorage.setItem("token", res.access_token);
      }
      if (res.workspaceId) {
        localStorage.setItem("workspaceId", res.workspaceId);
      }

      const redirectToSettings = localStorage.getItem("redirectToSettings");
      if (redirectToSettings === "true") {
        localStorage.removeItem("redirectToSettings");
        router.push("/dashboard/settings");
      } else {
        router.push("/dashboard");
      }
    } catch {
      // Swallowed: React Query handles errors in UI state
    }
  });

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 p-4">
        <div className="w-full max-w-md animate-pulse rounded-2xl border border-white/5 bg-ink-900 p-8 h-[340px]" />
      </div>
    );
  }

  return (
    <AuthCard title="Sign in" subtitle="Enter your workspace credentials.">
      <form onSubmit={onEmail} className="space-y-4">
        <TextField label="Work email" type="email" placeholder="you@company.com" error={emailForm.formState.errors.email?.message} {...emailForm.register("email")} />
        <TextField label="Password" type="password" placeholder="••••••••" error={emailForm.formState.errors.password?.message} {...emailForm.register("password")} />
        <button
          type="submit"
          disabled={login.isPending}
          className="w-full rounded-lg bg-amber-500 py-2.5 text-sm font-medium text-ink-950 transition hover:bg-amber-400 disabled:opacity-50"
        >
          {login.isPending ? "Signing in…" : "Continue"}
        </button>
      </form>
      <p className="mt-5 text-center text-xs text-paper-200/45">
        Need a workspace?{" "}
        <a href="/signup" className="text-blue-500 hover:underline">
          Create one
        </a>
      </p>
    </AuthCard>
  );
}
