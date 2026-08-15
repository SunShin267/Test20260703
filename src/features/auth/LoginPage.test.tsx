import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../../test/renderApp'
import { createAppFixture } from '../../test/fixtures'

describe('LoginPage', () => {
  it('redirects an unauthenticated protected visit to login', async () => {
    renderApp('/')

    expect(await screen.findByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument()
    expect(screen.getByText(/chỉ được lưu trên thiết bị này/i)).toBeInTheDocument()
  })

  it('navigates to the SunShinSon Home after a successful family registration', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(await screen.findByRole('button', { name: 'Tạo tài khoản gia đình' }))
    await user.type(screen.getByLabelText('Tên đăng nhập'), 'gia-dinh-an')
    await user.type(screen.getByLabelText('Mật khẩu'), 'matkhau123')
    await user.click(screen.getByRole('button', { name: 'Tạo tài khoản gia đình' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'SunShinSon' })).toBeInTheDocument()
  })

  it('returns to login after signing out', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(await screen.findByRole('button', { name: 'Tạo tài khoản gia đình' }))
    await user.type(screen.getByLabelText('Tên đăng nhập'), 'gia-dinh-an')
    await user.type(screen.getByLabelText('Mật khẩu'), 'matkhau123')
    await user.click(screen.getByRole('button', { name: 'Tạo tài khoản gia đình' }))
    await user.click(await screen.findByRole('button', { name: 'Đăng xuất' }))

    expect(await screen.findByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument()
  })

  it('does not let a visitor replace an existing family account', async () => {
    const user = userEvent.setup()
    renderApp('/', createAppFixture({
      account: {
        username: 'gia-dinh-an',
        passwordSalt: 'abc123',
        passwordHash: 'a'.repeat(64),
        createdAt: '2026-08-15T00:00:00.000Z',
        updatedAt: '2026-08-15T00:00:00.000Z',
        schemaVersion: 1,
      },
    }))

    await user.click(await screen.findByRole('button', { name: 'Tạo tài khoản gia đình' }))
    await user.type(screen.getByLabelText('Tên đăng nhập'), 'nguoi-la')
    await user.type(screen.getByLabelText('Mật khẩu'), 'matkhau456')
    await user.click(screen.getByRole('button', { name: 'Tạo tài khoản gia đình' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Tài khoản gia đình đã tồn tại')
  })
})
