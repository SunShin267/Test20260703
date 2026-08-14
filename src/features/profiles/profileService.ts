import type { ChildProfile, SupportedGrade } from '../../shared/model/types'
import type { AppRepository } from '../../shared/storage/AppRepository'

export type ProfileInput = Pick<ChildProfile, 'name' | 'grade' | 'avatar'>

export class ProfileService {
  constructor(private readonly app: AppRepository) {}

  list(): ChildProfile[] {
    return this.app.load().profiles
  }

  create(input: ProfileInput): ChildProfile {
    const details = normalizeInput(input)
    const now = new Date().toISOString()
    const profile: ChildProfile = {
      id: crypto.randomUUID(),
      ...details,
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
    }
    const data = this.app.update(current => ({
      ...current,
      profiles: [...current.profiles, profile],
      activeProfileId: current.activeProfileId ?? profile.id,
    }))
    return data.profiles.find(candidate => candidate.id === profile.id)!
  }

  update(id: string, patch: ProfileInput): ChildProfile {
    const details = normalizeInput(patch)
    const updatedAt = new Date().toISOString()
    const data = this.app.update(current => {
      if (!current.profiles.some(profile => profile.id === id)) throw new Error('Không tìm thấy hồ sơ')
      return {
        ...current,
        profiles: current.profiles.map(profile => profile.id === id
          ? { ...profile, ...details, updatedAt }
          : profile),
      }
    })
    return data.profiles.find(profile => profile.id === id)!
  }

  remove(id: string, options: { allowEmpty?: boolean } = {}): void {
    this.app.update(current => {
      const profileIndex = current.profiles.findIndex(profile => profile.id === id)
      if (profileIndex === -1) throw new Error('Không tìm thấy hồ sơ')
      if (current.profiles.length === 1 && !options.allowEmpty) throw new Error('Cần giữ lại ít nhất một hồ sơ')

      const profiles = current.profiles.filter(profile => profile.id !== id)
      const activeProfileId = current.activeProfileId === id
        ? (profiles[profileIndex]?.id ?? profiles[profileIndex - 1]?.id ?? null)
        : current.activeProfileId

      return {
        ...current,
        profiles,
        activeProfileId,
        sessions: current.sessions.filter(session => session.profileId !== id),
      }
    })
  }

  select(id: string): void {
    this.app.update(current => {
      if (!current.profiles.some(profile => profile.id === id)) throw new Error('Không tìm thấy hồ sơ')
      return { ...current, activeProfileId: id }
    })
  }

  getActive(): ChildProfile | null {
    const data = this.app.load()
    return data.profiles.find(profile => profile.id === data.activeProfileId) ?? null
  }

}

function normalizeInput(input: ProfileInput): ProfileInput {
  const name = input.name.trim()
  if (!name || !isSupportedGrade(input.grade)) throw new Error('Hồ sơ chưa hợp lệ')
  return { ...input, name }
}

function isSupportedGrade(grade: number): grade is SupportedGrade {
  return Number.isInteger(grade) && grade >= 1 && grade <= 5
}
