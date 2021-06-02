// subpackages/friends/index.js
const WXAPI = require('apifm-wxapi');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabKey: 0,
    hasMore: true,
    inputValue: '',
    momentStats: {},
    friendList: [],
    userItem: {},
    showActionsheet: false,
    groups: [
      { text: '取消关注', type: 'warn', value: 1 },
    ],
  },
  currentPage: 1,
  onTabsClick: function(e) {
    this.currentPage = 1;
    this.setData({
      tabKey: e.target.dataset.type,
      inputValue: '',
    }, () => {
      this.getFriendsList();
    })
  },
  // 获取朋友圈关注和粉丝数
  getMomentStats: function() {
    WXAPI.getMomentStats({})
      .then(res => {
        if(res.retcode == 0) {
          res.followers = res.followers == null ? '0' : res.followers;
          res.following = res.following == null ? '0' : res.following;
          this.setData({
            momentStats: res,
          })
        }
      })
  },
  // 获取关注、粉丝列表
  getFriendsList: function() {
    let t = this;
    wx.showLoading({
      title: '加载中',
    });
    let { tabKey, inputValue } = t.data;
    let data = {};
    inputValue && (data.query = inputValue);
    WXAPI.getFriendsList({type: tabKey, page: t.currentPage, pageSize: 15, ...data})
      .then(res => {
        if(res.retcode == 0) {
          let friendList = [], hasMore = true;
          
          if(t.currentPage == 1) {
            friendList = res.data;
          } else {
            friendList = t.data.friendList.concat(res.data);
            if(!res.data.length) {
              hasMore = false;
            }
          }
          t.setData({
            friendList,
            hasMore,
          })
          wx.hideLoading();
        }
      })
  },
  // 关注取关某人
  onMomentFocus: function() {
    let { userItem } = this.data;
    WXAPI.onMomentFocus({...userItem})
      .then(res => {
        if(res.retcode == 0) {
          this.currentTarget = 1;
          this.getFriendsList();
        }
      })
  },
  // 关注
  onAttention: function(e) {
    if(!e.currentTarget.dataset.both) {
      this.setData({
        userItem: {
          id: e.currentTarget.dataset.id,
          type: 'focus'
        }
      }, () => {
        this.onMomentFocus();
      })
    }
  },
  // 搜索
  onSearch: function() {
    this.currentPage = 1;
    this.getFriendsList();
  },
  bindinput: function(e) {
    this.setData({
      inputValue: e.detail.value,
    })
  },
  onClickUserItem: function(e) {
    console.log(e, 898989)
    let both = e.currentTarget.dataset.both;
    let { tabKey } = this.data;
    this.setData({
      userItem: {
        id: e.currentTarget.dataset.id,
        type: e.currentTarget.dataset.both ? 'unfocus' : 'focus',
      }
    })
    if(tabKey == 0 || tabKey == 1 && !both) {
      this.setData({
        showActionsheet: true,
      })
    }
  },
  btnClick: function(e) {
    let { userItem } = this.data;
    if(e.detail.value == 1) {
      userItem.type = 'unfocus';
      this.setData({
        userItem,
      }, () => {
        this.onMomentFocus();
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      tabKey: options.type,
    })
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
    this.getMomentStats();
    this.getFriendsList(1);
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
      this.getFriendsList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})