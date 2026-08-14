import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { expect, it } from 'vitest'
import { AppProviders } from '../app/AppProviders'
import { routes } from '../app/router'
import { AuthService } from '../features/auth/authService'
import { SessionRepository } from '../features/auth/sessionRepository'
import { PinService } from '../features/parent/pinService'
import { AppRepository } from '../shared/storage/AppRepository'
import { MemoryStorageAdapter } from '../shared/storage/MemoryStorageAdapter'

async function renderParentDashboard() {
  const storage = new MemoryStorageAdapter()
  const repository = new AppRepository(storage)
  const authService = new AuthService(repository, new SessionRepository(storage))
  const pinService = new PinService(repository)
  await authService.register('family', 'matkhau1')
  await pinService.setPin('1234')

  render(
    <AppProviders services={{ repository, authService, pinService }}>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/hoc-cung-con/phu-huynh'] })} />
    </AppProviders>,
  )

  return repository
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

it('requires the exact reset phrase before deleting local data and signing out', async () => {
  const user = userEvent.setup()
  const repository = await renderParentDashboard()
  await user.type(screen.getByLabelText('Mã PIN phụ huynh'), '1234')
  await user.click(screen.getByRole('button', { name: 'Mở khóa' }))

  await user.click(screen.getByRole('button', { name: 'Đặt lại toàn bộ dữ liệu' }))
  const confirmation = screen.getByLabelText('Nhập XÓA DỮ LIỆU để xác nhận')
  await user.type(confirmation, 'xoa du lieu')
  expect(screen.getByRole('button', { name: 'Xóa dữ liệu' })).toBeDisabled()
  await user.clear(confirmation)
  await user.type(confirmation, 'XÓA DỮ LIỆU')
  await user.click(screen.getByRole('button', { name: 'Xóa dữ liệu' }))

  expect(await screen.findByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument()
  expect(repository.load().account).toBeNull()
})
