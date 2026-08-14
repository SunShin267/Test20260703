import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, it } from 'vitest'
import { PracticeSetupDialog } from './PracticeSetupDialog'
import { TOPICS } from './topicCatalog'

const addTopic = TOPICS.find(topic => topic.id === 'add')!

function DialogHarness() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} type="button">Mở thiết lập</button>
      {open && <PracticeSetupDialog onClose={() => setOpen(false)} onStart={() => {}} topic={addTopic} />}
    </>
  )
}

it('focuses an initial control and traps Tab navigation within the dialog', async () => {
  const user = userEvent.setup()
  render(<DialogHarness />)
  await user.click(screen.getByRole('button', { name: 'Mở thiết lập' }))

  expect(screen.getByLabelText('Dễ')).toHaveFocus()
  await user.keyboard('{Shift>}{Tab}{/Shift}')
  expect(screen.getByRole('button', { name: 'Bắt đầu làm bài' })).toHaveFocus()
  await user.keyboard('{Tab}')
  expect(screen.getByLabelText('Dễ')).toHaveFocus()
})

it('closes on Escape and restores focus to the topic opener', async () => {
  const user = userEvent.setup()
  render(<DialogHarness />)
  const opener = screen.getByRole('button', { name: 'Mở thiết lập' })
  await user.click(opener)
  await user.keyboard('{Escape}')

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(opener).toHaveFocus()
})

it('announces a Vietnamese error when session creation fails', async () => {
  const user = userEvent.setup()
  render(<PracticeSetupDialog onClose={() => {}} onStart={() => { throw new Error('Không thể tạo đủ câu hỏi khác nhau') }} topic={addTopic} />)

  await user.click(screen.getByRole('button', { name: 'Bắt đầu làm bài' }))

  expect(screen.getByRole('alert')).toHaveTextContent('Không thể tạo đủ câu hỏi khác nhau')
})
