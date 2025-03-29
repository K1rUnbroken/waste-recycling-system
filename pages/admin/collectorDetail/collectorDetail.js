Page({
  data: {
    collectorId: '',
    collectorInfo: null,
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
      this.setData({ collectorId: options.id })
      this.loadCollectorDetail()
      this.loadCollectorOrders()
    }
  },

  onPullDownRefresh() {
    this.setData({
      'pagination.page': 1,
      orderList: [],
      hasMore: true
    })
    this.loadCollectorDetail()
    this.loadCollectorOrders()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadCollectorOrders()
    }
  },

  // 加载回收员详情
  async loadCollectorDetail() {
    try {
      const res = await wx.request({
        url: `${getApp().globalData.baseUrl}/admin/collectors/${this.data.collectorId}`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('adminToken')}`
        }
      })

      if (res.data.success) {
        this.setData({
          collectorInfo: res.data.data
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

  // 加载回收员订单列表
  async loadCollectorOrders() {
    if (this.data.loading) return

    this.setData({ loading: true })

    try {
      const res = await wx.request({
        url: `${getApp().globalData.baseUrl}/admin/collectors/${this.data.collectorId}/orders`,
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
  },

  // 审核回收员
  async reviewCollector(e) {
    const { action } = e.currentTarget.dataset
    const { collectorId } = this.data

    try {
      const res = await wx.request({
        url: `${getApp().globalData.baseUrl}/admin/collectors/${collectorId}/review`,
        method: 'POST',
        data: { action },
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('adminToken')}`
        }
      })

      if (res.data.success) {
        wx.showToast({
          title: action === 'approve' ? '审核通过' : '审核拒绝',
          icon: 'success'
        })
        this.loadCollectorDetail()
      } else {
        wx.showToast({
          title: res.data.message || '操作失败',
          icon: 'none'
        })
      }
    } catch (error) {
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none'
      })
    }
  },

  // 启用/禁用回收员
  async toggleCollectorStatus() {
    const { collectorId, collectorInfo } = this.data
    const newStatus = collectorInfo.status === 'active' ? 'disabled' : 'active'

    try {
      const res = await wx.request({
        url: `${getApp().globalData.baseUrl}/admin/collectors/${collectorId}/status`,
        method: 'PUT',
        data: { status: newStatus },
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('adminToken')}`
        }
      })

      if (res.data.success) {
        wx.showToast({
          title: newStatus === 'active' ? '已启用' : '已禁用',
          icon: 'success'
        })
        this.loadCollectorDetail()
      } else {
        wx.showToast({
          title: res.data.message || '操作失败',
          icon: 'none'
        })
      }
    } catch (error) {
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none'
      })
    }
  }
}) 