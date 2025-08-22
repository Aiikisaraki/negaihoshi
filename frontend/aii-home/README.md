# 星の海の物語 - 前端项目

这是一个基于 React + TypeScript + Vite 构建的现代化前端项目。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
npm run setup-env

# 或者手动复制
cp env.example .env
```

编辑 `.env` 文件，配置你的API地址：

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:9292/api

# Development Configuration
VITE_DEV_MODE=true
VITE_DEBUG_MODE=false

# Optional: Custom API timeout (in milliseconds)
VITE_API_TIMEOUT=30000
```

### 3. 启动开发服务器

```bash
npm run dev
```

## 📁 项目结构

```
src/
├── components/          # 组件目录
│   ├── ui/             # 通用UI组件
│   ├── background/     # 背景相关组件
│   ├── feed/          # 内容流组件
│   ├── user/          # 用户相关组件
│   ├── feedback/      # 反馈组件
│   ├── markdown/      # Markdown组件
│   ├── wordpress/     # WordPress集成组件
│   ├── admin/         # 管理组件
│   └── auth/          # 认证组件
├── pages/             # 页面组件
├── requests/          # API请求
├── config/            # 配置文件
├── styles/            # 样式文件
└── assets/            # 静态资源
```

## ⚙️ 配置说明

### API配置

项目支持通过环境变量配置后端API地址：

- `VITE_API_BASE_URL`: API基础URL（默认：`http://localhost:9292/api`）
- `VITE_API_TIMEOUT`: API请求超时时间（默认：30000ms）
- `VITE_DEBUG_MODE`: 是否启用调试模式（默认：false）
- `VITE_DEV_MODE`: 是否启用开发模式（默认：true）

详细配置说明请查看 [API_CONFIG.md](./API_CONFIG.md)。

### 开发模式功能

在开发模式下，页面右下角会显示一个配置按钮，点击可以查看当前的API配置信息。

## 🛠️ 可用脚本

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm run build:prod       # 构建生产版本（禁用调试）
npm run build:dev        # 构建开发版本（启用调试）
npm run preview          # 预览构建结果

# 代码质量
npm run lint             # 运行ESLint检查

# 环境设置
npm run setup-env        # 复制环境变量示例文件
npm run setup-env:win    # Windows环境设置脚本
npm run setup-env:unix   # Unix环境设置脚本
```

## 🎨 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **路由**: React Router DOM
- **HTTP客户端**: Axios
- **动画**: Framer Motion
- **Markdown**: React Markdown

## 🔧 开发指南

### 组件开发

1. 组件按功能分类放置在 `src/components/` 下的相应子目录中
2. 使用 TypeScript 进行类型检查
3. 遵循 React Hooks 最佳实践
4. 使用 Tailwind CSS 进行样式开发

### API集成

1. 所有API请求通过 `src/requests/api/index.ts` 中的 `apiClient` 进行
2. 支持环境变量配置API地址
3. 统一的错误处理和响应格式

### 样式开发

1. 主要使用 Tailwind CSS 类名
2. 自定义样式放在 `src/styles/` 目录下
3. 支持响应式设计

## 📝 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `VITE_API_BASE_URL` | `http://localhost:9292/api` | 后端API基础URL |
| `VITE_API_TIMEOUT` | `30000` | API请求超时时间（毫秒） |
| `VITE_DEBUG_MODE` | `false` | 是否启用调试模式 |
| `VITE_DEV_MODE` | `true` | 是否启用开发模式 |

## 🚀 部署

### 生产环境构建

```bash
# 构建生产版本
npm run build:prod

# 构建文件位于 dist/ 目录
```

### Docker部署

项目包含 Dockerfile，支持容器化部署：

```bash
# 构建镜像
docker build -t aii-home .

# 运行容器
docker run -p 80:80 aii-home
```

## 📚 文档

- [API配置说明](./API_CONFIG.md) - 详细的API配置指南
- [组件文档](./doc/) - 项目文档和更新日志

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
