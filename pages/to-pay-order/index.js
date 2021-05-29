const app = getApp()
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const wxpay = require('../../utils/pay.js')

Page({
  data: {
    wxlogin: true,

    totalScoreToPay: 0,
    goodsList: [],
    isNeedLogistics: 0, // 是否需要物流信息
    allGoodsPrice: 0,
    yunPrice: 0,
    allGoodsAndYunPrice: 0,
    goodsJsonStr: "",
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
    pingtuanOpenId: undefined, //拼团的话记录团号

    hasNoCoupons: true,
    coupons: [],
    youhuijine: 0, //优惠券金额
    curCoupon: null, // 当前选择使用的优惠券
    curCouponShowText: '请选择使用优惠券', // 当前选择使用的优惠券
    peisongType: 'kd', // 配送方式 kd,zq 分别表示快递/到店自取
    remark: '',
    shopIndex: -1,
    pageIsEnd: false,

    buttons: [{text: '取消'}, {text: '确定'}],
    hintInfo: {},
    dialogShow: false,
  },
  onShow(){
    if (this.data.pageIsEnd) {
      return
    }
    AUTH.checkHasLogined().then(isLogined => {
      this.setData({
        wxlogin: isLogined
      })
      if (isLogined) {
        this.doneShow()
      }
    })
  },
  async doneShow() {
    let shopList = [];
    const token = wx.getStorageSync('token')
    //立即购买下单
    if ("buyNow" == this.data.orderType) {
      let buyNowInfoMem = JSON.parse(wx.getStorageSync('buyNowInfo'));
      this.data.kjId = buyNowInfoMem.kjId;
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        shopList = buyNowInfoMem.shopList;
        this.setData({
          goodsList: shopList,
          allGoodsPrice: shopList[0].price
        });
      }
    } else {
      //购物车下单
      const res = await WXAPI.shippingCarInfo(token)
      if (res.retcode == 0) {
        this.setData({
          goodsList: res.data.items,
          peisongType: this.data.peisongType,
          allGoodsPrice: res.data.price
        });
      }
    }
    this.initShippingAddress()
  },

  onLoad(e) {
    let _data = {
      isNeedLogistics: 1
    }
    if (e.orderType) {
      _data.orderType = e.orderType
    }
    if (e.pingtuanOpenId) {
      _data.pingtuanOpenId = e.pingtuanOpenId
    }
    this.setData(_data);
  },

  getDistrictId: function (obj, aaa) {
    if (!obj) {
      return "";
    }
    if (!aaa) {
      return "";
    }
    return aaa;
  },
  remarkChange(e){
    this.data.remark = e.detail.value
  },
  goCreateOrder(){
    const subscribe_ids = wx.getStorageSync('subscribe_ids')
    if (subscribe_ids) {
      wx.requestSubscribeMessage({
        tmplIds: subscribe_ids.split(','),
        success(res) {
          
        },
        fail(e) {
          console.error(e)
        },
        complete: (e) => {
          this.createOrder(true)
        },
      })
    } else {
      this.createOrder(true)
    }    
  },
  createOrder: function (e) {
    var that = this;
    var loginToken = wx.getStorageSync('token')
    var remark = this.data.remark; // 备注信息

    let postData = {
      token: loginToken,
      goodsJsonStr: that.data.goodsJsonStr,
      remark: remark,
      peisongType: that.data.peisongType,
      goodlist: JSON.stringify(this.data.goodsList),
      status: 0,
      total: this.data.allGoodsPrice
    };
    if (that.data.kjId) {
      postData.kjid = that.data.kjId
    }
    if (that.data.pingtuanOpenId) {
      postData.pingtuanOpenId = that.data.pingtuanOpenId
    }
    if (e && that.data.isNeedLogistics > 0 && postData.peisongType == 'kd') {
      if (!that.data.curAddressData) {
        wx.hideLoading();
        wx.showToast({
          title: '请设置收货地址',
          icon: 'none'
        })
        return;
      }
      if (postData.peisongType == 'kd') {
        postData.provincecode = that.data.curAddressData.provincecode;
        postData.province = that.data.curAddressData.provincename;
        postData.citycode = that.data.curAddressData.citycode;
        postData.city = that.data.curAddressData.cityname;
        postData.distinctcode = that.data.curAddressData.distinctcode;
        postData.distinct = that.data.curAddressData.distinctname;
        postData.address = that.data.curAddressData.detail;
        postData.shippingusername = that.data.curAddressData.username;
        postData.shippingmobile = that.data.curAddressData.mobile;
      }      
    }
    if (that.data.curCoupon) {
      postData.couponId = that.data.curCoupon.id;
    }
    if (!e) {
      postData.calculate = "true";
    } else {
      if(postData.peisongType == 'zq' && this.data.shops && this.data.shopIndex == -1) {
        wx.showToast({
          title: '请选择自提门店',
          icon: 'none'
        })
        return;
      }
      if(postData.peisongType == 'zq' && this.data.shops) {
        postData.shopIdZt = this.data.shops[this.data.shopIndex].id
        postData.shopNameZt = this.data.shops[this.data.shopIndex].name
      }
    }

    WXAPI.orderCreate(postData).then(function (res) {
      that.data.pageIsEnd = true
      if (res.retcode != 0) {
        that.data.pageIsEnd = false
        wx.showModal({
          title: '错误',
          content: res.msg,
          showCancel: false
        })
        return;
      }

      if (e && "buyNow" != that.data.orderType) {
        // 清空购物车数据
        WXAPI.shippingCarInfoRemoveAll(loginToken)
      }
      if (!e) {
        let hasNoCoupons = true
        let coupons = null
        if (res.data.couponUserList) {
          hasNoCoupons = false
          res.data.couponUserList.forEach(ele => {
            ele.nameExt = ele.name + ' [满' + ele.moneyHreshold + '元可减' + ele.money + '元]'
          })
          coupons = res.data.couponUserList
        }
        
        that.setData({
          totalScoreToPay: res.data.score,
          isNeedLogistics: res.data.isNeedLogistics,
          allGoodsPrice: res.data.amountTotle,
          allGoodsAndYunPrice: res.data.amountLogistics + res.data.amountTotle,
          yunPrice: res.data.amountLogistics,
          hasNoCoupons,
          coupons
        });
        that.data.pageIsEnd = false
        return;
      }
      that.processAfterCreateOrder(res)
    })
  },
  async processAfterCreateOrder(res) {
    // 直接弹出支付，取消支付的话，去订单列表
    const res1 = await WXAPI.userAmount(wx.getStorageSync('token'))
    if (res1.retcode != 0) {
      wx.showToast({
        title: '无法获取用户资金信息',
        icon: 'none'
      })
      wx.redirectTo({
        url: "/pages/order-list/index"
      });
      this.data.pageIsEnd = false
      return
    }
    const money = res.total * 1 - res1.data.score*1
    if (money <= 0) {
      // 直接用余额支付
      wx.showModal({
        title: '请确认支付',
        content: `您当前可用信用币${res1.data.score}，支付${res.total}？`,
        confirmText: "确认支付",
        cancelText: "暂不付款",
        success: res2 => {
          if (res2.confirm) {
            // 使用余额支付
            WXAPI.orderPay(wx.getStorageSync('token'), res.orderid).then(res3 => {
              if (res3.retcode != 0) {
                wx.showToast({
                  title: res3.msg,
                  icon: 'none'
                })
                return
              }
              wx.redirectTo({
                url: "/pages/order-list/index?type=1"
              })
            })
          } else {
            wx.redirectTo({
              url: "/pages/order-list/index?type=0"
            })
          }
        }
      })      
    } else {
      // wxpay.wxpay('order', money, res.data.id, "/pages/order-list/index");
      let hintInfo = {
        total: res.total,
        surplusMoney: res1.data.score,
      }
      this.setData({
        hintInfo,
        dialogShow: true,
      })
      // wx.showModal({
      //   title: '信用币不足！',
      //   content: `订单金额${res.total}，但您当前仅有信用币${res1.data.score}`,
      //   confirmText: "确认",
      //   cancelText: "取消",
      //   success: res2 => {
      //     if (res2.confirm) {
      //       wx.redirectTo({
      //         url: "/pages/order-list/index"
      //       })
      //     } else {
      //       wx.redirectTo({
      //         url: "/pages/order-list/index"
      //       })
      //     }
      //   }
      // })
    }
  },
  onHandleDialog(e) {
    wx.redirectTo({
      url: "/pages/order-list/index"
    })
  },
  // 去借款
  goBorrowing() {
    wx.redirectTo({
      url: "/pages/my-borrow-money/index"
    })
  },
  async initShippingAddress() {
    const res = await WXAPI.defaultAddress(wx.getStorageSync('token'))
    if (res.retcode == 0) {
      this.setData({
        curAddressData: res.data
      });
    } else {
      this.setData({
        curAddressData: null
      });
    }
    // this.processYunfei(); //暂不考虑运费
  },
  processYunfei() {
    var goodsList = this.data.goodsList
    if (goodsList.length == 0) {
      return
    }
    var goodsJsonStr = "[";
    var isNeedLogistics = 0;
    var allGoodsPrice = 0;


    let inviter_id = 0;
    let inviter_id_storge = wx.getStorageSync('referrer');
    if (inviter_id_storge) {
      inviter_id = inviter_id_storge;
    }
    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i];
      if (carShopBean.logistics || carShopBean.logisticsId) {
        isNeedLogistics = 1;
      }
      allGoodsPrice += carShopBean.price * carShopBean.number;

      var goodsJsonStrTmp = '';
      if (i > 0) {
        goodsJsonStrTmp = ",";
      }
      if (carShopBean.sku && carShopBean.sku.length > 0) {
        let propertyChildIds = ''
        carShopBean.sku.forEach(option => {
          propertyChildIds = propertyChildIds + ',' + option.optionId + ':' + option.optionValueId
        })
        carShopBean.propertyChildIds = propertyChildIds
      }
      goodsJsonStrTmp += '{"goodsId":' + carShopBean.goodsId + ',"number":' + carShopBean.number + ',"propertyChildIds":"' + carShopBean.propertyChildIds + '","logisticsType":0, "inviter_id":' + inviter_id + '}';
      goodsJsonStr += goodsJsonStrTmp;


    }
    goodsJsonStr += "]";
    this.setData({
      isNeedLogistics: isNeedLogistics,
      goodsJsonStr: goodsJsonStr
    });
    this.createOrder();
  },
  addAddress: function () {
    wx.navigateTo({
      url: "/subpackages/address-add/index"
    })
  },
  selectAddress: function () {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  },
  bindChangeCoupon: function (e) {
    const selIndex = e.detail.value;
    this.setData({
      youhuijine: this.data.coupons[selIndex].money,
      curCoupon: this.data.coupons[selIndex],
      curCouponShowText: this.data.coupons[selIndex].nameExt
    });
  },
  radioChange (e) {
    this.setData({
      peisongType: e.detail.value
    })
    this.processYunfei()
    if (e.detail.value == 'zq') {
      this.fetchShops()
    }
  },
  cancelLogin() {
    wx.navigateBack()
  },
  processLogin(e) {
    if (!e.detail.userInfo) {
      wx.showToast({
        title: '已取消',
        icon: 'none',
      })
      return;
    }
    AUTH.register(this);
  },
  async fetchShops(){
    const res = await WXAPI.fetchShops()
    if (res.code == 0) {
      let shopIndex = this.data.shopIndex
      const shopInfo = wx.getStorageSync('shopInfo')
      if (shopInfo) {
        shopIndex = res.data.findIndex(ele => {
          return ele.id == shopInfo.id
        })
      }
      this.setData({
        shops: res.data,
        shopIndex
      })
    }
  },
  shopSelect(e) {
    this.setData({
      shopIndex: e.detail.value
    })
  },
  goMap() {
    const _this = this
    const shop = this.data.shops[this.data.shopIndex]
    const latitude = shop.latitude
    const longitude = shop.longitude
    wx.openLocation({
      latitude,
      longitude,
      scale: 18
    })
  },
  callMobile() {
    const shop = this.data.shops[this.data.shopIndex]
    wx.makePhoneCall({
      phoneNumber: shop.linkPhone,
    })
  },
})