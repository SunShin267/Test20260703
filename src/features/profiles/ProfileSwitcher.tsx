import type { ChildProfile } from '../../shared/model/types'

interface ProfileSwitcherProps {
  profiles: ChildProfile[]
  activeId: string | null
  onSelect: (id: string) => void
}

export function ProfileSwitcher({ profiles, activeId, onSelect }: ProfileSwitcherProps) {
  return (
    <div aria-label="Chọn hồ sơ bé" role="group">
      {profiles.map(profile => (
        <button aria-pressed={profile.id === activeId} key={profile.id} onClick={() => onSelect(profile.id)} type="button">
          {profile.avatar} {profile.name}
        </button>
      ))}
    </div>
  )
}
