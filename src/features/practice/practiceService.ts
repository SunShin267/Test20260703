import type { Difficulty, PracticeSession, Question, SessionResult, SupportedGrade } from '../../shared/model/types'
import type { AppRepository } from '../../shared/storage/AppRepository'
import { generatorFor } from './generators/registry'
import { QuestionBankService, type QuestionBank } from './questionBankService'
import { scoreSession } from './scoring'
import { TOPICS } from './topicCatalog'

type SessionCount = 5 | 10 | 15

export interface PracticeServiceOptions {
  random?: () => number
  now?: () => string
  createId?: () => string
  questionBank?: QuestionBank
}

export class PracticeService {
  private readonly random: () => number
  private readonly now: () => string
  private readonly createId: () => string
  private readonly questionBank: QuestionBank
  private sequence = 0

  constructor(private readonly app: AppRepository, options: PracticeServiceOptions = {}) {
    this.random = options.random ?? Math.random
    this.now = options.now ?? (() => new Date().toISOString())
    this.createId = options.createId ?? (() => `session-${this.now()}-${++this.sequence}`)
    this.questionBank = options.questionBank ?? new QuestionBankService(app)
  }

  createSession(profileId: string, topicId: string, difficulty: Difficulty, count: SessionCount): PracticeSession {
    if (![5, 10, 15].includes(count)) throw new Error('Số câu hỏi phải là 5, 10 hoặc 15')

    const topic = TOPICS.find(candidate => candidate.id === topicId)
    if (!topic) throw new Error(`Không tìm thấy chủ đề: ${topicId}`)
    const profile = this.app.load().profiles.find(candidate => candidate.id === profileId)
    if (!profile) throw new Error(`Không tìm thấy hồ sơ: ${profileId}`)
    if (profile.grade < topic.minGrade || profile.grade > topic.maxGrade) {
      throw new Error('Chủ đề không phù hợp với lớp của con')
    }

    const generator = generatorFor(topic.generatorId)
    const customQuestions = this.matchingCustomQuestions(topicId, difficulty, profile.grade, count)
    const questions = this.uniqueQuestions(generator, topicId, difficulty, count, profile.grade, customQuestions)
    const timestamp = this.now()
    const session: PracticeSession = {
      id: this.createId(),
      profileId,
      topicId,
      questions,
      answers: {},
      status: 'draft',
      startedAt: timestamp,
      completedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      schemaVersion: 1,
    }

    this.app.update(data => ({ ...data, sessions: [...data.sessions, session] }))
    return session
  }

  answer(sessionId: string, questionId: string, value: string): PracticeSession {
    let updated: PracticeSession | null = null
    this.app.update(data => ({
      ...data,
      sessions: data.sessions.map(session => {
        if (session.id !== sessionId) return session
        if (session.status === 'completed') throw new Error('Phiên luyện tập đã hoàn thành')
        if (!session.questions.some(question => question.id === questionId)) throw new Error('Không tìm thấy câu hỏi')
        updated = { ...session, answers: { ...session.answers, [questionId]: value }, updatedAt: this.now() }
        return updated
      }),
    }))
    if (!updated) throw new Error('Không tìm thấy phiên luyện tập')
    return updated
  }

  complete(sessionId: string): SessionResult {
    const existing = this.sessionFor(sessionId)
    if (existing.status === 'completed') return scoreSession(existing)

    let completed: PracticeSession | null = null
    this.app.update(data => ({
      ...data,
      sessions: data.sessions.map(session => {
        if (session.id !== sessionId) return session
        completed = { ...session, status: 'completed', completedAt: this.now(), updatedAt: this.now() }
        return completed
      }),
    }))
    if (!completed) throw new Error('Không tìm thấy phiên luyện tập')
    return scoreSession(completed)
  }

  resumeDraft(profileId: string): PracticeSession | null {
    return this.app.load().sessions
      .filter(session => session.profileId === profileId && session.status === 'draft')
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0] ?? null
  }

  private sessionFor(sessionId: string): PracticeSession {
    const session = this.app.load().sessions.find(candidate => candidate.id === sessionId)
    if (!session) throw new Error('Không tìm thấy phiên luyện tập')
    return session
  }

  private uniqueQuestions(
    generator: ReturnType<typeof generatorFor>,
    topicId: string,
    difficulty: Difficulty,
    count: SessionCount,
    grade: SupportedGrade,
    initial: Question[] = [],
  ): Question[] {
    const questions = [...initial]
    const prompts = new Set(questions.map(question => question.prompt))
    let attempts = 0

    while (questions.length < count && attempts < count * 50) {
      const attempt = attempts++
      const random = () => (this.random() + attempt / (count * 50)) % 1
      const generated = generator.generate({ grade, difficulty, random })
      if (prompts.has(generated.prompt)) continue
      prompts.add(generated.prompt)
      questions.push({ ...generated, id: `${generated.id}-${questions.length + 1}`, topicId })
    }

    if (questions.length !== count) throw new Error('Không thể tạo đủ câu hỏi khác nhau')
    return questions
  }

  private matchingCustomQuestions(
    topicId: string,
    difficulty: Difficulty,
    grade: SupportedGrade,
    count: SessionCount,
  ): Question[] {
    const candidates = [...this.questionBank.list({ topicId, difficulty, grade })]
    for (let index = candidates.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(this.random() * (index + 1))
      ;[candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]]
    }

    const prompts = new Set<string>()
    const selected: Question[] = []
    for (const question of candidates) {
      if (prompts.has(question.prompt) || selected.length === count) continue
      prompts.add(question.prompt)
      selected.push({
        id: `custom-${question.id}-${selected.length + 1}`,
        topicId: question.topicId,
        prompt: question.prompt,
        answer: question.answer,
        explanation: question.explanation,
        grade: question.grade,
        difficulty: question.difficulty,
      })
    }
    return selected
  }
}
