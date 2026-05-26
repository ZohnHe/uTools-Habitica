# HabitTools 重构设计文档

## 概述

将现有基于 Vue 2 + Element UI 的单文件 uTools 插件，渐进升级为 Vue 3 + Element Plus + Vite 的现代化架构。保留现有全部功能，重构外观为更现代的设计（Habitica 紫为标记色），新增明暗模式切换，并增强拖拽排序、快捷键、通知体验。

## 目标

- 技术栈：Vue 2 + Element UI → Vue 3 + Element Plus + Vite
- 外观：现代化 UI，弹性布局，CSS 变量驱动主题
- 主题：自动检测系统暗色 + 手动切换 + 持久化偏好
- 功能增强：拖拽排序优化、快捷键支持、通知增强
- 代码组织：单文件拆分为 Vue SFC + 组合式函数

## 目录结构

```
habitTools/
├── plugin.json                  # uTools 配置，main 指向 dist/index.html
├── vite.config.js               # Vite 配置
├── index.html                   # Vite 入口 HTML
├── public/
│   └── svg/                     # 静态 SVG 图标（职业图标等）
├── src/
│   ├── main.js                  # Vue 3 应用入口
│   ├── App.vue                  # 根组件：布局框架 + 全局状态注入
│   ├── api/
│   │   ├── habitica.js          # Habitica API 封装（ES Module 导出）
│   │   └── questMap.js          # 副本/收集品中文映射
│   ├── composables/
│   │   ├── useTheme.js          # 明暗模式检测、切换、持久化
│   │   ├── useUser.js           # 用户信息、HP/EXP/MP/GP、登录态
│   │   ├── useTasks.js          # 四类任务 CRUD、筛选标签、拖拽
│   │   ├── useParty.js          # 队伍信息、副本、聊天
│   │   └── useShortcut.js       # 全局快捷键注册与管理
│   ├── components/
│   │   ├── Loading.vue          # 加载动画
│   │   ├── TaskCard.vue         # 单条任务卡片（四种类型渲染）
│   │   ├── TaskList.vue         # 列表容器 + 拖拽 + 空状态
│   │   ├── SideMenu.vue         # 侧边栏：菜单 + 头像 + 金币 + 主题切换 + 标签
│   │   ├── StatusBar.vue        # 顶部 HP/EXP/MP 进度条
│   │   ├── ThemeToggle.vue      # 明暗模式切换按钮
│   │   ├── SkillPanel.vue       # 技能面板
│   │   ├── TaskDetail.vue       # 任务编辑抽屉
│   │   ├── CreateInput.vue      # 底部全局输入框
│   │   ├── StatusToast.vue      # 状态变化通知（+20 EXP 等）
│   │   └── UndoneDialog.vue     # 昨日未完成任务弹窗
│   ├── views/
│   │   ├── LoginView.vue        # 登录抽屉内容
│   │   ├── HabitView.vue        # 习惯页面
│   │   ├── DailyView.vue        # 每日任务页面
│   │   ├── TodoView.vue         # 待办页面
│   │   ├── RewardView.vue       # 奖励页面
│   │   └── PartyView.vue        # 队伍页面
│   ├── utils/
│   │   ├── db.js                # utools.db 封装（get/save/del）
│   │   └── helpers.js           # markedText、getColorByValue、日期处理
│   └── styles/
│       ├── variables.css        # 自定义 CSS 变量（品牌色 + 明暗色值）
│       └── main.css             # 全局样式 + Element Plus 变量覆盖
└── dist/                        # Vite 构建输出（gitignore）
```

## 技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| 框架 | Vue 3.4+ | Composition API + `<script setup>` |
| 组件库 | Element Plus | 按需引入，暗色模式原生支持 |
| 构建工具 | Vite 5+ | 开发服务器 + 生产打包 |
| 拖拽 | vue-draggable-plus | Vue 3 兼容版 SortableJS |
| Markdown | marked | 沿用现有库，升级版本 |
| HTTP | axios | 沿用现有库 |

