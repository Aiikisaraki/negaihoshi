@echo off
echo 测试头像上传功能...
echo.

echo 1. 确保后端服务器正在运行...
echo 2. 确保前端应用正在运行...
echo 3. 在浏览器中登录用户账户...
echo 4. 尝试上传头像...
echo.

echo 如果遇到401错误，请检查以下内容：
echo - 用户是否已登录
echo - 后端session是否正确设置
echo - 中间件是否正确配置
echo - 上传目录是否存在
echo.

echo 检查上传目录：
if exist "uploads\avatars" (
    echo ✓ 上传目录存在: uploads\avatars
) else (
    echo ✗ 上传目录不存在，请运行 ensure-upload-dirs.bat
)

echo.
echo 检查后端配置：
if exist "server\config\config.json" (
    echo ✓ 后端配置文件存在
) else (
    echo ✗ 后端配置文件不存在
)

echo.
echo 测试完成！
pause

