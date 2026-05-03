"use client";

import { useState } from "react";
import { X, FileText, Archive, Download, Check, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  projectName?: string;
  projectId?: string;
}

type ExportFormat = "markdown" | "csv" | "pdf";

const formatOptions: { id: ExportFormat; icon: typeof FileText; label: string }[] = [
  { id: "markdown", icon: FileText, label: "Markdown" },
  { id: "csv", icon: Archive, label: "CSV 表格" },
  { id: "pdf", icon: FileText, label: "PDF 文档" },
];

export function ExportDialog({ open, onClose, projectName = "分镜项目", projectId }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("markdown");
  const [exportStatus, setExportStatus] = useState<"idle" | "preparing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleExport = async () => {
    if (!projectId) {
      setError("项目 ID 缺失");
      return;
    }

    setExportStatus("preparing");
    setError(null);

    try {
      const response = await api.get(`/api/export/project/${projectId}`, {
        params: { format: selectedFormat },
        responseType: "blob",
      });

      // Create download link
      const blob = new Blob([response.data], { type: response.headers["content-type"] as string | undefined });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers["content-disposition"];
      let filename = `${projectName}_分镜表.${selectedFormat === "csv" ? "csv" : selectedFormat === "pdf" ? "pdf" : "md"}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportStatus("done");
      setTimeout(() => {
        setExportStatus("idle");
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setExportStatus("error");
      setError("导出失败，请重试");
      setTimeout(() => {
        setExportStatus("idle");
        setError(null);
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl border border-border w-[480px] shadow-xl overflow-hidden">
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
                        : "bg-base border-border hover:border-accent/50"
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

          {/* Info */}
          <div className="p-4 rounded-xl bg-base text-sm text-text-secondary">
            <p><strong>Markdown</strong>: 适合在笔记软件中查看和编辑</p>
            <p><strong>CSV</strong>: 适合在 Excel 或 Google Sheets 中编辑</p>
            <p><strong>PDF</strong>: 适合打印和分享</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-error/10 text-error text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-5 mt-2 border-t border-border">
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
            {exportStatus === "error" && (
              <>导出失败</>
            )}
            {exportStatus === "idle" && (
              <><Download className="w-4 h-4" /> 下载文件</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}