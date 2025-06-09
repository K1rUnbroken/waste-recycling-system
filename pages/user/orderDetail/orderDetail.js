const app = getApp()

Page({
  data: {
    orderId: null,
    order: null,
    loading: true,
    // 添加评价相关数据
    ratings: null,
    showRatingModal: false,
    ratingValue: 5,
    ratingComment: '',
    // 添加评分文字描述
    ratingTexts: ['很差', '较差', '一般', '较好', '很好']
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
          url: '/pages/login/login'
        })
      }, 1500)
      return
    }

    this.setData({ loading: true })

    wx.request({
      url: `${app.globalData.baseUrl}/orders/${this.data.orderId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.success) {
          const order = res.data.data
          // 格式化时间
          try {
            order.createTime = new Date(order.createTime).toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })
          } catch (e) {
            console.error('日期格式化错误:', e)
            order.createTime = order.createTime || '未知时间'
          }
          
          this.setData({
            order: order
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
          console.log('获取评价信息成功:', res.data.data)
          this.setData({
            ratings: res.data.data
          })
        } else {
          console.error('获取评价信息失败:', res.data.message)
        }
      },
      fail: (err) => {
        console.error('获取评价信息请求失败:', err)
      }
    })
  },

  // 取消订单
  cancelOrder() {
    wx.showModal({
      title: '提示',
      content: '确定要取消此订单吗？',
      success: (res) => {
        if (res.confirm) {
          const token = wx.getStorageSync('token')
          wx.request({
            url: `${app.globalData.baseUrl}/orders/${this.data.orderId}/cancel`,
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
                // 重新加载订单详情
                this.loadOrderDetail()
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
  },

  // 显示评价弹窗
  showRatingModal() {
    console.log('显示评价弹窗')
    this.setData({
      showRatingModal: true,
      ratingValue: 5,
      ratingComment: ''
    })
  },

  // 隐藏评价弹窗
  hideRatingModal() {
    console.log('隐藏评价弹窗')
    this.setData({
      showRatingModal: false
    })
  },

  // 设置评分值
  setRating(e) {
    const value = parseInt(e.currentTarget.dataset.value)
    console.log('设置评分:', value)
    this.setData({
      ratingValue: value
    })
  },

  // 输入评价内容
  inputComment(e) {
    this.setData({
      ratingComment: e.detail.value
    })
  },

  // 提交评价
  submitRating() {
    const { ratingValue, ratingComment } = this.data
    console.log('提交评价:', ratingValue, ratingComment)
    
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      wx.showToast({
        title: '请选择评分',
        icon: 'none'
      })
      return
    }

    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.baseUrl}/orders/${this.data.orderId}/rate-collector`,
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
        console.log('评价提交响应:', res.data)
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
      fail: (err) => {
        console.error('评价提交失败:', err)
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    })
  },

  // 联系回收人员
  contactCollector() {
    if (this.data.order && this.data.order.collectorPhone) {
      wx.makePhoneCall({
        phoneNumber: this.data.order.collectorPhone
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