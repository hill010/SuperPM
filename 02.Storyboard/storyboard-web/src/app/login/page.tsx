"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Film, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("请填写邮箱和密码");
      return;
    }
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) router.push("/");
    else setError("登录失败，请重试");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-base">
      <div className="w-[420px] bg-surface rounded-3xl border border-border p-[48px_56px] shadow-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[28px] font-bold text-accent">分镜大师</h1>
          <p className="text-sm text-text-secondary mt-2">AI 驱动的智能分镜平台</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-error/10 text-error text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">邮箱地址</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              className="w-full h-12 px-4 rounded-xl border border-border bg-surface text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">密码</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full h-12 px-4 pr-12 rounded-xl border border-border bg-surface text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-accent"
              />
              <span className="text-xs text-text-secondary">记住我</span>
            </label>
            <button type="button" className="text-xs text-accent hover:underline">
              忘记密码？
            </button>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-60"
          >
            {loading ? "登录中..." : "登录"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">或</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social login */}
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 h-11 rounded-xl bg-elevated border border-border flex items-center justify-center gap-2 text-sm text-text-secondary hover:bg-base transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex-1 h-11 rounded-xl bg-elevated border border-border flex items-center justify-center gap-2 text-sm text-text-secondary hover:bg-base transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              GitHub
            </button>
          </div>
        </form>

        {/* Register prompt */}
        <p className="text-center text-sm text-text-secondary mt-10">
          还没有账号？{" "}
          <button type="button" onClick={() => router.push("/register")} className="text-[13px] text-accent font-medium hover:underline">
            立即注册
          </button>
        </p>
      </div>
    </div>
  );
}
