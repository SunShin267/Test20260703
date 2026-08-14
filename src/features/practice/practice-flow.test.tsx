import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { expect, it } from 'vitest'
import { AppProviders } from '../../app/AppProviders'
import { routes } from '../../app/router'
import { AuthService } from '../auth/authService'
import { SessionRepository } from '../auth/sessionRepository'
import { ProfileService } from '../profiles/profileService'
import { AppRepository } from '../../shared/storage/AppRepository'
import { MemoryStorageAdapter } from '../../shared/storage/MemoryStorageAdapter'
import { PracticeService } from './practiceService'
import type { AppData } from '../../shared/model/types'
import { render } from '@testing-library/react'

function seededAuthenticatedFamily(): AppData {
  return {
    schemaVersion: 1,
    account: { username: 'gia-dinh-an', passwordSalt: 'salt', passwordHash: 'hash', createdAt: '', updatedAt: '', schemaVersion: 1 },
    profiles: [{ id: 'an', name: 'An', grade: 1, avatar: '🌱', createdAt: '', updatedAt: '', schemaVersion: 1 }],
    activeProfileId: 'an',
    sessions: [],
    customQuestions: [],
    parentSettings: { pinSalt: null, pinHash: null, failedPinAttempts: 0, pinLockedUntil: null, weeklySessionGoal: 3, weeklyQuestionGoal: 20, updatedAt: '', schemaVersion: 1 },
    printSettings: { includeChildName: true, includeDate: true, answerKeyPlacement: 'last-page', updatedAt: '', schemaVersion: 1 },
  }
}

function renderAuthenticatedApp(path: string) {
  const storage = new MemoryStorageAdapter()
  const repository = new AppRepository(storage)
  repository.update(() => seededAuthenticatedFamily())
  const session = new SessionRepository(storage)
  session.set('gia-dinh-an')
  const authService = new AuthService(repository, session)
  const profileService = new ProfileService(repository)
  const practiceService = new PracticeService(repository, { random: () => 0.3 })
  const router = createMemoryRouter(routes, { initialEntries: [path] })

  render(
    <AppProviders services={{ repository, authService, profileService, practiceService }}>
      <RouterProvider router={router} />
    </AppProviders>,
  )

  return { repository, router }
}

it('creates, autosaves and completes a five-question session', async () => {
  const user = userEvent.setup()
  const { repository } = renderAuthenticatedApp('/hoc-cung-con/app')

  await user.click(await screen.findByRole('button', { name: 'Phép cộng' }))
  await user.click(screen.getByRole('button', { name: '5 câu' }))
  await user.click(screen.getByRole('button', { name: 'Bắt đầu làm bài' }))
  await user.type(screen.getByLabelText('Đáp án câu 1'), '10')
  expect(repository.load().sessions[0].answers).toHaveProperty(repository.load().sessions[0].questions[0].id, '10')

  const draft = repository.load().sessions[0]
  await user.click(screen.getByRole('button', { name: 'Phiếu bài tập' }))
  for (const [index, question] of draft.questions.entries()) {
    if (index === 0) continue
    await user.type(screen.getByLabelText(`Đáp án câu ${index + 1}`), question.answer)
  }
  await user.click(screen.getByRole('button', { name: 'Nộp bài' }))

  expect(await screen.findByText(/câu đúng/)).toBeInTheDocument()
  expect(repository.load().sessions[0].status).toBe('completed')
})
