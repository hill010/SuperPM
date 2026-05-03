"use client";

import Image from "next/image";
import { Clock, Film, Check, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";
import type { Shot } from "@/types/shot";

interface ShotCardProps {
  shot: Shot;
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

type ShotStatus = keyof typeof statusConfig;

function getShotStatus(shot: Shot): ShotStatus {
  if (shot.firstFrameImagePath || shot.lastFrameImagePath) return "generated";
  return "draft";
}

export function ShotCard({ shot, selected, onClick }: ShotCardProps) {
  const status = statusConfig[getShotStatus(shot)];
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
          <span className="text-xs text-text-muted">{shot.shotType || "未设置"}</span>
          <span className="text-xs text-text-muted flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {shot.duration}s
          </span>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
          <StatusIcon className={`w-3 h-3 ${getShotStatus(shot) === "generating" ? "animate-spin" : ""}`} />
          {status.label}
        </div>
      </div>

      <p className="text-sm text-text-primary leading-relaxed mb-3 line-clamp-2">
        {shot.coreContent || "未填写核心内容"}
      </p>

      <div className="flex gap-2">
        <div className="flex-1 aspect-video bg-base rounded-xl flex items-center justify-center overflow-hidden relative">
          {shot.firstFrameImagePath ? (
            <Image
              src={shot.firstFrameImagePath}
              alt="首帧"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="text-center">
              <ImageIcon className="w-4 h-4 text-text-muted mx-auto mb-1" />
              <span className="text-[10px] text-text-muted">首帧</span>
            </div>
          )}
        </div>
        <div className="flex-1 aspect-video bg-base rounded-xl flex items-center justify-center overflow-hidden relative">
          {shot.lastFrameImagePath ? (
            <Image
              src={shot.lastFrameImagePath}
              alt="尾帧"
              fill
              className="object-cover"
              unoptimized
            />
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