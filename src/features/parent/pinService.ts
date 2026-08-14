import type { AppRepository } from '../../shared/storage/AppRepository'
import { createSalt, hashSecret, verifySecret } from '../../shared/security/hashSecret'

const lockoutDuration = 300_000
const pinPattern = /^\d{4}$/

export interface PinVerification {
  ok: boolean
  lockedUntil: number | null
}

interface PinCredentials {
  pinSalt: string | null
  pinHash: string | null
}

interface DetailedPinVerification extends PinVerification {
  credentials: PinCredentials | null
}

export class PinService {
  constructor(private readonly app: AppRepository) {}

  async setPin(pin: string): Promise<void> {
    validatePin(pin)
    const expectedCredentials = credentialsFor(this.app.load().parentSettings)
    if (expectedCredentials.pinSalt || expectedCredentials.pinHash) {
      throw new Error('Mã PIN phụ huynh đã được thiết lập')
    }
    const pinSalt = createSalt()
    const pinHash = await hashSecret(pin, pinSalt)
    const updatedAt = new Date().toISOString()
    let created = false

    this.app.update(data => {
      if (!sameCredentials(expectedCredentials, credentialsFor(data.parentSettings))) return data
      created = true
      return {
        ...data,
        parentSettings: { ...data.parentSettings, pinSalt, pinHash, failedPinAttempts: 0, pinLockedUntil: null, updatedAt },
      }
    })
    if (!created) throw new Error('Mã PIN phụ huynh đã được thiết lập ở nơi khác')
  }

  async verifyPin(pin: string, now = Date.now()): Promise<PinVerification> {
    validatePin(pin)
    const { ok, lockedUntil } = await this.verifyPinAgainstCurrentCredentials(pin, now)
    return { ok, lockedUntil }
  }

  private async verifyPinAgainstCurrentCredentials(pin: string, now: number, retries = 2): Promise<DetailedPinVerification> {
    const snapshot = this.app.load().parentSettings
    if (snapshot.pinLockedUntil !== null && snapshot.pinLockedUntil > now) {
      return { ok: false, lockedUntil: snapshot.pinLockedUntil, credentials: null }
    }

    const credentials = credentialsFor(snapshot)
    const ok = Boolean(credentials.pinSalt && credentials.pinHash && await verifySecret(pin, credentials.pinSalt, credentials.pinHash))
    const updatedAt = new Date().toISOString()
    let stale = false
    let result: DetailedPinVerification = { ok: false, lockedUntil: null, credentials: null }

    this.app.update(data => ({
      ...data,
      parentSettings: (() => {
        const latest = data.parentSettings
        if (!sameCredentials(credentials, credentialsFor(latest))) {
          stale = true
          return latest
        }
        if (latest.pinLockedUntil !== null && latest.pinLockedUntil > now) {
          result = { ok: false, lockedUntil: latest.pinLockedUntil, credentials: null }
          return latest
        }

        const priorFailedAttempts = latest.pinLockedUntil !== null && latest.pinLockedUntil <= now
          ? 0
          : latest.failedPinAttempts
        const failedPinAttempts = ok ? 0 : priorFailedAttempts + 1
        const pinLockedUntil = !ok && failedPinAttempts >= 5 ? now + lockoutDuration : null
        result = { ok, lockedUntil: pinLockedUntil, credentials: ok ? credentials : null }
        return { ...latest, failedPinAttempts, pinLockedUntil, updatedAt }
      })(),
    }))

    if (stale && retries > 0) return this.verifyPinAgainstCurrentCredentials(pin, now, retries - 1)
    return stale ? { ok: false, lockedUntil: null, credentials: null } : result
  }

  async changePin(currentPin: string, nextPin: string): Promise<boolean> {
    validatePin(currentPin)
    validatePin(nextPin)
    const verified = await this.verifyPinAgainstCurrentCredentials(currentPin, Date.now())
    if (!verified.ok) return false

    const pinSalt = createSalt()
    const pinHash = await hashSecret(nextPin, pinSalt)
    const updatedAt = new Date().toISOString()
    let changed = false
    this.app.update(data => {
      if (!verified.credentials || !sameCredentials(verified.credentials, credentialsFor(data.parentSettings))) return data
      changed = true
      return {
        ...data,
        parentSettings: { ...data.parentSettings, pinSalt, pinHash, failedPinAttempts: 0, pinLockedUntil: null, updatedAt },
      }
    })
    return changed
  }

  isPinSet(): boolean {
    const { pinSalt, pinHash } = this.app.load().parentSettings
    return Boolean(pinSalt && pinHash)
  }

  getLockState(now = Date.now()): { locked: boolean; lockedUntil: number | null } {
    const lockedUntil = this.app.load().parentSettings.pinLockedUntil
    return { locked: lockedUntil !== null && lockedUntil > now, lockedUntil: lockedUntil !== null && lockedUntil > now ? lockedUntil : null }
  }
}

function credentialsFor(settings: PinCredentials): PinCredentials {
  return { pinSalt: settings.pinSalt, pinHash: settings.pinHash }
}

function sameCredentials(left: PinCredentials, right: PinCredentials): boolean {
  return left.pinSalt === right.pinSalt && left.pinHash === right.pinHash
}

function validatePin(pin: string): void {
  if (!pinPattern.test(pin)) throw new Error('Mã PIN phải gồm đúng 4 chữ số')
}
