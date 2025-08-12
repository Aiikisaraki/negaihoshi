-- 密码加密迁移脚本
-- 用于将现有的明文密码转换为AES加密密码

-- 1. 备份现有用户表
CREATE TABLE users_backup_encryption AS SELECT * FROM users;

-- 2. 添加临时字段用于存储加密后的密码
ALTER TABLE users ADD COLUMN password_encrypted VARCHAR(500) AFTER password;

-- 3. 更新现有用户的密码（这里需要应用程序配合）
-- 注意：这个脚本只是准备数据库结构，实际的密码加密需要在应用程序中完成

-- 4. 验证表结构
DESCRIBE users;

-- 5. 查看用户数据（密码字段）
SELECT id, username, email, password, password_encrypted FROM users LIMIT 10;

-- 6. 迁移完成后，可以删除明文密码字段
-- ALTER TABLE users DROP COLUMN password;

-- 7. 重命名加密密码字段
-- ALTER TABLE users CHANGE password_encrypted password VARCHAR(500);

-- 8. 清理备份表（确认数据无误后执行）
-- DROP TABLE users_backup_encryption;

-- 注意事项：
-- 1. 在生产环境中执行前，请务必备份数据库
-- 2. 密码加密过程应该在应用程序中完成，而不是在SQL中
-- 3. 建议在维护窗口期间执行，避免影响用户登录
-- 4. 执行完成后，需要测试用户登录功能是否正常

