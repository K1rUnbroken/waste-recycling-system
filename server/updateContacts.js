const db = require('./config/database');

async function updateOrderContacts() {
  try {
    // 检查orders表是否有user_contact列
    const [columns] = await db.query('SHOW COLUMNS FROM orders LIKE ?', ['user_contact']);
    console.log('查询列结果:', columns);
    
    if (columns.length === 0) {
      console.log('user_contact列不存在，尝试添加...');
      await db.query('ALTER TABLE orders ADD COLUMN user_contact VARCHAR(20) AFTER user_name');
      console.log('已添加user_contact列');
    }

    // 获取所有联系方式为空的订单
    const [orders] = await db.query(`
      SELECT o.id, o.user_id, u.phone 
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.user_contact IS NULL OR o.user_contact = ''
    `);
    
    console.log(`找到 ${orders.length} 个需要更新联系方式的订单`);
    
    for (const order of orders) {
      console.log(`更新订单 #${order.id} 的联系方式为: ${order.phone}`);
      await db.query(
        'UPDATE orders SET user_contact = ? WHERE id = ?',
        [order.phone, order.id]
      );
    }
    
    console.log('所有订单联系方式更新完成');
    
    // 查看更新后的结果
    const [updatedOrders] = await db.query('SELECT id, user_contact FROM orders');
    console.log('更新后的订单联系方式:', updatedOrders);
    
    console.log('脚本执行完毕');
    process.exit(0);
  } catch (err) {
    console.error('更新订单联系方式失败:', err);
    process.exit(1);
  }
}

updateOrderContacts(); 