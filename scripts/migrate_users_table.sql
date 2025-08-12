-- 用户表结构迁移脚本
-- 为现有的users表添加username字段

USE negaihoshi;

-- 检查users表是否存在username字段
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'negaihoshi' 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'username') > 0,
    'SELECT "username字段已存在" as status',
    'ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE AFTER id'
));

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 为现有用户生成默认用户名（如果username字段为空）
UPDATE users 
SET username = CONCAT('user_', id) 
WHERE username IS NULL OR username = '';

-- 确保username字段不为空
ALTER TABLE users MODIFY COLUMN username VARCHAR(50) NOT NULL;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_username ON users(username);

-- 显示更新后的表结构
DESCRIBE users;
