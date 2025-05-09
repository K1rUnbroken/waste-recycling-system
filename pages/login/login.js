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
        confirmPassword: '',
        isRegister: false, // 是否显示注册表单
        userType: 'user', // 可选值：user, collector, admin
        phone: '',
        username: '',
        showPassword: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log('[登录页] 页面加载, 参数:', options)
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
        console.log('[登录页] 页面显示')
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
        console.log('[登录页] 切换用户类型:', type)
        this.setData({ loginType: type })
        if (type !== 'user') {
            this.setDefaultAccount()
        } else {
            this.setData({ account: '', password: '' })
        }
    },

    // 设置默认测试账号（仅限回收人员和管理人员）
    setDefaultAccount() {
        console.log('[登录页] 设置默认测试账号, 当前类型:', this.data.loginType)
        let account = ''
        let password = ''
        switch (this.data.loginType) {
            case 'collector':
                account = '13800138000'
                password = '123456'
                break
            case 'admin':
                account = 'admin'
                password = 'admin123'
                break
        }
        console.log('[登录页] 默认账号设置为:', account)
        this.setData({ account, password })
    },

    // 切换注册/登录表单
    toggleRegister() {
        console.log('[登录页] 切换注册/登录表单, 当前状态:', this.data.isRegister)
        this.setData({
            isRegister: !this.data.isRegister,
            // 清空所有输入框
            account: '',
            password: '',
            regPhone: '',
            name: '',
            regPassword: '',
            confirmPassword: ''
        })
    },

    // 输入账号
    inputAccount(e) {
        console.log('[登录页] 输入账号:', e.detail.value)
        this.setData({
            account: e.detail.value
        })
    },

    // 输入密码
    inputPassword(e) {
        console.log('[登录页] 输入密码，长度:', e.detail.value.length)
        this.setData({
            password: e.detail.value
        })
    },

    // 登录
    login() {
        const { account, password, loginType } = this.data
        console.log('[登录页] 尝试登录, 类型:', loginType, '账号:', account)
        
        if (!account || !password) {
            console.warn('[登录页] 登录失败: 账号或密码为空')
            wx.showToast({
                title: '请输入账号和密码',
                icon: 'none'
            })
            return
        }

        const url = loginType === 'user' ? '/user/login' : 
                    loginType === 'collector' ? '/collector/login' : 
                    '/admin/login'
        console.log('[登录页] 登录请求URL:', app.globalData.baseUrl + url)

        const data = loginType === 'admin' ? {
            username: account,
            password
        } : {
            phone: account,
            password
        }
        console.log('[登录页] 登录请求数据:', {
            ...data,
            password: '******' // 隐藏密码，仅用于日志
        })

        wx.request({
            url: `${app.globalData.baseUrl}${url}`,
            method: 'POST',
            data,
            success: (res) => {
                console.log('[登录页] 登录响应:', res.data)
                if (res.data.success) {
                    console.log('[登录页] 登录成功, 用户类型:', loginType)
                    // 保存token和用户信息
                    if (loginType === 'user') {
                        wx.setStorageSync('token', res.data.token)
                        wx.setStorageSync('userInfo', res.data.userInfo)
                        wx.setStorageSync('userType', 'user')
                        console.log('[登录页] 保存用户token和信息:', res.data.userInfo)
                    } else if (loginType === 'collector') {
                        wx.setStorageSync('token', res.data.token)
                        wx.setStorageSync('userInfo', res.data.collectorInfo)
                        wx.setStorageSync('userType', 'collector')
                        console.log('[登录页] 保存回收员token和信息:', res.data.collectorInfo)
                        console.log('[登录页] userType已设置为:', wx.getStorageSync('userType'))
                    } else {
                        wx.setStorageSync('adminToken', res.data.token)
                        wx.setStorageSync('adminInfo', res.data.adminInfo)
                        wx.setStorageSync('userType', 'admin')
                        console.log('[登录页] 保存管理员token和信息:', res.data.adminInfo)
                    }

                    wx.showToast({
                        title: '登录成功',
                        icon: 'success',
                        duration: 1500,
                        success: () => {
                            setTimeout(() => {
                                // 根据用户类型跳转到不同页面
                                let targetUrl = '';
                                if (loginType === 'user') {
                                    targetUrl = '/pages/index/index';
                                    console.log('[登录页] 用户登录成功，准备跳转到:', targetUrl)
                                    wx.reLaunch({
                                        url: targetUrl,
                                        success: () => console.log('[登录页] 跳转成功:', targetUrl),
                                        fail: (err) => console.error('[登录页] 跳转失败:', targetUrl, err)
                                    })
                                } else if (loginType === 'collector') {
                                    targetUrl = '/pages/collector/index/index';
                                    console.log('[登录页] 回收员登录成功，准备跳转到:', targetUrl)
                                    wx.reLaunch({
                                        url: targetUrl,
                                        success: () => console.log('[登录页] 跳转成功:', targetUrl),
                                        fail: (err) => console.error('[登录页] 跳转失败:', targetUrl, err)
                                    })
                                } else {
                                    targetUrl = '/pages/admin/index/index';
                                    console.log('[登录页] 管理员登录成功，准备跳转到:', targetUrl)
                                    wx.reLaunch({
                                        url: targetUrl,
                                        success: () => console.log('[登录页] 跳转成功:', targetUrl),
                                        fail: (err) => console.error('[登录页] 跳转失败:', targetUrl, err)
                                    })
                                }
                            }, 1500)
                        }
                    })
                } else {
                    console.warn('[登录页] 登录失败:', res.data.message)
                    wx.showToast({
                        title: res.data.message || '登录失败',
                        icon: 'none'
                    })
                }
            },
            fail: (err) => {
                console.error('[登录页] 登录请求失败:', err)
                wx.showToast({
                    title: '登录失败，请稍后重试',
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

    // 输入注册手机号
    onRegPhoneInput(e) {
        this.setData({
            regPhone: e.detail.value
        })
    },

    // 输入姓名
    onNameInput(e) {
        this.setData({
            name: e.detail.value
        })
    },

    // 输入注册密码
    onRegPasswordInput(e) {
        this.setData({
            regPassword: e.detail.value
        })
    },

    // 输入确认密码
    onConfirmPasswordInput(e) {
        this.setData({
            confirmPassword: e.detail.value
        })
    },

    // 处理注册
    handleRegister() {
        const { regPhone, name, regPassword, confirmPassword } = this.data
        console.log('[登录页] 尝试注册, 手机号:', regPhone, '姓名:', name)

        if (!regPhone || !name || !regPassword || !confirmPassword) {
            console.warn('[登录页] 注册失败: 信息不完整')
            wx.showToast({
                title: '请填写完整信息',
                icon: 'none'
            })
            return
        }

        if (regPassword !== confirmPassword) {
            console.warn('[登录页] 注册失败: 两次密码不一致')
            wx.showToast({
                title: '两次输入的密码不一致',
                icon: 'none'
            })
            return
        }

        console.log('[登录页] 发起注册请求')
        wx.showLoading({
            title: '注册中...'
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
                console.log('[登录页] 注册响应:', res.data)
                if (res.data.success) {
                    console.log('[登录页] 注册成功, 用户信息:', res.data.userInfo)
                    wx.showToast({
                        title: '注册成功',
                        icon: 'success'
                    })
                    // 切换到登录表单并填入注册的手机号
                    this.setData({
                        isRegister: false,
                        loginType: 'user',
                        account: regPhone,
                        password: ''
                    })
                } else {
                    console.warn('[登录页] 注册失败:', res.data.message)
                    wx.showToast({
                        title: res.data.message || '注册失败',
                        icon: 'none'
                    })
                }
            },
            fail: (err) => {
                wx.hideLoading()
                console.error('[登录页] 注册请求失败:', err)
                wx.showToast({
                    title: '网络错误，请重试',
                    icon: 'none'
                })
            }
        })
    },

    // 切换到管理员登录
    switchToAdmin() {
        wx.navigateTo({
            url: '/pages/admin/login/login'
        })
    },

    // 切换用户类型
    switchUserType(e) {
        const type = e.currentTarget.dataset.type
        console.log('切换用户类型:', type)
        this.setData({ userType: type })
    },

    // 输入手机号
    inputPhone(e) {
        console.log('输入手机号:', e.detail.value)
        this.setData({
            phone: e.detail.value
        })
    },

    // 输入用户名
    inputUsername(e) {
        console.log('输入用户名:', e.detail.value)
        this.setData({
            username: e.detail.value
        })
    },

    // 切换密码显示
    togglePassword() {
        console.log('切换密码显示状态')
        this.setData({
            showPassword: !this.data.showPassword
        })
    },

    // 切换密码显示状态
    togglePasswordVisible() {
        this.setData({
            showPassword: !this.data.showPassword
        })
    }
})