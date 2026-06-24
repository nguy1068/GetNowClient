import { useState } from 'react'
import { Button, TextInput, Toggle } from '@carbon/react'
import { ArrowLeft, ArrowRight, CheckmarkOutline, InProgress, CircleDash, Close } from '@carbon/icons-react'
import GetNowLogo from '../components/GetNowLogo'
import './OnboardingPage.scss'
import './NotificationsPage.scss'

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

type NotifStatus = 'idle' | 'blocked' | 'enabled'

interface NotificationsPageProps {
  onBack?: () => void
  onFinish?: () => void
}

export default function NotificationsPage({ onBack, onFinish }: NotificationsPageProps) {
  const [notifStatus, setNotifStatus] = useState<NotifStatus>('idle')
  const [launchOnStart, setLaunchOnStart] = useState(false)
  const [smsPhone, setSmsPhone] = useState('')

  const isEnabled = notifStatus === 'enabled'

  const handleEnableNotification = () => {
    setTimeout(() => {
      setNotifStatus('enabled')
      setLaunchOnStart(true)
    }, 600)
  }

  return (
    <div className="onboarding">
      {/* Header */}
      <header className="onboarding__header">
        <div className="onboarding__header-text">
          <h1 className="onboarding__header-title">Set up your Pharmacy</h1>
          <p className="onboarding__header-desc">
            Your pharmacy details help patients know exactly where their medication is coming from.
            You can update this anytime in Settings.
          </p>
        </div>
        <GetNowLogo />
      </header>

      <div className="onboarding__body">
        {/* Sidebar — steps 1 & 2 complete, step 3 active */}
        <aside className="onboarding__sidebar">
          <nav className="onboarding__progress" aria-label="Setup progress">
            {STEPS.map((step, i) => {
              const isComplete = i < 2
              const isActive = i === 2
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
            <h2 className="onboarding__card-title">Set up notifications</h2>

            {/* ── Notification permission card ────────────────────────────── */}
            {notifStatus === 'idle' && (
              <div className="notif__card">
                <div className="notif__card-content">
                  <p className="notif__card-heading">Desktop notifications</p>
                  <p className="notif__card-body">
                    Alert you when a new order arrives, an order is blocked, or a driver goes unresponsive.
                  </p>
                </div>
                <div className="notif__card-actions">
                  <Button kind="primary" size="sm" onClick={handleEnableNotification}>
                    Enable Notification
                  </Button>
                </div>
              </div>
            )}

            {notifStatus === 'blocked' && (
              <div className="notif__card">
                <div className="notif__card-content">
                  <p className="notif__card-heading notif__card-heading--sm">Notifications blocked</p>
                  <p className="notif__card-body">
                    To enable: open System Settings → Notifications → GetNow → Allow.{' '}
                    <span className="notif__link">[Open System Settings]</span>
                  </p>
                </div>
              </div>
            )}

            {notifStatus === 'enabled' && (
              <div className="notif__card--success">
                <div className="notif__card-success-bar" />
                <div className="notif__card-success-content">
                  <div className="notif__card-success-header">
                    <p className="notif__card-heading--success">Notifications enabled</p>
                    <button
                      className="notif__dismiss-btn"
                      onClick={() => setNotifStatus('idle')}
                      aria-label="Dismiss"
                    >
                      <Close size={16} />
                    </button>
                  </div>
                  <p className="notif__card-body--success">
                    You'll receive alerts even when GetNow is in the background.
                  </p>
                </div>
              </div>
            )}

            {/* ── Launch on start toggle ──────────────────────────────────── */}
            <hr className="notif__divider" />

            <div className="notif__row">
              <div className="notif__row-text">
                <p className="notif__row-title">Launch GetNow when my computer starts</p>
                <p className="notif__row-desc">
                  Recommended. Ensures you don't miss orders at the start of each shift.
                </p>
              </div>
              <Toggle
                id="launch-on-start"
                labelA=""
                labelB=""
                toggled={launchOnStart}
                onToggle={(checked) => setLaunchOnStart(checked)}
                hideLabel
              />
            </div>

            {/* ── SMS backup ─────────────────────────────────────────────── */}
            <hr className="notif__divider" />

            <div className="notif__sms-section">
              <div>
                <p className="notif__row-title">SMS backup (optional)</p>
                <p className="notif__row-desc">
                  We'll text this number if you don't acknowledge a desktop notification within 2 minutes.
                </p>
              </div>
              <TextInput
                id="sms-phone"
                labelText="Pharmacy hotline"
                placeholder="(555) 000-0000"
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
                helperText="Leave blank to skip. You can add this later in Settings."
              />
            </div>
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
          iconDescription="Finish"
          disabled={!isEnabled}
          onClick={onFinish}
        >
          Finish
        </Button>
      </footer>
    </div>
  )
}
