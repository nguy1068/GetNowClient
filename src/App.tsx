import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import PmsConnectionPage from './pages/PmsConnectionPage'
import NotificationsPage from './pages/NotificationsPage'

type Page = 'login' | 'onboarding' | 'pms-connection' | 'notifications'

function App() {
  const [page, setPage] = useState<Page>('login')

  if (page === 'notifications') {
    return (
      <NotificationsPage
        onBack={() => setPage('pms-connection')}
        onFinish={() => {
          // TODO: navigate to main dashboard
        }}
      />
    )
  }

  if (page === 'pms-connection') {
    return (
      <PmsConnectionPage
        onBack={() => setPage('onboarding')}
        onNext={() => setPage('notifications')}
      />
    )
  }

  if (page === 'onboarding') {
    return <OnboardingPage onNext={() => setPage('pms-connection')} />
  }

  return <LoginPage onLoginSuccess={() => setPage('onboarding')} />
}

export default App
