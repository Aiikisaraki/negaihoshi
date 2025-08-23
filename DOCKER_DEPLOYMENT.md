# Docker 部署指南

本项目支持使用 Docker 进行快速部署，包含 MySQL 和 Redis 数据库服务。

## 🚀 快速开始

### 1. 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 至少 5GB 可用磁盘空间

### 2. 一键启动

#### Linux/macOS
```bash
chmod +x scripts/docker-start.sh
./scripts/docker-start.sh
```

#### Windows
```cmd
scripts\docker-start.bat
```

### 3. 手动启动

#### 完整模式（推荐）
```bash
# 启动所有服务（前端 + 后端 + 数据库）
docker-compose up -d
```

#### 简化模式
```bash
# 仅启动后端和数据库服务
docker-compose -f docker-compose.simple.yml up -d
```

#### 仅数据库模式
```bash
# 仅启动 MySQL 和 Redis
docker-compose -f docker-compose.simple.yml up -d mysql redis
```

## 📋 服务说明

### 数据库服务

#### MySQL
- **端口**: 3306
- **用户名**: negaihoshi
- **密码**: negaihoshi123
- **数据库**: negaihoshi
- **字符集**: utf8mb4

#### Redis
- **端口**: 6379
- **密码**: 无
- **数据库**: 0
- **持久化**: 启用 AOF
- **内存限制**: 256MB

### 应用服务

#### 后端 API
- **端口**: 9292
- **健康检查**: http://localhost:9292/api/health
- **API 文档**: http://localhost:9292/api/docs

#### 主前端
- **端口**: 3000
- **访问地址**: http://localhost:3000

#### 管理前端（可选）
- **端口**: 3001
- **访问地址**: http://localhost:3001
- **启动命令**: `docker-compose --profile admin up -d`

## 🌐 前端路由配置（重要）

**注意：** 部署后如果出现页面刷新404或直接访问路由404的问题，需要配置前端路由支持。

### 问题说明
1. **前端路由是客户端路由**：React Router 只在浏览器中生效
2. **服务器不知道这些路由**：当用户直接访问 `/login` 时，服务器会寻找 `login.html` 文件
3. **构建后的文件结构**：`dist` 目录只有 `index.html`，没有其他页面的HTML文件

### Docker 环境配置

项目中的 `nginx.conf` 已经配置了前端路由支持：

```nginx
# 处理前端路由 - 关键配置
location / {
    try_files $uri $uri/ /index.html;
}

# 或者更精确的路由配置
location ~ ^/(login|signup|profile|create-post|create-status|post|status|admin) {
    try_files $uri $uri/ /index.html;
}
```

### 非 Docker 环境配置

#### Nginx 配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/dist;
    index index.html;

    # 处理前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Apache 配置
在网站根目录创建 `.htaccess` 文件：
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### Express.js 静态服务器
```javascript
app.use(express.static('dist'));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

### 配置原理
告诉服务器："如果找不到文件，就返回 `index.html`，让前端路由处理"

## 🔧 配置说明

### 环境变量

后端服务支持以下环境变量：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `DB_HOST` | mysql | MySQL 主机地址 |
| `DB_PORT` | 3306 | MySQL 端口 |
| `DB_USER` | negaihoshi | MySQL 用户名 |
| `DB_PASSWORD` | negaihoshi123 | MySQL 密码 |
| `DB_NAME` | negaihoshi | MySQL 数据库名 |
| `REDIS_HOST` | redis | Redis 主机地址 |
| `REDIS_PORT` | 6379 | Redis 端口 |
| `REDIS_PASSWORD` | 空 | Redis 密码 |
| `REDIS_DB` | 0 | Redis 数据库编号 |

### 前端配置

前端支持运行时配置，用户可以在部署后直接修改 `config.js` 文件：

```javascript
window.APP_CONFIG = {
  // 修改这里为你的后端API地址
  API_BASE_URL: 'https://your-api-domain.com/api',
  API_TIMEOUT: 30000,
  DEBUG_MODE: false,
  VERSION: '1.0.0'
};
```

**优点：**
- ✅ 无需重新构建
- ✅ 用户可以直接修改
- ✅ 支持热更新
- ✅ 配置持久化

### 数据持久化

- **MySQL 数据**: `mysql_data` 卷
- **Redis 数据**: `redis_data` 卷
- **应用日志**: `./logs` 目录
- **上传文件**: `./uploads` 目录
- **头像文件**: `./avatars` 目录

## 📊 监控和管理

### 查看服务状态
```bash
docker-compose ps
```

### 查看服务日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f mysql
docker-compose logs -f redis
```

### 健康检查
```bash
# 检查后端服务
curl http://localhost:9292/api/health

# 检查 MySQL
docker-compose exec mysql mysqladmin ping -h localhost -u negaihoshi -pnegaihoshi123

# 检查 Redis
docker-compose exec redis redis-cli ping
```

## 🛠️ 常用命令

