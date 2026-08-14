import { AuthService } from './authService'
import { SessionRepository } from './sessionRepository'
import { AppRepository } from '../../shared/storage/AppRepository'
import { MemoryStorageAdapter } from '../../shared/storage/MemoryStorageAdapter'

describe('AuthService', () => {
  function createService() {
    const storage = new MemoryStorageAdapter()
    const repository = new AppRepository(storage)
    const session = new SessionRepository(storage)
    return { repository, session, service: new AuthService(repository, session) }
  }

  it('never stores the raw password', async () => {
    const { repository, service } = createService()

    await service.register('gia-dinh-an', 'matkhau123')

    const account = repository.load().account!
    expect(account.passwordHash).not.toContain('matkhau123')
    expect(account.passwordSalt).not.toHaveLength(0)
  })

  it('rejects an incorrect password', async () => {
    const { service } = createService()
    await service.register('gia-dinh-an', 'matkhau123')

    await expect(service.signIn('gia-dinh-an', 'sai-mat-khau')).resolves.toBe(false)
  })

  it('starts and clears only the local session', async () => {
    const { repository, session, service } = createService()
    await service.register('gia-dinh-an', 'matkhau123')

    expect(service.isAuthenticated()).toBe(true)
    service.signOut()

    expect(session.get()).toBeNull()
    expect(repository.load().account?.username).toBe('gia-dinh-an')
  })

  it('rejects registration information below the minimum lengths', async () => {
    const { service } = createService()

    await expect(service.register('an', 'matkhau123')).rejects.toThrow('Thông tin đăng ký chưa hợp lệ')
    await expect(service.register('gia-dinh-an', 'ngan')).rejects.toThrow('Thông tin đăng ký chưa hợp lệ')
  })

  it('rejects registration when a family account already exists', async () => {
    const { repository, session, service } = createService()
    await service.register('gia-dinh-an', 'matkhau123')
    const existingAccount = repository.load().account
    service.signOut()

    await expect(service.register('nguoi-la', 'matkhau456')).rejects.toThrow('Tài khoản gia đình đã tồn tại')

    expect(repository.load().account).toEqual(existingAccount)
    expect(session.get()).toBeNull()
  })
})
