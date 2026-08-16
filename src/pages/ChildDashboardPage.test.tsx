import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, it } from 'vitest'
import { AppProviders } from '../app/AppProviders'
import { AuthProvider } from '../features/auth/AuthProvider'
import { AuthService } from '../features/auth/authService'
import { SessionRepository } from '../features/auth/sessionRepository'
import { PracticeService } from '../features/practice/practiceService'
import { LocalQuestionBankService } from '../features/practice/questionBankService'
import { ProfileService } from '../features/profiles/profileService'
import { AppRepository } from '../shared/storage/AppRepository'
import { MemoryStorageAdapter } from '../shared/storage/MemoryStorageAdapter'
import { ChildDashboardPage } from './ChildDashboardPage'

function renderDashboard(withProfile = true, suppliedRepository?: AppRepository) {
  const storage = new MemoryStorageAdapter()
  const repository = suppliedRepository ?? new AppRepository(storage)
  if (!suppliedRepository) {
    repository.update(data => ({
      ...data,
      profiles: withProfile ? [{ id: 'an', name: 'An', grade: 1, avatar: '🌱', createdAt: '', updatedAt: '', schemaVersion: 1 }] : [],
      activeProfileId: withProfile ? 'an' : null,
    }))
  }
  const profileService = new ProfileService(repository)
  const practiceService = new PracticeService(repository, { questionBank: new LocalQuestionBankService(repository), random: () => 0.3 })

  render(
    <AppProviders services={{ repository, authService: new AuthService(repository, new SessionRepository(storage)), profileService, practiceService }}>
      <AuthProvider>
        <MemoryRouter><ChildDashboardPage /></MemoryRouter>
      </AuthProvider>
    </AppProviders>,
  )
  return { repository, practiceService }
}

it('shows profile onboarding rather than an empty dashboard', () => {
  renderDashboard(false)

  expect(screen.getByRole('link', { name: 'SunShinSon, về trang giới thiệu' })).toBeInTheDocument()
  expect(screen.getByRole('navigation', { name: 'Điều hướng SunShinSon' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 1, name: 'SunShinSon' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Lưu hồ sơ' })).toBeInTheDocument()
  expect(screen.queryByText('Chọn chủ đề')).not.toBeInTheDocument()
})

it('filters available topics by the active child grade and exposes the weekly goal', () => {
  renderDashboard()

  expect(screen.getByRole('region', { name: 'SunShinSon' })).toHaveTextContent('Chào An')
  expect(screen.getByRole('button', { name: 'Phép cộng' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Phép nhân' })).not.toBeInTheDocument()
  expect(screen.getByLabelText('Mục tiêu tuần')).toHaveTextContent('3 buổi')
  expect(screen.getByRole('link', { name: 'Khu vực phụ huynh' })).toHaveAttribute('href', '/hoc-cung-con/phu-huynh')
  expect(screen.queryByRole('navigation', { name: 'Điều hướng góc học tập' })).not.toBeInTheDocument()
})

it('shows the active legacy profile selected by unversioned migration', () => {
  const storage = new MemoryStorageAdapter()
  storage.set('hoc-cung-con:v1', JSON.stringify({
    profiles: [
      { id: 'an', name: 'An', grade: 1 },
      { id: 'binh', name: 'Bình', grade: 2 },
    ],
    activeProfileId: 'binh',
  }))

  renderDashboard(true, new AppRepository(storage))

  expect(screen.getByRole('region', { name: 'SunShinSon' })).toHaveTextContent('Chào Bình')
  expect(screen.getByRole('button', { name: 'Phép nhân' })).toBeInTheDocument()
})

it('presents completed sessions from the current week against the weekly goal', () => {
  const { repository, practiceService } = renderDashboard()
  for (let index = 0; index < 3; index++) {
    const session = practiceService.createSession('an', 'add', 'easy', 5)
    practiceService.complete(session.id)
  }
  cleanup()
  renderDashboard(true, repository)

  expect(screen.getByLabelText('Mục tiêu tuần')).toHaveTextContent('3/3 buổi')
})

it('welcomes a child with no completed sessions without inventing progress statistics', () => {
  renderDashboard()

  expect(screen.getByText('Hoàn thành bài đầu tiên để xem tiến bộ của con.')).toBeInTheDocument()
  expect(screen.queryByText(/% chính xác/)).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Nên ôn tiếp' })).not.toBeInTheDocument()
})

it('shows actual progress, recent score and an attempted-topic recommendation', () => {
  const { repository, practiceService } = renderDashboard()
  const session = practiceService.createSession('an', 'add', 'easy', 5)
  practiceService.answer(session.id, session.questions[0].id, session.questions[0].answer)
  practiceService.complete(session.id)

  cleanup()
  renderDashboard(true, repository)

  expect(screen.getByLabelText('Tiến bộ')).toHaveTextContent('20% chính xác')
  expect(screen.getByLabelText('Mục tiêu tuần')).toHaveTextContent('1/3 buổi')
  expect(screen.getByText('Điểm gần nhất: 20%')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Nên ôn tiếp' })).toBeInTheDocument()
  expect(screen.getByLabelText('Gợi ý ôn tập')).toHaveTextContent('Phép cộng')
  expect(screen.getByLabelText('Hoạt động 7 ngày gần đây')).toBeInTheDocument()
})

it('switches profile and refreshes topics for the selected grade', async () => {
  const user = userEvent.setup()
  const { repository } = renderDashboard()
  repository.update(data => ({
    ...data,
    profiles: [...data.profiles, { id: 'binh', name: 'Bình', grade: 2, avatar: '🚀', createdAt: '', updatedAt: '', schemaVersion: 1 }],
  }))
  cleanup()
  renderDashboard(true, repository)

  await user.click(screen.getByRole('button', { name: /Bình/ }))

  expect(screen.getByRole('region', { name: 'SunShinSon' })).toHaveTextContent('Chào Bình')
  expect(screen.getByRole('button', { name: 'Phép nhân' })).toBeInTheDocument()
})

it('offers the latest draft for the active child after a reload', () => {
  const { repository, practiceService } = renderDashboard()
  practiceService.createSession('an', 'add', 'easy', 5)

  // A new dashboard render represents returning to the app after persisted data is loaded again.
  cleanup()
  renderDashboard(true, repository)

  expect(screen.getByRole('link', { name: 'Tiếp tục bài đang làm' })).toHaveAttribute('href', expect.stringContaining('session='))
})
