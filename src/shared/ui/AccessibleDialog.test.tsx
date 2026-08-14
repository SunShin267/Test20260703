import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef, useState } from 'react'
import { expect, it } from 'vitest'
import { AccessibleDialog } from './AccessibleDialog'

function DialogHarness() {
  const [open, setOpen] = useState(false)
  const initialFocusRef = useRef<HTMLInputElement>(null)
  return <>
    <button onClick={() => setOpen(true)} type="button">Mở hộp thoại</button>
    {open && <AccessibleDialog initialFocusRef={initialFocusRef} onClose={() => setOpen(false)} title="Thiết lập">
      <input aria-label="Trường đầu tiên" ref={initialFocusRef} />
      <button type="button">Lưu</button>
    </AccessibleDialog>}
  </>
}

it('focuses the supplied control and traps Tab navigation', async () => {
  const user = userEvent.setup()
  render(<DialogHarness />)
  await user.click(screen.getByRole('button', { name: 'Mở hộp thoại' }))

  expect(screen.getByLabelText('Trường đầu tiên')).toHaveFocus()
  await user.keyboard('{Shift>}{Tab}{/Shift}')
  expect(screen.getByRole('button', { name: 'Lưu' })).toHaveFocus()
  await user.keyboard('{Tab}')
  expect(screen.getByLabelText('Trường đầu tiên')).toHaveFocus()
})

it('closes on Escape and restores focus to its opener', async () => {
  const user = userEvent.setup()
  render(<DialogHarness />)
  const opener = screen.getByRole('button', { name: 'Mở hộp thoại' })
  await user.click(opener)
  await user.keyboard('{Escape}')

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(opener).toHaveFocus()
})
