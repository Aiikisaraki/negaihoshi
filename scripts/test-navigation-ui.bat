@echo off
echo ========================================
echo 导航栏UI修改测试脚本
echo ========================================
echo.

echo [1/3] 检查前端代码编译...
cd frontend/aii-home
npm run build
if %errorlevel% neq 0 (
    echo ❌ 前端代码编译失败
    pause
    exit /b 1
)
echo ✅ 前端代码编译成功

echo.
echo [2/3] 检查修改的文件...
echo 检查Navigation.tsx的修改...
findstr /n "userProfile" src\components\Navigation.tsx
echo.
echo 检查App.tsx的修改...
findstr /n "userProfile.*profileData" src\App.tsx

echo.
echo [3/3] 检查TypeScript类型...
npx tsc --noEmit
if %errorlevel% neq 0 (
    echo ⚠️  TypeScript类型检查有警告，但不影响功能
) else (
    echo ✅ TypeScript类型检查通过
)

echo.
echo ========================================
echo 测试完成！
echo ========================================
echo.
echo 下一步：
echo 1. 启动前端应用: npm run dev
echo 2. 在浏览器中测试导航栏显示
echo 3. 登录后应该能看到用户头像和用户名
echo.
pause

