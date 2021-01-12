const WXAPI = require('apifm-wxapi');
const AUTH = require('../../utils/auth');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList: [
      {type: 1, label: '当前借款'},
      {type: 0, label: '历史借款'},
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
    }, {
      name: 'date',
      rules: {required: true, message: '请选择最迟还款日期'}
    }]
  },
  currentPage: 1,
  onTabClick(e) {
    this.currentPage = 1;
    this.setData({
      tabkey: e.currentTarget.dataset.type,
      dataList: [],
      hasMore: true,
    }, () => {
      this.getDataList();
    })
  },
  getDataList() {
    let t = this;
    wx.showLoading({
      title: '加载中',
    });
    WXAPI.myBorrowingList({page: t.currentPage, pageSize: 5, status: t.data.tabkey}).then(res => {
      if(res.retcode == 0) {
        let dataList = [], hasMore = true;
        if(t.currentPage == 1) {
          dataList = res.data;
        } else {
          dataList = t.data.dataList.concat(res.data);
          if(!res.data.length) {
            hasMore = false;
          }
        }
        t.setData({
          dataList,
          hasMore,
        })
      }
      wx.hideLoading();
    })
  },
  onModalShow(e) {
    let type = e.currentTarget.dataset.dialogtype;
    let id = e.currentTarget.dataset.id;
    this.setData({
      [type]: true,
    })
    if(id) {
      this.setData({
        id,
      })
    }
  },
  onClose() {
    this.setData({
      dialogShow: false,
      formData: {},
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
        let { formData } = this.data;
        let data = {
          total: formData.total,
          etime: `${formData.date} 23:59:59`,
        }
        WXAPI.onBorrowing({...data}).then(res => {
          if(res.retcode == 0) {
            wx.showToast({
              title: '借款成功'
            })
            this.setData({
              dialogShow: false,
              formData: {},
              hasMore: true,
            })
            this.currentPage = 1;
            this.getDataList();
          } else {
            this.setData({
              error: res.msg
            })
          }
        })
      }
    })
  },
  onInputChange(e) {
    this.setData({
      [`formData.total`]: e.detail.value
    })
  },
  onDateChange(e) {
    this.setData({
      [`formData.date`]: e.detail.value,
    })
  },
  // 还款
  onBorrowingClose(e) {
    if(e.detail.item.text == '确定') {
      WXAPI.onBorrowingClose({id: this.data.id}).then(res => {
        if(res.retcode == 0) {
          wx.showToast({
            title: '还款成功'
          })
          this.currentPage = 1;
          this.getDataList();
          this.setData({
            hasMore: true,
          })
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
    let currentDate = new Date();
    this.setData({
      startDate: `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDay()}`
    })
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
      this.getDataList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})