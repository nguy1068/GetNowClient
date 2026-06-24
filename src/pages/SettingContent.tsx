import { useState } from 'react'
import { Toggle } from '@carbon/react'
import { Launch, View, ViewOff, Information, Checkmark } from '@carbon/icons-react'
import './SettingContent.scss'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

interface DayHours {
  open: boolean
  fromTime: string
  fromPeriod: 'AM' | 'PM'
  toTime: string
  toPeriod: 'AM' | 'PM'
}

const DEFAULT_HOURS: DayHours[] = [
  { open: false, fromTime: '09:00', fromPeriod: 'AM', toTime: '05:00', toPeriod: 'PM' },
  { open: true,  fromTime: '09:00', fromPeriod: 'AM', toTime: '12:00', toPeriod: 'PM' },
  { open: true,  fromTime: '09:00', fromPeriod: 'AM', toTime: '12:00', toPeriod: 'PM' },
  { open: true,  fromTime: '09:00', fromPeriod: 'AM', toTime: '12:00', toPeriod: 'PM' },
  { open: true,  fromTime: '09:00', fromPeriod: 'AM', toTime: '12:00', toPeriod: 'PM' },
  { open: true,  fromTime: '09:00', fromPeriod: 'AM', toTime: '12:00', toPeriod: 'PM' },
  { open: true,  fromTime: '11:00', fromPeriod: 'AM', toTime: '11:00', toPeriod: 'PM' },
]

