const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/

export function localCalendarDate(value: string | Date): string | null {
  if (typeof value === 'string' && dateOnlyPattern.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    const calendarDate = new Date(year, month - 1, day)
    return calendarDate.getFullYear() === year
      && calendarDate.getMonth() === month - 1
      && calendarDate.getDate() === day
      ? value
      : null
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
