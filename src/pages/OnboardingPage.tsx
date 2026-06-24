import { useState } from 'react'
import { Button, TextInput, Select, SelectItem } from '@carbon/react'
import { ArrowRight, InProgress, CircleDash } from '@carbon/icons-react'
import GetNowLogo from '../components/GetNowLogo'
import './OnboardingPage.scss'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

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

export default function OnboardingPage() {
  const [form, setForm] = useState({
    pharmacyName: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    phoneNumber: '',
  })

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleNext = () => {
    // TODO: validate + advance to next onboarding step
  }

  return (
    <div className="onboarding">
      {/* ── Top header bar ── */}
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
        {/* ── Left sidebar: progress indicator ── */}
        <aside className="onboarding__sidebar">
          <nav className="onboarding__progress" aria-label="Setup progress">
            {STEPS.map((step, i) => {
              const isActive = i === 0
              return (
                <div
                  key={step.id}
                  className={`onboarding__step ${isActive ? 'onboarding__step--active' : ''}`}
                >
                  <div className="onboarding__step-icon-label">
                    <span className="onboarding__step-icon" aria-hidden="true">
                      {isActive ? <InProgress size={16} /> : <CircleDash size={16} />}
                    </span>
                    <span className="onboarding__step-label">{step.label}</span>
                  </div>
                  <p className="onboarding__step-desc">{step.description}</p>
                </div>
              )
            })}
          </nav>
        </aside>

        {/* ── Main form area ── */}
        <main className="onboarding__main">
          <div className="onboarding__card">
            <h2 className="onboarding__card-title">Set up your pharmacy</h2>

            <TextInput
              id="pharmacy-name"
              labelText="Pharmacy name"
              placeholder="e.g. Main Street Pharmacy"
              value={form.pharmacyName}
              onChange={set('pharmacyName')}
            />

            <TextInput
              id="street-address"
              labelText="Street address"
              placeholder="123 Main St"
              value={form.streetAddress}
              onChange={set('streetAddress')}
            />

            <div className="onboarding__row">
              <TextInput
                id="city"
                labelText="City"
                placeholder="City"
                value={form.city}
                onChange={set('city')}
                className="onboarding__city"
              />

              <Select
                id="state"
                labelText="State"
                value={form.state}
                onChange={set('state')}
                className="onboarding__state"
              >
                <SelectItem value="" text="" />
                {US_STATES.map((s) => (
                  <SelectItem key={s} value={s} text={s} />
                ))}
              </Select>

              <TextInput
                id="postal-code"
                labelText="POSTAL CODE"
                placeholder="00000"
                value={form.postalCode}
                onChange={set('postalCode')}
                className="onboarding__postal"
              />
            </div>

            <TextInput
              id="phone-number"
              labelText="Pharmacy phone number"
              placeholder="(555) 000-0000"
              value={form.phoneNumber}
              onChange={set('phoneNumber')}
              helperText="Shown to patients and drivers for questions."
            />
          </div>
        </main>
      </div>

      {/* ── Footer bar ── */}
      <footer className="onboarding__footer">
        <Button
          kind="primary"
          size="lg"
          renderIcon={ArrowRight}
          onClick={handleNext}
        >
          Next
        </Button>
      </footer>
    </div>
  )
}
