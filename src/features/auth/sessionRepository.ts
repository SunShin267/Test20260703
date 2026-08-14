import type { StorageAdapter } from '../../shared/storage/StorageAdapter'

export class SessionRepository {
  private readonly key = 'hoc-cung-con:session:v1'

  constructor(private readonly storage: StorageAdapter) {}

  get(): string | null {
    return this.storage.get(this.key)
  }

  set(username: string): void {
    this.storage.set(this.key, username)
  }

  clear(): void {
    this.storage.remove(this.key)
  }
}
