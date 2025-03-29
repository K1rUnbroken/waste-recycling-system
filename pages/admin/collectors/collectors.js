Page({
  data: {
    collectors: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    searchValue: ''
  },

  onLoad() {
    this.loadCollectors()
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      collectors: [],
      hasMore: true
    })
    this.loadCollectors()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadCollectors()
    }
  },

  // 搜索回收人员
  onSearch(e) {
    this.setData({
      searchValue: e.detail.value,
      page: 1,
      collectors: [],
      hasMore: true
    })
    this.loadCollectors()
  },

  // 加载回收人员列表
  loadCollectors() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    wx.request({
      url: `${getApp().globalData.baseUrl}/admin/collectors`,
      method: 'GET',
      data: {
        page: this.data.page,
        pageSize: this.data.pageSize,
        keyword: this.data.searchValue
      },
      success: (res) => {
        if (res.data.success) {
          const newCollectors = res.data.data.collectors
          this.setData({
            collectors: [...this.data.collectors, ...newCollectors],
            page: this.data.page + 1,
            hasMore: newCollectors.length === this.data.pageSize
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

  // 审核回收人员
  reviewCollector(e) {
    const { id, status } = e.currentTarget.dataset
    const action = status === 1 ? '通过' : '拒绝'
    
    wx.showModal({
      title: '提示',
      content: `确定要${action}该回收人员的申请吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${getApp().globalData.baseUrl}/admin/collectors/${id}/review`,
            method: 'POST',
            data: {
              status: status
            },
            success: (res) => {
              if (res.data.success) {
                wx.showToast({
                  title: `${action}成功`,
                  icon: 'success'
                })
                // 刷新列表
                this.setData({
                  page: 1,
                  collectors: [],
                  hasMore: true
                })
                this.loadCollectors()
              } else {
                wx.showToast({
                  title: res.data.message || `${action}失败`,
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

  // 禁用/启用回收人员
  toggleCollectorStatus(e) {
    const { id, status } = e.currentTarget.dataset
    const action = status === 1 ? '禁用' : '启用'
    
    wx.showModal({
      title: '提示',
      content: `确定要${action}该回收人员吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${getApp().globalData.baseUrl}/admin/collectors/${id}/status`,
            method: 'POST',
            data: {
              status: status === 1 ? 0 : 1
            },
            success: (res) => {
              if (res.data.success) {
                wx.showToast({
                  title: `${action}成功`,
                  icon: 'success'
                })
                // 刷新列表
                this.setData({
                  page: 1,
                  collectors: [],
                  hasMore: true
                })
                this.loadCollectors()
              } else {
                wx.showToast({
                  title: res.data.message || `${action}失败`,
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

  // 查看回收人员详情
  viewCollectorDetail(e) {
    const collectorId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/collectorDetail/collectorDetail?id=${collectorId}`
    })
  }
}) 