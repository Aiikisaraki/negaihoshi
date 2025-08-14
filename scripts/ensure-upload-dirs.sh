#!/bin/bash

# 确保上传目录存在
echo "创建必要的上传目录..."

# 创建头像上传目录
mkdir -p uploads/avatars

# 设置权限
chmod 755 uploads
chmod 755 uploads/avatars

echo "上传目录创建完成！"
echo "目录结构："
tree uploads/ 2>/dev/null || find uploads/ -type d

