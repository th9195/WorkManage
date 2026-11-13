const dateUtil = require('../../utils/date')
const store = require('../../utils/store')
const presets = require('../../utils/presets')

Page({
  data: {
    modeInfo: presets.MODES.adult,
    dateLabel: '',
    groups: [],
    customs: [],
    selected: [],
    customName: '',
    saving: false
  },

  onLoad(options) {
    const mode = options.mode === 'kid' ? 'kid' : 'adult'
    const date = options.date || dateUtil.formatDate(new Date())

    this.mode = mode
    this.date = date
    this.from = options.from || ''
    this.selected = []
    this.existingTasks = {}
    this.groups = JSON.parse(JSON.stringify(presets.PRESET_GROUPS[mode]))
    this.customs = []

    this.setData({
      modeInfo: presets.MODES[mode],
      dateLabel: dateUtil.fullDateLabel(dateUtil.parseDate(date))
    })

    this.load()
  },

  load() {
    const that = this
    Promise.all([store.getPlan(this.date, this.mode), store.listTemplates(this.mode)])
      .then(function (res) {
        const plan = res[0]
        const templates = res[1] || []

        if (plan && plan.tasks) {
          that.existingTasks = {}
          plan.tasks.forEach(function (task) {
            that.existingTasks[task.key] = task
          })
          that.selected = plan.tasks.map(function (task) {
            return { key: task.key, name: task.name, emoji: task.emoji, custom: !!task.custom }
          })
        }

        that.customs = templates.map(function (tpl) {
          return { key: 'c-' + tpl._id, name: tpl.name, emoji: tpl.emoji || '⭐', custom: true }
        })

        that.refresh()
      })
      .catch(function (err) {
        console.warn('读取任务失败', err)
        that.refresh()
      })
  },

  // 重新计算选中状态与可选项
  refresh() {
    const selectedMap = {}
    this.selected.forEach(function (item) {
      selectedMap[item.key] = true
    })

    const groups = this.groups.map(function (group) {
      return {
        title: group.title,
        items: group.items.map(function (item) {
          return {
            key: item.key,
            name: item.name,
            emoji: item.emoji,
            selected: !!selectedMap[item.key]
          }
        })
      }
    })

    const customs = this.customs.map(function (item) {
      return {
        key: item.key,
        name: item.name,
        emoji: item.emoji,
        selected: !!selectedMap[item.key]
      }
    })

    const catalog = {}
    this.groups.forEach(function (group) {
      group.items.forEach(function (item) {
        catalog[item.key] = { name: item.name, emoji: item.emoji, custom: false }
      })
    })
    this.customs.forEach(function (item) {
      catalog[item.key] = { name: item.name, emoji: item.emoji, custom: true }
    })
    this.catalog = catalog

    this.setData({ groups: groups, customs: customs, selected: this.selected })
  },

  toggle(e) {
    const key = e.currentTarget.dataset.key
    const index = this.selected.findIndex(function (item) {
      return item.key === key
    })

    if (index >= 0) {
      this.selected.splice(index, 1)
    } else {
      const item = this.catalog[key]
      if (!item) return
      this.selected.push({
        key: key,
        name: item.name,
        emoji: item.emoji,
        custom: !!item.custom
      })
    }

    this.refresh()
  },

  onCustomInput(e) {
    this.setData({ customName: e.detail.value })
  },

  addCustom() {
    const name = (this.data.customName || '').trim()
    if (!name) {
      wx.showToast({ title: '先写一件想做的事', icon: 'none' })
      return
    }

    const that = this
    const exist = this.customs.filter(function (item) {
      return item.name === name
    })[0]

    if (exist) {
      const picked = this.selected.filter(function (item) {
        return item.key === exist.key
      })[0]
      if (!picked) {
        this.selected.push({ key: exist.key, name: exist.name, emoji: exist.emoji, custom: true })
      }
      this.setData({ customName: '' })
      this.refresh()
      return
    }

    store.addTemplate(this.mode, name, '⭐')
      .then(function (tpl) {
        const key = 'c-' + tpl._id
        that.customs.unshift({ key: key, name: tpl.name, emoji: tpl.emoji || '⭐', custom: true })
        that.selected.push({ key: key, name: tpl.name, emoji: tpl.emoji || '⭐', custom: true })
        that.setData({ customName: '' })
        that.refresh()
      })
      .catch(function (err) {
        console.warn('保存自定义任务失败', err)
        // 模板保存失败时，仍允许当天使用
        const key = 'c-tmp-' + Date.now()
        that.customs.unshift({ key: key, name: name, emoji: '⭐', custom: true })
        that.selected.push({ key: key, name: name, emoji: '⭐', custom: true })
        that.setData({ customName: '' })
        that.refresh()
      })
  },

  save() {
    if (this.data.saving) return
    if (!this.selected.length) {
      wx.showToast({ title: '至少选一件想做的事', icon: 'none' })
      return
    }

    const that = this
    this.setData({ saving: true })

    const tasks = this.selected.map(function (item) {
      const old = that.existingTasks[item.key]
      if (old) {
        return {
          key: old.key,
          name: item.name,
          emoji: item.emoji,
          custom: !!old.custom,
          done: !!old.done,
          doneAt: old.doneAt || null
        }
      }
      return {
        key: item.key,
        name: item.name,
        emoji: item.emoji,
        custom: !!item.custom,
        done: false,
        doneAt: null
      }
    })

    store.upsertPlan(this.date, this.mode, tasks)
      .then(function () {
        if (that.from === 'today') {
          wx.navigateBack()
        } else {
          wx.redirectTo({ url: '/pages/today/today?mode=' + that.mode })
        }
      })
      .catch(function (err) {
        console.warn('保存计划失败', err)
        that.setData({ saving: false })
        wx.showToast({ title: '保存失败，请检查云开发配置', icon: 'none', duration: 2500 })
      })
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  }
})
