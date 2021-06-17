// subpackages/other-info/index.js
const WXAPI = require('apifm-wxapi');
const { formatTime } = require('../../utils/common.util');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    followed: false,
    dialogShow: false,
    formData: {},
  },
  currentPage: 1,
  getUserInfo: function(id) {
    WXAPI.getOtherUserInfo({userid: id})
      .then(res => {
        if(res.retcode == 0) {
          res.data.genderName = {0: '未知', 1: '男', 2: '女'}[res.data.gender];
          this.setData({
            userInfo: res.data,
            followed: res.followed
          })
        }
      })
  },
  // 获取手记
  getMoments: function() {
    let t = this;
    let { uid } = t.data;
    wx.showLoading({
      title: '加载中',
    });
    WXAPI.getMoments({page: t.currentPage, pageSize: 5, type: 9, target_userid: uid})
      .then(res => {
        if(res.retcode == 0) {
          let momentsList = [], hasMore = true;
          res.data.map(item => {
            let date = new Date(item.createtime);
            item.createtimeStr = formatTime(date);
          })
          if(t.currentPage == 1) {
            momentsList = res.data;
            if(res.data.length < 5) {
              hasMore = false;
            }
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
  onEditRemark: function() {
    this.setData({
      dialogShow: true
    })
  },
  onInputChange(e) {
    this.setData({
      [`formData.commentname`]: e.detail.value
    })
  },
  isSubmitClick: false,
  onSubmit() {
    // 节流
    if(this.isSubmitClick) {
      setTimeout(() => {
        this.isSubmitClick = false;
      }, 2000)
      return;
    } else {
      this.isSubmitClick = true;
    }
    this.selectComponent('#form').validate((valid, errors) => {
      if (!valid) {
        const firstError = Object.keys(errors)
        if (firstError.length) {
          this.setData({
            error: errors[firstError[0]].message
          })
        }
      } else {
        let { uid, userInfo, formData } = this.data;
        WXAPI.onEditRemark({...formData, target_userid: uid}).then(res => {
          if(res.retcode == 0) {
            wx.showToast({
              title: '修改成功'
            })
            userInfo.c_name = formData.commentname;
            this.setData({
              dialogShow: false,
              formData: {},
              userInfo,
            })
          } else {
            wx.showToast({
              title: res.msg
            })
          }
        })
      }
    })
  },
  onClose() {
    this.setData({
      dialogShow: false,
      formData: {},
    })
  },
  // 关注取关某人
  onMomentFocus: function() {
    let { userInfo, uid, followed } = this.data;
    WXAPI.onMomentFocus({tuserid: uid, type: followed ? 'unfocus' : 'focus'})
      .then(res => {
        if(res.retcode == 0) {
          wx.showToast({
            title: '成功',
            icon: 'none',
            duration: 2000,
          })
          followed = !followed;
          if(followed) {
            userInfo.followers += 1;
          } else {
            userInfo.followers -= 1;
          }
          this.setData({
            userInfo,
            followed,
          })
        }
      })
  },
  onTalk: function() {
    let { uid, userInfo } = this.data;
    wx.navigateTo({
      url: '/subpackages/message-detail/index?conversationID=C2C' + uid + '&avatar=' + userInfo.avatar  + '&name=' + userInfo.nick_name,
    })
  },
  // 图片放大查看
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
    this.setData({
      uid: options.uid,
    }, () => {
      this.getMoments();
    })
    this.getUserInfo(options.uid);
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