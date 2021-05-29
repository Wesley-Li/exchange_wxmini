// pages/moments/index.js
const WXAPI = require('apifm-wxapi');
const { formatTime } = require('../../utils/common.util');

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabKey: 2,
    tabBottom: app.globalData.tabBottom,
    inputValue: '', //发送的评论内容
    keyboardHeight: 0, // 键盘高度
    toUserId: undefined,
    toUserName: undefined,
  },
  currentPage: 1,
  topicCurrentPage: 1,
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

  // 点击留言
  onMessageClick: function(e) {
    let t = this;
    let { momentsList } = t.data;
    console.log(e, 111111);
    let id = e.currentTarget.dataset.id
    momentsList.map(item => {
      if(item.id == id) {
        t.setData({
          messageOpen: !item.open,
        })
        item.open = !item.open;
      }
    })
    t.setData({
      momentsList,
      topicId: id,
      toUserId: undefined,
      toUserName: undefined,
    })
    
    WXAPI.getMessages({topic_type: 0, topic_id: id, pageSize: 10, page: t.topicCurrentPage})
      .then(res => {
        if(res.retcode == 0) {
          console.log(res, 22222)
        }
      })
  },
  //获取普通文本消息
  bindKeyInput(e) {
    console.log(e, 'input text')
    this.setData({
      inputValue: e.detail.value,
    })
  },
  bindfocus(e) {
    console.log(e, 1222222);
     this.setData({
      focus: true,
      adjust: true,
      keyboardHeight: e.detail.height,
    })
  },

  bindblur(e) {
    console.log(e, 1333333);
    let t = this;
    t.setData({
      focus: false,
      keyboardHeight: 0,
      messageOpen: false,
    })
    // 键盘消失
    wx.hideKeyboard();
  },

  // 发送评论
  onSendMessage: function(e) {
    let t = this;
    let { topicId, inputValue, toUserId } = t.data;
    let data = {};
    if(toUserId) {
      data.to = toUserId;
    }
    WXAPI.sendMessage({topic_type: 0, topic_id: topicId, content: inputValue, ...data})
      .then(res => {
        if(res.retcode == 0) {
          console.log(res, 999999)
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