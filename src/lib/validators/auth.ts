import { z } from "zod";

/** Request validation. Every API body/query string is parsed through these. */

export const emailSchema = z
  .string("Email is required")
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .max(254, "Email is too long")
  .pipe(z.email("Enter a valid email address"));

export const passwordSchema = z
  .string("Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer");

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string("Password is required").min(1, "Password is required"),
});

export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string("Password is required").min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
