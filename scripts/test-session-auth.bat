@echo off
echo ========================================
echo Session认证状态测试脚本
echo ========================================
echo.

echo [1/4] 检查后端session配置...
echo 检查session中间件配置:
findstr /n "sessions.Sessions" server\main.go
echo.
echo 检查CORS配置:
findstr /n "AllowCredentials.*true" server\main.go
echo.
echo 检查session密钥:
findstr /n "cookie.NewStore" server\main.go

echo.
echo [2/4] 检查登录中间件...
echo 检查中间件路径匹配:
findstr /n "IgnorePaths" server\main.go
echo.
echo 检查session键名:
findstr /n "userId" server\src\web\middleware\login.go
echo.
echo 检查session键名:
findstr /n "userId" server\src\web\user.go

echo.
echo [3/4] 检查前端认证配置...
echo 检查withCredentials设置:
findstr /n "withCredentials.*true" frontend\aii-home\src\requests\api\index.ts
echo.
echo 检查baseURL配置:
findstr /n "baseURL.*localhost:9292" frontend\aii-home\src\requests\api\index.ts

echo.
echo [4/4] 检查路由配置...
echo 检查用户路由注册:
findstr /n "RegisterUserRoutes" server\src\web\user.go
echo.
echo 检查头像上传路由:
findstr /n "avatar.*UploadAvatar" server\src\web\user.go

echo.
echo ========================================
echo 测试完成！
echo ========================================
echo.
echo 可能的问题和解决方案：
echo.
echo 1. Session配置问题：
echo    - 检查session密钥是否一致
echo    - 确认CORS AllowCredentials设置
echo    - 验证session cookie域名设置
echo.
echo 2. 中间件路径匹配问题：
echo    - 确认/api/users/avatar不在忽略路径中
echo    - 检查路径匹配逻辑
echo.
echo 3. 前端认证问题：
echo    - 确认withCredentials: true设置
echo    - 检查浏览器是否支持cookies
echo    - 验证跨域请求配置
echo.
echo 4. 调试步骤：
echo    - 启动后端服务器
echo    - 启动前端应用
echo    - 登录用户
echo    - 检查浏览器Application标签中的Cookies
echo    - 查看Network标签中的请求头
echo    - 检查后端日志输出
echo.
echo 5. 常见解决方案：
echo    - 清除浏览器cookies重新登录
echo    - 检查浏览器隐私设置
echo    - 确认服务器时间同步
echo    - 验证session存储配置
echo.
pause
