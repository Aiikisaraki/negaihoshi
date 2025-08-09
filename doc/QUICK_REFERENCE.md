# 🚀 Negaihoshi 快速参考

## 📁 项目结构速览

```
negaihoshi/
├── 📚 doc/                     # 项目文档
│   ├── 📝 changelog/          # 变更日志
│   ├── 📖 README.md           # 文档总览
│   └── 🚀 QUICK_REFERENCE.md  # 快速参考(本文件)
├── 🔧 server/                 # Go后端
│   ├── 🌐 src/web/           # API处理层
│   ├── 💼 src/service/       # 业务逻辑层
│   ├── 🗄️ src/repository/    # 数据访问层
│   └── 🐳 Dockerfile         # 后端容器配置
├── 📱 frontend/aii-home/     # React前端
│   ├── 🧩 src/components/    # React组件
│   ├── 📡 src/requests/      # API调用
│   └── 🐳 Dockerfile         # 前端容器配置
├── 🚀 scripts/               # 启动脚本
├── 🐳 docker-compose.yml     # 容器编排
└── 📖 README.md              # 项目说明
```

## ⚡ 快速命令

### 🚀 启动项目

```bash
# 生产环境 (Docker)
chmod +x scripts/start.sh && ./scripts/start.sh

# 开发环境
chmod +x scripts/dev.sh && ./scripts/dev.sh

# 手动启动基础服务
docker-compose up -d mysql redis
```

### 🛠️ 开发命令

```bash
# 后端开发
cd server && go run main.go

# 前端开发
cd frontend/aii-home && npm run dev

# 容器管理
docker-compose ps              # 查看服务状态
docker-compose logs -f         # 查看日志
docker-compose down            # 停止所有服务
docker-compose restart         # 重启服务
```

### 🔧 数据库操作

```bash
# 连接MySQL
docker exec -it negaihoshi-mysql mysql -u negaihoshi -p

# 连接Redis
docker exec -it negaihoshi-redis redis-cli

# 备份数据库
docker exec negaihoshi-mysql mysqldump -u negaihoshi -p negaihoshi > backup.sql
```

## 🌐 服务地址

| 服务 | 开发环境 | 生产环境 | 说明 |
|------|----------|----------|------|
| 前端 | http://localhost:5173 | http://localhost:3000 | React应用 |
| 后端API | http://localhost:9292 | http://localhost:9292 | Go API服务 |
| MySQL | localhost:3306 | localhost:3306 | 数据库 |
| Redis | localhost:6379 | localhost:6379 | 缓存 |

## 📡 API 快速参考

### 🌙 树洞API

```http
POST /api/treehole/create      # 创建树洞消息
GET  /api/treehole/list        # 获取树洞列表 
GET  /api/treehole/:id         # 获取单个树洞
DELETE /api/treehole/:id       # 删除树洞消息

# 示例
curl -X POST http://localhost:9292/api/treehole/create \
  -H "Content-Type: application/json" \
  -d '{"content": "测试消息"}'
```

### 👤 用户API

```http
POST /api/users/signup         # 用户注册
POST /api/users/login          # 用户登录
POST /api/users/logout         # 用户登出

# 示例
curl -X POST http://localhost:9292/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "123456"}'
```

### 🔗 WordPress API

```http
POST /api/wordpress/bind       # 绑定WordPress站点
GET  /api/wordpress/sites      # 获取绑定站点
DELETE /api/wordpress/sites/:id # 解绑站点
POST /api/wordpress/transfer   # 转发内容

# 示例
curl -X POST http://localhost:9292/api/wordpress/bind \
  -H "Content-Type: application/json" \
  -d '{
    "site_url": "https://blog.example.com",
    "username": "admin", 
    "api_key": "your_app_password"
  }'
```

## 🔧 配置文件

### 📄 后端配置 (server/config/config.json)

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

### 🌐 前端配置 (frontend/aii-home/src/requests/api/index.ts)

```typescript
const apiClient = axios.create({
  baseURL: 'http://localhost:9292/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## 🐛 常见问题

### ❓ 连接问题

| 问题 | 解决方法 |
|------|----------|
| 前端无法连接后端 | 检查后端是否运行在9292端口 |
| 数据库连接失败 | 检查MySQL容器状态和配置 |
| Redis连接失败 | 检查Redis容器状态 |
| 跨域问题 | 检查CORS配置 |

### 🔧 开发问题

| 问题 | 解决方法 |
|------|----------|
| Go依赖问题 | 运行 `go mod tidy` |
| npm安装失败 | 删除node_modules，重新 `npm install` |
| 热重载不工作 | 重启开发服务器 |
| Docker构建失败 | 检查Dockerfile语法 |

## 📝 开发工作流

### 🔄 日常开发

1. **拉取最新代码**
   ```bash
   git pull origin main
   ```

2. **启动开发环境**
   ```bash
   ./scripts/dev.sh
   ```

3. **进行开发**
   - 后端: 修改Go代码，自动重启
   - 前端: 修改React代码，热重载

4. **测试功能**
   - 访问前端: http://localhost:5173
   - 测试API: http://localhost:9292

5. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   git push origin feature-branch
   ```

### 📚 添加文档

1. **新功能文档**: 在相应模块添加README
2. **API文档**: 更新API参考文档
3. **变更日志**: 使用doc/changelog/TEMPLATE.md

## 🎯 性能优化建议

### 🔧 后端优化
- 使用Redis缓存频繁查询
- 数据库查询添加索引
- API响应使用gzip压缩
- 实现请求限流

### 📱 前端优化
- 代码分割和懒加载
- 图片压缩和WebP格式
- 使用CDN加速静态资源
- 实现虚拟滚动

## 🔒 安全注意事项

### 🛡️ 后端安全
- 输入验证和参数校验
- SQL注入防护
- XSS防护
- 限制上传文件大小和类型

### 🔐 前端安全
- 敏感信息不存储在前端
- 使用HTTPS连接
- 实现CSP策略
- 定期更新依赖

## 📞 获取帮助

- 📖 **文档**: [doc/README.md](./README.md)
- 📝 **变更日志**: [doc/changelog/](./changelog/)
- 🐛 **问题报告**: GitHub Issues
- 💬 **联系维护者**: morikawa@kimisui56.work

---

*这个快速参考包含了日常开发中最常用的信息，建议收藏备用！*
