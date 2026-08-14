import type { RouteObject } from 'react-router-dom'

const RouteStub = ({ title }: { title: string }) => (
  <main>
    <h1>{title}</h1>
  </main>
)

export const routes: RouteObject[] = [
  { path: '/', element: <RouteStub title="Game Hub" /> },
  { path: '/login', element: <RouteStub title="Đăng nhập" /> },
  { path: '/hoc-cung-con', element: <RouteStub title="Học cùng con" /> },
  { path: '/hoc-cung-con/app', element: <RouteStub title="Góc học tập" /> },
  { path: '/hoc-cung-con/phu-huynh', element: <RouteStub title="Dành cho phụ huynh" /> },
]
