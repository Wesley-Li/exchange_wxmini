import { promisify } from '../../utils/promise.util'
import { $init, $digest } from '../../utils/common.util'
const WXAPI = require('apifm-wxapi')
const COMMON = require('../../utils/common');
// const qiuniu = require('../../utils/qiniu.min.js');
const qiniuUploader = require("../../utils/qiniuUploader");

const wxUploadFile = promisify(wx.uploadFile)

Page({

  data: {
    selectedType: 1,
    visibleList: [
      {name: '全部可见'},
      {name: '仅好友可见'},
      {name: '仅本校可见'},
    ],
    visibleValue: 0,
    categories:[],
    titleCount: 0,
    contentCount: 0,
    title: '',
    content: '',
    images: [],
    videos: [],
    gallery: '', //封面图,
    index: 0,
    videourl: "",
    pid: 0,

    // rcontent: '',
    formats: {},
    readOnly: false,
    placeholder: '请输入物品的详情内容...',
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
    showToolbar: false,
  },

  onLoad(options) {
    const platform = wx.getSystemInfoSync().platform
    const isIOS = platform === 'ios'
    this.setData({ isIOS})
    const that = this
    this.updatePosition(0)
    let keyboardHeight = 0
    wx.onKeyboardHeightChange(res => {
      if (res.height === keyboardHeight) return
      const duration = res.height > 0 ? res.duration * 1000 : 0
      keyboardHeight = res.height
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            that.updatePosition(keyboardHeight)
            that.editorCtx.scrollIntoView()
          }
        })
      }, duration)

    })
    $init(this);
    this.categories();
    if(options.id){
      this.setData({
        pid: options.id
      },()=>{this.getGoodsDetail(options.id)})
    }

  },
  // 发布类型选择
  onTypeSelect(e) {
    this.setData({
      selectedType: e.target.dataset.type,
    })
  },
  async categories() {
    wx.showLoading({
      title: '加载中',
    })
    const res = await WXAPI.goodsCategory()
    wx.hideLoading()
    if (res.retcode == 0) {
      this.setData({
        categories: res.data,
      });
    }
  },
  async getGoodsDetail(goodsId) {
    const that = this;
    const goodsDetailRes = await WXAPI.goodsDetail(goodsId)
    
    if (goodsDetailRes.retcode == 0) {
      console.log(goodsDetailRes.data.video)

      let _data = {
        // goodsDetail: goodsDetailRes.data,
        credprice: goodsDetailRes.data.credprice,
        title: goodsDetailRes.data.name,
        gallery: goodsDetailRes.data.pic,
        content: goodsDetailRes.data.content,
        videos: goodsDetailRes.data.video ? [goodsDetailRes.data.video] : [],
        images: goodsDetailRes.data.pics,
      }
      this.data.categories.forEach((item, index) => {
        if(item.id==goodsDetailRes.data.cid){
          _data.index = index;
          return 
        }
      });
      that.setData(_data,()=>{
        that.editorCtx.setContents({
          html: that.data.content
        })
      });
      
    }
  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      [e.currentTarget.dataset.param]: e.detail.value
    })
  },
  handleTitleInput(e) {
    const value = e.detail.value
    this.data.title = value
    this.data.titleCount = value.length
    $digest(this)
  },

  handleCredprice(e) {
    const value = e.detail.value
    if(/^-?\d+$/.test(value)){
    this.setData({
      credprice: value
    })}else{
      wx.showToast({
        title: "信用币只能是整数!",
        icon: "none"
      })
    }
  },

  handleContentInput(e) {
    const value = e.detail.value
    this.data.content = value
    this.data.contentCount = value.length
    $digest(this)
  },

  chooseImage(e) {
    wx.chooseImage({
      count: 3,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const images = this.data.images.concat(res.tempFilePaths)
        this.data.images = images.length <= 3 ? images : images.slice(0, 3)
        $digest(this)
      }
    })
  },

  removeImage(e) {
    const idx = e.target.dataset.idx
    this.data.images.splice(idx, 1)
    $digest(this)
  },
  chooseGallery(e) {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        this.data.gallery = res.tempFilePaths[0];
        $digest(this)
      }
    })
  },

  removeGallery(e) {
    this.setData({
      gallery: ''
    })
  },
  chooseVideo(e) {
    wx.chooseVideo({
      sourceType: ['album'],
      maxDuration: 60,
      camera: 'back',
      compressed: true,
      success: res => {
        if(res.duration>120){
          wx.showToast({
            title: "只能添加两分钟以内短视频!",
            icon: "none"
          })
          return
        }
        this.data.videos = [res.tempFilePath]
        $digest(this)
      }
    })
  },
  // async uploadVideo(){
  //   const _this = this;
  //   for (let i = 0; i< _this.data.videos.length; i++) {
  //     const res = await WXAPI.uploadFile(wx.getStorageSync('token'), _this.data.videos[i])
  //     console.log("upvideo res is " + res)
  //     if (res.retcode == 0) {
  //       _this.data.videourl = res.data;
  //     }
  //   }
  //   $digest(_this);
  // },
  removeVideo(e) {
    const idx = e.target.dataset.idx
    this.data.videos.splice(idx, 1)
    // $digest(this)
    this.setData({
      videos: this.data.videos
    })
  },

  handleImagePreview(e) {
    const idx = e.target.dataset.idx
    const images = this.data.images

    wx.previewImage({
      current: images[idx],
      urls: images,
    })
  },
  initQiniu(uptoken) {
    var options = {
        // bucket所在区域，这里是华北区。ECN, SCN, NCN, NA, ASG，分别对应七牛云的：华东，华南，华北，北美，新加坡 5 个区域
        region: 'ECN',

        // 获取uptoken方法三选一即可，执行优先级为：uptoken > uptokenURL > uptokenFunc。三选一，剩下两个置空。推荐使用uptokenURL，详情请见 README.md
        // 由其他程序生成七牛云uptoken，然后直接写入uptoken
        uptoken: uptoken,
        // 从指定 url 通过 HTTP GET 获取 uptoken，返回的格式必须是 json 且包含 uptoken 字段，例如： {"uptoken": "0MLvWPnyy..."}
        uptokenURL: 'https://[yourserver.com]/api/uptoken',
        // uptokenFunc 这个属性的值可以是一个用来生成uptoken的函数，详情请见 README.md
        uptokenFunc: function () { },

        // bucket 外链域名，下载资源时用到。如果设置，会在 success callback 的 res 参数加上可以直接使用的 fileURL 字段。否则需要自己拼接
        domain: '',
        // qiniuShouldUseQiniuFileName 如果是 true，则文件的 key 由 qiniu 服务器分配（全局去重）。如果是 false，则文件的 key 使用微信自动生成的 filename。出于初代sdk用户升级后兼容问题的考虑，默认是 false。
        // 微信自动生成的 filename较长，导致fileURL较长。推荐使用{qiniuShouldUseQiniuFileName: true} + "通过fileURL下载文件时，自定义下载名" 的组合方式。
        // 自定义上传key 需要两个条件：1. 此处shouldUseQiniuFileName值为false。 2. 通过修改qiniuUploader.upload方法传入的options参数，可以进行自定义key。（请不要直接在sdk中修改options参数，修改方法请见demo的index.js）
        // 通过fileURL下载文件时，自定义下载名，请参考：七牛云“对象存储 > 产品手册 > 下载资源 > 下载设置 > 自定义资源下载名”（https://developer.qiniu.com/kodo/manual/1659/download-setting）。本sdk在README.md的"常见问题"板块中，有"通过fileURL下载文件时，自定义下载名"使用样例。
        shouldUseQiniuFileName: true
    };
    // 将七牛云相关配置初始化进本sdk
    qiniuUploader.init(options);
  },
  handleGalleryPreview(e) {
    wx.previewImage({
      current: this.data.gallery,
      urls:[this.data.gallery]
    })
  },

  onPostMoments() {
    
  },
  // 发布
  async submitForm(e) {
    const that = this;
    const { selectedType, title, content, credprice, gallery, videos, images } = this.data;

    let token = wx.getStorageSync('token');
    // 此处要加判断必选项
    if(selectedType == 2) {
      if(!title || !credprice || !gallery) {
        wx.showToast({
          title: "标题，信用币和缩略图必须填写!",
          icon: 'none',
          duration: 3000
        })
        return
      }
      if(videos.length == 0 && images.length == 0) {
        wx.showToast({
          title: "视频和滚动图至少需设置一项!",
          icon: 'none',
          duration: 3000
        })
        return
      }
    }

      // 将选择的图片组成一个Promise数组，准备进行并行上传
      // wni: 注意，已经是网络图的，证明用户未修改， 过滤出来，因为wx.uploadFile只能上传本地图片，坑爹
      // 开发者工具的临时文件开头是http://tmp, 但是真机调试发现手机的临时文件叫wxfile://tmp, 擦
      const netpics = this.data.images.filter((item,index)=>{
        return item.indexOf("//tmp")==-1
      })
      const arr = []
      const localpics = this.data.images.filter((item,index)=>{
        return item.indexOf("//tmp")>-1
      })
      for (let path of localpics) {
        arr.push(wxUploadFile({
          url: WXAPI.API_BASE_URL + '/api/qiniu/upfile',
          filePath: path,
          name: 'file',
          header: {
            'Cookie': 'JSESSIONID=' + token
          },
        }))
      }

      wx.showLoading({
        title: '正在创建...',
        mask: true
      })
      //wni: 传缩略图
      if(gallery.indexOf("//tmp") > -1){ //说明是本地选的文件
        
        let res = await WXAPI.uploadFile(wx.getStorageSync('token'), this.data.gallery)
        console.log("upgallery res is " + res)
        if (res.retcode == 0) {
          this.data.gallery = res.data;
          // console.log('vi url 1' + res.data)
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: 2000
          })
          return
        }
      }
      
      //wni: 传视频
      // await this.uploadVideo();
      for (let i = 0; i< this.data.videos.length; i++) {
        if(this.data.videos[i].indexOf("//tmp")==-1){
          this.data.videourl = this.data.videos[i];
        }else{
          // const res = await WXAPI.uploadFile(wx.getStorageSync('token'), this.data.videos[i])
          const res = await WXAPI.getUploadToken();

          if (res.retcode == 0) {
            this.initQiniu(res.data);
            await qiniuUploader.upload(that.data.videos[i], (res) => {
              that.data.videourl = COMMON.pictureUrl + res.fileURL
                //  console.log("shit")
                //  console.log(res);
              }, (error) => {
                  console.error('error: ' + JSON.stringify(error));
              },
              // 此项为qiniuUploader.upload的第四个参数options。若想在单个方法中变更七牛云相关配置，可以使用上述参数。如果不需要在单个方法中变更七牛云相关配置，则可使用 null 作为参数占位符。推荐填写initQiniu()中的七牛云相关参数，然后此处使用null做占位符。
              // 若想自定义上传key，请把自定义key写入此处options的key值。如果在使用自定义key后，其它七牛云配置参数想维持全局配置，请把此处options除key以外的属性值置空。
              // 启用options参数请记得删除null占位符
              // {
              //   region: 'NCN', // 华北区
              //   uptokenURL: 'https://[yourserver.com]/api/uptoken',
              //   domain: 'http://[yourBucketId].bkt.clouddn.com',
              //   shouldUseQiniuFileName: false,
              //   key: 'testKeyNameLSAKDKASJDHKAS',
              //   uptokenURL: 'myServer.com/api/uptoken'
              // },
              null,
              (progress) => {
                  // that.setData({
                  //     'messageFileProgress': progress
                  // });
                  // console.log('上传进度', progress.progress);
                  // console.log('已经上传的数据长度', progress.totalBytesSent);
                  // console.log('预期需要上传的数据总长度', progress.totalBytesExpectedToSend);
              }, null
              );
          }else{
              wx.showToast({
                title: res.msg,
                icon: 'none',
                duration: 2000
              })
              return
            }
        }
      }
      console.log("视频传送完毕")
      
      // 开始并行上传图片
      Promise.all(arr).then(res => {
        // 上传成功，获取这些图片在服务器上的地址，组成一个数组
        // console.log("all res is " + res.map(item => JSON.parse(item.data).data))
        return res.map(item => JSON.parse(item.data).data)
      }).catch(err => {
        // console.log(">>>> upload images error:", err)
        wx.showToast({
          title: err.errMsg,
          icon: 'none',
          duration: 2000
        })
      }).then(async urls => {
        if(selectedType == 1) {
          let { videourl, netpics, visibleValue } = this.data;
          WXAPI.onPostMoments({content, opentype: visibleValue, video: videourl, pics: JSON.stringify(urls.concat(netpics))})
            .then(res => {
              console.log(res, 12121212);
              if(res.retcode == 0) {
                wx.showToast({
                  title: '发布成功!',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
          return;
        }

        const res = await WXAPI.addProduct(title, parseInt(this.data.categories[this.data.index].id), this.data.gallery, parseInt(this.data.credprice), 
                                content, 1, JSON.stringify(urls.concat(netpics)), this.data.videourl, this.data.pid)
        if(res.retcode==0){
          let msg = this.data.pid ? "更改成功!": "创建成功！感谢对蚁库的支持，新增商品获得信用币"+res.data+"奖励!"
          if(this.data.pid){
            wx.showToast({
              title: msg,
              icon: 'none',
              duration: 2000
            })
            // wx.navigateBack()
            wx.redirectTo({
              url: '/pages/goods/list?onlymy=true',
            })
          }else{
            wx.showToast({
              title: msg,
              icon: 'none',
              duration: 5000,
              mask: true,
              success: function() {
                setTimeout(function() {
                  //要延时执行的代码
                  wx.redirectTo({
                    url: '/pages/goods/list?onlymy=true',
                  })
                }, 5000) //延迟时间
              },
            });
          }
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: 2000
          })
        }
        // return createQuestion({
        //   title: title,
        //   content: content,
        //   images: urls
        // })
      }).catch(err => {
        console.log(">>>> create question error:", err)
      }).then(() => {
        wx.hideLoading()
      })
      // then(res => {

      //   // // 保存问题成功，返回上一页（通常是一个问题列表页）
      //   // const pages = getCurrentPages();
      //   // const currPage = pages[pages.length - 1];
      //   // const prevPage = pages[pages.length - 2];
      //   // // 将新创建的问题，添加到前一页（问题列表页）第一行
      //   // prevPage.data.questions.unshift(res)
      //   // $digest(prevPage)
      //   if(res.retcode==0){
      //     wx.navigateBack()
      //   }else{
      //     wx.showToast({
      //       title: res.errMsg,
      //       icon: 'none',
      //       duration: 2000
      //     })
      //   }
      // })
    
  },

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  // 返回选区已设置的样式
  onStatusChange(e) {
    // console.log(e.detail)
    const formats = e.detail
    this.setData({
      formats
    })
  },
  // 内容发生改变
  onContentChange(e) {
    // console.log("内容改变")
    // console.log(e.detail)
    this.setData({
      content: e.detail.html
    })
    // wx.setStorageSync("content", e.detail)
  },
  // 失去焦点
  onNoFocus(e) {
    // console.log("失去焦点")
    // console.log(e.detail)
    // that.setData({
    //   content: e.detail
    // })
    // wx.setStorageSync("content", e.detail)
    this.setData({
      showToolbar: false
    })
  },
  onFocus(e) {

    this.setData({
      showToolbar: true
    })
  },

  //////////////////////////////////////////
  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly
    })
  },
  updatePosition(keyboardHeight) {
    const toolbarHeight = 50
    const { windowHeight, platform } = wx.getSystemInfoSync()
    let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight)/2 : windowHeight/2
    this.setData({ editorHeight, keyboardHeight })
  },
  calNavigationBarAndStatusBar() {
    const systemInfo = wx.getSystemInfoSync()
    const { statusBarHeight, platform } = systemInfo
    const isIOS = platform === 'ios'
    const navigationBarHeight = isIOS ? 44 : 48
    return statusBarHeight + navigationBarHeight
  },
  onEditorReady() {
    const that = this
    wx.createSelectorQuery().select('#editor').context(function (res) {
      // wx.setStorageSync("rcontent", '<p wx:nodeid="162">测试图片，看看效果如何</p><p wx:nodeid="25"><img src="http://cdn-qa-static.zgyjyx.net/FoGT9dhtCsEJZ0C0LrR9o2MlPPIj.gif" width="192" data-custom="id=abcd&amp;role=god" wx:nodeid="83" style=""></p><p wx:nodeid="87"><br wx:nodeid="88"></p>')
      that.editorCtx = res.context
      // if (wx.getStorageSync("rcontent")) { // 设置~历史值
      //   // that.editorCtx.insertText(wx.getStorageSync("rcontent")) // 注意：插入的是对象
      //   that.editorCtx.setContents({
      //     html: wx.getStorageSync("rcontent")
      //   })
      // }
      if (that.data.pid && that.data.content) { // 设置~历史值
        // that.editorCtx.insertText(wx.getStorageSync("rcontent")) // 注意：插入的是对象
        that.editorCtx.setContents({
          html: that.data.content
        })
      }
    }).exec()
  },

  blur() {
    this.editorCtx.blur()
  },
  format(e) {
    let { name, value } = e.target.dataset
    if (!name) return
    // console.log('format', name, value)
    this.editorCtx.format(name, value)

  },
  // onStatusChange(e) {
  //   const formats = e.detail
  //   this.setData({ formats })
  // },
  insertDivider() {
    this.editorCtx.insertDivider({
      success: function () {
        console.log('insert divider success')
      }
    })
  },
  clear() {
    this.editorCtx.clear({
      success: function (res) {
        console.log("clear success")
      }
    })
  },
  removeFormat() {
    this.editorCtx.removeFormat()
  },
  insertDate() {
    const date = new Date()
    const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    this.editorCtx.insertText({
      text: formatDate
    })
  },
  insertImage() {
    const that = this
    wx.chooseImage({
      count: 1,
      success: async res => {
        let ret = await WXAPI.uploadFile(wx.getStorageSync('token'), res.tempFilePaths[0])
        // console.log("upgallery res is " + res)
        if (ret.retcode == 0) {
          that.editorCtx.insertImage({
            src: ret.data,
            data: {
              id: 'abcd',
              role: 'god'
            },
            width: '80%',
            success: function () {
              console.log('insert image success')
            }
          })
        }else{
          wx.showToast({
            title: ret.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  }
})