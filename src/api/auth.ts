import axios from "axios";
import type { AuthUser, AuthResponse } from "@/types/auth";
import { storeAuthData, clearAuthData, getAccessToken } from "@/lib/auth";

// Client Auth API Functions

export async function signupWithEmail(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  try {
    const { data } = await axios.post<AuthResponse>("/api/auth", {
      action: "signup",
      email,
      password,
      name,
    });
    storeAuthData(data);
    return data;
  } catch (error) {
    throw error; // Let the page handle with getAuthErrorMessage
  }
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { data } = await axios.post<AuthResponse>("/api/auth", {
      action: "login",
      email,
      password,
    });
    storeAuthData(data);
    return data;
  } catch (error) {
    throw error; // Let the page handle with getAuthErrorMessage
  }
}

export async function loginWithGoogle(
  googleToken: string
): Promise<AuthResponse> {
  try {
    const { data } = await axios.post<AuthResponse>("/api/auth", {
      action: "google",
      googleToken,
    });
    storeAuthData(data);
    return data;
  } catch (error) {
    throw error; // Let the page handle with getAuthErrorMessage
  }
}

export async function logout(): Promise<void> {
  try {
    await axios.post("/api/auth", { action: "logout" });
  } finally {
    clearAuthData();
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const token = getAccessToken();
    if (!token) return null;

    const { data } = await axios.get<{ user: AuthUser }>("/api/auth", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.user;
  } catch {
    clearAuthData();
    return null;
  }
}
