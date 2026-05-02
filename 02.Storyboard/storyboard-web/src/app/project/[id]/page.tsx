"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { ShotCard } from "@/components/workbench/shot-card";
import { ShotEditor } from "@/components/workbench/shot-editor";
import { ScriptInput } from "@/components/workbench/script-input";
import { TaskQueue } from "@/components/workbench/task-queue";
import {
  ArrowLeft, Plus, Trash2, FolderOpen, Image, Download,
  ListTodo, Settings, CheckSquare, Square, Sparkles,
} from "lucide-react";
import { mockProjects, mockShots, mockJobs, type MockShot, type MockJob } from "@/lib/mock-data";
import { ExportDialog } from "@/components/project/export-dialog";

export default function WorkbenchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const project = mockProjects.find((p) => p.id === id) ?? mockProjects[0];

  const [shots, setShots] = useState<MockShot[]>(mockShots.filter((s) => s.projectId === "proj-001"));
  const [selectedShot, setSelectedShot] = useState<string | null>(shots[0]?.id ?? null);
  const [jobs, setJobs] = useState<MockJob[]>(mockJobs);
  const [selectedShots, setSelectedShots] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState(false);
  const [activeNav, setActiveNav] = useState("shots");
  const [showExport, setShowExport] = useState(false);

  const currentShot = shots.find((s) => s.id === selectedShot) ?? null;

  const handleShotChange = (updated: MockShot) => {
    setShots(shots.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteShot = () => {
    if (!selectedShot) return;
    const remaining = shots.filter((s) => s.id !== selectedShot);
    setShots(remaining.map((s, i) => ({ ...s, shotNumber: i + 1 })));
    setSelectedShot(remaining[0]?.id ?? null);
  };

  const handleDuplicateShot = () => {
    if (!currentShot) return;
    const newShot: MockShot = {
      ...currentShot,
      id: `shot-${Date.now()}`,
      shotNumber: shots.length + 1,
      status: "draft",
      firstFrameImagePath: undefined,
      lastFrameImagePath: undefined,
    };
    setShots([...shots, newShot]);
    setSelectedShot(newShot.id);
  };

  const handleAddShot = () => {
    const newShot: MockShot = {
      id: `shot-${Date.now()}`,
      projectId: id,
      shotNumber: shots.length + 1,
      duration: 3.0,
      shotType: "中景",
      coreContent: "",
      actionCommand: "",
      sceneSettings: "",
      firstFramePrompt: "",
      lastFramePrompt: "",
      videoPrompt: "",
      status: "draft",
    };
    setShots([...shots, newShot]);
    setSelectedShot(newShot.id);
  };

  const handleAIGenerate = (script: string, shotCount: number) => {
    const newShots: MockShot[] = Array.from({ length: shotCount }, (_, i) => ({
      id: `shot-ai-${Date.now()}-${i}`,
      projectId: id,
      shotNumber: i + 1,
      duration: 3 + Math.random() * 4,
      shotType: ["远景", "全景", "中景", "近景", "特写"][Math.floor(Math.random() * 5)],
      coreContent: `AI 生成的镜头 ${i + 1}：${script.slice(0, 30)}...`,
      actionCommand: "AI 自动生成的动作指令",
      sceneSettings: "AI 自动生成的场景设定",
      firstFramePrompt: `AI generated prompt for shot ${i + 1} first frame`,
      lastFramePrompt: `AI generated prompt for shot ${i + 1} last frame`,
      videoPrompt: `AI generated video prompt for shot ${i + 1}`,
      status: "draft" as const,
    }));
    setShots(newShots);
    setSelectedShot(newShots[0].id);
  };

  const toggleBatchSelect = (shotId: string) => {
    const next = new Set(selectedShots);
    if (next.has(shotId)) next.delete(shotId);
    else next.add(shotId);
    setSelectedShots(next);
  };

  const toggleSelectAll = () => {
    if (selectedShots.size === shots.length) setSelectedShots(new Set());
    else setSelectedShots(new Set(shots.map((s) => s.id)));
  };

  const sidebarItems = [
    { id: "shots", icon: ListTodo, label: "分镜列表" },
    { id: "assets", icon: Image, label: "素材库" },
    { id: "settings", icon: Settings, label: "项目设置" },
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar with breadcrumb */}
      <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
              <FolderOpen className="w-4 h-4 text-white" />
            </div>
          </button>
          <div className="flex items-center gap-1.5 text-sm">
            <button onClick={() => router.push("/")} className="text-text-muted hover:text-text-secondary">我的项目</button>
            <span className="text-text-muted">/</span>
            <span className="text-text-secondary font-medium">{project.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TaskQueue
            jobs={jobs}
            onRetry={(id) => setJobs(jobs.map((j) => j.id === id ? { ...j, status: "queued" as const } : j))}
            onCancel={(id) => setJobs(jobs.filter((j) => j.id !== id))}
            onRemove={(id) => setJobs(jobs.filter((j) => j.id !== id))}
          />
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-medium text-text-secondary hover:bg-base transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            导出
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-60 border-r border-border bg-surface flex flex-col shrink-0">
          <div className="p-4 border-b border-border">
            <h2 className="text-[15px] font-semibold text-text-primary truncate">{project.name}</h2>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-text-muted">画幅: {project.aspectRatio}</p>
              <p className="text-xs text-text-muted">片长: 60 秒</p>
              <p className="text-xs text-text-muted">镜头: {shots.length} 个</p>
            </div>
          </div>
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-text-muted">导航</p>
          </div>
          <nav className="flex-1 px-3 pb-3 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 h-10 rounded-xl text-xs font-medium transition-colors ${
                  activeNav === item.id
                    ? "bg-accent-dim text-accent"
                    : "text-text-secondary hover:bg-base hover:text-text-primary"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Center - Shot list */}
        <main className="flex-1 bg-base flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface">
            <h3 className="text-base font-semibold text-text-primary">分镜列表</h3>
            <div className="flex items-center gap-2">
              {batchMode && (
                <>
                  <button onClick={toggleSelectAll} className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs text-text-secondary hover:bg-base">
                    {selectedShots.size === shots.length ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                    全选
                  </button>
                  {selectedShots.size > 0 && (
                    <button className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-accent text-white text-xs font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      批量生成 ({selectedShots.size})
                    </button>
                  )}
                  <button onClick={() => { setBatchMode(false); setSelectedShots(new Set()); }} className="text-xs text-text-muted hover:text-text-secondary">
                    取消
                  </button>
                </>
              )}
              {!batchMode && (
                <>
                  <ScriptInput onGenerate={handleAIGenerate} />
                  <button
                    onClick={() => setBatchMode(true)}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-border text-xs font-medium text-text-secondary hover:bg-base"
                  >
                    批量选择
                  </button>
                  <button
                    onClick={handleAddShot}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    添加镜头
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-5 space-y-2.5">
            {shots.map((shot) => (
              <div key={shot.id} className="relative">
                {batchMode && (
                  <button
                    onClick={() => toggleBatchSelect(shot.id)}
                    className="absolute -left-1 top-5 z-10"
                  >
                    {selectedShots.has(shot.id) ? (
                      <CheckSquare className="w-5 h-5 text-accent" />
                    ) : (
                      <Square className="w-5 h-5 text-text-muted" />
                    )}
                  </button>
                )}
                <ShotCard
                  shot={shot}
                  selected={selectedShot === shot.id}
                  onClick={() => setSelectedShot(shot.id)}
                />
              </div>
            ))}
          </div>
        </main>

        {/* Right - Shot editor */}
        <aside className="w-[360px] border-l border-border bg-surface flex flex-col shrink-0 overflow-hidden">
          <ShotEditor
            shot={currentShot}
            onChange={handleShotChange}
            onDelete={handleDeleteShot}
            onDuplicate={handleDuplicateShot}
          />
        </aside>
      </div>

      <ExportDialog
        open={showExport}
        onClose={() => setShowExport(false)}
        projectName={project.name}
      />
    </div>
  );
}
