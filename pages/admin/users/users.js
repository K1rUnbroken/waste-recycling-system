Page({
  data: {
    tabs: ['全部', '正常', '已禁用'],
    activeTab: 0,
    users: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    searchValue: ''
  },

  onLoad() {
    this.loadUsers()
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      users: [],
      hasMore: true
    })
    this.loadUsers()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadUsers()
    }
  },

  // 切换标签
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    if (this.data.activeTab === index) return
    
    this.setData({
      activeTab: index,
      page: 1,
      users: [],
      hasMore: true
    })
    this.loadUsers()
  },

  // 搜索用户
  onSearch(e) {
    this.setData({
      searchValue: e.detail.value,
      page: 1,
      users: [],
      hasMore: true
    })
    this.loadUsers()
  },

  // 加载用户列表
  loadUsers() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    const statusMap = {
      0: '', // 全部
      1: 1, // 正常
      2: 0 // 已禁用
    }

    wx.request({
      url: `${getApp().globalData.baseUrl}/admin/users`,
      method: 'GET',
      data: {
        page: this.data.page,
        pageSize: this.data.pageSize,
        status: statusMap[this.data.activeTab],
        keyword: this.data.searchValue
      },
      success: (res) => {
        if (res.data.success) {
          const newUsers = res.data.data.users
          this.setData({
            users: [...this.data.users, ...newUsers],
            page: this.data.page + 1,
            hasMore: newUsers.length === this.data.pageSize
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

  // 查看用户详情
  viewUserDetail(e) {
    const userId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/userDetail/userDetail?id=${userId}`
    })
  },

  // 禁用/启用用户
  toggleUserStatus(e) {
    const { id, status } = e.currentTarget.dataset
    const action = status === 1 ? '禁用' : '启用'
    
    wx.showModal({
      title: '确认操作',
      content: `确定要${action}该用户吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${getApp().globalData.baseUrl}/admin/users/${id}/status`,
            method: 'PUT',
            data: {
              status: status === 1 ? 0 : 1
            },
            success: (res) => {
              if (res.data.success) {
                wx.showToast({
                  title: `${action}成功`,
                  icon: 'success'
                })
                // 更新列表
                const users = this.data.users.map(user => {
                  if (user.id === id) {
                    return {
                      ...user,
                      status: status === 1 ? 0 : 1,
                      statusText: status === 1 ? '已禁用' : '正常'
                    }
                  }
                  return user
                })
                this.setData({ users })
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
  }
}) 