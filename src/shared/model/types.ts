export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export type SupportedGrade = 1 | 2 | 3 | 4 | 5
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface ChildProfile {
  id: string
  name: string
  grade: SupportedGrade
  avatar: string
  createdAt: string
  updatedAt: string
  schemaVersion: 1
}

export interface Question {
  id: string
  topicId: string
  prompt: string
  answer: string
  explanation: string
  grade: Grade
  difficulty: Difficulty
}

export interface CustomQuestion extends Question {
  createdAt: string
  updatedAt: string
  schemaVersion: 1
}

export interface QuestionBankQuery {
  topicId?: string
  grade?: Grade
  difficulty?: Difficulty
}

export interface PracticeSession {
  id: string
  profileId: string
  topicId: string
  questions: Question[]
  answers: Record<string, string>
  status: 'draft' | 'completed'
  startedAt: string
  completedAt: string | null
  createdAt: string
  updatedAt: string
  schemaVersion: 1
}

export interface LocalAccount {
  username: string
  passwordSalt: string
  passwordHash: string
  createdAt: string
  updatedAt: string
  schemaVersion: 1
}

export interface ParentSettings {
  pinSalt: string | null
  pinHash: string | null
  failedPinAttempts: number
  pinLockedUntil: number | null
  weeklySessionGoal: number
  weeklyQuestionGoal: number
  updatedAt: string
  schemaVersion: 1
}

export interface PrintSettings {
  includeChildName: boolean
  includeDate: boolean
  answerKeyPlacement: 'none' | 'last-page'
  updatedAt: string
  schemaVersion: 1
}

export interface AppData {
  schemaVersion: 1
  account: LocalAccount | null
  profiles: ChildProfile[]
  activeProfileId: string | null
  sessions: PracticeSession[]
  customQuestions: CustomQuestion[]
  parentSettings: ParentSettings
  printSettings: PrintSettings
}

export interface SessionResult {
  sessionId: string
  correctCount: number
  totalCount: number
  scorePercent: number
  answers: Array<{ questionId: string; correct: boolean; expected: string; actual: string }>
}

export interface MathTopic {
  id: string
  name: string
  icon: string
  minGrade: Grade
  maxGrade: Grade
  category: 'number' | 'arithmetic' | 'measurement' | 'geometry' | 'mixed'
  generatorId: string
}

export interface ProgressDay {
  date: string
  sessions: number
  questions: number
  correct: number
}

export interface TopicProgress {
  attempts: number
  correct: number
  accuracy: number
}

export interface ProgressSummary {
  profileId: string
  totalSessions: number
  totalQuestions: number
  accuracy: number
  weekly: ProgressDay[]
  byTopic: Record<string, TopicProgress>
  strongestTopicId: string | null
  weakestTopicId: string | null
}
