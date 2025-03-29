Page({
  data: {
    userId: '',
    userInfo: null,
    orderList: [],
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0
    },
    loading: false,
    hasMore: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ userId: options.id })
      this.loadUserDetail()
      this.loadUserOrders()
    }
  },

  onPullDownRefresh() {
    this.setData({
      'pagination.page': 1,
      orderList: [],
      hasMore: true
    })
    this.loadUserDetail()
    this.loadUserOrders()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadUserOrders()
    }
  },

  // 加载用户详情
  async loadUserDetail() {
    try {
      const res = await wx.request({
        url: `${getApp().globalData.baseUrl}/admin/users/${this.data.userId}`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('adminToken')}`
        }
      })

      if (res.data.success) {
        this.setData({
          userInfo: res.data.data
        })
      } else {
        wx.showToast({
          title: res.data.message || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none'
      })
    } finally {
      wx.stopPullDownRefresh()
    }
  },

  // 加载用户订单列表
  async loadUserOrders() {
    if (this.data.loading) return

    this.setData({ loading: true })

    try {
      const res = await wx.request({
        url: `${getApp().globalData.baseUrl}/admin/users/${this.data.userId}/orders`,
        method: 'GET',
        data: {
          page: this.data.pagination.page,
          pageSize: this.data.pagination.pageSize
        },
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('adminToken')}`
        }
      })

      if (res.data.success) {
        const { orders, total } = res.data.data
        const hasMore = this.data.orderList.length + orders.length < total

        this.setData({
          orderList: [...this.data.orderList, ...orders],
          'pagination.total': total,
          'pagination.page': this.data.pagination.page + 1,
          hasMore
        })
      } else {
        wx.showToast({
          title: res.data.message || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 拨打电话
  makePhoneCall(e) {
    const { phone } = e.currentTarget.dataset
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: () => {
        wx.showToast({
          title: '拨打电话失败',
          icon: 'none'
        })
      }
    })
  },

  // 查看订单详情
  viewOrder(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/admin/orderDetail/orderDetail?id=${id}`
    })
  }
}) 