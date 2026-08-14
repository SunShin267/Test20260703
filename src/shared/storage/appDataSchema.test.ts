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

  it('preserves a valid unversioned active profile and otherwise selects the first migrated profile', () => {
    const profiles = [
      { id: 'p1', name: 'An', grade: 1 },
      { id: 'p2', name: 'Bình', grade: 2 },
    ]

    expect(parseAndMigrate(JSON.stringify({ profiles, activeProfileId: 'p2' })).activeProfileId).toBe('p2')
    expect(parseAndMigrate(JSON.stringify({ profiles, activeProfileId: 'missing' })).activeProfileId).toBe('p1')
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

  const account = {
    username: 'family', passwordSalt: 'salt', passwordHash: 'hash',
    createdAt: '2026-08-15T00:00:00.000Z', updatedAt: '2026-08-15T00:00:00.000Z', schemaVersion: 1 as const,
  }
  const profile = {
    id: 'p1', name: 'An', grade: 1 as const, avatar: '🌱',
    createdAt: '2026-08-15T00:00:00.000Z', updatedAt: '2026-08-15T00:00:00.000Z', schemaVersion: 1 as const,
  }
  const session = {
    id: 's1', profileId: 'p1', topicId: 'add',
    questions: [{ id: 'q1', topicId: 'add', prompt: '1 + 1 = ?', answer: '2', explanation: 'Cộng.', grade: 1 as const, difficulty: 'easy' as const }],
    answers: { q1: '2' }, status: 'completed' as const, startedAt: '2026-08-15T00:00:00.000Z',
    completedAt: '2026-08-15T00:01:00.000Z', createdAt: '2026-08-15T00:00:00.000Z',
    updatedAt: '2026-08-15T00:01:00.000Z', schemaVersion: 1 as const,
  }
  const customQuestion = {
    id: 'custom-1', topicId: 'add', prompt: '2 + 2 = ?', answer: '4', explanation: 'Cộng.',
    grade: 1 as const, difficulty: 'easy' as const, createdAt: '2026-08-15T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z', schemaVersion: 1 as const,
  }

  it('quarantines a malformed current profile while retaining the valid family account and active profile', () => {
    const current = createDefaultAppData()
    const data = parseAndMigrate(JSON.stringify({
      ...current,
      account,
      profiles: [profile, { ...profile, id: 'broken', grade: 9 }],
      activeProfileId: 'broken',
      parentSettings: { ...current.parentSettings, weeklySessionGoal: 7 },
    }))

    expect(data.account).toEqual(account)
    expect(data.profiles).toEqual([profile])
    expect(data.activeProfileId).toBe('p1')
    expect(data.parentSettings.weeklySessionGoal).toBe(7)
  })

  it('quarantines malformed and orphaned current sessions while retaining valid history and settings', () => {
    const current = createDefaultAppData()
    const data = parseAndMigrate(JSON.stringify({
      ...current,
      account,
      profiles: [profile],
      activeProfileId: 'p1',
      sessions: [session, { ...session, id: '' }, { ...session, id: 'orphan', profileId: 'missing' }],
      printSettings: { ...current.printSettings, includeDate: false },
    }))

    expect(data.account).toEqual(account)
    expect(data.sessions).toEqual([session])
    expect(data.printSettings.includeDate).toBe(false)
  })

  it('quarantines malformed custom questions and defaults only malformed setting fields', () => {
    const current = createDefaultAppData()
    const data = parseAndMigrate(JSON.stringify({
      ...current,
      account,
      profiles: [profile],
      activeProfileId: 'p1',
      customQuestions: [customQuestion, { ...customQuestion, id: 'broken', prompt: '   ' }],
      parentSettings: { ...current.parentSettings, failedPinAttempts: 'bad', weeklySessionGoal: 9 },
    }))

    expect(data.account).toEqual(account)
    expect(data.customQuestions).toEqual([customQuestion])
    expect(data.parentSettings.failedPinAttempts).toBe(0)
    expect(data.parentSettings.weeklySessionGoal).toBe(9)
  })
})
