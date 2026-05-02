"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface User {
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("storyboard_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800));
    const u = { email, displayName: email.split("@")[0] };
    setUser(u);
    localStorage.setItem("storyboard_user", JSON.stringify(u));
    return true;
  };

  const register = async (email: string, _password: string, displayName: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 1000));
    const u = { email, displayName };
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

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
