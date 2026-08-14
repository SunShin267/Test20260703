import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { expect, it } from 'vitest'
import { AppProviders } from '../app/AppProviders'
import { routes } from '../app/router'
import { AuthService } from '../features/auth/authService'
import { SessionRepository } from '../features/auth/sessionRepository'
import { PinService } from '../features/parent/pinService'
import { ProfileService } from '../features/profiles/profileService'
import { AppRepository } from '../shared/storage/AppRepository'
import { MemoryStorageAdapter } from '../shared/storage/MemoryStorageAdapter'

async function renderParentDashboard(prepare?: (repository: AppRepository) => void) {
  const storage = new MemoryStorageAdapter()
  const repository = new AppRepository(storage)
  const authService = new AuthService(repository, new SessionRepository(storage))
  const pinService = new PinService(repository)
  await authService.register('family', 'matkhau1')
  await pinService.setPin('1234')
  prepare?.(repository)

  render(
    <AppProviders services={{ repository, authService, pinService }}>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/hoc-cung-con/phu-huynh'] })} />
    </AppProviders>,
  )

  return repository
}

function completedSession(id: string, profileId: string, topicId: string, day: string) {
  return {
    id, profileId, topicId, status: 'completed' as const,
    questions: [{ id: `${id}-question`, topicId, prompt: '1 + 1 = ?', answer: '2', explanation: 'Cộng.', grade: 1 as const, difficulty: 'easy' as const }],
    answers: { [`${id}-question`]: '2' }, startedAt: `${day}T08:00:00.000Z`, completedAt: `${day}T08:10:00.000Z`, createdAt: `${day}T08:00:00.000Z`, updatedAt: `${day}T08:10:00.000Z`, schemaVersion: 1 as const,
  }
}

it('requires PIN before showing reports and updates a weekly goal', async () => {
  const user = userEvent.setup()
  const repository = await renderParentDashboard()

  expect(screen.queryByText('Tiến bộ tuần này')).not.toBeInTheDocument()
  await user.type(screen.getByLabelText('Mã PIN phụ huynh'), '1234')
  await user.click(screen.getByRole('button', { name: 'Mở khóa' }))
  expect(await screen.findByText('Tiến bộ tuần này')).toBeInTheDocument()

  await user.clear(screen.getByLabelText('Mục tiêu số buổi mỗi tuần'))
  await user.type(screen.getByLabelText('Mục tiêu số buổi mỗi tuần'), '5')
  await user.click(screen.getByRole('button', { name: 'Lưu mục tiêu' }))

  expect(repository.load().parentSettings.weeklySessionGoal).toBe(5)
})

it('offers blank and answer-key printing for the selected child only after PIN verification', async () => {
  const user = userEvent.setup()
  await renderParentDashboard(repository => {
    const an = new ProfileService(repository).create({ name: 'An', grade: 3, avatar: '🌱' })
    repository.update(data => ({ ...data, sessions: [completedSession('an-1', an.id, 'add', '2026-08-15')] }))
  })

  expect(screen.queryByRole('button', { name: 'In kèm đáp án' })).not.toBeInTheDocument()
  await user.type(screen.getByLabelText('Mã PIN phụ huynh'), '1234')
  await user.click(screen.getByRole('button', { name: 'Mở khóa' }))

  expect(await screen.findByRole('button', { name: 'In phiếu trắng' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'In kèm đáp án' })).toBeInTheDocument()
})

