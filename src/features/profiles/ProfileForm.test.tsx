import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { ProfileForm } from './ProfileForm'

it('submits a name, a supported grade, and an avatar', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn()

  render(<ProfileForm onSubmit={onSubmit} />)

  await user.type(screen.getByLabelText('Tên bé'), 'An')
  await user.selectOptions(screen.getByLabelText('Lớp'), '3')
  await user.selectOptions(screen.getByLabelText('Ảnh đại diện'), '🚀')
  await user.click(screen.getByRole('button', { name: 'Lưu hồ sơ' }))

  expect(onSubmit).toHaveBeenCalledWith({ name: 'An', grade: 3, avatar: '🚀' })
})
