"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface User {
  email: string;
  displayName: string;
  credits: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  deductCredits: (amount: number) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("storyboard_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser({ ...parsed, credits: parsed.credits ?? 0 });
    }
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800));
    const u = { email, displayName: email.split("@")[0], credits: 1250 };
    setUser(u);
    localStorage.setItem("storyboard_user", JSON.stringify(u));
    return true;
  };

  const register = async (email: string, _password: string, displayName: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 1000));
    const u = { email, displayName, credits: 2000 };
    setUser(u);
    localStorage.setItem("storyboard_user", JSON.stringify(u));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("storyboard_user");
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("storyboard_user", JSON.stringify(updated));
  };

  const deductCredits = (amount: number): boolean => {
    if (!user || user.credits < amount) return false;
    const updated = { ...user, credits: user.credits - amount };
    setUser(updated);
    localStorage.setItem("storyboard_user", JSON.stringify(updated));
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, deductCredits }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
