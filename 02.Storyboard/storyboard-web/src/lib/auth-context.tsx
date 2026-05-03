"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import api from "./api";

interface User {
  id: string;
  email: string;
  displayName: string;
  credits: number;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  deductCredits: (amount: number) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get("/api/user/me");
      setUser({
        id: response.data.id,
        email: response.data.email,
        displayName: response.data.displayName,
        credits: response.data.credits,
        avatarUrl: response.data.avatarUrl,
      });
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem("token", token);
      setUser({
        id: userData.id,
        email: userData.email,
        displayName: userData.displayName,
        credits: userData.credits,
      });
      return { success: true };
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      return { success: false, error: axiosErr.response?.data?.error || "登录失败" };
    }
  };

  const register = async (email: string, password: string, displayName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post("/api/auth/register", { email, password, displayName });
      const { token, user: userData } = response.data;
      localStorage.setItem("token", token);
      setUser({
        id: userData.id,
        email: userData.email,
        displayName: userData.displayName,
        credits: userData.credits,
      });
      return { success: true };
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      return { success: false, error: axiosErr.response?.data?.error || "注册失败" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      const response = await api.put("/api/user/me", data);
      setUser((prev) =>
        prev ? { ...prev, displayName: response.data.displayName, avatarUrl: response.data.avatarUrl } : null
      );
      return true;
    } catch {
      return false;
    }
  };

  const deductCredits = (amount: number): boolean => {
    if (!user || user.credits < amount) return false;
    setUser((prev) => prev ? { ...prev, credits: prev.credits - amount } : null);
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, deductCredits, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}