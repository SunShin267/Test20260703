import { useState } from 'react'
import { ProfileForm } from '../profiles/ProfileForm'
import type { ProfileInput, ProfileService } from '../profiles/profileService'
import type { ChildProfile } from '../../shared/model/types'

export function ProfileManagement({ profiles, activeId, service, onChanged }: { profiles: ChildProfile[]; activeId: string | null; service: ProfileService; onChanged: () => void }) {
  const [editing, setEditing] = useState<ChildProfile | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<ChildProfile | null>(null)
  const [error, setError] = useState('')

  function save(input: ProfileInput) {
    try {
      if (editing) service.update(editing.id, input)
      else service.create(input)
      setEditing(null); setCreating(false); setError(''); onChanged()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể lưu hồ sơ') }
  }

  function remove() {
    if (!deleting) return
    try { service.remove(deleting.id); setDeleting(null); setError(''); onChanged() }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể xóa hồ sơ'); setDeleting(null) }
  }

  return <section aria-labelledby="profiles-heading">
    <h2 id="profiles-heading">Quản lý hồ sơ</h2>
    {error && <p role="alert">{error}</p>}
    <ul>{profiles.map(profile => <li key={profile.id}>
      <strong>{profile.avatar} {profile.name}{profile.id === activeId ? ' (đang chọn)' : ''}</strong>
      <div className="button-row"><button type="button" onClick={() => { service.select(profile.id); onChanged() }}>Chọn {profile.name}</button><button type="button" onClick={() => { setEditing(profile); setCreating(false) }}>Sửa {profile.name}</button><button type="button" onClick={() => setDeleting(profile)}>Xóa {profile.name}</button></div>
    </li>)}</ul>
    <button type="button" onClick={() => { setCreating(true); setEditing(null) }}>Thêm hồ sơ</button>
    {(creating || editing) && <div aria-label={editing ? 'Sửa hồ sơ' : 'Thêm hồ sơ'} className="dialog" role="dialog" aria-modal="true">
      <h3>{editing ? `Sửa hồ sơ ${editing.name}` : 'Thêm hồ sơ'}</h3>
      <ProfileForm initialValue={editing ? { name: editing.name, grade: editing.grade, avatar: editing.avatar } : undefined} onSubmit={save} />
      <button type="button" onClick={() => { setCreating(false); setEditing(null) }}>Hủy</button>
    </div>}
    {deleting && <div aria-label="Xóa hồ sơ" className="dialog" role="dialog" aria-modal="true">
      <h3>Xóa hồ sơ {deleting.name}?</h3><p>Các bài luyện của {deleting.name} cũng sẽ bị xóa.</p>
      <button type="button" onClick={remove}>Xác nhận xóa hồ sơ</button><button type="button" onClick={() => setDeleting(null)}>Hủy</button>
    </div>}
  </section>
}
