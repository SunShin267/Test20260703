import { describe, expect, it } from 'vitest'
import { sitePath } from './sitePath'

describe('sitePath', () => {
  it('keeps root-hosted paths unchanged', () => {
    expect(sitePath('/games/co-vua.html', '/')).toBe('/games/co-vua.html')
  })

  it('prefixes static paths with a repository Pages base', () => {
    expect(sitePath('/games/co-vua.html', '/Test20260703/')).toBe('/Test20260703/games/co-vua.html')
  })
})
