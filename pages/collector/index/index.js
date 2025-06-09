const app = getApp()

Page({
  data: {
    tabs: ['待接单', '待上门', '已完成'],
    activeTab: 0,
    orders: [],
    collectorInfo: null,
    loading: false,
    hasMore: true
  },

  onLoad() {
    // 获取回收人员信息
    const collectorInfo = wx.getStorageSync('userInfo')
    
    // 调用数据修复函数
    const fixedInfo = this.ensureValidInfo(collectorInfo)
    this.setData({ collectorInfo: fixedInfo })
    
    // 加载订单列表
    this.loadOrders()

    // 检查登录状态
    this.checkLoginStatus()
  },

  onShow() {
    // 页面显示时再次检查数据
    const collectorInfo = wx.getStorageSync('userInfo')
    if (collectorInfo) {
      const fixedInfo = this.ensureValidInfo(collectorInfo)
      this.setData({ collectorInfo: fixedInfo })
    }
  },

  onPullDownRefresh() {
    this.loadOrders()
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const userType = wx.getStorageSync('userType')

    if (!token || userType !== 'collector') {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/collector/login/login',
          fail: (err) => {
            // 尝试使用另一种路径格式
            wx.reLaunch({
              url: '../login/login'
            })
          }
        })
      }, 1000)
      return
    }

    wx.request({
      url: `${app.globalData.baseUrl}/collector/check-token`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        console.log('token验证结果:', res.data)
        if (!res.data.success) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('userType')
          wx.redirectTo({
            url: '/pages/collector/login/login'
          })
        } else {
          console.log('验证成功后获取的回收员信息:', res.data.collectorInfo)
          // 使用数据修复函数确保数据完整
          const fixedInfo = this.ensureValidInfo(res.data.collectorInfo)
          
          // 更新本地存储
          wx.setStorageSync('userInfo', fixedInfo)
          
          // 更新页面数据
          this.setData({
            collectorInfo: fixedInfo
          })
        }
      }
    })
  },

  // 切换标签
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    if (this.data.activeTab === index) return
    
    this.setData({
      activeTab: index,
      orders: [],
      hasMore: true
    })
    this.loadOrders()
  },

  // 加载订单列表
  loadOrders() {
    const token = wx.getStorageSync('token')
    if (!token) return

    this.setData({ loading: true })

    let url = `${app.globalData.baseUrl}/collector/orders`
    if (this.data.activeTab === 0) {
      url = `${app.globalData.baseUrl}/collector/orders/pending`
    }

    wx.request({
      url,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.success) {
          // 检查返回的数据结构
          console.log('订单数据结构:', res.data);
          
          let orders = [];
          if (this.data.activeTab === 0) {
            // 待接单列表直接返回数组
            orders = res.data.data || [];
          } else {
            // 待上门和已完成返回包含orders数组的对象
            orders = res.data.data && res.data.data.orders ? res.data.data.orders : [];
          }
          
          // 处理订单数据
          const processedOrders = orders.map(order => ({
            ...order,
            createTime: order.createTime ? new Date(order.createTime).toLocaleString() : ''
          }));
          
          this.setData({ orders: processedOrders });
        }
      },
      complete: () => {
        this.setData({ loading: false })
        wx.stopPullDownRefresh()
      }
    })
  },

  // 接单
  acceptOrder(e) {
    const orderId = e.currentTarget.dataset.id
    const token = wx.getStorageSync('token')

    wx.showModal({
      title: '提示',
      content: '确定接此订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${app.globalData.baseUrl}/collector/orders/${orderId}/accept`,
            method: 'POST',
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: (res) => {
              if (res.data.success) {
                wx.showToast({
                  title: '接单成功',
                  icon: 'success'
                })
                this.loadOrders()
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

  // 跳转到订单详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/collector/orderDetail/orderDetail?id=${id}`
    })
  },

  // 确保回收员信息的完整性
  ensureValidInfo(info) {
    if (!info) return {}
    
    // 创建一个新对象以避免修改原对象
    const fixedInfo = { ...info }
    
    // 确保totalIncome存在且为数字
    if (typeof fixedInfo.totalIncome !== 'number' || isNaN(fixedInfo.totalIncome)) {
      console.log('总收益无效，设置为默认值0')
      fixedInfo.totalIncome = 0
    }
    
    // 确保orderCount存在且为数字
    if (typeof fixedInfo.orderCount !== 'number' || isNaN(fixedInfo.orderCount)) {
      console.log('总订单数无效，设置为默认值0')
      fixedInfo.orderCount = 0
    }
    
    // 确保rating存在且为数字
    if (typeof fixedInfo.rating !== 'number' || isNaN(fixedInfo.rating)) {
      fixedInfo.rating = 5.0
    }
    
    console.log('修复后的回收员信息:', fixedInfo)
    return fixedInfo
  }
}) 