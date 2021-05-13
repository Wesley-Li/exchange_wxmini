const app = getApp()
const CONFIG = require('../../config.js')
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const TOOLS = require('../../utils/tools.js')
const { formatTime } = require('../../utils/common.util');

Page({
	data: {
    wxlogin: true,

    balance: 0.00,
    freeze: 0,
    score: 0,
    growth: 0,
    score_sign_continuous: 0,
    rechargeOpen: false, // 是否开启充值[预存]功能

    momentStats: {},
    count_shop_cart: 0,
    // 用户订单统计数据
    count_id_no_confirm: 0,
    count_id_no_pay: 0,
    count_id_no_reputation: 0,
    count_id_no_transfer: 0,
    count_id_needmetrans: 0,
    count_myproducts: 0,

    momentsList: [], // 手记列表
    hasMore: true,
  },
  currentPage: 1,
	onLoad() {
	},
  onShow() {
    const _this = this
    const order_hx_uids = wx.getStorageSync('order_hx_uids')
    this.setData({
      version: CONFIG.version,
      order_hx_uids
    })
    AUTH.checkHasLogined().then(isLogined => {
      this.setData({
        wxlogin: isLogined
      })
      if (isLogined) {
        _this.getUserApiInfo();
        // _this.getUserAmount();
        _this.getMomentStats();
        _this.orderStatistics();
        _this.getMyMoments();
        _this.getShopCartData();
      }
    })
    // 获取购物车数据，显示TabBarBadge
    // TOOLS.showTabBarBadge();
  },
  aboutUs : function () {
    wx.showModal({
      title: '关于我们',
      content: '蚁库信用交易，让闲置物品得以重生！',
      showCancel:false
    })
  },
  loginOut(){
    AUTH.loginOut()
    wx.reLaunch({
      url: '/pages/my/index'
    })
  },
  getPhoneNumber: function(e) {
    if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
      wx.showModal({
        title: '提示',
        content: e.detail.errMsg,
        showCancel: false
      })
      return;
    }
    WXAPI.bindMobileWxa(wx.getStorageSync('token'), e.detail.encryptedData, e.detail.iv).then(res => {
      if (res.code === 10002) {
        this.setData({
          wxlogin: false
        })
        return
      }
      if (res.code == 0) {
        wx.showToast({
          title: '绑定成功',
          icon: 'success',
          duration: 2000
        })
        this.getUserApiInfo();
      } else {
        wx.showModal({
          title: '提示',
          content: res.msg,
          showCancel: false
        })
      }
    })
  },
  getUserApiInfo: function () {
    var that = this;
    WXAPI.userDetail(wx.getStorageSync('token')).then(function (res) {
      if (res.retcode == 0) {
        let _data = {score:res.data.score}
        res.data.genderName = {0: '未知', 1: '男', 2: '女'}[res.data.gender];
        wx.setStorageSync('user_info', {avatar: res.data.avatar, score: res.data.score});
        _data.apiUserInfoMap = res.data
        if (res.data.mobile) {
          _data.userMobile = res.data.mobile
        }
        if (that.data.order_hx_uids && that.data.order_hx_uids.indexOf(res.data.base.id) != -1) {
          _data.canHX = true // 具有扫码核销的权限
        }
        that.setData({
          haslend: res.haslend,
          hasborrow: res.hasborrow,
          ..._data,
        });
      }
    })
  },
  // getUserAmount: function () {
  //   var that = this;
  //   WXAPI.userAmount(wx.getStorageSync('token')).then(function (res) {
  //     if (res.code == 0) {
  //       that.setData({
  //         balance: res.data.balance.toFixed(2),
  //         freeze: res.data.freeze.toFixed(2),
  //         score: res.data.score,
  //         growth: res.data.growth
  //       });
  //     }
  //   })
  // },
  // 获取朋友圈关注和粉丝数
  getMomentStats: function() {
    WXAPI.getMomentStats({})
      .then(res => {
        if(res.retcode == 0) {
          res.followers = res.followers == null ? '-' : res.followers;
          res.following = res.following == null ? '-' : res.following;
          this.setData({
            momentStats: res,
          })
        }
      })
  },
  handleOrderCount: function (count) {
    return count > 99 ? '99+' : count;
  },
  // 获取市集统计
  orderStatistics: function () {
    WXAPI.orderStatistics(wx.getStorageSync('token')).then(res => {
      if (res.retcode == 0) {
        const {
          count_id_no_confirm,
          count_id_no_pay,
          count_id_no_reputation,
          count_id_no_transfer,
          count_id_needmetrans,
          count_myproducts
        } = res.data || {}
        this.setData({
          count_id_no_confirm: this.handleOrderCount(count_id_no_confirm),
          count_id_no_pay: this.handleOrderCount(count_id_no_pay),
          count_id_no_reputation: this.handleOrderCount(count_id_no_reputation),
          count_id_no_transfer: this.handleOrderCount(count_id_no_transfer),
          count_id_needmetrans: this.handleOrderCount(count_id_needmetrans),
          count_myproducts: this.handleOrderCount(count_myproducts),
        })
      }
    })
  },
  // 获取购物车商品数量
  getShopCartData: function() {
    WXAPI.shippingCarInfo(wx.getStorageSync('token'))
      .then(res => {
        if(res.retcode == 0) {
          this.setData({
            count_shop_cart: res.data.number,
          })
        }
      })
  },
  // 获取我的手记
  getMyMoments: function() {
    let t = this;
    wx.showLoading({
      title: '加载中',
    });
    WXAPI.getMoments({page: t.currentPage, pageSize: 5, type: 9})
      .then(res => {
        if(res.retcode == 0) {
          let momentsList = [], hasMore = true;
          res.data.map(item => {
            let opentypeObj = {0: '全部可见', 1: '仅好友可见', 2: '仅本校可见'};
            item.opentypeName = opentypeObj[item.opentype];
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
  goAsset: function () {
    wx.navigateTo({
      url: "/pages/asset/index"
    })
  },
  goScore: function () {
    wx.navigateTo({
      url: "/pages/score/index"
    })
  },
  goOrder: function (e) {
    wx.navigateTo({
      url: "/pages/order-list/index?type=" + e.currentTarget.dataset.type
    })
  },
  cancelLogin() {
    this.setData({
      wxlogin: true
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
    // AUTH.register(this);
    AUTH.login(this);
  },
  scanOrderCode(){
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        wx.navigateTo({
          url: '/pages/order-details/scan-result?hxNumber=' + res.result,
        })
      },
      fail(err) {
        console.error(err)
        wx.showToast({
          title: err.errMsg,
          icon: 'none'
        })
      }
    })
  },
  clearStorage(){
    wx.clearStorageSync()
    wx.showToast({
      title: '已清除',
      icon: 'success'
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
   onReachBottom: function () {
    if(this.data.hasMore) {
      this.currentPage += 1;
      this.getMyMoments();
    }
  },
})