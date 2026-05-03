"use client";

import { useState, use, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShotCard } from "@/components/workbench/shot-card";
import { ShotEditor } from "@/components/workbench/shot-editor";
import { ScriptInput } from "@/components/workbench/script-input";
import { TaskQueue } from "@/components/workbench/task-queue";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useShots } from "@/hooks/use-shots";
import { useProjects } from "@/hooks/use-projects";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft, Plus, Trash2, FolderOpen, Image, Download,
  ListTodo, Settings, CheckSquare, Square, Sparkles, Loader2,
} from "lucide-react";
import { ExportDialog } from "@/components/project/export-dialog";
import { useAuth } from "@/lib/auth-context";
import type { Shot } from "@/types/shot";

const CREDIT_COST_FIRST_FRAME = 30;
const CREDIT_COST_LAST_FRAME = 30;

interface SortableShotCardProps {
  shot: Shot;
  selected: boolean;
  batchMode: boolean;
  selectedInBatch: boolean;
  onClick: () => void;
  onToggleBatch: () => void;
}

function SortableShotCard({ shot, selected, batchMode, selectedInBatch, onClick, onToggleBatch }: SortableShotCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: shot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative flex items-center gap-2">
      <button {...attributes} {...listeners} className="shrink-0 cursor-grab active:cursor-grabbing p-1 hover:bg-base rounded">
        <GripVertical className="w-4 h-4 text-text-muted" />
      </button>
      {batchMode && (
        <button onClick={onToggleBatch} className="shrink-0">
          {selectedInBatch ? (
            <CheckSquare className="w-5 h-5 text-accent" />
          ) : (
            <Square className="w-5 h-5 text-text-muted" />
          )}
        </button>
      )}
      <div className="flex-1">
        <ShotCard shot={shot} selected={selected} onClick={onClick} />
      </div>
    </div>
  );
}

interface MockJob {
  id: string;
  type: "text-storyboard" | "first-frame" | "last-frame" | "batch";
  status: "queued" | "running" | "succeeded" | "failed";
  shotId?: string;
  shotNumber?: number;
  creditsUsed: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export default function WorkbenchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, deductCredits } = useAuth();
  const { projects } = useProjects();
  const {
    shots,
    isLoading,
    fetchShots,
    createShot,
    updateShot,
    deleteShot,
    duplicateShot,
    reorderShots,
  } = useShots();

  const [selectedShot, setSelectedShot] = useState<string | null>(null);
  const [jobs, setJobs] = useState<MockJob[]>([]);
  const [selectedShots, setSelectedShots] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState(false);
  const [activeNav, setActiveNav] = useState("shots");
  const [showExport, setShowExport] = useState(false);

  const project = projects.find((p) => p.id === id);

  useEffect(() => {
    fetchShots(id);
  }, [id, fetchShots]);

  useEffect(() => {
    if (shots.length > 0 && !selectedShot) {
      setSelectedShot(shots[0].id);
    }
  }, [shots, selectedShot]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = shots.findIndex((s) => s.id === active.id);
      const newIndex = shots.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(shots, oldIndex, newIndex);

      // Optimistic update
      const orderedIds = reordered.map((s) => s.id);
      await reorderShots(id, orderedIds);
    }
  };

  const handleGenerateFirstFrame = (): boolean => {
    if (!user || user.credits < CREDIT_COST_FIRST_FRAME) return false;
    return deductCredits(CREDIT_COST_FIRST_FRAME);
  };

  const handleGenerateLastFrame = (): boolean => {
    if (!user || user.credits < CREDIT_COST_LAST_FRAME) return false;
    return deductCredits(CREDIT_COST_LAST_FRAME);
  };

  const currentShot = shots.find((s) => s.id === selectedShot) ?? null;

  const handleShotChange = async (updated: Shot) => {
    await updateShot(updated.id, {
      shotType: updated.shotType,
      duration: updated.duration,
      coreContent: updated.coreContent,
      firstFramePrompt: updated.firstFramePrompt,
      lastFramePrompt: updated.lastFramePrompt,
      videoPrompt: updated.videoPrompt,
    });
  };

  const handleDeleteShot = async () => {
    if (!selectedShot) return;
    await deleteShot(selectedShot);
    const remaining = shots.filter((s) => s.id !== selectedShot);
    setSelectedShot(remaining[0]?.id ?? null);
  };

  const handleDuplicateShot = async () => {
    if (!currentShot) return;
    const result = await duplicateShot(currentShot.id);
    if (result.success && result.shot) {
      setSelectedShot(result.shot.id);
    }
  };

  const handleAddShot = async () => {
    const result = await createShot(id);
    if (result.success && result.shot) {
      setSelectedShot(result.shot.id);
    }
  };

  const handleAIGenerate = (script: string, shotCount: number) => {
    // TODO: Implement AI generation via backend
    console.log("AI generate:", script, shotCount);
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

  if (!project) {
    return (
      <AuthGuard>
        <div className="h-screen flex items-center justify-center bg-base">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
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
            onRetry={(jobId) => setJobs(jobs.map((j) => j.id === jobId ? { ...j, status: "running" as const } : j))}
            onCancel={(jobId) => setJobs(jobs.filter((j) => j.id !== jobId))}
            onRemove={(jobId) => setJobs(jobs.filter((j) => j.id !== jobId))}
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
              <p className="text-xs text-text-muted">画幅: {project.aspectRatio || "未设置"}</p>
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

          <div className="flex-1 overflow-auto p-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
              </div>
            ) : shots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <ListTodo className="w-12 h-12 text-text-muted mb-4" />
                <p className="text-text-secondary mb-4">还没有镜头</p>
                <button
                  onClick={handleAddShot}
                  className="flex items-center gap-2 h-11 px-5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加第一个镜头
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={shots.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    {shots.map((shot) => (
                      <SortableShotCard
                        key={shot.id}
                        shot={shot}
                        selected={selectedShot === shot.id}
                        batchMode={batchMode}
                        selectedInBatch={selectedShots.has(shot.id)}
                        onClick={() => setSelectedShot(shot.id)}
                        onToggleBatch={() => toggleBatchSelect(shot.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        </main>

        {/* Right - Shot editor */}
        <aside className="w-[360px] border-l border-border bg-surface flex flex-col shrink-0 overflow-hidden">
          <ShotEditor
            shot={currentShot}
            onChange={handleShotChange}
            onDelete={handleDeleteShot}
            onDuplicate={handleDuplicateShot}
            onGenerateFirstFrame={handleGenerateFirstFrame}
            onGenerateLastFrame={handleGenerateLastFrame}
          />
        </aside>
      </div>

      <ExportDialog
        open={showExport}
        onClose={() => setShowExport(false)}
        projectName={project.name}
      />
    </div>
    </AuthGuard>
  );
}