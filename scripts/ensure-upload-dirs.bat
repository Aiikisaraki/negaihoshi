@echo off
echo 创建必要的上传目录...

REM 创建头像上传目录
if not exist "uploads\avatars" (
    mkdir "uploads\avatars"
    echo 创建目录: uploads\avatars
) else (
    echo 目录已存在: uploads\avatars
)

echo 上传目录创建完成！
echo 目录结构：
dir uploads /s

