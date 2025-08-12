@echo off
chcp 65001 >nul
echo 🧪 开始测试用户注册功能...

echo.
echo 📝 测试1: 正常用户注册
curl -X POST http://localhost:8080/api/users/signup -H "Content-Type: application/json" -d "{\"username\": \"testuser1\", \"email\": \"test1@example.com\", \"password\": \"Test123!@#\"}"

echo.
echo 📝 测试2: 重复用户名注册
curl -X POST http://localhost:8080/api/users/signup -H "Content-Type: application/json" -d "{\"username\": \"testuser1\", \"email\": \"test2@example.com\", \"password\": \"Test123!@#\"}"

echo.
echo 📝 测试3: 重复邮箱注册
curl -X POST http://localhost:8080/api/users/signup -H "Content-Type: application/json" -d "{\"username\": \"testuser2\", \"email\": \"test1@example.com\", \"password\": \"Test123!@#\"}"

echo.
echo 📝 测试4: 弱密码注册
curl -X POST http://localhost:8080/api/users/signup -H "Content-Type: application/json" -d "{\"username\": \"testuser3\", \"email\": \"test3@example.com\", \"password\": \"123\"}"

echo.
echo 📝 测试5: 无效邮箱格式
curl -X POST http://localhost:8080/api/users/signup -H "Content-Type: application/json" -d "{\"username\": \"testuser4\", \"email\": \"invalid-email\", \"password\": \"Test123!@#\"}"

echo.
echo 📝 测试6: 用户登录
curl -X POST http://localhost:8080/api/users/login -H "Content-Type: application/json" -d "{\"username\": \"testuser1\", \"password\": \"Test123!@#\"}"

echo.
echo 📝 测试7: 邮箱登录
curl -X POST http://localhost:8080/api/users/login -H "Content-Type: application/json" -d "{\"username\": \"test1@example.com\", \"password\": \"Test123!@#\"}"

echo.
echo ✅ 测试完成！
pause
