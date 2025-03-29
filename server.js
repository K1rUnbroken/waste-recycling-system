const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')

const app = express()
const port = 3000

// 中间件
app.use(cors())
app.use(bodyParser.json())

// 模拟数据库
const users = []
const JWT_SECRET = 'your-secret-key'

// 用户注册
app.post('/api/user/register', (req, res) => {
  const { phone, name, password } = req.body

  // 检查手机号是否已注册
  if (users.find(user => user.phone === phone)) {
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

  res.json({
    success: true,
    message: '注册成功'
  })
})

// 用户登录
app.post('/api/user/login', (req, res) => {
  const { phone, password } = req.body

  const user = users.find(u => u.phone === phone && u.password === password)

  if (!user) {
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

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`)
}) 