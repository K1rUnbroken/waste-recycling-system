const app = getApp()

Page({
  data: {
    orderId: null,
    order: null,
    loading: true,
    showCompleteModal: false,
    actualWeight: '',
    amount: '',
    statusDesc: '',
    ratings: null,
    showRatingModal: false,
    ratingValue: 5,
    ratingComment: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        orderId: parseInt(options.id)
      })
      this.loadOrderDetail()
    }
  },

  // 加载订单详情
  loadOrderDetail() {
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/collector/login/login'
        })
      }, 1500)
      return
    }

    this.setData({ loading: true })

    wx.request({
      url: `${app.globalData.baseUrl}/collector/orders/${this.data.orderId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.success) {
          const order = res.data.data
          // 格式化时间
          order.createTime = new Date(order.createTime).toLocaleString()
          if (order.acceptTime) {
            order.acceptTime = new Date(order.acceptTime).toLocaleString()
          }
          if (order.completeTime) {
            order.completeTime = new Date(order.completeTime).toLocaleString()
          }

          // 设置状态描述
          let statusDesc = ''
          switch (order.status) {
            case '待接单':
              statusDesc = '等待回收人员接单'
              break
            case '待上门':
              statusDesc = '请按预约时间上门服务'
              break
            case '服务中':
              statusDesc = '正在提供上门服务'
              break
            case '已完成':
              statusDesc = '订单已完成'
              break
            case '已取消':
              statusDesc = '订单已取消'
              break
          }

          this.setData({
            order,
            statusDesc
          })
          
          // 如果订单已完成，加载评价信息
          if (order.status === '已完成') {
            this.loadRatings()
          }
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
      }
    })
  },

  // 加载评价信息
  loadRatings() {
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.baseUrl}/orders/${this.data.orderId}/ratings`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            ratings: res.data.data
          })
        }
      }
    })
  },

  // 开始上门服务
  startService() {
    const token = wx.getStorageSync('token')
    wx.showModal({
      title: '确认开始服务',
      content: '确定要开始上门服务吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${app.globalData.baseUrl}/collector/orders/${this.data.orderId}/start`,
            method: 'POST',
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: (res) => {
              if (res.data.success) {
                wx.showToast({
                  title: '已开始服务',
                  icon: 'success'
                })
                this.loadOrderDetail()
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

  // 显示完成订单弹窗
  showCompleteModal() {
    this.setData({
      showCompleteModal: true,
      actualWeight: this.data.order.weight, // 默认填入预估重量
      amount: '' // 金额需要重新计算
    })
  },

  // 隐藏完成订单弹窗
  hideCompleteModal() {
    this.setData({
      showCompleteModal: false,
      actualWeight: '',
      amount: ''
    })
  },

  // 输入实际重量
  inputActualWeight(e) {
    this.setData({
      actualWeight: e.detail.value
    })
  },

  // 输入结算金额
  inputAmount(e) {
    this.setData({
      amount: e.detail.value
    })
  },

  // 完成订单
  completeOrder() {
    const { actualWeight, amount } = this.data
    if (!actualWeight || !amount) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.baseUrl}/collector/orders/${this.data.orderId}/complete`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        actualWeight: parseFloat(actualWeight),
        amount: parseFloat(amount)
      },
      success: (res) => {
        if (res.data.success) {
          this.hideCompleteModal()
          wx.showToast({
            title: '订单已完成',
            icon: 'success'
          })
          this.loadOrderDetail()
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      }
    })
  },

  // 显示评价弹窗
  showRatingModal() {
    this.setData({
      showRatingModal: true,
      ratingValue: 5,
      ratingComment: ''
    })
  },

  // 隐藏评价弹窗
  hideRatingModal() {
    this.setData({
      showRatingModal: false
    })
  },

  // 设置评分值
  setRating(e) {
    const value = e.currentTarget.dataset.value
    this.setData({
      ratingValue: value
    })
  },

  // 输入评价内容
  inputRatingComment(e) {
    this.setData({
      ratingComment: e.detail.value
    })
  },

  // 提交评价
  submitRating() {
    const { ratingValue, ratingComment } = this.data
    
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      wx.showToast({
        title: '请选择评分',
        icon: 'none'
      })
      return
    }

    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.baseUrl}/collector/orders/${this.data.orderId}/rate-user`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        rating: ratingValue,
        comment: ratingComment
      },
      success: (res) => {
        if (res.data.success) {
          this.hideRatingModal()
          wx.showToast({
            title: '评价成功',
            icon: 'success'
          })
          // 重新加载评价信息
          this.loadRatings()
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
  },

  // 联系用户
  contactUser() {
    if (this.data.order && this.data.order.userPhone) {
      wx.makePhoneCall({
        phoneNumber: this.data.order.userPhone
      })
    }
  },

  // 复制订单号
  copyOrderNo() {
    if (this.data.order && this.data.order.orderNo) {
      wx.setClipboardData({
        data: this.data.order.orderNo,
        success: () => {
          wx.showToast({
            title: '复制成功',
            icon: 'success'
          })
        }
      })
    }
  }
}) 