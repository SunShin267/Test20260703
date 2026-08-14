import type { AppData } from '../model/types'
import { appDataSchema, parseAndMigrate } from './appDataSchema'
import type { StorageAdapter } from './StorageAdapter'

export class AppRepository {
  constructor(private readonly storage: StorageAdapter, private readonly key = 'hoc-cung-con:v1') {}

  load(): AppData {
    return parseAndMigrate(this.storage.get(this.key))
  }

  update(mutator: (data: AppData) => AppData): AppData {
    const next = appDataSchema.parse(mutator(this.load()))
    this.storage.set(this.key, JSON.stringify(next))
    return next
  }

  reset(): void {
    this.storage.remove(this.key)
  }
}
