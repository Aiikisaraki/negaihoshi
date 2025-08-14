@echo off
echo ========================================
echo 创建上传目录脚本
echo ========================================
echo.

echo [1/3] 检查并创建uploads目录...
if not exist "uploads" (
    mkdir uploads
    echo ✅ 创建uploads目录成功
) else (
    echo ✅ uploads目录已存在
)

echo.
echo [2/3] 检查并创建avatars目录...
if not exist "uploads\avatars" (
    mkdir uploads\avatars
    echo ✅ 创建uploads\avatars目录成功
) else (
    echo ✅ uploads\avatars目录已存在
)

echo.
echo [3/3] 检查目录权限和结构...
echo 检查uploads目录:
dir uploads
echo.
echo 检查avatars目录:
dir uploads\avatars

echo.
echo ========================================
echo 目录创建完成！
echo ========================================
echo.
echo 目录结构:
echo 📁 uploads/
echo   📁 avatars/          - 头像文件存储目录
echo.
echo 权限检查:
echo - 确保目录可写
echo - 确保后端服务有访问权限
echo.
echo 配置说明:
echo - 后端配置中的Storage.path应该指向: ./uploads/avatars
echo - 静态文件服务路径: /uploads
echo - 头像访问URL格式: http://localhost:9292/uploads/avatars/filename.jpg
echo.
echo 下一步:
echo 1. 启动后端服务器
echo 2. 测试头像上传功能
echo 3. 验证文件保存和访问
echo.
pause
