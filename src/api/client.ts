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
