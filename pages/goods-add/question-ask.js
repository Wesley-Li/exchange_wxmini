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

    rcontent: '',
    formats: {}, // 样式
    placeholder: '开始输入...',
  },

  onLoad(options) {
    const that = this;
    $init(this);
    
    this.categories();
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
    $digest(this)
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

    if (title && content) {
      
      // 将选择的图片组成一个Promise数组，准备进行并行上传
      const arr = []
      for (let path of this.data.images) {
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
      
      //wni: 传视频
      // await this.uploadVideo();
      for (let i = 0; i< this.data.videos.length; i++) {
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
                                content, 1, JSON.stringify(urls), this.data.videourl)
        if(res.retcode==0){
          wx.showToast({
            title: "创建成功!",
            icon: 'none',
            duration: 2000
          })
          // wx.navigateBack()
          wx.navigateTo({
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
    }
  },

  // 初始化编辑器
  onEditorReady() {
    const that = this;
    wx.createSelectorQuery().select('#editor').context(function(res) {
      that.editorCtx = res.context

      if (wx.getStorageSync("rcontent")) { // 设置~历史值
        that.editorCtx.insertText(wx.getStorageSync("rcontent")) // 注意：插入的是对象
      }

    }).exec()
  },
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
    // that.setData({
    //   content: e.detail
    // })
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
  },
  // 获取内容
  clickLogText(e) {
    that.editorCtx.getContents({
      success: function(res) {
        console.log(res.html)
        wx.setStorageSync("rcontent", res.html); // 缓存本地
        // < p > 备注说明：</p > <p>1、评分规则</p> <p>2、注意事项</p> <p>3、哈哈呵呵</p> <p><br></p><p><br></p>
      }
    })
  },
  // 清空所有
  clear() {
    this.editorCtx.clear({
      success: function(res) {
        console.log("清空成功")
      }
    })
  },
  // 清除样式
  removeFormat() {
    this.editorCtx.removeFormat()
  },
  // 记录样式
  format(e) {
    let {
      name,
      value
    } = e.target.dataset
    if (!name) return
    this.editorCtx.format(name, value)
  },

})