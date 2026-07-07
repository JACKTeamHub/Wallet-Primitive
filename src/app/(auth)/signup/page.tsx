"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/components/layout/AuthCard";
import { TextField } from "@/components/ui/TextField";
import { signupSchema, otpSchema, type SignupInput, type OtpInput } from "@/schemas/auth";
import { useSignup, useVerifyOnboarding } from "@/features/auth/useSignup";
import { useToast } from "@/providers/toast-provider";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const signup = useSignup();
  const verify = useVerifyOnboarding();

  const detailsForm = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });
  const otpForm = useForm<OtpInput>({ resolver: zodResolver(otpSchema) });

  const onDetails = detailsForm.handleSubmit(async (values) => {
    try {
      const res = await signup.mutateAsync(values);
      setEmail(values.email);
      setWorkspaceId(res.workspaceId);
    } catch {
      // Swallowed: React Query handles errors in UI state
    }
  });

  const onOtp = otpForm.handleSubmit(async (values) => {
    if (!email) return;
    try {
      await verify.mutateAsync({ email, otp: values.otp });
      toast("Workspace activated successfully! Sending your login code...", "success");
      localStorage.setItem("redirectToSettings", "true");
      
      const pwd = detailsForm.getValues("password") || "";
      router.push(`/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(pwd)}&autoSubmit=true`);
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

  if (workspaceId) {
    return (
      <AuthCard title="Check your email" subtitle="Enter the 6-digit code we just sent you.">
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
            {verify.isPending ? "Verifying…" : "Verify and continue"}
          </button>
          {verify.isError && (
            <p className="text-center text-xs text-signal-red">Could not verify that code. Try again.</p>
          )}
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create your workspace" subtitle="Start provisioning virtual accounts in minutes.">
      <form onSubmit={onDetails} className="space-y-4">
        <TextField label="Workspace name" placeholder="Acme Fintech" error={detailsForm.formState.errors.name?.message} {...detailsForm.register("name")} />
        <TextField label="Work email" type="email" placeholder="you@company.com" error={detailsForm.formState.errors.email?.message} {...detailsForm.register("email")} />
        <TextField label="Password" type="password" placeholder="••••••••" error={detailsForm.formState.errors.password?.message} {...detailsForm.register("password")} />
        <button
          type="submit"
          disabled={signup.isPending}
          className="w-full rounded-lg bg-amber-500 py-2.5 text-sm font-medium text-ink-950 transition hover:bg-amber-400 disabled:opacity-50"
        >
          {signup.isPending ? "Sending code…" : "Continue"}
        </button>
      </form>
      <p className="mt-5 text-center text-xs text-paper-200/45">
        Already have a workspace?{" "}
        <a href="/login" className="text-blue-500 hover:underline">
          Sign in
        </a>
      </p>
    </AuthCard>
  );
}
