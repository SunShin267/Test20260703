import { describe, expect, it } from 'vitest'
import { generatorFor } from './generators/registry'
import type { GeneratorInput } from './generators/types'

const fixedRandom = (value: number): GeneratorInput['random'] => () => value

const numbersIn = (question: string) => (question.match(/\d+/g) ?? []).map(Number)

describe('math question generators', () => {
  it.each([
    [1, 20],
    [2, 1_000],
    [3, 10_000],
    [4, 100_000],
    [5, 1_000_000],
  ] as const)('keeps grade %i easy addition operands within %i', (grade, maximum) => {
    const question = generatorFor('add').generate({ grade, difficulty: 'easy', random: fixedRandom(0.999) })

    expect(numbersIn(question.prompt).every(number => number <= maximum)).toBe(true)
  })

  it('uses the injected random source deterministically', () => {
    const input = { grade: 3 as const, difficulty: 'medium' as const, random: fixedRandom(0.42) }

    expect(generatorFor('add').generate(input)).toEqual(generatorFor('add').generate(input))
  })

  it('never generates a subtraction question with a negative answer', () => {
    const question = generatorFor('subtract').generate({ grade: 5, difficulty: 'hard', random: fixedRandom(0.999) })
    const [left, right] = numbersIn(question.prompt)

    expect(left).toBeGreaterThanOrEqual(right)
    expect(Number(question.answer)).toBeGreaterThanOrEqual(0)
  })

  it('only generates divisions with integer answers', () => {
    const question = generatorFor('divide').generate({ grade: 5, difficulty: 'hard', random: fixedRandom(0.999) })
    const [dividend, divisor] = numbersIn(question.prompt)

    expect(dividend % divisor).toBe(0)
    expect(Number.isInteger(Number(question.answer))).toBe(true)
  })

  it('generates applied word questions through the same deterministic contract', () => {
    const input = { grade: 2 as const, difficulty: 'medium' as const, random: fixedRandom(0.3) }

    expect(generatorFor('word-add-subtract').generate(input)).toEqual(
      generatorFor('word-add-subtract').generate(input),
    )
  })
})
