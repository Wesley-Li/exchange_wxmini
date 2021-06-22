const wxpay = require('../../utils/pay.js')
const app = getApp()
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')

Page({
  data: {
    statusType: [
      // {
      //   status: 9999,
      //   label: ''
      // },
      {
        status: 0,
        label: '待付款'
      },
      {
        status: 1,
        label: '待发货'
      },
      {
        status: 2,
        label: '待收货'
      },
      {
        status: 3,
        label: '待我发货'
      },
      // {
      //   status: 4,
      //   label: '待评价'
      // },
      
    ],
    status: 0,
    hasRefund: false,
    badges: [0, 0, 0, 0],
    shipper: false, //填写发货编号等
    shipperSN: '',
  },
  statusTap: function(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      status
    });
    this.onShow();
  },
  cancelOrderTap: function(e) {
    const that = this;
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function(res) {
        if (res.confirm) {
          WXAPI.orderClose(wx.getStorageSync('token'), orderId).then(function(res) {
            if (res.retcode == 0) {
              that.onShow();
            }
          })
        }
      }
    })
  },
  revOrderTap: function(e){
    const that = this;
    let goodsList = e.currentTarget.dataset.goods
    let odids = [];
    goodsList.map((item)=>{odids.push(item.odid)});
    wx.showModal({
      title: '确认收货',
      content: "",
      confirmText: "确认",
      cancelText: "取消",
      success: function (res) {
        if (res.confirm) {
          WXAPI.orderShipper(wx.getStorageSync('token'), JSON.stringify(odids), null, true).then(function(res) {
            if (res.retcode == 0) {
              that.onShow();
            }else{
              wx.showToast({
                title: res.msg,
                icon: 'none'
              })
              return
            }
          })
        } else {
          console.log('用户点击取消支付')
        }
      }
    });
  },
  shipperOrderTap: function(e) {
    this.setData({
      shipper: true,
      shippinggoods: e.currentTarget.dataset.goods
    })
  },
  cancelShipper: function(){
    this.setData({
      shipper: false,
      shippinggoods: [],
      shipperSN:''
    })
  },
  shipperSNInput: function(e){
    const value = e.detail.value;
    this.setData({
      shipperSN: value
    })
  },
  shipperConfirm: function(e) {
    const that = this;
    let odids = [];
    this.data.shippinggoods.map((item)=>{odids.push(item.odid)});
    console.log(this.data.shipperSN);
    WXAPI.orderShipper(wx.getStorageSync('token'), JSON.stringify(odids), this.data.shipperSN, false).then(function(res) {
      if (res.retcode == 0) {
        that.setData({
          shipper: false,
          shippinggoods: [],
          shipperSN:''
        }, ()=>that.onShow())
        // that.onShow();
      }else{
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
        return
      }
    })
  },
  goToOrderDetail: function(e){
    let oid = e.currentTarget.dataset.oid;
    let odids = encodeURIComponent(JSON.stringify(e.currentTarget.dataset.odids));
    wx.navigateTo({
      url: `/pages/order-details/index?id=${oid}&type=${this.data.status}&odids=${odids}`
    })
  },
  refundApply (e) {
    // 申请售后
    const orderId = e.currentTarget.dataset.id;
    const amount = e.currentTarget.dataset.amount;
    wx.navigateTo({
      url: "/pages/order/refundApply?id=" + orderId + "&amount=" + amount
    })
  },
  toPayTap: function(e) {
    // 防止连续点击--开始
    if (this.data.payButtonClicked) {
      wx.showToast({
        title: '休息一下~',
        icon: 'none'
      })
      return
    }
    this.data.payButtonClicked = true
    setTimeout(() => {
      this.data.payButtonClicked = false
    }, 3000)  // 可自行修改时间间隔（目前是3秒内只能点击一次支付按钮）
    // 防止连续点击--结束
    const that = this;
    const orderId = e.currentTarget.dataset.id;
    let money = e.currentTarget.dataset.money;
    const needScore = e.currentTarget.dataset.score;
    WXAPI.userAmount(wx.getStorageSync('token')).then(function(res) {
      if (res.retcode == 0) {
        // 增加提示框
        if (res.data.score < money) {
          wx.showToast({
            title: '您的信用码不足，无法支付',
            icon: 'none'
          })
          return;
        }
        let _msg = '订单金额: ' + money +' 信用码'
        if (res.data.score > 0) {
          _msg += ',可用信用码为 ' + res.data.score
          // if (money - res.data.balance > 0) {
          //   _msg += ',仍需微信支付 ' + (money - res.data.balance) + ' 元'
          // }          
        }
        if (needScore > 0) {
          _msg += ',并扣除 ' + needScore + ' 积分'
        }
        money = money - res.data.score
        wx.showModal({
          title: '请确认支付',
          content: _msg,
          confirmText: "确认支付",
          cancelText: "取消支付",
          success: function (res) {
            console.log(res);
            if (res.confirm) {
              that._toPayTap(orderId, money)
            } else {
              console.log('用户点击取消支付')
            }
          }
        });
      } else {
        wx.showModal({
          title: '错误',
          content: '无法获取用户资金信息',
          showCancel: false
        })
      }
    })
  },
  _toPayTap: function (orderId, money){
    const _this = this
    if (money <= 0) {
      // 直接使用余额支付
      WXAPI.orderPay(wx.getStorageSync('token'), orderId).then(function (res) {
        if (res.retcode != 0) {
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }else{
          wx.showToast({
            title: "支付成功!",
            icon: 'none'
          })
        }
        _this.onShow();
      })
    } else {
      // wxpay.wxpay('order', money, orderId, "/subpackages/order-list/index");
    }
  },
  onLoad: function(options) {
    if (options && options.type) {
      if (options.type == 99) {
        this.setData({
          hasRefund: true
        });
      } else {
        this.setData({
          status: options.type
        });
      }      
    }
  },
  onReady: function() {
    // 生命周期函数--监听页面初次渲染完成

  },
  getOrderStatistics() {
    WXAPI.orderStatistics(wx.getStorageSync('token')).then(res => {
      if (res.retcode == 0) {
        const badges = this.data.badges;
        badges[0] = res.data.count_id_no_pay
        badges[1] = res.data.count_id_no_transfer
        badges[2] = res.data.count_id_no_confirm
        badges[3] = res.data.count_id_needmetrans
        // badges[5] = res.data.count_id_no_reputation
        this.setData({
          badges
        })
      }
    })
  },
  onShow: function() {
    AUTH.checkHasLogined().then(isLogined => {
      if (isLogined) {
        this.doneShow();
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
  doneShow() {
    // 获取订单列表
    var that = this;
    var postData = {
      token: wx.getStorageSync('token')
    };
    if (this.data.hasRefund) {
      postData.hasRefund = true
    }
    if (!postData.hasRefund) {
      postData.type = that.data.status;
    }
    if (postData.status == 9999) {
      postData.type = '-1'
    }
    this.getOrderStatistics();
    WXAPI.orderList(postData).then(function(res) {
      if (res.retcode == 0) {
        that.setData({
          orderList: res.data,
          // logisticsMap: res.data.logisticsMap,
          // goodsMap: res.data.goodsMap
        });
      } else {
        that.setData({
          orderList: [],
          logisticsMap: {},
          goodsMap: {}
        });
      }
    })
  },
  onHide: function() {
    // 生命周期函数--监听页面隐藏

  },
  onUnload: function() {
    // 生命周期函数--监听页面卸载

  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作

  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数

  }
})