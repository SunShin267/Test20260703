import { describe, expect, it } from 'vitest'
import { MemoryStorageAdapter } from '../../shared/storage/MemoryStorageAdapter'
import { AppRepository } from '../../shared/storage/AppRepository'
import { ProfileService } from './profileService'

describe('ProfileService', () => {
  it('creates and selects two independent profiles', () => {
    const service = new ProfileService(new AppRepository(new MemoryStorageAdapter()))

    const an = service.create({ name: 'An', grade: 1, avatar: '🌱' })
    const binh = service.create({ name: 'Bình', grade: 5, avatar: '🚀' })
    service.select(binh.id)

    expect(service.list()).toHaveLength(2)
    expect(service.getActive()?.id).toBe(binh.id)
    expect(an.grade).toBe(1)
  })

  it('trims names and rejects unsupported grades', () => {
    const service = new ProfileService(new AppRepository(new MemoryStorageAdapter()))

    expect(service.create({ name: '  An  ', grade: 1, avatar: '🌱' }).name).toBe('An')
    expect(() => service.create({ name: 'Bình', grade: 6 as 1, avatar: '🚀' })).toThrow('Hồ sơ chưa hợp lệ')
  })

  it('removes a profile sessions and selects the next profile', () => {
    const repository = new AppRepository(new MemoryStorageAdapter())
    const service = new ProfileService(repository)
    const an = service.create({ name: 'An', grade: 1, avatar: '🌱' })
    const binh = service.create({ name: 'Bình', grade: 2, avatar: '🚀' })

    repository.update(data => ({
      ...data,
      sessions: [{
        id: 'an-session', profileId: an.id, topicId: 'addition', questions: [], answers: {}, status: 'draft',
        startedAt: '2026-08-15T00:00:00.000Z', completedAt: null, createdAt: '2026-08-15T00:00:00.000Z',
        updatedAt: '2026-08-15T00:00:00.000Z', schemaVersion: 1,
      }],
    }))

    service.remove(an.id)

    expect(repository.load().sessions).toEqual([])
    expect(service.getActive()?.id).toBe(binh.id)
  })

  it('rejects removal of the last profile unless allowEmpty is set', () => {
    const service = new ProfileService(new AppRepository(new MemoryStorageAdapter()))
    const an = service.create({ name: 'An', grade: 1, avatar: '🌱' })

    expect(() => service.remove(an.id)).toThrow('Cần giữ lại ít nhất một hồ sơ')
    service.remove(an.id, { allowEmpty: true })

    expect(service.getActive()).toBeNull()
  })
})
