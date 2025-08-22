@echo off
REM 环境设置脚本 (Windows)
REM 用于快速设置前端项目的环境变量

echo 🚀 设置前端项目环境变量...

REM 检查是否已存在 .env 文件
if exist ".env" (
    echo ⚠️  .env 文件已存在，是否要覆盖？(Y/N)
    set /p response=
    if /i not "%response%"=="Y" (
        echo ❌ 操作已取消
        exit /b 1
    )
)

REM 复制示例文件
copy env.example .env

echo ✅ 已创建 .env 文件
echo.
echo 📝 请编辑 .env 文件来配置你的API地址：
echo    VITE_API_BASE_URL=http://your-api-server:port/api
echo.
echo 🔧 其他可选配置：
echo    VITE_DEBUG_MODE=true    # 启用API调试日志
echo    VITE_DEV_MODE=true      # 启用开发模式
echo    VITE_API_TIMEOUT=30000  # API超时时间（毫秒）
echo.
echo 💡 提示：
echo    - 修改配置后需要重启开发服务器
echo    - 生产环境请设置 VITE_DEV_MODE=false
echo    - 查看 API_CONFIG.md 获取详细说明

pause
