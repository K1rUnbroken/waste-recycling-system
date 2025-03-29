Page({
  data: {
    tabs: ['待接单', '待上门', '已完成'],
    activeTab: 0,
    orders: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadOrders()
  },

  onShow() {
    // 每次显示页面时刷新订单列表
    this.setData({
      page: 1,
      orders: [],
      hasMore: true
    })
    this.loadOrders()
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      orders: [],
      hasMore: true
    })
    this.loadOrders()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadOrders()
    }
  },

  // 切换标签
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    if (this.data.activeTab === index) return
    
    this.setData({
      activeTab: index,
      page: 1,
      orders: [],
      hasMore: true
    })
    this.loadOrders()
  },

  // 加载订单列表
  loadOrders() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    const statusMap = {
      0: 'pending', // 待接单
      1: 'accepted', // 待上门
      2: 'completed' // 已完成
    }

    wx.request({
      url: `${getApp().globalData.baseUrl}/collector/orders`,
      method: 'GET',
      data: {
        page: this.data.page,
        pageSize: this.data.pageSize,
        status: statusMap[this.data.activeTab]
      },
      success: (res) => {
        if (res.data.success) {
          const newOrders = res.data.data.orders
          this.setData({
            orders: [...this.data.orders, ...newOrders],
            page: this.data.page + 1,
            hasMore: newOrders.length === this.data.pageSize
          })
        } else {
          wx.showToast({
            title: res.data.message || '加载失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
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
    wx.showModal({
      title: '提示',
      content: '确定接单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${getApp().globalData.baseUrl}/collector/orders/${orderId}/accept`,
            method: 'POST',
            success: (res) => {
              if (res.data.success) {
                wx.showToast({
                  title: '接单成功',
                  icon: 'success'
                })
                // 刷新订单列表
                this.setData({
                  page: 1,
                  orders: [],
                  hasMore: true
                })
                this.loadOrders()
              } else {
                wx.showToast({
                  title: res.data.message || '接单失败',
                  icon: 'none'
                })
              }
            },
            fail: () => {
              wx.showToast({
                title: '网络错误',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },

  // 完成订单
  completeOrder(e) {
    const orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定完成该订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${getApp().globalData.baseUrl}/collector/orders/${orderId}/complete`,
            method: 'POST',
            success: (res) => {
              if (res.data.success) {
                wx.showToast({
                  title: '订单已完成',
                  icon: 'success'
                })
                // 刷新订单列表
                this.setData({
                  page: 1,
                  orders: [],
                  hasMore: true
                })
                this.loadOrders()
              } else {
                wx.showToast({
                  title: res.data.message || '操作失败',
                  icon: 'none'
                })
              }
            },
            fail: () => {
              wx.showToast({
                title: '网络错误',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },

  // 查看订单详情
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/collector/orderDetail/orderDetail?id=${orderId}`
    })
  },

  // 联系用户
  contactUser(e) {
    const phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: phone
    })
  }
}) 