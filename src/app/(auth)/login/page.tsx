"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/components/layout/AuthCard";
import { TextField } from "@/components/ui/TextField";
import { loginSchema, otpSchema, type LoginInput, type OtpInput } from "@/schemas/auth";
import { useLogin, useVerifyLogin } from "@/features/auth/useSignup";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const login = useLogin();
  const verify = useVerifyLogin();

  const emailForm = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const otpForm = useForm<OtpInput>({ resolver: zodResolver(otpSchema) });

  useEffect(() => {
    setMounted(true);

    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    const passwordParam = params.get("password");
    const autoSubmitParam = params.get("autoSubmit");

    if (emailParam && passwordParam && autoSubmitParam === "true") {
      emailForm.setValue("email", emailParam);
      emailForm.setValue("password", passwordParam);
      
      login.mutate({ email: emailParam, password: passwordParam }, {
        onSuccess: () => {
          setEmail(emailParam);
        }
      });
    }
  }, [emailForm, login]);

  const onEmail = emailForm.handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      setEmail(values.email);
    } catch {
      // Swallowed: React Query handles errors in UI state
    }
  });

  const onOtp = otpForm.handleSubmit(async (values) => {
    if (!email) return;
    try {
      const res = await verify.mutateAsync({ email, otp: values.otp });
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

  if (email) {
    return (
      <AuthCard title="Enter your code" subtitle={`We sent a 6-digit code to ${email}.`}>
        <form onSubmit={onOtp} className="space-y-4">
          <TextField
            label="Verification code"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            error={otpForm.formState.errors.otp?.message}
            {...otpForm.register("otp")}
          />
          <button
            type="submit"
            disabled={verify.isPending}
            className="w-full rounded-lg bg-amber-500 py-2.5 text-sm font-medium text-ink-950 transition hover:bg-amber-400 disabled:opacity-50"
          >
            {verify.isPending ? "Verifying…" : "Sign in"}
          </button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Sign in" subtitle="We'll email you a one-time code.">
      <form onSubmit={onEmail} className="space-y-4">
        <TextField label="Work email" type="email" placeholder="you@company.com" error={emailForm.formState.errors.email?.message} {...emailForm.register("email")} />
        <TextField label="Password" type="password" placeholder="••••••••" error={emailForm.formState.errors.password?.message} {...emailForm.register("password")} />
        <button
          type="submit"
          disabled={login.isPending}
          className="w-full rounded-lg bg-amber-500 py-2.5 text-sm font-medium text-ink-950 transition hover:bg-amber-400 disabled:opacity-50"
        >
          {login.isPending ? "Sending code…" : "Continue"}
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
