const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const COLLECTIONS = ['daily_plans', 'task_templates']

exports.main = async () => {
  if (typeof db.createCollection !== 'function') {
    return {
      ok: false,
      message: '当前 wx-server-sdk 版本不支持自动建表，请在云开发控制台手动创建 daily_plans 与 task_templates 集合'
    }
  }

  const result = {}
  for (let i = 0; i < COLLECTIONS.length; i += 1) {
    const name = COLLECTIONS[i]
    try {
      await db.createCollection(name)
      result[name] = 'created'
    } catch (err) {
      result[name] = 'exists'
    }
  }

  return { ok: true, result: result }
}
