-- 在orders表中添加评价相关字段
ALTER TABLE orders 
ADD COLUMN user_rating INT NULL,
ADD COLUMN user_comment TEXT NULL,
ADD COLUMN collector_rating INT NULL,
ADD COLUMN collector_comment TEXT NULL,
ADD COLUMN user_rated BOOLEAN DEFAULT FALSE,
ADD COLUMN collector_rated BOOLEAN DEFAULT FALSE;

-- 创建评价表，用于存储详细的评价信息
CREATE TABLE IF NOT EXISTS ratings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 更新collectors表，确保rating字段的精度
ALTER TABLE collectors
MODIFY COLUMN rating DECIMAL(3,1) DEFAULT 5.0; 