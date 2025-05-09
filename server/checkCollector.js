const db = require('./config/database');

async function checkCollector(id) {
  try {
    // 查询回收员
    const [collectors] = await db.query('SELECT * FROM collectors WHERE id = ?', [id]);
    if (collectors.length === 0) {
      console.log('找不到该回收员');
      return;
    }
    
    const collector = collectors[0];
    console.log('回收员详情:');
    console.log(JSON.stringify(collector, null, 2));
    console.log('\n数据类型:');
    console.log('total_income:', typeof collector.total_income);
    console.log('order_count:', typeof collector.order_count);
    console.log('rating:', typeof collector.rating);
    
    // 模拟API响应
    const apiResponse = {
      success: true,
      collectorInfo: {
        id: collector.id,
        phone: collector.phone,
        name: collector.name,
        status: collector.status || '在线',
        totalIncome: parseFloat(collector.total_income) || 0,
        orderCount: parseInt(collector.order_count) || 0,
        rating: parseFloat(collector.rating) || 5.0
      }
    };
    
    console.log('\nAPI响应:');
    console.log(JSON.stringify(apiResponse, null, 2));
    console.log('\nAPI响应数据类型:');
    console.log('totalIncome:', typeof apiResponse.collectorInfo.totalIncome);
    console.log('orderCount:', typeof apiResponse.collectorInfo.orderCount);
    console.log('rating:', typeof apiResponse.collectorInfo.rating);
    
  } catch (err) {
    console.error('查询失败:', err);
  } finally {
    process.exit(0);
  }
}

// 查询ID为1的回收员
checkCollector(1); 