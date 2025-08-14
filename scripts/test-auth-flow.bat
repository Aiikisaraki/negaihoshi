@echo off
echo ========================================
echo 认证流程测试脚本
echo ========================================
echo.

echo [1/3] 检查后端代码编译...
cd server
go build -o negaihoshi.exe main.go
if %errorlevel% neq 0 (
    echo ❌ 后端编译失败
    pause
    exit /b 1
)
echo ✅ 后端编译成功

echo.
echo [2/3] 检查前端代码编译...
cd ..\frontend\aii-home
npm run build
if %errorlevel% neq 0 (
    echo ❌ 前端编译失败
    pause
    exit /b 1
)
echo ✅ 前端编译成功

echo.
echo [3/3] 检查关键配置...
cd ..\..
echo 检查session配置:
findstr /n "SameSite.*LaxMode" server\main.go
echo.
echo 检查调试日志:
findstr /n "fmt.Printf" server\src\web\middleware\login.go
echo.
echo 检查登录调试:
findstr /n "Session保存成功" server\src\web\user.go

echo.
echo ========================================
echo 测试完成！
echo ========================================
echo.
echo 下一步调试步骤：
echo.
echo 1. 启动后端服务器：
echo    cd server
echo    go run main.go
echo.
echo 2. 启动前端应用：
echo    cd frontend\aii-home
echo    npm run dev
echo.
echo 3. 测试认证流程：
echo    - 打开浏览器开发者工具
echo    - 清除所有cookies
echo    - 登录用户
echo    - 查看后端控制台的调试日志
echo    - 检查浏览器Application标签中的Cookies
echo    - 尝试上传头像
echo    - 查看Network标签中的请求头
echo.
echo 4. 关键检查点：
echo    - 后端是否显示"Session保存成功"
echo    - 中间件是否显示"用户已认证"
echo    - 浏览器是否包含ssid cookie
echo    - 请求头是否包含Cookie
echo.
echo 5. 常见问题解决：
echo    - 如果session保存失败，检查cookie配置
echo    - 如果中间件显示未登录，检查cookie传递
echo    - 如果跨域问题，检查CORS和SameSite设置
echo.
pause
