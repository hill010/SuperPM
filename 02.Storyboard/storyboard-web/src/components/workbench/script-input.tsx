"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface ScriptInputProps {
  onGenerate: (script: string, shotCount: number) => void;
}

export function ScriptInput({ onGenerate }: ScriptInputProps) {
  const [script, setScript] = useState("");
  const [shotCount, setShotCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleGenerate = async () => {
    if (!script.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    onGenerate(script, shotCount);
    setShow(false);
    setScript("");
  };

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-2 h-9 px-4 rounded-full bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        AI 拆镜
      </button>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary">AI 脚本拆镜</h3>
        <button onClick={() => setShow(false)} className="text-xs text-text-muted hover:text-text-secondary">
          收起
        </button>
      </div>

      <textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="粘贴你的脚本文本，AI 将自动拆解为分镜列表..."
        rows={6}
        className="w-full px-4 py-3 rounded-xl border border-border bg-base text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none mb-3"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-secondary">期望镜头数</label>
          <input
            type="number"
            value={shotCount}
            onChange={(e) => setShotCount(parseInt(e.target.value) || 6)}
            min={3}
            max={30}
            className="w-16 h-8 px-2 rounded-lg border border-border bg-surface text-sm text-center text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !script.trim()}
          className="flex items-center gap-2 h-9 px-4 rounded-full bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors disabled:opacity-40"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              拆镜中...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              生成分镜
            </>
          )}
        </button>
      </div>

      <p className="text-[11px] text-text-muted mt-2">消耗 10 积分 · 当前余额 120 积分</p>
    </div>
  );
}
