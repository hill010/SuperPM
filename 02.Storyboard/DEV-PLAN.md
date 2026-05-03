# Development Plan — Storyboard Web

> 本文件记录 Storyboard Web 项目的开发阶段划分、当前进度和剩余工作。
> 新 session 启动时应首先阅读此文件，了解项目状态后再继续开发。

---

## 项目概况

将现有 Avalonia 桌面端「分镜大师」改造为面向外部创作者的 Web SaaS。后端复用现有 Domain/Application/Infrastructure 层的 C# 资产，前端使用 Next.js 全新构建。

**已有可复用资产**：
- `Domain/Entities/` — Project、Shot、ShotAsset 实体定义
- `Application/Abstractions/` — IAiShotService、IImageGenerationService、IJobQueueService 等接口
- `Application/Services/` — ProjectStore、JobQueueService、StoragePathService 等
- `Infrastructure/AI/` — AI 服务管理、Provider 实现、Prompt 模板
- `Infrastructure/Configuration/` — 配置体系
- `Prompts/*.json` — 文本拆镜、图片生成等 Prompt 模板

---

## Phase 1: 项目骨架 + 基础设施

**交付内容**：
- 创建 ASP.NET Core 8.0 Web API 项目（`Storyboard.WebApi/`），配置依赖注入、中间件、CORS
- 创建 EF Core DbContext，配置 PostgreSQL 连接，迁移 Users、Workspaces、Projects、Shots、Assets、GenerationJobs、CreditAccounts、CreditTransactions、Subscriptions、BillingEvents 表
- 创建 Next.js 16 前端项目（`Storyboard.Web/`），配置 TypeScript、Tailwind CSS 4、App Router
- 实现前端深色主题基础布局：顶部栏 + 左侧栏 + 中间主区 + 右侧栏骨架
- 配置前端 API 请求层（axios/fetch 封装、错误拦截、baseURL）
- 前后端联调验证：前端请求后端 `/api/health` 返回 200

**关键文件**：
- `Storyboard.WebApi/Program.cs` — API 入口，DI 配置、中间件管道
- `Storyboard.WebApi/appsettings.json` — 数据库连接串、CORS、JWT 配置
- `Storyboard.WebApi/StoryboardDbContext.cs` — EF Core DbContext，所有实体映射
- `Storyboard.WebApi/Migrations/` — 数据库迁移文件
- `Storyboard.WebApi/Controllers/HealthController.cs` — 健康检查端点
- `Storyboard.Web/package.json` — 前端依赖
- `Storyboard.Web/src/app/layout.tsx` — 根布局，ThemeProvider + 全局样式
- `Storyboard.Web/src/app/globals.css` — Tailwind 配置、深色主题 CSS 变量
- `Storyboard.Web/src/components/layout/top-bar.tsx` — 顶部栏骨架
- `Storyboard.Web/src/components/layout/left-sidebar.tsx` — 左侧栏骨架
- `Storyboard.Web/src/components/layout/right-panel.tsx` — 右侧栏骨架
- `Storyboard.Web/src/lib/api.ts` — API 请求封装

**验收标准**：
- 后端 `dotnet build` 无错误，`dotnet run` 启动后 `/api/health` 返回 200
- 前端 `npm run dev` 启动后显示深色主题三栏布局骨架
- 前端能成功请求后端 health 端点并显示结果

---

## Phase 2: 用户认证 + 工作区

**交付内容**：
- 实现用户注册（邮箱 + 密码）和登录 API，使用 JWT 认证
- 实现前端登录页和注册页（深色主题，简洁表单，无营销内容）
- 实现 AuthProvider（JWT 存储、刷新、路由守卫）
- 新用户注册后自动创建个人 Workspace 并发放免费试用积分
- 实现用户信息 API（`GET /api/me` 返回用户资料、积分余额、订阅状态）
- 实现前端顶部栏用户菜单（积分余额显示、账户设置入口、退出登录）

**关键文件**：
- `Storyboard.WebApi/Controllers/AuthController.cs` — 注册、登录、刷新 token 端点
- `Storyboard.WebApi/Controllers/UserController.cs` — 用户信息、积分余额端点
- `Storyboard.WebApi/Services/AuthService.cs` — 密码哈希、JWT 生成、token 验证
- `Storyboard.WebApi/Services/WorkspaceService.cs` — 工作区创建、积分初始化
- `Storyboard.WebApi/Middleware/JwtMiddleware.cs` — JWT 认证中间件
- `Storyboard.Web/src/app/login/page.tsx` — 登录页
- `Storyboard.Web/src/app/register/page.tsx` — 注册页
- `Storyboard.Web/src/providers/auth-provider.tsx` — 认证上下文、JWT 管理
- `Storyboard.Web/src/hooks/use-auth.ts` — 认证状态 hook
- `Storyboard.Web/src/components/auth/login-form.tsx` — 登录表单组件
- `Storyboard.Web/src/components/auth/register-form.tsx` — 注册表单组件
- `Storyboard.Web/src/middleware.ts` — Next.js 路由守卫（未登录跳转 /login）

