import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAppServices } from '../app/AppProviders'
import { PracticePage } from '../features/practice/PracticePage'
import { PracticeSetupDialog } from '../features/practice/PracticeSetupDialog'
import { PracticeService } from '../features/practice/practiceService'
import { TopicGrid } from '../features/practice/TopicGrid'
import { topicsForGrade } from '../features/practice/topicCatalog'
import { ProfileForm } from '../features/profiles/ProfileForm'
import { ProfileService } from '../features/profiles/profileService'
import { ProfileSwitcher } from '../features/profiles/ProfileSwitcher'
import type { Difficulty, MathTopic } from '../shared/model/types'

type SessionCount = 5 | 10 | 15

export function ChildDashboardPage() {
  const { repository, profileService: suppliedProfileService, practiceService: suppliedPracticeService } = useAppServices()
  const profileService = suppliedProfileService ?? new ProfileService(repository)
  const practiceService = suppliedPracticeService ?? new PracticeService(repository)
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
      <main>
        <h1>Góc học tập</h1>
        <p>Hãy tạo hồ sơ để bắt đầu học cùng con.</p>
        <ProfileForm onSubmit={profile => { profileService.create(profile); refresh() }} />
      </main>
    )
  }

  const draft = practiceService.resumeDraft(activeProfile.id)
  const startPractice = (difficulty: Difficulty, count: SessionCount) => {
    if (!selectedTopic) return
    const session = practiceService.createSession(activeProfile.id, selectedTopic.id, difficulty, count)
    setSelectedTopic(null)
    setSearchParams({ session: session.id })
    refresh()
  }

  return (
    <main>
      <header>
        <h1>Chào {activeProfile.name}!</h1>
        <p>Hôm nay mình cùng chinh phục một bài Toán nhé.</p>
      </header>
      <ProfileSwitcher activeId={activeProfile.id} onSelect={id => { profileService.select(id); refresh() }} profiles={data.profiles} />
      <section aria-label="Mục tiêu tuần" className="weekly-goal">
        <h2>Mục tiêu tuần</h2>
        <p><strong>Mục tiêu tuần: {data.parentSettings.weeklySessionGoal} buổi</strong></p>
      </section>
      {draft && <p><Link to={`/hoc-cung-con/app?session=${draft.id}`}>Tiếp tục bài đang làm</Link></p>}
      <TopicGrid onSelect={setSelectedTopic} topics={topicsForGrade(activeProfile.grade)} />
      {selectedTopic && <PracticeSetupDialog onClose={() => setSelectedTopic(null)} onStart={startPractice} topic={selectedTopic} />}
    </main>
  )
}
