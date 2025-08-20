# 前后端集成与改进更新日志（增补）

## 2025-08-20 - 前后端修复与功能增强（资料、编辑器、互动、游客树洞）

### 更新内容

#### 1. 资料保存与鉴权、跨域
**修改文件**:
- `server/src/web/middleware/login.go`
- `server/src/web/user.go`
- `server/main.go`

**更新内容**:
- 统一会话 `userId` 为 `int64` 并在 handler 端安全提取，修复资料保存 500。
- CORS 显式放行 `OPTIONS` 等方法；登录中间件允许 `OPTIONS` 直接返回。
- 扩充忽略路径，放开只读接口（文章列表、详情、公开资料、互动计数等）。

#### 2. 个人资料编辑与同步
**修改文件**:
- `frontend/aii-home/src/components/ProfilePanel.tsx`
- `frontend/aii-home/src/App.tsx`
- `server/src/web/user.go`

**更新内容**:
- 前端通过父级统一提交与回写；后端 `PUT /api/users/profile` 返回最新资料并被前端采纳。
- 新增 `GET /api/users/profile/:id` 供未登录用户访问他人资料。

#### 3. 头像展示与回退
**修改文件**:
- `frontend/aii-home/src/components/AvatarImage.tsx`（新增）

**更新内容**:
- 统一头像组件，失败（404/400/401/CORS）回退默认 SVG；首页、详情、个人中心均使用。

#### 4. Toast 通知
**修改文件**:
- `frontend/aii-home/src/components/Toast.tsx`（新增）
- `frontend/aii-home/src/main.tsx`

**更新内容**:
- 全站替换浏览器 `alert` 为自研 toast。

#### 5. Markdown 编辑器增强
**修改文件**:
- `frontend/aii-home/src/components/MarkdownEditor.tsx`

**更新内容**:
- 工具栏快捷按钮与键盘快捷键；编辑/预览 Tab；`editorMinHeight`/`dense`；修复字符串常量与样式拼写。

#### 6. 文章/说说创建、编辑、详情与列表
**修改文件**:
- `frontend/aii-home/src/pages/CreatePostPage.tsx`
- `frontend/aii-home/src/pages/CreateStatusPage.tsx`
- `frontend/aii-home/src/pages/PostDetailPage.tsx`
- `server/src/web/status_and_posts.go`
- `server/src/repository/status_and_posts.go`

**更新内容**:
- 编辑模式预填原文；详情 GET 拉取并修正大小写/时间字段；浏览器标题动态更新。

#### 7. 互动（点赞/评论/关注）
**修改文件**:
- `server/src/repository/dao/interaction.go`
- `server/src/service/interaction.go`
- `server/src/web/interaction.go`
- `frontend/aii-home/src/requests/interact.ts`（新增）
- `frontend/aii-home/src/pages/PostDetailPage.tsx`
- `frontend/aii-home/src/pages/ProfilePage.tsx`
- `frontend/aii-home/src/App.tsx`

**更新内容**:
- 点赞唯一性与计数回传；首页/个人中心快捷评论显示最近 10 条，文章详情查看更多；个人中心按“自己/他人”切换操作集合。

#### 8. 路由与导航
**修改文件**:
- `frontend/aii-home/src/App.tsx`
- `frontend/aii-home/src/components/Navigation.tsx`

**更新内容**:
- 统一个人中心 URL 为 `/profile/:id`；修复新用户/未登录跳转问题；导航使用 `<Link>` 保证状态同步。

#### 9. 游客树洞：IP+Redis 限流与匿名发布、额度显示
**修改文件**:
- `server/src/web/treehole.go`
- `server/main.go`
- `frontend/aii-home/src/components/EditorPanel.tsx`
- `frontend/aii-home/src/components/Timeline.tsx`
- `frontend/aii-home/src/requests/posts.ts`