## 主题系统

### 设计原则

- Habitica 品牌色（`#4F2A93` / `#432874`）作为标记色，不随主题变化
- 背景、文字、边框等颜色通过 CSS 变量切换
- Element Plus 暗色模式与自定义变量双轨并行

### CSS 变量

```css
/* variables.css */
:root {
  --hb-primary: #4F2A93;
  --hb-primary-light: #612CA7;
  --hb-primary-dark: #432874;

  /* 亮色 */
  --bg-base: #F5F3F8;
  --bg-card: #FFFFFF;
  --bg-hover: #FDFDFD;
  --bg-sidebar: #EEF1F6;
  --text-primary: #2D2D2D;
  --text-secondary: #666666;
  --text-muted: #909399;
  --border-color: #E4E7ED;
  --shadow-color: rgba(79, 42, 147, 0.08);
}

[data-theme="dark"] {
  --bg-base: #1A1A1D;
  --bg-card: #242428;
  --bg-hover: #2E2E33;
  --bg-sidebar: #1E1E22;
  --text-primary: #EAEAEA;
  --text-secondary: #B0B0B0;
  --text-muted: #888888;
  --border-color: #3A3A40;
  --shadow-color: rgba(0, 0, 0, 0.25);
}
```

### Element Plus 暗色覆盖

```css
html.dark {
  --el-bg-color: var(--bg-base);
  --el-bg-color-overlay: var(--bg-card);
  --el-text-color-primary: var(--text-primary);
  --el-border-color: var(--border-color);
  --el-color-primary: var(--hb-primary);
}
```

### 切换逻辑（useTheme.js）

初始化优先级：
1. `utools.db` 中保存的 `THEME_PREF`
2. 若未保存，调用 `utools.isDarkColors()`
3. 兜底为亮色

切换时同步：
- `html` 的 `data-theme` 属性（自定义变量）
- `html` 的 `class="dark"`（Element Plus）
- `utools.db` 持久化偏好

### UI 入口

`ThemeToggle.vue` 放置在侧边栏用户头像附近，图标随主题切换 `Sunny` / `Moon`。

## 组件架构

### 根组件 App.vue

职责：
- 挂载明暗模式类名
- 全局加载状态管理
- 布局框架：SideMenu + 主内容区 + 底部输入框
- 监听 `utools.onPluginEnter` 触发数据同步
- 全局键盘事件委托

### 状态管理

不引入 Pinia，使用 `provide/inject` + 组合式函数：

```js
// App.vue
const user = useUser();
const tasks = useTasks();
const party = useParty();
const theme = useTheme();

provide('user', user);
provide('tasks', tasks);
provide('party', party);
provide('theme', theme);
```

各页面/组件通过 `inject` 获取，保持响应式引用。

### 页面视图

主内容区通过 `menuVal` 条件渲染六个视图：

```vue
<el-main>
  <HabitView v-if="menuVal === 1" />
  <DailyView v-else-if="menuVal === 2" />
  <TodoView v-else-if="menuVal === 3" />
  <RewardView v-else-if="menuVal === 4" />
  <PartyView v-else-if="menuVal === 5" />
</el-main>
```

每个 View 只负责：
- 展示当前筛选标签对应的 `showTaskList`
- 处理该类型特有的交互逻辑
- 复用 `TaskList` / `TaskCard` 公共组件

### 关键公共组件

| 组件 | 核心职责 |
|---|---|
| `SideMenu.vue` | 菜单导航、用户头像/信息、金币显示、主题切换按钮、底部标签栏 |
| `StatusBar.vue` | HP/EXP/MP 三条进度条，使用 Element Plus `el-progress` |
| `TaskCard.vue` | 四种渲染模式：习惯（+/- 按钮）、每日（复选框 + checklist）、待办（复选框 + 日期）、奖励（金币图标） |
| `TaskList.vue` | 包裹 `vue-draggable-plus`，处理拖拽回调，空状态展示 |
| `TaskDetail.vue` | 抽屉形式编辑任务，复用现有字段逻辑 |
| `CreateInput.vue` | 底部输入框，根据 `menuVal` 切换 placeholder 和提交行为 |
| `StatusToast.vue` | 数值变化通知展示（+20 EXP 等），精简单行样式 |

