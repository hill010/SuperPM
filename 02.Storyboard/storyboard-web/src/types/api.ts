export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  aspectRatio?: string;
  targetDuration?: string;
  creativeGoal?: string;
  targetAudience?: string;
  videoTone?: string;
  createdAt: string;
  updatedAt: string;
  shotCount: number;
}

export interface Shot {
  id: number;
  projectId: string;
  shotNumber: number;
  duration: number;
  shotType: string;
  coreContent: string;
  actionCommand: string;
  sceneSettings: string;
  firstFramePrompt: string;
  lastFramePrompt: string;
  firstFrameImagePath?: string;
  lastFrameImagePath?: string;
}
