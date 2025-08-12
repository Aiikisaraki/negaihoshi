@echo off
chcp 65001 >nul
echo 🔍 开始验证前端项目图标设置...

echo.
echo 📁 检查文件结构...

REM 检查后端图标文件
if exist "server\assets\favicon.ico" (
    echo ✅ 后端图标文件存在: server\assets\favicon.ico
    dir "server\assets\favicon.ico"
) else (
    echo ❌ 后端图标文件不存在: server\assets\favicon.ico
)

echo.

REM 检查aii-home项目图标文件
if exist "frontend\aii-home\public\favicon.ico" (
    echo ✅ aii-home图标文件存在: frontend\aii-home\public\favicon.ico
    dir "frontend\aii-home\public\favicon.ico"
) else (
    echo ❌ aii-home图标文件不存在: frontend\aii-home\public\favicon.ico
)

REM 检查aii-home的index.html
findstr "favicon.ico" "frontend\aii-home\index.html" >nul
if %errorlevel% equ 0 (
    echo ✅ aii-home index.html已正确引用favicon.ico
) else (
    echo ❌ aii-home index.html未正确引用favicon.ico
)

echo.

REM 检查admin项目图标文件
if exist "frontend\admin\public\favicon.ico" (
    echo ✅ admin图标文件存在: frontend\admin\public\favicon.ico
    dir "frontend\admin\public\favicon.ico"
) else (
    echo ❌ admin图标文件不存在: frontend\admin\public\favicon.ico
)

REM 检查admin的index.html
findstr "favicon.ico" "frontend\admin\index.html" >nul
if %errorlevel% equ 0 (
    echo ✅ admin index.html已正确引用favicon.ico
) else (
    echo ❌ admin index.html未正确引用favicon.ico
)

echo.
echo 🔍 检查图标文件内容...

REM 比较图标文件是否一致
if exist "server\assets\favicon.ico" if exist "frontend\aii-home\public\favicon.ico" (
    fc "server\assets\favicon.ico" "frontend\aii-home\public\favicon.ico" >nul
    if %errorlevel% equ 0 (
        echo ✅ aii-home图标文件与后端图标文件一致
    ) else (
        echo ❌ aii-home图标文件与后端图标文件不一致
    )
)

if exist "server\assets\favicon.ico" if exist "frontend\admin\public\favicon.ico" (
    fc "server\assets\favicon.ico" "frontend\admin\public\favicon.ico" >nul
    if %errorlevel% equ 0 (
        echo ✅ admin图标文件与后端图标文件一致
    ) else (
        echo ❌ admin图标文件与后端图标文件不一致
    )
)

echo.
echo 📋 图标设置总结:
echo 1. 后端图标: server\assets\favicon.ico
echo 2. aii-home图标: frontend\aii-home\public\favicon.ico
echo 3. admin图标: frontend\admin\public\favicon.ico
echo.
echo ✅ 图标验证完成！
pause

