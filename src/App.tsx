import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'

type Page = 'login' | 'onboarding'

function App() {
  const [page, setPage] = useState<Page>('login')

  if (page === 'onboarding') {
    return <OnboardingPage />
  }

  return <LoginPage onLoginSuccess={() => setPage('onboarding')} />
}

export default App
