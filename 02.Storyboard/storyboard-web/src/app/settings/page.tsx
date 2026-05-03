"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightPanel } from "@/components/layout/right-panel";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { User, CreditCard, Wallet, Check, Loader2, Sparkles } from "lucide-react";

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateProfile, refreshUser } = useAuth();
  const [activeNav, setActiveNav] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? "");
    }
  }, [user]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoadingTransactions(true);
      try {
        const response = await api.get("/api/user/me/transactions");
        setTransactions(response.data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      }
      setLoadingTransactions(false);
    };
    fetchTransactions();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const success = await updateProfile({ displayName });
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "earn": return "获得";
      case "spend": return "消费";
      case "refund": return "退回";
      case "reserve": return "预留";
      case "deduct_reserved": return "扣费";
      case "return_reserved": return "退回预留";
      default: return type;
    }
  };

  const navItems = [
    { id: "profile", icon: User, label: "个人资料" },
    { id: "subscription", icon: CreditCard, label: "订阅管理" },
    { id: "credits", icon: Wallet, label: "积分明细" },
  ];

  return (
    <AuthGuard>
      <div className="h-screen flex flex-col">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar />
          <main className="flex-1 bg-base overflow-auto">
            <div className="flex">
            {/* Left nav */}
            <nav className="w-60 shrink-0 bg-surface border-r border-border p-4 space-y-2">
              <h2 className="text-lg font-bold text-text-primary mb-3">设置</h2>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium transition-colors ${
                    activeNav === item.id
                      ? "bg-accent-dim text-accent"
                      : "text-text-secondary hover:bg-base hover:text-text-primary"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right content */}
            <div className="flex-1 p-10 space-y-8">
              {/* Profile section */}
              <section className="space-y-5">
                <h3 className="text-xl font-bold text-text-primary">个人资料</h3>
                <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-full bg-accent-dim flex items-center justify-center">
                      <span className="text-lg font-semibold text-accent">
                        {(displayName || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{displayName || "未设置"}</p>
                      <p className="text-xs text-text-muted">{user?.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">显示名称</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 h-10 px-5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
                  >
                    {saving ? "保存中..." : saved ? <><Check className="w-4 h-4" /> 已保存</> : "保存更改"}
                  </button>
                </div>
              </section>

              <div className="h-px bg-border" />

              {/* Credits section */}
              <section className="space-y-5">
                <h3 className="text-xl font-bold text-text-primary">积分余额</h3>
                <div className="bg-surface rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-accent" />
                      <span className="text-sm text-text-secondary">当前余额</span>
                    </div>
                    <span className="text-2xl font-bold text-accent">
                      {user?.credits?.toLocaleString() ?? 0}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted mb-4">
                    积分可用于 AI 拆镜（10 积分/镜头）、图片生成（20 积分/张）等功能。
                  </p>
                  <button className="h-10 px-6 rounded-full border border-accent text-accent text-sm font-semibold hover:bg-accent-dim transition-colors">
                    充值积分
                  </button>
                </div>
              </section>

              <div className="h-px bg-border" />

              {/* Credit history section */}
              <section className="space-y-5">
                <h3 className="text-xl font-bold text-text-primary">积分明细</h3>
                <div className="bg-surface rounded-2xl border border-border p-6">
                  {loadingTransactions ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <p className="text-sm text-text-muted text-center py-8">暂无记录</p>
                  ) : (
                    <div className="space-y-0">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                        >
                          <div>
                            <p className="text-sm text-text-primary">{tx.description || getTypeLabel(tx.type)}</p>
                            <p className="text-xs text-text-muted">{new Date(tx.createdAt).toLocaleString()}</p>
                          </div>
                          <span className={`text-sm font-semibold ${tx.amount > 0 ? "text-success" : "text-error"}`}>
                            {tx.amount > 0 ? "+" : ""}{tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
            </div>
          </main>
        </div>
        <RightPanel>
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">设置帮助</h3>
            <div className="space-y-3 text-xs text-text-secondary">
              <p>选择左侧菜单项查看和修改对应设置。</p>
              <p>修改后记得点击「保存更改」按钮。</p>
            </div>
          </div>
        </RightPanel>
      </div>
    </AuthGuard>
  );
}