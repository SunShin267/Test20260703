import { z } from 'zod'
import type { AppData, ChildProfile } from '../model/types'

const timestamp = '1970-01-01T00:00:00.000Z'

const gradeSchema = z.union([
  z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6),
  z.literal(7), z.literal(8), z.literal(9), z.literal(10), z.literal(11), z.literal(12),
])
const supportedGradeSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])

const childProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  grade: supportedGradeSchema,
  avatar: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  schemaVersion: z.literal(1),
})

const questionSchema = z.object({
  id: z.string().min(1),
  topicId: z.string().min(1),
  prompt: z.string(),
  answer: z.string(),
  explanation: z.string(),
  grade: gradeSchema,
  difficulty: z.enum(['easy', 'medium', 'hard']),
})

const practiceSessionSchema = z.object({
  id: z.string().min(1),
  profileId: z.string().min(1),
  topicId: z.string().min(1),
  questions: z.array(questionSchema),
  answers: z.record(z.string(), z.string()),
  status: z.enum(['draft', 'completed']),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  schemaVersion: z.literal(1),
})

const accountSchema = z.object({
  username: z.string().min(1),
  passwordSalt: z.string().min(1),
  passwordHash: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  schemaVersion: z.literal(1),
})

const parentSettingsSchema = z.object({
  pinSalt: z.string().min(1).nullable(),
  pinHash: z.string().min(1).nullable(),
  failedPinAttempts: z.number().int().nonnegative(),
  pinLockedUntil: z.number().int().nonnegative().nullable(),
  weeklySessionGoal: z.number().int().nonnegative(),
  weeklyQuestionGoal: z.number().int().nonnegative(),
  updatedAt: z.string(),
  schemaVersion: z.literal(1),
})

const printSettingsSchema = z.object({
  includeChildName: z.boolean(),
  includeDate: z.boolean(),
  answerKeyPlacement: z.enum(['none', 'last-page']),
  updatedAt: z.string(),
  schemaVersion: z.literal(1),
})

export const appDataSchema = z.object({
  schemaVersion: z.literal(1),
  account: accountSchema.nullable(),
  profiles: z.array(childProfileSchema),
  activeProfileId: z.string().min(1).nullable(),
  sessions: z.array(practiceSessionSchema),
  parentSettings: parentSettingsSchema,
  printSettings: printSettingsSchema,
})

export function createDefaultAppData(): AppData {
  return {
    schemaVersion: 1,
    account: null,
    profiles: [],
    activeProfileId: null,
    sessions: [],
    parentSettings: {
      pinSalt: null,
      pinHash: null,
      failedPinAttempts: 0,
      pinLockedUntil: null,
      weeklySessionGoal: 3,
      weeklyQuestionGoal: 20,
      updatedAt: timestamp,
      schemaVersion: 1,
    },
    printSettings: {
      includeChildName: true,
      includeDate: true,
      answerKeyPlacement: 'last-page',
      updatedAt: timestamp,
      schemaVersion: 1,
    },
  }
}

const legacyProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  grade: supportedGradeSchema,
})

function migrateUnversioned(value: unknown): AppData | null {
  if (!value || typeof value !== 'object' || Array.isArray(value) || 'schemaVersion' in value) return null

  const profiles = 'profiles' in value && Array.isArray(value.profiles) ? value.profiles : []
  const migratedProfiles: ChildProfile[] = profiles.flatMap(profile => {
    const parsed = legacyProfileSchema.safeParse(profile)
    if (!parsed.success) return []

    return [{
      ...parsed.data,
      avatar: '🌱',
      createdAt: timestamp,
      updatedAt: timestamp,
      schemaVersion: 1 as const,
    }]
  })

  return { ...createDefaultAppData(), profiles: migratedProfiles }
}

export function parseAndMigrate(raw: string | null): AppData {
  if (raw === null) return createDefaultAppData()

  try {
    const parsed: unknown = JSON.parse(raw)
    const current = appDataSchema.safeParse(parsed)
    if (current.success) return current.data

    return migrateUnversioned(parsed) ?? createDefaultAppData()
  } catch {
    return createDefaultAppData()
  }
}
