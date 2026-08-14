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
})
