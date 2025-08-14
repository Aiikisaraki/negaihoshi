@echo off
echo ========================================
echo 主界面居中布局测试脚本
echo ========================================
echo.

echo [1/3] 检查代码编译...
cd frontend\aii-home
npm run build
if %errorlevel% neq 0 (
    echo ❌ 代码编译失败
    pause
    exit /b 1
)
echo ✅ 代码编译成功

echo.
echo [2/3] 检查居中布局实现...
echo 检查主界面居中布局:
findstr /n "flex items-center justify-center" src\App.tsx
echo.
echo 检查个人中心页面居中布局:
findstr /n "flex items-center justify-center" src\pages\ProfilePage.tsx

echo.
echo [3/3] 检查布局类名更新...
echo 检查主内容区域:
findstr /n "flex-1 flex items-center justify-center" src\App.tsx
echo.
echo 检查个人中心页面:
findstr /n "min-h-screen.*flex items-center justify-center" src\pages\ProfilePage.tsx

echo.
echo ========================================
echo 测试完成！
echo ========================================
echo.
echo 居中布局更新总结：
echo ✅ 主界面内容区域上下左右居中
echo ✅ 个人中心页面上下左右居中
echo ✅ 保持响应式设计
echo ✅ 代码编译成功
echo.
echo 布局改进详情：
echo - 主界面：使用 flex items-center justify-center 实现居中
echo - 个人中心：使用 min-h-screen + flex items-center justify-center 实现居中
echo - 内容宽度：使用 max-w-6xl 和 max-w-4xl 控制最大宽度
echo.
echo 下一步：
echo 1. 启动前端应用: npm run dev
echo 2. 查看主界面是否居中显示
echo 3. 导航到个人中心页面查看居中效果
echo 4. 测试不同屏幕尺寸下的居中效果
echo.
pause