**更新内容**:
- 游客发布使用 Redis 计数 Key：`guest:treehole:{ip}:{yyyy-mm-dd}`，首写设置今日过期，超限 429。
- 登录用户可“匿名发布”（以 `user_id=0` 入库）；时间线对 `userId>0` 展示头像与昵称，可跳转 `/profile/:id`。
- 首页树洞编辑区对游客开放；未登录显示“今日剩余 remaining/limit”，发布成功与超限后实时刷新。
- 新增 `GET /api/treehole/guest-quota` 返回 `{limit, used, remaining}`，并加入登录忽略列表。

### 影响分析

#### 正面影响
- 大量稳定性与体验修复（资料保存 500、详情未找到、登录态错判）。
- 游客可用性增强（匿名树洞、配额提示）、编辑器与交互体验更好。
- 前后端数据与权限一致性提升。

#### 注意事项
- `config.json` 需包含 Redis 配置与 `guest.daily-treehole-limit`（默认 5）。
- 需确保 Redis 可用以启用游客限额。

### 技术细节
- 前端：React、React Router、Axios、Tailwind、Framer Motion、ReactMarkdown、Toast。
- 后端：Gin、GORM、MySQL、Redis(v9)、Sessions、统一响应。

### 测试验证
- 手测覆盖：
  - 资料保存后前端即时刷新。
  - 未登录可浏览文章与公开资料；点赞计数/评论列表可读。
  - 游客树洞配额查询/发布/超限提示正确；登录匿名与实名展示正确。
  - 文章/说说创建、编辑、详情显示与评论流程正常。
## 2025-08-14 - 前后端功能集成与界面优化

### 更新内容

#### 1. 前端界面重构
**修改文件**: 
- `frontend/aii-home/src/App.tsx`
- `frontend/aii-home/src/components/EditorPanel.tsx`
- `frontend/aii-home/src/pages/ProfilePage.tsx`
- `frontend/aii-home/src/components/Navigation.tsx`

**更新内容**:
- 移除了主页的大标题"星の海の物語"
- 移除了主页的"说说管理"和"文章管理"入口链接
- 简化了主页发布树洞编辑区域，移除了说说和文章编辑模式
- 完全移除了编辑器中的说说和文章相关残留标签
- 优化了个人中心页面，将文章管理和说说管理整合到标签页导航中
- 创建了独立的文章创建页面和说说创建页面
- 集成了Markdown编辑器，支持实时预览功能
- 实现了说说有效字符数限制（200字符以内）
- 创建了文章和说说详情页面，用于展示格式化内容

#### 2. 后端数据库初始化修复
**修改文件**: `server/main.go`

**更新内容**:
- 修复了数据库初始化函数，添加了状态表(status)和文章表(posts)的初始化调用
- 解决了"Table 'negaihoshi.posts' doesn't exist"的错误问题
- 确保系统启动时能正确创建所有必需的数据表

#### 3. Git忽略配置更新
**修改文件**: `.gitignore`

**更新内容**:
- 将uploads目录及其所有内容添加到Git忽略列表中
- 避免用户上传的文件被提交到代码仓库
- 保护用户隐私并减少仓库大小

### 影响分析

#### 正面影响
- 用户体验改进：界面更加简洁，功能模块划分更清晰
- 技术优势：集成了Markdown编辑和预览功能，提升内容创作体验
- 性能提升：通过Git忽略上传文件，减小了仓库体积

#### 注意事项
- 需要注意的问题：用户需要通过个人中心访问文章和说说管理功能
- 兼容性说明：Markdown功能需要用户了解基本的Markdown语法
- 迁移指南：原有主页的管理入口已移至个人中心，用户需要适应新的导航方式

### 技术细节
- **技术栈**: React, Go, Gin, GORM, MySQL, react-markdown
- **架构变化**: 采用标签页导航模式重构个人中心，分离了内容创建和管理功能
- **依赖更新**: 添加了react-markdown和@tailwindcss/typography依赖

### 测试验证
- 功能测试结果：所有修改的功能均已通过手动测试验证
- 性能测试结果：界面响应速度得到提升
- 兼容性测试结果：在不同屏幕尺寸下均能正常显示