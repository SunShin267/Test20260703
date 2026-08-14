import { describe, expect, it } from 'vitest'
import { calculateStreak } from './streakService'

describe('calculateStreak', () => {
  it('calculates a three-day streak ending today', () => {
    expect(calculateStreak(['2026-08-13', '2026-08-14', '2026-08-15'], '2026-08-15')).toBe(3)
  })

  it('deduplicates local calendar dates and stops at a missing day', () => {
    expect(calculateStreak([
      '2026-08-15',
      '2026-08-15T20:00:00.000+07:00',
      '2026-08-13',
      'invalid',
    ], '2026-08-15')).toBe(1)
  })

  it('does not count a streak that ended before today', () => {
    expect(calculateStreak(['2026-08-13', '2026-08-14'], '2026-08-15')).toBe(0)
  })

  it('ignores impossible calendar-only dates', () => {
    expect(calculateStreak(['2026-02-31'], '2026-02-31')).toBe(0)
  })

  it('rejects impossible ISO date-times before JavaScript normalizes them', () => {
    expect(calculateStreak(['2026-02-29T10:00:00.000Z'], '2026-03-01')).toBe(0)
    expect(calculateStreak(['2026-04-31T10:00:00.000Z'], '2026-05-01')).toBe(0)
    expect(calculateStreak(['2026-13-01T10:00:00.000Z'], '2026-01-01')).toBe(0)
  })
})
