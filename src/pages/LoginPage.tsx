import { useState } from 'react'
import {
  Button,
  TextInput,
  PasswordInput,
  InlineNotification,
} from '@carbon/react'
import GetNowLogo from '../components/GetNowLogo'
import './LoginPage.scss'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    setIsLoading(true)
    // TODO: wire up authentication
    setTimeout(() => setIsLoading(false), 1500)
  }

  return (
    <div className="login-page">
      {/* Top navigation bar */}
      <header className="login-page__header">
        <GetNowLogo />
        <Button kind="ghost" size="md">
          GetNow Customer Support
        </Button>
      </header>

      {/* Centered login card */}
      <main className="login-page__main">
        <div className="login-page__card">
          <form onSubmit={handleSubmit} noValidate>
            <h2 className="login-page__title">Sign in</h2>

            {error && (
              <InlineNotification
                kind="error"
                title="Error"
                subtitle={error}
                lowContrast
                className="login-page__notification"
                onClose={() => setError('')}
              />
            )}

            <TextInput
              id="email"
              type="email"
              labelText="Email Address"
              placeholder="name@pharmacy.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-page__input"
              autoComplete="email"
            />

            <PasswordInput
              id="password"
              labelText="Password"
              placeholder="············"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-page__input"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              kind="primary"
              size="md"
              disabled={isLoading}
              className="login-page__submit"
            >
              {isLoading ? 'Signing in…' : 'Log In'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
