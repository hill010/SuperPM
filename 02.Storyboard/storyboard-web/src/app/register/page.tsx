"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Film, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("请填写所有必填字段");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次密码不一致");
      return;
    }
    if (password.length < 8) {
      setError("密码至少 8 位");
      return;
    }
    if (!agreeTerms) {
      setError("请同意服务条款和隐私政策");
      return;
    }
    setLoading(true);
    const ok = await register(email, password, username);
    setLoading(false);
    if (ok) router.push("/");
    else setError("注册失败，请重试");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-base">
      <div className="w-[420px] bg-surface rounded-3xl border border-border p-[48px_56px] shadow-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[28px] font-bold text-text-primary">创建账号</h1>
          <p className="text-sm text-text-secondary mt-2">加入分镜大师，开启 AI 分镜之旅</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-error/10 text-error text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              className="w-full h-12 px-4 rounded-xl border border-border bg-surface text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

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
                placeholder="至少 8 位，包含字母和数字"
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

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入密码"
              className="w-full h-12 px-4 rounded-xl border border-border bg-surface text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Terms */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-accent"
            />
            <span className="text-xs text-text-secondary">我已阅读并同意服务条款和隐私政策</span>
          </label>

          {/* Register button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-60"
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>

        {/* Login prompt */}
        <p className="text-center text-sm text-text-secondary mt-10">
          已有账号？{" "}
          <button type="button" onClick={() => router.push("/login")} className="text-[13px] text-accent font-medium hover:underline">
            立即登录
          </button>
        </p>
      </div>
    </div>
  );
}
