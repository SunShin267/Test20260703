import { describe, expect, it } from 'vitest'
import type { PracticeSession } from '../../shared/model/types'
import { recommendTopic, summarizeProgress } from './progressService'

const TOPICS = [
  { id: 'add', name: 'Phép cộng', icon: '➕', minGrade: 1, maxGrade: 5, category: 'arithmetic', generatorId: 'add' },
  { id: 'subtract', name: 'Phép trừ', icon: '➖', minGrade: 1, maxGrade: 5, category: 'arithmetic', generatorId: 'subtract' },
] as const

function session(options: {
  id: string
  profileId?: string
  topicId?: string
  answers?: Record<string, string>
  completedAt?: string | null
  status?: 'draft' | 'completed'
  questionCount?: number
}): PracticeSession {
  const questionCount = options.questionCount ?? 2
  const topicId = options.topicId ?? 'add'
  const status = options.status ?? 'completed'
  const completedAt = options.completedAt ?? '2026-08-15T10:00:00.000Z'
  const questions = Array.from({ length: questionCount }, (_, index) => ({
    id: `${options.id}-q${index + 1}`,
    topicId,
    prompt: `Câu ${index + 1}`,
    answer: String(index + 1),
    explanation: '',
    grade: 1 as const,
    difficulty: 'easy' as const,
  }))

  return {
    id: options.id,
    profileId: options.profileId ?? 'p1',
    topicId,
    questions,
    answers: options.answers ?? {},
    status,
    startedAt: '2026-08-15T09:00:00.000Z',
    completedAt,
    createdAt: '2026-08-15T09:00:00.000Z',
    updatedAt: '2026-08-15T10:00:00.000Z',
    schemaVersion: 1,
  }
}

describe('summarizeProgress', () => {
  it('aggregates only completed sessions for the requested profile into seven local days', () => {
    const summary = summarizeProgress('p1', [
      session({ id: 'add', answers: { 'add-q1': '1', 'add-q2': 'wrong' }, completedAt: '2026-08-15T10:00:00.000Z' }),
      session({ id: 'subtract', topicId: 'subtract', answers: { 'subtract-q1': 'wrong', 'subtract-q2': 'wrong' }, completedAt: '2026-08-10T10:00:00.000Z' }),
      session({ id: 'old', answers: { 'old-q1': '1', 'old-q2': '2' }, completedAt: '2026-08-08T10:00:00.000Z' }),
      session({ id: 'draft', status: 'draft', completedAt: null }),
      session({ id: 'other-child', profileId: 'p2', answers: { 'other-child-q1': '1', 'other-child-q2': '2' } }),
    ], '2026-08-15')

    expect(summary).toMatchObject({
      profileId: 'p1',
      totalSessions: 3,
      totalQuestions: 6,
      accuracy: 50,
      strongestTopicId: 'add',
      weakestTopicId: 'subtract',
      byTopic: {
        add: { attempts: 4, correct: 3, accuracy: 75 },
        subtract: { attempts: 2, correct: 0, accuracy: 0 },
      },
    })
    expect(summary.weekly).toEqual([
      { date: '2026-08-09', sessions: 0, questions: 0, correct: 0 },
      { date: '2026-08-10', sessions: 1, questions: 2, correct: 0 },
      { date: '2026-08-11', sessions: 0, questions: 0, correct: 0 },
      { date: '2026-08-12', sessions: 0, questions: 0, correct: 0 },
      { date: '2026-08-13', sessions: 0, questions: 0, correct: 0 },
      { date: '2026-08-14', sessions: 0, questions: 0, correct: 0 },
      { date: '2026-08-15', sessions: 1, questions: 2, correct: 1 },
    ])
  })

  it('uses local calendar boundaries for ISO timestamps rather than UTC date strings', () => {
    const summary = summarizeProgress('p1', [
      session({ id: 'boundary', answers: { 'boundary-q1': '1' }, completedAt: '2026-08-15T00:30:00+07:00' }),
    ], '2026-08-15')

    expect(summary.weekly.at(-1)).toMatchObject({ date: '2026-08-15', sessions: 1, questions: 2, correct: 1 })
  })

  it('breaks accuracy ties by topic id and never chooses an unattempted topic', () => {
    const summary = summarizeProgress('p1', [
      session({ id: 'add', answers: { 'add-q1': '1' } }),
      session({ id: 'subtract', topicId: 'subtract', answers: { 'subtract-q1': '1' } }),
    ], '2026-08-15')

    expect(summary.strongestTopicId).toBe('add')
    expect(summary.weakestTopicId).toBe('add')
    expect(recommendTopic(summary, [...TOPICS])).toMatchObject({ id: 'add' })
  })

  it('recommends the attempted topic with the lowest accuracy and returns null without attempts', () => {
    const summary = summarizeProgress('p1', [
      session({ id: 'add', answers: { 'add-q1': '1', 'add-q2': '2' } }),
      session({ id: 'subtract', topicId: 'subtract', answers: { 'subtract-q1': 'wrong', 'subtract-q2': 'wrong' } }),
    ], '2026-08-15')

    expect(recommendTopic(summary, [...TOPICS])?.id).toBe('subtract')
    expect(recommendTopic(summarizeProgress('p1', [], '2026-08-15'), [...TOPICS])).toBeNull()
  })
})
