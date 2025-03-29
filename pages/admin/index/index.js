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
    console.log('管理员首页加载')
    this.loadData()
  },

  onShow() {
    console.log('管理员首页显示')
    this.loadData()
  },

  // 加载所有数据
  loadData() {
    this.setData({ loading: true })
    const token = wx.getStorageSync('token')
    console.log('当前token:', token)
    
    if (!token) {
      console.log('未找到token，准备跳转到登录页')
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/admin/login/login'
        })
      }, 1500)
      return
    }

    const header = {
      'Content-Type': 'application/json',
      'Authorization': token
    }
    console.log('请求头部:', header)

    // 先尝试单独请求概览数据
    this.loadOverview(header)
      .then(() => {
        console.log('概览数据加载成功，开始加载其他数据')
        return Promise.all([
          this.loadTodayData(header),
          this.loadRecentOrders(header),
          this.loadRecentUsers(header)
        ])
      })
      .then(() => {
        console.log('所有数据加载完成:', this.data)
        this.setData({ loading: false })
      })
      .catch(err => {
        console.error('数据加载失败:', err)
        this.setData({ loading: false })
        wx.showToast({
          title: err.message || '加载失败，请重试',
          icon: 'none'
        })
      })
  },

  // 加载数据概览
  loadOverview(header) {
    return new Promise((resolve, reject) => {
      console.log('开始请求概览数据')
      wx.request({
        url: `${app.globalData.baseUrl}/admin/overview`,
        method: 'GET',
        header: header,
        success: (res) => {
          console.log('概览数据完整响应:', res)
          if (res.statusCode === 200 && res.data) {
            console.log('解析概览数据:', res.data)
            this.setData({
              overview: {
                totalOrders: parseInt(res.data.totalOrders) || 0,
                totalUsers: parseInt(res.data.totalUsers) || 0,
                totalCollectors: parseInt(res.data.totalCollectors) || 0,
                totalIncome: parseFloat(res.data.totalIncome) || 0
              }
            })
            resolve()
          } else {
            const error = new Error('获取概览数据失败: ' + JSON.stringify(res.data))
            console.error(error)
            reject(error)
          }
        },
        fail: (err) => {
          console.error('概览数据请求失败:', err)
          reject(err)
        }
      })
    })
  },

  // 加载今日数据
  loadTodayData(header) {
    return new Promise((resolve, reject) => {
      console.log('开始请求今日数据')
      wx.request({
        url: `${app.globalData.baseUrl}/admin/today`,
        method: 'GET',
        header: header,
        success: (res) => {
          console.log('今日数据完整响应:', res)
          if (res.statusCode === 200 && res.data) {
            console.log('解析今日数据:', res.data)
            this.setData({
              today: {
                orders: parseInt(res.data.orders) || 0,
                income: parseFloat(res.data.income) || 0,
                newUsers: parseInt(res.data.newUsers) || 0
              }
            })
            resolve()
          } else {
            const error = new Error('获取今日数据失败: ' + JSON.stringify(res.data))
            console.error(error)
            reject(error)
          }
        },
        fail: (err) => {
          console.error('今日数据请求失败:', err)
          reject(err)
        }
      })
    })
  },

  // 加载最近订单
  loadRecentOrders(header) {
    return new Promise((resolve, reject) => {
      console.log('开始请求最近订单数据')
      wx.request({
        url: `${app.globalData.baseUrl}/admin/recent-orders`,
        method: 'GET',
        header: header,
        success: (res) => {
          console.log('最近订单完整响应:', res)
          if (res.statusCode === 200) {
            console.log('解析最近订单数据:', res.data)
            this.setData({
              recentOrders: Array.isArray(res.data) ? res.data : []
            })
            resolve()
          } else {
            const error = new Error('获取最近订单失败: ' + JSON.stringify(res.data))
            console.error(error)
            reject(error)
          }
        },
        fail: (err) => {
          console.error('最近订单请求失败:', err)
          reject(err)
        }
      })
    })
  },

  // 加载最近用户
  loadRecentUsers(header) {
    return new Promise((resolve, reject) => {
      console.log('开始请求最近用户数据')
      wx.request({
        url: `${app.globalData.baseUrl}/admin/recent-users`,
        method: 'GET',
        header: header,
        success: (res) => {
          console.log('最近用户完整响应:', res)
          if (res.statusCode === 200) {
            console.log('解析最近用户数据:', res.data)
            this.setData({
              recentUsers: Array.isArray(res.data) ? res.data : []
            })
            resolve()
          } else {
            const error = new Error('获取最近用户失败: ' + JSON.stringify(res.data))
            console.error(error)
            reject(error)
          }
        },
        fail: (err) => {
          console.error('最近用户请求失败:', err)
          reject(err)
        }
      })
    })
  },

  // 跳转到订单管理
  goToOrderManage() {
    console.log('准备跳转到订单管理')
    wx.navigateTo({
      url: '/pages/admin/orderManage/index',
      success: () => console.log('跳转订单管理成功'),
      fail: (err) => {
        console.error('跳转订单管理失败:', err)
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
  },

  // 跳转到用户管理
  goToUserManage() {
    console.log('准备跳转到用户管理')
    wx.navigateTo({
      url: '/pages/admin/userManage/index',
      success: () => console.log('跳转用户管理成功'),
      fail: (err) => {
        console.error('跳转用户管理失败:', err)
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
  },

  // 跳转到回收员管理
  goToCollectorManage() {
    console.log('准备跳转到回收员管理')
    wx.navigateTo({
      url: '/pages/admin/collectorManage/index',
      success: () => console.log('跳转回收员管理成功'),
      fail: (err) => {
        console.error('跳转回收员管理失败:', err)
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
  }
}) 