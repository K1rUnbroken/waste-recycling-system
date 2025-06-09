const db = require('./config/database');

async function runMigration() {
  try {
    // 在orders表中添加评价相关字段
    await db.query(`
      ALTER TABLE orders 
      ADD COLUMN user_rating INT NULL,
      ADD COLUMN user_comment TEXT NULL,
      ADD COLUMN collector_rating INT NULL,
      ADD COLUMN collector_comment TEXT NULL,
      ADD COLUMN user_rated BOOLEAN DEFAULT FALSE,
      ADD COLUMN collector_rated BOOLEAN DEFAULT FALSE
    `);
    console.log('1. 添加评价字段成功');

    // 创建评价表
    await db.query(`
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
      )
    `);
    console.log('2. 创建评价表成功');

    // 更新collectors表
    await db.query(`
      ALTER TABLE collectors
      MODIFY COLUMN rating DECIMAL(3,1) DEFAULT 5.0
    `);
    console.log('3. 更新collectors表成功');

    console.log('数据库迁移全部成功');
    process.exit(0);
  } catch (err) {
    console.error('数据库迁移失败:', err);
    process.exit(1);
  }
}

runMigration(); 