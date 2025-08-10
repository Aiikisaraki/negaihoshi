# GitHub Actions 工作流

本目录包含项目的GitHub Actions工作流配置。

## 工作流说明

### 1. Auto Release (`auto-release.yml`)

**触发条件**:
- 推送到 `main` 或 `master` 分支
- 推送标签（以 `v` 开头）

**功能**:
- 自动构建后端二进制文件
- 自动构建前端应用
- 创建发布包（ZIP格式）
- 自动创建GitHub Release
- 上传构建产物

**输出**:
- GitHub Release页面
- 可下载的ZIP包
- 构建产物

### 2. Docker Publish (`docker-publish.yml`)

**触发条件**:
- 手动触发（workflow_dispatch）

**输入参数**:
- `version`: 版本标签（如 v1.0.0）
- `registry`: Docker镜像仓库（默认 ghcr.io）
- `image_name`: 镜像名称（默认 negaihoshi）
- `push_to_registry`: 是否推送到仓库（默认 true）

**功能**:
- 构建后端Docker镜像
- 构建前端Docker镜像
- 推送到指定的Docker仓库
- 创建多平台支持
- 生成使用说明

**输出**:
- Docker镜像
- 发布说明文档

## 使用方法

### 自动发布

1. **推送代码触发自动发布**:
   ```bash
   git push origin main
   ```

2. **创建标签触发发布**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

### 手动发布Docker镜像

1. 在GitHub仓库页面，点击 "Actions" 标签
2. 选择 "Docker Publish" 工作流
3. 点击 "Run workflow"
4. 填写参数：
   - Version: 版本号（如 v1.0.0）
   - Registry: 镜像仓库（如 ghcr.io）
   - Image name: 镜像名称（如 negaihoshi）
   - Push to registry: 是否推送（true/false）

## 配置要求

### 仓库设置

1. **启用Actions**: 确保仓库已启用GitHub Actions
2. **权限设置**: 确保工作流有足够的权限创建Release和推送镜像

### Secrets配置

如果需要推送到私有仓库，需要配置以下Secrets：

- `DOCKER_USERNAME`: Docker用户名
- `DOCKER_PASSWORD`: Docker密码
- `REGISTRY_TOKEN`: 镜像仓库访问令牌

## 输出示例

### Release包内容
```
negaihoshi-v1.0.0.zip
├── negaihoshi-server          # 后端二进制
├── frontend-main/             # 主前端构建
├── frontend-admin/            # 管理员前端构建
├── config.json               # 配置文件
├── docker-compose.yml        # Docker配置
├── scripts/                  # 启动脚本
└── README.md                 # 文档
```

### Docker镜像
```
ghcr.io/username/negaihoshi:v1.0.0              # 后端镜像
ghcr.io/username/negaihoshi:v1.0.0-frontend-main # 主前端镜像
ghcr.io/username/negaihoshi:v1.0.0-frontend-admin # 管理员前端镜像
```

## 故障排除

### 常见问题

1. **构建失败**:
   - 检查依赖是否正确安装
   - 确认构建脚本路径正确
   - 查看构建日志获取详细错误信息

2. **推送失败**:
   - 确认Docker仓库权限
   - 检查Secrets配置
   - 验证镜像标签格式

3. **Release创建失败**:
   - 确认GitHub Token权限
   - 检查Release标签是否已存在
   - 验证文件大小限制

### 调试方法

1. 查看Actions日志获取详细错误信息
2. 在本地测试构建过程
3. 检查工作流配置语法
4. 验证输入参数格式


