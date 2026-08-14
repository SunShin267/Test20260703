import type { AppRepository } from '../../shared/storage/AppRepository'
import { createSalt, hashSecret, verifySecret } from '../../shared/security/hashSecret'

const lockoutDuration = 300_000
const pinPattern = /^\d{4}$/

export interface PinVerification {
  ok: boolean
  lockedUntil: number | null
}

export class PinService {
  private verificationQueue: Promise<void> = Promise.resolve()

  constructor(private readonly app: AppRepository) {}

  async setPin(pin: string): Promise<void> {
    validatePin(pin)
    const pinSalt = createSalt()
    const pinHash = await hashSecret(pin, pinSalt)
    const updatedAt = new Date().toISOString()

    this.app.update(data => ({
      ...data,
      parentSettings: { ...data.parentSettings, pinSalt, pinHash, failedPinAttempts: 0, pinLockedUntil: null, updatedAt },
    }))
  }

  async verifyPin(pin: string, now = Date.now()): Promise<PinVerification> {
    validatePin(pin)
    const verification = this.verificationQueue.then(() => this.verifyPinInOrder(pin, now))
    this.verificationQueue = verification.then(() => undefined, () => undefined)
    return verification
  }

  private async verifyPinInOrder(pin: string, now: number): Promise<PinVerification> {
    const settings = this.app.load().parentSettings
    if (settings.pinLockedUntil !== null && settings.pinLockedUntil > now) {
      return { ok: false, lockedUntil: settings.pinLockedUntil }
    }

    const ok = Boolean(settings.pinSalt && settings.pinHash && await verifySecret(pin, settings.pinSalt, settings.pinHash))
    const priorFailedAttempts = settings.pinLockedUntil !== null && settings.pinLockedUntil <= now
      ? 0
      : settings.failedPinAttempts
    const failedPinAttempts = ok ? 0 : priorFailedAttempts + 1
    const pinLockedUntil = !ok && failedPinAttempts >= 5 ? now + lockoutDuration : null
    const updatedAt = new Date().toISOString()

    this.app.update(data => ({
      ...data,
      parentSettings: {
        ...data.parentSettings,
        failedPinAttempts,
        pinLockedUntil,
        updatedAt,
      },
    }))

    return { ok, lockedUntil: pinLockedUntil }
  }

  async changePin(currentPin: string, nextPin: string): Promise<boolean> {
    validatePin(nextPin)
    const verified = await this.verifyPin(currentPin)
    if (!verified.ok) return false
    await this.setPin(nextPin)
    return true
  }

  getLockState(now = Date.now()): { locked: boolean; lockedUntil: number | null } {
    const lockedUntil = this.app.load().parentSettings.pinLockedUntil
    return { locked: lockedUntil !== null && lockedUntil > now, lockedUntil: lockedUntil !== null && lockedUntil > now ? lockedUntil : null }
  }
}

function validatePin(pin: string): void {
  if (!pinPattern.test(pin)) throw new Error('Mã PIN phải gồm đúng 4 chữ số')
}