**验收标准**：
- 新用户注册后数据库自动创建 User、Workspace、CreditAccount 记录
- 登录后获得 JWT，请求 `/api/me` 返回用户信息和积分余额
- 未登录访问工作台页面自动跳转登录页
- 顶部栏显示当前用户积分余额

---

## Phase 3: 项目列表 + 项目创建

**交付内容**：
- 实现项目 CRUD API（`/api/projects`：列表、创建、获取、更新、删除）
- 项目列表页：项目卡片网格（项目名、更新时间、镜头数、已生成图片数、最近缩略图）
- 新建项目弹窗：输入项目名称、画幅比例、目标片长、创作目标、目标受众、视频基调
- 项目搜索与筛选（按名称、更新时间）
- 空状态引导：无项目时显示创建项目入口
- 点击项目卡片进入项目工作台

**关键文件**：
- `Storyboard.WebApi/Controllers/ProjectController.cs` — 项目 CRUD 端点
- `Storyboard.WebApi/Services/ProjectService.cs` — 项目业务逻辑（复用 Application/Services/ProjectStore 思路）
- `Storyboard.Web/src/app/page.tsx` — 项目列表页（登录后的默认首页）
- `Storyboard.Web/src/app/project/[id]/page.tsx` — 项目工作台页（占位，Phase 4 实现）
- `Storyboard.Web/src/components/project/project-card.tsx` — 项目卡片组件
- `Storyboard.Web/src/components/project/create-project-dialog.tsx` — 新建项目弹窗
- `Storyboard.Web/src/components/project/project-list.tsx` — 项目列表组件（搜索、筛选、网格）
- `Storyboard.Web/src/components/project/empty-state.tsx` — 空状态组件
- `Storyboard.Web/src/hooks/use-projects.ts` — 项目列表数据管理 hook

**验收标准**：
- 能创建新项目并显示在列表中
- 项目卡片显示名称、更新时间、镜头数
- 搜索能按名称过滤项目
- 点击卡片跳转到项目工作台页面
- 删除项目需二次确认

---

## Phase 4: 项目工作台 + 分镜列表 + 镜头编辑

**交付内容**：
- 实现镜头 CRUD API（`/api/projects/{id}/shots`：列表、创建、更新、删除、重排、批量操作）
- 三栏工作台布局：左侧项目导航 + 中间分镜列表 + 右侧镜头编辑器
- 分镜列表：纵向镜头卡片（镜头编号、时长、景别、核心内容、首帧/尾帧缩略图占位、生成状态）
- 镜头卡片支持选中、拖拽重排、复制、删除、批量选择
- 右侧镜头详情编辑器：按折叠分组（基础信息、首帧参数、尾帧参数、视频提示词草稿、生成参数）
- 自动保存：编辑镜头字段后防抖自动保存
- 左侧栏：项目基础信息展示、素材库入口（占位）、导出入口（占位）

**关键文件**：
- `Storyboard.WebApi/Controllers/ShotController.cs` — 镜头 CRUD、重排、批量操作端点
- `Storyboard.WebApi/Services/ShotService.cs` — 镜头业务逻辑（复用 Application 层思路）
- `Storyboard.Web/src/app/project/[id]/page.tsx` — 项目工作台主页面
- `Storyboard.Web/src/components/workbench/workbench-layout.tsx` — 三栏工作台布局
- `Storyboard.Web/src/components/workbench/project-sidebar.tsx` — 左侧项目导航栏
- `Storyboard.Web/src/components/workbench/shot-list.tsx` — 分镜列表容器
- `Storyboard.Web/src/components/workbench/shot-card.tsx` — 单张镜头卡片
- `Storyboard.Web/src/components/workbench/shot-editor.tsx` — 右侧镜头详情编辑器
- `Storyboard.Web/src/components/workbench/shot-editor-section.tsx` — 编辑器折叠分组
- `Storyboard.Web/src/hooks/use-shots.ts` — 镜头列表数据管理 hook
- `Storyboard.Web/src/hooks/use-auto-save.ts` — 防抖自动保存 hook
- `Storyboard.Web/src/types/shot.ts` — 镜头相关 TypeScript 类型定义

**验收标准**：
- 工作台三栏布局正常显示，左侧栏可折叠
- 能新增镜头、编辑镜头字段、删除镜头
- 镜头卡片可拖拽重排，顺序实时保存
- 编辑镜头字段后自动保存，刷新页面数据不丢失
- 选中镜头后右侧编辑器显示对应镜头数据

