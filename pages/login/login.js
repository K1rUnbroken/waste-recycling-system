// pages/login/login.js
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        loginType: 'user', // 默认用户登录
        account: '', // 账号（手机号或用户名）
        password: '',
        regPhone: '',
        name: '',
        regPassword: '',
        confirmPassword: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 根据登录类型设置默认测试账号
        this.setDefaultAccount()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    // 切换登录类型
    switchType(e) {
        const type = e.currentTarget.dataset.type
        this.setData({ loginType: type })
        this.setDefaultAccount()
    },

    // 设置默认测试账号
    setDefaultAccount() {
        let account = ''
        let password = ''
        switch (this.data.loginType) {
            case 'user':
                account = '13048300784'
                password = 'kuangyiran666'
                break
            case 'collector':
                account = '13800138000'
                password = '123456'
                break
            case 'admin':
                account = 'admin'
                password = 'admin123'
                break
        }
        this.setData({ account, password })
    },

    // 输入账号
    inputAccount(e) {
        this.setData({
            account: e.detail.value
        })
    },

    // 输入密码
    inputPassword(e) {
        this.setData({
            password: e.detail.value
        })
    },

    // 登录
    login() {
        const { loginType, account, password } = this.data

        if (!account) {
            wx.showToast({
                title: loginType === 'admin' ? '请输入用户名' : '请输入手机号',
                icon: 'none'
            })
            return
        }

        if (!password) {
            wx.showToast({
                title: '请输入密码',
                icon: 'none'
            })
            return
        }

        // 根据登录类型选择不同的接口
        let url = ''
        let data = {}
        switch (loginType) {
            case 'user':
                url = `${app.globalData.baseUrl}/user/login`
                data = { phone: account, password }
                break
            case 'collector':
                url = `${app.globalData.baseUrl}/collector/login`
                data = { phone: account, password }
                break
            case 'admin':
                url = `${app.globalData.baseUrl}/admin/login`
                data = { username: account, password }
                break
        }

        console.log('准备发送登录请求:', { url, type: loginType, data })

        wx.request({
            url,
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            data,
            success: (res) => {
                console.log('登录响应:', res.data)
                if (res.data.success) {
                    // 保存登录信息
                    wx.setStorageSync('token', res.data.token)
                    wx.setStorageSync('userType', loginType)
                    
                    switch (loginType) {
                        case 'user':
                            wx.setStorageSync('userInfo', res.data.userInfo)
                            break
                        case 'collector':
                            wx.setStorageSync('userInfo', res.data.collectorInfo)
                            break
                        case 'admin':
                            wx.setStorageSync('userInfo', res.data.adminInfo)
                            break
                    }

                    wx.showToast({
                        title: '登录成功',
                        icon: 'success'
                    })

                    // 根据角色跳转到不同页面
                    setTimeout(() => {
                        switch (loginType) {
                            case 'user':
                                wx.switchTab({
                                    url: '/pages/index/index'
                                })
                                break
                            case 'collector':
                                wx.redirectTo({
                                    url: '/pages/collector/index/index'
                                })
                                break
                            case 'admin':
                                wx.redirectTo({
                                    url: '/pages/admin/index/index'
                                })
                                break
                        }
                    }, 1500)
                } else {
                    wx.showToast({
                        title: res.data.message || '登录失败',
                        icon: 'none'
                    })
                }
            },
            fail: (err) => {
                console.error('请求失败:', err)
                wx.showToast({
                    title: '网络错误，请重试',
                    icon: 'none'
                })
            }
        })
    },

    // 跳转到注册页面
    goToRegister() {
        wx.navigateTo({
            url: '/pages/register/register'
        })
    },

    // 切换标签页
    switchTab(e) {
        const tab = e.currentTarget.dataset.tab
        this.setData({ activeTab: tab })
    },

    onRegPhoneInput(e) {
        this.setData({ regPhone: e.detail.value })
    },

    onNameInput(e) {
        this.setData({ name: e.detail.value })
    },

    onRegPasswordInput(e) {
        this.setData({ regPassword: e.detail.value })
    },

    onConfirmPasswordInput(e) {
        this.setData({ confirmPassword: e.detail.value })
    },

    // 处理注册
    handleRegister() {
        const { regPhone, name, regPassword, confirmPassword } = this.data

        if (!regPhone || !name || !regPassword || !confirmPassword) {
            wx.showToast({
                title: '请填写完整信息',
                icon: 'none'
            })
            return
        }

        if (regPassword !== confirmPassword) {
            wx.showToast({
                title: '两次输入的密码不一致',
                icon: 'none'
            })
            return
        }

        wx.showLoading({
            title: '注册中...',
        })

        wx.request({
            url: `${app.globalData.baseUrl}/user/register`,
            method: 'POST',
            data: {
                phone: regPhone,
                name,
                password: regPassword
            },
            success: (res) => {
                wx.hideLoading()
                if (res.data.success) {
                    wx.showToast({
                        title: '注册成功',
                        icon: 'success'
                    })
                    // 切换到登录标签页
                    this.setData({
                        loginType: 'user',
                        account: regPhone,
                        password: ''
                    })
                } else {
                    wx.showToast({
                        title: res.data.message || '注册失败',
                        icon: 'none'
                    })
                }
            },
            fail: (err) => {
                wx.hideLoading()
                console.error('注册请求失败:', err)
                wx.showToast({
                    title: '网络错误，请检查服务器是否启动',
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },

    // 切换到管理员登录
    switchToAdminLogin() {
        wx.navigateTo({
            url: '/pages/admin/login/login'
        })
    }
})