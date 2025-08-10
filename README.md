# Negaihoshi 树洞系统

一个基于 Go + React 的匿名分享心情平台，支持用户注册、内容发布、管理员后台等功能。

## 🚀 快速开始

### 方式一：脚本启动 (推荐)

#### Linux/macOS
```bash
# 给脚本执行权限
chmod +x scripts/start.sh

# 启动所有服务
./scripts/start.sh

# 或者指定命令
./scripts/start.sh start      # 启动所有服务
./scripts/start.sh stop       # 停止所有服务
./scripts/start.sh restart    # 重启所有服务
./scripts/start.sh status     # 查看服务状态
./scripts/start.sh install    # 安装前端依赖
```

#### Windows
```cmd
# 启动所有服务
scripts\start.bat

# 或者指定命令
scripts\start.bat start       # 启动所有服务
scripts\start.bat stop        # 停止所有服务
scripts\start.bat restart     # 重启所有服务
scripts\start.bat status      # 查看服务状态
scripts\start.bat install     # 安装前端依赖
```

### 方式二：Docker 启动

```bash
# 给脚本执行权限
chmod +x scripts/docker-start.sh

# 启动所有服务
./scripts/docker-start.sh

# 或者指定命令
./scripts/docker-start.sh start     # 启动所有服务
./scripts/docker-start.sh stop      # 停止所有服务
./scripts/docker-start.sh restart   # 重启所有服务
./scripts/docker-start.sh status    # 查看服务状态
./scripts/docker-start.sh logs      # 查看日志
./scripts/docker-start.sh cleanup   # 清理资源
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

### 脚本启动方式
- Go 1.19+
- Node.js 16+
- MySQL 8.0+
- Redis 6.0+
- Python 3.6+ (用于配置解析)

### Docker 启动方式
- Docker 20.10+
- Docker Compose 2.0+

## ⚙️ 配置说明

### 自动配置文件生成

系统支持自动生成配置文件功能：

1. **首次启动**: 如果配置文件不存在，系统会自动生成默认配置文件
2. **手动生成**: 使用配置生成工具手动生成配置文件
3. **全局配置**: 系统使用 `config.json` 作为全局配置文件，自动生成后端配置

### 手动生成配置文件

```bash
# 进入后端目录
cd server

# 生成默认配置文件
go run cmd/config-generator/main.go

# 指定配置文件路径
go run cmd/config-generator/main.go -global ../config.json -backend config/config.json

# 强制重新生成
go run cmd/config-generator/main.go -force

# 查看帮助
go run cmd/config-generator/main.go -help
```

### 配置文件结构

系统使用 `config.json` 作为全局配置文件，包含以下配置项：

### 站点配置
```json
{
  "site": {
    "name": "树洞系统",
    "description": "一个匿名分享心情的平台",
    "version": "1.0.0"
  }
}
```

### 服务配置
```json
{
  "server": {
    "port": 9292,
    "host": "0.0.0.0",
    "debug": false
  }
}
```

### 数据库配置
```json
{
  "database": {
    "driver": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "password",
    "database": "negaihoshi"
  }
}
```

### 前端配置
```json
{
  "frontend": {
    "main": {
      "enabled": true,
      "port": 3000
    },
    "admin": {
      "enabled": true,
      "port": 3001
    }
  }
}
```

### 功能开关
```json
{
  "features": {
    "user_registration": true,
    "content_review": false,
    "api_docs": true,
    "admin_panel": true,
    "wordpress_integration": true
  }
}
```

## 🌐 访问地址

启动成功后，可以通过以下地址访问：

- **主前端**: http://localhost:3000
- **管理员前端**: http://localhost:3001 (如果启用)
- **后端API**: http://localhost:9292
- **API文档**: http://localhost:9292/api/docs
- **MySQL**: localhost:3306
- **Redis**: localhost:6379

## 🔧 管理命令

### 脚本启动方式
```bash
# 查看所有可用命令
./scripts/start.sh

# 单独启动服务
./scripts/start.sh backend        # 仅启动后端
./scripts/start.sh main-frontend  # 仅启动主前端
./scripts/start.sh admin-frontend # 仅启动管理员前端
```

### Docker 启动方式
```bash
# 查看所有可用命令
./scripts/docker-start.sh

# 单独启动服务
./scripts/docker-start.sh backend  # 仅启动后端
./scripts/docker-start.sh frontend # 仅启动前端

