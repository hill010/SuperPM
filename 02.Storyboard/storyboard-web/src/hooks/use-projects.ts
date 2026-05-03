"use client";

import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
import type { Project, CreateProjectRequest, UpdateProjectRequest } from "@/types/project";

interface UseProjectsReturn {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  createProject: (data: CreateProjectRequest) => Promise<{ success: boolean; project?: Project; error?: string }>;
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<{ success: boolean; project?: Project; error?: string }>;
  deleteProject: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshProjects: () => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/project");
      setProjects(response.data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "获取项目列表失败");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (data: CreateProjectRequest): Promise<{ success: boolean; project?: Project; error?: string }> => {
    try {
      const response = await api.post("/api/project", data);
      const project = response.data as Project;
      setProjects((prev) => [project, ...prev]);
      return { success: true, project };
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      return { success: false, error: axiosErr.response?.data?.error || "创建项目失败" };
    }
  };

  const updateProject = async (id: string, data: UpdateProjectRequest): Promise<{ success: boolean; project?: Project; error?: string }> => {
    try {
      const response = await api.put(`/api/project/${id}`, data);
      const project = response.data as Project;
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...project } : p)));
      return { success: true, project };
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      return { success: false, error: axiosErr.response?.data?.error || "更新项目失败" };
    }
  };

  const deleteProject = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.delete(`/api/project/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      return { success: false, error: axiosErr.response?.data?.error || "删除项目失败" };
    }
  };

  return {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: fetchProjects,
  };
}
