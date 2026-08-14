import type { AppRepository } from '../../shared/storage/AppRepository'
import { createSalt, hashSecret, verifySecret } from '../../shared/security/hashSecret'
import type { SessionRepository } from './sessionRepository'

export class AuthService {
  constructor(private readonly app: AppRepository, private readonly session: SessionRepository) {}

  async register(username: string, password: string): Promise<void> {
    const normalized = username.trim().toLowerCase()
    if (normalized.length < 3 || password.length < 8) throw new Error('Thông tin đăng ký chưa hợp lệ')
    if (this.app.load().account) throw new Error('Tài khoản gia đình đã tồn tại')

    const passwordSalt = createSalt()
    const passwordHash = await hashSecret(password, passwordSalt)
    const now = new Date().toISOString()

    this.app.update(data => ({
      ...data,
      account: { username: normalized, passwordSalt, passwordHash, createdAt: now, updatedAt: now, schemaVersion: 1 },
    }))
    this.session.set(normalized)
  }

  async signIn(username: string, password: string): Promise<boolean> {
    const account = this.app.load().account
    const normalized = username.trim().toLowerCase()
    const ok = Boolean(account && account.username === normalized && await verifySecret(password, account.passwordSalt, account.passwordHash))
    if (ok) this.session.set(account!.username)
    return ok
  }

  signOut(): void {
    this.session.clear()
  }

  isAuthenticated(): boolean {
    return this.session.get() === this.app.load().account?.username
  }
}
