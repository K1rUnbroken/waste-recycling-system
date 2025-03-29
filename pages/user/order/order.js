const app = getApp()

Page({
  data: {
    tabs: ['全部', '待接单', '待上门', '已完成', '已取消'],
    activeTab: 0,
    orders: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onShow() {
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
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/user/login/login'
        })
      }, 1500)
      return
    }

    this.setData({ loading: true })
    
    const app = getApp()
    wx.request({
      url: `${app.globalData.baseUrl}/orders`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.success) {
          let orders = res.data.data.map(order => ({
            ...order,
            createTime: new Date(order.createTime).toLocaleString()
          }))

          // 根据标签筛选订单
          if (this.data.activeTab > 0) {
            const status = this.data.tabs[this.data.activeTab]
            orders = orders.filter(order => order.status === status)
          }

          this.setData({
            orders: orders
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ loading: false })
        wx.stopPullDownRefresh()
      }
    })
  },

  // 跳转到订单详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/user/orderDetail/orderDetail?id=${id}`
    })
  },

  // 取消订单
  cancelOrder(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定要取消此订单吗？',
      success: (res) => {
        if (res.confirm) {
          const token = wx.getStorageSync('token')
          wx.request({
            url: `${app.globalData.baseUrl}/orders/${id}/cancel`,
            method: 'POST',
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: (res) => {
              if (res.data.success) {
                wx.showToast({
                  title: '取消成功',
                  icon: 'success'
                })
                this.loadOrders()
              } else {
                wx.showToast({
                  title: res.data.message,
                  icon: 'none'
                })
              }
            },
            fail: () => {
              wx.showToast({
                title: '操作失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  }
}) 