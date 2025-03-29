Page({
  data: {
    orderId: '',
    orderInfo: null,
    loading: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ orderId: options.id })
      this.loadOrderDetail()
    }
  },

  onPullDownRefresh() {
    this.loadOrderDetail()
  },

  // 加载订单详情
  async loadOrderDetail() {
    this.setData({ loading: true })

    try {
      const res = await wx.request({
        url: `${getApp().globalData.baseUrl}/admin/orders/${this.data.orderId}`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('adminToken')}`
        }
      })

      if (res.data.success) {
        this.setData({
          orderInfo: res.data.data
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
      wx.stopPullDownRefresh()
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

  // 查看用户详情
  viewUser() {
    const { userId } = this.data.orderInfo
    wx.navigateTo({
      url: `/pages/admin/userDetail/userDetail?id=${userId}`
    })
  },

  // 查看回收员详情
  viewCollector() {
    const { collectorId } = this.data.orderInfo
    wx.navigateTo({
      url: `/pages/admin/collectorDetail/collectorDetail?id=${collectorId}`
    })
  },

  // 复制订单号
  copyOrderNo() {
    wx.setClipboardData({
      data: this.data.orderInfo.orderNo,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        })
      }
    })
  }
}) 