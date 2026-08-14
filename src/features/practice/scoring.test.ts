import { describe, expect, it } from 'vitest'
import type { PracticeSession } from '../../shared/model/types'
import { scoreAnswer, scoreSession } from './scoring'

describe('scoring', () => {
  it('scores normalized numeric answers', () => {
    expect(scoreAnswer(' 12 ', '12')).toBe(true)
    expect(scoreAnswer('12', '13')).toBe(false)
  })

  it('returns normalized per-question results and percentage', () => {
    const session: PracticeSession = {
      id: 'session-1',
      profileId: 'profile-1',
      topicId: 'add',
      questions: [
        { id: 'q1', topicId: 'add', prompt: '6 + 6', answer: '12', explanation: '', grade: 1, difficulty: 'easy' },
        { id: 'q2', topicId: 'add', prompt: '6 + 7', answer: '13', explanation: '', grade: 1, difficulty: 'easy' },
        { id: 'q3', topicId: 'add', prompt: '6 + 8', answer: '14', explanation: '', grade: 1, difficulty: 'easy' },
      ],
      answers: { q1: ' 12 ', q2: '15' },
      status: 'completed',
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:01:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:01:00.000Z',
      schemaVersion: 1,
    }

    expect(scoreSession(session)).toEqual({
      sessionId: 'session-1',
      correctCount: 1,
      totalCount: 3,
      scorePercent: 33,
      answers: [
        { questionId: 'q1', correct: true, expected: '12', actual: ' 12 ' },
        { questionId: 'q2', correct: false, expected: '13', actual: '15' },
        { questionId: 'q3', correct: false, expected: '14', actual: '' },
      ],
    })
  })
})
