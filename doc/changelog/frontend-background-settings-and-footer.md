## 2025-08-21 - 前端背景设置悬浮球与页脚集成、登录资料与交互增强

### 更新内容

#### 1. 背景设置重构为可拖拽悬浮球
**修改文件**: `frontend/aii-home/src/components/FloatingBackgroundSettings.tsx`, `frontend/aii-home/src/styles/floatingBackgroundMenu.css`, `frontend/aii-home/src/App.tsx`

**更新内容**:
- 新增可拖拽的背景设置悬浮球，支持在页面任意位置打开菜单与移动位置，位置持久化至本地。
- 背景图 URL 验证、预览、应用与重置逻辑完备，错误提示更友好。
- 将背景相关的样式抽离到独立样式文件，提升可维护性。

**技术细节**:
- 使用 `framer-motion` 实现进入/退出与拖拽动画，结合本地存储键 `customBackground` 与 `backgroundButtonPosition` 持久化背景与位置。
- 通过设置 CSS 变量 `--background-image` 驱动全局背景渲染，避免侵入式修改布局。

#### 2. 页脚组件集成与备案信息展示
**修改文件**: `frontend/aii-home/src/components/Footer.tsx`, `frontend/aii-home/src/App.tsx`

**更新内容**:
- 新增通用页脚组件，统一展示版权信息与备案号（含跳转链接）。
- 在所有路由下全局展示页脚（Routes 之外渲染）。

**技术细节**:
- `Footer` 接受 `copyrightYear`、`copyrightName`、`recordNumber`。
- 默认备案链接跳转至工信部备案系统。

#### 3. 登录与个人资料同步增强
**修改文件**: `frontend/aii-home/src/App.tsx`

**更新内容**:
- 登录成功后主动拉取 `/users/profile` 并写入本地，失败时提供默认资料兜底，保证最小可用。
- 页面首次渲染时根据 `localStorage` 恢复 `isLoggedIn` 与 `userProfile`。
- 进入个人中心时优先使用内存与本地资料的 `id`，缺失则退化为后端拉取，最终兜底到 `/profile`。

**技术细节**:
- 使用本地存储键 `isLoggedIn`、`userProfile` 管理登录态与资料快照。
- 在登录、登出流程中统一更新本地与内存状态。

#### 4. 文章列表点赞与评论交互增强
**修改文件**: `frontend/aii-home/src/App.tsx`

**更新内容**:
- 首页文章列表拉取后批量获取点赞数量与当前用户点赞状态，支持点赞/取消点赞与评论展开、发送与预览。
- 未登录用户在交互区域展示引导登录的提示。

**技术细节**:
- 通过 `requests/interact` 的 `likeCount`、`isLiked`、`like`、`unlike`、`listComments`、`addComment` 完成交互流程。
- 对后端字段大小写差异（`id/Id`、`userId/UserId` 等）做兼容性规范化处理。

#### 5. 全局与样式细化
**修改文件**: `frontend/aii-home/src/styles/globals.css`, `frontend/aii-home/src/styles/backgroundMenu.css`, `frontend/aii-home/src/styles/floatingBackgroundMenu.css`, `frontend/aii-home/src/components/BackgroundSettings.tsx`

**更新内容**:
- 新增 CSS 变量与 `main-content-glass` 毛玻璃样式，优化主内容区域视觉统一性。
- 原背景设置组件样式迁移至组件内与独立样式文件，保持清晰边界。

### 影响分析

#### 正面影响
- 用户可自定义站点背景并持久化，交互更自由且不遮挡内容。
- 页脚统一呈现版权与备案信息，提升合规与品牌一致性。
- 登录与资料同步更稳健，减少空状态与导航失败。
- 文章互动更完整，增强社区氛围与使用粘性。

#### 注意事项
- 本地存储键：`customBackground`、`backgroundButtonPosition`、`isLoggedIn`、`userProfile`。
- 如需替换备案号，请在 `Footer` 组件的 `recordNumber` 传入实际值。
- 若后端返回的字段命名有差异，请保持现有兼容逻辑或在接口层统一。

### 技术细节
- 技术栈：React + TypeScript + framer-motion + Tailwind CSS。
- 架构变化：在 `App.tsx` 中将 `Footer` 与 `FloatingBackgroundSettings` 作为全局组件渲染；路由与登录、资料状态管理更清晰。
- 依赖更新：未新增第三方依赖（继续复用现有 `framer-motion`）。

### 测试验证
- 手动验证登录/登出、资料拉取与本地持久化。
- 验证悬浮球拖拽、贴边收缩、菜单显示、URL 验证与预览、应用与重置。
- 验证文章点赞/取消点赞、评论展开/发布、未登录提示与跳转。
- 多端（桌面与移动）外观与交互检查，确认不遮挡主要内容。




