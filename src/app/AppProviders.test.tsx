import { render, screen } from '@testing-library/react'
import { AppProviders, type AppServices, useAppServices } from './AppProviders'
import { AppRepository } from '../shared/storage/AppRepository'
import { MemoryStorageAdapter } from '../shared/storage/MemoryStorageAdapter'

function RepositoryConsumer() {
  const { repository } = useAppServices()
  return <p>{repository.load().schemaVersion}</p>
}

it('accepts the original repository-only services contract', () => {
  const services: AppServices = { repository: new AppRepository(new MemoryStorageAdapter()) }

  render(
    <AppProviders services={services}>
      <RepositoryConsumer />
    </AppProviders>,
  )

  expect(screen.getByText('1')).toBeInTheDocument()
})
