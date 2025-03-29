const app = getApp()

Page({
  data: {
    username: 'admin',
    password: 'admin123'
  },

  // 输入用户名
  inputUsername(e) {
    this.setData({
      username: e.detail.value
    })
  },

  // 输入密码
  inputPassword(e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 登录
  login() {
    const { username, password } = this.data

    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '登录中...'
    })

    const loginData = { username, password }
    console.log('发送登录请求:', {
      url: `${app.globalData.baseUrl}/admin/login`,
      method: 'POST',
      data: loginData
    })

    wx.request({
      url: `${app.globalData.baseUrl}/admin/login`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: loginData,
      success: (res) => {
        wx.hideLoading()
        console.log('管理员登录完整响应:', res)
        console.log('管理员登录响应数据:', res.data)
        
        if (res.data && res.data.token) {
          // 保存登录信息
          const token = res.data.token
          wx.setStorageSync('token', token)
          wx.setStorageSync('userType', 'admin')
          if (res.data.adminInfo) {
            wx.setStorageSync('adminInfo', res.data.adminInfo)
          }

          console.log('保存的登录信息:', {
            token: wx.getStorageSync('token'),
            userType: wx.getStorageSync('userType'),
            adminInfo: wx.getStorageSync('adminInfo')
          })

          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })

          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/admin/index/index'
            })
          }, 1500)
        } else {
          console.log('登录失败，响应数据不完整:', res.data)
          wx.showToast({
            title: res.data.message || '登录失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('登录请求失败:', err)
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      }
    })
  },

  // 返回用户登录
  backToUserLogin() {
    wx.navigateBack()
  }
}) 