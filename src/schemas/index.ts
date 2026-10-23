/**
 * Zod Schemas - Barrel Export
 */

// User schemas (including auth-related)
export {
  usernameSchema,
  emailSchema,
  phoneSchema,
  displayNameSchema,
  bioSchema,
  avatarSchema,
  passwordSchema,
  searchQuerySchema,
  emailSignupSchema,
  emailLoginSchema,
  updateProfileSchema,
  updateSettingsSchema,
  searchUsersSchema,
  checkUsernameSchema,
  type EmailSignupInput,
  type EmailLoginInput,
  type UpdateProfileInput,
  type UpdateSettingsInput,
  type SearchUsersInput,
  type CheckUsernameInput,
} from "./user.schema";

// Auth schemas (re-exports with different names where needed)
export {
  signupSchema,
  loginSchema,
  googleAuthSchema,
  refreshTokenSchema,
  type SignupInput,
  type LoginInput,
  type GoogleAuthInput,
  type RefreshTokenInput,
} from "./auth.schema";
