import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAppServices } from '../app/AppProviders'
import { FamilyPageLayout } from '../components/FamilyPageLayout'
import { PracticePage } from '../features/practice/PracticePage'
import { PracticeSetupDialog } from '../features/practice/PracticeSetupDialog'
import { TopicGrid } from '../features/practice/TopicGrid'
import { topicsForGrade } from '../features/practice/topicCatalog'
import { ProgressSummaryCards } from '../features/progress/ProgressSummaryCards'
import { recommendTopic, summarizeProgress } from '../features/progress/progressService'
import { calculateStreak, localCalendarDate } from '../features/progress/streakService'
import { WeeklyActivity } from '../features/progress/WeeklyActivity'
import { ProfileForm } from '../features/profiles/ProfileForm'
import { ProfileService } from '../features/profiles/profileService'
import { ProfileSwitcher } from '../features/profiles/ProfileSwitcher'
import { scoreSession } from '../features/practice/scoring'
import type { Difficulty, MathTopic, PracticeSession } from '../shared/model/types'

type SessionCount = 5 | 10 | 15

export function ChildDashboardPage() {
  const { repository, profileService: suppliedProfileService, practiceService: suppliedPracticeService } = useAppServices()
  const profileService = suppliedProfileService ?? new ProfileService(repository)
  if (!suppliedPracticeService) throw new Error('AppProviders is missing practiceService')
  const practiceService = suppliedPracticeService
  const [data, setData] = useState(() => repository.load())
  const [selectedTopic, setSelectedTopic] = useState<MathTopic | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const activeProfile = data.profiles.find(profile => profile.id === data.activeProfileId) ?? null
  const sessionId = searchParams.get('session')

  const refresh = () => setData(repository.load())
  const goToDashboard = () => {
    setSelectedTopic(null)
    setSearchParams({})
    refresh()
  }

  if (sessionId && activeProfile) {
    const session = data.sessions.find(candidate => candidate.id === sessionId && candidate.profileId === activeProfile.id)
    if (session) return <PracticePage onBack={goToDashboard} sessionId={session.id} />
  }

  if (!activeProfile) {
    return (
      <FamilyPageLayout description="hãy tạo hồ sơ để bắt đầu học cùng con.">
        <ProfileForm onSubmit={profile => { profileService.create(profile); refresh() }} />
      </FamilyPageLayout>
    )
  }

  const draft = practiceService.resumeDraft(activeProfile.id)
  const topics = topicsForGrade(activeProfile.grade)
  const today = localCalendarDate(new Date())!
  const summary = summarizeProgress(activeProfile.id, data.sessions, today)
  const completedSessions = data.sessions.filter(session =>
    session.profileId === activeProfile.id && session.status === 'completed')
  const streak = calculateStreak(
    completedSessions.flatMap(session => session.completedAt ? [session.completedAt] : []),
    today,
  )
  const recentSession = [...completedSessions]
    .sort((left, right) => completedTimestamp(right).localeCompare(completedTimestamp(left)))[0] ?? null
  const recentScore = recentSession ? scoreSession(recentSession).scorePercent : null
  const weeklySessions = summary.weekly.reduce((total, day) => total + day.sessions, 0)
  const recommendation = recommendTopic(summary, topics)
  const startPractice = (difficulty: Difficulty, count: SessionCount) => {
    if (!selectedTopic) return
    const session = practiceService.createSession(activeProfile.id, selectedTopic.id, difficulty, count)
    setSelectedTopic(null)
    setSearchParams({ session: session.id })
    refresh()
  }

  return (
    <FamilyPageLayout description="hôm nay mình cùng chinh phục một bài Toán nhé." greetingName={activeProfile.name}>
      <ProfileSwitcher activeId={activeProfile.id} onSelect={id => { profileService.select(id); refresh() }} profiles={data.profiles} />
      <ProgressSummaryCards recommendation={recommendation} recentScore={recentScore} streak={streak} summary={summary} />
      <section aria-label="Mục tiêu tuần" className="weekly-goal">
        <h2>Mục tiêu tuần</h2>
        {data.parentSettings.weeklySessionGoal > 0
          ? <p><strong>Mục tiêu tuần: {weeklySessions}/{data.parentSettings.weeklySessionGoal} buổi</strong></p>
          : <p><strong>{weeklySessions} buổi đã hoàn thành trong 7 ngày qua</strong></p>}
      </section>
      {draft && <p><Link to={`/hoc-cung-con/app?session=${draft.id}`}>Tiếp tục bài đang làm</Link></p>}
      <WeeklyActivity days={summary.weekly} />
      <TopicGrid onSelect={setSelectedTopic} topics={topics} />
      {selectedTopic && <PracticeSetupDialog onClose={() => setSelectedTopic(null)} onStart={startPractice} topic={selectedTopic} />}
    </FamilyPageLayout>
  )
}

function completedTimestamp(session: PracticeSession): string {
  return session.completedAt ?? session.updatedAt
}
