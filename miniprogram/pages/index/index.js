const dateUtil = require('../../utils/date')
const store = require('../../utils/store')

function describe(plan) {
  if (!plan || !plan.total) return '今天还没安排'
  return '今天 ' + plan.done + '/' + plan.total
}

Page({
  data: {
    todayLabel: '',
    stats: {
      adult: { text: '今天还没安排' },
      kid: { text: '今天还没安排' }
    }
  },

  onShow() {
    const now = new Date()
    this.setData({ todayLabel: dateUtil.fullDateLabel(now) })
    this.loadStats(dateUtil.formatDate(now))
  },

  loadStats(date) {
    const that = this
    Promise.all([store.getPlan(date, 'adult'), store.getPlan(date, 'kid')])
      .then(function (res) {
        that.setData({
          'stats.adult.text': describe(res[0]),
          'stats.kid.text': describe(res[1])
        })
      })
      .catch(function (err) {
        console.warn('读取今日进度失败', err)
      })
  },

  goMode(e) {
    const mode = e.currentTarget.dataset.mode
    wx.navigateTo({ url: '/pages/select/select?mode=' + mode })
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/history' })
  }
})
