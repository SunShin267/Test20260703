import type { MathTopic, PracticeSession, ProgressDay, ProgressSummary, TopicProgress } from '../../shared/model/types'
import { scoreAnswer } from '../practice/scoring'
import { localCalendarDate } from './streakService'

const toAccuracy = (correct: number, attempts: number): number =>
  attempts === 0 ? 0 : Math.round((correct / attempts) * 100)

const localToday = (): string => localCalendarDate(new Date())!

function sevenLocalDaysEnding(today: string): ProgressDay[] {
  const days: ProgressDay[] = []
  const [year, month, day] = today.split('-').map(Number)
  const cursor = new Date(year, month - 1, day)
  cursor.setDate(cursor.getDate() - 6)

  for (let index = 0; index < 7; index += 1) {
    days.push({ date: localCalendarDate(cursor)!, sessions: 0, questions: 0, correct: 0 })
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

function rankedTopicIds(byTopic: Record<string, TopicProgress>, direction: 'asc' | 'desc'): string[] {
  return Object.entries(byTopic)
    .filter(([, progress]) => progress.attempts > 0)
    .sort(([leftId, left], [rightId, right]) => {
      const accuracyDifference = direction === 'asc'
        ? left.accuracy - right.accuracy
        : right.accuracy - left.accuracy
      return accuracyDifference || leftId.localeCompare(rightId)
    })
    .map(([topicId]) => topicId)
}

export function summarizeProgress(
  profileId: string,
  sessions: PracticeSession[],
  today: string = localToday(),
): ProgressSummary {
  const currentDay = localCalendarDate(today) ?? localToday()
  const weekly = sevenLocalDaysEnding(currentDay)
  const weeklyByDate = new Map(weekly.map(day => [day.date, day]))
  const byTopic: Record<string, TopicProgress> = {}
  let totalSessions = 0
  let totalQuestions = 0
  let correct = 0

  for (const session of sessions) {
    if (session.profileId !== profileId || session.status !== 'completed') continue

    totalSessions += 1
    const topic = byTopic[session.topicId] ??= { attempts: 0, correct: 0, accuracy: 0 }
    const completedDay = session.completedAt ? localCalendarDate(session.completedAt) : null
    const bucket = completedDay ? weeklyByDate.get(completedDay) : undefined
    if (bucket) bucket.sessions += 1

    for (const question of session.questions) {
      const isCorrect = scoreAnswer(session.answers[question.id] ?? '', question.answer)
      totalQuestions += 1
      topic.attempts += 1
      if (isCorrect) {
        correct += 1
        topic.correct += 1
      }
      if (bucket) {
        bucket.questions += 1
        if (isCorrect) bucket.correct += 1
      }
    }
  }

  for (const topic of Object.values(byTopic)) topic.accuracy = toAccuracy(topic.correct, topic.attempts)
  const strongestTopicId = rankedTopicIds(byTopic, 'desc')[0] ?? null
  const weakestTopicId = rankedTopicIds(byTopic, 'asc')[0] ?? null

  return {
    profileId,
    totalSessions,
    totalQuestions,
    accuracy: toAccuracy(correct, totalQuestions),
    weekly,
    byTopic,
    strongestTopicId,
    weakestTopicId,
  }
}

export function recommendTopic(summary: ProgressSummary, topics: MathTopic[]): MathTopic | null {
  const availableTopics = new Map(topics.map(topic => [topic.id, topic]))
  const topicId = rankedTopicIds(summary.byTopic, 'asc').find(id => availableTopics.has(id))
  return topicId ? availableTopics.get(topicId)! : null
}
