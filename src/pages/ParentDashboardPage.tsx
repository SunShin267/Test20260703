import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppServices } from '../app/AppProviders'
import { useAuth } from '../features/auth/AuthProvider'
import { HistoryTable } from '../features/parent/HistoryTable'
import { ChangePinForm } from '../features/parent/ChangePinForm'
import { ParentOverview } from '../features/parent/ParentOverview'
import { PinGate } from '../features/parent/PinGate'
import { PinService } from '../features/parent/pinService'
import { ProfileManagement } from '../features/parent/ProfileManagement'
import { QuestionBankManagement } from '../features/parent/QuestionBankManagement'
import { WeeklyGoalForm } from '../features/parent/WeeklyGoalForm'
import { PrintActions } from '../features/print/PrintActions'
import { summarizeProgress } from '../features/progress/progressService'
import { WeeklyActivity } from '../features/progress/WeeklyActivity'
import { ProfileService } from '../features/profiles/profileService'
import { AccessibleDialog } from '../shared/ui/AccessibleDialog'

export function ParentDashboardPage() {
  const { repository, pinService: suppliedPinService, profileService: suppliedProfileService, questionBankService: suppliedQuestionBankService } = useAppServices()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const pinService = suppliedPinService ?? new PinService(repository)
  const profileService = suppliedProfileService ?? new ProfileService(repository)
  if (!suppliedQuestionBankService) throw new Error('AppProviders is missing questionBankService')
  const questionBankService = suppliedQuestionBankService
  const [data, setData] = useState(() => repository.load())
  const [resetOpen, setResetOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const resetConfirmationRef = useRef<HTMLInputElement>(null)
  const refresh = () => setData(repository.load())
  const selectedProfile = data.profiles.find(profile => profile.id === data.activeProfileId) ?? data.profiles[0] ?? null
  const summary = selectedProfile ? summarizeProgress(selectedProfile.id, data.sessions) : null
  const completedSessions = selectedProfile ? data.sessions.filter(session => session.profileId === selectedProfile.id && session.status === 'completed') : []
  const latestCompletedSession = completedSessions.slice().sort((left, right) => Date.parse(right.completedAt ?? right.createdAt) - Date.parse(left.completedAt ?? left.createdAt))[0]

  function resetAll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (confirmation !== 'XÓA DỮ LIỆU') return
    repository.reset()
    signOut()
    navigate('/login', { replace: true })
  }

  return <main>
    <header><h1>Khu vực phụ huynh</h1><p>Theo dõi tiến độ và quản lý nội dung học tập của con.</p></header>
    <PinGate pinService={pinService} submitLabel="Mở khóa">
      {selectedProfile ? <>
        <section aria-labelledby="selected-profile-heading"><h2 id="selected-profile-heading">Hồ sơ đang xem: {selectedProfile.avatar} {selectedProfile.name}</h2><p>Lớp {selectedProfile.grade}</p></section>
        <ParentOverview summary={summary!} />
        <WeeklyActivity days={summary!.weekly} />
        <HistoryTable sessions={completedSessions} pageSize={10} />
        {latestCompletedSession && <section aria-labelledby="print-heading"><h2 id="print-heading">In bài luyện gần nhất</h2><PrintActions parentVerified profile={selectedProfile} session={latestCompletedSession} /></section>}
      </> : <section aria-label="Tổng quan phụ huynh"><h2>Tiến bộ tuần này</h2><p>Chưa có hồ sơ để xem tiến độ.</p></section>}
      <WeeklyGoalForm repository={repository} onSaved={refresh} />
      <ChangePinForm pinService={pinService} />
      <ProfileManagement activeId={data.activeProfileId} profiles={data.profiles} service={profileService} onChanged={refresh} />
      <QuestionBankManagement service={questionBankService} />
      <section aria-labelledby="data-heading"><h2 id="data-heading">Dữ liệu</h2><button type="button" onClick={() => { setResetOpen(true); setConfirmation('') }}>Đặt lại toàn bộ dữ liệu</button></section>
      {resetOpen && <AccessibleDialog initialFocusRef={resetConfirmationRef} onClose={() => setResetOpen(false)} title="Đặt lại toàn bộ dữ liệu"><p>Thao tác này sẽ xóa tài khoản, hồ sơ, bài luyện và câu hỏi tùy chỉnh trên thiết bị.</p><form onSubmit={resetAll}><label>Nhập XÓA DỮ LIỆU để xác nhận<input aria-label="Nhập XÓA DỮ LIỆU để xác nhận" ref={resetConfirmationRef} value={confirmation} onChange={event => setConfirmation(event.target.value)} /></label><button disabled={confirmation !== 'XÓA DỮ LIỆU'} type="submit">Xóa dữ liệu</button><button type="button" onClick={() => setResetOpen(false)}>Hủy</button></form></AccessibleDialog>}
    </PinGate>
    <nav aria-label="Điều hướng phụ huynh"><Link to="/hoc-cung-con/app">Về góc học tập</Link></nav>
  </main>
}