# 查看日志
./scripts/docker-start.sh logs backend    # 查看后端日志
./scripts/docker-start.sh logs frontend   # 查看前端日志
```

## 📁 项目结构

```
negaihoshi/
├── config.json                 # 全局配置文件
├── docker-compose.yml          # Docker Compose配置
├── scripts/                    # 启动脚本
│   ├── start.sh               # Linux/macOS启动脚本
│   ├── start.bat              # Windows启动脚本
│   ├── docker-start.sh        # Docker启动脚本
│   └── init.sql               # 数据库初始化脚本
├── server/                     # 后端服务
│   ├── main.go                # 主入口文件
│   ├── src/                   # 源代码
│   │   ├── domain/            # 数据模型
│   │   ├── repository/        # 数据访问层
│   │   ├── service/           # 业务逻辑层
│   │   ├── web/               # Web处理器
│   │   └── util/              # 工具函数
│   └── config/                # 后端配置
├── frontend/                   # 前端项目
│   ├── aii-home/              # 主前端
│   └── admin/                 # 管理员前端
├── logs/                       # 日志目录
├── pids/                       # 进程ID文件
└── doc/                        # 文档
    └── changelog/              # 更新日志
```

## 🔐 默认账户

系统初始化时会创建默认管理员账户：

- **用户名**: admin
- **用户名**: admin
- **密码**: admin123
- **角色**: 管理员

## 🛠️ 开发指南

### 后端开发
```bash
cd server
go mod tidy
go run main.go
```

### 前端开发
```bash
# 主前端
cd frontend/aii-home
npm install
npm run dev

# 管理员前端
cd frontend/admin
npm install
npm run dev
```

### 数据库迁移
```bash
# 使用初始化脚本
mysql -u root -p negaihoshi < scripts/init.sql
```

## 📝 更新日志

详细的更新记录请查看 [doc/changelog/](doc/changelog/) 目录。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 常见问题

### Q: 如何禁用管理员前端？
A: 在 `config.json` 中将 `frontend.admin.enabled` 设置为 `false`。

### Q: 如何修改数据库配置？
A: 编辑 `config.json` 中的 `database` 部分。

### Q: 如何查看服务日志？
A: 
- 脚本启动: 查看 `logs/` 目录下的日志文件
- Docker启动: 使用 `./scripts/docker-start.sh logs [service]`

### Q: 如何备份数据？
A: 
```bash
# 备份MySQL数据
mysqldump -u root -p negaihoshi > backup.sql

# 备份Redis数据
redis-cli BGSAVE
```

### Q: 配置文件不存在怎么办？
A: 系统支持自动生成配置文件：

1. **自动生成**: 首次启动时系统会自动生成默认配置文件
2. **手动生成**: 使用配置生成工具
   ```bash
   cd server
   go run cmd/config-generator/main.go
   ```
3. **自定义配置**: 编辑生成的 `config.json` 文件，然后重新生成后端配置

### Q: 如何修改配置后重新生成后端配置？
A: 

```bash
# 编辑全局配置文件
vim config.json

# 重新生成后端配置
cd server
go run cmd/config-generator/main.go -force
```

## 🚀 Release 构建

### 自动构建

系统支持自动Release构建功能：

1. **触发条件**: 当第三级版本号（0.1.x中的x）发生变化时自动触发
2. **构建内容**: 
   - 后端二进制文件 (`negaihoshi`)
   - 前端构建文件 (`frontend-main/`, `frontend-admin/`)
   - 配置文件 (`config.json`, `docker-compose.yml`)
   - 启动脚本 (`scripts/`)

### 手动构建

如果需要手动触发构建：

1. **GitHub Actions**: 在Actions页面手动触发 `Auto Release` 工作流
2. **强制发布**: 设置 `force_release` 为 `true` 强制构建
3. **版本检查**: 设置 `check_version` 为 `false` 跳过版本检查

### Release包使用

下载Release包后：

1. **解压文件**: 解压 `negaihoshi-*.zip` 到目标目录
2. **启动服务**: 使用Release专用启动脚本
   ```bash
   # Linux/macOS
   chmod +x scripts/start-release.sh
   ./scripts/start-release.sh
   
   # Windows
   scripts\start-release.bat
   ```

### 构建产物

Release包包含以下文件：

```
negaihoshi-*/                    # Release根目录
├── negaihoshi                   # 后端可执行文件 (Linux/macOS)
├── negaihoshi.exe              # 后端可执行文件 (Windows)
├── frontend-main/              # 主前端构建文件
├── frontend-admin/             # 管理员前端构建文件
├── config.json                 # 全局配置文件
├── docker-compose.yml          # Docker配置
├── scripts/                    # 启动脚本
│   ├── start-release.sh       # Linux/macOS启动脚本
│   ├── start-release.bat      # Windows启动脚本
│   └── ...                    # 其他脚本
└── README.md                   # 项目文档
```

### 版本管理

使用版本管理工具管理项目版本：

```bash
# Linux/macOS
./scripts/version-manager.sh show        # 显示当前版本
./scripts/version-manager.sh bump patch  # 增加补丁版本
./scripts/version-manager.sh set 1.2.3  # 设置特定版本

# Windows
scripts\version-manager.bat show         # 显示当前版本
scripts\version-manager.bat bump patch   # 增加补丁版本
scripts\version-manager.bat set 1.2.3   # 设置特定版本
```

