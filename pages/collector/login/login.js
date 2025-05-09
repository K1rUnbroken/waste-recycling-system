const app = getApp()

Page({
  data: {
    phone: '',
    password: ''
  },

  onLoad() {
    // 设置默认测试账号
    this.setData({
      phone: '13800138000',
      password: '123456'
    })
  },

  // 输入手机号
  inputPhone(e) {
    this.setData({
      phone: e.detail.value
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
    const { phone, password } = this.data

    if (!phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }

    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }

    console.log('准备发送登录请求:', {
      url: `${app.globalData.baseUrl}/collector/login`,
      data: { phone, password }
    })

    wx.request({
      url: `${app.globalData.baseUrl}/collector/login`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        phone,
        password
      },
      success: (res) => {
        console.log('登录响应:', res.data)
        if (res.data.success) {
          // 保存登录信息
          wx.setStorageSync('token', res.data.token)
          
          // 保存回收员信息
          const collectorInfo = res.data.collectorInfo;
          wx.setStorageSync('userInfo', collectorInfo)
          wx.setStorageSync('userType', 'collector')

          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })

          // 跳转到回收人员首页
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/collector/index/index'
            })
          }, 1500)
        } else {
          wx.showToast({
            title: res.data.message || '登录失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('请求失败:', err)
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      }
    })
  }
}) 