-- Negaihoshi 数据库初始化脚本
-- 创建数据库表结构

USE negaihoshi;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('active', 'banned', 'pending') DEFAULT 'active',
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_status (status)
);

-- 树洞消息表
CREATE TABLE IF NOT EXISTS treeholes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    user_id INT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- 用户状态表
CREATE TABLE IF NOT EXISTS statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- 文章表
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content LONGTEXT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- WordPress集成表
CREATE TABLE IF NOT EXISTS user_wordpress_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wordpress_url VARCHAR(255) NOT NULL,
    wordpress_username VARCHAR(100),
    wordpress_password VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_wordpress (user_id, wordpress_url),
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
);

-- 系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level ENUM('DEBUG', 'INFO', 'WARN', 'ERROR') NOT NULL,
    message TEXT NOT NULL,
    user_id INT,
    stack_trace TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_level (level),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- 系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
);

-- 插入默认系统设置
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('site_name', '树洞系统', '站点名称'),
('site_description', '一个匿名分享心情的平台', '站点描述'),
('allow_registration', 'true', '是否允许用户注册'),
('content_review', 'false', '是否启用内容审核'),
('max_post_length', '1000', '最大发布长度'),
('api_docs_enabled', 'true', '是否启用API文档'),
('admin_panel_enabled', 'true', '是否启用管理员面板'),
('wordpress_integration_enabled', 'true', '是否启用WordPress集成');

-- 创建默认管理员用户 (密码: admin123)
INSERT IGNORE INTO users (email, username, password_hash, role, status) VALUES
('admin@negaihoshi.com', 'admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iKGi', 'admin', 'active');

-- 插入一些示例数据
INSERT IGNORE INTO treeholes (content, user_id, status, likes_count) VALUES
('今天天气真好，心情也不错！', 1, 'approved', 5),
('分享一个有趣的想法...', 1, 'approved', 3),
('这是一个待审核的消息', 1, 'pending', 0);

INSERT IGNORE INTO statuses (content, user_id, status, likes_count) VALUES
('今天完成了重要的项目！', 1, 'approved', 8),
('学习新技术的感受', 1, 'approved', 4),
('这是一个待审核的状态', 1, 'pending', 0);

-- 创建视图
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.status,
    u.created_at,
    COUNT(DISTINCT t.id) as treehole_count,
    COUNT(DISTINCT s.id) as status_count,
    COUNT(DISTINCT p.id) as post_count
FROM users u
LEFT JOIN treeholes t ON u.id = t.user_id AND t.status = 'approved'
LEFT JOIN statuses s ON u.id = s.user_id AND s.status = 'approved'
LEFT JOIN posts p ON u.id = p.user_id AND p.status = 'published'
GROUP BY u.id;

-- 创建存储过程
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS GetUserActivity(IN user_id INT, IN days INT)
BEGIN
    SELECT 
        'treehole' as type,
        content,
        created_at,
        likes_count
    FROM treeholes 
    WHERE user_id = user_id AND created_at >= DATE_SUB(NOW(), INTERVAL days DAY)
    UNION ALL
    SELECT 
        'status' as type,
        content,
        created_at,
        likes_count
    FROM statuses 
    WHERE user_id = user_id AND created_at >= DATE_SUB(NOW(), INTERVAL days DAY)
    ORDER BY created_at DESC;
END //

CREATE PROCEDURE IF NOT EXISTS GetSystemStats()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
        (SELECT COUNT(*) FROM users WHERE status = 'banned') as banned_users,
        (SELECT COUNT(*) FROM treeholes WHERE status = 'pending') as pending_treeholes,
        (SELECT COUNT(*) FROM statuses WHERE status = 'pending') as pending_statuses,
        (SELECT COUNT(*) FROM system_logs WHERE level = 'ERROR' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as errors_last_24h;
END //

DELIMITER ;

-- 创建触发器
DELIMITER //

CREATE TRIGGER IF NOT EXISTS update_user_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
SET NEW.updated_at = CURRENT_TIMESTAMP;

CREATE TRIGGER IF NOT EXISTS update_treehole_updated_at
BEFORE UPDATE ON treeholes
FOR EACH ROW
SET NEW.updated_at = CURRENT_TIMESTAMP;

CREATE TRIGGER IF NOT EXISTS update_status_updated_at
BEFORE UPDATE ON statuses
FOR EACH ROW
SET NEW.updated_at = CURRENT_TIMESTAMP;

DELIMITER ;
