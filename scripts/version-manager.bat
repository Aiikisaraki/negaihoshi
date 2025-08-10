@echo off
setlocal enabledelayedexpansion

REM 版本管理工具 (Windows版本)
REM 用于更新配置文件中的版本号

REM 配置文件路径
set CONFIG_FILE=config.json
set VERSION_FILE=.version

REM 显示帮助信息
if "%1"=="" goto show_help
if "%1"=="help" goto show_help
if "%1"=="--help" goto show_help
if "%1"=="-h" goto show_help

REM 检查配置文件是否存在
if not exist "%CONFIG_FILE%" (
    echo [ERROR] 配置文件 %CONFIG_FILE% 不存在
    exit /b 1
)

REM 根据命令执行相应操作
if "%1"=="show" goto show_version
if "%1"=="bump" goto bump_version
if "%1"=="set" goto set_version
if "%1"=="suffix" goto set_suffix
if "%1"=="clear-suffix" goto clear_suffix
goto show_help

:show_help
echo 版本管理工具
echo.
echo 用法: %0 [命令] [参数]
echo.
echo 命令:
echo   show                   显示当前版本号
echo   bump [major^|minor^|patch] 增加版本号
echo   set ^<version^>          设置指定版本号
echo   suffix ^<suffix^>        设置版本后缀
echo   clear-suffix           清除版本后缀
echo   help                   显示此帮助信息
echo.
echo 示例:
echo   %0 show                 # 显示当前版本
echo   %0 bump patch           # 增加补丁版本号 (1.0.0 -^> 1.0.1)
echo   %0 bump minor           # 增加次要版本号 (1.0.0 -^> 1.1.0)
echo   %0 bump major           # 增加主要版本号 (1.0.0 -^> 2.0.0)
echo   %0 set 1.2.3           # 设置版本号为 1.2.3
echo   %0 suffix beta          # 设置版本后缀为 beta (1.0.0-beta)
echo   %0 clear-suffix         # 清除版本后缀
goto end

:show_version
call :get_version_from_config
call :get_suffix_from_config
echo 当前版本信息:
echo   版本号: !VERSION!
if not "!SUFFIX!"=="" (
    echo   后缀: !SUFFIX!
) else (
    echo   后缀: 无
)
set FULL_VERSION=!VERSION!
if not "!SUFFIX!"=="" (
    set FULL_VERSION=!VERSION!-!SUFFIX!
)
echo   完整版本: !FULL_VERSION!
goto end

:bump_version
if "%2"=="" (
    echo [ERROR] 请指定版本类型 (major^|minor^|patch)
    exit /b 1
)
call :get_version_from_config
call :get_suffix_from_config
echo [INFO] 当前版本号: !VERSION!

REM 解析当前版本号
for /f "tokens=1,2,3 delims=." %%a in ("!VERSION!") do (
    set MAJOR=%%a
    set MINOR=%%b
    set PATCH=%%c
)

if "%2"=="major" (
    set /a MAJOR+=1
    set MINOR=0
    set PATCH=0
) else if "%2"=="minor" (
    set /a MINOR+=1
    set PATCH=0
) else if "%2"=="patch" (
    set /a PATCH+=1
) else (
    echo [ERROR] 无效的版本类型: %2
    echo [ERROR] 支持的类型: major, minor, patch
    exit /b 1
)

set NEW_VERSION=!MAJOR!.!MINOR!.!PATCH!
call :update_version_in_config !NEW_VERSION!

REM 显示完整版本号
set FULL_VERSION=!NEW_VERSION!
if not "!SUFFIX!"=="" (
    set FULL_VERSION=!NEW_VERSION!-!SUFFIX!
)
echo [SUCCESS] 版本号已增加到: !FULL_VERSION!
goto end

:set_version
if "%2"=="" (
    echo [ERROR] 请指定版本号
    exit /b 1
)
call :validate_version %2
call :update_version_in_config %2

REM 显示完整版本号
call :get_suffix_from_config
set FULL_VERSION=%2
if not "!SUFFIX!"=="" (
    set FULL_VERSION=%2-!SUFFIX!
)
echo [SUCCESS] 版本号已设置为: !FULL_VERSION!
goto end

:set_suffix
if "%2"=="" (
    echo [ERROR] 请指定版本后缀
    exit /b 1
)
call :update_suffix_in_config %2

REM 显示完整版本号
call :get_version_from_config
set FULL_VERSION=!VERSION!-%2
echo [SUCCESS] 版本后缀已设置为: !FULL_VERSION!
goto end

:clear_suffix
call :update_suffix_in_config ""
call :get_version_from_config
echo [SUCCESS] 版本后缀已清除，当前版本: !VERSION!
goto end

REM 从配置文件读取版本号
:get_version_from_config
for /f "tokens=2 delims=:," %%i in ('findstr "version" "%CONFIG_FILE%"') do (
    set VERSION=%%i
    set VERSION=!VERSION:"=!
    set VERSION=!VERSION: =!
)
goto :eof

REM 从配置文件读取版本后缀
:get_suffix_from_config
for /f "tokens=2 delims=:," %%i in ('findstr "version_suffix" "%CONFIG_FILE%"') do (
    set SUFFIX=%%i
    set SUFFIX=!SUFFIX:"=!
    set SUFFIX=!SUFFIX: =!
)
goto :eof

REM 更新配置文件中的版本号
:update_version_in_config
set NEW_VERSION=%1
set TEMP_FILE=%TEMP%\version_temp_%RANDOM%.json

REM 使用PowerShell更新版本号
powershell -Command "(Get-Content '%CONFIG_FILE%') -replace '\"version\": *\"[^\"]*\"', '\"version\": \"%NEW_VERSION%\"' | Set-Content '%TEMP_FILE%'"
move /y "%TEMP_FILE%" "%CONFIG_FILE%" >nul
echo [SUCCESS] 版本号已更新为: %NEW_VERSION%
goto :eof

REM 更新配置文件中的版本后缀
:update_suffix_in_config
set NEW_SUFFIX=%1
set TEMP_FILE=%TEMP%\suffix_temp_%RANDOM%.json

REM 使用PowerShell更新版本后缀
powershell -Command "(Get-Content '%CONFIG_FILE%') -replace '\"version_suffix\": *\"[^\"]*\"', '\"version_suffix\": \"%NEW_SUFFIX%\"' | Set-Content '%TEMP_FILE%'"
move /y "%TEMP_FILE%" "%CONFIG_FILE%" >nul
echo [SUCCESS] 版本后缀已更新为: %NEW_SUFFIX%
goto :eof

REM 验证版本号格式
:validate_version
echo %1 | findstr /r "^[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*" >nul
if errorlevel 1 (
    echo [ERROR] 无效的版本号格式: %1
    echo [ERROR] 版本号格式应为: X.Y.Z
    exit /b 1
)
goto :eof

:end
endlocal
