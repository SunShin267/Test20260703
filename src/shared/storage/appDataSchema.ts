import { z } from 'zod'
import type { AppData, ChildProfile, ParentSettings, PrintSettings } from '../model/types'

const timestamp = '1970-01-01T00:00:00.000Z'

const gradeSchema = z.union([
  z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6),
  z.literal(7), z.literal(8), z.literal(9), z.literal(10), z.literal(11), z.literal(12),
])
const supportedGradeSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
const requiredTextSchema = z.string().trim().min(1)

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
  prompt: requiredTextSchema,
  answer: requiredTextSchema,
  explanation: requiredTextSchema,
  grade: gradeSchema,
  difficulty: z.enum(['easy', 'medium', 'hard']),
})

const customQuestionSchema = questionSchema.extend({
  createdAt: z.string(),
  updatedAt: z.string(),
  schemaVersion: z.literal(1),
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
  customQuestions: z.array(customQuestionSchema).default([]),
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
    customQuestions: [],
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

  const activeProfileId = 'activeProfileId' in value
    && typeof value.activeProfileId === 'string'
    && migratedProfiles.some(profile => profile.id === value.activeProfileId)
    ? value.activeProfileId
    : migratedProfiles[0]?.id ?? null

  return { ...createDefaultAppData(), profiles: migratedProfiles, activeProfileId }
}

function salvageCurrentVersion(value: Record<string, unknown>): AppData {
  const defaults = createDefaultAppData()
  const accountResult = accountSchema.safeParse(value.account)
  const profiles = uniqueValidRecords(value.profiles, childProfileSchema)
  const profileIds = new Set(profiles.map(profile => profile.id))
  const sessions = uniqueValidRecords(value.sessions, practiceSessionSchema)
    .filter(session => profileIds.has(session.profileId))
    .filter(session => new Set(session.questions.map(question => question.id)).size === session.questions.length)
    .map(session => {
      const questionIds = new Set(session.questions.map(question => question.id))
      return {
        ...session,
        answers: Object.fromEntries(Object.entries(session.answers).filter(([questionId]) => questionIds.has(questionId))),
      }
    })
  const customQuestions = uniqueValidRecords(value.customQuestions, customQuestionSchema)
  const activeProfileId = typeof value.activeProfileId === 'string'
    && profileIds.has(value.activeProfileId)
    ? value.activeProfileId
    : profiles[0]?.id ?? null

  return appDataSchema.parse({
    schemaVersion: 1,
    account: accountResult.success ? accountResult.data : null,
    profiles,
    activeProfileId,
    sessions,
    customQuestions,
    parentSettings: salvageParentSettings(value.parentSettings, defaults.parentSettings),
    printSettings: salvagePrintSettings(value.printSettings, defaults.printSettings),
  })
}

function uniqueValidRecords<T extends { id: string }>(value: unknown, schema: z.ZodType<T>): T[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  return value.flatMap(item => {
    const parsed = schema.safeParse(item)
    if (!parsed.success || seen.has(parsed.data.id)) return []
    seen.add(parsed.data.id)
    return [parsed.data]
  })
}

function salvageParentSettings(value: unknown, defaults: ParentSettings): ParentSettings {
  const source = recordFor(value)
  let pinSalt = fieldOrDefault(parentSettingsSchema.shape.pinSalt, source.pinSalt, defaults.pinSalt)
  let pinHash = fieldOrDefault(parentSettingsSchema.shape.pinHash, source.pinHash, defaults.pinHash)
  if (Boolean(pinSalt) !== Boolean(pinHash)) {
    pinSalt = null
    pinHash = null
  }

  return {
    pinSalt,
    pinHash,
    failedPinAttempts: fieldOrDefault(parentSettingsSchema.shape.failedPinAttempts, source.failedPinAttempts, defaults.failedPinAttempts),
    pinLockedUntil: fieldOrDefault(parentSettingsSchema.shape.pinLockedUntil, source.pinLockedUntil, defaults.pinLockedUntil),
    weeklySessionGoal: fieldOrDefault(parentSettingsSchema.shape.weeklySessionGoal, source.weeklySessionGoal, defaults.weeklySessionGoal),
    weeklyQuestionGoal: fieldOrDefault(parentSettingsSchema.shape.weeklyQuestionGoal, source.weeklyQuestionGoal, defaults.weeklyQuestionGoal),
    updatedAt: fieldOrDefault(parentSettingsSchema.shape.updatedAt, source.updatedAt, defaults.updatedAt),
    schemaVersion: 1,
  }
}

function salvagePrintSettings(value: unknown, defaults: PrintSettings): PrintSettings {
  const source = recordFor(value)
  return {
    includeChildName: fieldOrDefault(printSettingsSchema.shape.includeChildName, source.includeChildName, defaults.includeChildName),
    includeDate: fieldOrDefault(printSettingsSchema.shape.includeDate, source.includeDate, defaults.includeDate),
    answerKeyPlacement: fieldOrDefault(printSettingsSchema.shape.answerKeyPlacement, source.answerKeyPlacement, defaults.answerKeyPlacement),
    updatedAt: fieldOrDefault(printSettingsSchema.shape.updatedAt, source.updatedAt, defaults.updatedAt),
    schemaVersion: 1,
  }
}

function fieldOrDefault<T>(schema: z.ZodType<T>, value: unknown, fallback: T): T {
  const parsed = schema.safeParse(value)
  return parsed.success ? parsed.data : fallback
}

function recordFor(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

export function parseAndMigrate(raw: string | null): AppData {
  if (raw === null) return createDefaultAppData()

  try {
    const parsed: unknown = JSON.parse(raw)
    if (recordFor(parsed).schemaVersion === 1) return salvageCurrentVersion(recordFor(parsed))

    return migrateUnversioned(parsed) ?? createDefaultAppData()
  } catch {
    return createDefaultAppData()
  }
}
