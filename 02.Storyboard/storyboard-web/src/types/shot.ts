export interface Shot {
  id: number;
  projectId?: string;
  shotNumber: number;
  duration: number;
  shotType: string;
  coreContent: string;
  actionCommand: string;
  sceneSettings: string;
  firstFramePrompt: string;
  lastFramePrompt: string;
  videoPrompt: string;
  firstFrameImagePath?: string | null;
  lastFrameImagePath?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShotRequest {
  duration?: number;
  shotType?: string;
  coreContent?: string;
  actionCommand?: string;
  sceneSettings?: string;
  firstFramePrompt?: string;
  lastFramePrompt?: string;
  videoPrompt?: string;
}

export interface UpdateShotRequest {
  duration?: number;
  shotType?: string;
  coreContent?: string;
  actionCommand?: string;
  sceneSettings?: string;
  firstFramePrompt?: string;
  lastFramePrompt?: string;
  videoPrompt?: string;
  firstFrameImagePath?: string;
  lastFrameImagePath?: string;
}