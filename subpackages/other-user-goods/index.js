// subpackages/other-user-goods/index.js
const WXAPI = require('apifm-wxapi');
const AUTH = require('../../utils/auth')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid: undefined,
    goods: [],
    wxlogin: true,
  },
  currentPage: 1,
  getOtherUserGoods: function() {
    let t = this;
    let { uid } = t.data;
    wx.showLoading({
      title: '加载中',
    })
    WXAPI.getOtherUserGoods({page: t.currentPage, userid: uid})
      .then(res => {
        if(res && res.retcode == 0) {
          let goods = [], hasMore = true;
          if(t.currentPage == 1) {
            goods = res.data;
          } else {
            goods = t.data.goods.concat(res.data);
            if(!res.data.length) {
              hasMore = false;
            }
          }
          t.setData({
            goods: res.data,
            hasMore,
          })
        }
        wx.hideLoading();
      })
  },

  async addShopCar(e) {
    const curGood = this.data.goods.find(ele => {
      return ele.id == e.currentTarget.dataset.id
    })
    if (!curGood) {
      return
    }
    if (curGood.stores <= 0) {
      wx.showToast({
        title: '已售罄~',
        icon: 'none'
      })
      return
    }
    this.addShopCarCheck({
      goodsId: curGood.id,
      buyNumber: 1,
      sku: []
    })
  },
  async addShopCarCheck(options) {
    AUTH.checkHasLogined().then(isLogined => {
      this.setData({
        wxlogin: isLogined
      })
      if (isLogined) {
        // 处理加入购物车的业务逻辑
        this.addShopCarDone(options)
      }
    })
  },
  async addShopCarDone(options){
    const res = await WXAPI.shippingCarInfoAddItem(wx.getStorageSync('token'), options.goodsId, options.buyNumber, options.sku)
    if (res.code == 30002) {
      // 需要选择规格尺寸
      const skuCurGoodsRes = await WXAPI.goodsDetail(options.goodsId)
      if (skuCurGoodsRes.code != 0) {
        wx.showToast({
          title: skuCurGoodsRes.msg,
          icon: 'none'
        })
        return
      }
      return
    }
    if (res.retcode != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }
    wx.showToast({
      title: '加入成功',
      icon: 'success'
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      uid: options.uid,
    }, () => {
      this.getOtherUserGoods();
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