---

## Phase 5: AI 脚本拆镜

**交付内容**：
- 实现文本拆镜 API（`POST /api/projects/{id}/generate-storyboard`）：接收脚本文本和期望镜头数，创建异步 GenerationJob
- 后端 AI 拆镜服务：调用文本 AI（复用 `Prompts/text_to_shots.json` 模板），解析返回的镜头列表，写入 Shots 表
- 前端脚本输入面板：文本区域 + 镜头数量选择 + "生成分镜"按钮
- 拆镜任务提交后显示加载状态，任务完成后自动刷新分镜列表
- AI 拆镜结果预览：生成的镜头列表高亮显示，用户确认后保存或取消
- 积分扣除：文本拆镜消耗少量积分，余额不足时提示

**关键文件**：
- `Storyboard.WebApi/Controllers/StoryboardController.cs` — 文本拆镜端点
- `Storyboard.WebApi/Services/StoryboardAIService.cs` — AI 拆镜服务（复用 Infrastructure/AI 层）
- `Storyboard.WebApi/Services/GenerationJobService.cs` — 异步任务创建与状态管理
- `Storyboard.WebApi/Services/CreditService.cs` — 积分扣费、余额检查
- `Storyboard.WebApi/Workers/GenerationWorker.cs` — 后台 Worker 处理异步生成任务
- `Storyboard.WebApi/Hubs/GenerationHub.cs` — SignalR Hub，推送任务状态到前端
- `Storyboard.Web/src/components/workbench/script-input-panel.tsx` — 脚本输入面板
- `Storyboard.Web/src/components/workbench/storyboard-preview.tsx` — 拆镜结果预览
- `Storyboard.Web/src/hooks/use-generation.ts` — 生成任务状态管理（SignalR 连接）
- `Storyboard.Web/src/lib/signalr.ts` — SignalR 客户端封装

**验收标准**：
- 输入脚本点击"生成分镜"后，系统创建异步任务
- 任务完成后分镜列表自动更新，显示 AI 生成的镜头
- 生成过程中按钮显示加载状态，不可重复提交
- 积分不足时弹出提示，不允许提交任务
- 任务失败显示失败原因，未扣积分自动退回

---

## Phase 6: 首尾帧图片生成

**交付内容**：
- 实现图片生成 API（`POST /api/shots/{id}/generate-image`：单张；`POST /api/shots/batch-generate`：批量）
- 后端图片生成服务：调用图像生成 AI（复用 Infrastructure/Media 层和 `Prompts/image_generation.json`），将生成图片上传到对象存储，绑定到 Shot
- 镜头卡片显示首帧/尾帧缩略图（生成中显示骨架屏，成功显示图片，失败显示重试入口）
- 单镜头生成：选中镜头后在编辑器中点击"生成首帧"或"生成尾帧"
- 批量生成：多选镜头后批量生成首帧、尾帧或两者
- 任务队列面板：底部可折叠抽屉，显示所有生成任务的状态（排队中/执行中/成功/失败）、关联镜头、耗时、积分扣除
- 素材库页面：按项目查看所有生成的图片，支持按镜头和类型筛选

**关键文件**：
- `Storyboard.WebApi/Controllers/ImageGenerationController.cs` — 图片生成端点
- `Storyboard.WebApi/Services/ImageGenerationService.cs` — 图片生成服务（复用 Infrastructure/Media）
- `Storyboard.WebApi/Services/StorageService.cs` — 对象存储服务（上传、获取 URL）
- `Storyboard.WebApi/Hubs/JobQueueHub.cs` — SignalR Hub，推送图片生成进度
- `Storyboard.Web/src/components/workbench/shot-card.tsx` — 更新：首尾帧缩略图显示
- `Storyboard.Web/src/components/workbench/image-generation-button.tsx` — 生成按钮（积分预估 + 确认）
- `Storyboard.Web/src/components/workbench/batch-generate-bar.tsx` — 批量生成操作栏
- `Storyboard.Web/src/components/workbench/job-queue-drawer.tsx` — 任务队列抽屉
- `Storyboard.Web/src/components/workbench/job-item.tsx` — 单个任务项
- `Storyboard.Web/src/app/project/[id]/assets/page.tsx` — 素材库页面
- `Storyboard.Web/src/components/assets/asset-grid.tsx` — 素材网格
- `Storyboard.Web/src/hooks/use-image-generation.ts` — 图片生成状态管理

**验收标准**：
- 点击"生成首帧"后镜头卡片显示骨架屏，完成后显示生成的图片
- 批量选择镜头可一次性生成首尾帧
- 任务队列实时更新，显示每个任务的状态
- 生成失败显示失败原因，提供重试入口
- 素材库展示项目内所有生成的图片

