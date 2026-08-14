import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import type { AppRepository } from '../../shared/storage/AppRepository'

const goalSchema = z.object({
  sessions: z.number().int().min(1).max(14),
  questions: z.number().int().min(5).max(200),
})

export function WeeklyGoalForm({ repository, onSaved }: { repository: AppRepository; onSaved: () => void }) {
  const settings = repository.load().parentSettings
  const [sessions, setSessions] = useState(String(settings.weeklySessionGoal))
  const [questions, setQuestions] = useState(String(settings.weeklyQuestionGoal))
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = goalSchema.safeParse({ sessions: Number(sessions), questions: Number(questions) })
    if (!parsed.success) {
      setError('Mục tiêu buổi phải từ 1 đến 14; mục tiêu câu hỏi phải từ 5 đến 200.')
      return
    }
    repository.update(data => ({
      ...data,
      parentSettings: {
        ...data.parentSettings,
        weeklySessionGoal: parsed.data.sessions,
        weeklyQuestionGoal: parsed.data.questions,
        updatedAt: new Date().toISOString(),
      },
    }))
    setError('')
    onSaved()
  }

  return <section aria-labelledby="weekly-goal-heading">
    <h2 id="weekly-goal-heading">Mục tiêu hàng tuần</h2>
    <form onSubmit={submit} noValidate>
      <label>
        Mục tiêu số buổi mỗi tuần
        <input aria-label="Mục tiêu số buổi mỗi tuần" inputMode="numeric" min="1" max="14" type="number" value={sessions} onChange={event => setSessions(event.target.value)} />
      </label>
      <label>
        Mục tiêu số câu hỏi mỗi tuần
        <input aria-label="Mục tiêu số câu hỏi mỗi tuần" inputMode="numeric" min="5" max="200" type="number" value={questions} onChange={event => setQuestions(event.target.value)} />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit">Lưu mục tiêu</button>
    </form>
  </section>
}
