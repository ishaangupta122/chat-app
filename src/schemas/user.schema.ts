import { z } from "zod";

/**
 * Zod Schemas for User Validation
 *
 * Privacy-first design with clear separation of public vs private data
 */

// Reserved usernames that cannot be used
const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "root",
  "system",
  "support",
  "help",
  "api",
  "www",
  "mail",
  "email",
  "test",
  "user",
  "users",
  "account",
  "accounts",
  "settings",
  "profile",
  "search",
  "login",
  "logout",
  "signup",
  "register",
  "null",
  "undefined",
  "me",
]);

// Username: 3-20 chars, starts with letter, alphanumeric + underscore
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/,
    "Username must start with a letter and contain only letters, numbers, and underscores"
  )
  .transform((val) => val.toLowerCase())
  .refine((val) => !RESERVED_USERNAMES.has(val), {
    message: "This username is not available",
  });

// Email validation
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(255, "Email must be at most 255 characters")
  .transform((val) => val.toLowerCase());

// Phone validation (optional)
export const phoneSchema = z
  .string()
  .regex(/^\+?[0-9\s\-\(\)]{7,20}$/, "Invalid phone number format")
  .transform((val) => val.replace(/[\s\-\(\)]/g, ""))
  .optional()
  .nullable();

// Display name (optional)
export const displayNameSchema = z
  .string()
  .max(100, "Display name must be at most 100 characters")
  .optional()
  .nullable();

// Bio (optional)
export const bioSchema = z
  .string()
  .max(500, "Bio must be at most 500 characters")
  .optional()
  .nullable();

// Avatar URL (optional)
export const avatarSchema = z
  .string()
  .url("Invalid avatar URL")
  .optional()
  .nullable();

// Password validation
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Search query validation
export const searchQuerySchema = z
  .string()
  .min(3, "Search query must be at least 3 characters")
  .max(20, "Search query must be at most 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Search query contains invalid characters")
  .transform((val) => val.toLowerCase());

// ============ Request Schemas ============

// Email signup request
export const emailSignupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
  displayName: displayNameSchema,
});

// Email login request
export const emailLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Google auth request
export const googleAuthSchema = z.object({
  googleToken: z.string().min(1, "Google token is required"),
});

// Update profile request (public fields)
export const updateProfileSchema = z.object({
  displayName: displayNameSchema,
  bio: bioSchema,
  avatar: avatarSchema,
});

// Update settings request (private fields)
export const updateSettingsSchema = z.object({
  phone: phoneSchema,
  isDiscoverable: z.boolean().optional(),
});

// Search users request
export const searchUsersSchema = z.object({
  q: searchQuerySchema,
  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 10;
      const num = parseInt(val, 10);
      return isNaN(num) ? 10 : Math.min(Math.max(num, 1), 20);
    }),
});

// Check username availability
export const checkUsernameSchema = z.object({
  username: usernameSchema,
});

// ============ Type exports ============

export type EmailSignupInput = z.infer<typeof emailSignupSchema>;
export type EmailLoginInput = z.infer<typeof emailLoginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
export type CheckUsernameInput = z.infer<typeof checkUsernameSchema>;
