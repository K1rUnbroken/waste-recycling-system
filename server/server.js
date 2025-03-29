const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')

const app = express()
const port = 3000

// 中间件
app.use(cors())
app.use(bodyParser.json())

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`)
  console.log('请求体:', req.body)
  next()
})

// 模拟数据库
const users = [
  {
    id: 1,
    phone: '13048300784',
    name: 'kyr',
    password: 'kuangyiran666'
  }
] // 添加默认用户

// 添加回收人员数据
const collectors = [
  {
    id: 1,
    phone: '13800138000',
    name: '张师傅',
    password: '123456',
    idCard: '330102199001011234',
    status: '在线',
    totalIncome: 0,
    rating: 5.0,
    orderCount: 0
  }
]

const orders = [] // 添加订单数组
const JWT_SECRET = 'your-secret-key'

// 用户注册
app.post('/api/user/register', (req, res) => {
  console.log('收到注册请求:', req.body)
  const { phone, name, password } = req.body

  // 检查请求数据是否完整
  if (!phone || !name || !password) {
    console.log('注册信息不完整')
    return res.json({
      success: false,
      message: '请填写完整信息'
    })
  }

  // 检查手机号是否已注册
  if (users.find(user => user.phone === phone)) {
    console.log('手机号已注册:', phone)
    return res.json({
      success: false,
      message: '该手机号已注册'
    })
  }

  // 创建新用户
  const user = {
    id: users.length + 1,
    phone,
    name,
    password // 实际应用中应该加密存储
  }

  users.push(user)
  console.log('注册成功，当前用户列表:', users)

  res.json({
    success: true,
    message: '注册成功'
  })
})

// 用户登录
app.post('/api/user/login', (req, res) => {
  console.log('收到登录请求:', req.body)
  const { phone, password } = req.body

  const user = users.find(u => u.phone === phone && u.password === password)

  if (!user) {
    console.log('登录失败：用户不存在或密码错误')
    return res.json({
      success: false,
      message: '手机号或密码错误'
    })
  }

  // 生成 token
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
})

// 验证用户 token
app.get('/api/user/check-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.json({
      success: false,
      message: '未提供 token'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = users.find(u => u.id === decoded.id)

    if (!user) {
      return res.json({
        success: false,
        message: '用户不存在'
      })
    }

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
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body

  // 这里使用硬编码的管理员账号，实际应用中应该从数据库获取
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign(
      { id: 0, username, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      token,
      adminInfo: {
        id: 0,
        username,
        isAdmin: true
      }
    })
  } else {
    res.json({
      success: false,
      message: '用户名或密码错误'
    })
  }
})

// 验证管理员 token
app.get('/api/admin/check-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.json({
      success: false,
      message: '未提供 token'
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

    res.json({
      success: true,
      adminInfo: {
        id: decoded.id,
        username: decoded.username,
        isAdmin: decoded.isAdmin
      }
    })
  } catch (err) {
    res.json({
      success: false,
      message: 'token 无效'
    })
  }
})

// 回收人员登录
app.post('/api/collector/login', (req, res) => {
  console.log('收到回收人员登录请求:', req.body)
  const { phone, password } = req.body

  const collector = collectors.find(c => c.phone === phone && c.password === password)

  if (!collector) {
    console.log('登录失败：回收人员不存在或密码错误')
    return res.json({
      success: false,
      message: '手机号或密码错误'
    })
  }

  // 生成 token
  const token = jwt.sign(
    { id: collector.id, phone: collector.phone, isCollector: true },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  console.log('回收人员登录成功:', collector)
  res.json({
    success: true,
    token,
    collectorInfo: {
      id: collector.id,
      phone: collector.phone,
      name: collector.name,
      status: collector.status,
      totalIncome: collector.totalIncome,
      rating: collector.rating,
      orderCount: collector.orderCount
    }
  })
})

// 验证回收人员 token
app.get('/api/collector/check-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.json({
      success: false,
      message: '未提供 token'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.isCollector) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }

    const collector = collectors.find(c => c.id === decoded.id)
    if (!collector) {
      return res.json({
        success: false,
        message: '回收人员不存在'
      })
    }

    res.json({
      success: true,
      collectorInfo: {
        id: collector.id,
        phone: collector.phone,
        name: collector.name,
        status: collector.status,
        totalIncome: collector.totalIncome,
        rating: collector.rating,
        orderCount: collector.orderCount
      }
    })
  } catch (err) {
    res.json({
      success: false,
      message: 'token 无效'
    })
  }
})

// 获取待接单列表
app.get('/api/collector/orders/pending', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.isCollector) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }

    const pendingOrders = orders.filter(order => order.status === '待接单')
    res.json({
      success: true,
      data: pendingOrders
    })
  } catch (err) {
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 接单
app.post('/api/collector/orders/:id/accept', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.isCollector) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }

    const collector = collectors.find(c => c.id === decoded.id)
    const order = orders.find(o => o.id === parseInt(req.params.id))

    if (!order) {
      return res.json({
        success: false,
        message: '订单不存在'
      })
    }

    if (order.status !== '待接单') {
      return res.json({
        success: false,
        message: '该订单已被接取'
      })
    }

    // 更新订单信息
    order.status = '待上门'
    order.collectorId = collector.id
    order.collectorName = collector.name
    order.collectorPhone = collector.phone
    order.acceptTime = new Date().toISOString()

    res.json({
      success: true,
      message: '接单成功',
      data: order
    })
  } catch (err) {
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 创建订单
app.post('/api/orders', (req, res) => {
  console.log('收到创建订单请求')
  console.log('请求头:', req.headers)
  
  const token = req.headers.authorization?.split(' ')[1]
  console.log('Token:', token)
  
  if (!token) {
    console.log('未提供token')
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    console.log('开始验证token')
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log('token解析结果:', decoded)
    
    const user = users.find(u => u.id === decoded.id)
    console.log('查找到的用户:', user)

    if (!user) {
      console.log('用户不存在')
      return res.json({
        success: false,
        message: '用户不存在'
      })
    }

    // 验证请求数据
    const { categoryId, categoryName, weight, address, appointmentDate, appointmentTime, remark } = req.body
    console.log('订单数据验证:', { categoryId, categoryName, weight, address, appointmentDate, appointmentTime, remark })

    if (!categoryId || !categoryName || !weight || !address || !appointmentDate || !appointmentTime) {
      console.log('订单数据不完整')
      return res.json({
        success: false,
        message: '请填写完整信息'
      })
    }

    // 创建新订单
    const order = {
      id: orders.length + 1,
      userId: user.id,
      userName: user.name,
      categoryId,
      categoryName,
      weight,
      address,
      appointmentDate,
      appointmentTime,
      remark: remark || '',
      status: '待接单',
      createTime: new Date().toISOString()
    }

    orders.push(order)
    console.log('新订单创建成功:', order)

    res.json({
      success: true,
      message: '预约成功',
      orderId: order.id
    })
  } catch (err) {
    console.error('创建订单失败:', err)
    res.json({
      success: false,
      message: err.message || 'token无效'
    })
  }
})

// 获取用户订单列表
app.get('/api/orders', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const userOrders = orders.filter(order => order.userId === decoded.id)

    res.json({
      success: true,
      data: userOrders
    })
  } catch (err) {
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 获取订单详情
app.get('/api/orders/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const order = orders.find(o => o.id === parseInt(req.params.id))

    if (!order) {
      return res.json({
        success: false,
        message: '订单不存在'
      })
    }

    if (order.userId !== decoded.id) {
      return res.json({
        success: false,
        message: '无权访问此订单'
      })
    }

    res.json({
      success: true,
      data: order
    })
  } catch (err) {
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 取消订单
app.post('/api/orders/:id/cancel', (req, res) => {
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
    const order = orders.find(o => o.id === parseInt(req.params.id))

    if (!order) {
      return res.json({
        success: false,
        message: '订单不存在'
      })
    }

    if (order.userId !== decoded.id) {
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
    order.status = '已取消'
    order.cancelTime = new Date().toISOString()

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
app.get('/api/collector/orders', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.isCollector) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }

    const collectorOrders = orders.filter(order => order.collectorId === decoded.id)
    res.json({
      success: true,
      data: collectorOrders
    })
  } catch (err) {
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 获取订单详情（回收人员版本）
app.get('/api/collector/orders/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.isCollector) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }

    const order = orders.find(o => o.id === parseInt(req.params.id))
    if (!order) {
      return res.json({
        success: false,
        message: '订单不存在'
      })
    }

    res.json({
      success: true,
      data: order
    })
  } catch (err) {
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 开始上门服务
app.post('/api/collector/orders/:id/start', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.isCollector) {
      return res.json({
        success: false,
        message: '无权限访问'
      })
    }

    const order = orders.find(o => o.id === parseInt(req.params.id))
    if (!order) {
      return res.json({
        success: false,
        message: '订单不存在'
      })
    }

    if (order.status !== '待上门') {
      return res.json({
        success: false,
        message: '订单状态错误'
      })
    }

    order.status = '服务中'
    order.startTime = new Date().toISOString()

    res.json({
      success: true,
      message: '已开始上门服务',
      data: order
    })
  } catch (err) {
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 完成订单
app.post('/api/collector/orders/:id/complete', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.json({
      success: false,
      message: '请先登录'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.isCollector) {
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

    const order = orders.find(o => o.id === parseInt(req.params.id))
    if (!order) {
      return res.json({
        success: false,
        message: '订单不存在'
      })
    }

    if (order.status !== '服务中') {
      return res.json({
        success: false,
        message: '订单状态错误'
      })
    }

    // 更新订单信息
    order.status = '已完成'
    order.actualWeight = actualWeight
    order.amount = amount
    order.completeTime = new Date().toISOString()

    // 更新回收人员信息
    const collector = collectors.find(c => c.id === decoded.id)
    collector.orderCount += 1
    collector.totalIncome += amount

    res.json({
      success: true,
      message: '订单已完成',
      data: order
    })
  } catch (err) {
    res.json({
      success: false,
      message: 'token无效'
    })
  }
})

// 启动服务器
app.listen(port, '0.0.0.0', () => {
  console.log(`服务器运行在 http://localhost:${port}`)
  console.log('支持的路由:')
  console.log('- POST /api/user/register (用户注册)')
  console.log('- POST /api/user/login (用户登录)')
  console.log('- GET /api/user/check-token (验证用户token)')
  console.log('- POST /api/admin/login (管理员登录)')
  console.log('- GET /api/admin/check-token (验证管理员token)')
  console.log('- POST /api/orders (创建订单)')
  console.log('- GET /api/orders (获取用户订单列表)')
  console.log('- GET /api/orders/:id (获取订单详情)')
  console.log('- POST /api/orders/:id/cancel (取消订单)')
  console.log('- POST /api/collector/login (回收人员登录)')
  console.log('- GET /api/collector/check-token (验证回收人员token)')
  console.log('- GET /api/collector/orders/pending (获取待接单列表)')
  console.log('- POST /api/collector/orders/:id/accept (接单)')
  console.log('- GET /api/collector/orders (获取回收人员订单列表)')
  console.log('- GET /api/collector/orders/:id (获取回收人员订单详情)')
  console.log('- POST /api/collector/orders/:id/start (开始上门服务)')
  console.log('- POST /api/collector/orders/:id/complete (完成订单)')
}) 