---

## Phase 7: 导出 + 计费 + 收尾

**交付内容**：
- 实现导出 API（`GET /api/projects/{id}/export`：支持 Markdown、CSV、PDF 格式）
- 导出弹窗：选择格式、预览内容、下载
- 订阅管理 API 和页面：查看当前订阅、积分余额、账单记录
- 积分包购买入口（Stripe 集成骨架，第一版可 mock 支付流程）
- 账户设置页面：个人资料、订阅状态、积分明细
- 全局错误处理和 Loading 状态优化
- 响应式适配（最低支持 1280px 宽度）

**关键文件**：
- `Storyboard.WebApi/Controllers/ExportController.cs` — 导出端点
- `Storyboard.WebApi/Services/ExportService.cs` — Markdown/CSV/PDF 导出逻辑
- `Storyboard.WebApi/Controllers/BillingController.cs` — 订阅、积分包、账单端点
- `Storyboard.WebApi/Services/BillingService.cs` — 计费逻辑（Stripe 骨架或 mock）
- `Storyboard.Web/src/components/workbench/export-dialog.tsx` — 导出弹窗
- `Storyboard.Web/src/app/settings/page.tsx` — 账户设置页
- `Storyboard.Web/src/components/settings/subscription-panel.tsx` — 订阅管理面板
- `Storyboard.Web/src/components/settings/credit-history.tsx` — 积分明细
- `Storyboard.Web/src/components/settings/billing-panel.tsx` — 账单记录
- `Storyboard.Web/src/components/ui/error-boundary.tsx` — 全局错误边界
- `Storyboard.Web/src/components/ui/loading-skeleton.tsx` — 通用骨架屏

**验收标准**：
- 能导出 Markdown 和 CSV 格式的分镜表，内容包含镜头编号、核心内容、动作、场景、时长、提示词
- PDF 导出包含首尾帧图片
- 账户设置页显示积分余额和订阅状态
- 全局未捕获错误显示友好错误页面

---

## 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 前端框架 | Next.js + React | 16.x | App Router、Server Components |
| 前端语言 | TypeScript | 5.x | 类型安全 |
| 前端样式 | Tailwind CSS | 4.x | 工具类 CSS，深色主题 |
| 前端状态 | React Hooks + Context | — | 轻量状态管理 |
| 实时通信 | @microsoft/signalr | latest | 任务进度推送 |
| 后端框架 | ASP.NET Core Web API | 8.0 | 复用现有 .NET 资产 |
| ORM | EF Core + Npgsql | 8.x | PostgreSQL provider |
| 数据库 | PostgreSQL | 16.x | SaaS 多用户、计费、任务 |
| 对象存储 | S3 兼容（MinIO/AWS S3） | — | 图片、素材存储 |
| 认证 | JWT | — | 自定义认证服务 |
| 实时推送 | SignalR | — | 任务状态、生成进度 |
| 支付 | Stripe | — | 订阅和积分包（第一版 mock） |
| 包管理（前端）| pnpm | 10.x | 快速、磁盘高效 |
| 包管理（后端）| NuGet | — | .NET 标准 |

## 数据库表

| 表名 | 所属 Phase | 用途 |
|------|-----------|------|
| `Users` | Phase 2 | 登录用户、邮箱、头像、注册时间、状态 |
| `Workspaces` | Phase 2 | 个人工作区，预留团队空间 |
| `WorkspaceMembers` | Phase 2 | 用户与工作区关系，第一版默认 owner |
| `CreditAccounts` | Phase 2 | 用户/工作区积分余额 |
| `CreditTransactions` | Phase 2 | 积分发放、冻结、扣除、退回记录 |
| `Subscriptions` | Phase 2 | 订阅计划、状态、周期、权益 |
| `Projects` | Phase 3 | 项目基础信息、创作目标、画幅、片长 |
| `Shots` | Phase 4 | 镜头编号、时长、核心内容、提示词、生成参数 |
| `Assets` | Phase 6 | 上传素材、生成图片的存储信息 |
| `GenerationJobs` | Phase 5 | AI 任务类型、状态、输入、输出、错误、积分扣费 |
| `BillingEvents` | Phase 7 | 支付回调、发票、退款、订阅变更 |

## 开发规则

- 每完成一个 Phase 执行四步走：Code Review → 测试完整性 → 编译验证 → 功能测试
- 四步走全部通过后才能 commit
- Commit message 格式：`phase-N: 简要描述`
- 前端包管理器：pnpm
- 后端包管理器：NuGet
- 前后端分别在 `Storyboard.Web/` 和 `Storyboard.WebApi/` 目录下独立运行
