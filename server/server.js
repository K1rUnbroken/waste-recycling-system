const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const db = require('./config/database')

const app = express()
const port = 3000

// 中间件
app.use(cors())
app.use(bodyParser.json())

// 添加请求日志中间件
app.use((req, res, next) => {
  // 只记录非GET请求的请求体
  if (req.method !== 'GET') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
    if (Object.keys(req.body).length > 0) {
      // 如果是密码相关的请求，隐藏密码
      const safeBody = { ...req.body }
      if (safeBody.password) {
        safeBody.password = '******'
      }
      console.log('请求数据:', safeBody)
    }
  }
  next()
})

const JWT_SECRET = 'your-secret-key'

// 验证管理员token的中间件
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    console.log('[认证失败] 未提供token')
    return res.status(401).json({
      success: false,
      message: '未提供token'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.isAdmin) {
      console.log('[认证失败] 非管理员token')
      return res.status(401).json({
        success: false,
        message: '无权限访问'
      })
    }
    req.admin = decoded
    next()
  } catch (err) {
    console.error('[认证失败] token验证失败:', err.message)
    res.status(401).json({
      success: false,
      message: 'token无效或已过期'
    })
  }
}

// 在文件开头添加计算预估金额的函数
function calculateEstimatedAmount(categoryId, weight) {
  const priceMap = {
    1: 1.0, // 废纸
    2: 0.8, // 塑料
    3: 2.5, // 金属
    4: 0.3  // 玻璃
  }
  return (priceMap[categoryId] || 0) * parseFloat(weight)
}

// 用户注册
app.post('/user/register', async (req, res) => {
  console.log('收到注册请求:', req.body)
  const { phone, password, name } = req.body

  try {
    // 检查手机号是否已注册
    const [existingUsers] = await db.query('SELECT * FROM users WHERE phone = ?', [phone])
    if (existingUsers.length > 0) {
      return res.json({
        success: false,
        message: '该手机号已注册'
      })
    }

    // 创建新用户
    const [result] = await db.query(
      'INSERT INTO users (phone, password, name) VALUES (?, ?, ?)',
      [phone, password, name]
    )

    const userId = result.insertId
    const token = jwt.sign(
      { id: userId, phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      token,
      userInfo: {
        id: userId,
        phone,
        name
      }
    })
  } catch (err) {
    console.error('注册失败:', err)
    res.json({
      success: false,
      message: '注册失败'
    })
  }
})

// 用户登录
app.post('/user/login', async (req, res) => {
  console.log('收到登录请求:', req.body)
  const { phone, password } = req.body

  try {
    const [users] = await db.query('SELECT * FROM users WHERE phone = ?', [phone])
    if (users.length === 0) {
      return res.json({
        success: false,
        message: '用户不存在'
      })
    }

    const user = users[0]
    if (user.password !== password) {
      return res.json({
        success: false,
        message: '密码错误'
      })
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log('登录成功:', user)

    res.json({
      success: true,
      token,
      userInfo: {
        id: user.id,
        phone: user.phone,
        name: user.name
      }
    })
  } catch (err) {
    console.error('登录失败:', err)
    res.json({
      success: false,
      message: '登录失败'
    })
  }
})

// 验证用户 token
app.get('/user/check-token', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.json({
      success: false,
      message: '未提供 token'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id])

    if (users.length === 0) {
      return res.json({
        success: false,
        message: '用户不存在'
      })
    }

    const user = users[0]
    res.json({
      success: true,
      userInfo: {
        id: user.id,
        phone: user.phone,
        name: user.name
      }
    })
  } catch (err) {
    res.json({
      success: false,
      message: 'token 无效'
    })
  }
})

// 管理员登录
app.post('/admin/login', async (req, res) => {
  console.log('收到管理员登录请求:', req.body)
  const { username, password } = req.body

  try {
    const [admins] = await db.query('SELECT * FROM users WHERE phone = ?', [username])
    if (admins.length === 0) {
      return res.json({
        success: false,
        message: '管理员不存在'
      })
    }

    const admin = admins[0]
    if (admin.password !== password) {
      return res.json({
        success: false,
        message: '密码错误'
      })
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.phone, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      token,
      adminInfo: {
        id: admin.id,
        username: admin.phone,
        name: admin.name
      }
    })
  } catch (err) {
    console.error('管理员登录失败:', err)
    res.json({
      success: false,
      message: '登录失败'
    })
  }
})

