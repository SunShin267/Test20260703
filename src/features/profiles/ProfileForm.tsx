import { type FormEvent, type RefObject } from 'react'
import type { ProfileInput } from './profileService'

interface ProfileFormProps {
  initialValue?: ProfileInput
  onSubmit: (profile: ProfileInput) => void
  initialFocusRef?: RefObject<HTMLInputElement | null>
}

const avatars = ['🌱', '🚀', '🌟', '🐼']

export function ProfileForm({ initialValue, onSubmit, initialFocusRef }: ProfileFormProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    onSubmit({
      name: String(data.get('name') ?? ''),
      grade: Number(data.get('grade')) as ProfileInput['grade'],
      avatar: String(data.get('avatar') ?? ''),
    })
  }

  return (
    <form onSubmit={submit}>
      <label>
        Tên bé
        <input defaultValue={initialValue?.name ?? ''} name="name" ref={initialFocusRef} required />
      </label>
      <label>
        Lớp
        <select defaultValue={String(initialValue?.grade ?? 1)} name="grade">
          {[1, 2, 3, 4, 5].map(grade => <option key={grade} value={grade}>Lớp {grade}</option>)}
        </select>
      </label>
      <label>
        Ảnh đại diện
        <select defaultValue={initialValue?.avatar ?? avatars[0]} name="avatar">
          {avatars.map(avatar => <option key={avatar} value={avatar}>{avatar}</option>)}
        </select>
      </label>
      <button type="submit">Lưu hồ sơ</button>
    </form>
  )
}
