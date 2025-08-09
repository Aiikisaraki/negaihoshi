#!/bin/bash

echo "🌟 启动 Negaihoshi 开发环境..."

# 启动基础服务（MySQL + Redis）
echo "📦 启动数据库服务..."
docker-compose up -d mysql redis

echo "⏳ 等待数据库启动..."
sleep 5

# 启动后端（开发模式）
echo "🔧 启动后端服务..."
cd server
go run main.go &
BACKEND_PID=$!

# 启动前端（开发模式）
echo "📱 启动前端服务..."
cd ../frontend/aii-home
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 开发环境启动完成！"
echo ""
echo "📱 前端开发服务: http://localhost:5173"
echo "🔧 后端API: http://localhost:9292"
echo "🗄️  MySQL: localhost:3306"
echo "💾 Redis: localhost:6379"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待中断信号
trap 'echo "🛑 正在停止服务..."; kill $BACKEND_PID $FRONTEND_PID; docker-compose stop mysql redis; exit' INT

wait
