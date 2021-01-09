// pages/my-borrow-money/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList: [
      {type: 0, label: '当前借款'},
      {type: 1, label: '历史借款'},
    ],
    tabkey: 0,
    dataList: [
      {num: 100, time: '2021-1-3'},
      {num: 80, time: '2020-12-30'},
      {num: 10, time: '2020-12-28'},
    ]
  },
  onTabClick(e) {
    console.log(e, 1111111);
    this.setData({
      tabkey: e.currentTarget.dataset.type,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})