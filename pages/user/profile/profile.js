// pages/user/profile/profile.js
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
        this.setData({
            userInfo: app.globalData.userInfo
        })
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

    goToOrders() {
        wx.navigateTo({
            url: '/pages/user/order/order'
        })
    },

    goToKnowledge() {
        wx.navigateTo({
            url: '/pages/user/knowledge/knowledge'
        })
    },

    contactUs() {
        wx.showModal({
            title: '联系我们',
            content: '客服电话：10086\n工作时间：周一至周日 8:00-18:00',
            showCancel: false
        })
    },

    handleLogout() {
        wx.showModal({
            title: '提示',
            content: '确定要退出登录吗？',
            success: (res) => {
                if (res.confirm) {
                    // 清除登录状态
                    app.clearLoginStatus()
                    // 跳转到登录页
                    wx.redirectTo({
                        url: '/pages/login/login'
                    })
                }
            }
        })
    }
})