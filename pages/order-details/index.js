const app = getApp();
const CONFIG = require('../../config.js');
const WXAPI = require('apifm-wxapi');
import wxbarcode from 'wxbarcode';
const COMMON = require('../../utils/common.js');

Page({
    data:{
      orderId:0,
      type: -2, //从列表页传来的，用户所见的订单状态,
      typeStr: '',
      odids: [], //列表页传来的， 订单详情表的id
      goodsList:[]
    },
    onLoad:function(e){
      // e.id = 478785
      const accountInfo = wx.getAccountInfoSync()
      var orderId = e.id;
      // this.data.orderId = orderId;
      let type = e.type;
      let odids = JSON.parse(decodeURIComponent(e.odids));
      // console.log(type)
      // console.log(odids);
      this.setData({
        orderId: orderId,
        type: type,
        odids: odids,
        appid: accountInfo.miniProgram.appId
      });
    },
    onShow : function () {
      var that = this;
      WXAPI.orderDetail(wx.getStorageSync('token'), that.data.orderId, JSON.stringify(that.data.odids)).then(function (res) {
        if (res.retcode != 0) {
          wx.showModal({
            title: '错误',
            content: res.msg,
            showCancel: false
          })
          return;
        }
        // 绘制核销码
        // if (res.data.orderInfo.hxNumber && res.data.orderInfo.status > 0) {
        //   wxbarcode.qrcode('qrcode', res.data.orderInfo.hxNumber, 650, 650);
        // }        
        that.setData({
          orderDetail: res.data,
          typeStr: COMMON.OrderTypeStr[that.data.type]
        });
      })
    },
    wuliuDetailsTap:function(e){
      var orderId = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: "/pages/wuliu/index?id=" + orderId
      })
    },
    confirmBtnTap:function(e){
      let that = this;
      let orderId = this.data.orderId;
      wx.showModal({
          title: '确认您已收到商品？',
          content: '',
          success: function(res) {
            if (res.confirm) {
              WXAPI.orderShipper(wx.getStorageSync('token'), JSON.stringify(that.data.odids), null, true).then(function(res) {
                if (res.retcode == 0) {
                  // wx.navigateTo({
                  //   url: "/pages/order-list/index?type=3"
                  // })
                  that.setData({
                    type: 4 //我已收货，待评价状态
                  })
                  that.onShow();
                }else{
                  wx.showToast({
                    title: res.msg,
                    icon: 'none'
                  })
                  return
                }
              })
            }
          }
        })
    },
    submitReputation: function (e) {
      let that = this;
      let postJsonString = {};
      postJsonString.token = wx.getStorageSync('token');
      postJsonString.orderId = this.data.orderId;
      let reputations = [];
      let i = 0;
      while (e.detail.value["orderGoodsId" + i]) {
        let orderGoodsId = e.detail.value["orderGoodsId" + i];
        let goodReputation = e.detail.value["goodReputation" + i];
        let goodReputationRemark = e.detail.value["goodReputationRemark" + i];

        let reputations_json = {};
        reputations_json.id = orderGoodsId;
        reputations_json.reputation = goodReputation;
        reputations_json.remark = goodReputationRemark;

        reputations.push(reputations_json);
        i++;
      }
      postJsonString.reputations = reputations;
      WXAPI.orderReputation({
        postJsonString: JSON.stringify(postJsonString)
      }).then(function (res) {
        if (res.code == 0) {
          that.onShow();
        }
      })
    }
})