"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Film, CreditCard, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0">
      <button onClick={() => router.push("/")} className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
          <Film className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-semibold text-text-primary">
          分镜大师
        </span>
      </button>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-dim">
              <CreditCard className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">{user.credits?.toLocaleString() ?? 0} 积分</span>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 h-9 px-3 rounded-full bg-base hover:bg-elevated transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-accent-dim flex items-center justify-center">
                  <span className="text-xs font-semibold text-accent">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-medium text-text-primary max-w-[80px] truncate">
                  {user.displayName}
                </span>
                <ChevronDown className="w-3 h-3 text-text-muted" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-surface rounded-xl border border-border shadow-lg py-1 z-50">
                  <button
                    onClick={() => { router.push("/profile"); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:bg-base transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    个人中心
                  </button>
                  <button
                    onClick={() => { router.push("/settings"); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:bg-base transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    积分与账单
                  </button>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-error hover:bg-error/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/login")}
              className="h-9 px-4 rounded-full text-xs font-medium text-text-secondary hover:bg-base transition-colors"
            >
              登录
            </button>
            <button
              onClick={() => router.push("/register")}
              className="h-9 px-4 rounded-full bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors"
            >
              注册
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
