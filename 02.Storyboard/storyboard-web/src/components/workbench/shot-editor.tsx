"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Sparkles, Copy, Trash2, Check } from "lucide-react";
import type { MockShot } from "@/lib/mock-data";

interface ShotEditorProps {
  shot: MockShot | null;
  onChange: (shot: MockShot) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-primary hover:bg-base/50"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function Field({ label, value, onChange, multiline = false, placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-9 px-3 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
      )}
    </div>
  );
}

export function ShotEditor({ shot, onChange, onDelete, onDuplicate }: ShotEditorProps) {
  const [local, setLocal] = useState<MockShot | null>(shot);
  const [model, setModel] = useState("Flux Pro");

  useEffect(() => { setLocal(shot); }, [shot]);

  if (!local) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-sm text-text-muted">选择镜头查看详情</p>
      </div>
    );
  }

  const update = (field: keyof MockShot, value: string | number) => {
    const updated = { ...local, [field]: value };
    setLocal(updated);
    onChange(updated);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">镜头编辑</span>
          <span className="text-sm font-bold text-accent">
            #{String(local.shotNumber).padStart(2, "0")}
          </span>
        </div>
        <div className="flex gap-1">
          <button onClick={onDuplicate} className="w-7 h-7 rounded-lg hover:bg-base flex items-center justify-center" title="复制">
            <Copy className="w-3.5 h-3.5 text-text-muted" />
          </button>
          <button onClick={onDelete} className="w-7 h-7 rounded-lg hover:bg-error/10 flex items-center justify-center" title="删除">
            <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-error" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        <Section title="基础信息">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">景别</label>
              <select
                value={local.shotType}
                onChange={(e) => update("shotType", e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                {["远景", "全景", "中景", "近景", "特写"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <Field label="时长 (s)" value={String(local.duration)} onChange={(v) => update("duration", parseFloat(v) || 0)} />
          </div>
          <Field label="核心内容" value={local.coreContent} onChange={(v) => update("coreContent", v)} multiline placeholder="描述这个镜头的核心画面" />
        </Section>

        <Section title="首帧参数" defaultOpen={false}>
          <Field label="生成提示词" value={local.firstFramePrompt} onChange={(v) => update("firstFramePrompt", v)} multiline placeholder="城市天际线，夕阳，暖色调..." />
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">模型</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              {["Flux Pro", "Flux Dev", "Stable Diffusion XL", "Midjourney"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <button className="w-full flex items-center justify-center gap-2 h-10 rounded-full bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            生成首帧
          </button>
        </Section>

        <Section title="尾帧参数" defaultOpen={false}>
          <Field label="尾帧提示词" value={local.lastFramePrompt} onChange={(v) => update("lastFramePrompt", v)} multiline placeholder="Last frame image prompt" />
          <button className="w-full flex items-center justify-center gap-2 h-10 rounded-full bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            生成尾帧
          </button>
        </Section>

        <Section title="视频提示词草稿" defaultOpen={false}>
          <Field label="视频提示词" value={local.videoPrompt} onChange={(v) => update("videoPrompt", v)} multiline placeholder="镜头缓慢推进，从全景到..." />
        </Section>
      </div>

      {/* Auto-save indicator */}
      <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-border">
        <Check className="w-3.5 h-3.5 text-success" />
        <span className="text-xs text-text-muted">自动保存已开启</span>
      </div>
    </div>
  );
}
