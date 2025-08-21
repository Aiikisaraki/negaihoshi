@echo off
echo 测试前端个人中心关注功能更新
echo ================================

echo.
echo 1. 检查后端服务是否运行...
curl -s http://localhost:8080/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 后端服务运行正常
) else (
    echo ✗ 后端服务未运行，请先启动后端服务
    echo   运行: cd server && go run main.go
    pause
    exit /b 1
)

echo.
echo 2. 检查前端构建状态...
cd frontend\aii-home
npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 前端构建成功
) else (
    echo ✗ 前端构建失败，请检查代码错误
    pause
    exit /b 1
)

echo.
echo 3. 启动前端开发服务器...
echo    前端将在 http://localhost:5173 启动
echo    请手动测试以下功能：
echo.
echo    - 未登录用户查看他人个人中心应显示"登录后可以关注用户"
echo    - 已登录用户查看他人个人中心应显示"关注"按钮
echo    - 点击关注后按钮应变为"取消关注"（灰色）
echo    - 再次点击应取消关注，按钮恢复为"关注"（蓝色）
echo    - 关注/取消关注后统计数据应实时更新
echo.
echo 按任意键启动前端服务器...
pause >nul

npm run dev
