# 代理和隧道配置说明

## 概述

本文档说明如何配置后端服务以支持通过frp内网穿透、Nginx反向代理、Cloudflare等代理或隧道方式访问，并正确获取客户端真实IP地址。

## 问题说明

当使用代理或隧道时，后端服务无法直接获取客户端真实IP，因为：
1. 请求经过代理服务器，`RemoteAddr` 显示的是代理IP
2. 真实IP信息需要通过特定的HTTP头传递
3. 不同的代理软件使用不同的头名称

## 解决方案

### 1. 配置IP检测

编辑 `server/config/config.json`：

```json
{
    "ip_detection": {
        "enabled": true,
        "trusted_proxies": [
            "127.0.0.1",
            "::1",
            "10.0.0.0/8",
            "172.16.0.0/12",
            "192.168.0.0/16",
            "frp.your-domain.com",
            "proxy.your-domain.com"
        ],
        "trust_x_real_ip": true,
        "trust_x_forwarded_for": true,
        "trust_cf_connecting_ip": true,
        "trust_last_x_forwarded_for": false,
        "log_ip_info": true
    }
}
```

### 2. 配置受信任的代理

在 `trusted_proxies` 中添加你的代理服务器IP或域名：
- frp服务器IP
- Nginx代理服务器IP
- Cloudflare的IP范围
- 其他代理服务器IP

## 不同代理的配置

### frp 内网穿透

#### frpc.ini 配置
```ini
[web-http]
type = http
local_ip = 127.0.0.1
local_port = 9292
custom_domains = your-domain.com

# 关键：配置代理头
[web-http.headers]
X-Real-IP = $remote_addr
X-Forwarded-For = $proxy_add_x_forwarded_for
X-Forwarded-Proto = $scheme
```

#### 后端配置
```json
{
    "ip_detection": {
        "enabled": true,
        "trusted_proxies": [
            "frp.your-domain.com",
            "your-frp-server-ip"
        ],
        "trust_x_real_ip": true,
        "trust_x_forwarded_for": true
    }
}
```

### Nginx 反向代理

#### nginx.conf 配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:9292;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 后端配置
```json
{
    "ip_detection": {
        "enabled": true,
        "trusted_proxies": [
            "127.0.0.1",
            "your-nginx-server-ip"
        ],
        "trust_x_real_ip": true,
        "trust_x_forwarded_for": true
    }
}
```

### Cloudflare 代理

#### 后端配置
```json
{
    "ip_detection": {
        "enabled": true,
        "trusted_proxies": [
            "173.245.48.0/20",
            "103.21.244.0/22",
            "103.22.200.0/22",
            "103.31.4.0/22"
        ],
        "trust_cf_connecting_ip": true,
        "trust_x_forwarded_for": true
    }
}
```

### 多层代理

如果有多层代理（如：客户端 -> CDN -> 负载均衡器 -> 应用服务器），需要：

1. **配置信任链**：将每层代理的IP添加到 `trusted_proxies`
2. **选择IP策略**：
   - `trust_last_x_forwarded_for: false`：信任第一个IP（最接近代理的）
   - `trust_last_x_forwarded_for: true`：信任最后一个IP（最接近客户端的）

## 测试方法

### 1. 访问IP信息API
```bash
curl http://your-domain.com/api/ip
```

### 2. 检查响应
```json
{
    "real_ip": "203.0.113.1",
    "remote_addr": "192.168.1.100",
    "ip_info": {
        "ip": "203.0.113.1",
        "valid": true,
        "version": "IPv4",
        "private": false
    },
    "headers": {
        "X-Real-IP": "203.0.113.1",
        "X-Forwarded-For": "203.0.113.1, 192.168.1.100"
    }
}
```

### 3. 检查日志
如果启用了 `log_ip_info`，会在控制台看到：
```
IP Info - RealIP: 203.0.113.1, RemoteAddr: 192.168.1.100, Headers: map[X-Real-IP:203.0.113.1 X-Forwarded-For:203.0.113.1, 192.168.1.100]
```

## 安全考虑

### 1. 只信任受信任的代理
- 不要使用通配符 `*`
- 明确列出所有代理服务器IP
- 定期审查代理列表

### 2. 验证IP头
- 检查IP地址格式
- 过滤私有IP地址
- 记录所有IP头信息用于审计

### 3. 监控异常
- 监控IP头的变化
- 记录可疑的IP模式
- 设置IP白名单/黑名单

## 故障排除

### 1. 仍然显示代理IP
- 检查代理配置是否正确设置了头
- 确认后端配置中包含了代理IP
- 验证IP头的格式是否正确

### 2. 显示多个IP
- 检查 `X-Forwarded-For` 链
- 确认代理服务器的配置
- 调整 `trust_last_x_forwarded_for` 设置

### 3. 日志中没有IP信息
- 确认 `log_ip_info` 为 `true`
- 检查中间件是否正确加载
- 验证配置文件的格式

## 最佳实践

1. **分层配置**：为不同环境配置不同的代理设置
2. **监控日志**：定期检查IP检测日志
3. **安全审计**：记录所有IP变化用于安全分析
4. **性能优化**：合理配置受信任的代理范围
5. **备份配置**：保存多个配置版本用于快速切换

## 相关文件

- `server/src/util/ip_utils.go` - IP获取工具
- `server/src/web/middleware/real_ip.go` - 真实IP中间件
- `server/config/frp.example.ini` - frp配置示例
- `server/config/config.json` - 主配置文件
