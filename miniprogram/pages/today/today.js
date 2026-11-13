const dateUtil = require('../../utils/date')
const store = require('../../utils/store')
const presets = require('../../utils/presets')

Page({
  data: {
    modeInfo: presets.MODES.adult,
    greeting: '',
    dateLabel: '',
    tasks: [],
    doneCount: 0,
    total: 0,
    leftCount: 0,
    percent: 0,
    allDone: false
  },

  onLoad(options) {
    const mode = options.mode === 'kid' ? 'kid' : 'adult'
    const now = new Date()

    this.mode = mode
    this.date = dateUtil.formatDate(now)
    this.tasks = []
    this.saveTimer = null

    this.setData({
      modeInfo: presets.MODES[mode],
      greeting: dateUtil.greeting(now),
      dateLabel: dateUtil.fullDateLabel(now)
    })
  },

  onShow() {
    this.load()
  },

  onUnload() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
      this.saveTimer = null
      this.persist()
    }
  },

  load() {
    const that = this
    // 有未完成的保存时，等写入完成再读取，避免读到旧数据
    if (this.saveChain) {
      this.saveChain.then(function () {
        that.fetchPlan()
      })
    } else {
      this.fetchPlan()
    }
  },

  fetchPlan() {
    const that = this
    store.getPlan(this.date, this.mode)
      .then(function (plan) {
        that.tasks = plan && plan.tasks ? plan.tasks : []
        that.applyTasks()
      })
      .catch(function (err) {
        console.warn('读取今日任务失败', err)
        that.tasks = []
        that.applyTasks()
      })
  },

  applyTasks() {
    const tasks = this.tasks
    const total = tasks.length
    const doneCount = tasks.filter(function (task) { return task.done }).length
    const percent = total ? Math.round((doneCount / total) * 100) : 0

    this.setData({
      tasks: tasks,
      total: total,
      doneCount: doneCount,
      leftCount: total - doneCount,
      percent: percent,
      allDone: total > 0 && doneCount === total
    })
  },

  toggle(e) {
    const index = Number(e.currentTarget.dataset.index)
    const task = this.tasks[index]
    if (!task) return

    task.done = !task.done
    task.doneAt = task.done ? Date.now() : null

    this.applyTasks()
    this.queueSave()
  },

  queueSave() {
    const that = this
    if (this.saveTimer) clearTimeout(this.saveTimer)
    this.saveTimer = setTimeout(function () {
      that.saveTimer = null
      that.persist()
    }, 350)
  },

  persist() {
    if (!this.tasks.length) return
    const that = this
    // 串行写入，避免连续勾选时旧数据覆盖新数据
    const run = this.saveChain || Promise.resolve()
    this.saveChain = run.then(function () {
      return store.upsertPlan(that.date, that.mode, that.tasks)
    }).catch(function (err) {
      console.warn('保存今日进度失败', err)
      wx.showToast({ title: '进度保存失败，请检查云开发配置', icon: 'none', duration: 2500 })
    })
  },

  goAdjust() {
    wx.navigateTo({ url: '/pages/select/select?mode=' + this.mode + '&from=today' })
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/history?mode=' + this.mode })
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  }
})