// 验证管理员token
app.get('/admin/check-token', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.json({
      success: false,
      message: '未提供token'
    })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.isAdmin) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }
    
    const [admins] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id])
    if (admins.length === 0) {
      return res.json({
        success: false,
        message: '管理员不存在'
      })
    }
    
    const admin = admins[0]
    res.json({
      success: true,
      adminInfo: {
        id: admin.id,
        username: admin.phone,
        name: admin.name,
        isAdmin: true
      }
    })
  } catch (err) {
    console.error('验证管理员token失败:', err)
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 回收人员登录
app.post('/collector/login', async (req, res) => {
  console.log('收到回收人员登录请求:', req.body)
  const { phone, password } = req.body

  try {
    const [collectors] = await db.query('SELECT * FROM collectors WHERE phone = ?', [phone])
    if (collectors.length === 0) {
      return res.json({
        success: false,
        message: '回收人员不存在'
      })
    }

    const collector = collectors[0]
    if (collector.password !== password) {
      return res.json({
        success: false,
        message: '密码错误'
      })
    }

    const token = jwt.sign(
      { id: collector.id, phone: collector.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      token,
      collectorInfo: {
        id: collector.id,
        phone: collector.phone,
        name: collector.name
      }
    })
  } catch (err) {
    console.error('回收人员登录失败:', err)
    res.json({
      success: false,
      message: '登录失败'
    })
  }
})

// 验证回收人员 token
app.get('/collector/check-token', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.json({
      success: false,
      message: '未提供 token'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // 验证回收人员身份
    const [collectors] = await db.query('SELECT * FROM collectors WHERE id = ?', [decoded.id])
    if (collectors.length === 0) {
      return res.json({
        success: false,
        message: '回收人员不存在'
      })
    }

    const collector = collectors[0]
    res.json({
      success: true,
      collectorInfo: {
        id: collector.id,
        phone: collector.phone,
        name: collector.name,
        status: collector.status,
        totalIncome: collector.total_income,
        rating: collector.rating,
        orderCount: collector.order_count
      }
    })
  } catch (err) {
    console.error('验证回收人员token失败:', err)
    res.json({
      success: false,
      message: 'token 无效'
    })
  }
})

// 获取待接单列表
app.get('/collector/orders/pending', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // 验证回收人员身份
    const [collectors] = await db.query('SELECT * FROM collectors WHERE id = ?', [decoded.id])
    if (collectors.length === 0) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }

    // 从数据库中查询待接单订单
    const [orders] = await db.query(`
      SELECT 
        id,
        user_id as userId,
        user_name as userName,
        category_id as categoryId,
        category_name as categoryName,
        weight,
        address,
        appointment_date as appointmentDate,
        appointment_time as appointmentTime,
        remark,
        status,
        estimated_amount as estimatedAmount,
        create_time as createTime
      FROM orders 
      WHERE status = '待接单'
      ORDER BY create_time DESC
    `)

    res.json({
      success: true,
      data: orders.map(order => ({
        ...order,
        createTime: new Date(order.createTime).toLocaleString()
      }))
    })
  } catch (err) {
    console.error('获取待接单列表失败:', err)
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 接单
app.post('/collector/orders/:id/accept', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // 验证回收人员身份
    const [collectors] = await db.query('SELECT * FROM collectors WHERE id = ?', [decoded.id])
    if (collectors.length === 0) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }

    const collector = collectors[0]

    // 从数据库中查询订单
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id])
    if (orders.length === 0) {
      return res.json({
        success: false,
        message: '订单不存在'
      })
    }

    const order = orders[0]
    if (order.status !== '待接单') {
      return res.json({
        success: false,
        message: '该订单已被接取'
      })
    }

    // 更新订单状态
    await db.query(
      'UPDATE orders SET status = ?, collector_id = ?, collector_name = ?, collector_phone = ?, accept_time = NOW() WHERE id = ?',
      ['待上门', collector.id, collector.name, collector.phone, req.params.id]
    )

    // 重新获取更新后的订单信息
    const [updatedOrders] = await db.query(`
      SELECT 
        id,
        user_id as userId,
        user_name as userName,
        category_id as categoryId,
        category_name as categoryName,
        weight,
        address,
        appointment_date as appointmentDate,
        appointment_time as appointmentTime,
        remark,
        status,
        estimated_amount as estimatedAmount,
        create_time as createTime,
        collector_id as collectorId,
        collector_name as collectorName,
        collector_phone as collectorPhone,
        accept_time as acceptTime
      FROM orders 
      WHERE id = ?`,
      [req.params.id]
    )

    res.json({
      success: true,
      message: '接单成功',
      data: {
        ...updatedOrders[0],
        createTime: new Date(updatedOrders[0].createTime).toLocaleString(),
        acceptTime: updatedOrders[0].acceptTime ? new Date(updatedOrders[0].acceptTime).toLocaleString() : null
      }
    })
  } catch (err) {
    console.error('接单失败:', err)
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 创建订单
app.post('/orders', async (req, res) => {
  console.log('收到创建订单请求')
  const token = req.headers.authorization?.split(' ')[1]
  console.log('Token:', token)

  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log('token解析结果:', decoded)

    // 查询用户信息
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id])
    if (users.length === 0) {
      return res.json({
        success: false,
        message: '用户不存在'
      })
    }

    const user = users[0]
    console.log('查找到的用户:', user)

    const { categoryId, categoryName, weight, address, appointmentDate, appointmentTime, remark } = req.body
    console.log('订单数据验证:', req.body)

    // 计算预估金额
    const estimatedAmount = calculateEstimatedAmount(categoryId, weight)

    // 创建订单
    const [result] = await db.query(
      `INSERT INTO orders (
        user_id, user_name, category_id, category_name, weight, 
        address, appointment_date, appointment_time, remark, 
        status, estimated_amount, create_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user.id, user.name, categoryId, categoryName, weight,
        address, appointmentDate, appointmentTime, remark,
        '待接单', estimatedAmount
      ]
    )

    const orderId = result.insertId
    console.log('新订单创建成功，ID:', orderId)

    res.json({
      success: true,
      message: '订单创建成功',
      orderId
    })
  } catch (err) {
    console.error('创建订单失败:', err)
    res.json({
      success: false,
      message: err.message || '创建订单失败'
    })
  }
})

// 获取用户订单列表
app.get('/orders', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // 从数据库中查询用户的订单
    const [orders] = await db.query(
      `SELECT 
        id,
        category_id as categoryId,
        category_name as categoryName,
        weight,
        address,
        appointment_date as appointmentDate,
        appointment_time as appointmentTime,
        remark,
        status,
        estimated_amount as estimatedAmount,
        create_time as createTime
      FROM orders 
      WHERE user_id = ?
      ORDER BY create_time DESC`,
      [decoded.id]
    )

    res.json({
      success: true,
      data: orders.map(order => ({
        ...order,
        createTime: new Date(order.createTime).toLocaleString()
      }))
    })
  } catch (err) {
    console.error('获取订单列表失败:', err)
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 获取订单详情
app.get('/orders/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // 从数据库中查询订单
    const [orders] = await db.query(
      `SELECT 
        id,
        category_id as categoryId,
        category_name as categoryName,
        weight,
        address,
        appointment_date as appointmentDate,
        appointment_time as appointmentTime,
        remark,
        status,
        estimated_amount as estimatedAmount,
        create_time as createTime,
        collector_id as collectorId,
        collector_name as collectorName,
        collector_phone as collectorPhone,
        actual_weight as actualWeight,
        amount,
        accept_time as acceptTime,
        start_time as startTime,
        complete_time as completeTime,
        cancel_time as cancelTime
      FROM orders 
      WHERE id = ? AND user_id = ?`,
      [req.params.id, decoded.id]
    )

    if (orders.length === 0) {
      return res.json({
        success: false,
        message: '订单不存在'
      })
    }

    const order = orders[0]
    // 格式化时间
    order.createTime = new Date(order.createTime).toLocaleString()
    if (order.acceptTime) order.acceptTime = new Date(order.acceptTime).toLocaleString()
    if (order.startTime) order.startTime = new Date(order.startTime).toLocaleString()
    if (order.completeTime) order.completeTime = new Date(order.completeTime).toLocaleString()
    if (order.cancelTime) order.cancelTime = new Date(order.cancelTime).toLocaleString()

    res.json({
      success: true,
      data: order
    })
  } catch (err) {
    console.error('获取订单详情失败:', err)
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 取消订单
app.post('/orders/:id/cancel', async (req, res) => {
  console.log('收到取消订单请求:', req.params.id)
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // 从数据库中查询订单
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id])
    
    if (orders.length === 0) {
      return res.json({
        success: false,
        message: '订单不存在'
      })
    }

    const order = orders[0]
    
    if (order.user_id !== decoded.id) {
      return res.json({
        success: false,
        message: '无权操作此订单'
      })
    }

    if (order.status !== '待接单') {
      return res.json({
        success: false,
        message: '只能取消待接单状态的订单'
      })
    }

    // 更新订单状态
    await db.query(
      'UPDATE orders SET status = ?, cancel_time = NOW() WHERE id = ?',
      ['已取消', req.params.id]
    )

    console.log('订单取消成功:', order)

    res.json({
      success: true,
      message: '订单已取消'
    })
  } catch (err) {
    console.error('取消订单失败:', err)
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 获取回收人员的订单列表
app.get('/collector/orders', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // 验证回收人员身份
    const [collectors] = await db.query('SELECT * FROM collectors WHERE id = ?', [decoded.id])
    if (collectors.length === 0) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }

    // 从数据库中查询回收人员的订单
    const [orders] = await db.query(`
      SELECT 
        id,
        user_id as userId,
        user_name as userName,
        category_id as categoryId,
        category_name as categoryName,
        weight,
        address,
        appointment_date as appointmentDate,
        appointment_time as appointmentTime,
        remark,
        status,
        estimated_amount as estimatedAmount,
        actual_weight as actualWeight,
        amount,
        create_time as createTime,
        accept_time as acceptTime,
        start_time as startTime,
        complete_time as completeTime
      FROM orders 
      WHERE collector_id = ?
      ORDER BY create_time DESC`,
      [decoded.id]
    )

    res.json({
      success: true,
      data: orders.map(order => ({
        ...order,
        createTime: new Date(order.createTime).toLocaleString(),
        acceptTime: order.acceptTime ? new Date(order.acceptTime).toLocaleString() : null,
        startTime: order.startTime ? new Date(order.startTime).toLocaleString() : null,
        completeTime: order.completeTime ? new Date(order.completeTime).toLocaleString() : null
      }))
    })
  } catch (err) {
    console.error('获取回收人员订单列表失败:', err)
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 获取订单详情（回收人员版本）
app.get('/collector/orders/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // 验证回收人员身份
    const [collectors] = await db.query('SELECT * FROM collectors WHERE id = ?', [decoded.id])
    if (collectors.length === 0) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }

    // 从数据库中查询订单
    const [orders] = await db.query(`
      SELECT 
        id,
        user_id as userId,
        user_name as userName,
        category_id as categoryId,
        category_name as categoryName,
        weight,
        address,
        appointment_date as appointmentDate,
        appointment_time as appointmentTime,
        remark,
        status,
        estimated_amount as estimatedAmount,
        create_time as createTime,
        collector_id as collectorId,
        collector_name as collectorName,
        collector_phone as collectorPhone,
        actual_weight as actualWeight,
        amount,
        accept_time as acceptTime,
        start_time as startTime,
        complete_time as completeTime
      FROM orders 
      WHERE id = ? AND collector_id = ?`,
      [req.params.id, decoded.id]
    )

    if (orders.length === 0) {
      return res.json({
        success: false,
        message: '订单不存在'
      })
    }

    const order = orders[0]
    // 格式化时间
    order.createTime = new Date(order.createTime).toLocaleString()
    if (order.acceptTime) order.acceptTime = new Date(order.acceptTime).toLocaleString()
    if (order.startTime) order.startTime = new Date(order.startTime).toLocaleString()
    if (order.completeTime) order.completeTime = new Date(order.completeTime).toLocaleString()

    res.json({
      success: true,
      data: order
    })
  } catch (err) {
    console.error('获取回收人员订单详情失败:', err)
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 开始上门服务
app.post('/collector/orders/:id/start', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // 验证回收人员身份
    const [collectors] = await db.query('SELECT * FROM collectors WHERE id = ?', [decoded.id])
    if (collectors.length === 0) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }

    // 从数据库中查询订单
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ? AND collector_id = ?', [req.params.id, decoded.id])
    if (orders.length === 0) {
      return res.json({
        success: false,
        message: '订单不存在'
      })
    }

    const order = orders[0]
    if (order.status !== '待上门') {
      return res.json({
        success: false,
        message: '订单状态错误'
      })
    }

    // 更新订单状态
    await db.query(
      'UPDATE orders SET status = ?, start_time = NOW() WHERE id = ?',
      ['服务中', req.params.id]
    )

    // 获取更新后的订单信息
    const [updatedOrders] = await db.query(`
      SELECT 
        id,
        user_id as userId,
        user_name as userName,
        category_id as categoryId,
        category_name as categoryName,
        weight,
        address,
        appointment_date as appointmentDate,
        appointment_time as appointmentTime,
        remark,
        status,
        estimated_amount as estimatedAmount,
        create_time as createTime,
        start_time as startTime
      FROM orders 
      WHERE id = ?`,
      [req.params.id]
    )

    res.json({
      success: true,
      message: '已开始上门服务',
      data: {
        ...updatedOrders[0],
        createTime: new Date(updatedOrders[0].createTime).toLocaleString(),
        startTime: updatedOrders[0].startTime ? new Date(updatedOrders[0].startTime).toLocaleString() : null
      }
    })
  } catch (err) {
    console.error('开始上门服务失败:', err)
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 完成订单
app.post('/collector/orders/:id/complete', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // 验证回收人员身份
    const [collectors] = await db.query('SELECT * FROM collectors WHERE id = ?', [decoded.id])
    if (collectors.length === 0) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }

    const { actualWeight, amount } = req.body
    if (!actualWeight || !amount) {
      return res.json({
        success: false,
        message: '请填写实际重量和金额'
      })
    }

    // 从数据库中查询订单
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ? AND collector_id = ?', [req.params.id, decoded.id])
    if (orders.length === 0) {
      return res.json({
        success: false,
        message: '订单不存在'
      })
    }

    const order = orders[0]
    if (order.status !== '服务中') {
      return res.json({
        success: false,
        message: '订单状态错误'
      })
    }

    // 更新订单完成时间
    await db.query(
      'UPDATE orders SET status = ?, actual_weight = ?, amount = ?, complete_time = NOW() WHERE id = ?',
      ['已完成', actualWeight, amount, req.params.id]
    )

    // 更新回收人员信息
    await db.query(
      'UPDATE collectors SET order_count = order_count + 1, total_income = total_income + ? WHERE id = ?',
      [amount, decoded.id]
    )

    // 获取更新后的订单信息
    const [updatedOrders] = await db.query(`
      SELECT 
        id,
        user_id as userId,
        user_name as userName,
        category_id as categoryId,
        category_name as categoryName,
        weight,
        address,
        appointment_date as appointmentDate,
        appointment_time as appointmentTime,
        remark,
        status,
        estimated_amount as estimatedAmount,
        actual_weight as actualWeight,
        amount,
        create_time as createTime,
        complete_time as completeTime
      FROM orders 
      WHERE id = ?`,
      [req.params.id]
    )

    res.json({
      success: true,
      message: '订单已完成',
      data: {
        ...updatedOrders[0],
        createTime: new Date(updatedOrders[0].createTime).toLocaleString(),
        completeTime: updatedOrders[0].completeTime ? new Date(updatedOrders[0].completeTime).toLocaleString() : null
      }
    })
  } catch (err) {
    console.error('完成订单失败:', err)
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 管理员数据概览
app.get('/admin/overview', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.isAdmin) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }
    
    // 验证管理员身份
    const [admins] = await db.query('SELECT * FROM users WHERE id = ? AND phone = ?', [decoded.id, 'admin'])
    if (admins.length === 0) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }

    // 获取统计数据
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as totalOrders,
        COUNT(DISTINCT user_id) as totalUsers,
        COUNT(DISTINCT collector_id) as totalCollectors,
        COALESCE(SUM(amount), 0) as totalIncome
      FROM orders
    `)

    res.json({
      success: true,
      data: stats[0]
    })
  } catch (err) {
    console.error('获取管理员概览数据失败:', err)
    res.json({
      success: false,
      message: '获取数据失败'
    })
  }
})

