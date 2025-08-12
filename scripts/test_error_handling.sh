#!/bin/bash

# 前端错误处理测试脚本

echo "🧪 开始测试前端错误处理功能..."

# 测试1: 正常注册
echo "📝 测试1: 正常用户注册"
curl -X POST http://localhost:9292/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "email": "test1@example.com",
    "password": "Test123!@#"
  }' | jq '.'

echo -e "\n"

# 测试2: 重复用户名注册（应该返回409错误）
echo "📝 测试2: 重复用户名注册（期望409错误）"
curl -X POST http://localhost:9292/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "email": "test2@example.com",
    "password": "Test123!@#"
  }' | jq '.'

echo -e "\n"

# 测试3: 重复邮箱注册（应该返回409错误）
echo "📝 测试3: 重复邮箱注册（期望409错误）"
curl -X POST http://localhost:9292/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test1@example.com",
    "password": "Test123!@#"
  }' | jq '.'

echo -e "\n"

# 测试4: 弱密码注册（应该返回400错误）
echo "📝 测试4: 弱密码注册（期望400错误）"
curl -X POST http://localhost:9292/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser3",
    "email": "test3@example.com",
    "password": "123"
  }' | jq '.'

echo -e "\n"

# 测试5: 无效邮箱格式（应该返回400错误）
echo "📝 测试5: 无效邮箱格式（期望400错误）"
curl -X POST http://localhost:9292/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser4",
    "email": "invalid-email",
    "password": "Test123!@#"
  }' | jq '.'

echo -e "\n"

# 测试6: 缺少必填字段（应该返回400错误）
echo "📝 测试6: 缺少必填字段（期望400错误）"
curl -X POST http://localhost:9292/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser5",
    "password": "Test123!@#"
  }' | jq '.'

echo -e "\n"

# 测试7: 用户登录（应该返回200成功）
echo "📝 测试7: 用户登录（期望200成功）"
curl -X POST http://localhost:9292/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "password": "Test123!@#"
  }' | jq '.'

echo -e "\n"

# 测试8: 错误密码登录（应该返回401错误）
echo "📝 测试8: 错误密码登录（期望401错误）"
curl -X POST http://localhost:9292/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "password": "wrongpassword"
  }' | jq '.'

echo -e "\n✅ 错误处理测试完成！"
echo "💡 请检查前端界面是否正确显示这些错误信息"