### 启动服务
```bash
# 启动所有服务
docker-compose up -d

# 启动特定服务
docker-compose up -d backend
docker-compose up -d mysql redis
```

### 停止服务
```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
```

### 更新服务
```bash
# 重新构建并启动
docker-compose up -d --build

# 仅重新构建特定服务
docker-compose up -d --build backend
```

## 🔒 安全配置

### 生产环境建议

1. **修改默认密码**
   ```yaml
   environment:
     MYSQL_ROOT_PASSWORD: your-secure-password
     MYSQL_PASSWORD: your-secure-password
   ```

2. **启用 Redis 密码**
   ```yaml
   command: redis-server --requirepass your-redis-password --appendonly yes
   ```

3. **限制网络访问**
   ```yaml
   ports:
     - "127.0.0.1:3306:3306"  # 仅本地访问
   ```

4. **使用外部数据库**
   ```yaml
   environment:
     DB_HOST: your-mysql-server
     REDIS_HOST: your-redis-server
   ```

## 🚨 故障排除

### 常见问题

#### 1. 端口冲突
```bash
# 检查端口占用
netstat -tulpn | grep :9292
lsof -i :3306

# 修改端口映射
ports:
  - "9293:9292"  # 使用 9293 端口
```

#### 2. 数据库连接失败
```bash
# 检查数据库服务状态
docker-compose logs mysql

# 手动连接测试
docker-compose exec mysql mysql -u negaihoshi -p
```

#### 3. Redis 连接失败
```bash
# 检查 Redis 服务状态
docker-compose logs redis

# 手动连接测试
docker-compose exec redis redis-cli ping
```

#### 4. 内存不足
```bash
# 检查系统资源
docker stats

# 限制容器内存
deploy:
  resources:
    limits:
      memory: 512M
```

#### 5. 前端路由404错误
```bash
# 检查 Nginx 配置
docker-compose exec nginx nginx -t

# 查看 Nginx 错误日志
docker-compose logs nginx

# 确认路由配置是否正确
# 检查 nginx.conf 中的 try_files 配置
```

### 日志分析

#### 后端日志
```bash
# 查看错误日志
docker-compose logs backend | grep ERROR

# 查看启动日志
docker-compose logs backend | grep "Server started"
```

#### 数据库日志
```bash
# 查看 MySQL 错误日志
docker-compose logs mysql | grep ERROR

# 查看 Redis 日志
docker-compose logs redis
```

#### 前端日志
```bash
# 查看 Nginx 访问日志
docker-compose logs nginx

# 查看前端构建日志
docker-compose logs frontend
```

## 📈 性能优化

### 数据库优化

#### MySQL 配置
```yaml
environment:
  MYSQL_INNODB_BUFFER_POOL_SIZE: 256M
  MYSQL_INNODB_LOG_FILE_SIZE: 64M
  MYSQL_MAX_CONNECTIONS: 200
```

#### Redis 配置
```yaml
command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru --save 900 1 --save 300 10
```

### 应用优化

#### 后端配置
```yaml
environment:
  GIN_MODE: release
  GOMAXPROCS: 4
```

#### 前端配置
```yaml
environment:
  VITE_DEV_MODE: false
  VITE_DEBUG_MODE: false
```

#### Nginx 优化
```nginx
# 启用 gzip 压缩
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_comp_level 6;

# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔄 备份和恢复

### 数据库备份
```bash
# 备份 MySQL
docker-compose exec mysql mysqldump -u negaihoshi -p negaihoshi > backup.sql

# 备份 Redis
docker-compose exec redis redis-cli BGSAVE
```

### 数据恢复
```bash
# 恢复 MySQL
docker-compose exec -T mysql mysql -u negaihoshi -p negaihoshi < backup.sql

# 恢复 Redis
docker-compose exec redis redis-cli FLUSHALL
```

## 📚 相关文档

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [MySQL Docker 镜像](https://hub.docker.com/_/mysql)
- [Redis Docker 镜像](https://hub.docker.com/_/redis)
- [前端部署配置指南](./frontend/aii-home/DEPLOYMENT_GUIDE.md)
- [Nginx 配置参考](./frontend/aii-home/nginx.conf)
- [Apache 配置参考](./frontend/aii-home/public/.htaccess)

## 🆘 获取帮助

如果遇到问题：

1. **检查日志**：使用 `docker-compose logs` 查看服务日志
2. **查看状态**：使用 `docker-compose ps` 检查服务状态
3. **参考配置**：检查 `nginx.conf` 和 `.htaccess` 文件
4. **前端路由问题**：确保 Web 服务器配置了前端路由支持
5. **API 配置问题**：检查 `config.js` 文件中的 API 地址配置

---

**重要提示**：
- 部署后必须配置前端路由支持，否则会出现页面刷新404的问题
- 前端支持运行时配置，用户可以直接修改 `config.js` 文件
- 如果使用 Docker 部署，项目已包含完整的 Nginx 配置
