import { screen } from '@testing-library/react'
import { renderApp } from '../test/renderApp'

it.each([
  ['/login', 'Đăng nhập'],
  ['/hoc-cung-con', '5 phút mỗi ngày, con vững Toán cả năm'],
])('renders %s', async (path, heading) => {
  renderApp(path)

  expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
})

it('redirects protected routes to login without a local session', async () => {
  renderApp('/hoc-cung-con/phu-huynh')

  expect(await screen.findByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument()
})
