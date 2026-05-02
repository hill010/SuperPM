"use client";

import { Clock, Film, Check, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";
import type { MockShot } from "@/lib/mock-data";

interface ShotCardProps {
  shot: MockShot;
  selected: boolean;
  onClick: () => void;
}

const statusConfig = {
  draft: { label: "草稿", color: "text-text-muted bg-base", icon: Film },
  queued: { label: "排队中", color: "text-warning bg-warning/10", icon: Clock },
  generating: { label: "生成中", color: "text-accent bg-accent-dim", icon: Loader2 },
  generated: { label: "已生成", color: "text-success bg-success/10", icon: Check },
  failed: { label: "失败", color: "text-error bg-error/10", icon: AlertCircle },
};

export function ShotCard({ shot, selected, onClick }: ShotCardProps) {
  const status = statusConfig[shot.status];
  const StatusIcon = status.icon;

  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-3xl border p-5 cursor-pointer transition-all ${
        selected
          ? "border-accent shadow-md ring-1 ring-accent/20"
          : "border-border hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-accent bg-accent-dim px-2 py-0.5 rounded-full">
            #{String(shot.shotNumber).padStart(2, "0")}
          </span>
          <span className="text-xs text-text-muted">{shot.shotType}</span>
          <span className="text-xs text-text-muted flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {shot.duration}s
          </span>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
          <StatusIcon className={`w-3 h-3 ${shot.status === "generating" ? "animate-spin" : ""}`} />
          {status.label}
        </div>
      </div>

      <p className="text-sm text-text-primary leading-relaxed mb-3 line-clamp-2">
        {shot.coreContent}
      </p>

      <div className="flex gap-2">
        <div className="flex-1 aspect-video bg-base rounded-xl flex items-center justify-center overflow-hidden">
          {shot.firstFrameImagePath ? (
            <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-accent/40" />
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon className="w-4 h-4 text-text-muted mx-auto mb-1" />
              <span className="text-[10px] text-text-muted">首帧</span>
            </div>
          )}
        </div>
        <div className="flex-1 aspect-video bg-base rounded-xl flex items-center justify-center overflow-hidden">
          {shot.lastFrameImagePath ? (
            <div className="w-full h-full bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-success/40" />
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon className="w-4 h-4 text-text-muted mx-auto mb-1" />
              <span className="text-[10px] text-text-muted">尾帧</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
