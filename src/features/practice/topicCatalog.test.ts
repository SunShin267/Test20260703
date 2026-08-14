import { describe, expect, it } from 'vitest'
import { TOPICS, topicsForGrade } from './topicCatalog'
import { generatorFor, registerGenerator } from './generators/registry'
import type { QuestionGenerator } from './generators/types'

describe('topic catalog', () => {
  it('offers at least 15 topics and supports every grade 1–5', () => {
    expect(TOPICS.length).toBeGreaterThanOrEqual(15)

    for (const grade of [1, 2, 3, 4, 5] as const) {
      expect(topicsForGrade(grade).length).toBeGreaterThan(0)
    }
  })

  it('keeps the required topic IDs available to the UI', () => {
    expect(TOPICS.map(topic => topic.id)).toEqual(expect.arrayContaining([
      'number-sense', 'counting', 'add', 'subtract', 'compare', 'missing-number',
      'patterns', 'multiply', 'divide', 'word-add-subtract', 'word-multiply-divide',
      'fractions', 'length', 'mass', 'time', 'geometry', 'perimeter-area', 'mixed',
    ]))
  })

  it('can register a future grade-12 generator without changing UI code', () => {
    const fakeGenerator: QuestionGenerator = {
      generate: () => ({
        id: 'quadratic-1',
        topicId: 'quadratic-equation',
        prompt: 'x² = 1',
        answer: '1',
        explanation: 'x = 1',
        grade: 12,
        difficulty: 'easy',
      }),
    }

    registerGenerator('quadratic-equation', fakeGenerator)

    expect(generatorFor('quadratic-equation')).toBe(fakeGenerator)
  })
})
