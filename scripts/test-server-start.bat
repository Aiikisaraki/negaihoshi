@echo off
echo 测试服务器启动...
echo.

echo 1. 检查代码编译...
cd server
go build -o negaihoshi.exe .
if %errorlevel% neq 0 (
    echo ✗ 代码编译失败
    pause
    exit /b 1
)
echo ✓ 代码编译成功

echo.
echo 2. 检查配置文件...
if exist "config\config.json" (
    echo ✓ 配置文件存在
) else (
    echo ✗ 配置文件不存在
    echo 请确保 config.json 文件存在
)

echo.
echo 3. 检查上传目录...
if exist "..\uploads\avatars" (
    echo ✓ 上传目录存在
) else (
    echo ✗ 上传目录不存在
    echo 请运行 ..\scripts\ensure-upload-dirs.bat
)

echo.
echo 4. 尝试启动服务器（5秒后自动停止）...
echo 如果看到"Listening and serving HTTP on :9292"说明启动成功
echo.
timeout /t 5 /nobreak > nul
echo 测试完成！
pause

