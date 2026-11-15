const dateUtil = require('../../utils/date')
const store = require('../../utils/store')
const presets = require('../../utils/presets')

// 本地预写缓冲：快速关闭页面时云端写入可能来不及，
// 先把最新任务落本地，下次打开再补同步到云端，保证不丢。
function bufferKey(date, mode) {
  return 'plan_buffer_' + mode + '_' + date
}

function writeBuffer(date, mode, tasks) {
  try {
    wx.setStorageSync(bufferKey(date, mode), {
      tasks: tasks,
      ts: Date.now()
    })
  } catch (e) {}
}

function readBuffer(date, mode) {
  try {
    return wx.getStorageSync(bufferKey(date, mode)) || null
  } catch (e) {
    return null
  }
}

function clearBuffer(date, mode) {
  try {
    wx.removeStorageSync(bufferKey(date, mode))
  } catch (e) {}
}

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
    this.saveChain = Promise.resolve()

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
    }
    // 立即触发一次云端保存；本地缓冲已在 toggle 时写入，即便这次没完成也不会丢
    this.persist()
  },

  load() {
    const that = this
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
    const date = this.date
    const mode = this.mode

    store.getPlan(date, mode)
      .then(function (plan) {
        let tasks = plan && plan.tasks ? plan.tasks : []

        // 检查本地缓冲：若存在且比云端数据新，则以缓冲为准并补写云端
        const buf = readBuffer(date, mode)
        if (buf && buf.tasks) {
          const planUpdated = plan && plan.updatedAt ? new Date(plan.updatedAt).getTime() : 0
          if (!planUpdated || buf.ts > planUpdated) {
            tasks = buf.tasks
            that.flushBuffer(tasks)
          } else {
            clearBuffer(date, mode)
          }
        }

        that.tasks = tasks
        that.applyTasks()
      })
      .catch(function (err) {
        console.warn('读取今日任务失败', err)
        // 云端读取失败时，回退到本地缓冲，保证用户看到自己的进度
        const buf = readBuffer(date, mode)
        that.tasks = buf && buf.tasks ? buf.tasks : []
        that.applyTasks()
        wx.showToast({ title: '云端读取失败，显示本地缓存', icon: 'none', duration: 2500 })
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

    // 立即写入本地缓冲，防止关闭页面时云端写入丢失
    writeBuffer(this.date, this.mode, this.tasks)

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

  flushBuffer(tasks) {
    const that = this
    const date = this.date
    const mode = this.mode
    return store.upsertPlan(date, mode, tasks)
      .then(function () {
        clearBuffer(date, mode)
      })
      .catch(function (err) {
        console.warn('缓冲补写云端失败', err)
      })
  },

  persist() {
    if (!this.tasks.length) return
    const that = this
    const tasks = this.tasks
    // 串行写入，避免连续勾选时旧数据覆盖新数据
    this.saveChain = this.saveChain.then(function () {
      return store.upsertPlan(that.date, that.mode, tasks)
    }).then(function () {
      clearBuffer(that.date, that.mode)
    }).catch(function (err) {
      console.warn('保存今日进度失败', err)
      wx.showToast({ title: '进度保存失败，已暂存本地', icon: 'none', duration: 2500 })
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
