const config = require('./config')

App({
  globalData: {
    // 云开发就绪 Promise，所有页面读写云数据库前必须 await 它
    cloudReady: null,
    cloudEnv: config.CLOUD_ENV || ''
  },

  onLaunch() {
    const that = this
    this.globalData.cloudReady = this.initCloud()
  },

  initCloud() {
    if (!wx.cloud) {
      return Promise.reject(new Error('当前微信基础库版本过低，无法使用云开发能力，请升级微信'))
    }

    const options = { traceUser: true }
    if (config.CLOUD_ENV) {
      options.env = config.CLOUD_ENV
    }

    try {
      wx.cloud.init(options)
    } catch (e) {
      return Promise.reject(new Error('云开发初始化失败：' + (e && e.message)))
    }

    // 确保 daily_plans / task_templates 集合存在；若未开通云开发环境，给出明确提示
    return wx.cloud.callFunction({ name: 'initDB' })
      .then(function (res) {
        return res
      })
      .catch(function (err) {
        console.error('initDB 调用失败', err)
        // 不 reject：集合会在首次写入时自动创建，这里只记录日志
        return null
      })
  }
})
