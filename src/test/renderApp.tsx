import { render } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { AppProviders } from '../app/AppProviders'
import { routes } from '../app/router'
import type { AppData } from '../shared/model/types'
import { AppRepository } from '../shared/storage/AppRepository'
import { MemoryStorageAdapter } from '../shared/storage/MemoryStorageAdapter'
import { createAppFixture } from './fixtures'

export function renderApp(path: string, fixture: AppData = createAppFixture()) {
  const adapter = new MemoryStorageAdapter()
  const repository = new AppRepository(adapter)
  repository.update(() => fixture)
  const router = createMemoryRouter(routes, { initialEntries: [path] })

  return {
    ...render(
      <AppProviders services={{ repository }}>
        <RouterProvider router={router} />
      </AppProviders>,
    ),
    repository,
    router,
  }
}
