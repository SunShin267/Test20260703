import type { Difficulty, Grade, Question } from '../../../shared/model/types'

export interface GeneratorInput {
  grade: Grade
  difficulty: Difficulty
  random: () => number
}

export interface QuestionGenerator {
  generate(input: GeneratorInput): Question
}
