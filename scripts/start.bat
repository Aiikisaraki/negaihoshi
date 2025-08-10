@echo off
setlocal enabledelayedexpansion

REM 设置颜色代码
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM 配置文件和目录
set "CONFIG_FILE=config.json"
set "LOG_DIR=logs"
set "PID_DIR=pids"

REM 创建必要的目录
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
if not exist "%PID_DIR%" mkdir "%PID_DIR%"

REM 检查配置文件是否存在，如果不存在则提示用户
if not exist "%CONFIG_FILE%" (
    echo %YELLOW%警告: 配置文件 %CONFIG_FILE% 不存在%NC%
    echo %BLUE%系统将尝试自动生成配置文件...%NC%
    
    REM 检查后端配置生成工具是否存在
    if exist "server\cmd\config-generator\main.go" (
        echo %BLUE%正在生成配置文件...%NC%
        cd server
        go run cmd\config-generator\main.go
        cd ..
        
        if not exist "..\%CONFIG_FILE%" (
            echo %RED%配置文件生成失败，请手动创建配置文件%NC%
            exit /b 1
        )
    ) else (
        echo %RED%配置文件生成工具不存在，请手动创建配置文件%NC%
        exit /b 1
    )
)

REM 检查服务是否运行
:check_service
set "pid_file=%PID_DIR%\%1.pid"
if exist "!pid_file!" (
    for /f %%i in (!pid_file!) do (
        tasklist /FI "PID eq %%i" 2>nul | find "%%i" >nul
        if !errorlevel! equ 0 (
            exit /b 0
        ) else (
            del "!pid_file!" 2>nul
        )
    )
)
exit /b 1

REM 启动后端服务
:start_backend
echo %BLUE%启动后端服务...%NC%
call :check_service backend
if !errorlevel! equ 0 (
    echo %YELLOW%后端服务已在运行%NC%
    goto :eof
)

cd server
start /B go run main.go > ..\%LOG_DIR%\backend.log 2>&1
for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq go.exe" /FO CSV ^| find "go.exe"') do (
    echo %%i > ..\%PID_DIR%\backend.pid
)
cd ..
echo %GREEN%后端服务已启动%NC%
goto :eof

REM 启动主前端
:start_main_frontend
echo %BLUE%启动主前端服务...%NC%
call :check_service main_frontend
if !errorlevel! equ 0 (
    echo %YELLOW%主前端服务已在运行%NC%
    goto :eof
)

cd frontend\aii-home
start /B npm run dev > ..\..\%LOG_DIR%\main_frontend.log 2>&1
for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq node.exe" /FO CSV ^| find "node.exe"') do (
    echo %%i > ..\..\%PID_DIR%\main_frontend.pid
)
cd ..\..
echo %GREEN%主前端服务已启动%NC%
goto :eof

REM 启动管理员前端
:start_admin_frontend
echo %BLUE%启动管理员前端服务...%NC%
call :check_service admin_frontend
if !errorlevel! equ 0 (
    echo %YELLOW%管理员前端服务已在运行%NC%
    goto :eof
)

cd frontend\admin
start /B npm run dev > ..\..\%LOG_DIR%\admin_frontend.log 2>&1
for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq node.exe" /FO CSV ^| find "node.exe"') do (
    echo %%i > ..\..\%PID_DIR%\admin_frontend.pid
)
cd ..\..
echo %GREEN%管理员前端服务已启动%NC%
goto :eof

REM 检查依赖
:check_dependencies
echo %BLUE%检查依赖...%NC%

where go >nul 2>&1
if !errorlevel! neq 0 (
    echo %RED%错误: Go未安装%NC%
    exit /b 1
)

where node >nul 2>&1
if !errorlevel! neq 0 (
    echo %RED%错误: Node.js未安装%NC%
    exit /b 1
)

where npm >nul 2>&1
if !errorlevel! neq 0 (
    echo %RED%错误: npm未安装%NC%
    exit /b 1
)

echo %GREEN%依赖检查通过%NC%
goto :eof

REM 安装前端依赖
:install_frontend_deps
echo %BLUE%安装前端依赖...%NC%

if exist "frontend\aii-home" (
    echo %BLUE%安装主前端依赖...%NC%
    cd frontend\aii-home
    npm install
    cd ..\..
)

if exist "frontend\admin" (
    echo %BLUE%安装管理员前端依赖...%NC%
    cd frontend\admin
    npm install
    cd ..\..
)
goto :eof

REM 显示服务状态
:show_status
echo %BLUE%服务状态:%NC%

call :check_service backend
if !errorlevel! equ 0 (
    echo %GREEN%✓ 后端服务运行中%NC%
) else (
    echo %RED%✗ 后端服务未运行%NC%
)

call :check_service main_frontend
if !errorlevel! equ 0 (
    echo %GREEN%✓ 主前端服务运行中%NC%
) else (
    echo %RED%✗ 主前端服务未运行%NC%
)

call :check_service admin_frontend
if !errorlevel! equ 0 (
    echo %GREEN%✓ 管理员前端服务运行中%NC%
) else (
    echo %RED%✗ 管理员前端服务未运行%NC%
)
goto :eof

REM 停止所有服务
:stop_all
echo %BLUE%停止所有服务...%NC%

for %%f in (%PID_DIR%\*.pid) do (
    if exist "%%f" (
        for /f %%i in (%%f) do (
            taskkill /PID %%i /F >nul 2>&1
            echo %GREEN%已停止服务 (PID: %%i)%NC%
        )
        del "%%f" 2>nul
    )
)
goto :eof

REM 启动所有服务
:start_all
echo %BLUE%启动 Negaihoshi 系统...%NC%

call :check_dependencies
if !errorlevel! neq 0 exit /b 1

call :install_frontend_deps

call :start_backend
timeout /t 2 /nobreak >nul

call :start_main_frontend
timeout /t 1 /nobreak >nul

call :start_admin_frontend
timeout /t 1 /nobreak >nul

call :show_status

echo %GREEN%所有服务启动完成!%NC%
echo %BLUE%访问地址:%NC%
echo   主前端: http://localhost:3000
echo   管理员前端: http://localhost:3001
echo   后端API: http://localhost:9292
echo   API文档: http://localhost:9292/api/docs
goto :eof

REM 主函数
if "%1"=="" goto :start
if "%1"=="start" goto :start_all
if "%1"=="stop" goto :stop_all
if "%1"=="restart" (
    call :stop_all
    timeout /t 2 /nobreak >nul
    goto :start_all
)
if "%1"=="status" goto :show_status
if "%1"=="backend" goto :start_backend
if "%1"=="main-frontend" goto :start_main_frontend
if "%1"=="admin-frontend" goto :start_admin_frontend
if "%1"=="install" goto :install_frontend_deps

echo %YELLOW%用法: %0 [start^|stop^|restart^|status^|backend^|main-frontend^|admin-frontend^|install]%NC%
echo %BLUE%命令说明:%NC%
echo   start          - 启动所有服务
echo   stop           - 停止所有服务
echo   restart        - 重启所有服务
echo   status         - 显示服务状态
echo   backend        - 仅启动后端服务
echo   main-frontend  - 仅启动主前端服务
echo   admin-frontend - 仅启动管理员前端服务
echo   install        - 安装前端依赖
exit /b 1

:start
goto :start_all
