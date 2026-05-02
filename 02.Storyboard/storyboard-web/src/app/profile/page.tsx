"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightPanel } from "@/components/layout/right-panel";
import { useAuth } from "@/lib/auth-context";
import {
  User, Mail, Calendar, CreditCard, Film, Image as ImageIcon,
  Loader2, Check, LogOut, Settings,
} from "lucide-react";
import { mockProjects } from "@/lib/mock-data";

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [saved, setSaved] = useState(false);

  if (!user) {
    return (
      <div className="h-screen flex flex-col">
        <TopBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary mb-4">请先登录</p>
            <button
              onClick={() => router.push("/login")}
              className="h-11 px-5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
            >
              去登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    updateProfile({ displayName });
    setSaving(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const stats = [
    { label: "项目数", value: mockProjects.length, icon: Film },
    { label: "总镜头", value: mockProjects.reduce((s, p) => s + p.shotCount, 0), icon: ImageIcon },
    { label: "积分余额", value: 120, icon: CreditCard },
  ];

  return (
    <div className="h-screen flex flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <main className="flex-1 bg-base overflow-auto p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-xl font-semibold text-text-primary mb-6">个人中心</h1>

            {/* Profile card */}
            <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-accent-dim flex items-center justify-center shrink-0">
                  <span className="text-2xl font-bold text-accent">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  {editing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">显示名称</label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="flex items-center gap-2 h-9 px-4 rounded-full bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
                        >
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          {saving ? "保存中..." : "保存"}
                        </button>
                        <button
                          onClick={() => { setEditing(false); setDisplayName(user.displayName); }}
                          className="h-9 px-4 rounded-full border border-border text-xs font-medium text-text-secondary hover:bg-base transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-lg font-semibold text-text-primary">{user.displayName}</h2>
                        {saved && (
                          <span className="text-xs text-success flex items-center gap-1">
                            <Check className="w-3 h-3" /> 已保存
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5 text-xs text-text-secondary">
                        <p className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-text-muted" />
                          {user.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-text-muted" />
                          注册于 2025 年 1 月
                        </p>
                      </div>
                      <button
                        onClick={() => setEditing(true)}
                        className="mt-3 h-9 px-4 rounded-full border border-border text-xs font-medium text-text-secondary hover:bg-base transition-colors"
                      >
                        编辑资料
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-surface rounded-2xl border border-border p-5 text-center">
                    <Icon className="w-6 h-6 text-accent mx-auto mb-2" />
                    <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                    <p className="text-xs text-text-muted mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Recent projects */}
            <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
              <h3 className="text-sm font-semibold text-text-primary mb-4">最近项目</h3>
              <div className="space-y-3">
                {mockProjects.slice(0, 3).map((project) => (
                  <button
                    key={project.id}
                    onClick={() => router.push(`/project/${project.id}`)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-base transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-base rounded-lg flex items-center justify-center">
                      <Film className="w-5 h-5 text-text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{project.name}</p>
                      <p className="text-xs text-text-muted">{project.shotCount} 个镜头 · {project.updatedAt}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/settings")}
                className="flex items-center gap-2 h-11 px-5 rounded-full border border-border text-sm font-medium text-text-secondary hover:bg-base transition-colors"
              >
                <Settings className="w-4 h-4" />
                账户设置
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 h-11 px-5 rounded-full border border-error text-sm font-medium text-error hover:bg-error/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          </div>
        </main>
        <RightPanel>
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">账户概览</h3>
            <div className="space-y-3 text-xs text-text-secondary">
              <p>这里展示你的账户基本信息和使用统计。</p>
              <p>点击「编辑资料」可以修改显示名称。</p>
              <p>如需修改邮箱或密码，请前往「设置」。</p>
            </div>
          </div>
        </RightPanel>
      </div>
    </div>
  );
}
