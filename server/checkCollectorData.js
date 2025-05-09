const db = require('./config/database');

async function checkAndFixCollectorData() {
  try {
    console.log('检查回收员数据...');
    
    // 查询所有回收员
    const [collectors] = await db.query('SELECT * FROM collectors');
    console.log('当前回收员数据:');
    collectors.forEach(c => {
      console.log(`ID: ${c.id}, 名称: ${c.name}, 电话: ${c.phone}, 总订单数: ${c.order_count}, 总收益: ${c.total_income}, 评分: ${c.rating}`);
    });
    
    // 计算每个回收员的实际完成订单数和总收益
    for (const collector of collectors) {
      // 修复回收员名称
      if (collector.name === '???' || !collector.name) {
        await db.query(
          'UPDATE collectors SET name = ? WHERE id = ?',
          ['默认回收员', collector.id]
        );
        console.log(`已更新回收员 #${collector.id} 名称为"默认回收员"`);
      }
      
      // 修复回收员状态
      if (collector.status === '??' || !collector.status) {
        await db.query(
          'UPDATE collectors SET status = ? WHERE id = ?',
          ['在线', collector.id]
        );
        console.log(`已更新回收员 #${collector.id} 状态为"在线"`);
      }
      
      // 确保评分是5.0
      if (!collector.rating) {
        await db.query(
          'UPDATE collectors SET rating = ? WHERE id = ?',
          [5.0, collector.id]
        );
        console.log(`已更新回收员 #${collector.id} 评分为5.0`);
      }
      
      const [orders] = await db.query(
        'SELECT COUNT(*) as count, SUM(amount) as total FROM orders WHERE collector_id = ? AND status = ?', 
        [collector.id, '已完成']
      );
      
      const count = orders[0].count || 0;
      const total = orders[0].total || 0;
      
      console.log(`计算结果 - ID: ${collector.id}, 完成订单数: ${count}, 总收益: ${total}`);
      
      // 更新回收员数据
      await db.query(
        'UPDATE collectors SET order_count = ?, total_income = ? WHERE id = ?',
        [count, total, collector.id]
      );
      
      console.log(`已更新回收员 #${collector.id} 数据: 订单数=${count}, 总收益=${total}`);
    }
    
    // 查询更新后的回收员数据
    const [updatedCollectors] = await db.query('SELECT * FROM collectors');
    console.log('\n更新后的回收员数据:');
    updatedCollectors.forEach(c => {
      console.log(`ID: ${c.id}, 名称: ${c.name}, 电话: ${c.phone}, 总订单数: ${c.order_count}, 总收益: ${c.total_income}, 评分: ${c.rating}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('检查/更新回收员数据失败:', err);
    process.exit(1);
  }
}

checkAndFixCollectorData(); 