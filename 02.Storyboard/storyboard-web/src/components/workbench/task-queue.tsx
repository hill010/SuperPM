"use client";

import { useState } from "react";
import { X, Check, Loader2, Clock, AlertCircle, RotateCcw } from "lucide-react";
import type { MockJob } from "@/lib/mock-data";

interface TaskQueueProps {
  jobs: MockJob[];
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
  onRemove: (id: string) => void;
}

const typeLabels: Record<string, string> = {
  "text-storyboard": "文本拆镜",
  "first-frame": "首帧生成",
  "last-frame": "尾帧生成",
  "batch": "批量生成",
};

const statusConfig = {
  queued: { label: "排队中", color: "text-warning", bg: "bg-warning/10", badgeFill: "$warning" },
  running: { label: "执行中", color: "text-accent", bg: "bg-accent-dim", badgeFill: "$accent" },
  succeeded: { label: "成功", color: "text-success", bg: "bg-success/10", badgeFill: "$success" },
  failed: { label: "失败", color: "text-error", bg: "bg-error/10", badgeFill: "$error" },
};

export function TaskQueue({ jobs, onRetry, onCancel, onRemove }: TaskQueueProps) {
  const [open, setOpen] = useState(false);
  const runningCount = jobs.filter((j) => j.status === "running" || j.status === "queued").length;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 h-9 px-4 rounded-full border border-border text-xs font-medium text-text-secondary hover:bg-base transition-colors"
      >
        任务队列
        {runningCount > 0 && (
          <span className="flex items-center gap-1 text-accent">
            <Loader2 className="w-3 h-3 animate-spin" />
            {runningCount}
          </span>
        )}
      </button>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[400px] bg-surface border-l border-border flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-text-primary">任务队列</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-base flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            {/* Task list */}
            <div className="flex-1 overflow-auto">
              {jobs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-text-muted">暂无任务</div>
              ) : (
                jobs.map((job) => {
                  const st = statusConfig[job.status];
                  return (
                    <div key={job.id} className="px-5 py-4 border-b border-border space-y-2.5">
                      {/* Title row */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-text-primary">
                          #{String(job.shotNumber ?? 0).padStart(2, "0")} {typeLabels[job.type]}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>
                          {st.label}
                        </span>
                      </div>

                      {/* Info row */}
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span>创建: {job.createdAt}</span>
                        {job.completedAt && <span>完成: {job.completedAt}</span>}
                      </div>

                      {/* Progress bar for running */}
                      {job.status === "running" && (
                        <div className="h-1 rounded bg-base overflow-hidden">
                          <div className="h-full w-2/3 rounded bg-accent" />
                        </div>
                      )}

                      {/* Error for failed */}
                      {job.status === "failed" && job.error && (
                        <p className="text-xs text-error">错误: {job.error}</p>
                      )}

                      {/* Cost for succeeded */}
                      {job.status === "succeeded" && job.creditsUsed > 0 && (
                        <p className="text-xs text-text-muted">消耗: {job.creditsUsed} 积分</p>
                      )}

                      {/* Actions */}
                      {job.status === "failed" && (
                        <button
                          onClick={() => onRetry(job.id)}
                          className="text-xs font-medium text-accent hover:underline"
                        >
                          重试
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
