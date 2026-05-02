"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightPanel } from "@/components/layout/right-panel";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/lib/auth-context";
import { User, CreditCard, Wallet, Check } from "lucide-react";

const creditHistory = [
  { id: "1", title: "AI 拆镜 - 产品宣传视频", time: "2024-01-15 14:30", amount: -60 },
  { id: "2", title: "图片生成 - #01 首帧", time: "2024-01-15 14:25", amount: -30 },
  { id: "3", title: "每月配额充值", time: "2024-01-01 00:00", amount: 2000 },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [activeNav, setActiveNav] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    updateProfile({ displayName, email });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
                      <p className="text-xs text-text-muted">{email}</p>
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
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">邮箱地址</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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

              {/* Subscription section */}
              <section className="space-y-5">
                <h3 className="text-xl font-bold text-text-primary">订阅管理</h3>
                <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-text-primary">专业版</p>
                      <p className="text-[13px] text-text-secondary">每月 2,000 积分</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-accent-dim text-accent text-xs font-semibold">活跃</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[13px] text-text-muted">积分余额</p>
                    <p className="text-2xl font-bold text-accent">{user?.credits?.toLocaleString() ?? 0} / 2,000</p>
                    <div className="h-2 rounded bg-base overflow-hidden">
                      <div className="h-full rounded bg-accent" style={{ width: `${((user?.credits ?? 0) / 2000) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </section>

              <div className="h-px bg-border" />

              {/* Credit history section */}
              <section className="space-y-5">
                <h3 className="text-xl font-bold text-text-primary">积分明细</h3>
                <div className="space-y-0">
                  {creditHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                    >
                      <div>
                        <p className="text-sm text-text-primary">{item.title}</p>
                        <p className="text-xs text-text-muted">{item.time}</p>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          item.amount > 0 ? "text-success" : "text-error"
                        }`}
                      >
                        {item.amount > 0 ? "+" : ""}{item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
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
    </div>
    </AuthGuard>
  );
}
