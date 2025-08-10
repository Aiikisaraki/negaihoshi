@echo off
setlocal enabledelayedexpansion

REM 版本检查脚本 (Windows版本)
REM 用于检测第三级版本号变更并触发自动构建

REM 配置文件路径
set CONFIG_FILE=config.json
set VERSION_FILE=.version

REM 颜色定义 (Windows不支持ANSI颜色，使用echo)
echo [INFO] 开始版本检查...

REM 检查配置文件是否存在
if not exist "%CONFIG_FILE%" (
    echo [ERROR] 配置文件 %CONFIG_FILE% 不存在
    exit /b 1
)

REM 从配置文件读取版本号
for /f "tokens=2 delims=:," %%i in ('findstr "version" "%CONFIG_FILE%"') do (
    set VERSION=%%i
    set VERSION=!VERSION:"=!
    set VERSION=!VERSION: =!
)

REM 从配置文件读取版本后缀
for /f "tokens=2 delims=:," %%i in ('findstr "version_suffix" "%CONFIG_FILE%"') do (
    set SUFFIX=%%i
    set SUFFIX=!SUFFIX:"=!
    set SUFFIX=!SUFFIX: =!
)

REM 组合完整版本号
set FULL_VERSION=%VERSION%
if not "%SUFFIX%"=="" (
    set FULL_VERSION=%VERSION%-%SUFFIX%
)

echo [INFO] 当前版本号: %FULL_VERSION%

REM 验证版本号格式 (简化验证)
echo %FULL_VERSION% | findstr /r "^[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*" >nul
if errorlevel 1 (
    echo [ERROR] 无效的版本号格式: %FULL_VERSION%
    echo [ERROR] 版本号格式应为: X.Y.Z 或 X.Y.Z-suffix
    exit /b 1
)

REM 读取之前保存的版本号
set PREVIOUS_VERSION=
if exist "%VERSION_FILE%" (
    for /f "delims=" %%i in (%VERSION_FILE%) do set PREVIOUS_VERSION=%%i
    echo [INFO] 之前版本号: !PREVIOUS_VERSION!
)

REM 检查第三级版本号是否变更
if "%PREVIOUS_VERSION%"=="" (
    echo [INFO] 首次运行，创建版本记录
    echo %FULL_VERSION% > "%VERSION_FILE%"
    echo [SUCCESS] 版本号变更检测成功，可以触发自动构建
    exit /b 0
)

REM 解析版本号 (获取第三级版本号)
for /f "tokens=3 delims=." %%i in ("%FULL_VERSION%") do set CURRENT_PATCH=%%i
for /f "tokens=3 delims=." %%i in ("!PREVIOUS_VERSION!") do set PREVIOUS_PATCH=%%i

REM 移除可能的后缀
for /f "tokens=1 delims=-" %%i in ("!CURRENT_PATCH!") do set CURRENT_PATCH=%%i
for /f "tokens=1 delims=-" %%i in ("!PREVIOUS_PATCH!") do set PREVIOUS_PATCH=%%i

if not "!CURRENT_PATCH!"=="!PREVIOUS_PATCH!" (
    echo [SUCCESS] 检测到第三级版本号变更: !PREVIOUS_PATCH! -^> !CURRENT_PATCH!
    echo %FULL_VERSION% > "%VERSION_FILE%"
    echo [SUCCESS] 版本号变更检测成功，可以触发自动构建
    exit /b 0
) else (
    echo [INFO] 第三级版本号未变更: !CURRENT_PATCH!
    echo %FULL_VERSION% > "%VERSION_FILE%"
    echo [INFO] 版本号未变更，无需触发构建
    exit /b 1
)
