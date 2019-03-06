//index.js
//获取应用实例
let amapFile = require('../../libs/amap-wx.js');
let myAmapFun = new amapFile.AMapWX({
  key: 'e0c92f485397dc863b4cb831e87f05e5'
});

const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    scale: 18,
    markers: [],
    latitude: 0,
    longitude: 0,
    polyline: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log(res);
        // _this.data.latitude = res.latitude;
        // _this.data.longitude = res.longitude;
        _this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
        _this.createBike(res);
      },
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.map = wx.createMapContext('map');
    // this.map.moveToLocation();

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

  },
  /**
   * 放大
   */
  large: function (e) {
    this.data.scale > 18 ? this.data.scale = 18 : this.data.scale;
    this.setData({
      scale: this.data.scale + 1
    });
  },
  /**
   * 缩小
   */
  small: function (e) {
    this.data.scale < 5 ? this.data.scale = 5 : this.data.scale;
    this.setData({
      scale: this.data.scale - 1
    })
  },
  /**
   * 回到当前位置
   */
  onReset: function () {
    this.map.moveToLocation();
  },
  /**
   * 个人中心
   */
  onUser: function () {
    wx.navigateTo({
      url: '/pages/user/user',
    })
  },
  /**
   * 点击地图
   */
  onMap: function (e) {
    // console.log(this.data.latitude, this.data.longitude);
    // this.setData({
    //   latitude: this.data.latitude1,
    //   longitude: this.data.longitude1
    // });
    // console.log(this.data.latitude, this.data.longitude);
  },
  /**
   * 地图视野发生变化
   */
  mapChange: function (e) {
    this.data.markers = [];
    this.setData({
      polyline: []
    });
    var _this = this;
    console.log('视野发生变化了', e);
    if (e.type == 'begin') {} else if (e.type == 'end') {
      this.map.getCenterLocation({
        success: (res) => {
          console.log(res);
          _this.createBike(res);
        }
      })
    }
  },
  /**
   * 创建单车
   */
  createBike: function (res) {
    var len = Math.ceil(Math.random() * 20);
    for (var i = 0; i < len; i++) {
      var bike = {
        id: 0,
        latitude: 0,
        longitude: 0,
        iconPath: '/images/map-bicycle.png',
        width: 52.5,
        height: 30,
        callout: {}
      };
      // 单车密度设置
      var x = Math.ceil(Math.random() * 99) * 0.00002,
        y = Math.ceil(Math.random() * 99) * 0.00002;
      bike.id = i;
      bike.latitude = Math.random() > 0.5 ? res.latitude + x : res.latitude - x;
      bike.longitude = Math.random() > 0.5 ? res.longitude + y : res.longitude - y;
      this.data.markers.push(bike);
    }
    this.setData({
      markers: this.data.markers
    })
    this.recently(res);
  },
  /**
   * 计算最近的单车
   */
  recently: function (res) {
    console.log()
    let bikeArr = this.data.markers;
    let distanceArr = [];
    let minIndex = 0;
    for (let i = 0; i < bikeArr.length; i++) {
      let lat = bikeArr[i].latitude;
      let lon = bikeArr[i].longitude;
      //计算距离
      let t = Math.sqrt((lon - res.longitude) * (lon - res.longitude) + (lat - res.latitude) * (lat - res.latitude));
      distanceArr.push(t);
    }
    // 从距离数组中找出最小值
    let min = distanceArr[0];
    for (let i = 0; i < distanceArr.length; i++) {
      if (distanceArr[i] < min) {
        min = distanceArr[i];
        minIndex = i;
      }
    }
    // 设置最近的单车上气泡
    this.data.markers[minIndex].callout = {
      content: '离我最近',
      color: '#ff0000aa',
      fontSize: 12,
      borderRadius: 50,
      padding: 5,
      bgColor: '#0082FCaa',
      display: 'ALWAYS'
    }
    this.setData({
      markers: this.data.markers
    })
  },
  /**
   * 规划路线
   */
  toVisit: function (e) {
    let that = this;
    let id = e.markerId;
    let target = this.data.markers[id];
    this.map.getCenterLocation({
      success: (res) => {
        // console.log(res.longitude, res.latitude);
        // console.log(target.longitude, target.latitude);
        myAmapFun.getWalkingRoute({
          origin: `${res.longitude},${res.latitude}`,
          destination: `${target.longitude},${target.latitude}`,
          success: function (data) {
            var points = [];
            if (data.paths && data.paths[0] && data.paths[0].steps) {
              var steps = data.paths[0].steps;
              for (var i = 0; i < steps.length; i++) {
                var poLen = steps[i].polyline.split(';');
                for (var j = 0; j < poLen.length; j++) {
                  points.push({
                    longitude: parseFloat(poLen[j].split(',')[0]),
                    latitude: parseFloat(poLen[j].split(',')[1])
                  })
                }
              }
            };
            that.setData({
              polyline: [{
                points: points,
                color: "#0091ffaa",
                width: 4
              }]
            });
          },
          fail: function (info) {
            console.log('err:', info);
          }
        })
      }
    })
  },
  /**
   * 扫一扫
   */
  onScan: function (e) {
    wx.scanCode({
      success: (res) => {
        console.log('成功：', res);
      }
    })
  }
})