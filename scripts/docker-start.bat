@echo off
REM Docker启动脚本 (Windows)
REM 用于快速启动项目的Docker环境

echo 🚀 启动 Negaihoshi Docker 环境...

REM 检查Docker是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安装，请先安装 Docker
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose 未安装，请先安装 Docker Compose
    pause
    exit /b 1
)

REM 检查配置文件是否存在
if not exist "config.json" (
    echo ⚠️  配置文件 config.json 不存在，将使用默认配置
)

REM 创建必要的目录
echo 📁 创建必要的目录...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "avatars" mkdir avatars

REM 选择启动模式
echo 请选择启动模式：
echo 1) 完整模式 (包含前端)
echo 2) 简化模式 (仅后端 + MySQL + Redis)
echo 3) 仅数据库 (MySQL + Redis)

set /p choice=请输入选择 (1-3): 

if "%choice%"=="1" (
    echo 🔧 启动完整模式...
    docker-compose up -d
    echo ✅ 完整模式启动完成！
    echo 📱 主前端: http://localhost:3000
    echo 🔧 管理前端: http://localhost:3001
    echo 🔌 后端API: http://localhost:9292
) else if "%choice%"=="2" (
    echo 🔧 启动简化模式...
    docker-compose -f docker-compose.simple.yml up -d
    echo ✅ 简化模式启动完成！
    echo 🔌 后端API: http://localhost:9292
    echo 💡 前端需要单独启动或使用本地开发服务器
) else if "%choice%"=="3" (
    echo 🔧 启动仅数据库模式...
    docker-compose -f docker-compose.simple.yml up -d mysql redis
    echo ✅ 数据库模式启动完成！
    echo 🗄️  MySQL: localhost:3306
    echo 🔴 Redis: localhost:6379
) else (
    echo ❌ 无效选择
    pause
    exit /b 1
)

echo.
echo 📊 查看服务状态：
docker-compose ps

echo.
echo 📝 查看日志：
echo   docker-compose logs -f backend
echo   docker-compose logs -f mysql
echo   docker-compose logs -f redis

echo.
echo 🛑 停止服务：
echo   docker-compose down

pause
