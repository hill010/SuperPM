"use client";

import { useState } from "react";
import { X, FileText, Archive, Image as ImageIcon, Check, Loader2 } from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  projectName?: string;
}

type ExportFormat = "pdf" | "csv" | "images";

const formatOptions: { id: ExportFormat; icon: typeof FileText; label: string }[] = [
  { id: "pdf", icon: FileText, label: "PDF 文档" },
  { id: "csv", icon: Archive, label: "CSV 表格" },
  { id: "images", icon: ImageIcon, label: "图片包" },
];

const previewLines = [
  { text: "# 分镜表 - 产品宣传视频", style: "text-sm font-bold text-text-primary" },
  { text: "## #01 远景 | 3.0s", style: "text-[13px] font-semibold text-accent" },
  { text: "城市天际线全景，晨光中的现代化建筑群", style: "text-xs text-text-secondary" },
  { text: "## #02 中景 | 2.5s", style: "text-[13px] font-semibold text-accent" },
  { text: "镜头推进，展现办公大楼外观细节", style: "text-xs text-text-secondary" },
  { text: "## #03 近景 | 2.0s", style: "text-[13px] font-semibold text-accent" },
  { text: "主角走进办公室，打开电脑开始工作", style: "text-xs text-text-secondary" },
];

export function ExportDialog({ open, onClose, projectName = "产品宣传视频" }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [includePrompts, setIncludePrompts] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [exportStatus, setExportStatus] = useState<"idle" | "preparing" | "done">("idle");

  if (!open) return null;

  const handleExport = async () => {
    setExportStatus("preparing");
    await new Promise((r) => setTimeout(r, 2000));
    setExportStatus("done");
    setTimeout(() => {
      setExportStatus("idle");
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl border border-border w-[560px] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-lg font-bold text-text-primary">导出分镜</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-base flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 space-y-5">
          {/* Format selector */}
          <div>
            <p className="text-[13px] font-medium text-text-secondary mb-3">导出格式</p>
            <div className="grid grid-cols-3 gap-3">
              {formatOptions.map((format) => {
                const Icon = format.icon;
                const isSelected = selectedFormat === format.id;
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`flex flex-col items-center justify-center gap-2 h-20 rounded-xl border transition-colors ${
                      isSelected
                        ? "bg-accent-dim border-accent"
                        : "bg-elevated border-border hover:border-accent/50"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? "text-accent" : "text-text-muted"}`} />
                    <span className={`text-xs font-medium ${isSelected ? "text-accent" : "text-text-primary"}`}>
                      {format.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div>
            <p className="text-[13px] font-medium text-text-secondary mb-3">预览内容</p>
            <div className="rounded-xl border border-border bg-base p-4 space-y-2 h-[200px] overflow-hidden">
              {previewLines.map((line, i) => (
                <p key={i} className={line.style}>{line.text}</p>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includePrompts}
                onChange={(e) => setIncludePrompts(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-accent"
              />
              <span className="text-sm text-text-primary">包含提示词</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-accent"
              />
              <span className="text-sm text-text-primary">包含元数据</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-5 mt-5 border-t border-border">
          <button
            onClick={onClose}
            className="h-11 px-5 rounded-full text-sm font-medium text-text-secondary hover:bg-base transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={exportStatus !== "idle"}
            className="flex items-center gap-2 h-11 px-6 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {exportStatus === "preparing" && (
              <><Loader2 className="w-4 h-4 animate-spin" /> 导出中...</>
            )}
            {exportStatus === "done" && (
              <><Check className="w-4 h-4" /> 导出完成</>
            )}
            {exportStatus === "idle" && "下载文件"}
          </button>
        </div>
      </div>
    </div>
  );
}
