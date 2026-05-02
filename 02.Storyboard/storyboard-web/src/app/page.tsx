"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightPanel } from "@/components/layout/right-panel";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { Plus, Film, Trash2, Search, SlidersHorizontal, Clock, Grid3X3 } from "lucide-react";
import { mockProjects, type MockProject } from "@/lib/mock-data";

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<MockProject[]>(mockProjects);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"updatedAt" | "name">("updatedAt");

  const filtered = useMemo(() => {
    let list = [...projects];
    if (search.trim()) {
      list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [projects, search, sortBy]);

  const handleCreate = (data: { name: string; aspectRatio: string; targetDuration: string; creativeGoal: string; targetAudience: string; videoTone: string }) => {
    const newProject: MockProject = {
      id: `proj-${Date.now()}`,
      name: data.name,
      aspectRatio: data.aspectRatio,
      creativeGoal: data.creativeGoal,
      targetAudience: data.targetAudience,
      videoTone: data.videoTone,
      shotCount: 0,
      imageCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: "刚刚",
    };
    setProjects([newProject, ...projects]);
    setShowCreate(false);
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
    setDeleteConfirm(null);
    if (selectedProject === id) setSelectedProject(null);
  };

  const selected = projects.find((p) => p.id === selectedProject);

  return (
    <div className="h-screen flex flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <main className="flex-1 bg-base overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-text-primary">我的项目</h1>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 h-11 px-5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                新建项目
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索项目..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
              </div>
              <button
                className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-border bg-surface text-xs font-medium text-text-secondary hover:bg-base transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                筛选
              </button>
              <button
                onClick={() => setSortBy(sortBy === "updatedAt" ? "name" : "updatedAt")}
                className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-xs text-text-secondary hover:bg-base transition-colors"
              >
                {sortBy === "updatedAt" ? <Clock className="w-3.5 h-3.5" /> : <Grid3X3 className="w-3.5 h-3.5" />}
                {sortBy === "updatedAt" ? "最近更新" : "按名称"}
              </button>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Film className="w-12 h-12 text-text-muted mb-4" />
                <p className="text-text-secondary mb-4">
                  {search ? "没有找到匹配的项目" : "还没有项目"}
                </p>
                {!search && (
                  <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 h-11 px-5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    创建第一个项目
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => {
                      setSelectedProject(project.id);
                      router.push(`/project/${project.id}`);
                    }}
                    onMouseEnter={() => setHoveredProject(project.id)}
                    onMouseLeave={() => setHoveredProject(null)}
                    className={`bg-surface rounded-3xl border p-5 hover:shadow-md transition-all cursor-pointer relative group ${
                      selectedProject === project.id ? "border-accent shadow-md" : "border-border"
                    }`}
                  >
                    {hoveredProject === project.id && (
                      <div className="absolute top-3 right-3 flex gap-1 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(project.id);
                          }}
                          className="w-7 h-7 rounded-full bg-base hover:bg-error/10 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-error" />
                        </button>
                      </div>
                    )}
                    <div className="aspect-video bg-base rounded-2xl mb-4 flex items-center justify-center overflow-hidden">
                      <Film className="w-8 h-8 text-text-muted" />
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1 truncate">{project.name}</h3>
                    <p className="text-xs text-text-muted">
                      {project.shotCount} 个镜头 · {project.imageCount} 张图片 · {project.updatedAt}
                    </p>
                    {project.creativeGoal && (
                      <p className="text-xs text-text-muted mt-1 truncate">{project.creativeGoal}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <RightPanel>
          {selected ? (
            <div className="p-4 space-y-4">
              <h3 className="text-sm font-semibold text-text-primary">{selected.name}</h3>
              <div className="space-y-2 text-xs text-text-secondary">
                <p>画幅：{selected.aspectRatio}</p>
                <p>镜头：{selected.shotCount} 个</p>
                <p>图片：{selected.imageCount} 张</p>
                {selected.creativeGoal && <p>目标：{selected.creativeGoal}</p>}
                {selected.targetAudience && <p>受众：{selected.targetAudience}</p>}
                {selected.videoTone && <p>基调：{selected.videoTone}</p>}
                <p>更新：{selected.updatedAt}</p>
              </div>
              <button
                onClick={() => router.push(`/project/${selected.id}`)}
                className="w-full h-9 rounded-full bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors"
              >
                打开工作台
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-sm text-text-muted">选择项目查看详情</p>
            </div>
          )}
        </RightPanel>
      </div>

      <CreateProjectDialog open={showCreate} onClose={() => setShowCreate(false)} onSubmit={handleCreate} />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-surface rounded-3xl border border-border w-[360px] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-text-primary mb-2">删除项目</h3>
            <p className="text-sm text-text-secondary mb-6">
              确定要删除「{projects.find((p) => p.id === deleteConfirm)?.name}」吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="h-11 px-5 rounded-full text-sm font-medium text-text-secondary hover:bg-base transition-colors">
                取消
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="h-11 px-5 rounded-full bg-error text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
