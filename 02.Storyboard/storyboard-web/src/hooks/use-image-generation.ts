import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

export interface ImageGenerationResult {
  shotId: number;
  type: "first-frame" | "last-frame";
  imageUrl?: string;
  success: boolean;
  error?: string;
  creditsUsed?: number;
}

export function useImageGeneration() {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFirstFrame = useCallback(async (shotId: number): Promise<ImageGenerationResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/api/image/shot/${shotId}/first-frame`);
      const result: ImageGenerationResult = response.data;
      await refreshUser();
      return result;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      const errorMsg = axiosErr.response?.data?.error || "生成失败";
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  const generateLastFrame = useCallback(async (shotId: number): Promise<ImageGenerationResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/api/image/shot/${shotId}/last-frame`);
      const result: ImageGenerationResult = response.data;
      await refreshUser();
      return result;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      const errorMsg = axiosErr.response?.data?.error || "生成失败";
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  const batchGenerate = useCallback(async (
    shotIds: number[],
    generateType: "first" | "last" | "both"
  ): Promise<{ totalShots: number; creditsUsed: number; results: ImageGenerationResult[] } | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/api/image/batch", {
        shotIds,
        generateType,
      });
      await refreshUser();
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      const errorMsg = axiosErr.response?.data?.error || "批量生成失败";
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  return {
    loading,
    error,
    generateFirstFrame,
    generateLastFrame,
    batchGenerate,
    clearError: () => setError(null),
  };
}