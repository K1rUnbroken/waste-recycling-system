Page({
  data: {
    categories: [
      { id: 1, name: '废纸', icon: 'icon-paper', price: '1.0元/斤' },
      { id: 2, name: '塑料', icon: 'icon-plastic', price: '0.8元/斤' },
      { id: 3, name: '金属', icon: 'icon-metal', price: '2.5元/斤' },
      { id: 4, name: '玻璃', icon: 'icon-glass', price: '0.3元/斤' }
    ],
    selectedCategory: null,
    weight: '',
    address: '',
    appointmentDate: '',
    appointmentTime: '',
    remark: ''
  },

  onLoad() {
    // 设置默认日期为明天
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const year = tomorrow.getFullYear()
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const day = String(tomorrow.getDate()).padStart(2, '0')
    
    this.setData({
      appointmentDate: `${year}-${month}-${day}`,
      appointmentTime: '09:00'
    })
  },

  // 选择回收类别
  selectCategory(e) {
    const index = e.currentTarget.dataset.index
    const category = this.data.categories[index]
    this.setData({
      selectedCategory: category
    })
    console.log('选择类别:', category) // 添加调试日志
  },

  // 输入重量
  inputWeight(e) {
    this.setData({
      weight: e.detail.value
    })
  },

  // 输入地址
  inputAddress(e) {
    this.setData({
      address: e.detail.value
    })
  },

  // 选择日期
  bindDateChange(e) {
    console.log('选择日期:', e.detail.value) // 添加调试日志
    this.setData({
      appointmentDate: e.detail.value
    })
  },

  // 选择时间
  bindTimeChange(e) {
    console.log('选择时间:', e.detail.value) // 添加调试日志
    this.setData({
      appointmentTime: e.detail.value
    })
  },

  // 输入备注
  inputRemark(e) {
    this.setData({
      remark: e.detail.value
    })
  },

  // 提交预约
  submitOrder() {
    const { selectedCategory, weight, address, appointmentDate, appointmentTime } = this.data

    // 验证必填字段
    if (!selectedCategory) {
      wx.showToast({
        title: '请选择回收类别',
        icon: 'none'
      })
      return
    }

    if (!weight) {
      wx.showToast({
        title: '请输入预估重量',
        icon: 'none'
      })
      return
    }

    if (!address) {
      wx.showToast({
        title: '请输入回收地址',
        icon: 'none'
      })
      return
    }

    if (!appointmentDate || !appointmentTime) {
      wx.showToast({
        title: '请选择预约时间',
        icon: 'none'
      })
      return
    }

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

    console.log('提交订单，当前token:', token) // 添加调试日志

    const app = getApp()
    wx.request({
      url: `${app.globalData.baseUrl}/orders`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`, // 确保token格式正确
        'Content-Type': 'application/json'
      },
      data: {
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        weight: parseFloat(weight),
        address: address,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        remark: this.data.remark || ''
      },
      success: (res) => {
        console.log('服务器响应:', res.data) // 添加调试日志
        if (res.data.success) {
          wx.showToast({
            title: '预约成功',
            icon: 'success'
          })
          // 清空表单
          this.setData({
            selectedCategory: null,
            weight: '',
            address: '',
            appointmentDate: this.data.appointmentDate,
            appointmentTime: this.data.appointmentTime,
            remark: ''
          })
          // 跳转到订单列表页
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/user/order/order'
            })
          }, 1500)
        } else {
          wx.showToast({
            title: res.data.message || '预约失败',
            icon: 'none'
          })
          // 如果是token无效，跳转到登录页
          if (res.data.message === 'token无效' || res.data.message === '请先登录') {
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/user/login/login'
              })
            }, 1500)
          }
        }
      },
      fail: (err) => {
        console.error('请求失败:', err) // 添加调试日志
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      }
    })
  }
}) 