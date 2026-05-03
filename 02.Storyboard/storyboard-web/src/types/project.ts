export interface Project {
  id: string;
  name: string;
  aspectRatio?: string;
  targetDuration?: string;
  creativeGoal?: string;
  targetAudience?: string;
  videoTone?: string;
  shotCount: number;
  imageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  aspectRatio?: string;
  targetDuration?: string;
  creativeGoal?: string;
  targetAudience?: string;
  videoTone?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  aspectRatio?: string;
  targetDuration?: string;
  creativeGoal?: string;
  targetAudience?: string;
  videoTone?: string;
}
