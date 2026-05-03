"use client";

import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
import type { Shot, CreateShotRequest, UpdateShotRequest } from "@/types/shot";

interface UseShotsReturn {
  shots: Shot[];
  isLoading: boolean;
  error: string | null;
  fetchShots: (projectId: string) => Promise<void>;
  createShot: (projectId: string, data?: CreateShotRequest) => Promise<{ success: boolean; shot?: Shot; error?: string }>;
  updateShot: (shotId: number, data: UpdateShotRequest) => Promise<{ success: boolean; shot?: Shot; error?: string }>;
  deleteShot: (shotId: number) => Promise<{ success: boolean; error?: string }>;
  duplicateShot: (shotId: number) => Promise<{ success: boolean; shot?: Shot; error?: string }>;
  reorderShots: (projectId: string, orderedIds: number[]) => Promise<{ success: boolean; error?: string }>;
}

export function useShots(): UseShotsReturn {
  const [shots, setShots] = useState<Shot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShots = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/shot/project/${projectId}`);
      setShots(response.data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "获取镜头列表失败");
    }
    setIsLoading(false);
  }, []);

  const createShot = async (projectId: string, data?: CreateShotRequest): Promise<{ success: boolean; shot?: Shot; error?: string }> => {
    try {
      const response = await api.post(`/api/shot/project/${projectId}`, data || {});
      const shot = response.data as Shot;
      setShots((prev) => [...prev, shot]);
      return { success: true, shot };
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      return { success: false, error: axiosErr.response?.data?.error || "创建镜头失败" };
    }
  };

  const updateShot = async (shotId: number, data: UpdateShotRequest): Promise<{ success: boolean; shot?: Shot; error?: string }> => {
    try {
      const response = await api.put(`/api/shot/${shotId}`, data);
      const shot = response.data as Shot;
      setShots((prev) => prev.map((s) => (s.id === shotId ? { ...s, ...shot } : s)));
      return { success: true, shot };
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      return { success: false, error: axiosErr.response?.data?.error || "更新镜头失败" };
    }
  };

  const deleteShot = async (shotId: number): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.delete(`/api/shot/${shotId}`);
      setShots((prev) => prev.filter((s) => s.id !== shotId));
      return { success: true };
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      return { success: false, error: axiosErr.response?.data?.error || "删除镜头失败" };
    }
  };

  const duplicateShot = async (shotId: number): Promise<{ success: boolean; shot?: Shot; error?: string }> => {
    try {
      const response = await api.post(`/api/shot/${shotId}/duplicate`);
      const shot = response.data as Shot;
      setShots((prev) => {
        const index = prev.findIndex((s) => s.id === shotId);
        if (index === -1) return [...prev, shot];
        const newShots = [...prev];
        newShots.splice(index + 1, 0, shot);
        return newShots;
      });
      return { success: true, shot };
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      return { success: false, error: axiosErr.response?.data?.error || "复制镜头失败" };
    }
  };

  const reorderShots = async (projectId: string, orderedIds: number[]): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post(`/api/shot/project/${projectId}/reorder`, { orderedIds });
      const updatedShots = response.data as Array<{ id: number; shotNumber: number; updatedAt: string }>;
      setShots((prev) =>
        prev.map((s) => {
          const updated = updatedShots.find((u) => u.id === s.id);
          return updated ? { ...s, shotNumber: updated.shotNumber, updatedAt: updated.updatedAt } : s;
        }).sort((a, b) => a.shotNumber - b.shotNumber)
      );
      return { success: true };
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      return { success: false, error: axiosErr.response?.data?.error || "重排镜头失败" };
    }
  };

  return {
    shots,
    isLoading,
    error,
    fetchShots,
    createShot,
    updateShot,
    deleteShot,
    duplicateShot,
    reorderShots,
  };
}