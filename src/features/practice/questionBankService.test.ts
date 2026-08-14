import { describe, expect, it, vi } from 'vitest'
import { AppRepository } from '../../shared/storage/AppRepository'
import { MemoryStorageAdapter } from '../../shared/storage/MemoryStorageAdapter'
import { LocalQuestionBankService, type QuestionBankService } from './questionBankService'

const question = {
  topicId: 'add',
  prompt: '2 + 3 = ?',
  answer: '5',
  explanation: 'Cộng 2 với 3 được 5.',
  grade: 1 as const,
  difficulty: 'easy' as const,
}

describe('QuestionBankService', () => {
  const asPublicService = (service: QuestionBankService): QuestionBankService => service

  it('persists added questions and returns detached filtered copies', () => {
    const repository = new AppRepository(new MemoryStorageAdapter())
    const service = asPublicService(new LocalQuestionBankService(repository))

    const added = service.add(question)
    const listed = service.list({ topicId: 'add', grade: 1, difficulty: 'easy' })
    listed[0].prompt = 'Đã bị thay đổi ở client'

    expect(repository.load().customQuestions).toEqual([added])
    expect(service.list({ topicId: 'add' })).toEqual([added])
    expect(service.list({ topicId: 'subtract' })).toEqual([])
  })

  it('updates and removes a persisted custom question', () => {
    const repository = new AppRepository(new MemoryStorageAdapter())
    const service = new LocalQuestionBankService(repository)
    const added = service.add(question)

    const updated = service.update(added.id, { difficulty: 'medium', answer: '  năm  ' })
    service.remove(added.id)

    expect(updated).toMatchObject({ id: added.id, difficulty: 'medium', answer: 'năm' })
    expect(repository.load().customQuestions).toEqual([])
  })

  it('assigns independent IDs when separate service instances add in the same millisecond', () => {
    const repository = new AppRepository(new MemoryStorageAdapter())
    const now = vi.spyOn(Date, 'now').mockReturnValue(1_762_000_000_000)

    try {
      const first = new LocalQuestionBankService(repository).add(question)
      const second = new LocalQuestionBankService(repository).add({ ...question, prompt: '4 + 5 = ?', answer: '9' })

      expect(second.id).not.toBe(first.id)
      new LocalQuestionBankService(repository).remove(second.id)
      expect(repository.load().customQuestions).toEqual([first])
    } finally {
      now.mockRestore()
    }
  })

  it.each([
    [{ ...question, prompt: '   ' }],
    [{ ...question, answer: '' }],
    [{ ...question, explanation: ' ' }],
    [{ ...question, topicId: 'not-registered' }],
    [{ ...question, grade: 6 }],
    [{ ...question, grade: 0 }],
    [{ ...question, difficulty: 'advanced' }],
  ])('rejects an invalid question: %o', invalid => {
    const service = new LocalQuestionBankService(new AppRepository(new MemoryStorageAdapter()))

    expect(() => service.add(invalid as never)).toThrow()
  })
})
