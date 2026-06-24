import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import PmsConnectionPage from './pages/PmsConnectionPage'

type Page = 'login' | 'onboarding' | 'pms-connection'

function App() {
  const [page, setPage] = useState<Page>('login')

  if (page === 'pms-connection') {
    return (
      <PmsConnectionPage
        onBack={() => setPage('onboarding')}
        onNext={() => {
          // TODO: Notifications step
        }}
      />
    )
  }

  if (page === 'onboarding') {
    return <OnboardingPage onNext={() => setPage('pms-connection')} />
  }

  return <LoginPage onLoginSuccess={() => setPage('onboarding')} />
}

export default App
