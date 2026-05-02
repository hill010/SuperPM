"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    aspectRatio: string;
    targetDuration: string;
    creativeGoal: string;
    targetAudience: string;
    videoTone: string;
  }) => void;
}

export function CreateProjectDialog({ open, onClose, onSubmit }: CreateProjectDialogProps) {
  const [name, setName] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [targetDuration, setTargetDuration] = useState("");
  const [creativeGoal, setCreativeGoal] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [videoTone, setVideoTone] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      aspectRatio,
      targetDuration,
      creativeGoal,
      targetAudience,
      videoTone,
    });
    setName("");
    setTargetDuration("");
    setCreativeGoal("");
    setTargetAudience("");
    setVideoTone("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-3xl border border-border w-[520px] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-lg font-bold text-text-primary">新建项目</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-base flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">项目名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入项目名称"
              className="w-full h-12 px-4 rounded-xl border border-border bg-surface text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">画幅比例</label>
            <div className="flex gap-2">
              {["16:9", "9:16", "1:1", "4:3"].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-4 h-10 rounded-xl text-sm font-medium transition-colors ${
                    aspectRatio === ratio
                      ? "bg-accent text-white"
                      : "bg-base text-text-secondary hover:bg-elevated"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">目标片长（秒）</label>
            <input
              type="text"
              value={targetDuration}
              onChange={(e) => setTargetDuration(e.target.value)}
              placeholder="例如：60"
              className="w-full h-12 px-4 rounded-xl border border-border bg-surface text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">创作目标</label>
            <input
              type="text"
              value={creativeGoal}
              onChange={(e) => setCreativeGoal(e.target.value)}
              placeholder="为什么拍这个视频？"
              className="w-full h-12 px-4 rounded-xl border border-border bg-surface text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">目标受众</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="这个视频给谁看？"
              className="w-full h-12 px-4 rounded-xl border border-border bg-surface text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">视频基调</label>
            <input
              type="text"
              value={videoTone}
              onChange={(e) => setVideoTone(e.target.value)}
              placeholder="例如：温馨、专业、幽默"
              className="w-full h-12 px-4 rounded-xl border border-border bg-surface text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-5 mt-4 border-t border-border">
          <button
            onClick={onClose}
            className="h-11 px-5 rounded-full text-sm font-medium text-text-secondary hover:bg-base transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="h-11 px-6 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            创建项目
          </button>
        </div>
      </div>
    </div>
  );
}
