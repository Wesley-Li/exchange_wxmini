const WXAPI = require('apifm-wxapi')
const CONFIG = require('config.js')
const AUTH = require('utils/auth')
import TIM from 'tim-wx-sdk'
import COS from "cos-wx-sdk-v5"
App({
  onLaunch: function() {
    WXAPI.init(CONFIG.subDomain)
    const that = this;
    // 检测新版本
    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    /**
     * 初次加载判断网络情况
     * 无网络状态下根据实际情况进行调整
     */
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType
        if (networkType === 'none') {
          that.globalData.isConnected = false
          wx.showToast({
            title: '当前无网络',
            icon: 'loading',
            duration: 2000
          })
        }
      }
    });
    /**
     * 监听网络状态变化
     * 可根据业务需求进行调整
     */
    wx.onNetworkStatusChange(function(res) {
      if (!res.isConnected) {
        that.globalData.isConnected = false
        wx.showToast({
          title: '网络已断开',
          icon: 'loading',
          duration: 2000
        })
      } else {
        that.globalData.isConnected = true
        wx.hideToast()
      }
    })
    // 先不用动态配置了，先写死
    // WXAPI.queryConfigBatch('mallName,WITHDRAW_MIN,ALLOW_SELF_COLLECTION,order_hx_uids,subscribe_ids,share_profile').then(res => {
    //   if (res.code == 0) {
    //     res.data.forEach(config => {
    //       wx.setStorageSync(config.key, config.value);
    //     })
    //     if (this.configLoadOK) {
    //       this.configLoadOK()
    //     }
    //   }
    // })
    wx.setStorageSync('mallName', "蚁库");
    wx.setStorageSync('share_profile', "绝对放心的闲置物品交易!");
    that.iminit();
  },

  onShow (e) {
    // 保存邀请人
    if (e && e.query && e.query.inviter_id) {
      wx.setStorageSync('referrer', e.query.inviter_id)
      if (e.shareTicket) {
        wx.getShareInfo({
          shareTicket: e.shareTicket,
          success: res => {
            console.log(res)
            console.log({
              referrer: e.query.inviter_id,
              encryptedData: res.encryptedData,
              iv: res.iv
            })
            wx.login({
              success(loginRes) {
                if (loginRes.code) {
                  WXAPI.shareGroupGetScore(
                    loginRes.code,
                    e.query.inviter_id,
                    res.encryptedData,
                    res.iv
                  ).then(_res => {
                    console.log(_res)
                  }).catch(err => {
                    console.error(err)
                  })
                } else {
                  console.error('登录失败！' + loginRes.errMsg)
                }
              }
            })
          }
        })
      }
    }
    // 自动登录
    AUTH.checkHasLogined().then(async isLogined => {
      console.log('isLogined is '+isLogined)
      if (!isLogined) {
        AUTH.login();
        // this.iminit();
      } else {
        // this.iminit();
        // AUTH.getUserInfo().then((res) => {
        //   const { userInfo } = res
        //   // 更新用户信息
        //   WXAPI.modifyUserInfo({
        //     avatarUrl: userInfo.avatarUrl,
        //     city: userInfo.city,
        //     nick: userInfo.nickName,
        //     province: userInfo.province,
        //     token: wx.getStorageSync('token')
        //   })
        // })
      }
    });
  },
  iminit() {
    let options = {
      SDKAppID: 1400434314 // 接入时需要将0替换为您的即时通信 IM 应用的 SDKAppID
    }
    var that = this
    // 创建 SDK 实例，`TIM.create()`方法对于同一个 `SDKAppID` 只会返回同一份实例
    let tim = TIM.create(options);// SDK 实例通常用 tim 表示
    // 设置 SDK 日志输出级别，详细分级请参见 setLogLevel 接口的说明
    // tim.setLogLevel(0); // 普通级别，日志量较多，接入时建议使用
    tim.setLogLevel(1); // release 级别，SDK 输出关键信息，生产环境时建议使用
    // 注册 COS SDK 插件
    tim.registerPlugin({'cos-wx-sdk': COS})
    // 监听事件，例如：
    tim.on(TIM.EVENT.SDK_READY, function(event) {
      console.log('SDK_READY')
      that.globalData.isImLogin = true
      wx.setStorageSync('isImLogin', true)
      // 收到离线消息和会话列表同步完毕通知，接入侧可以调用 sendMessage 等需要鉴权的接口
      // event.name - TIM.EVENT.SDK_READY
    });
  
    tim.on(TIM.EVENT.MESSAGE_RECEIVED, function(event) {
      console.log('收到消息')
      // 若同时收到多个会话 需要根据conversationID来判断是哪个人的会话
      var msgarr = []
      var newMsgForm = event.data[0].conversationID // 定义会话键值
      console.log(msgarr[newMsgForm])
      if(msgarr[newMsgForm]) {
        msgarr[newMsgForm].push(event.data[0])
      } else {
        msgarr[newMsgForm] = [event.data[0]]
      }
      console.log(msgarr[newMsgForm])
      that.globalData.myMessages = msgarr
      // 这里引入了一个监听器 （因为小程序没有类似vuex的状态管理器 当global里面的数据变化时不能及时同步到聊天页面 因此 这个监听器可以emit一个方法 到需要更新会话数据的页面 在那里进行赋值）
      wx.event.emit('testFunc',that.globalData.myMessages,newMsgForm) // 详情页的函数
      wx.event.emit('conversation') // 会话列表的监听函数
      // 未读消息数
      var number = wx.getStorageSync('number_msg') || 0
      // 根据isRead判断是否未读 否则加1
      if(!event.data[0].isRead) {
        number = number++
      }
      console.log(number)
      wx.setStorageSync('number_msg', number)
      // 如果有未读数 需要设置tabbar的红点标志 反之去掉红点标志
      if(number>0) {
        wx.setTabBarBadge({
          index: 3,
          text: number.toString()
        })
      } else {
        wx.hideTabBarRedDot({
          index: 3
        })
      }
      // 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
      // event.name - TIM.EVENT.MESSAGE_RECEIVED
      // event.data - 存储 Message 对象的数组 - [Message]
    })
  
    tim.on(TIM.EVENT.MESSAGE_REVOKED, function(event) {
      // 收到消息被撤回的通知
      // event.name - TIM.EVENT.MESSAGE_REVOKED
      // event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isRevoked 属性值为 true
    });
  
    tim.on(TIM.EVENT.CONVERSATION_LIST_UPDATED, function(event) {
      // 更新当前所有会话列表
      // 注意 这个函数在首次点击进入会话列表的时候也会执行 因此点击消息 可以显示当前的未读消息数（unreadCount表示未读数）
      console.log('发送了消息')
      console.log('更新当前所有会话列表')
      var conversationList = event.data
      var number =  0
      conversationList.forEach(e => {
        number = number + e.unreadCount
      })
      wx.setStorageSync('number_msg', number)
      if(number>0) {
        wx.setTabBarBadge({
          index: 3,
          text: number.toString()
        })
      } else {
        wx.hideTabBarRedDot({
          index: 3
        })
      }
      // 收到会话列表更新通知，可通过遍历 event.data 获取会话列表数据并渲染到页面
      // event.name - TIM.EVENT.CONVERSATION_LIST_UPDATED
      // event.data - 存储 Conversation 对象的数组 - [Conversation]
    });
  
    tim.on(TIM.EVENT.GROUP_LIST_UPDATED, function(event) {
      // 收到群组列表更新通知，可通过遍历 event.data 获取群组列表数据并渲染到页面
      // event.name - TIM.EVENT.GROUP_LIST_UPDATED
      // event.data - 存储 Group 对象的数组 - [Group]
    });
  
    tim.on(TIM.EVENT.GROUP_SYSTEM_NOTICE_RECEIVED, function(event) {
      // 收到新的群系统通知
      // event.name - TIM.EVENT.GROUP_SYSTEM_NOTICE_RECEIVED
      // event.data.type - 群系统通知的类型，详情请参见 GroupSystemNoticePayload 的 operationType 枚举值说明
      // event.data.message - Message 对象，可将 event.data.message.content 渲染到到页面
    });
  
    tim.on(TIM.EVENT.PROFILE_UPDATED, function(event) {
      // 收到自己或好友的资料变更通知
      // event.name - TIM.EVENT.PROFILE_UPDATED
      // event.data - 存储 Profile 对象的数组 - [Profile]
    });
  
    tim.on(TIM.EVENT.BLACKLIST_UPDATED, function(event) {
      // 收到黑名单列表更新通知
      // event.name - TIM.EVENT.BLACKLIST_UPDATED
      // event.data - 存储 userID 的数组 - [userID]
    });
  
    tim.on(TIM.EVENT.ERROR, function(event) {
      // 收到 SDK 发生错误通知，可以获取错误码和错误信息
      // event.name - TIM.EVENT.ERROR
      // event.data.code - 错误码
      // event.data.message - 错误信息
    });
  
    tim.on(TIM.EVENT.SDK_NOT_READY, function(event) {
      // wx.setStorageSync('isImLogin', false)
      console.log('SDK_NOT_READY')
      that.globalData.isImLogin = false
      wx.setStorageSync('isImLogin', false)
      // 收到 SDK 进入 not ready 状态通知，此时 SDK 无法正常工作
      // event.name - TIM.EVENT.SDK_NOT_READY
    });
  
    tim.on(TIM.EVENT.KICKED_OUT, function(event) {
      console.log('KICKED_OUT')
      wx.setStorageSync('isImLogin', false)
      that.globalData.isImLogin = false
      // 收到被踢下线通知
      // event.name - TIM.EVENT.KICKED_OUT
      // event.data.type - 被踢下线的原因，例如:
      //    - TIM.TYPES.KICKED_OUT_MULT_ACCOUNT 多实例登录被踢
      //    - TIM.TYPES.KICKED_OUT_MULT_DEVICE 多终端登录被踢
      //    - TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED 签名过期被踢
    })
    that.globalData.tim = tim
  },

  globalData: {
    isConnected: true,
    userInfo: null,
    sessionid:'',
    tim: '',
    isImLogin: false,
    msgList: [],
    myMessages: new Map(),
  }
})