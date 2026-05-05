"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useShots } from "@/hooks/use-shots";
import { useProjects } from "@/hooks/use-projects";
import { Image, Download, Filter, Grid, List, Loader2, ArrowLeft, FolderOpen, Check } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import type { Shot } from "@/types/shot";

type FilterType = "all" | "first-frame" | "last-frame";

export default function AssetsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { projects } = useProjects();
  const { shots, isLoading, fetchShots } = useShots();

  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const project = projects.find((p) => p.id === id);

  useEffect(() => {
    fetchShots(id);
  }, [id, fetchShots]);

  // Collect assets from shots
  const assets: { id: string; type: "first-frame" | "last-frame"; shot: Shot; path: string }[] = [];
  shots.forEach((shot) => {
    if (shot.firstFrameImagePath) {
      assets.push({
        id: `${shot.id}-first`,
        type: "first-frame",
        shot,
        path: shot.firstFrameImagePath,
      });
    }
    if (shot.lastFrameImagePath) {
      assets.push({
        id: `${shot.id}-last`,
        type: "last-frame",
        shot,
        path: shot.lastFrameImagePath,
      });
    }
  });

  const filteredAssets = filter === "all" ? assets : assets.filter((a) => a.type === filter);

  const toggleSelect = (assetId: string) => {
    const next = new Set(selectedAssets);
    if (next.has(assetId)) next.delete(assetId);
    else next.add(assetId);
    setSelectedAssets(next);
  };

  const handleDownload = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (asset) {
      // Download via opening the URL
      window.open(asset.path, "_blank");
    }
  };

  const handleBatchDownload = () => {
    selectedAssets.forEach((assetId) => {
      handleDownload(assetId);
    });
  };

  if (!project) {
    return (
      <AuthGuard>
        <div className="h-screen flex items-center justify-center bg-base">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      </AuthGuard>
    );
  }

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
                <h2 className="text-lg font-bold text-text-primary mb-3">素材库</h2>
                <button
                  onClick={() => router.push(`/project/${id}`)}
                  className="w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium text-text-secondary hover:bg-base transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回工作台
                </button>
                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-semibold text-text-muted mb-2">筛选</p>
                  {(["all", "first-frame", "last-frame"] as FilterType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`w-full flex items-center gap-3 px-3 h-9 rounded-xl text-xs font-medium transition-colors ${
                        filter === f
                          ? "bg-accent-dim text-accent"
                          : "text-text-secondary hover:bg-base"
                      }`}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      {f === "all" ? "全部" : f === "first-frame" ? "首帧" : "尾帧"}
                    </button>
                  ))}
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-text-muted">
                    共 {assets.length} 张图片
                  </p>
                  <p className="text-xs text-text-muted">
                    已选 {selectedAssets.size} 张
                  </p>
                </div>
              </nav>

              {/* Content */}
              <div className="flex-1 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-text-primary">{project.name} - 素材库</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-surface rounded-full p-1">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-full transition-colors ${viewMode === "grid" ? "bg-accent text-white" : "text-text-muted hover:bg-base"}`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-full transition-colors ${viewMode === "list" ? "bg-accent text-white" : "text-text-muted hover:bg-base"}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                    {selectedAssets.size > 0 && (
                      <button
                        onClick={handleBatchDownload}
                        className="flex items-center gap-2 h-9 px-4 rounded-full bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        下载选中 ({selectedAssets.size})
                      </button>
                    )}
                  </div>
                </div>

                {/* Assets grid/list */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                  </div>
                ) : filteredAssets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Image className="w-12 h-12 text-text-muted mb-4" />
                    <p className="text-text-secondary mb-2">暂无素材</p>
                    <p className="text-xs text-text-muted">生成首尾帧图片后，素材会自动出现在这里</p>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-4 gap-4">
                    {filteredAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className={`relative bg-surface rounded-xl border border-border overflow-hidden cursor-pointer transition-all ${
                          selectedAssets.has(asset.id) ? "ring-2 ring-accent" : "hover:shadow-md"
                        }`}
                        onClick={() => toggleSelect(asset.id)}
                      >
                        <div className="aspect-video bg-base relative">
                          <img
                            src={asset.path}
                            alt={`${asset.shot.shotNumber} ${asset.type === "first-frame" ? "首帧" : "尾帧"}`}
                            className="w-full h-full object-cover"
                          />
                          {selectedAssets.has(asset.id) && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-medium text-text-primary">
                            镜头 #{asset.shot.shotNumber}
                          </p>
                          <p className="text-xs text-text-muted">
                            {asset.type === "first-frame" ? "首帧" : "尾帧"}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(asset.id);
                          }}
                          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-base hover:bg-accent hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className={`flex items-center gap-4 bg-surface rounded-xl border border-border p-4 cursor-pointer transition-all ${
                          selectedAssets.has(asset.id) ? "ring-2 ring-accent" : "hover:bg-base"
                        }`}
                        onClick={() => toggleSelect(asset.id)}
                      >
                        <div className="w-24 h-16 rounded-lg overflow-hidden bg-base shrink-0">
                          <img
                            src={asset.path}
                            alt={`${asset.shot.shotNumber} ${asset.type === "first-frame" ? "首帧" : "尾帧"}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">
                            镜头 #{asset.shot.shotNumber} - {asset.type === "first-frame" ? "首帧" : "尾帧"}
                          </p>
                          <p className="text-xs text-text-muted truncate">
                            {asset.shot.coreContent}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(asset.id);
                          }}
                          className="w-10 h-10 rounded-full bg-base hover:bg-accent hover:text-white flex items-center justify-center transition-colors shrink-0"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}