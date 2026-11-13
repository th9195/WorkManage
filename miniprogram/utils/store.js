const PLANS = 'daily_plans'
const TEMPLATES = 'task_templates'

function db() {
  return wx.cloud.database()
}

function serverDate() {
  return db().serverDate()
}

// 读取某天某个模式下的计划
async function getPlan(date, mode) {
  const res = await db().collection(PLANS)
    .where({ date: date, mode: mode })
    .limit(1)
    .get()
  return res.data.length ? res.data[0] : null
}

// 新增或更新某天的计划
async function upsertPlan(date, mode, tasks) {
  const existing = await getPlan(date, mode)
  const done = tasks.filter(function (task) { return task.done }).length
  const data = {
    date: date,
    mode: mode,
    tasks: tasks,
    total: tasks.length,
    done: done,
    updatedAt: serverDate()
  }

  if (existing) {
    await db().collection(PLANS).doc(existing._id).update({ data: data })
    return existing._id
  }

  data.createdAt = serverDate()
  const res = await db().collection(PLANS).add({ data: data })
  return res._id
}

// 读取日期区间内的计划（小程序端单次最多 20 条，这里自动翻页）
async function listPlans(startDate, endDate, mode) {
  const command = db().command
  const where = {
    mode: mode,
    date: command.gte(startDate).and(command.lte(endDate))
  }
  const PAGE_SIZE = 20
  let list = []

  while (true) {
    const res = await db().collection(PLANS)
      .where(where)
      .orderBy('date', 'asc')
      .skip(list.length)
      .limit(PAGE_SIZE)
      .get()
    list = list.concat(res.data)
    if (res.data.length < PAGE_SIZE) break
  }

  return list
}

// 自定义任务模板
async function listTemplates(mode) {
  const res = await db().collection(TEMPLATES)
    .where({ mode: mode })
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get()
  return res.data
}

async function addTemplate(mode, name, emoji) {
  const exist = await db().collection(TEMPLATES)
    .where({ mode: mode, name: name })
    .limit(1)
    .get()
  if (exist.data.length) return exist.data[0]

  const data = {
    mode: mode,
    name: name,
    emoji: emoji || '⭐',
    createdAt: serverDate()
  }
  const res = await db().collection(TEMPLATES).add({ data: data })
  data._id = res._id
  return data
}

module.exports = {
  getPlan,
  upsertPlan,
  listPlans,
  listTemplates,
  addTemplate
}
