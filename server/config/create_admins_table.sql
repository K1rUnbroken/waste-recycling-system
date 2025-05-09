-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认管理员账号
INSERT INTO admins (username, name, password, create_time) 
VALUES ('admin', '管理员', 'admin123', NOW())
ON DUPLICATE KEY UPDATE id=id; 