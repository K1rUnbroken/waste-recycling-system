const db = require('./config/database');

async function checkOrdersTable() {
  try {
    console.log('检查orders表结构...');
    
    // 查看表结构
    const [columns] = await db.query('SHOW COLUMNS FROM orders');
    console.log('orders表列信息:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`);
    });
    
    // 查看一条订单数据示例
    const [orders] = await db.query('SELECT * FROM orders LIMIT 1');
    if (orders.length > 0) {
      console.log('\n订单数据示例:');
      console.log(orders[0]);
    } else {
      console.log('\n暂无订单数据');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('查询失败:', err);
    process.exit(1);
  }
}

checkOrdersTable(); 