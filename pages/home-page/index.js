// pages/home-page/index.js
const WXAPI = require('apifm-wxapi');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    types: [{
        name: '电子集市',
        type: 'dzjs'
      },
      {
        name: '家有萌宠',
        type: 'jymc'
      },
      {
        name: '大鞋小服',
        type: 'dxxf'
      },
      {
        name: '游戏酷玩',
        type: 'yxkw'
      },
      {
        name: '小脸扑扑',
        type: 'xlpp'
      },
      {
        name: '三岁小孩',
        type: 'ssxh'
      },
      {
        name: '个人创作',
        type: 'grcz'
      },
      {
        name: '校园美食',
        type: 'xyms'
      },
    ],
    location: {
      latitude: 35.140415,
      longitude: 105.273511
    },
    numm: 620
  },

  // getMapData: function () {
  //   WXAPI.getMapData().then(res => {
  //     let pointsData = [...res];
  //     let polygons = [];
  //     pointsData.map(item => {
  //       polygons.push({
  //         points: item.points,
  //         strokeWidth: 1,
  //         strokeColor: '#3875FF',
  //         fillColor: '#30BC6B90',
  //       });
  //     })
  //     this.setData({
  //       polygons,
  //     })
  //   })
  // },

  getBall: function() {
    let citys = ['青海', '宁夏', '新疆', '台湾', '香港', '澳门', '黑龙江','天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '北京', '上海', '江苏', '浙江', '山东', '福建', '安徽', '江西', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃'];
    let d_ball = new draw_ball(); //实例化对像draw_ball
    d_ball.angle(); // 执行对象的方法 angle()
    let radius = d_ball.radius; // 球的半径

    let list = [];
    // 绘制球上面的小方块
    for (let i = 0; i < d_ball.length; i++) {
      let theta = d_ball.angles[i].theta; // 小方块 的 theta 角
      let phi = d_ball.angles[i].phi; // 小方块 的 phi 角
      let z = radius * Math.sin(theta) * Math.cos(phi); // 计算出 小方块 转动的 z 轴
      let x = radius * Math.sin(theta) * Math.sin(phi) + radius; // 计算出 小方块 转动的 x 轴
      let y = radius * Math.cos(theta) + radius; // 计算出 小方块 转动的 y 轴

      let cityName = d_ball.angles[i].cityName || '-';
      
      let nn = (i == 24) ? 1 : z;

      list.push({
        class: 'city' + i,
        key: i,
        cityName,
        style: `left: ${x}rpx; top: ${y}rpx; transform: translateZ(${nn}rpx) rotateY(${phi}rad) rotateX(${(theta - Math.PI / 2)}rad)`,
      })
    }

    this.setData({
      list,
    })

    this.onRotate();

    // 绘球 方法，让42个小方块附在球体上
    function draw_ball() {  // 对象方法
      let t = this;
      this.radius = 300; // 半径

      this.angles = [];
      this.length = 34 + 8;  // 34：行政区数量，8上下留白；小方块的数量，球头、底部角度不好，留白不添加行政区

      this.angle = function () {  // 设置每一个小方块的位置
        let num = 0;
        let index = 0;
        for (let i = 0; i < this.length; i++) {
          let obj = {};
          if (i == 0) {  // 第一行
            obj.theta = 0; // theta角共180度，从0度开始
            obj.phi = 0; // phi角 是360度，即一圈，从0度开始
          }
          if (i > 0 && i < 4) { // 第二行
            obj.theta = Math.PI / 8 * 1; // 共9行，所以，中间角度会有8次变化，下面以次类推
            obj.phi = Math.PI * 2 / 3 * num; // 第二行是3个小方块，所以360度/3，下面以次类推
            num++
          }
          if (i > 3 && i < 9) {
            obj.theta = Math.PI / 8 * 2;
            obj.phi = Math.PI * 2 / 5 * num;
            obj.cityName = citys[index];
            num++;
            index++;
          }
          if (i > 8 && i < 16) {
            obj.theta = Math.PI / 8 * 3;
            obj.phi = Math.PI * 2 / 7 * num;
            obj.cityName = citys[index];
            num++;
            index++;
          }
          if (i > 15 && i < 26) {
            obj.theta = Math.PI / 8 * 4;
            obj.phi = Math.PI * 2 / 10 * num;
            obj.cityName = citys[index];
            num++;
            index++;
          }
          if (i > 25 && i < 33) {
            obj.theta = Math.PI / 8 * 5;
            obj.phi = Math.PI * 2 / 7 * num;
            obj.cityName = citys[index];
            num++;
            index++;
          }
          if (i > 32 && i < 38) {
            obj.theta = Math.PI / 8 * 6;
            obj.phi = Math.PI * 2 / 5 * num;
            obj.cityName = citys[index];
            num++;
            index++;
          }
          if (i > 37 && i < 41) {
            obj.theta = Math.PI / 8 * 7;
            obj.phi = Math.PI * 2 / 3 * num;
            num++;
          }
          if (i > 40) {
            obj.theta = Math.PI;
            obj.phi = 0;
          }
          this.angles.push(obj);
        }
      }
    }
  },
  // 转动球
  onRotate: function() {
    let t = this;
    let numm = 0;
    let timer = setInterval(rond, 100);  // 让球每100毫秒转动一次
    // ball.mouseover(function () {
    //   clearInterval(timer);  // 当鼠标移到球上时，停止转动
    // });
    // ball.mouseout(function () {
    //   t = setInterval(rond, 100); // 当鼠标移出球时，恢复转动
    // });
    function rond() {  // 运动函数
      numm += 3;
      t.setData({
        numm,
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.getMapData();
    this.getBall();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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