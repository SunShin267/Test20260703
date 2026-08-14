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

  it('locks after five concurrent failed verifications', async () => {
    const repository = new AppRepository(new MemoryStorageAdapter())
    const pinService = new PinService(repository)
    const now = 1_760_000_000_000
    await pinService.setPin('1234')

    await Promise.all(Array.from({ length: 5 }, () => pinService.verifyPin('0000', now)))

    expect(repository.load().parentSettings).toMatchObject({
      failedPinAttempts: 5,
      pinLockedUntil: now + 300_000,
    })
    await expect(pinService.verifyPin('1234', now)).resolves.toEqual({ ok: false, lockedUntil: now + 300_000 })
  })

  it('does not lose concurrent failures across service and repository instances', async () => {
    const storage = new MemoryStorageAdapter()
    const owner = new PinService(new AppRepository(storage))
    const now = 1_760_000_000_000
    await owner.setPin('1234')
    const services = Array.from({ length: 5 }, () => new PinService(new AppRepository(storage)))

    await Promise.all(services.map(service => service.verifyPin('0000', now)))

    expect(new AppRepository(storage).load().parentSettings).toMatchObject({
      failedPinAttempts: 5,
      pinLockedUntil: now + 300_000,
    })
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

  it('does not let a stale first-PIN setup overwrite credentials created elsewhere', async () => {
    const storage = new MemoryStorageAdapter()
    const firstTab = new PinService(new AppRepository(storage))
    const staleTab = new PinService(new AppRepository(storage))

    await firstTab.setPin('1234')

    await expect(staleTab.setPin('5678')).rejects.toThrow('đã được thiết lập')
    await expect(new PinService(new AppRepository(storage)).verifyPin('1234')).resolves.toMatchObject({ ok: true })
  })

  it('changes a PIN only when the current PIN is correct', async () => {
    const pinService = new PinService(new AppRepository(new MemoryStorageAdapter()))

    await pinService.setPin('1234')

    await expect(pinService.changePin('0000', '5678')).resolves.toBe(false)
    await expect(pinService.changePin('1234', '5678')).resolves.toBe(true)
    await expect(pinService.verifyPin('5678')).resolves.toMatchObject({ ok: true })
  })
})
