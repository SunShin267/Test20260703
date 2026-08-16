import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import { AppProviders } from '../app/AppProviders'
import { routes } from '../app/router'
import { AuthService } from '../features/auth/authService'
import { SessionRepository } from '../features/auth/sessionRepository'
import { PinService } from '../features/parent/pinService'
import { PracticeService } from '../features/practice/practiceService'
import { LocalQuestionBankService } from '../features/practice/questionBankService'
import { ProfileService } from '../features/profiles/profileService'
import { AppRepository } from '../shared/storage/AppRepository'
import { MemoryStorageAdapter } from '../shared/storage/MemoryStorageAdapter'

it('lets a family register, learn with two children, review progress, print, manage questions, and sign out', async () => {
  const user = userEvent.setup()
  const storage = new MemoryStorageAdapter()
  const repository = new AppRepository(storage)
  const authService = new AuthService(repository, new SessionRepository(storage))
  const pinService = new PinService(repository)
  const profileService = new ProfileService(repository)
  const questionBankService = new LocalQuestionBankService(repository)
  const practiceService = new PracticeService(repository, { questionBank: questionBankService, random: () => 0.3 })
  const router = createMemoryRouter(routes, { initialEntries: ['/'] })

  render(
    <AppProviders services={{ repository, authService, pinService, profileService, practiceService, questionBankService }}>
      <RouterProvider router={router} />
    </AppProviders>,
  )

  await user.click(await screen.findByRole('button', { name: 'Tạo tài khoản gia đình' }))
  await user.type(screen.getByLabelText('Tên đăng nhập'), 'gia-dinh-an')
  await user.type(screen.getByLabelText('Mật khẩu'), 'matkhau123')
  await user.click(screen.getByRole('button', { name: 'Tạo tài khoản gia đình' }))
  expect(await screen.findByRole('heading', { level: 1, name: 'SunShinSon' })).toBeInTheDocument()

  await act(async () => { await router.navigate('/hoc-cung-con/app') })
  await user.type(await screen.findByLabelText('Tên bé'), 'An')
  await user.click(screen.getByRole('button', { name: 'Lưu hồ sơ' }))
  expect(await screen.findByRole('region', { name: 'SunShinSon' })).toHaveTextContent('Chào An')

  await user.click(screen.getByRole('link', { name: 'Khu vực phụ huynh' }))
  await user.type(await screen.findByLabelText('Mã PIN mới'), '1234')
  await user.type(screen.getByLabelText('Xác nhận mã PIN mới'), '1234')
  await user.click(screen.getByRole('button', { name: 'Tạo mã PIN' }))
  await user.click(await screen.findByRole('button', { name: 'Thêm hồ sơ' }))
  await user.type(screen.getByLabelText('Tên bé'), 'Bình')
  await user.selectOptions(screen.getByLabelText('Lớp'), '2')
  await user.click(screen.getByRole('button', { name: 'Lưu hồ sơ' }))
  expect(repository.load().profiles.map(profile => profile.name)).toEqual(['An', 'Bình'])

  await act(async () => { await router.navigate('/hoc-cung-con/app') })
  await user.click(await screen.findByRole('button', { name: /Bình/ }))
  expect(await screen.findByRole('region', { name: 'SunShinSon' })).toHaveTextContent('Chào Bình')
  await user.click(screen.getByRole('button', { name: 'Phép cộng' }))
  await user.click(screen.getByRole('button', { name: 'Bắt đầu làm bài' }))
  const session = repository.load().sessions[0]
  await user.type(screen.getByLabelText('Đáp án câu 1'), session.questions[0].answer)
  await user.click(screen.getByRole('button', { name: 'Phiếu bài tập' }))
  for (const [index, question] of session.questions.entries()) {
    if (index > 0) await user.type(screen.getByLabelText(`Đáp án câu ${index + 1}`), question.answer)
  }
  await user.click(screen.getByRole('button', { name: 'Nộp bài' }))
  expect(await screen.findByRole('heading', { name: 'Kết quả bài làm' })).toBeInTheDocument()
  expect(repository.load().sessions[0].status).toBe('completed')

  await act(async () => { await router.navigate('/hoc-cung-con/phu-huynh') })
  expect(screen.queryByRole('button', { name: 'In kèm đáp án' })).not.toBeInTheDocument()
  await user.type(await screen.findByLabelText('Mã PIN phụ huynh'), '1234')
  await user.click(screen.getByRole('button', { name: 'Mở khóa' }))
  expect(await screen.findByText('Tiến bộ tuần này')).toBeInTheDocument()
  expect(screen.getByLabelText('Lịch sử bài luyện')).toHaveTextContent('Phép cộng')
  expect(screen.getByRole('button', { name: 'In phiếu trắng' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'In kèm đáp án' })).toBeInTheDocument()
  const originalPrint = window.print
  const originalRequestAnimationFrame = window.requestAnimationFrame
  const originalCancelAnimationFrame = window.cancelAnimationFrame
  const print = vi.fn()
  const frames: FrameRequestCallback[] = []
  Object.defineProperty(window, 'print', { configurable: true, value: print })
  Object.defineProperty(window, 'requestAnimationFrame', { configurable: true, value: vi.fn((callback: FrameRequestCallback) => { frames.push(callback); return frames.length }) })
  Object.defineProperty(window, 'cancelAnimationFrame', { configurable: true, value: vi.fn() })
  try {
    await user.click(screen.getByRole('button', { name: 'In phiếu trắng' }))
    expect(screen.getByRole('heading', { name: 'Học cùng con' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Đáp án' })).not.toBeInTheDocument()
    expect(print).not.toHaveBeenCalled()
    expect(frames).toHaveLength(1)
    act(() => { frames.shift()?.(0) })
    expect(print).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'In kèm đáp án' }))
    expect(screen.getByRole('heading', { name: 'Đáp án' })).toBeInTheDocument()
    expect(frames).toHaveLength(1)
    act(() => { frames.shift()?.(1) })
    expect(print).toHaveBeenCalledTimes(2)
  } finally {
    Object.defineProperty(window, 'print', { configurable: true, value: originalPrint })
    Object.defineProperty(window, 'requestAnimationFrame', { configurable: true, value: originalRequestAnimationFrame })
    Object.defineProperty(window, 'cancelAnimationFrame', { configurable: true, value: originalCancelAnimationFrame })
  }
  await user.click(screen.getByRole('button', { name: 'Thêm câu hỏi' }))
  const questionEditor = screen.getByRole('dialog', { name: 'Thêm câu hỏi' })
  await user.type(within(questionEditor).getByLabelText('Đề bài'), '2 + 2 = ?')
  await user.type(within(questionEditor).getByLabelText('Đáp án'), '4')
  await user.type(within(questionEditor).getByLabelText('Giải thích'), 'Cộng hai với hai.')
  await user.click(within(questionEditor).getByRole('button', { name: 'Lưu câu hỏi' }))
  expect(screen.getByText('2 + 2 = ?')).toBeInTheDocument()

  await act(async () => { await router.navigate('/') })
  await user.click(await screen.findByRole('button', { name: 'Đăng xuất' }))
  expect(await screen.findByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument()
})
