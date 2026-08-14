import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { PinGate } from './PinGate'
import { PinService } from './pinService'
import { MemoryStorageAdapter } from '../../shared/storage/MemoryStorageAdapter'
import { AppRepository } from '../../shared/storage/AppRepository'

it('does not render protected children before PIN verification succeeds', async () => {
  const user = userEvent.setup()
  const pinService = new PinService(new AppRepository(new MemoryStorageAdapter()))
  await pinService.setPin('1234')

  render(<PinGate pinService={pinService}><p>Nội dung phụ huynh</p></PinGate>)

  expect(screen.queryByText('Nội dung phụ huynh')).not.toBeInTheDocument()
  const input = screen.getByLabelText('Mã PIN phụ huynh')
  expect(input).toHaveAttribute('inputmode', 'numeric')
  expect(input).toHaveAttribute('pattern', '[0-9]{4}')
  await user.type(input, '1234')
  await user.click(screen.getByRole('button', { name: 'Xác nhận' }))

  expect(await screen.findByText('Nội dung phụ huynh')).toBeInTheDocument()
})

it('re-enables confirmation after the PIN lock expires', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-15T00:00:00.000Z'))
  const repository = new AppRepository(new MemoryStorageAdapter())
  await new PinService(repository).setPin('1234')
  repository.update(data => ({
    ...data,
    parentSettings: { ...data.parentSettings, pinLockedUntil: Date.now() + 300_000 },
  }))

  render(<PinGate pinService={new PinService(repository)}><p>Nội dung phụ huynh</p></PinGate>)

  expect(screen.getByRole('button', { name: 'Xác nhận' })).toBeDisabled()
  act(() => vi.advanceTimersByTime(300_000))
  expect(screen.getByRole('button', { name: 'Xác nhận' })).toBeEnabled()
  vi.useRealTimers()
})

it('switches a stale setup form to verification when another tab creates the PIN', async () => {
  const user = userEvent.setup()
  const storage = new MemoryStorageAdapter()
  const staleService = new PinService(new AppRepository(storage))
  render(<PinGate pinService={staleService}><p>Nội dung phụ huynh</p></PinGate>)
  await new PinService(new AppRepository(storage)).setPin('1234')

  await user.type(screen.getByLabelText('Mã PIN mới'), '5678')
  await user.type(screen.getByLabelText('Xác nhận mã PIN mới'), '5678')
  await user.click(screen.getByRole('button', { name: 'Tạo mã PIN' }))

  expect(await screen.findByLabelText('Mã PIN phụ huynh')).toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('Mã PIN đã được thiết lập ở nơi khác')
})
