import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, it } from 'vitest'
import { AppProviders } from '../../app/AppProviders'
import { ProfileService } from '../profiles/profileService'
import { AppRepository } from '../../shared/storage/AppRepository'
import { MemoryStorageAdapter } from '../../shared/storage/MemoryStorageAdapter'
import { PracticePage } from './PracticePage'
import { PracticeService } from './practiceService'

function renderPractice() {
  const repository = new AppRepository(new MemoryStorageAdapter())
  repository.update(data => ({
    ...data,
    profiles: [{ id: 'an', name: 'An', grade: 1, avatar: '🌱', createdAt: '', updatedAt: '', schemaVersion: 1 }],
    activeProfileId: 'an',
  }))
  const practiceService = new PracticeService(repository, { random: () => 0.3 })
  const session = practiceService.createSession('an', 'add', 'easy', 5)

  render(
    <AppProviders services={{ repository, profileService: new ProfileService(repository), practiceService }}>
      <MemoryRouter><PracticePage sessionId={session.id} onBack={() => {}} /></MemoryRouter>
    </AppProviders>,
  )
  return { repository, session }
}

it('switches between one-question and worksheet modes while retaining autosaved answers', async () => {
  const user = userEvent.setup()
  const { repository, session } = renderPractice()

  await user.type(screen.getByLabelText('Đáp án câu 1'), '7')
  await user.click(screen.getByRole('button', { name: 'Phiếu bài tập' }))

  expect(screen.getByLabelText('Đáp án câu 5')).toBeInTheDocument()
  expect(screen.getByLabelText('Đáp án câu 1')).toHaveValue('7')
  expect(repository.load().sessions[0].answers[session.questions[0].id]).toBe('7')
})

it('shows explanations, text feedback, a badge and encouragement after submitting', async () => {
  const user = userEvent.setup()
  const { session } = renderPractice()

  await user.click(screen.getByRole('button', { name: 'Phiếu bài tập' }))
  for (const [index, question] of session.questions.entries()) {
    await user.type(screen.getByLabelText(`Đáp án câu ${index + 1}`), question.answer)
  }
  await user.click(screen.getByRole('button', { name: 'Nộp bài' }))

  expect(await screen.findByText('5/5 câu đúng · 100%')).toBeInTheDocument()
  expect(screen.getByText(/Huy hiệu:/)).toBeInTheDocument()
  expect(screen.getAllByText(/Giải thích:/)).toHaveLength(5)
  expect(screen.getAllByText(/Đúng/)).toHaveLength(5)
})

it('offers a blank printable worksheet for the completed child session', async () => {
  const user = userEvent.setup()
  const { session } = renderPractice()

  await user.click(screen.getByRole('button', { name: 'Nộp bài' }))

  expect(await screen.findByRole('button', { name: 'In phiếu bài tập' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'In kèm đáp án' })).not.toBeInTheDocument()
  expect(screen.queryByText(session.questions[0].answer)).not.toBeInTheDocument()
})
