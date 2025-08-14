@echo off
echo ========================================
echo 登录流程测试脚本
echo ========================================
echo.

echo [1/3] 检查代码编译...
cd frontend\aii-home
npm run build
if %errorlevel% neq 0 (
    echo ❌ 前端编译失败
    pause
    exit /b 1
)
echo ✅ 前端编译成功

echo.
echo [2/3] 检查登录相关代码...
echo 检查handleLogout函数:
findstr /n "apiClient.post.*logout" src\App.tsx
echo.
echo 检查handleLoginSuccess函数:
findstr /n "apiClient.get.*profile" src\App.tsx
echo.
echo 检查调试日志:
findstr /n "console.log" src\App.tsx

echo.
echo [3/3] 检查API配置...
echo 检查withCredentials设置:
findstr /n "withCredentials.*true" src\requests\api\index.ts
echo.
echo 检查baseURL配置:
findstr /n "baseURL.*localhost:9292" src\requests\api\index.ts

echo.
echo ========================================
echo 测试完成！
echo ========================================
echo.
echo 修复内容总结：
echo ✅ 修复handleLogout函数，添加后端session清除
echo ✅ 改进handleLoginSuccess函数，添加调试日志
echo ✅ 确保前端状态与后端session同步
echo ✅ 添加错误处理和调试信息
echo.
echo 下一步测试步骤：
echo.
echo 1. 启动后端服务器：
echo    cd server
echo    go run main.go
echo.
echo 2. 启动前端应用：
echo    cd frontend\aii-home
echo    npm run dev
echo.
echo 3. 测试登录流程：
echo    - 清除浏览器所有cookies
echo    - 打开浏览器开发者工具
echo    - 登录用户
echo    - 查看后端控制台是否显示"Session保存成功"
echo    - 查看前端控制台是否显示"登录成功，开始获取用户信息..."
echo    - 检查浏览器Application标签中的Cookies
echo.
echo 4. 测试登出流程：
echo    - 点击登出按钮
echo    - 查看后端控制台是否显示logout请求
echo    - 查看前端控制台是否显示"后端session已清除"
echo    - 检查浏览器cookies是否被清除
echo.
echo 5. 测试头像上传：
echo    - 登录后尝试上传头像
echo    - 查看后端控制台是否显示"用户已认证"
echo    - 检查是否不再返回401错误
echo.
echo 关键检查点：
echo - 登录时后端显示"Session保存成功"
echo - 前端显示"登录成功，开始获取用户信息..."
echo - 浏览器包含ssid cookie
echo - 登出时后端收到logout请求
echo - 头像上传时后端显示"用户已认证"
echo.
pause