export default function SettingContent() {
  // Store hours
  const [hours, setHours] = useState<DayHours[]>(DEFAULT_HOURS)

  // Pharmacy profile
  const [pharmacyName, setPharmacyName] = useState('')
  const [pharmacyPhone, setPharmacyPhone] = useState('')
  const [street, setStreet] = useState('Shoppers Drug Mart Pembina & Point')
  const [city, setCity] = useState('Winnipeg')
  const [province, setProvince] = useState('MB')
  const [postal, setPostal] = useState('')

  // PMS
  const [pms, setPms] = useState('PioneerRx')
  const [apiKey, setApiKey] = useState('supersecretapikey123')
  const [showApiKey, setShowApiKey] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok'>('idle')

  // Notifications
  const [launchOnStart, setLaunchOnStart] = useState(true)
  const [blockedAlerts, setBlockedAlerts] = useState(true)
  const [driverUpdates, setDriverUpdates] = useState(false)
  const [smsPhone, setSmsPhone] = useState('')

  const updateHours = (i: number, patch: Partial<DayHours>) =>
    setHours((prev) => prev.map((h, idx) => (idx === i ? { ...h, ...patch } : h)))

  const handleTestConnection = () => {
    setTestStatus('testing')
    setTimeout(() => setTestStatus('ok'), 1500)
  }

  const NOTIF_ROWS = [
    {
      id: 'launch',
      label: 'Launch GetNow when my computer starts',
      desc: "Recommended. Ensures you don't miss orders at the start of each shift",
      toggled: launchOnStart,
      onToggle: (v: boolean) => setLaunchOnStart(v),
    },
    {
      id: 'blocked',
      label: 'Blocked order alerts',
      desc: 'Notify me when an order needs urgent attention',
      toggled: blockedAlerts,
      onToggle: (v: boolean) => setBlockedAlerts(v),
    },
    {
      id: 'driver',
      label: 'Driver & delivery updates',
      desc: 'Notify me when driver status changes or delivery is confirmed',
      toggled: driverUpdates,
      onToggle: (v: boolean) => setDriverUpdates(v),
    },
  ]

  return (
    <div className="setting">

      {/* ── Store hours ──────────────────────────────────────────────────── */}
      <section className="setting__section">
        <div className="setting__section-hdr">
          <h2 className="setting__title">Store hours</h2>
          <button className="setting__add-btn">Add &nbsp;+</button>
        </div>

        <div className="setting__hours-list">
          {DAYS.map((day, i) => {
            const h = hours[i]
            return (
              <div key={day} className="setting__hours-row">
                <span className="setting__day-name">{day}</span>

                <div className="setting__toggle-cell">
                  <Toggle
                    id={`day-${i}`}
                    labelA="Close"
                    labelB="Open"
                    toggled={h.open}
                    onToggle={(v) => updateHours(i, { open: v })}
                    size="sm"
                  />
                </div>

                {h.open ? (
                  <div className="setting__time-range">
                    <div className="setting__time-picker">
                      <input
                        className="setting__time-input"
                        value={h.fromTime}
                        onChange={(e) => updateHours(i, { fromTime: e.target.value })}
                        placeholder="00:00"
                      />
                      <select
                        className="setting__period-select"
                        value={h.fromPeriod}
                        onChange={(e) => updateHours(i, { fromPeriod: e.target.value as 'AM' | 'PM' })}
                      >
                        <option>AM</option>
                        <option>PM</option>
                      </select>
                    </div>
                    <span className="setting__time-dash">—</span>
                    <div className="setting__time-picker">
                      <input
                        className="setting__time-input"
                        value={h.toTime}
                        onChange={(e) => updateHours(i, { toTime: e.target.value })}
                        placeholder="00:00"
                      />
                      <select
                        className="setting__period-select"
                        value={h.toPeriod}
                        onChange={(e) => updateHours(i, { toPeriod: e.target.value as 'AM' | 'PM' })}
                      >
                        <option>AM</option>
                        <option>PM</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="setting__time-range setting__time-range--empty" />
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Pharmacy Profile ─────────────────────────────────────────────── */}
      <section className="setting__section">
        <div>
          <h2 className="setting__title">Pharmacy Profile</h2>
          <p className="setting__section-desc">
            This information appears on delivery receipts and patient communications sent by GetNow.
          </p>
        </div>

        <div className="setting__form-row">
          <div className="setting__field">
            <label className="setting__label">Pharmacy name</label>
            <input
              className="setting__input"
              placeholder="e.g. Shoppers Drug Mart Pembina"
              value={pharmacyName}
              onChange={(e) => setPharmacyName(e.target.value)}
            />
          </div>
          <div className="setting__field">
            <label className="setting__label">Pharmacy phone number</label>
            <input
              className="setting__input"
              placeholder="(555) 000-0000"
              value={pharmacyPhone}
              onChange={(e) => setPharmacyPhone(e.target.value)}
            />
            <p className="setting__helper">Shown to patients and drivers for questions.</p>
          </div>
        </div>

        <div className="setting__form-row">
          <div className="setting__field setting__field--grow">
            <label className="setting__label">Street address</label>
            <input
              className="setting__input"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </div>
          <div className="setting__field">
            <label className="setting__label">City</label>
            <input
              className="setting__input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="setting__field setting__field--sm">
            <label className="setting__label">State</label>
            <select
              className="setting__select"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            >
              <option value="MB">MB</option>
              <option value="ON">ON</option>
              <option value="BC">BC</option>
              <option value="AB">AB</option>
              <option value="SK">SK</option>
            </select>
          </div>
          <div className="setting__field setting__field--sm">
            <label className="setting__label">Postal code</label>
            <input
              className="setting__input"
              placeholder="00000"
              value={postal}
              onChange={(e) => setPostal(e.target.value)}
            />
          </div>
        </div>

        <button className="setting__save-btn">Save Changes</button>
      </section>

      {/* ── PMS Connection ───────────────────────────────────────────────── */}
      <section className="setting__section">
        <div>
          <h2 className="setting__title">PMS Connection</h2>
          <div className="setting__pms-status-row">
            <span className="setting__pms-system">Connected system &nbsp;&nbsp; QS/1 (NRx / POS)</span>
            <span className="setting__pms-connected">Connected · Last synced 2 min ago</span>
          </div>
        </div>

        <div className="setting__field">
          <label className="setting__label">
            Pharmacy management system (PMS)
            <Information size={14} className="setting__info-icon" />
          </label>
          <select
            className="setting__select"
            value={pms}
            onChange={(e) => setPms(e.target.value)}
          >
            <option value="PioneerRx">PioneerRx</option>
            <option value="QS1">QS/1 (NRx / POS)</option>
            <option value="Kroll">Kroll</option>
            <option value="Fillware">Fillware</option>
          </select>
        </div>

        <div className="setting__api-tile">
          <p className="setting__api-tile-title">How to find your API key</p>
          <p className="setting__api-tile-body">
            In{' '}
            <a href="#" className="setting__link">
              PioneerRx
            </a>
            : Go to Admin → Integrations → API Access → Generate Key. Copy the key and paste it here.
          </p>
        </div>

        <div className="setting__api-row">
          <div className="setting__field setting__field--grow">
            <label className="setting__label">API Key</label>
            <div className="setting__password-wrap">
              <input
                className="setting__input"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button
                className="setting__eye-btn"
                onClick={() => setShowApiKey((v) => !v)}
                aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
              >
                {showApiKey ? <ViewOff size={16} /> : <View size={16} />}
              </button>
            </div>
            <p className="setting__helper">
              GetNow uses this connection to verify prescriptions and update order status automatically.
            </p>
          </div>
          <button
            className={['setting__test-btn', testStatus === 'ok' ? 'setting__test-btn--ok' : ''].filter(Boolean).join(' ')}
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
          >
            {testStatus === 'ok' ? <><Checkmark size={16} /> Connected</> : testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        <button className="setting__save-btn">Update API</button>
      </section>

      {/* ── Notification ─────────────────────────────────────────────────── */}
      <section className="setting__section">
        <h2 className="setting__title">Notification</h2>

        {NOTIF_ROWS.map(({ id, label, desc, toggled, onToggle }) => (
          <div key={id} className="setting__notif-row">
            <div className="setting__notif-text">
              <p className="setting__notif-label">{label}</p>
              <p className="setting__notif-desc">{desc}</p>
            </div>
            <Toggle
              id={`notif-${id}`}
              labelA="OFF"
              labelB="ON"
              toggled={toggled}
              onToggle={onToggle}
              size="sm"
            />
          </div>
        ))}

        <div className="setting__sms-block">
          <p className="setting__notif-label">SMS backup (optional)</p>
          <p className="setting__notif-desc">
            We'll text this number if you don't acknowledge a desktop notification within 2 minutes.
          </p>
          <div className="setting__field setting__field--sms">
            <label className="setting__label">Phone number</label>
            <input
              className="setting__input"
              placeholder="(555) 000-0000"
              value={smsPhone}
              onChange={(e) => setSmsPhone(e.target.value)}
            />
          </div>
        </div>

        <button className="setting__save-btn">Save Changes</button>
      </section>

      {/* ── Support & feedback ───────────────────────────────────────────── */}
      <section className="setting__section">
        <h2 className="setting__title">Support &amp; feedback</h2>

        <div className="setting__support-row">
          <div>
            <p className="setting__notif-label">Learn more about the app</p>
            <p className="setting__notif-desc">Learn how to use GetNow Client</p>
          </div>
          <a href="#" className="setting__doc-link">
            View documentation <Launch size={16} />
          </a>
        </div>

        <hr className="setting__divider" />

        <div className="setting__support-row">
          <div>
            <p className="setting__notif-label">Customer Support</p>
            <p className="setting__notif-desc">
              Email us at{' '}
              <a href="mailto:support@getnow.com" className="setting__link">
                support@getnow.com
              </a>{' '}
              · Mon–Fri, 8am–8pm CT
            </p>
          </div>
        </div>
      </section>

      {/* ── Log out ──────────────────────────────────────────────────────── */}
      <div className="setting__logout-wrap">
        <button className="setting__logout-btn">Log out</button>
      </div>

    </div>
  )
}
