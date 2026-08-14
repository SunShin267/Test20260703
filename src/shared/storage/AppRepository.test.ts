import { AppRepository } from './AppRepository'
import { MemoryStorageAdapter } from './MemoryStorageAdapter'

describe('AppRepository', () => {
  it('persists updates through the adapter', () => {
    const adapter = new MemoryStorageAdapter()
    const repository = new AppRepository(adapter)

    repository.update(data => ({
      ...data,
      profiles: [{ id: 'p1', name: 'An', grade: 1, avatar: '🌱', createdAt: '', updatedAt: '', schemaVersion: 1 }],
      activeProfileId: 'p1',
    }))

    expect(repository.load().activeProfileId).toBe('p1')
  })

  it('removes persisted data when reset', () => {
    const adapter = new MemoryStorageAdapter()
    const repository = new AppRepository(adapter)
    repository.update(data => ({
      ...data,
      profiles: [{ id: 'p1', name: 'An', grade: 1, avatar: '🌱', createdAt: '', updatedAt: '', schemaVersion: 1 }],
      activeProfileId: 'p1',
    }))

    repository.reset()

    expect(repository.load().activeProfileId).toBeNull()
  })

  it('rejects updates that violate the app data contract', () => {
    const repository = new AppRepository(new MemoryStorageAdapter())

    expect(() => repository.update(data => ({ ...data, activeProfileId: 3 } as never))).toThrow()
  })
})