// 管理员今日数据
app.get('/admin/today', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.isAdmin) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }
    
    // 验证管理员身份
    const [admins] = await db.query('SELECT * FROM users WHERE id = ? AND phone = ?', [decoded.id, 'admin'])
    if (admins.length === 0) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }

    // 获取今日数据
    const today = new Date().toISOString().split('T')[0]
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as orderCount,
        COALESCE(SUM(amount), 0) as income,
        COUNT(DISTINCT user_id) as newUsers
      FROM orders
      WHERE DATE(create_time) = ?
    `, [today])

    res.json({
      success: true,
      data: stats[0]
    })
  } catch (err) {
    console.error('获取管理员今日数据失败:', err)
    res.json({
      success: false,
      message: '获取数据失败'
    })
  }
})

// 管理员最近订单
app.get('/admin/recent-orders', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.isAdmin) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }
    
    // 验证管理员身份
    const [admins] = await db.query('SELECT * FROM users WHERE id = ? AND phone = ?', [decoded.id, 'admin'])
    if (admins.length === 0) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }

    // 获取最近订单
    const [orders] = await db.query(`
      SELECT 
        o.id,
        o.status,
        o.create_time as createTime,
        o.amount,
        u.name as userName,
        c.name as collectorName
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN collectors c ON o.collector_id = c.id
      ORDER BY o.create_time DESC
      LIMIT 10
    `)

    res.json({
      success: true,
      data: orders.map(order => ({
        ...order,
        createTime: new Date(order.createTime).toLocaleString()
      }))
    })
  } catch (err) {
    console.error('获取管理员最近订单失败:', err)
    res.json({
      success: false,
      message: '获取数据失败'
    })
  }
})

// 管理员最近用户
app.get('/admin/recent-users', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.isAdmin) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }
    
    // 验证管理员身份
    const [admins] = await db.query('SELECT * FROM users WHERE id = ? AND phone = ?', [decoded.id, 'admin'])
    if (admins.length === 0) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }

    // 获取最近用户
    const [users] = await db.query(`
      SELECT 
        id,
        phone,
        name,
        create_time as createTime
      FROM users
      ORDER BY create_time DESC
      LIMIT 10
    `)

    res.json({
      success: true,
      data: users.map(user => ({
        ...user,
        createTime: new Date(user.createTime).toLocaleString()
      }))
    })
  } catch (err) {
    console.error('获取管理员最近用户失败:', err)
    res.json({
      success: false,
      message: '获取数据失败'
    })
  }
})

// 启动服务器
app.listen(port, '0.0.0.0', () => {
  console.log(`服务器运行在 http://localhost:${port}`)
  console.log('支持的路由:')
  console.log('- POST /user/register (用户注册)')
  console.log('- POST /user/login (用户登录)')
  console.log('- GET /user/check-token (验证用户token)')
  console.log('- POST /admin/login (管理员登录)')
  console.log('- GET /admin/check-token (验证管理员token)')
  console.log('- POST /orders (创建订单)')
  console.log('- GET /orders (获取用户订单列表)')
  console.log('- GET /orders/:id (获取订单详情)')
  console.log('- POST /orders/:id/cancel (取消订单)')
  console.log('- POST /collector/login (回收人员登录)')
  console.log('- GET /collector/check-token (验证回收人员token)')
  console.log('- GET /collector/orders/pending (获取待接单列表)')
  console.log('- POST /collector/orders/:id/accept (接单)')
  console.log('- GET /collector/orders (获取回收人员订单列表)')
  console.log('- GET /collector/orders/:id (获取回收人员订单详情)')
  console.log('- POST /collector/orders/:id/start (开始上门服务)')
  console.log('- POST /collector/orders/:id/complete (完成订单)')
  console.log('- GET /admin/overview (管理员数据概览)')
  console.log('- GET /admin/today (管理员今日数据)')
  console.log('- GET /admin/recent-orders (管理员最近订单)')
  console.log('- GET /admin/recent-users (管理员最近用户)')
}) 