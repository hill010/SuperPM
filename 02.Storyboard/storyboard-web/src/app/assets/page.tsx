"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Image as ImageIcon, Upload, Search, Grid3X3, List,
  Trash2, Download, Eye, FolderOpen,
} from "lucide-react";

interface Asset {
  id: string;
  name: string;
  type: "first-frame" | "last-frame";
  thumbnail: string;
  size: string;
  createdAt: string;
  projectId: string;
  projectName: string;
}

const mockAssets: Asset[] = [
  { id: "a1", name: "首帧_镜头01.png", type: "first-frame", thumbnail: "", size: "2.4 MB", createdAt: "2 小时前", projectId: "proj-001", projectName: "夏日咖啡广告" },
  { id: "a2", name: "尾帧_镜头01.png", type: "last-frame", thumbnail: "", size: "2.1 MB", createdAt: "2 小时前", projectId: "proj-001", projectName: "夏日咖啡广告" },
  { id: "a3", name: "首帧_镜头03.png", type: "first-frame", thumbnail: "", size: "3.0 MB", createdAt: "1 天前", projectId: "proj-001", projectName: "夏日咖啡广告" },
  { id: "a4", name: "首帧_特写镜头.png", type: "first-frame", thumbnail: "", size: "1.8 MB", createdAt: "昨天", projectId: "proj-002", projectName: "产品发布宣传片" },
  { id: "a5", name: "尾帧_镜头03.png", type: "last-frame", thumbnail: "", size: "4.2 MB", createdAt: "3 天前", projectId: "proj-001", projectName: "夏日咖啡广告" },
  { id: "a6", name: "首帧_角色登场.png", type: "first-frame", thumbnail: "", size: "2.7 MB", createdAt: "3 天前", projectId: "proj-003", projectName: "短视频系列 EP01" },
];

export default function AssetsPage() {
  const router = useRouter();
  const [assets] = useState<Asset[]>(mockAssets);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "first-frame" | "last-frame">("all");

  const filtered = useMemo(() => {
    let list = [...assets];
    if (search.trim()) {
      list = list.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (filterType !== "all") {
      list = list.filter((a) => a.type === filterType);
    }
    return list;
  }, [assets, search, filterType]);

  const selected = assets.find((a) => a.id === selectedAsset);

  const filterOptions = [
    { id: "all" as const, label: "全部" },
    { id: "first-frame" as const, label: "首帧" },
    { id: "last-frame" as const, label: "尾帧" },
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar with breadcrumb */}
      <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
              <FolderOpen className="w-4 h-4 text-white" />
            </div>
          </button>
          <div className="flex items-center gap-1.5 text-[13px]">
            <button onClick={() => router.push("/")} className="text-text-muted hover:text-text-secondary">我的项目</button>
            <span className="text-text-muted">/</span>
            <span className="text-text-muted">产品宣传视频</span>
            <span className="text-text-muted">/</span>
            <span className="text-text-secondary font-medium">素材库</span>
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-60 border-r border-border bg-surface flex flex-col shrink-0">
          <nav className="flex-1 p-3 space-y-1">
            {[
              { id: "projects", label: "项目", href: "/" },
              { id: "assets", label: "素材库", href: "/assets" },
              { id: "export", label: "导出", href: "/export" },
              { id: "settings", label: "设置", href: "/settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium transition-colors ${
                  item.id === "assets"
                    ? "bg-accent-dim text-accent"
                    : "text-text-secondary hover:bg-base hover:text-text-primary"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-base overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-text-primary">素材库</h1>
                <span className="text-sm text-text-muted">共 {assets.length} 张图片</span>
              </div>
              <button className="flex items-center gap-2 h-10 px-5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors">
                <Upload className="w-4 h-4" />
                上传素材
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-5">
              {filterOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFilterType(opt.id)}
                  className={`h-8 px-3 rounded-lg text-[13px] font-medium transition-colors ${
                    filterType === opt.id
                      ? "bg-accent-dim text-accent border border-accent"
                      : "bg-elevated text-text-secondary hover:bg-base"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <ImageIcon className="w-12 h-12 text-text-muted mb-4" />
                <p className="text-text-secondary mb-4">
                  {search ? "没有找到匹配的素材" : "还没有素材"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {filtered.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset.id)}
                    className={`bg-surface rounded-xl border overflow-hidden cursor-pointer hover:shadow-md transition-all group ${
                      selectedAsset === asset.id ? "border-accent shadow-md" : "border-border"
                    }`}
                  >
                    <div className="aspect-video bg-base flex items-center justify-center relative">
                      <ImageIcon className="w-8 h-8 text-text-muted" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-text-primary truncate">{asset.name}</p>
                      <p className="text-[10px] text-text-muted mt-1">{asset.size} · {asset.createdAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Right panel */}
        <aside className="w-72 border-l border-border bg-surface flex flex-col shrink-0">
          {selected ? (
            <div className="p-4 space-y-4">
              <div className="aspect-square bg-base rounded-xl flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-text-muted" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{selected.name}</h3>
              <div className="space-y-2 text-xs text-text-secondary">
                <p>类型：{selected.type === "first-frame" ? "首帧" : "尾帧"}</p>
                <p>大小：{selected.size}</p>
                <p>项目：{selected.projectName}</p>
                <p>创建：{selected.createdAt}</p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-full border border-border text-xs font-medium text-text-secondary hover:bg-base transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  下载
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-full border border-error text-xs font-medium text-error hover:bg-error/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                  删除
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-sm text-text-muted">选择素材查看详情</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
