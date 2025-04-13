const app = getApp()

Page({
  data: {
    loading: true,  // 添加loading状态
    // 数据概览
    overview: {
      totalOrders: 0,
      totalUsers: 0,
      totalCollectors: 0,
      totalIncome: 0
    },
    // 今日数据
    today: {
      orders: 0,
      income: 0,
      newUsers: 0
    },
    // 最近订单
    recentOrders: [],
    // 最近用户
    recentUsers: []
  },

  onLoad() {
    console.log('[管理员首页] 页面加载')
    this.loadData()
  },

  onShow() {
    console.log('[管理员首页] 页面显示')
    this.loadData()
  },

  // 加载所有数据
  loadData() {
    console.log('[管理员首页] 开始加载所有数据')
    this.setData({ loading: true })
    const token = wx.getStorageSync('adminToken')
    console.log('[管理员首页] 当前管理员token:', token ? '存在' : '不存在')
    
    if (!token) {
      console.warn('[管理员首页] 未找到管理员token，准备跳转到登录页')
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/login/login',
          success: () => console.log('[管理员首页] 跳转到登录页成功'),
          fail: (err) => console.error('[管理员首页] 跳转到登录页失败:', err)
        })
      }, 1500)
      return
    }

    const header = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    console.log('[管理员首页] 准备验证token，请求头:', header)

    // 先验证token
    wx.request({
      url: `${app.globalData.baseUrl}/admin/check-token`,
      method: 'GET',
      header: header,
      success: (res) => {
        console.log('[管理员首页] token验证结果:', res.data)
        if (res.data && res.data.success) {
          console.log('[管理员首页] token验证成功，开始加载数据')
          // token验证成功，加载数据
          Promise.all([
            this.loadOverview(header),
            this.loadTodayData(header),
            this.loadRecentOrders(header),
            this.loadRecentUsers(header)
          ]).then(() => {
            console.log('[管理员首页] 所有数据加载完成')
            this.setData({ loading: false })
          }).catch(err => {
            console.error('[管理员首页] 数据加载失败:', err)
            this.setData({ loading: false })
            wx.showToast({
              title: err.message || '加载失败，请重试',
              icon: 'none'
            })
          })
        } else {
          console.warn('[管理员首页] token验证失败，准备跳转到登录页')
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          })
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/login/login',
              success: () => console.log('[管理员首页] 跳转到登录页成功'),
              fail: (err) => console.error('[管理员首页] 跳转到登录页失败:', err)
            })
          }, 1500)
        }
      },
      fail: (err) => {
        console.error('[管理员首页] token验证请求失败:', err)
        this.setData({ loading: false })
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      }
    })
  },

  // 加载数据概览
  loadOverview(header) {
    return new Promise((resolve, reject) => {
      console.log('[管理员首页] 开始请求概览数据')
      wx.request({
        url: `${app.globalData.baseUrl}/admin/overview`,
        method: 'GET',
        header: header,
        success: (res) => {
          console.log('[管理员首页] 概览数据响应状态:', res.statusCode)
          if (res.data && res.data.success) {
            console.log('[管理员首页] 解析概览数据:', res.data.data)
            this.setData({
              overview: {
                totalOrders: parseInt(res.data.data.totalOrders) || 0,
                totalUsers: parseInt(res.data.data.totalUsers) || 0,
                totalCollectors: parseInt(res.data.data.totalCollectors) || 0,
                totalIncome: parseFloat(res.data.data.totalIncome) || 0
              }
            })
            console.log('[管理员首页] 概览数据设置完成')
            resolve()
          } else {
            const errorMsg = res.data.message || '获取概览数据失败';
            console.error('[管理员首页] 获取概览数据失败:', errorMsg)
            reject(new Error(errorMsg))
          }
        },
        fail: (err) => {
          console.error('[管理员首页] 概览数据请求失败:', err)
          reject(err)
        }
      })
    })
  },

  // 加载今日数据
  loadTodayData(header) {
    return new Promise((resolve, reject) => {
      console.log('[管理员首页] 开始请求今日数据')
      wx.request({
        url: `${app.globalData.baseUrl}/admin/today`,
        method: 'GET',
        header: header,
        success: (res) => {
          console.log('[管理员首页] 今日数据响应状态:', res.statusCode)
          if (res.data && res.data.success) {
            console.log('[管理员首页] 解析今日数据:', res.data.data)
            this.setData({
              today: {
                orders: parseInt(res.data.data.orderCount) || 0,
                income: parseFloat(res.data.data.income) || 0,
                newUsers: parseInt(res.data.data.newUsers) || 0
              }
            })
            console.log('[管理员首页] 今日数据设置完成')
            resolve()
          } else {
            const errorMsg = res.data.message || '获取今日数据失败';
            console.error('[管理员首页] 获取今日数据失败:', errorMsg)
            reject(new Error(errorMsg))
          }
        },
        fail: (err) => {
          console.error('[管理员首页] 今日数据请求失败:', err)
          reject(err)
        }
      })
    })
  },

  // 加载最近订单
  loadRecentOrders(header) {
    return new Promise((resolve, reject) => {
      console.log('[管理员首页] 开始请求最近订单数据')
      wx.request({
        url: `${app.globalData.baseUrl}/admin/recent-orders`,
        method: 'GET',
        header: header,
        success: (res) => {
          console.log('[管理员首页] 最近订单响应状态:', res.statusCode)
          if (res.data && res.data.success) {
            console.log('[管理员首页] 获取到最近订单数量:', res.data.data ? res.data.data.length : 0)
            this.setData({
              recentOrders: res.data.data || []
            })
            console.log('[管理员首页] 最近订单数据设置完成')
            resolve()
          } else {
            const errorMsg = res.data.message || '获取最近订单失败';
            console.error('[管理员首页] 获取最近订单失败:', errorMsg)
            reject(new Error(errorMsg))
          }
        },
        fail: (err) => {
          console.error('[管理员首页] 最近订单请求失败:', err)
          reject(err)
        }
      })
    })
  },

  // 加载最近用户
  loadRecentUsers(header) {
    return new Promise((resolve, reject) => {
      console.log('[管理员首页] 开始请求最近用户数据')
      wx.request({
        url: `${app.globalData.baseUrl}/admin/recent-users`,
        method: 'GET',
        header: header,
        success: (res) => {
          console.log('[管理员首页] 最近用户响应状态:', res.statusCode)
          if (res.data && res.data.success) {
            console.log('[管理员首页] 获取到最近用户数量:', res.data.data ? res.data.data.length : 0)
            this.setData({
              recentUsers: res.data.data || []
            })
            console.log('[管理员首页] 最近用户数据设置完成')
            resolve()
          } else {
            const errorMsg = res.data.message || '获取最近用户失败';
            console.error('[管理员首页] 获取最近用户失败:', errorMsg)
            reject(new Error(errorMsg))
          }
        },
        fail: (err) => {
          console.error('[管理员首页] 最近用户请求失败:', err)
          reject(err)
        }
      })
    })
  },

  // 跳转到订单管理
  goToOrderManage() {
    console.log('[管理员首页] 准备跳转到订单管理页面')
    wx.navigateTo({
      url: '/pages/admin/orderManage/index',
      success: () => console.log('[管理员首页] 跳转到订单管理页面成功'),
      fail: (err) => {
        console.error('[管理员首页] 跳转到订单管理页面失败:', err)
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
  },

  // 跳转到用户管理
  goToUserManage() {
    console.log('[管理员首页] 准备跳转到用户管理页面')
    wx.navigateTo({
      url: '/pages/admin/userManage/index',
      success: () => console.log('[管理员首页] 跳转到用户管理页面成功'),
      fail: (err) => {
        console.error('[管理员首页] 跳转到用户管理页面失败:', err)
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
  },

  // 跳转到回收员管理
  goToCollectorManage() {
    console.log('[管理员首页] 准备跳转到回收员管理页面')
    wx.navigateTo({
      url: '/pages/admin/collectorManage/index',
      success: () => console.log('[管理员首页] 跳转到回收员管理页面成功'),
      fail: (err) => {
        console.error('[管理员首页] 跳转到回收员管理页面失败:', err)
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
  },

  // 退出登录
  logout() {
    console.log('[管理员首页] 准备退出登录')
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          console.log('[管理员首页] 用户确认退出登录')
          // 清除登录信息
          wx.removeStorageSync('adminToken')
          wx.removeStorageSync('userType')
          wx.removeStorageSync('adminInfo')
          console.log('[管理员首页] 已清除登录信息')
          
          // 跳转到登录页
          wx.redirectTo({
            url: '/pages/login/login',
            success: () => console.log('[管理员首页] 跳转到登录页成功'),
            fail: (err) => console.error('[管理员首页] 跳转到登录页失败:', err)
          })
        } else {
          console.log('[管理员首页] 用户取消退出登录')
        }
      }
    })
  }
}) 