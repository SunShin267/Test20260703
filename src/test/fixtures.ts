import type { AppData } from '../shared/model/types'
import { createDefaultAppData } from '../shared/storage/appDataSchema'

export function createAppFixture(overrides: Partial<AppData> = {}): AppData {
  return { ...createDefaultAppData(), ...overrides }
}
