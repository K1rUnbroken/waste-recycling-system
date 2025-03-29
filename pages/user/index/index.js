// pages/user/index/index.js
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 获取本地存储的用户信息
        const userInfo = wx.getStorageSync('userInfo')
        if (userInfo) {
            this.setData({ userInfo })
        }
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
        // 每次显示页面时刷新用户信息
        const userInfo = wx.getStorageSync('userInfo')
        if (userInfo) {
            this.setData({ userInfo })
        }
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

    // 跳转到订单列表
    goToOrders() {
        wx.switchTab({
            url: '/pages/user/order/order'
        })
    },

    // 跳转到回收知识
    goToKnowledge() {
        wx.navigateTo({
            url: '/pages/user/knowledge/knowledge'
        })
    },

    // 联系客服
    contactService() {
        // 这里可以根据需求实现拨打电话或其他客服联系方式
        wx.showModal({
            title: '联系客服',
            content: '客服电话：400-123-4567',
            confirmText: '拨打',
            success(res) {
                if (res.confirm) {
                    wx.makePhoneCall({
                        phoneNumber: '4001234567'
                    })
                }
            }
        })
    },

    // 退出登录
    logout() {
        wx.showModal({
            title: '提示',
            content: '确定要退出登录吗？',
            success(res) {
                if (res.confirm) {
                    // 清除本地存储的登录信息
                    wx.removeStorageSync('token')
                    wx.removeStorageSync('userInfo')
                    wx.removeStorageSync('userType')
                    
                    // 跳转到登录页
                    wx.reLaunch({
                        url: '/pages/login/login'
                    })
                }
            }
        })
    }
})