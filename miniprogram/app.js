const config = require('./config')

App({
  globalData: {
    cloudReady: false
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('当前基础库版本过低，无法使用云开发能力')
      return
    }

    const options = { traceUser: true }
    if (config.CLOUD_ENV) {
      options.env = config.CLOUD_ENV
    }
    wx.cloud.init(options)
    this.globalData.cloudReady = true

    // 首次启动时确保数据集合存在，失败不影响正常使用
    wx.cloud.callFunction({ name: 'initDB' }).catch(() => {})
  }
})
