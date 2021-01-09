const WXAPI = require('apifm-wxapi');
const AUTH = require('../../utils/auth');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabList: [
      {type: 1, label: '当前放款记录'},
      {type: 0, label: '放款收回记录'},
    ],
    tabkey: 1,
    dataList: [],
    dialogShow: false,
    closeDialogShow: false,
    buttons: [{text: '取消'}, {text: '确定'}],
    formData: {},
    rules: [{
      name: 'total',
      rules: {required: true, message: '请输入金额'},
    }]
  },
  currentPage: 1,
  onTabClick(e) {
    this.setData({
      tabkey: e.currentTarget.dataset.type,
    }, () => {
      this.getDataList();
    })
  },
  getDataList() {
    let t = this;
    WXAPI.myLendingList({page: t.currentPage, pageSize: 5, status: t.data.tabkey}).then(res => {
      console.log(res, 44444);
      t.setData({
        dataList: res.data,
      })
    })
  },
  onModalShow(e) {
    console.log(e, 555555);
    let type = e.currentTarget.dataset.dialogtype;
    let lendingId = e.currentTarget.dataset.id;
    this.setData({
      [type]: true,
    })
    if(lendingId) {
      this.setData({
        lendingId,
      })
    }
  },
  onSubmit() {
    this.selectComponent('#form').validate((valid, errors) => {
      if (!valid) {
        const firstError = Object.keys(errors)
        if (firstError.length) {
          this.setData({
            error: errors[firstError[0]].message
          })
        }
      } else {
        WXAPI.onLending({...this.data.formData}).then(res => {
          console.log(res, 44444);
          if(res.retcode == 0) {
            wx.showToast({
              title: '放款成功'
            })
            this.setData({
              dialogShow: false,
              formData: {},
            })
            this.currentPage = 1;
            this.getDataList();
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
    })
  },
  onInputChange(e) {
    this.setData({
      [`formData.total`]: e.detail.value
    })
  },
  // 收回放款
  onLendingClose(e) {
    console.log(e, 666666);
    if(e.detail.item.text == '确定') {
      WXAPI.onCloseLending({id: this.data.lendingId}).then(res => {
        if(res.retcode == 0) {
          wx.showToast({
            title: '已成功收回放款'
          })
          this.currentPage = 1;
          this.getDataList();
        } else {
          wx.showToast({
            title: res.msg
          })
        }
      })
    }
    this.setData({
      closeDialogShow: false,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    AUTH.checkHasLogined().then(isLogined => {
      if (isLogined) {
        this.getDataList();
      } else {
        wx.showModal({
          title: '提示',
          content: '本次操作需要您的登录授权',
          cancelText: '暂不登录',
          confirmText: '前往登录',
          success(res) {
            if (res.confirm) {
              wx.switchTab({
                url: "/pages/my/index"
              })
            } else {
              wx.navigateBack()
            }
          }
        })
      }
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
    console.log('到底部了');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})