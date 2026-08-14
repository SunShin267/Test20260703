import type { StorageAdapter } from './StorageAdapter'

export class MemoryStorageAdapter implements StorageAdapter {
  private readonly values = new Map<string, string>()

  get(key: string): string | null {
    return this.values.get(key) ?? null
  }

  set(key: string, value: string): void {
    this.values.set(key, value)
  }

  remove(key: string): void {
    this.values.delete(key)
  }
}
