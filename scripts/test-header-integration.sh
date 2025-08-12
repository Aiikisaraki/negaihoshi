#!/bin/bash

# 前端页头整合测试脚本

echo "🔍 开始测试前端页头整合效果..."

echo ""
echo "📁 检查文件结构..."

# 检查Navigation组件
if [ -f "frontend/aii-home/src/components/Navigation.tsx" ]; then
    echo "✅ Navigation组件文件存在"
    
    if grep -q "主导航栏" "frontend/aii-home/src/components/Navigation.tsx"; then
        echo "✅ Navigation组件包含主导航栏"
    else
        echo "❌ Navigation组件缺少主导航栏"
    fi
    
    if grep -q "登录状态显示区域" "frontend/aii-home/src/components/Navigation.tsx"; then
        echo "✅ Navigation组件包含登录状态显示区域"
    else
        echo "❌ Navigation组件缺少登录状态显示区域"
    fi
else
    echo "❌ Navigation组件文件不存在"
fi

echo ""

# 检查App.tsx
if [ -f "frontend/aii-home/src/App.tsx" ]; then
    echo "✅ App.tsx文件存在"
    
    if grep -q "登录状态显示区域" "frontend/aii-home/src/App.tsx"; then
        echo "❌ App.tsx仍包含登录状态显示区域（应该已移除）"
    else
        echo "✅ App.tsx已移除登录状态显示区域"
    fi
    
    if grep -q "Navigation.*isLoggedIn.*onLoginSuccess.*onLogout" "frontend/aii-home/src/App.tsx"; then
        echo "✅ App.tsx正确传递props给Navigation组件"
    else
        echo "❌ App.tsx未正确传递props给Navigation组件"
    fi
else
    echo "❌ App.tsx文件不存在"
fi

echo ""

# 检查组件导入
if grep -q "import.*Navigation.*from.*Navigation" "frontend/aii-home/src/App.tsx"; then
    echo "✅ App.tsx正确导入Navigation组件"
else
    echo "❌ App.tsx未正确导入Navigation组件"
fi

echo ""

# 检查AuthPanel导入
if grep -q "import.*AuthPanel.*from.*AuthPanel" "frontend/aii-home/src/components/Navigation.tsx"; then
    echo "✅ Navigation组件正确导入AuthPanel组件"
else
    echo "❌ Navigation组件未正确导入AuthPanel组件"
fi

echo ""
echo "🔍 检查代码质量..."

# 检查重复代码
if [ $(grep -c "登录状态显示区域" "frontend/aii-home/src/App.tsx") -eq 0 ]; then
    echo "✅ 无重复的登录状态显示区域代码"
else
    echo "❌ 发现重复的登录状态显示区域代码"
fi

echo ""
echo "📋 页头整合测试总结:"
echo "1. Navigation组件结构检查"
echo "2. App.tsx代码简化检查"
echo "3. 组件导入关系检查"
echo "4. 重复代码检查"
echo ""
echo "💡 如果所有检查都通过，说明页头整合成功！"
echo ""
echo "🎯 页头整合测试完成！"

