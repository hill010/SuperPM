# Storyboard Web Design Stage Report

## 本轮目标

继续设计环节，在进入代码开发前，把第一版外部创作者 SaaS 的核心界面、关键状态和视觉系统形成可交付设计稿。

## 已完成交付物

| 文件 | 用途 |
| --- | --- |
| `design-delivery-plan.md` | 页面、组件、状态和设计变量清单 |
| `storyboard-web-hifi-design.html` | 高保真设计板，覆盖核心页面和关键状态 |
| `storyboard-web-design.pen` | Pencil 设计画布，已参考 `01.AI_SplitMater/Design-System.md` 重绘 |
| `visual-reference-notes.md` | 前端参考图视觉提取与 Storyboard Web 转译说明 |
| `storyboard-web-prototype.html` | 可点击交互原型，继续作为流程走查参考 |
| `prototype-walkthrough.md` | 原型走查与问题修复记录 |

## 高保真设计板覆盖范围

| 画面 | 覆盖内容 |
| --- | --- |
| 01 Login / Register | 登录、注册入口、第三方登录、试用积分信任信息 |
| 02 Projects / Default | 个人项目列表、搜索、积分余额、新建项目入口、项目卡片 |
| 03 Workspace / Shot List | 三栏工作台、脚本输入、分镜列表、镜头详情、首尾帧生成 |
| 04 Credit Insufficient / Billing | 积分不足、预计消耗、当前余额、订阅和积分包入口 |
| 05 Task Queue Drawer | 排队、运行、成功、失败退款、非阻塞抽屉 |
| 06 Timeline / Assets / Permission | 时间线草图、素材库、无权限/项目不存在状态 |

## 设计一致性检查

- 第一版只覆盖 A+B：文本到分镜表、文本到首尾帧图。
- 未放入视频生成、TTS、最终合成、剪映草稿导出入口。
- 未放入团队邀请或共享入口，权限仍表现为个人项目访问。
- 积分消耗、冻结、失败退款和余额不足都有明确界面表达。
- 卡片只用于项目、镜头、素材和任务项，没有把整页 section 做成装饰卡片。
- 默认深色工作台，信息密度偏紧凑，符合 Design Brief 的专业创作工具方向。

## 本轮界面优化

已根据 `01.AI_SplitMater\前端参考图` 和 `01.AI_SplitMater\Design-System.md` 对 `storyboard-web-hifi-design.html` 做重新优化：

- 品牌色统一改为 `#2458FF`。
- 字体统一使用 `MiSans VF.ttf`。
- 页面底色从纯深色改为参考图式浅灰编辑区。
- 登录页改为深蓝媒体场 + 白色登录浮岛。
- 项目卡片、计费弹窗、权限状态改为白色大圆角浮岛。
- 工作台保持工具效率：左侧深色控制区，中间浅色分镜列表，右侧白色属性面板。
- 生成图、素材缩略图和状态卡使用深蓝影像感容器，避免普通后台卡片感。

## Pencil 设计稿重构

用户反馈 Pencil 视觉未达到参考标准后，已重新构建：

`storyboard-web-design.pen`

本次不是局部换色，而是按参考图重新组织空间关系：

- `01 Reference-calibrated login`：白色品牌区 + 深蓝媒体场 + 白色产品浮岛 + 登录卡片。
- `02 Projects / white island dashboard`：浅灰页面 + 底部深蓝媒体层 + 白色项目浮岛。
- `03 Workbench / cinematic product shell`：深蓝背景中的白色产品壳，内部保留深色侧栏、浅色分镜区和白色属性面板。
- `04 Billing / queue / permission islands`：计费、任务队列、权限错误统一为大圆角状态浮岛。
- `05 Reference rules / implementation guide`：记录参考标准和落地规则，防止后续开发回到普通后台风格。

校验结果：`PEN_JSON_OK`。

## Pencil 状态

已检测到 Pencil MCP 可用。当前已生成目标画布：

`I:\12_Vibe Coding\SuperPM\02.Storyboard\prototypes\storyboard-web-design.pen`

画布内容已参考：

- `I:\12_Vibe Coding\SuperPM\01.AI_SplitMater\Design-System.md`

采用了品牌蓝 `#2458FF`、深色侧栏 `#0B0E16`、浅色工作区 `#F7F7F5/#F4F4F2`、白色产品面板、圆角按钮和三栏工作区比例。

字体统一采用：

`I:\12_Vibe Coding\SuperPM\01.AI_SplitMater\font\MiSans VF.ttf`

同时已参考视觉目录：

`I:\12_Vibe Coding\SuperPM\01.AI_SplitMater\前端参考图`

并在 Pencil 画布中新增 `05 Visual Reference Mapping`，用于记录深蓝媒体场、白色浮岛、大圆角卡片、超大标题和灰度文字层级如何转译到 Storyboard Web。

如果 Pencil MCP 读取到的不是这个文件，请在 Pencil 桌面端重新打开 `storyboard-web-design.pen`，再进行截图和布局校验。

## 建议下一步

下一环节建议进入开发计划阶段，输出前后端拆分、数据模型、API、任务队列、计费和第一版里程碑。开发计划应以 `storyboard-web-hifi-design.html` 作为视觉参考，以 `storyboard-web-prototype.html` 作为交互参考。
