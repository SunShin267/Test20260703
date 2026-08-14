import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it } from 'vitest'
import { AppProviders } from '../app/AppProviders'
import { AuthService } from '../features/auth/authService'
import { SessionRepository } from '../features/auth/sessionRepository'
import { PracticeService } from '../features/practice/practiceService'
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
  const practiceService = new PracticeService(repository, { random: () => 0.3 })

  render(
    <AppProviders services={{ repository, authService: new AuthService(repository, new SessionRepository(storage)), profileService, practiceService }}>
      <MemoryRouter><ChildDashboardPage /></MemoryRouter>
    </AppProviders>,
  )
  return { repository, practiceService }
}

it('shows profile onboarding rather than an empty dashboard', () => {
  renderDashboard(false)

  expect(screen.getByRole('button', { name: 'Lưu hồ sơ' })).toBeInTheDocument()
  expect(screen.queryByText('Chọn chủ đề')).not.toBeInTheDocument()
})

it('filters available topics by the active child grade and exposes the weekly goal', () => {
  renderDashboard()

  expect(screen.getByRole('heading', { name: /Chào An/ })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Phép cộng' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Phép nhân' })).not.toBeInTheDocument()
  expect(screen.getByLabelText('Mục tiêu tuần')).toHaveTextContent('3 buổi')
})

it('offers the latest draft for the active child after a reload', () => {
  const { repository, practiceService } = renderDashboard()
  practiceService.createSession('an', 'add', 'easy', 5)

  // A new dashboard render represents returning to the app after persisted data is loaded again.
  cleanup()
  renderDashboard(true, repository)

  expect(screen.getByRole('link', { name: 'Tiếp tục bài đang làm' })).toHaveAttribute('href', expect.stringContaining('session='))
})
