import type { ProgressDay } from '../../shared/model/types'

interface WeeklyActivityProps {
  days: ProgressDay[]
}

export function WeeklyActivity({ days }: WeeklyActivityProps) {
  return (
    <section aria-label="Hoạt động 7 ngày gần đây">
      <h2>Hoạt động 7 ngày gần đây</h2>
      <ul>
        {days.map(day => (
          <li key={day.date}>
            <strong>{day.date}</strong>: {day.sessions} buổi, {day.questions} câu, {day.correct} câu đúng
          </li>
        ))}
      </ul>
    </section>
  )
}
