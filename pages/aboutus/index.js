Page({
    // 拨打电话
    bodadianhua(e) {
        console.log(e);
     wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone //客服电话
     })
    },
    // 添加客服微信
    tianjiaweixin() {
     wx.setClipboardData({
      data: 'caishen401918',
      success: function(res) {
       wx.getClipboardData({
        success: function(res) {
         console.log('复制成功')
         console.log(res.data) // data
        }
       })
      }
     })
    },
   })