## 功能增强

### 1. 拖拽排序优化

- 库替换：`vuedraggable` → `vue-draggable-plus`
- `v-model` 绑定 `showTaskList`，拖拽结束事件直接获取 `newIndex`
- 在 `TaskList.vue` 中统一计算源数组（`habitList` / `dailyList`...）对应的目标索引，调用 `dragHabiticaTask`
- 视觉反馈：拖拽中卡片 `opacity: 0.8` + `transform: scale(1.02)` + 阴影加深，占位符为虚线边框

### 2. 快捷键支持

注册于 `App.vue` 的 `onMounted`，通过 `useShortcut` 统一管理：

| 快捷键 | 作用 |
|---|---|
| `Ctrl/Cmd + 1~5` | 切换五个主菜单 |
| `Ctrl/Cmd + N` | 聚焦底部输入框 |
| `Ctrl/Cmd + R` | 同步数据（刷新） |
| `Ctrl/Cmd + D` | 切换明暗模式 |
| `Enter` | 提交输入框内容（聚焦时） |
| `Esc` | 关闭任务详情抽屉 / 取消输入 |

### 3. 通知增强

- **数值变化通知**：操作成功后，HP/EXP/MP/GP 的增减以单行 toast 形式展示，格式如 `+20 EXP`、`-5 HP`、`+1.5 GP`，带对应颜色（绿/红/黄/橙）
- **连续通知**：不合并，保持一条条刷出，增强反馈感
- **错误通知**：网络异常或 API 错误时，右上角固定通知，带"重试"按钮，点击直接重试上一次操作
- **系统级通知**：本次不做

## API 层

现有 `habitica.js` 逻辑基本复用，改为 ES Module 导出：

```js
// api/habitica.js
export function getHBUserInfo(doAfter) { ... }
export function getHBHabit(doAfter) { ... }
export function updateHBTask(id, body, doAfter) { ... }
// ... 其余函数
```

请求头 `headers` 改为在 `useUser.js` 中管理，通过闭包或 ref 存储当前用户的 `x-api-user` 和 `x-api-key`。

## 构建配置

### vite.config.js 要点

- `base: './'`：确保 uTools 本地加载路径正确
- `outDir: 'dist'`
- Element Plus 按需引入（`vite-plugin-element-plus` 或 `unplugin-vue-components`）
- 开发时 `server.port` 设为不冲突端口

### plugin.json 调整

```json
{
  "main": "dist/index.html"
}
```

### 开发流程

1. `npm run dev`：Vite 开发服务器，热更新
2. `npm run build`：打包到 `dist/`
3. 在 uTools 开发者工具中加载项目根目录（`plugin.json` 所在目录）

## 数据流

```
utools.onPluginEnter → App.vue 初始化
  → useUser.loginCheck() → 未登录则打开 LoginView
  → 已登录则 useUser.sync() + useTasks.sync() + useParty.sync()
    → API 层 (api/habitica.js)
      → 响应数据更新 provide 的状态
        → 各 View 组件通过 inject 获取，自动渲染
```

## 边界与限制

- 保持与现有 Habitica API v4 的兼容性，不改接口调用逻辑
- `utools.db` 的 key 命名保持兼容（`USER_INFO`、`TAG_SETTING`），新增 `THEME_PREF`
- 拖拽排序的 API 调用行为与现有逻辑保持一致，仅优化内部计算方式
- 现有 `QUEST_MAP` / `COLLECT_MAP` 直接迁移到 `api/questMap.js`，内容不变
