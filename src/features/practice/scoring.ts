import type { PracticeSession, SessionResult } from '../../shared/model/types'

const normalizeAnswer = (value: string): string => {
  const trimmed = value.trim()
  if (trimmed === '') return ''

  const numeric = Number(trimmed)
  return Number.isFinite(numeric) ? String(numeric) : trimmed.toLocaleLowerCase('vi-VN')
}

export const scoreAnswer = (actual: string, expected: string): boolean =>
  normalizeAnswer(actual) === normalizeAnswer(expected)

export const scoreSession = (session: PracticeSession): SessionResult => {
  const answers = session.questions.map(question => {
    const actual = session.answers[question.id] ?? ''
    return {
      questionId: question.id,
      correct: scoreAnswer(actual, question.answer),
      expected: question.answer,
      actual,
    }
  })
  const correctCount = answers.filter(answer => answer.correct).length

  return {
    sessionId: session.id,
    correctCount,
    totalCount: answers.length,
    scorePercent: answers.length === 0 ? 0 : Math.round((correctCount / answers.length) * 100),
    answers,
  }
}