it('requires the exact reset phrase before deleting local data and signing out', async () => {
  const user = userEvent.setup()
  const repository = await renderParentDashboard()
  await user.type(screen.getByLabelText('Mã PIN phụ huynh'), '1234')
  await user.click(screen.getByRole('button', { name: 'Mở khóa' }))

  const resetOpener = screen.getByRole('button', { name: 'Đặt lại toàn bộ dữ liệu' })
  await user.click(resetOpener)
  const confirmation = screen.getByLabelText('Nhập XÓA DỮ LIỆU để xác nhận')
  expect(confirmation).toHaveFocus()
  await user.type(confirmation, 'xoa du lieu')
  expect(screen.getByRole('button', { name: 'Xóa dữ liệu' })).toBeDisabled()
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog', { name: 'Đặt lại toàn bộ dữ liệu' })).not.toBeInTheDocument()
  expect(resetOpener).toHaveFocus()
  await user.click(resetOpener)
  const reopenedConfirmation = screen.getByLabelText('Nhập XÓA DỮ LIỆU để xác nhận')
  await user.type(reopenedConfirmation, 'XÓA DỮ LIỆU')
  await user.click(screen.getByRole('button', { name: 'Xóa dữ liệu' }))

  expect(await screen.findByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument()
  expect(repository.load().account).toBeNull()
})

it('focuses and closes profile management dialogs with the keyboard', async () => {
  const user = userEvent.setup()
  await renderParentDashboard()
  await user.type(screen.getByLabelText('Mã PIN phụ huynh'), '1234')
  await user.click(screen.getByRole('button', { name: 'Mở khóa' }))

  const opener = screen.getByRole('button', { name: 'Thêm hồ sơ' })
  await user.click(opener)
  expect(screen.getByRole('dialog', { name: 'Thêm hồ sơ' })).toBeInTheDocument()
  expect(screen.getByLabelText('Tên bé')).toHaveFocus()
  await user.keyboard('{Escape}')

  expect(screen.queryByRole('dialog', { name: 'Thêm hồ sơ' })).not.toBeInTheDocument()
  expect(opener).toHaveFocus()
})

it('rejects out-of-range and non-integer weekly goals without persisting them', async () => {
  const user = userEvent.setup()
  const repository = await renderParentDashboard()
  await user.type(screen.getByLabelText('Mã PIN phụ huynh'), '1234')
  await user.click(screen.getByRole('button', { name: 'Mở khóa' }))
  const sessions = screen.getByLabelText('Mục tiêu số buổi mỗi tuần')

  await user.clear(sessions)
  await user.type(sessions, '0')
  await user.click(screen.getByRole('button', { name: 'Lưu mục tiêu' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Mục tiêu buổi phải từ 1 đến 14')
  expect(repository.load().parentSettings.weeklySessionGoal).toBe(3)

  await user.clear(sessions)
  await user.type(sessions, '1.5')
  await user.click(screen.getByRole('button', { name: 'Lưu mục tiêu' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Mục tiêu buổi phải từ 1 đến 14')
  expect(repository.load().parentSettings.weeklySessionGoal).toBe(3)
})

it('selects, edits, and deletes a named profile with its session history', async () => {
  const user = userEvent.setup()
  const repository = await renderParentDashboard(repository => {
    const profiles = new ProfileService(repository)
    const an = profiles.create({ name: 'An', grade: 1, avatar: '🌱' })
    const binh = profiles.create({ name: 'Bình', grade: 2, avatar: '🚀' })
    repository.update(data => ({ ...data, sessions: [completedSession('an-1', an.id, 'add', '2026-08-14'), completedSession('binh-1', binh.id, 'subtract', '2026-08-15')] }))
  })
  await user.type(screen.getByLabelText('Mã PIN phụ huynh'), '1234')
  await user.click(screen.getByRole('button', { name: 'Mở khóa' }))

  await user.click(screen.getByRole('button', { name: 'Chọn Bình' }))
  expect(screen.getByText(/Hồ sơ đang xem: 🚀 Bình/)).toBeInTheDocument()
  expect(screen.getByLabelText('Lịch sử bài luyện')).toHaveTextContent('Phép trừ')
  await user.click(screen.getByRole('button', { name: 'Sửa Bình' }))
  const name = screen.getByLabelText('Tên bé')
  await user.clear(name)
  await user.type(name, 'Bình An')
  await user.click(screen.getByRole('button', { name: 'Lưu hồ sơ' }))
  expect(repository.load().profiles.find(profile => profile.name === 'Bình An')).toBeDefined()

  await user.click(screen.getByRole('button', { name: 'Xóa An' }))
  expect(screen.getByRole('dialog', { name: /Xóa hồ sơ An/ })).toHaveTextContent('Các bài luyện của An cũng sẽ bị xóa.')
  await user.click(screen.getByRole('button', { name: 'Xác nhận xóa hồ sơ' }))
  expect(repository.load().profiles.map(profile => profile.name)).toEqual(['Bình An'])
  expect(repository.load().sessions.map(session => session.id)).toEqual(['binh-1'])
})

it('paginates the selected profile completed history truthfully', async () => {
  const user = userEvent.setup()
  await renderParentDashboard(repository => {
    const an = new ProfileService(repository).create({ name: 'An', grade: 1, avatar: '🌱' })
    repository.update(data => ({ ...data, sessions: Array.from({ length: 11 }, (_, index) => completedSession(`session-${index + 1}`, an.id, 'add', `2026-08-${String(index + 1).padStart(2, '0')}`)) }))
  })
  await user.type(screen.getByLabelText('Mã PIN phụ huynh'), '1234')
  await user.click(screen.getByRole('button', { name: 'Mở khóa' }))

  expect(screen.getByLabelText('Lịch sử bài luyện')).toHaveTextContent('2026-08-11T08:10:00.000Z')
  expect(screen.getByLabelText('Lịch sử bài luyện')).not.toHaveTextContent('2026-08-01T08:10:00.000Z')
  await user.click(screen.getByRole('button', { name: 'Trang sau' }))
  expect(screen.getByLabelText('Lịch sử bài luyện')).toHaveTextContent('2026-08-01T08:10:00.000Z')
})
