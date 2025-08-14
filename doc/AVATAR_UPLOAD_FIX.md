# 头像上传401问题修复指南

## 问题描述

前端上传头像请求发起后，后端直接返回401状态码，表示用户未授权。

## 问题原因分析

### 1. Session管理问题
- 登录成功后，用户ID没有正确保存到session中
- 中间件检查session时找不到用户ID
- 导致所有需要认证的接口都返回401

### 2. 中间件配置问题
- 登录中间件没有正确应用到用户路由
- 头像上传接口 `/api/users/avatar` 需要认证但没有正确处理

### 3. 路由注册重复
- 用户路由在多个地方被注册，导致冲突
- 中间件配置不一致
- 静态文件服务重复注册导致路由冲突

## 修复方案

### 1. 修复Session管理

#### 后端登录处理 (`server/src/web/user.go`)
```go
func (h *UserHandler) Login(c *gin.Context) {
    // ... 验证逻辑 ...
    
    // 设置session
    sess := sessions.Default(c)
    sess.Set("userId", user.Id)
    sess.Set("username", user.Username)
    sess.Save()
    
    // 同时设置到上下文中，供后续处理器使用
    c.Set("user_id", user.Id)
    c.Set("username", user.Username)
    
    // ... 返回响应 ...
}
```

#### 后端登出处理
```go
func (h *UserHandler) Logout(c *gin.Context) {
    // 清除session
    sess := sessions.Default(c)
    sess.Clear()
    sess.Save()
    
    // 同时清除上下文中的值
    c.Set("user_id", nil)
    c.Set("username", nil)
    
    // ... 返回响应 ...
}
```

### 2. 修复中间件配置

#### 登录中间件 (`server/src/web/middleware/login.go`)
```go
func (l *LoginMiddlewareBuilder) Build() gin.HandlerFunc {
    return func(c *gin.Context) {
        // ... 路径检查逻辑 ...
        
        sess := sessions.Default(c)
        id := sess.Get("userId")
        if id == nil {
            c.AbortWithStatus(http.StatusUnauthorized)
            return
        }
        
        // 将用户ID设置到上下文中，供后续处理器使用
        c.Set("user_id", id)
    }
}
```

#### 主服务器配置 (`server/main.go`)
```go
func initWebServer(config *config.ConfigFunction) *gin.Engine {
    r := gin.Default()
    
    // ... CORS和session配置 ...
    
    // 应用登录中间件
    r.Use(middleware.NewLoginMiddlewareBuilder().
        IgnorePaths("/api/users/signup").
        IgnorePaths("/api/users/login").
        IgnorePaths("/uploads").
        IgnorePaths("/uploads/*").
        // ... 其他忽略路径 ...
        Build())
    
    // 初始化用户服务并注册路由
    userHandler, _ := initUser(db, &config.Config)
    userHandler.RegisterUserRoutes(r)
    
    // 添加静态文件服务
    r.Static("/uploads", "./uploads")
    
    return r
}
```

**重要：避免重复注册静态文件服务**
```go
// 在main()函数中，不要重复注册uploads静态文件服务
// r.Static("/uploads", "./uploads") // ❌ 这会导致路由冲突

// 只在initWebServer中注册一次即可
```

### 3. 确保上传目录存在

#### 运行目录创建脚本
```bash
# Linux/Mac
./scripts/ensure-upload-dirs.sh

# Windows
scripts\ensure-upload-dirs.bat
```

#### 手动创建目录
```bash
mkdir -p uploads/avatars
chmod 755 uploads uploads/avatars
```

### 4. 配置文件检查

确保 `config.json` 包含正确的存储配置：
```json
{
  "storage": {
    "type": "local",
    "local": {
      "path": "./uploads/avatars"
    }
  }
}
```

## 测试步骤

### 1. 启动服务
```bash
# 启动后端
cd server && go run main.go

# 启动前端
cd frontend/aii-home && npm run dev
```

### 2. 测试登录
- 访问前端应用
- 注册新用户或登录现有用户
- 确认登录成功

### 3. 测试头像上传
- 进入个人中心
- 点击头像上传
- 选择图片文件
- 确认上传成功

### 4. 检查后端日志
- 观察登录请求的session设置
- 观察头像上传请求的认证状态

## 常见问题排查

### 1. 仍然返回401
- 检查用户是否真正登录
- 检查浏览器cookie是否启用
- 检查session secret是否一致

### 2. 上传目录权限问题
- 确保 `uploads/avatars` 目录存在
- 确保目录有正确的读写权限
- 检查后端是否有权限创建文件

### 3. 跨域问题
- 检查CORS配置
- 确保前端和后端域名配置正确
- 检查 `credentials` 设置

### 4. 路由冲突错误
- **错误信息**: `panic: '/*filepath' in new path '/uploads/*filepath' conflicts with existing wildcard`
- **原因**: 静态文件服务被重复注册
- **解决方案**: 确保 `/uploads` 静态文件服务只在 `initWebServer` 中注册一次
- **检查点**: 在 `main()` 函数中不要重复调用 `r.Static("/uploads", "./uploads")`

## 验证修复

修复完成后，应该能够：
1. ✅ 正常登录用户
2. ✅ 保持登录状态
3. ✅ 成功上传头像
4. ✅ 在个人中心看到上传的头像
5. ✅ 头像文件正确保存到服务器

## 相关文件

- `server/src/web/user.go` - 用户认证和头像上传处理
- `server/src/web/middleware/login.go` - 登录中间件
- `server/main.go` - 主服务器配置
- `frontend/aii-home/src/components/ProfilePanel.tsx` - 前端头像上传组件
- `scripts/ensure-upload-dirs.bat` - 目录创建脚本
