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

module.exports = pool 