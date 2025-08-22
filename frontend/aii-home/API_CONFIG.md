# API 配置说明

本项目支持通过环境变量配置后端API地址和其他相关设置。

## 环境变量配置

### 1. 复制环境变量示例文件

```bash
cp env.example .env
```

### 2. 配置环境变量

编辑 `.env` 文件，设置以下变量：

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:9292/api

# Development Configuration
VITE_DEV_MODE=true
VITE_DEBUG_MODE=false

# Optional: Custom API timeout (in milliseconds)
VITE_API_TIMEOUT=30000
```

### 3. 环境变量说明

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `VITE_API_BASE_URL` | `http://localhost:9292/api` | 后端API基础URL |
| `VITE_API_TIMEOUT` | `30000` | API请求超时时间（毫秒） |
| `VITE_DEBUG_MODE` | `false` | 是否启用调试模式（显示API请求日志） |
| `VITE_DEV_MODE` | `true` | 是否启用开发模式（显示配置信息） |

## 不同环境的配置

### 开发环境
```env
VITE_API_BASE_URL=http://localhost:9292/api
VITE_DEV_MODE=true
VITE_DEBUG_MODE=true
```

### 生产环境
```env
VITE_API_BASE_URL=https://your-production-domain.com/api
VITE_DEV_MODE=false
VITE_DEBUG_MODE=false
```

### 测试环境
```env
VITE_API_BASE_URL=https://your-test-domain.com/api
VITE_DEV_MODE=false
VITE_DEBUG_MODE=true
```

## 使用示例

### 1. 本地开发
```bash
# 使用默认配置
npm run dev

# 使用自定义API地址
VITE_API_BASE_URL=http://192.168.1.100:9292/api npm run dev
```

### 2. 构建生产版本
```bash
# 使用生产环境配置
npm run build

# 使用自定义配置构建
VITE_API_BASE_URL=https://api.example.com/api npm run build
```

## 配置验证

启动应用后，在浏览器控制台中会显示当前的API配置信息（仅在开发模式下）：

```javascript
API Configuration: {
  baseURL: "http://localhost:9292/api",
  timeout: 30000,
  debugMode: false,
  devMode: true
}
```

## 注意事项

1. 所有环境变量必须以 `VITE_` 开头才能在客户端代码中访问
2. 修改环境变量后需要重启开发服务器
3. 生产环境的环境变量需要在部署时设置
4. `.env` 文件不应提交到版本控制系统（已添加到 `.gitignore`）

## 故障排除

### 1. 环境变量未生效
- 确保变量名以 `VITE_` 开头
- 重启开发服务器
- 检查 `.env` 文件格式是否正确

### 2. API请求失败
- 检查 `VITE_API_BASE_URL` 是否正确
- 确认后端服务是否运行
- 检查网络连接和防火墙设置

### 3. 调试API请求
设置 `VITE_DEBUG_MODE=true` 可以在控制台查看详细的API请求和响应日志。
