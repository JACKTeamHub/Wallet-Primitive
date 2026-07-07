import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "@/constants/urls";

export const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? API_BASE_URL,
  withCredentials: true, // HttpOnly cookie auth, never localStorage
  headers: { "Content-Type": "application/json" },
});

export interface ApiErrorShape {
  message: string;
  statusCode: number;
  code?: string;
}

function decodeJwt(token: string) {
  try {
    const parts = token.split(".");
    const base64Url = parts[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

client.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Auto-heal: Extract workspaceId from JWT token if it's missing in localStorage
      if (!localStorage.getItem("workspaceId")) {
        const decoded = decodeJwt(token);
        if (decoded && decoded.workspaceId) {
          localStorage.setItem("workspaceId", decoded.workspaceId);
        }
      }
    }

    const apiKey = localStorage.getItem("apiKey");
    if (apiKey) {
      config.headers["x-api-key"] = apiKey;
    }

    const workspaceId = localStorage.getItem("workspaceId");
    if (workspaceId && config.url) {
      let url = config.url;
      // Rewrite workspace endpoints to include workspaceId path param for NestJS
      if (url.startsWith("/workspaces/")) {
        const subpath = url.substring("/workspaces/".length);
        
        if (subpath === "api-keys") {
          url = `/workspaces/${workspaceId}/api-keys`;
        } else if (subpath.startsWith("api-keys/")) {
          const keyId = subpath.substring("api-keys/".length);
          url = `/workspaces/${workspaceId}/api-keys/${keyId}`;
        } else if (subpath === "credentials") {
          url = `/workspaces/${workspaceId}/credentials`;
        } else if (subpath === "analytics") {
          url = `/workspaces/${workspaceId}/analytics`;
        } else if (subpath === "audit-logs") {
          url = `/workspaces/${workspaceId}/audit-logs`;
        } else if (subpath === "webhooks/simulate") {
          url = `/workspaces/${workspaceId}/simulate-webhook`;
        } else if (subpath === "quarantine") {
          url = `/workspaces/${workspaceId}/quarantine`;
        } else if (subpath.startsWith("quarantine/") && subpath.endsWith("/release")) {
          const ledgerEntryId = subpath.substring("quarantine/".length, subpath.length - "/release".length);
          url = `/workspaces/${workspaceId}/quarantine/${ledgerEntryId}/release`;
        } else if (subpath.startsWith("quarantine/") && subpath.endsWith("/reject")) {
          const ledgerEntryId = subpath.substring("quarantine/".length, subpath.length - "/reject".length);
          url = `/workspaces/${workspaceId}/quarantine/${ledgerEntryId}/reject`;
        }
        config.url = url;
      }
    }
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiErrorShape>) => {
    const shaped: ApiErrorShape = {
      message: error.response?.data?.message ?? "Something went wrong. Try again.",
      statusCode: error.response?.status ?? 0,
      code: error.response?.data?.code,
    };
    return Promise.reject(shaped);
  }
);
