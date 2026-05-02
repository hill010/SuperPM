export interface MockProject {
  id: string;
  name: string;
  aspectRatio: string;
  creativeGoal: string;
  targetAudience: string;
  videoTone: string;
  shotCount: number;
  imageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockShot {
  id: string;
  projectId: string;
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
  status: "draft" | "queued" | "generating" | "generated" | "failed";
}

export interface MockJob {
  id: string;
  type: "text-storyboard" | "first-frame" | "last-frame" | "batch";
  status: "queued" | "running" | "succeeded" | "failed";
  shotId?: string;
  shotNumber?: number;
  creditsUsed: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export const mockProjects: MockProject[] = [
  {
    id: "proj-001",
    name: "夏日咖啡广告",
    aspectRatio: "16:9",
    creativeGoal: "推广新款冷萃咖啡，吸引年轻白领",
    targetAudience: "25-35岁都市白领",
    videoTone: "清新、活力",
    shotCount: 12,
    imageCount: 8,
    createdAt: "2026-04-28",
    updatedAt: "2 小时前",
  },
  {
    id: "proj-002",
    name: "产品发布宣传片",
    aspectRatio: "16:9",
    creativeGoal: "新品发布会开场视频",
    targetAudience: "科技媒体和消费者",
    videoTone: "科技感、震撼",
    shotCount: 24,
    imageCount: 16,
    createdAt: "2026-04-20",
    updatedAt: "昨天",
  },
  {
    id: "proj-003",
    name: "短视频系列 EP01",
    aspectRatio: "9:16",
    creativeGoal: "系列短视频第一集，建立角色认知",
    targetAudience: "18-28岁短视频用户",
    videoTone: "幽默、轻松",
    shotCount: 8,
    imageCount: 4,
    createdAt: "2026-04-15",
    updatedAt: "3 天前",
  },
];

export const mockShots: MockShot[] = [
  {
    id: "shot-001",
    projectId: "proj-001",
    shotNumber: 1,
    duration: 3.5,
    shotType: "远景",
    coreContent: "清晨城市天际线，阳光洒在玻璃幕墙上",
    actionCommand: "缓慢推镜头，从城市全景推向咖啡店",
    sceneSettings: "城市街道，清晨6点，金色阳光",
    firstFramePrompt: "City skyline at dawn, golden sunlight on glass buildings, cinematic wide shot",
    lastFramePrompt: "Close-up of a coffee shop storefront, warm light spilling out",
    videoPrompt: "Slow push from city skyline to coffee shop entrance",
    firstFrameImagePath: "/mock/shot1-first.jpg",
    lastFrameImagePath: "/mock/shot1-last.jpg",
    status: "generated",
  },
  {
    id: "shot-002",
    projectId: "proj-001",
    shotNumber: 2,
    duration: 4.0,
    shotType: "特写",
    coreContent: "咖啡豆从研磨机落入手柄的过程",
    actionCommand: "俯拍特写，咖啡豆缓慢下落",
    sceneSettings: "咖啡店内吧台，暖色调灯光",
    firstFramePrompt: "Top-down close-up of coffee beans falling into portafilter, warm lighting",
    lastFramePrompt: "Coffee grounds perfectly tamped in portafilter, macro shot",
    videoPrompt: "Slow motion coffee beans falling and grinding",
    status: "generated",
  },
  {
    id: "shot-003",
    projectId: "proj-001",
    shotNumber: 3,
    duration: 5.0,
    shotType: "中景",
    coreContent: "咖啡师专注地萃取浓缩咖啡",
    actionCommand: "侧面中景，咖啡师双手操作咖啡机",
    sceneSettings: "咖啡店内，专业咖啡机，蒸汽升腾",
    firstFramePrompt: "Barista operating espresso machine, side view, steam rising, professional setting",
    lastFramePrompt: "Rich espresso flowing into glass cup, golden crema, close-up",
    videoPrompt: "Barista pulling espresso shot, steam and liquid flowing",
    status: "generated",
  },
  {
    id: "shot-004",
    projectId: "proj-001",
    shotNumber: 4,
    duration: 3.0,
    shotType: "特写",
    coreContent: "冷萃咖啡倒入装满冰块的玻璃杯",
    actionCommand: "慢动作倒入，液体与冰块碰撞",
    sceneSettings: "白色大理石桌面，自然光",
    firstFramePrompt: "Cold brew coffee being poured over ice in glass, slow motion, white marble surface",
    lastFramePrompt: "Iced coffee in glass with condensation drops, refreshing, natural light",
    videoPrompt: "Slow motion pour of cold brew over ice cubes",
    status: "generated",
  },
  {
    id: "shot-005",
    projectId: "proj-001",
    shotNumber: 5,
    duration: 4.0,
    shotType: "近景",
    coreContent: "年轻白领在窗边享用咖啡，微笑",
    actionCommand: "柔焦背景，人物面部自然光",
    sceneSettings: "咖啡店窗边座位，阳光透过玻璃",
    firstFramePrompt: "Young professional enjoying coffee by window, soft focus background, natural light",
    lastFramePrompt: "Person smiling with coffee cup, bokeh cityscape background",
    videoPrompt: "Person taking a sip of coffee, smiling, window light",
    status: "draft",
  },
  {
    id: "shot-006",
    projectId: "proj-001",
    shotNumber: 6,
    duration: 3.0,
    shotType: "远景",
    coreContent: "咖啡店外景，傍晚暖光",
    actionCommand: "缓慢拉镜头，从店内到店外全景",
    sceneSettings: "咖啡店外街道，傍晚金色时刻",
    firstFramePrompt: "Coffee shop interior warm lighting, evening golden hour",
    lastFramePrompt: "Coffee shop exterior at dusk, warm glow from windows, street view",
    videoPrompt: "Slow pull back from inside to outside of coffee shop at dusk",
    status: "draft",
  },
];

export const mockJobs: MockJob[] = [
  {
    id: "job-001",
    type: "first-frame",
    status: "succeeded",
    shotId: "shot-001",
    shotNumber: 1,
    creditsUsed: 5,
    createdAt: "10:30",
    completedAt: "10:31",
  },
  {
    id: "job-002",
    type: "last-frame",
    status: "succeeded",
    shotId: "shot-001",
    shotNumber: 1,
    creditsUsed: 5,
    createdAt: "10:31",
    completedAt: "10:32",
  },
  {
    id: "job-003",
    type: "first-frame",
    status: "running",
    shotId: "shot-005",
    shotNumber: 5,
    creditsUsed: 5,
    createdAt: "10:45",
  },
  {
    id: "job-004",
    type: "batch",
    status: "queued",
    creditsUsed: 20,
    createdAt: "10:46",
  },
  {
    id: "job-005",
    type: "first-frame",
    status: "failed",
    shotId: "shot-006",
    shotNumber: 6,
    creditsUsed: 0,
    createdAt: "10:20",
    error: "NSFW content detected",
  },
];
