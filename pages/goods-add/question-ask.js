import { promisify } from '../../utils/promise.util'
import { $init, $digest } from '../../utils/common.util'
const WXAPI = require('apifm-wxapi')

const wxUploadFile = promisify(wx.uploadFile)

Page({

  data: {
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
      index: e.detail.value
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
      sourceType: ['album','camera'],
      maxDuration: 60,
      camera: 'back',
      success: res => {
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

  handleGalleryPreview(e) {
    wx.previewImage({
      current: this.data.gallery,
      urls:[this.data.gallery]
    })
  },

  async submitForm(e) {
    const title = this.data.title
    const content = this.data.content
    let token = wx.getStorageSync('token');
    //此处要加判断必选项
    if(!title || !this.data.credprice || !this.data.gallery){
      wx.showToast({
        title: "标题，信用币和缩略图必须填写!",
        icon: 'none',
        duration: 3000
      })
      return
    }
    if(this.data.videos.length==0 && this.data.images.length==0){
      wx.showToast({
        title: "视频和滚动图至少需设置一项!",
        icon: 'none',
        duration: 3000
      })
      return
    }

      // 将选择的图片组成一个Promise数组，准备进行并行上传
      // wni: 注意，已经是网络图的，证明用户未修改， 过滤出来，因为wx.uploadFile只能上传本地图片，坑爹
      const netpics = this.data.images.filter((item,index)=>{
        return item.indexOf("http://tmp")==-1
      })
      const arr = []
      const localpics = this.data.images.filter((item,index)=>{
        return item.indexOf("http://tmp")>-1
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
      if(this.data.gallery.indexOf("http://tmp")>-1){ //说明是本地选的文件
        
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
        if(this.data.videos[i].indexOf("http://tmp")==-1){
          this.data.videourl = this.data.videos[i];
        }else{
          const res = await WXAPI.uploadFile(wx.getStorageSync('token'), this.data.videos[i])
          // console.log("upvideo res is " + res)
          if (res.retcode == 0) {
            this.data.videourl = res.data;
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
      }
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
        // 调用保存问题的后端接口
        // const res = await WXAPI.shippingCarInfo(token)
        // if (res.retcode == 0) {
        //   this.setData({
        //     shopNum: res.data.number
        //   })
        // }
        // console.log([urls])
        // console.log("urls type is "+typeof(urls))
        // if(typeof(urls) == "string"){
          // console.log("urls is string")
          // urls = JSON.stringify([urls])
        // }
        // console.log("urls " + urls)
        // console.log(urls)
        // console.log('vi url 2' + this.data.videourl)
        // "http://cdn-qa-static.zgyjyx.net/def30629/FpPB-wrNUugo_wejjG-J_6ekOy3U.jpg"
        const res = await WXAPI.addProduct(title, parseInt(this.data.categories[this.data.index].id), this.data.gallery, parseInt(this.data.credprice), 
                                this.data.content, 1, JSON.stringify(urls.concat(netpics)), this.data.videourl, this.data.pid)
        if(res.retcode==0){
          wx.showToast({
            title: "创建成功!",
            icon: 'none',
            duration: 2000
          })
          // wx.navigateBack()
          wx.redirectTo({
            url: '/pages/goods/list?onlymy=true',
          })
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