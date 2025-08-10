@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 配置文件和目录
set CONFIG_FILE=config.json
set LOG_DIR=logs
set PID_DIR=pids
set BINARY_NAME=negaihoshi.exe

REM 创建必要的目录
if not exist %LOG_DIR% mkdir %LOG_DIR%
if not exist %PID_DIR% mkdir %PID_DIR%

REM 检查配置文件是否存在
if not exist "%CONFIG_FILE%" (
    echo [错误] 配置文件 %CONFIG_FILE% 不存在
    pause
    exit /b 1
)

REM 检查可执行文件是否存在
if not exist "%BINARY_NAME%" (
    echo [错误] 可执行文件 %BINARY_NAME% 不存在
    echo [警告] 请确保已经编译了后端程序
    pause
    exit /b 1
)

REM 启动后端服务
:start_backend
echo [信息] 启动后端服务...
tasklist /FI "IMAGENAME eq %BINARY_NAME%" 2>NUL | find /I /N "%BINARY_NAME%">NUL
if "%ERRORLEVEL%"=="0" (
    echo [警告] 后端服务已在运行
    goto :start_main_frontend
)

start /B %BINARY_NAME% > %LOG_DIR%\backend.log 2>&1
echo [成功] 后端服务已启动

REM 等待服务启动
timeout /t 2 /nobreak >nul

REM 启动主前端服务
:start_main_frontend
echo [信息] 启动主前端服务...
if exist "frontend-main" (
    cd frontend-main
    start /B python -m http.server 3000 > ..\%LOG_DIR%\main_frontend.log 2>&1
    cd ..
    echo [成功] 主前端服务已启动
) else (
    echo [警告] 主前端目录不存在，跳过
)

timeout /t 1 /nobreak >nul

REM 启动管理员前端服务
:start_admin_frontend
echo [信息] 启动管理员前端服务...
if exist "frontend-admin" (
    cd frontend-admin
    start /B python -m http.server 3001 > ..\%LOG_DIR%\admin_frontend.log 2>&1
    cd ..
    echo [成功] 管理员前端服务已启动
) else (
    echo [警告] 管理员前端目录不存在，跳过
)

timeout /t 1 /nobreak >nul

REM 显示服务状态
echo.
echo [信息] 服务状态:
echo ========================

REM 检查后端服务
tasklist /FI "IMAGENAME eq %BINARY_NAME%" 2>NUL | find /I /N "%BINARY_NAME%">NUL
if "%ERRORLEVEL%"=="0" (
    echo [成功] ✓ 后端服务运行中
) else (
    echo [错误] ✗ 后端服务未运行
)

REM 检查前端服务（通过端口检查）
netstat -an | find ":3000" >nul
if "%ERRORLEVEL%"=="0" (
    echo [成功] ✓ 主前端服务运行中 (端口 3000)
) else (
    echo [错误] ✗ 主前端服务未运行
)

netstat -an | find ":3001" >nul
if "%ERRORLEVEL%"=="0" (
    echo [成功] ✓ 管理员前端服务运行中 (端口 3001)
) else (
    echo [错误] ✗ 管理员前端服务未运行
)

echo ========================
echo.
echo [成功] 所有服务启动完成!
echo [信息] 访问地址:
echo   主前端: http://localhost:3000
echo   管理员前端: http://localhost:3001
echo   后端API: http://localhost:9292
echo   API文档: http://localhost:9292/api/docs
echo.
echo 按任意键退出...
pause >nul
