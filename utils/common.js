const { __esModule } = require("../miniprogram_npm/@vant/weapp/mixins/basic")

module.exports = {
    OrderTypeStr: {
        0: "待付款",
        1: "待发货",
        2: '待收货',
        3: '待我发货',
        4: '已收货',

    },
    uploadUrl: "http://upload.qiniu.com/",  //"//upload.qiniu.com/", //上传地址 自适应https和http
    pictureUrl: "http://yiku-qiniu-static.alimom.cn/", //获取上传图片的地址
    videoUrl: "http://qa-web-video-cdn.zgyjyx.com/" //获取上传视频的地址
}