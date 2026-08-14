import { describe, expect, it } from 'vitest'
import { PracticeService } from './practiceService'
import { AppRepository } from '../../shared/storage/AppRepository'
import { MemoryStorageAdapter } from '../../shared/storage/MemoryStorageAdapter'

const clock = (() => {
  let value = 0
  return () => `2026-08-15T00:00:${String(value++).padStart(2, '0')}.000Z`
})()

const createService = () => {
  const repository = new AppRepository(new MemoryStorageAdapter())
  repository.update(data => ({
    ...data,
    profiles: [{
      id: 'profile-1',
      name: 'Bình',
      grade: 1,
      avatar: '🌱',
      createdAt: '2026-08-15T00:00:00.000Z',
      updatedAt: '2026-08-15T00:00:00.000Z',
      schemaVersion: 1,
    }],
  }))
  const service = new PracticeService(repository, { random: (() => {
    let value = 0
    return () => (value++ % 97) / 97
  })(), now: clock })
  return { repository, service }
}

describe('PracticeService', () => {
  it('uses the child profile grade and rejects topics outside that grade', () => {
    const { repository, service } = createService()
    repository.update(data => ({
      ...data,
      profiles: [{
        id: 'profile-5',
        name: 'An',
        grade: 5,
        avatar: '🌱',
        createdAt: '2026-08-15T00:00:00.000Z',
        updatedAt: '2026-08-15T00:00:00.000Z',
        schemaVersion: 1,
      }],
    }))

    expect(service.createSession('profile-5', 'add', 'easy', 5).questions.every(question => question.grade === 5)).toBe(true)
    expect(() => service.createSession('profile-5', 'counting', 'easy', 5)).toThrow('không phù hợp')

    repository.update(data => ({
      ...data,
      profiles: data.profiles.map(profile => profile.id === 'profile-5' ? { ...profile, grade: 1 } : profile),
    }))
    expect(() => service.createSession('profile-5', 'multiply', 'easy', 5)).toThrow('không phù hợp')
  })

  it.each([5, 10, 15] as const)('creates and persists a %i-question draft with unique questions', count => {
    const { repository, service } = createService()
    const session = service.createSession('profile-1', 'add', 'easy', count)

    expect(session.questions).toHaveLength(count)
    expect(new Set(session.questions.map(question => question.prompt)).size).toBe(count)
    expect(repository.load().sessions).toEqual([session])
  })

  it('rejects a session count outside the supported choices', () => {
    const { service } = createService()

    expect(() => service.createSession('profile-1', 'add', 'easy', 6 as never)).toThrow('5, 10 hoặc 15')
  })

  it('updates an answer and resumes the latest draft for a profile', () => {
    const { service } = createService()
    const draft = service.createSession('profile-1', 'add', 'easy', 5)
    const updated = service.answer(draft.id, draft.questions[0].id, '  4 ')

    expect(updated.answers[draft.questions[0].id]).toBe('  4 ')
    expect(updated.updatedAt).not.toBe(draft.updatedAt)
    expect(service.resumeDraft('profile-1')?.id).toBe(draft.id)
  })

  it('completes idempotently without adding duplicate history', () => {
    const { repository, service } = createService()
    const draft = service.createSession('profile-1', 'add', 'easy', 5)
    service.answer(draft.id, draft.questions[0].id, draft.questions[0].answer)

    const first = service.complete(draft.id)
    const second = service.complete(draft.id)

    expect(second).toEqual(first)
    expect(repository.load().sessions).toHaveLength(1)
    expect(repository.load().sessions[0]).toMatchObject({ status: 'completed', completedAt: expect.any(String) })
    expect(service.resumeDraft('profile-1')).toBeNull()
  })
})
