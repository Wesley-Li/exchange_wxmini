// pages/moments/index.js
const WXAPI = require('apifm-wxapi');
const { formatTime } = require('../../utils/common.util');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabKey: 2,
  },
  currentPage: 1,
  // 点击头部tab
  onTabsClick(e) {
    this.setData({
      tabKey: e.target.dataset.type,
      hasMore: true,
      momentsList: [],
    })
    this.currentPage = 1;
    this.getMoments();
  },

  // 获取朋友圈数据
  getMoments() {
    let t = this;
    let { tabKey } = t.data;
    wx.showLoading({
      title: '加载中',
    });
    WXAPI.getMoments({page: t.currentPage, pageSize: 5, type: tabKey})
      .then(res => {
        if(res.retcode == 0) {
          let momentsList = [], hasMore = true;
          res.data.map(item => {
            let date = new Date(item.createtime);
            item.createtimeStr = formatTime(date);
          })
          if(t.currentPage == 1) {
            momentsList = res.data;
          } else {
            momentsList = t.data.momentsList.concat(res.data);
            if(!res.data.length) {
              hasMore = false;
            }
          }
          t.setData({
            momentsList,
            hasMore,
          })
        }
        wx.hideLoading();
      })
  },

  // 点赞
  onLike: function(e) {
    let id = e.currentTarget.dataset.id;
    let thumbed = e.currentTarget.dataset.thumbed;
    WXAPI.onLike({topic_type: 0, topic_id: id, type: thumbed ? 'delete' : 'add'})
      .then(res => {
        if(res.retcode == 0) {
          let { momentsList } = this.data;
          momentsList.map(item => {
            if(item.id == id) {
              if(thumbed) {
                item.thumbs -= 1;
                item.thumbed = false;
              } else {
                item.thumbs += 1;
                item.thumbed = true;
              }
            }
          })
          this.setData({
            momentsList,
          })
        } else {
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: 2000
          })
        }
      })
  },

  handleGalleryPreview(e) {
    let urls = [];
    e.currentTarget.dataset.urls.map(item => {
      item && urls.push(item);
    })
    wx.previewImage({
      current: e.currentTarget.dataset.index,
      urls: urls
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
    let app = getApp();
    if(app.globalData.momentsKey != undefined) {
      this.setData({
        tabKey: app.globalData.momentsKey
      })
      this.currentPage = 1;
    }
    this.getMoments();
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
    if(this.data.hasMore) {
      this.currentPage += 1;
      this.getMoments();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})