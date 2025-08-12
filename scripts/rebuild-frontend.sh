#!/bin/bash

# 前端项目重新构建脚本

echo "🚀 开始重新构建前端项目..."

echo ""
echo "📦 构建aii-home项目..."
cd frontend/aii-home
echo "当前目录: $(pwd)"
echo "安装依赖..."
npm install
echo "构建项目..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ aii-home项目构建失败"
    exit 1
fi
echo "✅ aii-home项目构建成功"

echo ""
echo "📦 构建admin项目..."
cd ../admin
echo "当前目录: $(pwd)"
echo "安装依赖..."
npm install
echo "构建项目..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ admin项目构建失败"
    exit 1
fi
echo "✅ admin项目构建成功"

echo ""
echo "🔄 返回项目根目录..."
cd ../..

echo ""
echo "🐳 重新构建Docker镜像..."
echo "构建frontend-main镜像..."
docker-compose build frontend-main
echo "构建frontend-admin镜像..."
docker-compose build frontend-admin

echo ""
echo "📋 构建总结:"
echo "✅ aii-home项目构建完成"
echo "✅ admin项目构建完成"
echo "✅ Docker镜像重新构建完成"
echo ""
echo "💡 现在可以启动服务查看新的图标效果:"
echo "docker-compose up -d"
echo ""
echo "🎯 图标统一修复完成！"

