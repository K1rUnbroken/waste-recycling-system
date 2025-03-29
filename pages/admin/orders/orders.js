Page({
  data: {
    tabs: ['全部', '待接单', '待上门', '已完成', '已取消'],
    activeTab: 0,
    orders: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    searchValue: ''
  },

  onLoad() {
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

  // 搜索订单
  onSearch(e) {
    this.setData({
      searchValue: e.detail.value,
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
      0: '', // 全部
      1: 'pending', // 待接单
      2: 'accepted', // 待上门
      3: 'completed', // 已完成
      4: 'cancelled' // 已取消
    }

    wx.request({
      url: `${getApp().globalData.baseUrl}/admin/orders`,
      method: 'GET',
      data: {
        page: this.data.page,
        pageSize: this.data.pageSize,
        status: statusMap[this.data.activeTab],
        keyword: this.data.searchValue
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

  // 查看订单详情
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/orderDetail/orderDetail?id=${orderId}`
    })
  }
}) 