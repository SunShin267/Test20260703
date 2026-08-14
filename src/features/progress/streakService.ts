const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/
const isoCalendarPrefix = /^(\d{4})-(\d{2})-(\d{2})(?:T|$)/

function hasValidCalendarDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1) return false
  const daysInMonth = month === 2
    ? (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28)
    : [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]
  return day <= daysInMonth
}

export function localCalendarDate(value: string | Date): string | null {
  if (typeof value === 'string') {
    const calendarParts = value.match(isoCalendarPrefix)
    if (calendarParts) {
      const [, yearText, monthText, dayText] = calendarParts
      if (!hasValidCalendarDate(Number(yearText), Number(monthText), Number(dayText))) return null
    }
    if (dateOnlyPattern.test(value)) return value
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function previousLocalCalendarDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const previous = new Date(year, month - 1, day)
  previous.setDate(previous.getDate() - 1)
  return localCalendarDate(previous)!
}

export function calculateStreak(completedDates: string[], today: string): number {
  const todayDate = localCalendarDate(today)
  if (!todayDate) return 0

  const completedDays = new Set(completedDates
    .map(localCalendarDate)
    .filter((date): date is string => date !== null))

  let streak = 0
  let day = todayDate
  while (completedDays.has(day)) {
    streak += 1
    day = previousLocalCalendarDate(day)
  }
  return streak
}
