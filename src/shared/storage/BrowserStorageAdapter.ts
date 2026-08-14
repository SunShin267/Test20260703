import type { StorageAdapter } from './StorageAdapter'

export class BrowserStorageAdapter implements StorageAdapter {
  constructor(private readonly storage: Storage = window.localStorage) {}

  get(key: string): string | null {
    return this.storage.getItem(key)
  }

  set(key: string, value: string): void {
    this.storage.setItem(key, value)
  }

  remove(key: string): void {
    this.storage.removeItem(key)
  }
}
