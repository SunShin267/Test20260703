import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import type { ChildProfile, PracticeSession } from '../../shared/model/types'
import { PrintActions } from './PrintActions'
import { PrintableWorksheet } from './PrintableWorksheet'

const profile: ChildProfile = {
  id: 'an', name: 'An', grade: 3, avatar: '🌱', createdAt: '2026-08-15T08:00:00.000Z', updatedAt: '2026-08-15T08:00:00.000Z', schemaVersion: 1,
}

const session: PracticeSession = {
  id: 'session-1', profileId: profile.id, topicId: 'add', status: 'completed',
  questions: [{ id: 'question-1', topicId: 'add', prompt: '12 + 7 = ?', answer: '19', explanation: 'Cộng 7 vào 12.', grade: 3, difficulty: 'easy' }],
  answers: {}, startedAt: '2026-08-15T08:00:00.000Z', completedAt: '2026-08-15T08:10:00.000Z', createdAt: '2026-08-15T08:00:00.000Z', updatedAt: '2026-08-15T08:10:00.000Z', schemaVersion: 1,
}

afterEach(() => vi.restoreAllMocks())

it('renders semantic worksheet metadata, questions, and answer lines without answers by default', () => {
  render(<PrintableWorksheet includeAnswers={false} profile={profile} session={session} />)

  expect(screen.getByRole('heading', { name: 'Học cùng con' })).toBeInTheDocument()
  expect(screen.getByText('An · Lớp 3')).toBeInTheDocument()
  expect(screen.getByText('Chủ đề: Phép cộng')).toBeInTheDocument()
  expect(screen.getByText(session.questions[0].prompt)).toBeInTheDocument()
  expect(document.querySelectorAll('.answer-line')).toHaveLength(1)
  expect(screen.queryByText(session.questions[0].answer)).not.toBeInTheDocument()
  expect(screen.queryByText(session.questions[0].explanation)).not.toBeInTheDocument()
})

it('renders answers and explanations only when requested', () => {
  render(<PrintableWorksheet includeAnswers profile={profile} session={session} />)

  expect(screen.getByRole('heading', { name: 'Đáp án' })).toBeInTheDocument()
  expect(screen.getByText(/1\. 19 — Cộng 7 vào 12\./)).toBeInTheDocument()
})

it('does not leak answer text into the DOM for an unverified print action', () => {
  render(<PrintActions parentVerified={false} profile={profile} session={session} />)

  expect(screen.getByRole('button', { name: 'In phiếu bài tập' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'In kèm đáp án' })).not.toBeInTheDocument()
  expect(screen.queryByText(session.questions[0].answer)).not.toBeInTheDocument()
  expect(screen.queryByText(session.questions[0].explanation)).not.toBeInTheDocument()
})

it('renders the selected blank worksheet before calling the browser print dialog', async () => {
  const user = userEvent.setup()
  const print = vi.spyOn(window, 'print').mockImplementation(() => {
    expect(screen.getByText('An · Lớp 3')).toBeInTheDocument()
    expect(screen.queryByText(session.questions[0].answer)).not.toBeInTheDocument()
  })
  render(<PrintActions parentVerified={false} profile={profile} session={session} />)

  await user.click(screen.getByRole('button', { name: 'In phiếu bài tập' }))

  await waitFor(() => expect(print).toHaveBeenCalledTimes(1))
})

it('lets a verified parent print a blank or answer-key worksheet', async () => {
  const user = userEvent.setup()
  const print = vi.spyOn(window, 'print').mockImplementation(() => undefined)
  render(<PrintActions parentVerified profile={profile} session={session} />)

  expect(screen.getByRole('button', { name: 'In phiếu trắng' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'In kèm đáp án' }))

  await waitFor(() => expect(print).toHaveBeenCalledTimes(1))
  expect(screen.getByText(/1\. 19 — Cộng 7 vào 12\./)).toBeInTheDocument()
})
