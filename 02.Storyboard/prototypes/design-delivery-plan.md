# Storyboard Web Design Delivery Plan

## 设计依据

- Product Spec: `../Product-Spec.md`
- Design Brief: `../Design-Brief.md`
- Interaction prototype: `storyboard-web-prototype.html`
- Walkthrough report: `prototype-walkthrough.md`

本轮进入正式界面设计阶段，目标不是开始工程开发，而是把第一版 A+B 范围内的页面、组件和关键状态固化为可交付设计稿。

## 设计变量

| 类型 | Token | 用途 |
| --- | --- | --- |
| 背景 | `bg.app #07090D` | 应用最底层背景 |
| 背景 | `bg.panel #10141C` | 顶栏、侧栏、属性面板 |
| 背景 | `bg.surface #151B24` | 卡片、弹窗、抽屉 |
| 边框 | `border.default #283140` | 面板和控件分隔 |
| 文本 | `text.primary #F3F6FA` | 主文本 |
| 文本 | `text.secondary #A9B4C2` | 次级说明 |
| 文本 | `text.muted #6F7B8C` | 元信息 |
| 品牌 | `brand.primary #6C7CFF` | 主按钮、选中态、进度 |
| 品牌 | `brand.cyan #24D6C6` | 成功、生成完成 |
| 警告 | `warning #F4B860` | 积分不足、冻结提示 |
| 危险 | `danger #F26D6D` | 删除、失败 |
| 圆角 | `radius.sm 6` | 输入框、小标签 |
| 圆角 | `radius.md 8` | 卡片、弹窗、抽屉 |
| 间距 | `space.1-8` | 4/8/12/16/24/32/48 |

字体统一采用：

`I:\12_Vibe Coding\SuperPM\01.AI_SplitMater\font\MiSans VF.ttf`

HTML 原型通过 `@font-face` 本地加载，Pencil 画布节点使用 `fontFamily: "MiSans VF"`。正式前端开发时建议优先使用可变字体 `MiSans VF.ttf`，按需 fallback 到系统中文字体。

## 可复用组件

| 组件 | 变体 |
| --- | --- |
| Button | primary, secondary, ghost, danger, icon |
| Input | text, search, textarea, select |
| Status Badge | draft, queued, running, generated, failed, refunded |
| Credit Badge | trial balance, subscription, insufficient |
| Project Card | default, selected, empty thumbnail |
| Shot Card | default, selected, generating, failed, batch selected |
| Frame Thumbnail | empty, skeleton, generated, failed |
| Job Item | queued, running, succeeded, failed/refunded |
| Asset Tile | generated image, uploaded reference, empty |
| Modal | new project, billing, export, credit insufficient |
| Drawer | task queue |
| Account Menu | profile, billing, invoices, permission simulation, logout |
| Empty State | project empty, shot empty, asset empty |
| Permission State | 403 / project not found |
| Timeline Clip | read-only shot duration block |

## 页面与状态清单

| 页面/视图 | 必须覆盖的状态 |
| --- | --- |
| 登录/注册 | 登录、注册、第三方登录入口、错误提示 |
| 项目列表 | 默认、搜索、空状态、加载骨架、创建项目入口 |
| 新建项目 | 基础表单、可选高级字段、提交中、校验错误 |
| 项目工作台 | 三栏默认态、自动保存、生成任务运行中 |
| 分镜列表 | 默认、选中、批量选择、生成中、生成失败、空状态 |
| 镜头详情 | 基础信息、首帧/尾帧提示词、图像参数、失败重试 |
| 时间线草图 | 只读镜头顺序、时长比例、第一版边界提示 |
| 素材库 | 图片网格、筛选、空状态、绑定镜头信息 |
| 任务队列 | 收起、展开、排队、运行、成功、失败退款 |
| 积分不足 | 预计消耗、当前余额、订阅升级、积分包购买 |
| 账户与计费 | 个人资料、订阅、积分流水、账单记录 |
| 导出 | Markdown、CSV、PDF 增强项、是否包含图片/提示词 |
| 权限错误 | 无权访问、项目不存在、返回个人项目 |

## 本轮设计稿交付

第一轮正式画稿先覆盖最高风险的核心链路：

1. 登录/注册
2. 项目列表
3. 项目工作台
4. 积分不足弹窗
5. 任务队列抽屉
6. 账户与计费弹窗
7. 权限错误页

HTML 原型已经验证过交互闭环。本轮 Pencil 设计稿重点解决视觉系统、信息密度、控件一致性和状态表现，后续开发计划应以这套设计稿为主、HTML 原型为交互参考。
