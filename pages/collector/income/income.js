Page({
  data: {
    currentMonth: '',
    totalIncome: 0,
    orderCount: 0,
    incomeList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad() {
    // 设置当前月份
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    this.setData({ currentMonth })
    this.loadIncomeData()
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      incomeList: [],
      hasMore: true
    })
    this.loadIncomeData()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadIncomeData()
    }
  },

  // 选择月份
  bindMonthChange(e) {
    this.setData({
      currentMonth: e.detail.value,
      page: 1,
      incomeList: [],
      hasMore: true
    })
    this.loadIncomeData()
  },

  // 加载收益数据
  loadIncomeData() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    // 获取总收益和订单数
    wx.request({
      url: `${getApp().globalData.baseUrl}/collector/income/summary`,
      method: 'GET',
      data: {
        month: this.data.currentMonth
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            totalIncome: res.data.data.totalIncome,
            orderCount: res.data.data.orderCount
          })
        }
      }
    })

    // 获取收益明细
    wx.request({
      url: `${getApp().globalData.baseUrl}/collector/income/list`,
      method: 'GET',
      data: {
        page: this.data.page,
        pageSize: this.data.pageSize,
        month: this.data.currentMonth
      },
      success: (res) => {
        if (res.data.success) {
          const newList = res.data.data.list
          this.setData({
            incomeList: [...this.data.incomeList, ...newList],
            page: this.data.page + 1,
            hasMore: newList.length === this.data.pageSize
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

  // 提现
  withdraw() {
    if (this.data.totalIncome <= 0) {
      wx.showToast({
        title: '暂无可提现金额',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '提现确认',
      content: `确定要提现 ¥${this.data.totalIncome} 吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${getApp().globalData.baseUrl}/collector/income/withdraw`,
            method: 'POST',
            data: {
              month: this.data.currentMonth
            },
            success: (res) => {
              if (res.data.success) {
                wx.showToast({
                  title: '提现申请已提交',
                  icon: 'success'
                })
                // 刷新数据
                this.setData({
                  page: 1,
                  incomeList: [],
                  hasMore: true
                })
                this.loadIncomeData()
              } else {
                wx.showToast({
                  title: res.data.message || '提现失败',
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
  }
}) 