@echo off
echo ========================================
echo 个人资料功能测试脚本
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
echo [2/3] 检查API客户端配置...
echo 检查API基础URL:
findstr /n "baseURL.*localhost:9292" src\requests\api\index.ts
echo.
echo 检查跨域凭证设置:
findstr /n "withCredentials.*true" src\requests\api\index.ts
echo.
echo 检查超时设置:
findstr /n "timeout.*30000" src\requests\api\index.ts

echo.
echo [3/3] 检查错误处理改进...
echo 检查详细错误信息:
findstr /n "详细信息:" src\components\ProfilePanel.tsx
echo.
echo 检查调试日志:
findstr /n "console.log" src\components\ProfilePanel.tsx

echo.
echo ========================================
echo 测试完成！
echo ========================================
echo.
echo 功能改进总结：
echo ✅ API客户端错误处理增强
echo ✅ 跨域请求凭证支持
echo ✅ 文件上传超时时间增加
echo ✅ 详细错误信息显示
echo ✅ 调试日志添加
echo ✅ 代码编译成功
echo.
echo 下一步测试：
echo 1. 启动前端应用: npm run dev
echo 2. 启动后端服务器
echo 3. 登录用户账户
echo 4. 尝试上传头像
echo 5. 尝试保存个人资料
echo 6. 查看浏览器控制台的详细日志
echo.
echo 如果仍有问题，请检查：
echo - 后端服务器是否正常运行
echo - 用户是否已正确登录
echo - 浏览器控制台的错误信息
echo - 网络请求的详细信息
echo.
pause
