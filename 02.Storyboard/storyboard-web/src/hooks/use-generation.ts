"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { HubConnectionState } from "@microsoft/signalr";
import { getGenerationHubConnection, JobCreatedEvent, JobStartedEvent, JobProgressEvent, JobCompletedEvent, JobFailedEvent } from "@/lib/signalr";

export interface GenerationJob {
  id: string;
  type: string;
  shotId?: string;
  shotNumber?: number;
  status: "queued" | "running" | "succeeded" | "failed";
  progress?: number;
  message?: string;
  resultPath?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export function useGeneration() {
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<ReturnType<typeof getGenerationHubConnection> | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const connection = getGenerationHubConnection(token);
    connectionRef.current = connection;

    // Event handlers
    const onJobCreated = (event: JobCreatedEvent) => {
      setJobs((prev) => [
        {
          id: event.jobId,
          type: event.jobType,
          shotId: event.shotId,
          shotNumber: event.shotNumber,
          status: "queued",
          createdAt: event.createdAt,
        },
        ...prev,
      ]);
    };

    const onJobStarted = (event: JobStartedEvent) => {
      setJobs((prev) =>
        prev.map((j) => (j.id === event.jobId ? { ...j, status: "running" } : j))
      );
    };

    const onJobProgress = (event: JobProgressEvent) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === event.jobId ? { ...j, progress: event.progress, message: event.message } : j
        )
      );
    };

    const onJobCompleted = (event: JobCompletedEvent) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === event.jobId
            ? { ...j, status: "succeeded", resultPath: event.resultPath, completedAt: event.completedAt }
            : j
        )
      );
    };

    const onJobFailed = (event: JobFailedEvent) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === event.jobId
            ? { ...j, status: "failed", error: event.error, completedAt: event.completedAt }
            : j
        )
      );
    };

    // Register event handlers
    connection.on("JobCreated", onJobCreated);
    connection.on("JobStarted", onJobStarted);
    connection.on("JobProgress", onJobProgress);
    connection.on("JobCompleted", onJobCompleted);
    connection.on("JobFailed", onJobFailed);

    // Start connection
    if (connection.state === HubConnectionState.Disconnected) {
      connection.start().then(() => {
        setIsConnected(true);
      });
    }

    return () => {
      connection.off("JobCreated", onJobCreated);
      connection.off("JobStarted", onJobStarted);
      connection.off("JobProgress", onJobProgress);
      connection.off("JobCompleted", onJobCompleted);
      connection.off("JobFailed", onJobFailed);
    };
  }, []);

  const removeJob = useCallback((jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  }, []);

  const clearCompleted = useCallback(() => {
    setJobs((prev) => prev.filter((j) => j.status !== "succeeded" && j.status !== "failed"));
  }, []);

  return {
    jobs,
    isConnected,
    removeJob,
    clearCompleted,
  };
}
