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
    contact: '',
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
    console.log('输入重量:', e.detail.value)
    this.setData({
      weight: e.detail.value
    })
  },

  // 输入地址
  onAddressInput(e) {
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

  // 输入联系方式
  onContactInput(e) {
    this.setData({
      contact: e.detail.value
    })
  },

  // 提交预约
  submitOrder() {
    // 验证表单数据
    if (!this.data.selectedCategory) {
      wx.showToast({
        title: '请选择回收类别',
        icon: 'none'
      })
      return
    }
    
    if (!this.data.weight) {
      wx.showToast({
        title: '请输入预估重量',
        icon: 'none'
      })
      return
    }
    
    if (!this.data.address) {
      wx.showToast({
        title: '请输入上门地址',
        icon: 'none'
      })
      return
    }
    
    if (!this.data.contact) {
      wx.showToast({
        title: '请输入联系方式',
        icon: 'none'
      })
      return
    }
    
    // 显示加载提示
    wx.showLoading({
      title: '提交中...',
      mask: true
    })
    
    // 获取当前登录用户的token
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.hideLoading()
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
    
    const app = getApp()
    // 准备要提交的数据
    const orderData = {
      categoryId: this.data.selectedCategory.id,
      categoryName: this.data.selectedCategory.name,
      weight: parseFloat(this.data.weight),
      address: this.data.address,
      contact: this.data.contact,
      appointmentDate: this.data.appointmentDate,
      appointmentTime: this.data.appointmentTime,
      remark: this.data.remark || ''
    }
    
    console.log('准备提交的订单数据:', orderData)
    
    // 发送请求到服务器
    console.log('向服务器发送请求，URL:', `${app.globalData.baseUrl}/orders`)
    console.log('发送请求头:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    })
    
    wx.request({
      url: `${app.globalData.baseUrl}/orders`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: orderData,
      success: (res) => {
        wx.hideLoading()
        console.log('订单提交响应:', res)
        console.log('响应数据:', res.data)
        
        if (res.data.success) {
          wx.showToast({
            title: '预约成功',
            icon: 'success'
          })
          
          // 重置表单
          this.setData({
            selectedCategory: null,
            weight: '',
            remark: ''
          })
          
          // 延迟跳转到订单列表页
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/user/order/order'
            })
          }, 1500)
        } else {
          wx.showToast({
            title: res.data.message || '提交失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('订单提交失败:', err)
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      }
    })
  }
}) 