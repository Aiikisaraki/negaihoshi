# Negaihoshi 树洞系统

一个基于 Go + React 的匿名分享心情平台，支持用户注册、内容发布、管理员后台等功能。

## 🚀 快速开始

### 方式一：脚本启动 (推荐)

#### Linux/macOS
```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

#### Windows
```cmd
scripts\start.bat
```

### 方式二：Docker 启动

```bash
chmod +x scripts/docker-start.sh
./scripts/docker-start.sh
```

### 方式三：手动启动

1. **启动后端服务**
```bash
cd server
go run main.go
```

2. **启动主前端服务**
```bash
cd frontend/aii-home
npm install
npm run dev
```

3. **启动管理员前端服务** (可选)
```bash
cd frontend/admin
npm install
npm run dev
```

## 📋 系统要求

- **脚本启动**: Go 1.19+, Node.js 16+, MySQL 8.0+, Redis 6.0+
- **Docker启动**: Docker 20.10+, Docker Compose 2.0+

## 🌐 访问地址

启动成功后，可以通过以下地址访问：

- **主前端**: http://localhost:3000
- **管理员前端**: http://localhost:3001 (如果启用)
- **后端API**: http://localhost:9292
- **API文档**: http://localhost:9292/api/docs

## 📁 项目结构

```
negaihoshi/
├── config.json                 # 全局配置文件
├── docker-compose.yml          # Docker Compose配置
├── scripts/                    # 启动脚本
├── server/                     # 后端服务
├── frontend/                   # 前端项目
│   ├── aii-home/              # 主前端
│   └── admin/                 # 管理员前端
├── logs/                       # 日志目录
└── doc/                        # 文档
```

## 🔐 默认账户

系统初始化时会创建默认管理员账户：
- **用户名**: admin
- **密码**: admin123
- **角色**: 管理员

## 📚 详细文档

- **[Docker部署指南](./DOCKER_DEPLOYMENT.md)** - 完整的Docker部署说明，包含前端路由配置
- **[前端部署配置指南](./frontend/aii-home/DEPLOYMENT_GUIDE.md)** - 前端配置和部署详细说明
- **[更新日志](./doc/changelog/)** - 项目更新记录
- **[配置生成工具](./server/cmd/config-generator/)** - 配置文件自动生成工具

## 🚀 部署

### Docker部署（推荐）
```bash
docker-compose up -d
```

### 传统部署
```bash
# 构建前端
cd frontend/aii-home
npm run build:prod

# 启动后端
cd server
go run main.go
```

详细部署说明请查看 [Docker部署指南](./DOCKER_DEPLOYMENT.md)。

## 🛠️ 开发

### 后端开发
```bash
cd server
go mod tidy
go run main.go
```

### 前端开发
```bash
cd frontend/aii-home
npm install
npm run dev
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 获取帮助

- **部署问题**: 查看 [Docker部署指南](./DOCKER_DEPLOYMENT.md)
- **前端配置**: 查看 [前端部署配置指南](./frontend/aii-home/DEPLOYMENT_GUIDE.md)
- **常见问题**: 查看各分文档中的故障排除部分
- **开发问题**: 查看 [doc/](./doc/) 目录下的开发文档

---

**提示**: 首次使用建议先查看 [Docker部署指南](./DOCKER_DEPLOYMENT.md)，项目已包含完整的部署配置。

