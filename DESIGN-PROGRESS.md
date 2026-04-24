# 设计进度记录

## 当前状态

**日期**: 2024-04-24
**设计工具**: Figma MCP
**文件链接**: https://figma.com/design/aVy7liQJoPgE5PpGPgo4wW

## 已完成页面

### 1. Welcome Page (欢迎页) ✅

**Node ID**: `7:3`
**画布尺寸**: 1440x900 (Electron 桌面端)

**设计元素**:
- 环境光晕 (蓝色 #7:4, 紫色 #7:5) - LAYER_BLUR 100px
- 主卡片 #7:6 - 毛玻璃效果, 540x520, cornerRadius 48
- Logo Section #7:8 - 胶片图标 + "SplitMaster"
- 副标题 #7:15 - "AI 分镜大师"
- 主按钮 #7:16 - "新建项目", Accent 色 #738CF2
- 次按钮 #7:18 - "打开项目", 玻璃态
- 分隔线 #7:20
- 最近项目列表 #7:22 (2个卡片)
- 版本号 #7:29 - "Version 1.0.0"

**设计规格** (基于 Design-Brief.md):
- 底层背景: #121212
- 卡片层: #191919 (75% opacity)
- 悬浮层: #282828 (40% opacity)
- 强调色: #738CF2
- 文字白色, 透明度 95%/70%/50%

## 待完成页面

- [ ] 三栏主工作区页面
- [ ] 九宫格预览页面
- [ ] 四宫格预览页面
- [ ] 设置页面 (API Key 配置)
- [ ] 状态变体 (空状态/加载/错误)

## 技术要点

### Figma MCP use_figma 规则

1. **必须先加载 figma-use skill** - 传递 `skillNames: "figma-use"`
2. **颜色 0-1 范围** - 不是 0-255
3. **用 return 返回数据** - 不用 figma.notify()
4. **fills/strokes 只读** - 需克隆后重新赋值
5. **切换页面用 await figma.setCurrentPageAsync(page)** - 同步 setter 不工作
6. **返回所有创建的节点 ID** - 后续调用需要引用

### 常见错误

- `gradientHandlePositions` 无效 → 用 `gradientTransform`
- `counterAxisSizingMode: 'CENTER'` 无效 → 用 `counterAxisAlignItems = "CENTER"`
- `DROP_SHADOW` 不支持 → 只能用 `LAYER_BLUR`
- 新节点默认 (0,0) → 需手动定位避免重叠

## 参考文档

- Figma MCP Guide: `mcp-server-guide/` 目录
- gotchas 文档: `mcp-server-guide/skills/figma-use/references/gotchas.md`
- ui-ux-pro-max skill: `.claude/skills/design-maker/skills/ui-ux-pro-max/SKILL.md`
