import type { Difficulty, Grade, Question } from '../../../shared/model/types'
import type { GeneratorInput, QuestionGenerator } from './types'

const gradeLimits: Record<Grade, number> = {
  1: 20,
  2: 1_000,
  3: 10_000,
  4: 100_000,
  5: 1_000_000,
  6: 10_000_000,
  7: 100_000_000,
  8: 1_000_000_000,
  9: 1_000_000_000,
  10: 1_000_000_000,
  11: 1_000_000_000,
  12: 1_000_000_000,
}

const difficultyFactor: Record<Difficulty, number> = { easy: 0.4, medium: 0.7, hard: 1 }

const rangeFor = ({ grade, difficulty }: GeneratorInput): number =>
  Math.max(2, Math.floor(gradeLimits[grade] * difficultyFactor[difficulty]))

const randomInt = (random: () => number, minimum: number, maximum: number): number =>
  minimum + Math.floor(Math.max(0, Math.min(0.999999999, random())) * (maximum - minimum + 1))

const question = (
  id: string,
  topicId: string,
  prompt: string,
  answer: string,
  explanation: string,
  input: GeneratorInput,
): Question => ({ id, topicId, prompt, answer, explanation, grade: input.grade, difficulty: input.difficulty })

const add: QuestionGenerator = {
  generate(input) {
    const maximum = rangeFor(input)
    const left = randomInt(input.random, 1, maximum)
    const right = randomInt(input.random, 1, maximum)
    return question(`add-${left}-${right}`, 'add', `${left} + ${right} = ?`, String(left + right), `${left} cộng ${right} bằng ${left + right}.`, input)
  },
}

const subtract: QuestionGenerator = {
  generate(input) {
    const maximum = rangeFor(input)
    const first = randomInt(input.random, 0, maximum)
    const second = randomInt(input.random, 0, maximum)
    const left = Math.max(first, second)
    const right = Math.min(first, second)
    return question(`subtract-${left}-${right}`, 'subtract', `${left} - ${right} = ?`, String(left - right), `${left} trừ ${right} bằng ${left - right}.`, input)
  },
}

const multiply: QuestionGenerator = {
  generate(input) {
    const factorMaximum = Math.max(2, Math.min(12, input.grade + (input.difficulty === 'hard' ? 7 : 4)))
    const left = randomInt(input.random, 2, factorMaximum)
    const right = randomInt(input.random, 2, factorMaximum)
    return question(`multiply-${left}-${right}`, 'multiply', `${left} × ${right} = ?`, String(left * right), `${left} nhân ${right} bằng ${left * right}.`, input)
  },
}

const divide: QuestionGenerator = {
  generate(input) {
    const factorMaximum = Math.max(2, Math.min(12, input.grade + (input.difficulty === 'hard' ? 7 : 4)))
    const divisor = randomInt(input.random, 2, factorMaximum)
    const quotient = randomInt(input.random, 1, factorMaximum)
    const dividend = divisor * quotient
    return question(`divide-${dividend}-${divisor}`, 'divide', `${dividend} ÷ ${divisor} = ?`, String(quotient), `${dividend} chia ${divisor} bằng ${quotient}.`, input)
  },
}

const numberSense: QuestionGenerator = {
  generate(input) {
    const maximum = Math.max(20, rangeFor(input))
    const value = randomInt(input.random, 1, maximum)
    return question(`number-sense-${value}`, 'number-sense', `Số liền sau của ${value} là số nào?`, String(value + 1), `Số liền sau ${value} là ${value + 1}.`, input)
  },
}

const counting: QuestionGenerator = {
  generate(input) {
    const value = randomInt(input.random, 1, Math.max(20, Math.min(100, rangeFor(input))))
    return question(`counting-${value}`, 'counting', `Đếm các ngôi sao: ${'★ '.repeat(value).trim()}. Có bao nhiêu ngôi sao?`, String(value), `Có ${value} ngôi sao.`, input)
  },
}

const compare: QuestionGenerator = {
  generate(input) {
    const maximum = rangeFor(input)
    const left = randomInt(input.random, 0, maximum)
    const right = randomInt(input.random, 0, maximum)
    const answer = left === right ? '=' : left > right ? '>' : '<'
    return question(`compare-${left}-${right}`, 'compare', `Điền dấu thích hợp: ${left} ? ${right}`, answer, `${left} ${answer} ${right}.`, input)
  },
}

const missingNumber: QuestionGenerator = {
  generate(input) {
    const maximum = rangeFor(input)
    const missing = randomInt(input.random, 0, maximum)
    const addend = randomInt(input.random, 1, maximum)
    return question(`missing-${missing}-${addend}`, 'missing-number', `? + ${addend} = ${missing + addend}`, String(missing), `${missing} cộng ${addend} bằng ${missing + addend}.`, input)
  },
}

const patterns: QuestionGenerator = {
  generate(input) {
    const start = randomInt(input.random, 1, Math.max(6, Math.floor(rangeFor(input) / 4)))
    const step = randomInt(input.random, 1, Math.max(2, input.grade + 2))
    return question(`pattern-${start}-${step}`, 'patterns', `Điền số còn thiếu: ${start}, ${start + step}, ${start + step * 2}, ?`, String(start + step * 3), `Mỗi lần tăng ${step}.`, input)
  },
}

const mixed: QuestionGenerator = {
  generate(input) {
    return input.random() < 0.5 ? add.generate(input) : subtract.generate(input)
  },
}

export const arithmeticGenerators: Record<string, QuestionGenerator> = {
  'number-sense': numberSense,
  counting,
  add,
  subtract,
  compare,
  'missing-number': missingNumber,
  patterns,
  multiply,
  divide,
  mixed,
}
