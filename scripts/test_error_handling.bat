@echo off
chcp 65001 >nul
echo 🧪 开始测试前端错误处理功能...

echo.
echo 📝 测试1: 正常用户注册
curl -X POST http://localhost:9292/api/users/signup -H "Content-Type: application/json" -d "{\"username\": \"testuser1\", \"email\": \"test1@example.com\", \"password\": \"Test123!@#\"}"

echo.
echo 📝 测试2: 重复用户名注册（期望409错误）
curl -X POST http://localhost:9292/api/users/signup -H "Content-Type: application/json" -d "{\"username\": \"testuser1\", \"email\": \"test2@example.com\", \"password\": \"Test123!@#\"}"

echo.
echo 📝 测试3: 重复邮箱注册（期望409错误）
curl -X POST http://localhost:9292/api/users/signup -H "Content-Type: application/json" -d "{\"username\": \"testuser2\", \"email\": \"test1@example.com\", \"password\": \"Test123!@#\"}"

echo.
echo 📝 测试4: 弱密码注册（期望400错误）
curl -X POST http://localhost:9292/api/users/signup -H "Content-Type: application/json" -d "{\"username\": \"testuser3\", \"email\": \"test3@example.com\", \"password\": \"123\"}"

echo.
echo 📝 测试5: 无效邮箱格式（期望400错误）
curl -X POST http://localhost:9292/api/users/signup -H "Content-Type: application/json" -d "{\"username\": \"testuser4\", \"email\": \"invalid-email\", \"password\": \"Test123!@#\"}"

echo.
echo 📝 测试6: 缺少必填字段（期望400错误）
curl -X POST http://localhost:9292/api/users/signup -H "Content-Type: application/json" -d "{\"username\": \"testuser5\", \"password\": \"Test123!@#\"}"

echo.
echo 📝 测试7: 用户登录（期望200成功）
curl -X POST http://localhost:9292/api/users/login -H "Content-Type: application/json" -d "{\"username\": \"testuser1\", \"password\": \"Test123!@#\"}"

echo.
echo 📝 测试8: 错误密码登录（期望401错误）
curl -X POST http://localhost:9292/api/users/login -H "Content-Type: application/json" -d "{\"username\": \"testuser1\", \"password\": \"wrongpassword\"}"

echo.
echo ✅ 错误处理测试完成！
echo 💡 请检查前端界面是否正确显示这些错误信息
pause
