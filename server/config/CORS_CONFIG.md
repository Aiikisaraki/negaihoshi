# CORS 跨域配置说明

## 概述

本文档说明如何配置后端的跨域访问控制，以支持前端应用从不同域名访问API。

## 配置文件

编辑 `server/config/config.json` 文件：

```json
{
    "frontend-prefix": [
        "http://localhost:3000",
        "https://your-frontend-domain.com",
        "http://your-frontend-ip:3000"
    ],
    "server-port": "9292",
    "server-domain": "your-backend-domain.com",
    "cors": {
        "enabled": true,
        "allow_credentials": true,
        "max_age": 43200
    }
}
```

## 配置项说明

### frontend-prefix
允许访问的前端域名列表，支持以下格式：
- `http://localhost:3000` - 本地开发环境
- `https://your-frontend-domain.com` - HTTPS域名
- `http://your-frontend-ip:3000` - HTTP IP地址

### server-domain
后端服务器的域名，用于API测试页面显示正确的API地址。

### cors
跨域配置选项：
- `enabled`: 是否启用CORS
- `allow_credentials`: 是否允许携带认证信息
- `max_age`: 预检请求的缓存时间（秒）

## 常见配置示例

### 开发环境
```json
{
    "frontend-prefix": [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
}
```

### 生产环境
```json
{
    "frontend-prefix": [
        "https://yourdomain.com",
        "https://www.yourdomain.com"
    ],
    "server-domain": "api.yourdomain.com"
}
```

### 内网部署
```json
{
    "frontend-prefix": [
        "http://192.168.1.100:3000",
        "http://192.168.1.101:3000"
    ],
    "server-domain": "192.168.1.100:9292"
}
```

## 故障排除

### 1. 403 跨域错误
- 检查 `frontend-prefix` 是否包含正确的前端域名
- 确认前端请求的Origin头是否匹配配置
- 检查浏览器控制台的错误信息

### 2. 预检请求失败
- 确认 `cors.enabled` 为 `true`
- 检查 `AllowMethods` 是否包含需要的HTTP方法
- 验证 `AllowHeaders` 是否包含需要的请求头

### 3. 认证信息丢失
- 确认 `cors.allow_credentials` 为 `true`
- 前端请求需要设置 `credentials: 'include'`

## 安全建议

1. **生产环境**：只允许HTTPS域名
2. **IP限制**：内网部署时限制允许的IP范围
3. **域名验证**：使用具体的域名而不是通配符
4. **定期审查**：定期检查允许的域名列表

## 测试方法

1. 访问 `/api/test` 页面
2. 确认API基础URL显示正确
3. 测试跨域API请求
4. 检查浏览器Network面板的请求头

## 相关代码

CORS配置在 `server/main.go` 的 `initWebServer` 函数中：

```go
r.Use(cors.New(cors.Config{
    AllowHeaders:     []string{"Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"},
    AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
    AllowCredentials: true,
    AllowOriginFunc: func(origin string) bool {
        // 检查是否在允许的前端域名列表中
        for _, allowedOrigin := range frontendPrefix {
            if strings.HasPrefix(origin, allowedOrigin) {
                return true
            }
        }
        return false
    },
    MaxAge: 12 * time.Hour,
}))
```
