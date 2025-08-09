#!/bin/bash

echo "🌟 启动 Negaihoshi 项目..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查 docker-compose 是否存在
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ docker-compose 未安装"
    exit 1
fi

echo "📦 构建并启动服务..."
docker-compose up --build -d

echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

echo ""
echo "🎉 项目启动完成！"
echo ""
echo "📱 前端地址: http://localhost:3000"
echo "🔧 后端API: http://localhost:9292"
echo "🗄️  MySQL: localhost:3306"
echo "💾 Redis: localhost:6379"
echo ""
echo "🛠️  管理命令："
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
echo ""
