import { screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { renderApp } from '../test/renderApp'

it('renders a complete, keyboard-navigable three-step landing experience', async () => {
  renderApp('/hoc-cung-con')

  expect(await screen.findByRole('heading', { name: /5 phút mỗi ngày, con vững Toán cả năm/i })).toBeInTheDocument()
  expect(screen.getByRole('navigation', { name: 'Điều hướng Học cùng con' })).toBeInTheDocument()
  expect(screen.getByLabelText('Minh họa màn hình bài luyện Toán')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Dùng thử miễn phí' })).toHaveAttribute('href', '/hoc-cung-con/app')
  expect(screen.getByRole('heading', { name: 'Chỉ 3 bước là xong' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Mỗi buổi học nhẹ nhàng hơn' })).toBeInTheDocument()
  expect(screen.getByRole('contentinfo')).toBeInTheDocument()
})

it('uses truthful grade and topic proof in the landing content', async () => {
  renderApp('/hoc-cung-con')

  expect(await screen.findByText('18 chủ đề Toán')).toBeInTheDocument()
  expect(screen.getByText('Lớp 1–5')).toBeInTheDocument()
  expect(screen.getByText('Luyện mọi lúc')).toBeInTheDocument()
})
