// pages/moments/index.js
const WXAPI = require('apifm-wxapi');
const AUTH = require('../../utils/auth')
const { formatTime } = require('../../utils/common.util');

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wxlogin: true,
    tabKey: 2,
    tabBottom: app.globalData.tabBottom,
    inputValue: '', //发送的评论内容
    keyboardHeight: 0, // 键盘高度
    toUserId: undefined,
    toUserName: undefined,
    userInfo: {},
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
        item.commentList = null; // 收起评论列表时清除数据
      }
    })
    t.setData({
      momentsList,
      topicId: id,
      toUserId: undefined,
      toUserName: undefined,
    })
    if(t.data.messageOpen) {
      t.getMessages(1);
    }
  },
  // 获取留言列表
  getMessages: function(page = 1) {
    let { momentsList, topicId } = this.data;
    WXAPI.getMessages({topic_type: 0, topic_id: topicId, pageSize: 10, page: page})
      .then(res => {
        if(res.retcode == 0) {
          momentsList.map(item => {
            if(item.id == topicId) {
              item.commentList = item.commentList ? item.commentList : [];
              if(item.commentList.length) {
                if(res.data.length) {
                  let ids = [];
                  item.commentList.map(comment => {
                    ids.push(comment.id);
                  })
                  res.data.map(comment => {
                    if(ids.indexOf(comment.id) == -1) {
                      item.commentList.push(comment);
                    }
                  })
                } else {
                  item.nomore = true;
                }
              } else {
                item.commentList = res.data;
              }
              item.commentPage = page;
            }
          })
          this.setData({
            momentsList,
          })
        }
      })
  },

  // 获取更多评论
  getMoreComments: function(e) {
    this.setData({
      topicId: e.currentTarget.dataset.topicid,
    })
    this.getMessages(e.currentTarget.dataset.page + 1);
  },
  // 发送评论
  onSendMessage: function(e) {
    let t = this;
    let { topicId, inputValue, toUserName, toUserId, momentsList, userInfo } = t.data;
    let data = {};
    if(toUserId) {
      data.to = toUserId;
    }

    WXAPI.verifyMessage({content: inputValue})
      .then(res => {
        if(res.retcode == 0) {
          WXAPI.sendMessage({topic_type: 0, topic_id: topicId, content: inputValue, ...data})
            .then(res1 => {
              if(res1.retcode == 0) {
                momentsList.map(item => {
                  if(item.id == topicId) {
                    item.comments += 1;
                    item.commentList = item.commentList ? item.commentList : [];
                    let data = {
                      id: res1.id,
                      content: inputValue,
                      fromNick: userInfo.nickName,
                      fromUid: userInfo.id,
                      toNick: toUserName,
                      toUid: toUserId,
                    }

                    item.commentList.push(data)
                  }
                })
                t.setData({
                  momentsList,
                  inputValue: ''
                })
                t.bindblur();
              }
            })
        } else {
          wx.showModal({
            title: '发送失败',
            content: res.msg,
            showCancel: false
          })
          this.setData({
            messageOpen: true,
          })
        }
      })
  },
  // 回复评论
  onReplyComment: function(e) {
    this.setData({
      messageOpen: true,
      topicId: e.currentTarget.dataset.topicid,
      toUserName: e.currentTarget.dataset.fromnick,
      toUserId: e.currentTarget.dataset.fromuid,
    })
  },
  onViewOtherInfo: function(e) {
    wx.navigateTo({
      url: "/subpackages/other-info/index?uid=" + e.currentTarget.dataset.uid,
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
    let { userInfo } = this.data;
    // 发布评论判断是否登录
    AUTH.checkHasLogined().then(isLogined => {
      this.setData({
        wxlogin: isLogined
      })
      if(isLogined && !userInfo.id) {
        this.getUserApiInfo();
      }
    })
     this.setData({
      focus: true,
      adjust: true,
      keyboardHeight: e.detail.height,
    })
  },

  bindblur(e) {
    let t = this;
    t.setData({
      focus: false,
      keyboardHeight: 0,
      messageOpen: false,
    })
    // 键盘消失
    wx.hideKeyboard();
  },

  // 获取用户信息
  getUserApiInfo: function () {
    let t = this;
    WXAPI.userDetail(wx.getStorageSync('token')).then(function (res) {
      if (res.retcode == 0) {
        t.setData({
          userInfo: res.data,
        })
      }
    })
  },
  goLogin() {
    this.setData({
      wxlogin: false
    })
  },
  processLogin(e) {
    if (!e.detail.userInfo) {
      wx.showToast({
        title: '已取消',
        icon: 'none',
      })
      return;
    }
    AUTH.login(this);
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