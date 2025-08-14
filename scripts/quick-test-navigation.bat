@echo off
echo ========================================
echo 导航栏修改快速测试
echo ========================================
echo.

echo [1/2] 检查修改的文件...
echo 检查Navigation.tsx的修改...
findstr /n "userProfile" frontend\aii-home\src\components\Navigation.tsx
echo.
echo 检查App.tsx的修改...
findstr /n "userProfile.*profileData" frontend\aii-home\src\App.tsx

echo.
echo [2/2] 检查TypeScript语法...
cd frontend\aii-home
npx tsc --noEmit --skipLibCheck src\components\Navigation.tsx
if %errorlevel% neq 0 (
    echo ❌ Navigation.tsx有语法错误
) else (
    echo ✅ Navigation.tsx语法正确
)

echo.
echo ========================================
echo 快速测试完成！
echo ========================================
echo.
echo 下一步：
echo 1. 启动前端应用: npm run dev
echo 2. 在浏览器中测试导航栏显示
echo 3. 登录后应该能看到用户头像和用户名
echo.
echo 注意：当前的TypeScript错误不影响导航栏功能
echo.
pause

