-- 用户表结构迁移脚本
-- 用于支持个人资料功能

-- 1. 备份现有用户表
CREATE TABLE users_backup AS SELECT * FROM users;

-- 2. 删除现有用户表
DROP TABLE IF EXISTS users;

-- 3. 创建新的用户表
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL COMMENT '用户名',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT '邮箱',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    nickname VARCHAR(100) COMMENT '昵称',
    bio TEXT COMMENT '个人简介',
    avatar VARCHAR(500) COMMENT '头像URL',
    phone VARCHAR(20) COMMENT '手机号',
    location VARCHAR(200) COMMENT '位置',
    website VARCHAR(500) COMMENT '个人网站',
    ctime TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    utime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_ctime (ctime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 4. 从备份表恢复数据（如果有的话）
INSERT INTO users (id, username, email, password, nickname, bio, ctime, utime)
SELECT 
    id,
    username,
    email,
    password,
    COALESCE(nickname, username) as nickname,
    COALESCE(bio, '欢迎来到星の海の物語！') as bio,
    COALESCE(ctime, NOW()) as ctime,
    COALESCE(utime, NOW()) as utime
FROM users_backup;

-- 5. 重置自增ID（如果需要）
-- ALTER TABLE users AUTO_INCREMENT = (SELECT MAX(id) + 1 FROM users);

-- 6. 创建默认管理员用户（如果不存在）
INSERT IGNORE INTO users (username, email, password, nickname, bio, avatar, phone, location, website)
VALUES (
    'admin',
    'admin@negaihoshi.com',
    'admin123', -- 注意：生产环境应该使用加密密码
    '系统管理员',
    '星の海の物語系统管理员',
    '',
    '',
    '未知',
    ''
);

-- 7. 验证表结构
DESCRIBE users;

-- 8. 查看用户数据
SELECT id, username, email, nickname, bio, ctime, utime FROM users LIMIT 10;

-- 9. 清理备份表（确认数据无误后执行）
-- DROP TABLE users_backup;

