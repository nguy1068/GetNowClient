import { useState } from 'react'
import { Button, TextInput, Select, SelectItem } from '@carbon/react'
import { ArrowLeft, ArrowRight, CheckmarkOutline, InProgress, CircleDash, WifiController } from '@carbon/icons-react'
import GetNowLogo from '../components/GetNowLogo'
import './OnboardingPage.scss'
import './PmsConnectionPage.scss'

const PMS_OPTIONS = [
  { value: 'pioneerx', label: 'PioneerRx' },
  { value: 'rxdispense', label: 'RxDispense' },
  { value: 'qs1', label: 'QS/1' },
  { value: 'rx30', label: 'Rx30' },
  { value: 'liberty', label: 'Liberty Software' },
]

const PMS_INSTRUCTIONS: Record<string, string> = {
  pioneerx: 'In PioneerRx: Go to Admin → Integrations → API Access → Generate Key. Copy the key and paste it below.',
  rxdispense: 'In RxDispense: Go to Settings → API → Generate new key. Copy the key and paste it below.',
  qs1: 'In QS/1: Navigate to System → Integrations → API Keys → Create. Copy the key and paste it below.',
  rx30: 'In Rx30: Open Tools → API Management → New Key. Copy the key and paste it below.',
  liberty: 'In Liberty Software: Go to Administration → Third-Party → API Credentials → Generate. Copy the key and paste it below.',
}

const STEPS = [
  {
    id: 1,
    label: 'Set up your pharmacy',
    description: 'This is what patients and drivers will see',
  },
  {
    id: 2,
    label: 'PMS Connection',
    description: 'GetNow syncs order data directly with your PMS — so you never enter patient info manually.',
  },
  {
    id: 3,
    label: 'Notifications',
    description: 'GetNow needs permission to send you alerts when new orders arrive — even when the app is in the background.',
  },
]

type ConnectionStatus = 'idle' | 'testing' | 'success'

interface PmsConnectionPageProps {
  onBack?: () => void
  onNext?: () => void
}

export default function PmsConnectionPage({ onBack, onNext }: PmsConnectionPageProps) {
  const [selectedPms, setSelectedPms] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')

  const pmsOption = PMS_OPTIONS.find((o) => o.value === selectedPms)
  const isConnected = connectionStatus === 'success'
  const isTesting = connectionStatus === 'testing'

  const handlePmsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPms(e.target.value)
    setApiKey('')
    setConnectionStatus('idle')
  }

  const handleTestConnection = () => {
    setConnectionStatus('testing')
    setTimeout(() => setConnectionStatus('success'), 1500)
  }

  return (
    <div className="onboarding">
      {/* Header */}
      <header className="onboarding__header">
        <div className="onboarding__header-text">
          <h1 className="onboarding__header-title">Connect your pharmacy system</h1>
          <p className="onboarding__header-desc">
            GetNow syncs order data directly with your PMS — so you never enter patient info manually.
          </p>
        </div>
        <GetNowLogo />
      </header>

      <div className="onboarding__body">
        {/* Sidebar */}
        <aside className="onboarding__sidebar">
          <nav className="onboarding__progress" aria-label="Setup progress">
            {STEPS.map((step, i) => {
              const isComplete = i === 0
              const isActive = i === 1
              return (
                <div
                  key={step.id}
                  className={[
                    'onboarding__step',
                    isActive ? 'onboarding__step--active' : '',
                    isComplete ? 'onboarding__step--complete' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="onboarding__step-icon-label">
                    <span className="onboarding__step-icon" aria-hidden="true">
                      {isComplete ? (
                        <CheckmarkOutline size={16} />
                      ) : isActive ? (
                        <InProgress size={16} />
                      ) : (
                        <CircleDash size={16} />
                      )}
                    </span>
                    <span className="onboarding__step-label">{step.label}</span>
                  </div>
                  <p className="onboarding__step-desc">{step.description}</p>
                </div>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="onboarding__main">
          <div className="onboarding__card">
            <h2 className="onboarding__card-title">Connect your pharmacy system</h2>

            <Select
              id="pms-select"
              labelText="Pharmacy Management System (PMS)"
              value={selectedPms}
              onChange={handlePmsChange}
            >
              <SelectItem value="" text="Select your PMS" />
              {PMS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} text={opt.label} />
              ))}
            </Select>

            {selectedPms && (
              <>
                <div className="pms__info-tile">
                  <p className="pms__info-tile-title">How to find your API key</p>
                  <p className="pms__info-tile-body">
                    {(() => {
                      const label = pmsOption?.label ?? ''
                      const instr = PMS_INSTRUCTIONS[selectedPms]
                      const idx = instr.indexOf(label)
                      if (idx < 0) return instr
                      return (
                        <>
                          {instr.slice(0, idx)}
                          <span className="pms__name-link">{label}</span>
                          {instr.slice(idx + label.length)}
                        </>
                      )
                    })()}
                  </p>
                </div>

                <TextInput
                  id="api-key"
                  labelText="API key"
                  placeholder="Paste your API key here"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />

                <div className="pms__test-row">
                  {isConnected ? (
                    <div className="pms__success-badge">
                      <CheckmarkOutline size={16} />
                      Connected to {pmsOption?.label} successfully.
                    </div>
                  ) : (
                    <Button
                      kind="tertiary"
                      size="md"
                      renderIcon={WifiController}
                      onClick={handleTestConnection}
                      disabled={!apiKey.trim() || isTesting}
                    >
                      {isTesting ? 'Testing…' : 'Test Connection'}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="onboarding__footer onboarding__footer--spaced">
        <Button
          kind="secondary"
          size="lg"
          renderIcon={ArrowLeft}
          iconDescription="Back"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          kind="primary"
          size="lg"
          renderIcon={ArrowRight}
          iconDescription="Next"
          disabled={!isConnected}
          onClick={onNext}
        >
          Next
        </Button>
      </footer>
    </div>
  )
}
