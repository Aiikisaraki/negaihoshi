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
