import { existsSync, readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const games = [
  ['co-caro.html', 'id="board"'],
  ['co-vua.html', 'id="board"'],
  ['random-number-page.html', 'id="generateBtn"'],
] as const

it('ships the shared legacy theme asset', () => {
  const cssFile = 'public/legacy-theme.css'
  const css = readFileSync(cssFile, 'utf8')
  expect(existsSync(cssFile)).toBe(true)
  expect(css).toMatch(/\.legacy-app-header \.home-logo\.legacy-home-link\s*\{[^}]*color:\s*var\(--legacy-navy\)/s)
  expect(css).toContain('body:has(> .legacy-app-header--stacked)')
  expect(css).toMatch(/\.legacy-app-header \+ \.wrap \.layout\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/s)
  expect(css).toMatch(/@media \(max-width: 420px\)\s*\{[\s\S]*body:has\(> \.legacy-app-header--stacked\)\s*\{[^}]*display:\s*block/s)
  expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*\*,\s*\*::before,\s*\*::after\s*\{[^}]*animation-duration:\s*\.01ms !important;[^}]*animation-iteration-count:\s*1 !important;[^}]*scroll-behavior:\s*auto !important;[^}]*transition-duration:\s*\.01ms !important;/s)
})

it.each(games)('%s loads the shared theme and keeps its game entry point', (file, gameEntryPoint) => {
  const html = readFileSync(`public/games/${file}`, 'utf8')

  expect(html).toContain('../legacy-theme.css')
  expect(html).toContain('legacy-app-header')
  expect(html).toContain('legacy-home-link')
  expect(html).toContain('href="../"')
  expect(html).toContain('Về Game Hub')
  expect(html).toContain(gameEntryPoint)
})

it('keeps the former worksheet URL as an accessible Học cùng con redirect', () => {
  const html = readFileSync('public/bai-tap-ai.html', 'utf8')

  expect(html).toContain('http-equiv="refresh"')
  expect(html).toContain('url=./hoc-cung-con')
  expect(html).toContain('href="./hoc-cung-con"')
})

it('marks the flex-based random-number page so the shared mobile theme can stack its header', () => {
  const html = readFileSync('public/games/random-number-page.html', 'utf8')

  expect(html).toContain('legacy-app-header--stacked')
})
