import type { CustomQuestion, Difficulty, Grade, QuestionBankQuery } from '../../shared/model/types'
import type { AppRepository } from '../../shared/storage/AppRepository'
import { TOPICS } from './topicCatalog'

export interface QuestionBank {
  list(query?: QuestionBankQuery): CustomQuestion[]
}

export type CustomQuestionInput = Pick<
  CustomQuestion,
  'topicId' | 'prompt' | 'answer' | 'explanation' | 'grade' | 'difficulty'
>

export class QuestionBankService implements QuestionBank {
  constructor(private readonly app: AppRepository) {}

  list(query: QuestionBankQuery = {}): CustomQuestion[] {
    return this.app.load().customQuestions
      .filter(question => (
        (query.topicId === undefined || question.topicId === query.topicId)
        && (query.grade === undefined || question.grade === query.grade)
        && (query.difficulty === undefined || question.difficulty === query.difficulty)
      ))
      .map(question => ({ ...question }))
  }

  add(input: CustomQuestionInput): CustomQuestion {
    const normalized = this.normalizeAndValidate(input)
    const timestamp = new Date().toISOString()
    const question: CustomQuestion = {
      ...normalized,
      id: crypto.randomUUID(),
      createdAt: timestamp,
      updatedAt: timestamp,
      schemaVersion: 1,
    }

    this.app.update(data => ({ ...data, customQuestions: [...data.customQuestions, question] }))
    return { ...question }
  }

  update(id: string, changes: Partial<CustomQuestionInput>): CustomQuestion {
    const current = this.app.load().customQuestions.find(question => question.id === id)
    if (!current) throw new Error('Không tìm thấy câu hỏi tùy chỉnh')

    const normalized = this.normalizeAndValidate({ ...current, ...changes })
    const updated: CustomQuestion = { ...current, ...normalized, updatedAt: new Date().toISOString() }
    this.app.update(data => ({
      ...data,
      customQuestions: data.customQuestions.map(question => question.id === id ? updated : question),
    }))
    return { ...updated }
  }

  remove(id: string): void {
    const existing = this.app.load().customQuestions.some(question => question.id === id)
    if (!existing) throw new Error('Không tìm thấy câu hỏi tùy chỉnh')
    this.app.update(data => ({
      ...data,
      customQuestions: data.customQuestions.filter(question => question.id !== id),
    }))
  }

  private normalizeAndValidate(input: CustomQuestionInput): CustomQuestionInput {
    const prompt = this.requiredText(input.prompt, 'Đề bài')
    const answer = this.requiredText(input.answer, 'Đáp án')
    const explanation = this.requiredText(input.explanation, 'Giải thích')
    const topic = TOPICS.find(candidate => candidate.id === input.topicId)
    if (!topic) throw new Error('Chủ đề chưa được đăng ký')
    if (!Number.isInteger(input.grade) || input.grade < 1 || input.grade > 12) {
      throw new Error('Lớp phải từ 1 đến 12')
    }
    if (input.grade < topic.minGrade || input.grade > topic.maxGrade) {
      throw new Error('Chủ đề không phù hợp với lớp')
    }
    if (!(['easy', 'medium', 'hard'] as const).includes(input.difficulty)) {
      throw new Error('Độ khó không hợp lệ')
    }

    return { ...input, prompt, answer, explanation, grade: input.grade as Grade }
  }

  private requiredText(value: string, label: string): string {
    const normalized = typeof value === 'string' ? value.trim() : ''
    if (!normalized) throw new Error(`${label} không được để trống`)
    return normalized
  }
}
