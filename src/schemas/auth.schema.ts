import { z } from "zod";
import {
  emailSchema,
  passwordSchema,
  usernameSchema,
  displayNameSchema,
} from "./user.schema";

/**
 * Zod Schemas for Authentication
 */

// Email signup
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
  displayName: displayNameSchema,
});

// Email login
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Google OAuth
export const googleAuthSchema = z.object({
  googleToken: z.string().min(1, "Google token is required"),
});

// Refresh token
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
