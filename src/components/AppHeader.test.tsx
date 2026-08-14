import { cleanup, render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { MemoryRouter } from 'react-router-dom'
import { expect, it } from 'vitest'
import { AppHeader } from './AppHeader'

it('marks public and authenticated navigation variants for responsive layout', () => {
  render(<MemoryRouter><AppHeader /></MemoryRouter>)

  expect(screen.getByRole('navigation', { name: 'Điều hướng Học cùng con' })).toHaveClass(
    'app-header__nav',
    'app-header__nav--public',
  )

  cleanup()
  render(<MemoryRouter><AppHeader accountName="Phụ huynh" /></MemoryRouter>)

  expect(screen.getByRole('navigation', { name: 'Điều hướng Học cùng con' })).toHaveClass(
    'app-header__nav',
    'app-header__nav--authenticated',
  )
  expect(screen.getByRole('link', { name: 'Khu vực phụ huynh' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeInTheDocument()
})

it('stacks the mobile header, uses a two-column authenticated nav and keeps 44px targets', () => {
  const css = readFileSync('src/styles/global.css', 'utf8')

  expect(css).toMatch(
    /@media \(max-width: 559px\)\s*\{[\s\S]*?\.app-header__inner\s*\{[^}]*align-items:\s*stretch;[^}]*flex-direction:\s*column;/,
  )
  expect(css).toMatch(
    /@media \(max-width: 559px\)\s*\{[\s\S]*?\.app-header \.app-header__nav--authenticated\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/,
  )
  expect(css).toMatch(
    /@media \(max-width: 559px\)\s*\{[\s\S]*?\.app-header nav a:not\(\.button\),\s*\.header-sign-out,\s*\.button--small\s*\{[^}]*min-height:\s*2\.75rem;/,
  )
})
