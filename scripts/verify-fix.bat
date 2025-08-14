@echo off
echo ========================================
echo 头像上传401问题修复验证脚本
echo ========================================
echo.

echo [1/4] 检查代码编译...
cd server
go build -o negaihoshi.exe .
if %errorlevel% neq 0 (
    echo ❌ 代码编译失败，请检查代码错误
    pause
    exit /b 1
)
echo ✅ 代码编译成功

echo.
echo [2/4] 检查配置文件...
if exist "config\config.json" (
    echo ✅ 配置文件存在
) else (
    echo ❌ 配置文件不存在
    echo 请确保 config.json 文件存在
)

echo.
echo [3/4] 检查上传目录...
if exist "..\uploads\avatars" (
    echo ✅ 上传目录存在
) else (
    echo ❌ 上传目录不存在
    echo 请运行 ..\scripts\ensure-upload-dirs.bat
)

echo.
echo [4/4] 检查路由配置...
echo 检查main.go中是否有重复的静态文件服务注册...
findstr /n "Static.*uploads" main.go
echo.
echo 如果看到多行包含"uploads"的Static调用，说明有重复注册

echo.
echo ========================================
echo 修复验证完成！
echo ========================================
echo.
echo 下一步：
echo 1. 启动后端服务器: cd server && go run main.go
echo 2. 启动前端应用: cd frontend/aii-home && npm run dev
echo 3. 测试登录和头像上传功能
echo.
pause

