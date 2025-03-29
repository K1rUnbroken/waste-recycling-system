const app = getApp()

Page({
  data: {
    tabs: ['待接单', '待上门', '已完成'],
    activeTab: 0,
    orders: [],
    collectorInfo: null,
    loading: false,
    hasMore: true
  },

  onLoad() {
    // 获取回收人员信息
    const collectorInfo = wx.getStorageSync('userInfo')
    this.setData({ collectorInfo })
    
    // 加载订单列表
    this.loadOrders()
  },

  onShow() {
    this.checkLoginStatus()
  },

  onPullDownRefresh() {
    this.loadOrders()
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const userType = wx.getStorageSync('userType')

    if (!token || userType !== 'collector') {
      wx.redirectTo({
        url: '/pages/collector/login/login'
      })
      return
    }

    wx.request({
      url: `${app.globalData.baseUrl}/collector/check-token`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (!res.data.success) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('userType')
          wx.redirectTo({
            url: '/pages/collector/login/login'
          })
        } else {
          this.setData({
            collectorInfo: res.data.collectorInfo
          })
        }
      }
    })
  },

  // 切换标签
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    if (this.data.activeTab === index) return
    
    this.setData({
      activeTab: index,
      orders: [],
      hasMore: true
    })
    this.loadOrders()
  },

  // 加载订单列表
  loadOrders() {
    const token = wx.getStorageSync('token')
    if (!token) return

    this.setData({ loading: true })

    let url = `${app.globalData.baseUrl}/collector/orders`
    if (this.data.activeTab === 0) {
      url = `${app.globalData.baseUrl}/collector/orders/pending`
    }

    wx.request({
      url,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.success) {
          const orders = res.data.data.map(order => ({
            ...order,
            createTime: new Date(order.createTime).toLocaleString()
          }))
          this.setData({ orders })
        }
      },
      complete: () => {
        this.setData({ loading: false })
        wx.stopPullDownRefresh()
      }
    })
  },

  // 接单
  acceptOrder(e) {
    const orderId = e.currentTarget.dataset.id
    const token = wx.getStorageSync('token')

    wx.showModal({
      title: '提示',
      content: '确定接此订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${app.globalData.baseUrl}/collector/orders/${orderId}/accept`,
            method: 'POST',
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: (res) => {
              if (res.data.success) {
                wx.showToast({
                  title: '接单成功',
                  icon: 'success'
                })
                this.loadOrders()
              } else {
                wx.showToast({
                  title: res.data.message,
                  icon: 'none'
                })
              }
            }
          })
        }
      }
    })
  },

  // 跳转到订单详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/collector/orderDetail/orderDetail?id=${id}`
    })
  }
}) 