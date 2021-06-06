// subpackages/settingInfo/index.js
const WXAPI = require('apifm-wxapi');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    region: [],
    regioncode: [],
    allSchool: [],
    schoolList: [],
    genderArr: [
      {id: 0, name: '保密'},
      {id: 1, name: '男'},
      {id: 2, name: '女'},
    ]
  },

  inputBlur: function(e) {
    let param = e.currentTarget.dataset.param;
    if(param == 'shortDesc') {
      this.setShortDesc(e.detail.value);
    }
  },

  pickerChange: function(e) {
    console.log(e, 666666)
    let param = e.currentTarget.dataset.param;
    if(param == 'gender') {
      this.setGender(e.detail.value);
    } else if(param == 'birth') {
      this.setBirth(e.detail.value);
    } else if(param == 'college') {
      this.setCollege(e.detail.value);
    }
  },

  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value, e)
    console.log(e.detail.code)
    let { allSchool, regioncode } = this.data;
    let provinceName = e.detail.value[0];
    allSchool.map(item => {
      if(provinceName.indexOf(item.name) > -1) {
        this.setData({
          schoolList: item.univs
        })
      }
    })

    if(regioncode[0] != e.detail.code[0]) {
      this.setCollege();
    }

    this.setData({
      region: e.detail.value,
      regioncode: e.detail.code
    })

    WXAPI.setLocation({province_id: e.detail.code[0], province: e.detail.value[0], city_id: e.detail.code[1], city: e.detail.value[1], distinct_id: e.detail.code[2], distinctname: e.detail.value[2]})
      .then(res => {

      })
  },

  getSchool: function() {
    let { userInfo } = this.data;
    WXAPI.getSchool({})
      .then(res => {
        console.log(res, 111111)
        this.setData({
          allSchool: res[0].provs,
        })
        if(userInfo.provinceId) {
          let schoolList = [];
          res[0].provs.map(item => {
            if(userInfo.province.indexOf(item.name) > -1) {
              schoolList = item.univs;
              this.setData({
                schoolList
              })
            }
          })

          if(userInfo.collegeId) {
            schoolList.map((item, index) => {
              if(item.id == userInfo.collegeId) {
                userInfo.collegeIndex = index;
              }
            })
          }
          this.setData({
            userInfo,
          })
        }
      })
  },
  // 设置简介
  setShortDesc: function(value) {
    WXAPI.setShortDesc({short_desc: value})
      .then(res => {
        if(res.retcode == 0) {

        }
      })
  },
  // 设置性别
  setGender: function(value) {
    WXAPI.setGender({gender: value})
      .then(res => {
        if(res.retcode == 0) {
          let { userInfo, genderArr } = this.data;
          userInfo.gender = value;
          genderArr.map(item => {
            if(item.id == value) {
              userInfo.genderName = item.name;
            }
          })
          this.setData({
            userInfo,
          })
        }
      })
  },
  // 设置生日
  setBirth: function(value) {
    WXAPI.setBirth({birth: value})
      .then(res => {
        if(res.retcode == 0) {
          let { userInfo } = this.data;
          userInfo.birth = value;
          this.setData({
            userInfo,
          })
        }
      })
  },
  // 设置学校
  setCollege: function(value) {
    let { userInfo, schoolList } = this.data;

    let data = {
      college_id: '', college_name: '', depart_name: '', college_date: '', edu: ''
    };
    if(value != undefined) {
      data = {
        college_id: schoolList[value].id,
        college_name: schoolList[value].name,
        depart_name: '', 
        college_date: '',
        edu: '',
      }
    }

    WXAPI.setCollege(data)
      .then(res => {
        if(res.retcode == 0) {
          if(value != undefined) {
            userInfo.collegeIndex = value;
            userInfo.collegeName = schoolList[value].name;
          } else {
            userInfo.collegeIndex = undefined;
            userInfo.collegeName = '';
          }
          
          this.setData({
            userInfo,
          })
        }
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id) { // 修改初始化数据库数据
      const res = WXAPI.addressDetail(options.id)
      if (res.retcode == 0 && res.data) {
        this.setData({
          id: e.id,
          addressData: res.data,
          region: [res.data.provincename, res.data.cityname, res.data.distinctname],
          regioncode: [res.data.provincecode, res.data.citycode, res.data.distinctcode]
        })
      } else {
        wx.showModal({
          title: '错误',
          content: '无法获取地址数据',
          showCancel: false
        })
      }
    }
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
    let userInfo = wx.getStorageSync('user_info');
    let region = [], regioncode = [];
    if(userInfo.provinceId) {
      region[0] = userInfo.province;
      regioncode[0] = userInfo.provinceId;
    }
    if(userInfo.cityId) {
      region[1] = userInfo.city;
      regioncode[1] = userInfo.cityId;
    }
    if(userInfo.distinctId) {
      region[2] = userInfo.distinctname;
      regioncode[2] = userInfo.distinctId;
    }
    this.setData({
      userInfo,
      region,
      regioncode
    }, () => {
      this.getSchool();
    })
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})