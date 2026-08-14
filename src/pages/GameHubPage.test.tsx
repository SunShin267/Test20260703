import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { expect, it } from 'vitest'
import { AppProviders } from '../app/AppProviders'
import { routes } from '../app/router'
import { AuthService } from '../features/auth/authService'
import { SessionRepository } from '../features/auth/sessionRepository'
import { AppRepository } from '../shared/storage/AppRepository'
import { MemoryStorageAdapter } from '../shared/storage/MemoryStorageAdapter'

async function renderAuthenticatedHub() {
  const storage = new MemoryStorageAdapter()
  const repository = new AppRepository(storage)
  const authService = new AuthService(repository, new SessionRepository(storage))
  await authService.register('gia-dinh-an', 'mat-khau-an-toan')

  render(
    <AppProviders services={{ repository, authService }}>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/'] })} />
    </AppProviders>,
  )
}

it('links every Game Hub card to its stable destination', async () => {
  await renderAuthenticatedHub()

  expect(await screen.findByRole('heading', { name: 'Game Hub' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Mở Học cùng con' })).toHaveAttribute('href', '/hoc-cung-con/app')
  expect(screen.getByRole('link', { name: 'Mở Cờ Caro' })).toHaveAttribute('href', '/games/co-caro.html')
  expect(screen.getByRole('link', { name: 'Mở Cờ Vua' })).toHaveAttribute('href', '/games/co-vua.html')
  expect(screen.getByRole('link', { name: 'Mở Random Number' })).toHaveAttribute('href', '/games/random-number-page.html')
})

it('identifies the local account and provides a clear sign-out action', async () => {
  await renderAuthenticatedHub()

  expect(await screen.findByText('Tài khoản cục bộ: gia-dinh-an')).toBeInTheDocument()
  expect(screen.getByText('Dữ liệu và phiên đăng nhập chỉ được lưu trên thiết bị này.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Khu vực phụ huynh' })).toHaveAttribute('href', '/hoc-cung-con/phu-huynh')
})
