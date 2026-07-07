import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Enter your workspace name"),
  email: z.string().email("Enter a valid email"),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const otpSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code"),
});
export type OtpInput = z.infer<typeof otpSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type LoginInput = z.infer<typeof loginSchema>;
