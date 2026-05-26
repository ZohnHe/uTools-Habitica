import { marked } from 'marked'

export function markedText(text) {
  if (typeof text === 'undefined' || text == null) return ''
  return marked.parse(text, { sanitize: true, smartLists: true })
}

export function getColorByValue(value) {
  value = value ? Math.floor(value) : 0
  if (value >= 10) return '#438EB6'
  if (value >= 5) return '#339DA8'
  if (value > 0) return '#229F72'
  if (value === 0) return '#DDA146'
  if (value > -10) return '#DF7C39'
  return '#C64F53'
}

export function getDateReminder(now, date) {
  if (!date) return null
  const diff = Math.floor((new Date(date).getTime() - now.getTime()) / 1000 / 60 / 60 / 24) + 1
  if (diff > 0) return `还剩 ${diff} 天`
  if (diff < 0) return `超时 ${Math.abs(diff)} 天`
  return '期限为今日'
}

export function ellipsisName(value) {
  if (!value) return ''
  if (/^[A-Za-z0-9]+$/.test(value)) {
    return value.length < 15 ? value : value.slice(0, 13) + '...'
  }
  return value.length < 8 ? value : value.slice(0, 6) + '...'
}

export function ellipsisUserName(value) {
  if (!value) return ''
  if (value.length < 8) return value
  return value.slice(0, 7) + '...'
}
