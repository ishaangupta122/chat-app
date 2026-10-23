"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  loginWithEmail as apiLoginWithEmail,
  logout as apiLogout,
  getCurrentUser,
} from "@/services/auth";
import { getStoredUser, isAuthenticated, clearAuthData } from "@/lib/auth";
import type { AuthUser } from "@/types/auth";
import { toast } from "@/components/ui/toast";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          // Try to get user from localStorage first
          const storedUser = getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            // Fetch from API
            const apiUser = await getCurrentUser();
            setUser(apiUser);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiLoginWithEmail(email, password);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
      toast.success("Logged out successfully!");
    } finally {
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  // Refresh user from localStorage (for after signup/login from pages)
  const refreshUser = useCallback(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
        refreshUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
