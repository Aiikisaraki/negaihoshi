# 认证问题调试指南

## 问题描述
前端登录用户后，上传头像请求仍然返回401未授权错误。

## 已实施的修复

### 1. Session配置优化
```go
store := cookie.NewStore([]byte("secret"))
store.Options(sessions.Options{
    Path:     "/",
    Domain:   "",
    MaxAge:   86400 * 7, // 7 days
    Secure:   false,     // 开发环境设为false
    HttpOnly: true,
    SameSite: http.SameSiteLaxMode,
})
```

### 2. 调试日志添加
- 中间件添加了详细的调试日志
- 登录函数添加了session保存状态检查
- 前端API客户端添加了请求响应日志

### 3. 前端认证配置
```typescript
const apiClient = axios.create({
  baseURL: 'http://localhost:9292/api',
  timeout: 30000,
  withCredentials: true, // 启用跨域凭证
});
```

## 调试步骤

### 第一步：启动应用并测试登录

1. **启动后端服务器**：
   ```bash
   cd server
   go run main.go
   ```

2. **启动前端应用**：
   ```bash
   cd frontend/aii-home
   npm run dev
   ```

3. **清除浏览器数据**：
   - 打开浏览器开发者工具
   - 右键点击刷新按钮，选择"清空缓存并硬性重新加载"
   - 或者手动清除所有cookies

### 第二步：测试登录流程

1. **登录用户**：
   - 访问前端应用
   - 注册或登录用户账户
   - 观察后端控制台输出

2. **检查后端日志**：
   ```
   中间件处理请求: POST /api/users/login
   登录/注册路径 /api/users/login，跳过认证
   Session保存成功，userId: 1, username: testuser
   ```

3. **检查浏览器Cookies**：
   - 打开开发者工具 → Application → Cookies
   - 查找名为 `ssid` 的cookie
   - 确认cookie存在且有效

### 第三步：测试头像上传

1. **尝试上传头像**：
   - 点击"更换头像"按钮
   - 选择图片文件
   - 观察后端控制台输出

2. **检查后端日志**：
   ```
   中间件处理请求: POST /api/users/avatar
   Session中的userId: 1
   用户已认证，userId: 1
   ```

3. **检查前端网络请求**：
   - 打开开发者工具 → Network
   - 查找 `/api/users/avatar` 请求
   - 检查请求头是否包含Cookie

### 第四步：问题排查

#### 如果登录时显示"Session保存失败"
- 检查cookie配置
- 确认浏览器支持cookies
- 检查域名和路径设置

#### 如果中间件显示"用户未登录"
- 检查cookie是否正确传递
- 确认SameSite设置
- 验证跨域配置

#### 如果前端请求不包含Cookie
- 确认 `withCredentials: true` 设置
- 检查CORS配置
- 验证域名匹配

## 常见问题解决方案

### 1. Cookie不传递问题
```typescript
// 确保前端配置正确
const apiClient = axios.create({
  withCredentials: true,
  // 其他配置...
});
```

### 2. 跨域问题
```go
// 确保后端CORS配置正确
r.Use(cors.New(cors.Config{
    AllowCredentials: true,
    AllowOriginFunc: func(origin string) bool {
        return strings.Contains(origin, "localhost")
    },
}))
```

### 3. SameSite问题
```go
// 开发环境使用Lax模式
SameSite: http.SameSiteLaxMode,
```

### 4. 域名问题
```go
// 开发环境不设置特定域名
Domain: "",
```

## 调试工具

### 1. 浏览器开发者工具
- **Console**: 查看前端错误日志
- **Network**: 检查请求头和响应
- **Application**: 查看cookies和session存储

### 2. 后端日志
- 查看控制台输出的调试信息
- 检查session保存状态
- 验证中间件处理流程

### 3. 网络分析
- 使用浏览器Network标签
- 检查请求头中的Cookie
- 验证响应状态码

## 预期结果

### 成功情况
1. 登录时后端显示"Session保存成功"
2. 上传头像时后端显示"用户已认证"
3. 浏览器包含有效的ssid cookie
4. 请求头包含Cookie字段
5. 头像上传成功

### 失败情况
1. 登录时显示"Session保存失败"
2. 上传时显示"用户未登录"
3. 浏览器没有ssid cookie
4. 请求头不包含Cookie
5. 返回401错误

## 下一步

如果按照以上步骤仍然无法解决问题，请：

1. 提供完整的后端控制台日志
2. 提供浏览器Network标签的截图
3. 提供浏览器Application标签中Cookies的截图
4. 说明具体的错误信息和步骤

这将帮助我们进一步定位问题所在。
