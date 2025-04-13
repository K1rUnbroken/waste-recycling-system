App({
  // 初始化全局数据
  globalData: {
    baseUrl: 'http://localhost:3000',
    userInfo: null,
    isAdmin: false,
    isLoggedIn: false
  },

  // 小程序启动时自动调用方法检查登录状态
  onLaunch() {
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    // 从本地存储获取token
    const token = wx.getStorageSync('token')
    const adminToken = wx.getStorageSync('adminToken')

    if (adminToken) {
      // 如果存在管理员token，则设置状态
      this.globalData.isAdmin = true
      this.globalData.isLoggedIn = true
      
      // 验证管理员token有效性
      wx.request({
        url: `${this.globalData.baseUrl}/admin/check-token`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${adminToken}`
        },
        // 请求成功回调，如果token无效，则清除登录状态
        success: (res) => {
          if (!res.data.success) {
            this.clearLoginStatus()
          }
        },
        // 请求失败回调，清除登录状态
        fail: (err) => {
          console.error('管理员token验证失败:', err)
          // 网络错误，清除登录状态
          this.clearLoginStatus()
        }
      })
      // 如果存在普通用户token
    } else if (token) {
      this.globalData.isLoggedIn = true
      // 验证普通用户token有效性
      wx.request({
        url: `${this.globalData.baseUrl}/user/check-token`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          if (!res.data.success) {
            // token无效，清除登录状态
            this.clearLoginStatus()
          } else {
            // token有效，跳转到首页
            wx.switchTab({
              url: '/pages/index/index'
            })
          }
        },
        fail: (err) => {
          console.error('用户token验证失败:', err)
          // 网络错误，清除登录状态
          this.clearLoginStatus()
        }
      })
    }
  },

  // 清除登录状态
  clearLoginStatus() {
    wx.removeStorageSync('token')
    wx.removeStorageSync('adminToken')
    this.globalData.isAdmin = false
    this.globalData.isLoggedIn = false
    this.globalData.userInfo = null
  }
}) 