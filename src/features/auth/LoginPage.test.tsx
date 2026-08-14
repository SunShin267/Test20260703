import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../../test/renderApp'

describe('LoginPage', () => {
  it('redirects an unauthenticated protected visit to login', async () => {
    renderApp('/')

    expect(await screen.findByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument()
    expect(screen.getByText(/chỉ được lưu trên thiết bị này/i)).toBeInTheDocument()
  })

  it('navigates to Game Hub after a successful family registration', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(await screen.findByRole('button', { name: 'Tạo tài khoản gia đình' }))
    await user.type(screen.getByLabelText('Tên đăng nhập'), 'gia-dinh-an')
    await user.type(screen.getByLabelText('Mật khẩu'), 'matkhau123')
    await user.click(screen.getByRole('button', { name: 'Tạo tài khoản gia đình' }))

    expect(await screen.findByRole('heading', { name: 'Game Hub' })).toBeInTheDocument()
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
})
