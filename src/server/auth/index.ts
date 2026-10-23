// Main auth module exports
export {
  signupWithEmail,
  loginWithEmail,
  loginWithGoogle,
  getUserById,
  getUserByEmail,
  AuthError,
} from "./auth";

export { signAccessToken, verifyAccessToken } from "./jwt";

export {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from "./password";

export { verifyGoogleToken } from "./google";

export { getAuthContext, withAuth, unauthorizedResponse } from "./middleware";

export {
  setAuthCookie,
  clearAuthCookie,
  getSession,
  getAccessTokenFromCookies,
} from "./session";
