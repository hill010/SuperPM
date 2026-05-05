# Phase 8 扩展计划：核心功能完善

> 基于 Product Spec 第一版范围，补齐核心功能差距。

---

## 交付清单

### 1. PDF 导出
- 后端：使用 QuestPDF 生成带首尾帧图片的 PDF
- API：`GET /api/export/project/{id}?format=pdf`
- 前端：ExportDialog 增加 PDF 选项

### 2. 真实图片生成
- 后端：接入真实 AI API（可配置 OpenAI DALL-E / Stability AI / Replicate）
- 使用用户配置的 API Key 或平台 Key
- 图片保存到本地文件系统（Phase 9 再接入云存储）

### 3. 批量图片生成完善
- 后端：`POST /api/image/batch` 完善任务创建逻辑
- 支持批量生成首帧、尾帧、或两者
- 返回任务 ID 列表供前端追踪

### 4. SignalR 实时推送
- 后端：GenerationHub 完善，推送任务状态变更
- 前端：useGeneration hook 连接 SignalR
- 任务完成时自动刷新分镜列表

### 5. 素材库页面
- 新增：`/project/[id]/assets` 页面
- 展示项目内所有生成的图片
- 按镜头筛选、按类型（首帧/尾帧）筛选
- 支持下载单张图片

### 6. 项目搜索与筛选
- 项目列表页增加搜索框
- 支持按名称模糊搜索
- 支持按更新时间排序

---

## 关键文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `Storyboard.WebApi/Services/ExportService.cs` | 修改 | 增加 PDF 导出 |
| `Storyboard.WebApi/Services/ImageGenerationService.cs` | 重写 | 接入真实 AI API |
| `Storyboard.WebApi/Services/IImageGenerationService.cs` | 修改 | 更新接口 |
| `Storyboard.WebApi/appsettings.json` | 修改 | 增加 AI API 配置 |
| `Storyboard.WebApi/Hubs/GenerationHub.cs` | 修改 | 完善推送逻辑 |
| `Storyboard.WebApi/Controllers/ImageController.cs` | 修改 | 完善批量生成 |
| `storyboard-web/src/components/project/export-dialog.tsx` | 修改 | 增加 PDF 选项 |
| `storyboard-web/src/hooks/use-generation.ts` | 修改 | 连接 SignalR |
| `storyboard-web/src/lib/signalr.ts` | 新建 | SignalR 客户端封装 |
| `storyboard-web/src/app/project/[id]/assets/page.tsx` | 新建 | 素材库页面 |
| `storyboard-web/src/components/assets/asset-grid.tsx` | 新建 | 素材网格组件 |
| `storyboard-web/src/app/page.tsx` | 修改 | 增加搜索筛选 |

---

## 技术方案

### PDF 生成
- 使用 QuestPDF（免费、开源、无需外部依赖）
- 每个镜头一页，包含：镜头编号、核心内容、首帧图、尾帧图、提示词

### 图片生成
- 抽象 IImageGenerationService 接口
- 实现 OpenAIImageGenerationService（调用 DALL-E 3）
- 实现 StabilityAIImageGenerationService（可选）
- 配置文件指定使用哪个 Provider

### SignalR
- 后端 Hub：`GenerationHub`
- 事件：`JobCreated`, `JobStarted`, `JobProgress`, `JobCompleted`, `JobFailed`
- 前端：连接 Hub，监听事件，更新任务列表

---

## 验收标准

1. PDF 导出包含首尾帧图片，格式正确
2. 图片生成调用真实 AI API，返回图片 URL
3. 批量生成创建多个任务，逐一执行
4. SignalR 推送实时更新任务状态
5. 素材库展示所有图片，可按镜头筛选
6. 项目列表支持搜索和排序

---

## 执行顺序

1. PDF 导出（纯后端，无外部依赖）
2. 素材库页面（纯前端，使用现有数据）
3. 项目搜索筛选（纯前端）
4. SignalR 实时推送（前后端联调）
5. 真实图片生成（需要 API Key 配置）
6. 批量生成完善（依赖图片生成）
