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
    // 此处实现提交预约的逻辑
  }
}) 