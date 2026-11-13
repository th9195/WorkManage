const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const WEEKDAY_SHORT = ['日', '一', '二', '三', '四', '五', '六']

function pad(n) {
  return n < 10 ? '0' + n : String(n)
}

function formatDate(date) {
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
}

function parseDate(str) {
  const parts = str.split('-')
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
}

function addDays(date, n) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  result.setDate(result.getDate() + n)
  return result
}

// 返回目标月份 1 号
function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1)
}

function startOfWeek(date) {
  const day = date.getDay() === 0 ? 7 : date.getDay()
  return addDays(date, 1 - day)
}

function endOfWeek(date) {
  return addDays(startOfWeek(date), 6)
}

function daysOfWeek(date) {
  const start = startOfWeek(date)
  const days = []
  for (let i = 0; i < 7; i += 1) {
    days.push(addDays(start, i))
  }
  return days
}

function daysOfMonth(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const last = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let i = 1; i <= last; i += 1) {
    days.push(new Date(year, month, i))
  }
  return days
}

function weekdayLabel(date) {
  return WEEKDAYS[date.getDay()]
}

function weekdayShort(date) {
  return WEEKDAY_SHORT[date.getDay()]
}

function monthDayLabel(date) {
  return (date.getMonth() + 1) + '月' + date.getDate() + '日'
}

function fullDateLabel(date) {
  return monthDayLabel(date) + ' ' + weekdayLabel(date)
}

function greeting(date) {
  const hour = date.getHours()
  if (hour < 5) return '夜深了'
  if (hour < 11) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

module.exports = {
  formatDate,
  parseDate,
  addDays,
  addMonths,
  startOfWeek,
  endOfWeek,
  daysOfWeek,
  daysOfMonth,
  weekdayLabel,
  weekdayShort,
  monthDayLabel,
  fullDateLabel,
  greeting
}
