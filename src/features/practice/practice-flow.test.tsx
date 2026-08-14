import { cleanup, screen } from '@testing-library/react'
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

function renderAuthenticatedApp(path: string, suppliedRepository?: AppRepository) {
  const storage = new MemoryStorageAdapter()
  const repository = suppliedRepository ?? new AppRepository(storage)
  if (!suppliedRepository) repository.update(() => seededAuthenticatedFamily())
  const session = new SessionRepository(storage)
  session.set('gia-dinh-an')
  const authService = new AuthService(repository, session)
  const profileService = new ProfileService(repository)
  let clockTick = 0
  const practiceService = new PracticeService(repository, {
    random: () => 0.3,
    now: () => `2026-08-15T00:00:${String(clockTick++).padStart(2, '0')}.000Z`,
  })
  const router = createMemoryRouter(routes, { initialEntries: [path] })

  render(
    <AppProviders services={{ repository, authService, profileService, practiceService }}>
      <RouterProvider router={router} />
    </AppProviders>,
  )

  return { repository, router, practiceService }
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

it('passes a selected hard ten-question setup into the persisted session', async () => {
  const user = userEvent.setup()
  const { repository } = renderAuthenticatedApp('/hoc-cung-con/app')

  await user.click(await screen.findByRole('button', { name: 'Phép cộng' }))
  await user.click(screen.getByLabelText('Khó'))
  await user.click(screen.getByRole('button', { name: '10 câu' }))
  await user.click(screen.getByRole('button', { name: 'Bắt đầu làm bài' }))

  expect(repository.load().sessions[0].questions).toHaveLength(10)
  expect(repository.load().sessions[0].questions.every(question => question.difficulty === 'hard')).toBe(true)
})

it('loads the requested draft from a session query after a fresh router mount', async () => {
  const { repository, practiceService } = renderAuthenticatedApp('/hoc-cung-con/app')
  const otherDraft = practiceService.createSession('an', 'subtract', 'easy', 5)
  const targetDraft = practiceService.createSession('an', 'add', 'medium', 5)
  practiceService.answer(targetDraft.id, targetDraft.questions[0].id, 'đáp án draft mục tiêu')
  practiceService.answer(otherDraft.id, otherDraft.questions[0].id, 'đáp án draft khác')
  const drafts = repository.load().sessions
  expect(drafts.map(draft => draft.id)).toEqual([otherDraft.id, targetDraft.id])
  expect(practiceService.resumeDraft('an')?.id).toBe(otherDraft.id)
  cleanup()

  renderAuthenticatedApp(`/hoc-cung-con/app?session=${targetDraft.id}`, repository)

  expect(await screen.findByRole('heading', { name: 'Bài luyện tập' })).toBeInTheDocument()
  expect(screen.getByText(targetDraft.questions[0].prompt)).toBeInTheDocument()
  expect(screen.getByLabelText('Đáp án câu 1')).toHaveValue('đáp án draft mục tiêu')
})
