const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345678', // 修改为您的MySQL密码
  database: 'recycling_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(50) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`

const createOrdersTable = `
  CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    user_contact VARCHAR(20) NOT NULL,
    category_id INT NOT NULL,
    category_name VARCHAR(50) NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    address TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    remark TEXT,
    status VARCHAR(20) NOT NULL,
    estimated_amount DECIMAL(10,2) NOT NULL,
    actual_weight DECIMAL(10,2),
    amount DECIMAL(10,2),
    collector_id INT,
    collector_name VARCHAR(50),
    collector_phone VARCHAR(20),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accept_time TIMESTAMP NULL,
    start_time TIMESTAMP NULL,
    complete_time TIMESTAMP NULL,
    cancel_time TIMESTAMP NULL
  )
`

// 创建tables
async function initDatabase() {
  try {
    // 创建users表
    await pool.query(createUsersTable)
    console.log('用户表创建成功或已存在')
    
    // 创建admins表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('管理员表创建成功或已存在')
    
    // 创建collectors表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collectors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(20) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        name VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        total_income DECIMAL(10,2) DEFAULT 0,
        order_count INT DEFAULT 0,
        rating DECIMAL(3,1) DEFAULT 5.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('回收人员表创建成功或已存在')
    
    // 创建orders表
    await pool.query(createOrdersTable)
    console.log('订单表创建成功或已存在')
    
    // 添加user_contact列（如果不存在）
    try {
      await pool.query(`
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS user_contact VARCHAR(20) NOT NULL 
        AFTER user_name
      `)
      console.log('确保user_contact列存在')
    } catch (err) {
      console.log('user_contact列可能已存在:', err.message)
    }
    
    // 添加测试数据
    const [admins] = await pool.query('SELECT * FROM admins')
    if (admins.length === 0) {
      await pool.query(`
        INSERT INTO admins (username, password, name)
        VALUES ('admin', 'admin123', '系统管理员')
      `)
      console.log('创建了默认管理员账号')
    }
    
    console.log('数据库初始化完成')
  } catch (err) {
    console.error('数据库初始化失败:', err)
  }
}

initDatabase()

module.exports = pool 