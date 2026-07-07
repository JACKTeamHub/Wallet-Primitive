"use client";

import { useMutation } from "@tanstack/react-query";
import { workspacesApi } from "@/api/workspaces";

export function useSignup() {
  return useMutation({
    mutationFn: workspacesApi.signup,
  });
}

export function useVerifyOnboarding() {
  return useMutation({
    mutationFn: workspacesApi.verifyOnboarding,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: workspacesApi.login,
  });
}

export function useVerifyLogin() {
  return useMutation({
    mutationFn: workspacesApi.verifyLogin,
  });
}
