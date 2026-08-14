import { createSalt, hashSecret, verifySecret } from './hashSecret'

describe('hashSecret', () => {
  it('creates a stable SHA-256 hash for the same secret and salt', async () => {
    await expect(hashSecret('matkhau123', 'abc123')).resolves.toHaveLength(64)
    await expect(hashSecret('matkhau123', 'abc123')).resolves.toBe(await hashSecret('matkhau123', 'abc123'))
  })

  it('verifies only the original secret', async () => {
    const hash = await hashSecret('matkhau123', 'abc123')

    await expect(verifySecret('matkhau123', 'abc123', hash)).resolves.toBe(true)
    await expect(verifySecret('sai-mat-khau', 'abc123', hash)).resolves.toBe(false)
  })

  it('creates a non-empty random salt', () => {
    expect(createSalt()).toMatch(/^[0-9a-f]{32}$/)
  })
})
