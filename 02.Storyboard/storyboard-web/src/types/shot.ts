export interface Shot {
  id: string;
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
  firstFrameImagePath?: string;
  lastFrameImagePath?: string;
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