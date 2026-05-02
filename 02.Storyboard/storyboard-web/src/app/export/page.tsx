"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightPanel } from "@/components/layout/right-panel";
import {
  Download, FileText, Image as ImageIcon, Film, FilmIcon,
  Check, Loader2, ChevronDown, Settings, Archive,
} from "lucide-react";
import { mockProjects } from "@/lib/mock-data";

type ExportFormat = "pdf" | "csv" | "images" | "video";
type ExportStatus = "idle" | "preparing" | "exporting" | "done";

const formatOptions: { id: ExportFormat; icon: typeof FileText; label: string; desc: string }[] = [
  { id: "pdf", icon: FileText, label: "PDF 文档", desc: "分镜脚本 + 图片，适合打印和分享" },
  { id: "csv", icon: Archive, label: "CSV 表格", desc: "分镜数据表格，适合导入其他工具" },
  { id: "images", icon: ImageIcon, label: "图片包", desc: "所有首帧/尾帧图片打包下载" },
  { id: "video", icon: Film, label: "视频预览", desc: "将分镜串联为预览视频（Beta）" },
];

export default function ExportPage() {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]?.id ?? "");
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [includePrompts, setIncludePrompts] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");

  const project = mockProjects.find((p) => p.id === selectedProject);

  const handleExport = async () => {
    setExportStatus("preparing");
    await new Promise((r) => setTimeout(r, 1500));
    setExportStatus("exporting");
    await new Promise((r) => setTimeout(r, 2000));
    setExportStatus("done");
    setTimeout(() => setExportStatus("idle"), 3000);
  };

  const formatLabel = formatOptions.find((f) => f.id === selectedFormat)?.label ?? "";

  return (
    <div className="h-screen flex flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <main className="flex-1 bg-base overflow-auto p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-xl font-semibold text-text-primary mb-6">导出</h1>

            <div className="space-y-6">
              {/* Project selector */}
              <div className="bg-surface rounded-2xl border border-border p-6">
                <h3 className="text-sm font-semibold text-text-primary mb-4">选择项目</h3>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:border-accent"
                >
                  {mockProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}（{p.shotCount} 个镜头）
                    </option>
                  ))}
                </select>
              </div>

              {/* Format selector */}
              <div className="bg-surface rounded-2xl border border-border p-6">
                <h3 className="text-sm font-semibold text-text-primary mb-4">导出格式</h3>
                <div className="grid grid-cols-2 gap-3">
                  {formatOptions.map((format) => {
                    const Icon = format.icon;
                    return (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={`p-4 rounded-xl border text-left transition-colors ${
                          selectedFormat === format.id
                            ? "border-accent bg-accent-dim"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={`w-5 h-5 ${selectedFormat === format.id ? "text-accent" : "text-text-muted"}`} />
                          <span className={`text-sm font-medium ${selectedFormat === format.id ? "text-accent" : "text-text-primary"}`}>
                            {format.label}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">{format.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Export options */}
              <div className="bg-surface rounded-2xl border border-border p-6">
                <h3 className="text-sm font-semibold text-text-primary mb-4">导出选项</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePrompts}
                      onChange={(e) => setIncludePrompts(e.target.checked)}
                      className="w-4 h-4 rounded border-border accent-accent"
                    />
                    <div>
                      <p className="text-sm text-text-primary">包含提示词</p>
                      <p className="text-xs text-text-muted">在导出文件中包含首帧/尾帧/视频提示词</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMetadata}
                      onChange={(e) => setIncludeMetadata(e.target.checked)}
                      className="w-4 h-4 rounded border-border accent-accent"
                    />
                    <div>
                      <p className="text-sm text-text-primary">包含元数据</p>
                      <p className="text-xs text-text-muted">镜头类型、时长、场景设定等信息</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Export button */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-text-muted">
                  {project && (
                    <span>
                      {project.name} · {project.shotCount} 个镜头 · {formatLabel}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleExport}
                  disabled={exportStatus !== "idle"}
                  className="flex items-center gap-2 h-11 px-6 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {exportStatus === "preparing" && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      准备中...
                    </>
                  )}
                  {exportStatus === "exporting" && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      导出中...
                    </>
                  )}
                  {exportStatus === "done" && (
                    <>
                      <Check className="w-4 h-4" />
                      导出完成
                    </>
                  )}
                  {exportStatus === "idle" && (
                    <>
                      <Download className="w-4 h-4" />
                      开始导出
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
        <RightPanel>
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">导出说明</h3>
            <div className="space-y-3 text-xs text-text-secondary">
              <p>PDF 格式包含完整的分镜脚本和图片预览，适合打印或发送给团队成员。</p>
              <p>CSV 格式可以导入 Excel 或其他项目管理工具。</p>
              <p>图片包会将所有生成的首帧和尾帧打包为 ZIP 文件。</p>
              <p>视频预览功能目前处于 Beta 阶段，仅支持基本的幻灯片串联。</p>
            </div>
          </div>
        </RightPanel>
      </div>
    </div>
  );
}
