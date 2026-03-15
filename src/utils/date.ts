import dayjs from 'dayjs'

// 格式化日期时间
export function formatDateTime(timestamp: number | string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!timestamp) return '-'
  return dayjs(timestamp).format(format)
}

// 格式化日期
export function formatDate(timestamp: number | string | Date): string {
  return formatDateTime(timestamp, 'YYYY-MM-DD')
}

// 格式化时间
export function formatTime(timestamp: number | string | Date): string {
  return formatDateTime(timestamp, 'HH:mm:ss')
}

// 相对时间
export function formatRelativeTime(timestamp: number | string | Date): string {
  if (!timestamp) return '-'
  const now = dayjs()
  const target = dayjs(timestamp)
  const diffMinutes = now.diff(target, 'minute')
  const diffHours = now.diff(target, 'hour')
  const diffDays = now.diff(target, 'day')

  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return formatDate(timestamp)
}

// 获取今日时间范围
export function getTodayRange(): [number, number] {
  const start = dayjs().startOf('day').valueOf()
  const end = dayjs().endOf('day').valueOf()
  return [start, end]
}

// 获取本周时间范围
export function getWeekRange(): [number, number] {
  const start = dayjs().startOf('week').valueOf()
  const end = dayjs().endOf('week').valueOf()
  return [start, end]
}

// 获取本月时间范围
export function getMonthRange(): [number, number] {
  const start = dayjs().startOf('month').valueOf()
  const end = dayjs().endOf('month').valueOf()
  return [start, end]
}