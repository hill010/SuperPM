# Data Model

## 存储策略

V1 使用本地文件系统保存项目数据。实现上可选择纯 JSON，也可用 SQLite 管理索引和查询。无论底层实现如何，应用层实体保持一致。

推荐本地目录结构：

```text
SuperPM Projects/
└── project-id/
    ├── project.json
    ├── episodes/
    │   └── ep-001.json
    ├── artifacts/
    │   ├── stage-beat-breakdown.json
    │   ├── stage-beat-board.json
    │   ├── stage-sequence-board.json
    │   └── stage-motion-prompt.json
    ├── assets/
    │   ├── images/
    │   └── videos/
    └── exports/
        ├── project.md
        └── project.json
```

## 核心枚举

### ProjectType

```ts
type ProjectType =
  | "storyboard"
  | "music_concept"
  | "merch_design"
  | "character_design";
```

### StageType

```ts
type StageType =
  | "beat_breakdown"
  | "beat_board"
  | "sequence_board"
  | "motion_prompt";
```

### StageStatus

```ts
type StageStatus =
  | "not_started"
  | "generating"
  | "reviewing"
  | "pending_confirmation"
  | "completed"
  | "needs_regeneration"
  | "failed";
```

### ReviewStatus

```ts
type ReviewStatus = "pass" | "fail" | "manual_required";
```

## Project

项目是顶层实体，保存项目级配置、集列表和最近打开信息。

```ts
interface Project {
  id: string;
  name: string;
  type: ProjectType;
  visualConfig: VisualConfig;
  episodeIds: string[];
  currentEpisodeId: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
  schemaVersion: number;
}

interface VisualConfig {
  style: "真人写实" | "3D CG" | "皮克斯" | "迪士尼" | "国漫" | "日漫" | "韩漫";
  medium: "电影" | "短剧" | "漫剧" | "MV" | "广告";
  aspectRatio: "16:9" | "9:16";
}
```

## Episode

每一集有独立阶段状态、产物引用和可覆盖配置。

```ts
interface Episode {
  id: string;
  projectId: string;
  code: string;
  title?: string;
  visualConfigOverride?: Partial<VisualConfig>;
  stageStates: Record<StageType, StageState>;
  currentStage: StageType;
  createdAt: string;
  updatedAt: string;
}

interface StageState {
  status: StageStatus;
  artifactId?: string;
  latestReviewId?: string;
  revision: number;
  unlocked: boolean;
  completedAt?: string;
  updatedAt: string;
}
```

## Artifact

Artifact 是每个阶段的产物。不同阶段的 `content` 结构不同。

```ts
interface Artifact<TContent = unknown> {
  id: string;
  projectId: string;
  episodeId: string;
  stage: StageType;
  revision: number;
  content: TContent;
  sourceArtifactIds: string[];
  reviewIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

### BeatBreakdownContent

```ts
interface BeatBreakdownContent {
  beats: Beat[];
  summary: string;
  characters: CharacterMention[];
  locations: LocationMention[];
}

interface Beat {
  id: string;
  index: number;
  title: string;
  narrativeFunction: string;
  description: string;
  characters: string[];
  location: string;
  emotionalTone: string;
  visualTurn: string;
}
```

### BeatBoardContent

```ts
interface BeatBoardContent {
  cells: BeatBoardCell[];
}

interface BeatBoardCell {
  id: string;
  index: number;
  sourceBeatIds: string[];
  title: string;
  imagePrompt: string;
  composition: string;
  camera: string;
  mood: string;
  assetIds: string[];
}
```

### SequenceBoardContent

```ts
interface SequenceBoardContent {
  sequences: SequenceGroup[];
}

interface SequenceGroup {
  id: string;
  index: number;
  sourceBeatBoardCellId: string;
  shots: SequenceShot[];
}

interface SequenceShot {
  id: string;
  index: number;
  imagePrompt: string;
  shotType: string;
  cameraMovement?: string;
  transition?: string;
  assetIds: string[];
}
```

### MotionPromptContent

```ts
interface MotionPromptContent {
  prompts: MotionPromptItem[];
}

interface MotionPromptItem {
  id: string;
  index: number;
  sourceShotId: string;
  prompt: string;
  durationSeconds?: number;
  cameraMovement: string;
  subjectMotion: string;
  environmentMotion?: string;
}
```

## ReviewResult

审核结果保留完整历史，便于回溯。

```ts
interface ReviewResult {
  id: string;
  projectId: string;
  episodeId: string;
  artifactId: string;
  stage: StageType;
  status: ReviewStatus;
  round: number;
  issues: ReviewIssue[];
  summary: string;
  suggestedPatch?: unknown;
  createdAt: string;
}

interface ReviewIssue {
  id: string;
  location: string;
  rule: string;
  severity: "low" | "medium" | "high";
  description: string;
  suggestion: string;
}
```

## Asset

资产用于存储生成图、上传文件、角色和场景素材。

```ts
interface Asset {
  id: string;
  projectId?: string;
  episodeId?: string;
  sourceArtifactId?: string;
  type: "image" | "video" | "character" | "scene" | "document";
  name: string;
  filePath: string;
  thumbnailPath?: string;
  prompt?: string;
  metadata: Record<string, unknown>;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Template

V1 模板可先只保存项目配置，V2 再扩展预设流程。

```ts
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  projectType: ProjectType;
  visualConfig: VisualConfig;
  workflowPreset?: Partial<Record<StageType, unknown>>;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}
```

## ApiProviderConfig

API Key 必须加密保存。实体中只保存密文引用或加密后的值。

```ts
interface ApiProviderConfig {
  id: string;
  type: "text" | "image";
  provider: string;
  encryptedApiKey: string;
  baseUrl?: string;
  model?: string;
  verified: boolean;
  lastVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 状态流转

### StageStatus 流转

```text
not_started
→ generating
→ reviewing
→ pending_confirmation
→ completed
```

失败或修改路径：

```text
reviewing
→ failed
→ generating
→ reviewing
```

上游修改后：

```text
completed
→ needs_regeneration
```

### 阶段解锁规则

| 当前阶段 | 解锁条件 |
|---|---|
| 节拍拆解 | 项目创建后默认解锁 |
| 九宫格分镜 | 节拍拆解 completed |
| 四宫格序列 | 九宫格分镜 completed |
| 动态提示词 | 四宫格序列 completed |

## 导出数据结构

JSON 导出推荐结构：

```ts
interface ProjectExport {
  project: Project;
  episodes: Episode[];
  artifacts: Artifact[];
  reviews: ReviewResult[];
  assets: Asset[];
  exportedAt: string;
  exportVersion: number;
}
```

Markdown 导出顺序：

1. 项目信息
2. 视觉配置
3. 集数目录
4. 节拍拆解表
5. 九宫格提示词
6. 四宫格序列提示词
7. 动态提示词
8. 审核记录摘要
