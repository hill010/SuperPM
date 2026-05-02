"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  FolderOpen,
  Image,
  ListTodo,
  Download,
  Settings,
} from "lucide-react";

const navItems = [
  { id: "projects", icon: FolderOpen, label: "项目", href: "/" },
  { id: "assets", icon: Image, label: "素材库", href: "/assets" },
  { id: "jobs", icon: ListTodo, label: "任务队列", href: "/" },
  { id: "export", icon: Download, label: "导出", href: "/export" },
  { id: "settings", icon: Settings, label: "设置", href: "/settings" },
];

export function LeftSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveId = () => {
    if (pathname === "/") return "projects";
    if (pathname.startsWith("/assets")) return "assets";
    if (pathname.startsWith("/export")) return "export";
    if (pathname.startsWith("/settings")) return "settings";
    return "projects";
  };

  const active = getActiveId();

  return (
    <aside className="w-60 border-r border-border bg-surface flex flex-col shrink-0">
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(item.href)}
            className={`w-full flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium transition-colors ${
              active === item.id
                ? "bg-accent-dim text-accent"
                : "text-text-secondary hover:bg-base hover:text-text-primary"
            }`}
          >
            <item.icon className="w-[18px] h-[18px]" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
