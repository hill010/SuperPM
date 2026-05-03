"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

interface ScriptInputProps {
  projectId: string;
  onGenerateComplete: () => void;
}

interface GenerationJob {
  id: string;
  status: string;
  creditsUsed: number;
  error?: string;
}

export function ScriptInput({ projectId, onGenerateComplete }: ScriptInputProps) {
  const { user, refreshUser } = useAuth();
  const [script, setScript] = useState("");
  const [shotCount, setShotCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const creditsNeeded = shotCount * 10;
  const hasEnoughCredits = (user?.credits ?? 0) >= creditsNeeded;

  useEffect(() => {
    if (!jobId) return;

    // Poll for job status
    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(`/api/storyboard/jobs/${jobId}`);
        const job: GenerationJob = response.data;

        if (job.status === "succeeded") {
          setLoading(false);
          setJobId(null);
          setShow(false);
          setScript("");
          await refreshUser();
          onGenerateComplete();
          clearInterval(pollInterval);
        } else if (job.status === "failed") {
          setLoading(false);
          setJobId(null);
          setError(job.error || "生成失败");
          await refreshUser();
          clearInterval(pollInterval);
        }
      } catch {
        // Continue polling on error
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [jobId, onGenerateComplete, refreshUser]);

  const handleGenerate = async () => {
    if (!script.trim() || !hasEnoughCredits) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/api/storyboard/project/${projectId}/generate`, {
        script: script.trim(),
        shotCount,
      });

      const job: GenerationJob = response.data;
      setJobId(job.id);
    } catch (err: unknown) {
      setLoading(false);
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "提交失败，请重试");
    }
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
        <button onClick={() => { setShow(false); setError(null); }} className="text-xs text-text-muted hover:text-text-secondary">
          收起
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-3 rounded-xl bg-error/10 text-error text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

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
          disabled={loading || !script.trim() || !hasEnoughCredits}
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

      <p className={`text-[11px] mt-2 ${hasEnoughCredits ? "text-text-muted" : "text-error"}`}>
        消耗 {creditsNeeded} 积分 · 当前余额 {user?.credits?.toLocaleString() ?? 0} 积分
        {!hasEnoughCredits && " · 余额不足"}
      </p>
    </div>
  );
}