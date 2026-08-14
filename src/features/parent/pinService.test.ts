import { describe, expect, it } from 'vitest'
import { MemoryStorageAdapter } from '../../shared/storage/MemoryStorageAdapter'
import { AppRepository } from '../../shared/storage/AppRepository'
import { PinService } from './pinService'

describe('PinService', () => {
  it('locks PIN verification after five failures for five minutes', async () => {
    const repository = new AppRepository(new MemoryStorageAdapter())
    const pinService = new PinService(repository)
    const now = 1_760_000_000_000

    await pinService.setPin('1234')
    for (let i = 0; i < 5; i += 1) await pinService.verifyPin('0000', now)

    expect(pinService.getLockState(now).lockedUntil).toBe(now + 300_000)
    expect(repository.load().parentSettings.pinHash).not.toBe('1234')
  })

  it('resets failed attempts after a successful verification', async () => {
    const repository = new AppRepository(new MemoryStorageAdapter())
    const pinService = new PinService(repository)

    await pinService.setPin('1234')
    await pinService.verifyPin('0000')
    await expect(pinService.verifyPin('1234')).resolves.toMatchObject({ ok: true, lockedUntil: null })

    expect(repository.load().parentSettings.failedPinAttempts).toBe(0)
  })

  it('allows a new set of attempts after a lock expires', async () => {
    const repository = new AppRepository(new MemoryStorageAdapter())
    const pinService = new PinService(repository)
    const now = 1_760_000_000_000

    await pinService.setPin('1234')
    for (let i = 0; i < 5; i += 1) await pinService.verifyPin('0000', now)

    await expect(pinService.verifyPin('0000', now + 300_001)).resolves.toEqual({ ok: false, lockedUntil: null })
    expect(repository.load().parentSettings.failedPinAttempts).toBe(1)
  })

  it('only accepts exactly four digits for PIN values', async () => {
    const pinService = new PinService(new AppRepository(new MemoryStorageAdapter()))

    await expect(pinService.setPin('123')).rejects.toThrow('Mã PIN phải gồm đúng 4 chữ số')
  })

  it('changes a PIN only when the current PIN is correct', async () => {
    const pinService = new PinService(new AppRepository(new MemoryStorageAdapter()))

    await pinService.setPin('1234')

    await expect(pinService.changePin('0000', '5678')).resolves.toBe(false)
    await expect(pinService.changePin('1234', '5678')).resolves.toBe(true)
    await expect(pinService.verifyPin('5678')).resolves.toMatchObject({ ok: true })
  })
})
