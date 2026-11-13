const dateUtil = require('../../utils/date')
const store = require('../../utils/store')
const presets = require('../../utils/presets')

const CHART_HEIGHT = 200
const MONTH_COL_WIDTH = 46

Page({
  data: {
    mode: 'adult',
    view: 'week',
    modeInfo: presets.MODES.adult,
    rangeLabel: '',
    cols: [],
    stats: { done: 0, total: 0, rate: 0, days: 0 },
    axisMax: 1,
    axisMid: '0.5',
    hasData: false,
    canNext: false,
    scrollInto: '',
    plotWidth: 0,
    loading: true
  },

  onLoad(options) {
    const mode = options.mode === 'kid' ? 'kid' : 'adult'
    this.mode = mode
    this.view = 'week'
    this.anchor = new Date()

    this.setData({
      mode: mode,
      modeInfo: presets.MODES[mode]
    })

    this.load()
  },

  switchMode(e) {
    const mode = e.currentTarget.dataset.mode
    if (mode === this.mode) return
    this.mode = mode
    this.setData({ mode: mode, modeInfo: presets.MODES[mode] })
    this.load()
  },

  switchView(e) {
    const view = e.currentTarget.dataset.view
    if (view === this.view) return
    this.view = view
    this.anchor = new Date()
    this.setData({ view: view })
    this.load()
  },

  prev() {
    this.shift(-1)
  },

  next() {
    if (!this.data.canNext) return
    this.shift(1)
  },

  shift(delta) {
    if (this.view === 'week') {
      this.anchor = dateUtil.addDays(this.anchor, delta * 7)
    } else {
      this.anchor = dateUtil.addMonths(this.anchor, delta)
    }
    this.load()
  },

  load() {
    const that = this
    const days = this.view === 'week'
      ? dateUtil.daysOfWeek(this.anchor)
      : dateUtil.daysOfMonth(this.anchor)
    const startKey = dateUtil.formatDate(days[0])
    const endKey = dateUtil.formatDate(days[days.length - 1])
    const todayKey = dateUtil.formatDate(new Date())

    this.setData({ loading: true })

    store.listPlans(startKey, endKey, this.mode)
      .then(function (plans) {
        that.render(days, plans || [], todayKey)
      })
      .catch(function (err) {
        console.warn('读取历史记录失败', err)
        that.render(days, [], todayKey)
        wx.showToast({ title: '历史记录读取失败，请检查云开发配置', icon: 'none' })
      })
  },

  render(days, plans, todayKey) {
    const planMap = {}
    plans.forEach(function (plan) {
      planMap[plan.date] = plan
    })

    let maxTotal = 0
    days.forEach(function (day) {
      const plan = planMap[dateUtil.formatDate(day)]
      if (plan && plan.total > maxTotal) maxTotal = plan.total
    })

    const axisMax = Math.max(maxTotal, 1)
    const scale = CHART_HEIGHT / axisMax
    const view = this.view

    let doneSum = 0
    let totalSum = 0
    let checkinDays = 0
    let hasData = false

    const cols = days.map(function (day) {
      const key = dateUtil.formatDate(day)
      const plan = planMap[key]
      const total = plan && plan.total ? plan.total : 0
      const done = plan && plan.done ? plan.done : 0
      const undone = Math.max(total - done, 0)

      if (total > 0) {
        hasData = true
        checkinDays += 1
        doneSum += done
        totalSum += total
      }

      return {
        date: key,
        dateLabel: view === 'week'
          ? (day.getMonth() + 1) + '/' + day.getDate()
          : String(day.getDate()),
        weekLabel: view === 'week'
          ? dateUtil.weekdayLabel(day)
          : dateUtil.weekdayShort(day),
        total: total,
        done: done,
        undone: undone,
        doneH: Math.round(done * scale),
        undoneH: Math.round(undone * scale),
        isToday: key === todayKey
      }
    })

    const axisMid = axisMax / 2
    const midLabel = axisMid % 1 === 0 ? String(axisMid) : axisMid.toFixed(1)
    const lastKey = dateUtil.formatDate(days[days.length - 1])
    const today = new Date()
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    let rangeLabel = ''
    if (view === 'week') {
      const first = days[0]
      const last = days[days.length - 1]
      const sameMonth = first.getMonth() === last.getMonth()
      const body = sameMonth
        ? (first.getMonth() + 1) + '月' + first.getDate() + '日 - ' + last.getDate() + '日'
        : (first.getMonth() + 1) + '月' + first.getDate() + '日 - ' + (last.getMonth() + 1) + '月' + last.getDate() + '日'
      rangeLabel = first.getFullYear() === today.getFullYear()
        ? body
        : first.getFullYear() + '年' + body
    } else {
      rangeLabel = days[0].getFullYear() + '年' + (days[0].getMonth() + 1) + '月'
    }

    this.setData({
      rangeLabel: rangeLabel,
      cols: cols,
      stats: {
        done: doneSum,
        total: totalSum,
        rate: totalSum ? Math.round((doneSum / totalSum) * 100) : 0,
        days: checkinDays
      },
      axisMax: axisMax,
      axisMid: midLabel,
      hasData: hasData,
      canNext: lastKey < todayKey,
      plotWidth: days.length * MONTH_COL_WIDTH,
      scrollInto: '',
      loading: false
    })

    if (view === 'month' && days[0] <= todayDate && todayDate <= days[days.length - 1]) {
      const that = this
      setTimeout(function () {
        that.setData({ scrollInto: 'd-' + todayKey })
      }, 80)
    }
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  }
})
