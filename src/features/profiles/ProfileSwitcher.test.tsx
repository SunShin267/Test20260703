import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { ProfileSwitcher } from './ProfileSwitcher'

it('marks the active child profile with aria-pressed and selects another profile', async () => {
  const user = userEvent.setup()
  const onSelect = vi.fn()

  render(
    <ProfileSwitcher
      profiles={[
        { id: 'an', name: 'An', grade: 1, avatar: '🌱', createdAt: '', updatedAt: '', schemaVersion: 1 },
        { id: 'binh', name: 'Bình', grade: 5, avatar: '🚀', createdAt: '', updatedAt: '', schemaVersion: 1 },
      ]}
      activeId="an"
      onSelect={onSelect}
    />,
  )

  expect(screen.getByRole('button', { name: /an/i })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: /bình/i })).toHaveAttribute('aria-pressed', 'false')
  await user.click(screen.getByRole('button', { name: /bình/i }))
  expect(onSelect).toHaveBeenCalledWith('binh')
})
