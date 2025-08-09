# 🌟 Negaihoshi (愿い星) - 星空树洞

> 一个现代化的匿名树洞系统，支持WordPress集成，让你在星空下分享心情与想法。

![技术栈](https://img.shields.io/badge/Go-1.21-blue)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Docker](https://img.shields.io/badge/Docker-ready-green)

## ✨ 特性

- 🌙 **匿名树洞** - 安全的匿名分享空间
- 🎨 **现代UI** - 基于玻璃拟态设计的现代界面
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🔗 **WordPress集成** - 支持绑定WordPress站点并转发内容
- 🚀 **实时更新** - 动态内容实时刷新
- 🐳 **容器化部署** - 一键Docker部署
- 🔐 **用户认证** - 完整的用户注册登录系统

## 🏗️ 技术架构

### 后端
- **Go 1.21** + **Gin** - 高性能Web框架
- **MySQL 8.0** - 主数据库
- **Redis** - 缓存和会话存储
- **GORM** - ORM框架
- **JWT** - 用户认证

### 前端
- **React 18** + **TypeScript** - 现代前端框架
- **Vite** - 构建工具
- **Tailwind CSS** - 原子化CSS框架
- **Framer Motion** - 动画库
- **Axios** - HTTP客户端

## 🚀 快速开始

### 环境要求

- Docker & Docker Compose
- Go 1.21+ (开发模式)
- Node.js 18+ (开发模式)

### 生产部署

```bash
# 克隆项目
git clone <repository-url>
cd negaihoshi

# 一键启动
chmod +x scripts/start.sh
./scripts/start.sh
```

访问 http://localhost:3000 即可使用！

### 开发模式

```bash
# 启动开发环境
chmod +x scripts/dev.sh
./scripts/dev.sh
```

开发服务将运行在：
- 前端: http://localhost:5173
- 后端: http://localhost:9292

## 📖 功能模块

### 🧑‍💻 用户系统
- 用户注册/登录/登出
- 会话管理
- 权限控制

### 🌙 树洞功能
- 匿名发布想法和心情
- 实时浏览他人分享
- 分页加载优化
- 字符数限制（1000字符）

### 🔗 WordPress集成
- 绑定多个WordPress站点
- 应用密码认证
- 内容一键转发
- 转发状态追踪

### 🎨 用户界面
- 玻璃拟态设计风格
- 流畅的动画效果
- 深色主题
- 响应式布局

## 📚 API文档

### 树洞API
```http
POST /api/treehole/create      # 创建树洞消息
GET  /api/treehole/list        # 获取树洞列表
GET  /api/treehole/:id         # 获取单个树洞
DELETE /api/treehole/:id       # 删除树洞消息
```

### 用户API
```http
POST /api/users/signup         # 用户注册
POST /api/users/login          # 用户登录
POST /api/users/logout         # 用户登出
```

### WordPress API
```http
POST /api/wordpress/bind       # 绑定WordPress站点
GET  /api/wordpress/sites      # 获取绑定站点
DELETE /api/wordpress/sites/:id # 解绑站点
POST /api/wordpress/transfer   # 转发内容
```

## 🛠️ 配置说明

### 数据库配置

复制 `server/config/config-sample.json` 为 `server/config/config.json` 并配置：

```json
{
  "database": {
    "host": "localhost",
    "port": "3306",
    "user": "negaihoshi",
    "password": "your_password",
    "database": "negaihoshi"
  },
  "redis": {
    "host": "localhost",
    "port": "6379",
    "password": ""
  },
  "server": {
    "port": "9292"
  },
  "frontend": {
    "prefix": ["http://localhost:3000"]
  }
}
```

## 🐳 Docker部署

项目提供完整的Docker配置：

```yaml
# docker-compose.yml 包含：
- MySQL 8.0 数据库
- Redis 缓存
- Go 后端服务
- React 前端服务
- Nginx 反向代理
```

## 🔧 开发指南

### 添加新功能

1. **后端添加API**
   ```go
   // 在 server/src/web/ 添加handler
   // 在 server/src/service/ 添加业务逻辑
   // 在 server/src/repository/ 添加数据层
   ```

2. **前端添加页面**
   ```typescript
   // 在 frontend/aii-home/src/components/ 添加组件
   // 在 frontend/aii-home/src/requests/ 添加API调用
   ```

### 代码规范

- 后端遵循Go标准命名规范
- 前端使用TypeScript严格模式
- 统一使用Prettier格式化代码

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目！

## 📄 许可证

本项目基于 MIT 许可证开源。

## 🙏 鸣谢

感谢所有为开源社区做出贡献的开发者们。

---

⭐ 如果这个项目对你有帮助，请给它一个星标！