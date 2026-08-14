import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { routes } from './router'

it.each([
  ['/', 'Game Hub'],
  ['/login', 'Đăng nhập'],
  ['/hoc-cung-con', 'Học cùng con'],
])('renders %s', async (path, heading) => {
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />)

  expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
})
