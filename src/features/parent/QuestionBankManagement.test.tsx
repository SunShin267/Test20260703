import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { QuestionBankManagement } from './QuestionBankManagement'
import { QuestionBankService } from '../practice/questionBankService'
import { AppRepository } from '../../shared/storage/AppRepository'
import { MemoryStorageAdapter } from '../../shared/storage/MemoryStorageAdapter'

it('adds, filters, edits, and deletes a custom question through the parent UI', async () => {
  const user = userEvent.setup()
  const service = new QuestionBankService(new AppRepository(new MemoryStorageAdapter()))
  render(<QuestionBankManagement service={service} />)

  await user.click(screen.getByRole('button', { name: 'Thêm câu hỏi' }))
  await user.selectOptions(screen.getByLabelText('Chủ đề'), 'add')
  await user.clear(screen.getByLabelText('Lớp câu hỏi'))
  await user.type(screen.getByLabelText('Lớp câu hỏi'), '1')
  await user.type(screen.getByLabelText('Đề bài'), '2 + 3 = ?')
  await user.type(screen.getByLabelText('Đáp án'), '5')
  await user.type(screen.getByLabelText('Giải thích'), 'Cộng 2 với 3 được 5.')
  await user.click(screen.getByRole('button', { name: 'Lưu câu hỏi' }))

  expect(await screen.findByText('2 + 3 = ?')).toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('Lọc chủ đề'), 'add')
  await user.click(screen.getByRole('button', { name: 'Sửa câu hỏi 2 + 3 = ?' }))
  await user.clear(screen.getByLabelText('Đáp án'))
  await user.type(screen.getByLabelText('Đáp án'), 'năm')
  await user.click(screen.getByRole('button', { name: 'Lưu câu hỏi' }))
  expect(screen.getByText('Đáp án: năm')).toBeInTheDocument()

  const deleteOpener = screen.getByRole('button', { name: 'Xóa câu hỏi 2 + 3 = ?' })
  await user.click(deleteOpener)
  expect(screen.getByRole('dialog', { name: 'Xóa câu hỏi' })).toHaveTextContent('2 + 3 = ?')
  expect(screen.getByRole('button', { name: 'Xác nhận xóa câu hỏi' })).toHaveFocus()
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog', { name: 'Xóa câu hỏi' })).not.toBeInTheDocument()
  expect(deleteOpener).toHaveFocus()
  await user.click(deleteOpener)
  await user.click(screen.getByRole('button', { name: 'Xác nhận xóa câu hỏi' }))
  expect(screen.queryByText('2 + 3 = ?')).not.toBeInTheDocument()
})
