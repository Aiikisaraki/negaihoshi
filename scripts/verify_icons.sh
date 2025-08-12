#!/bin/bash

# 图标验证脚本

echo "🔍 开始验证前端项目图标设置..."

echo ""
echo "📁 检查文件结构..."

# 检查后端图标文件
if [ -f "server/assets/favicon.ico" ]; then
    echo "✅ 后端图标文件存在: server/assets/favicon.ico"
    ls -la "server/assets/favicon.ico"
else
    echo "❌ 后端图标文件不存在: server/assets/favicon.ico"
fi

echo ""

# 检查aii-home项目图标文件
if [ -f "frontend/aii-home/public/favicon.ico" ]; then
    echo "✅ aii-home图标文件存在: frontend/aii-home/public/favicon.ico"
    ls -la "frontend/aii-home/public/favicon.ico"
else
    echo "❌ aii-home图标文件不存在: frontend/aii-home/public/favicon.ico"
fi

# 检查aii-home的index.html
if grep -q "favicon.ico" "frontend/aii-home/index.html"; then
    echo "✅ aii-home index.html已正确引用favicon.ico"
else
    echo "❌ aii-home index.html未正确引用favicon.ico"
fi

echo ""

# 检查admin项目图标文件
if [ -f "frontend/admin/public/favicon.ico" ]; then
    echo "✅ admin图标文件存在: frontend/admin/public/favicon.ico"
    ls -la "frontend/admin/public/favicon.ico"
else
    echo "❌ admin图标文件不存在: frontend/admin/public/favicon.ico"
fi

# 检查admin的index.html
if grep -q "favicon.ico" "frontend/admin/index.html"; then
    echo "✅ admin index.html已正确引用favicon.ico"
else
    echo "❌ admin index.html未正确引用favicon.ico"
fi

echo ""
echo "🔍 检查图标文件内容..."

# 比较图标文件是否一致
if [ -f "server/assets/favicon.ico" ] && [ -f "frontend/aii-home/public/favicon.ico" ]; then
    if cmp -s "server/assets/favicon.ico" "frontend/aii-home/public/favicon.ico"; then
        echo "✅ aii-home图标文件与后端图标文件一致"
    else
        echo "❌ aii-home图标文件与后端图标文件不一致"
    fi
fi

if [ -f "server/assets/favicon.ico" ] && [ -f "frontend/admin/public/favicon.ico" ]; then
    if cmp -s "server/assets/favicon.ico" "frontend/admin/public/favicon.ico"; then
        echo "✅ admin图标文件与后端图标文件一致"
    else
        echo "❌ admin图标文件与后端图标文件不一致"
    fi
fi

echo ""
echo "📋 图标设置总结:"
echo "1. 后端图标: server/assets/favicon.ico"
echo "2. aii-home图标: frontend/aii-home/public/favicon.ico"
echo "3. admin图标: frontend/admin/public/favicon.ico"
echo ""
echo "✅ 图标验证完成！"

