import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export function LoginPage() {
  const navigate = useNavigate()
  const { register, signIn } = useAuth()
  const [registering, setRegistering] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const errorRef = useRef<HTMLParagraphElement>(null)
  const title = registering ? 'Tạo tài khoản gia đình' : 'Đăng nhập'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    try {
      if (registering) await register(username, password)
      else if (!await signIn(username, password)) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng')
        requestAnimationFrame(() => errorRef.current?.focus())
        return
      }
      navigate('/', { replace: true })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể đăng nhập')
      requestAnimationFrame(() => errorRef.current?.focus())
    }
  }

  function toggleMode() {
    setRegistering(value => !value)
    setError('')
  }

  return (
    <main>
      <h1>{title}</h1>
      <p>Thông tin tài khoản chỉ được lưu trên thiết bị này.</p>
      <form onSubmit={submit}>
        <label htmlFor="username">Tên đăng nhập</label>
        <input id="username" name="username" value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" autoFocus required />
        <label htmlFor="password">Mật khẩu</label>
        <input id="password" name="password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={registering ? 'new-password' : 'current-password'} required />
        {error && <p ref={errorRef} role="alert" tabIndex={-1}>{error}</p>}
        <button type="submit">{title}</button>
      </form>
      <button type="button" onClick={toggleMode}>{registering ? 'Đăng nhập' : 'Tạo tài khoản gia đình'}</button>
    </main>
  )
}
