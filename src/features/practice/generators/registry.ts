import { appliedMathGenerators } from './appliedMath'
import { arithmeticGenerators } from './arithmetic'
import type { QuestionGenerator } from './types'

const registry = new Map<string, QuestionGenerator>([
  ...Object.entries(arithmeticGenerators),
  ...Object.entries(appliedMathGenerators),
])

export const registerGenerator = (id: string, generator: QuestionGenerator): void => {
  registry.set(id, generator)
}

export const generatorFor = (id: string): QuestionGenerator => {
  const generator = registry.get(id)
  if (!generator) throw new Error(`Không có bộ tạo câu hỏi: ${id}`)
  return generator
}
