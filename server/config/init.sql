-- 创建数据库
CREATE DATABASE IF NOT EXISTS recycling_db;
USE recycling_db;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建回收员表
CREATE TABLE IF NOT EXISTS collectors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    id_card VARCHAR(18) NOT NULL,
    status VARCHAR(20) DEFAULT '在线',
    total_income DECIMAL(10,2) DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 5.0,
    order_count INT DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    category_id INT NOT NULL,
    category_name VARCHAR(50) NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    address TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    remark TEXT,
    status VARCHAR(20) DEFAULT '待接单',
    collector_id INT,
    collector_name VARCHAR(50),
    collector_phone VARCHAR(20),
    actual_weight DECIMAL(10,2),
    amount DECIMAL(10,2),
    estimated_amount DECIMAL(10,2),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accept_time TIMESTAMP NULL,
    start_time TIMESTAMP NULL,
    complete_time TIMESTAMP NULL,
    cancel_time TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (collector_id) REFERENCES collectors(id)
);

-- 插入默认管理员账号
INSERT INTO admins (username, name, password, create_time) 
VALUES ('admin', '管理员', 'admin123', NOW())
ON DUPLICATE KEY UPDATE id=id;

-- 插入默认用户
INSERT INTO users (phone, name, password, create_time) 
VALUES ('admin', 'admin', 'admin123', NOW())
ON DUPLICATE KEY UPDATE id=id;

-- 插入默认回收员
INSERT INTO collectors (phone, name, password, id_card, status, total_income, rating, order_count, create_time)
VALUES ('13800138000', '张师傅', '123456', '330102199001011234', '在线', 0, 5.0, 0, NOW())
ON DUPLICATE KEY UPDATE id=id; 