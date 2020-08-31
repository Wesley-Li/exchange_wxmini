const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
Page({
  data: {
    region: [],
    regioncode: [],
    customItem: '全部'
  },

  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    console.log(e.detail.code)
    this.setData({
      region: e.detail.value,
      regioncode: e.detail.code
    })
  },
  // async provinces(provinceId, cityId, districtId) {
  //   const res = await WXAPI.province()
  //   if (res.code == 0) {
  //     const provinces = [{
  //       id: 0,
  //       name: '请选择'
  //     }].concat(res.data)
  //     let pIndex = 0
  //     if (provinceId) {
  //       pIndex = provinces.findIndex(ele => {
  //         return ele.id == provinceId
  //       })
  //     }
  //     this.setData({
  //       pIndex,
  //       provinces: provinces
  //     })
  //     if (provinceId) {
  //       const e = { detail: { value: pIndex}}
  //       this.provinceChange(e, cityId, districtId)
  //     }
  //   }
  // },
  // async provinceChange(e, cityId, districtId) {
  //   const index = e.detail.value
  //   this.setData({
  //     pIndex: index
  //   })
  //   const pid = this.data.provinces[index].id
  //   if (pid == 0) {
  //     this.setData({
  //       cities: null,
  //       cIndex: 0,
  //       areas: null,
  //       aIndex: 0
  //     })
  //     return
  //   }
  //   const res = await WXAPI.nextRegion(pid);
  //   if (res.code == 0) {
  //     const cities = [{
  //       id: 0,
  //       name: '请选择'
  //     }].concat(res.data)
  //     let cIndex = 0
  //     if (cityId) {
  //       cIndex = cities.findIndex(ele => {
  //         return ele.id == cityId
  //       })
  //     }
  //     this.setData({
  //       cIndex,
  //       cities: cities
  //     })
  //     if (cityId) {
  //       const e = { detail: { value: cIndex } }
  //       this.cityChange(e, districtId)
  //     }
  //   }
  // },
  // async cityChange(e, districtId) {
  //   const index = e.detail.value
  //   this.setData({
  //     cIndex: index
  //   })
  //   const pid = this.data.cities[index].id
  //   if (pid == 0) {
  //     this.setData({
  //       areas: null,
  //       aIndex: 0
  //     })
  //     return
  //   }
  //   const res = await WXAPI.nextRegion(pid);
  //   if (res.code == 0) {
  //     const areas = [{
  //       id: 0,
  //       name: '请选择'
  //     }].concat(res.data)
  //     let aIndex = 0
  //     if (districtId) {
  //       aIndex = areas.findIndex(ele => {
  //         return ele.id == districtId
  //       })
  //     }
  //     this.setData({
  //       aIndex,
  //       areas: areas
  //     })
  //     if (districtId) {
  //       const e = { detail: { value: aIndex } }
  //       this.areaChange(e)
  //     }
  //   }
  // },
  // async areaChange(e) {
  //   const index = e.detail.value
  //   this.setData({
  //     aIndex: index
  //   })  
  // },
  async bindSave(e) {
    if (this.data.region.length == 0 ) {
      wx.showToast({
        title: '请选择地区',
        icon: 'none'
      })
      return
    }
    const linkMan = e.detail.value.username;
    const address = e.detail.value.detail;
    const mobile = e.detail.value.mobile;
    if (linkMan == ""){
      wx.showToast({
        title: '请填写联系人姓名',
        icon: 'none'
      })
      return
    }
    if (mobile == ""){
      wx.showToast({
        title: '请填写手机号码',
        icon: 'none'
      })
      return
    }
    if (address == ""){
      wx.showToast({
        title: '请填写详细地址',
        icon: 'none'
      })
      return
    }    
    const postData = {
      // token: wx.getStorageSync('token'),
      username: linkMan,
      detail: address,
      mobile: mobile,
      provincename: this.data.region[0],
      provincecode: this.data.regioncode[0],
      cityname: this.data.region[1],
      citycode: this.data.regioncode[1],
      distinctcode: this.data.regioncode[2],
      distinctname: this.data.region[2],
      isDefault: 1,
    }  
    let apiResult
    if (this.data.id) {
      postData.id = this.data.id
      apiResult = await WXAPI.updateAddress(postData)
    } else {
      apiResult = await WXAPI.addAddress(postData)
    }
    if (apiResult.retcode != 0) {
      // 登录错误 
      wx.hideLoading();
      wx.showToast({
        title: apiResult.msg,
        icon: 'none'
      })
      return;
    } else {
      wx.navigateBack()
    }
  },
  async onLoad(e) {
    if (e.id) { // 修改初始化数据库数据
      const res = await WXAPI.addressDetail(e.id)
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
    } else {
      // this.provinces()
    }
  },

  deleteAddress: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: function (res) {
        if (res.confirm) {
          WXAPI.deleteAddress(id).then(function () {
            wx.navigateBack({})
          })
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },

  async readFromWx() {
    let that = this;
    wx.chooseAddress({
      success: function (res) {
        console.log(res)
        const provinceName = res.provinceName;
        const cityName = res.cityName;
        const diatrictName = res.countyName;
        // 读取省
        const pIndex = that.data.provinces.findIndex(ele => {
          return ele.name == provinceName
        })
        if (pIndex != -1) {
          const e = {
            detail: {
              value: pIndex
            }
          }
          that.provinceChange(e, 0, 0).then(() => {
            // 读取市
            const cIndex = that.data.cities.findIndex(ele => {
              return ele.name == cityName
            })
            if (cIndex != -1) {
              const e = {
                detail: {
                  value: cIndex
                }
              }
              that.cityChange(e, 0).then(() => {
                // 读取区县
                const aIndex = that.data.areas.findIndex(ele => {
                  return ele.name == diatrictName
                })
                if (aIndex != -1) {
                  const e = {
                    detail: {
                      value: aIndex
                    }
                  }
                  that.areaChange(e)
                }
              })
            }
          })
        }
        const addressData = {}
        addressData.linkMan = res.userName
        addressData.mobile = res.telNumber
        addressData.address = res.detailInfo
        that.setData({
          addressData
        });
      }
    })
  },
})
