import { createDefaultAppData, parseAndMigrate } from './appDataSchema'

describe('parseAndMigrate', () => {
  it('returns valid defaults for corrupted storage', () => {
    expect(parseAndMigrate('{broken')).toEqual(createDefaultAppData())
  })

  it('migrates an unversioned profile into schema v1', () => {
    const data = parseAndMigrate(JSON.stringify({
      profiles: [{ id: 'p1', name: 'An', grade: 3 }],
    }))

    expect(data.schemaVersion).toBe(1)
    expect(data.profiles[0]).toMatchObject({ id: 'p1', name: 'An', grade: 3 })
  })

  it('drops invalid legacy profiles while preserving valid ones', () => {
    const data = parseAndMigrate(JSON.stringify({
      profiles: [
        { id: 'p1', name: 'An', grade: 3 },
        { id: 'p2', name: 'Bình', grade: 6 },
      ],
    }))

    expect(data.profiles).toHaveLength(1)
    expect(data.profiles[0]).toMatchObject({ id: 'p1', name: 'An', grade: 3 })
  })

  it('reads existing schema v1 data without custom questions as an empty question bank', () => {
    const existing = {
      ...createDefaultAppData(),
      profiles: [{
        id: 'profile-1', name: 'Bình', grade: 1 as const, avatar: '🌱',
        createdAt: '2026-08-15T00:00:00.000Z', updatedAt: '2026-08-15T00:00:00.000Z', schemaVersion: 1 as const,
      }],
      activeProfileId: 'profile-1',
    }
    const { customQuestions: _, ...schemaV1WithoutQuestionBank } = existing

    const data = parseAndMigrate(JSON.stringify(schemaV1WithoutQuestionBank))

    expect(data).toMatchObject({ activeProfileId: 'profile-1', profiles: [{ id: 'profile-1', name: 'Bình' }] })
    expect(data.customQuestions).toEqual([])
  })
})
