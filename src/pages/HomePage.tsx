import { useState } from 'react'
import { Toggle } from '@carbon/react'
import {
  Notification,
  Search,
  Close,
  Medication,
  Document,
  ChevronDown,
  ChevronRight,
} from '@carbon/icons-react'
import './HomePage.scss'

// ── Types ────────────────────────────────────────────────────────────────────

type OrderType = 'Rx' | 'OTC' | 'Supplement'
type OrderStatus = 'Verified' | 'Pending'
type SidebarSection = 'new-order' | 'being-prepared' | 'waiting-driver' | 'delivered'

interface Drug {
  name: string
}

interface Order {
  id: string
  patientName: string
  type: OrderType
  status: OrderStatus
  drugs: Drug[]
  scriptCount: number
  scriptLabel: string
  time: string
  // detail panel
  din: string
  dob: string
  gender: string
  phone: string
  address: string
  allergies: string
  doctor: string
  npi: string
  plan: string
  claim: string
  copay: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const INITIAL_ORDERS: Order[] = [
  {
    id: '#GN-201',
    patientName: 'Margaret Holloway',
    type: 'Rx',
    status: 'Verified',
    drugs: [{ name: 'Lisinopril 10mg' }, { name: 'Lisinopril 20mg' }, { name: 'Atorvastatin 40mg' }],
    scriptCount: 1,
    scriptLabel: 'Prescription',
    time: '7:30 PM',
    din: 'DIN-0123456',
    dob: 'Mar 14, 1962',
    gender: 'Female',
    phone: '(204) 555-0192',
    address: '1481 Pembina Hwy, Winnipeg, MB R3T 2C6',
    allergies: 'Penicillin, Sulfa drugs',
    doctor: 'Dr. Karen Li',
    npi: '1098765432',
    plan: 'Blue Cross Manitoba',
    claim: 'CLM-88421',
    copay: '$12.50',
  },
  {
    id: '#GN-202',
    patientName: 'Jamal Thompson',
    type: 'OTC',
    status: 'Pending',
    drugs: [{ name: 'Ibuprofen 200mg' }, { name: 'Acetaminophen 500mg' }],
    scriptCount: 1,
    scriptLabel: 'Over-the-Counter',
    time: '3:15 PM',
    din: 'DIN-0234567',
    dob: 'Jul 22, 1988',
    gender: 'Male',
    phone: '(204) 555-0147',
    address: '320 Donald St, Winnipeg, MB R3B 2H3',
    allergies: 'None known',
    doctor: 'Dr. Ahmed Syed',
    npi: '2034561890',
    plan: 'Sun Life Financial',
    claim: 'CLM-88422',
    copay: '$5.00',
  },
  {
    id: '#GN-203',
    patientName: 'Sofia Martinez',
    type: 'OTC',
    status: 'Verified',
    drugs: [{ name: 'Metformin 500mg' }, { name: 'Glipizide 5mg' }],
    scriptCount: 2,
    scriptLabel: 'Prescription',
    time: '10:45 AM',
    din: 'DIN-0345678',
    dob: 'Nov 3, 1975',
    gender: 'Female',
    phone: '(204) 555-0281',
    address: '99 Osborne St, Winnipeg, MB R3L 1Y5',
    allergies: 'Aspirin',
    doctor: 'Dr. Maria Chen',
    npi: '3012348765',
    plan: 'Manulife',
    claim: 'CLM-88423',
    copay: '$18.75',
  },
  {
    id: '#GN-204',
    patientName: "Liam O'Connor",
    type: 'Supplement',
    status: 'Verified',
    drugs: [{ name: 'Vitamin D3 2000 IU' }],
    scriptCount: 1,
    scriptLabel: 'Supplement',
    time: '1:00 PM',
    din: 'DIN-0456789',
    dob: 'Feb 9, 1995',
    gender: 'Male',
    phone: '(204) 555-0339',
    address: '245 Portage Ave, Winnipeg, MB R3B 2A9',
    allergies: 'Latex',
    doctor: 'Dr. James Park',
    npi: '4098123456',
    plan: 'Great-West Life',
    claim: 'CLM-88424',
    copay: '$0.00',
  },
]

const BLOCKED_FILTERS = ['Insurance', 'Prescription', 'Out of Stock', 'Need Verification']

// ── Tag helpers ───────────────────────────────────────────────────────────────

function typeTagClass(type: OrderType) {
  if (type === 'Rx') return 'home__tag home__tag--teal'
  if (type === 'OTC') return 'home__tag home__tag--blue'
  return 'home__tag home__tag--teal'
}

function statusTagClass(status: OrderStatus) {
  if (status === 'Verified') return 'home__tag home__tag--green'
  return 'home__tag home__tag--orange'
}

// ── Drug list (truncated) ─────────────────────────────────────────────────────

function DrugList({ drugs }: { drugs: Drug[] }) {
  const visible = drugs.slice(0, 2)
  const extra = drugs.length - 2
  return (
    <div className="home__drug-list">
      <Medication size={16} className="home__drug-icon" />
      <span className="home__drug-names">
        {visible.map((d) => d.name).join('; ')}
        {extra > 0 && <span className="home__drug-more"> +{extra} more</span>}
      </span>
    </div>
  )
}

// ── Order Card ────────────────────────────────────────────────────────────────

function OrderCard({
  order,
  compact,
  selected,
  onClick,
}: {
  order: Order
  compact?: boolean
  selected?: boolean
  onClick: () => void
}) {
  return (
    <button
      className={['home__card', compact ? 'home__card--compact' : '', selected ? 'home__card--selected' : '']
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      aria-pressed={selected}
    >
      <div className="home__card-row">
        <span className="home__card-id">{order.id}</span>
        <span className={typeTagClass(order.type)}>{order.type}</span>
      </div>
      <div className="home__card-row">
        <span className="home__card-patient">{order.patientName}</span>
        <span className={statusTagClass(order.status)}>{order.status}</span>
      </div>
      <DrugList drugs={order.drugs} />
      <div className="home__card-footer">
        <span className="home__card-script">
          <Document size={16} className="home__card-script-icon" />
          {order.scriptCount} {order.scriptLabel}
        </span>
        <span className="home__card-time">{order.time}</span>
      </div>
    </button>
  )
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

function DetailPanel({ order, onClose, onAccept, onDecline }: {
  order: Order
  onClose: () => void
  onAccept: () => void
  onDecline: () => void
}) {
  const [openScript, setOpenScript] = useState(true)

  return (
    <div className="home__detail">
      {/* Header */}
      <div className="home__detail-header">
        <div className="home__detail-title-row">
          <div>
            <p className="home__detail-id">{order.id}</p>
            <p className="home__detail-name">{order.patientName}</p>
          </div>
          <button className="home__detail-close" onClick={onClose} aria-label="Close">
            <Close size={20} />
          </button>
        </div>
        <div className="home__detail-tags">
          <span className={typeTagClass(order.type)}>{order.type}</span>
          <span className={statusTagClass(order.status)}>{order.status}</span>
        </div>
        {/* Progress steps */}
        <div className="home__progress">
          {['Order Received', 'Being Prepared', 'Waiting for Driver', 'Delivered'].map((step, i) => (
            <div key={step} className={['home__progress-step', i === 0 ? 'home__progress-step--active' : ''].filter(Boolean).join(' ')}>
              <div className="home__progress-dot" />
              <span className="home__progress-label">{step}</span>
              {i < 3 && <div className="home__progress-line" />}
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="home__detail-body">
        {/* Patient Info */}
        <section className="home__detail-section">
          <h3 className="home__detail-section-title">Patient</h3>
          <DetailRow label="DIN" value={order.din} />
          <DetailRow label="Date of birth" value={order.dob} />
          <DetailRow label="Gender" value={order.gender} />
          <DetailRow label="Phone" value={order.phone} />
          <DetailRow label="Delivery address" value={order.address} />
          <DetailRow label="Allergies" value={order.allergies} />
        </section>

        {/* Prescriptions */}
        <section className="home__detail-section">
          <h3 className="home__detail-section-title">Prescriptions</h3>
          <p className="home__detail-doctor">{order.doctor} · NPI {order.npi}</p>
          <button
            className="home__accordion"
            onClick={() => setOpenScript((v) => !v)}
            aria-expanded={openScript}
          >
            <span>{order.drugs[0]?.name}</span>
            {openScript ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {openScript && (
            <div className="home__accordion-body">
              {order.drugs.map((d) => (
                <p key={d.name} className="home__accordion-item">{d.name}</p>
              ))}
            </div>
          )}
        </section>

        {/* Insurance & Payment */}
        <section className="home__detail-section">
          <h3 className="home__detail-section-title">Insurance &amp; Payment</h3>
          <DetailRow label="Plan" value={order.plan} />
          <DetailRow label="Claim #" value={order.claim} />
          <DetailRow label="Total copay" value={order.copay} />
        </section>
      </div>

      {/* Sticky footer */}
      <div className="home__detail-footer">
        <button className="home__detail-btn home__detail-btn--decline" onClick={onDecline}>
          Decline
        </button>
        <button className="home__detail-btn home__detail-btn--accept" onClick={onAccept}>
          Accept Order
        </button>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="home__detail-row">
      <span className="home__detail-label">{label}</span>
      <span className="home__detail-value">{value}</span>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="home__empty">
      <div className="home__empty-icon" aria-hidden="true">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="40" fill="#F4F4F4" />
          <path d="M26 28h28v4H26zM26 36h20v4H26zM26 44h24v4H26z" fill="#C6C6C6" />
          <circle cx="54" cy="52" r="10" fill="#E0E0E0" />
          <path d="M51 52h6M54 49v6" stroke="#A8A8A8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <p className="home__empty-title">Queue is clear</p>
      <p className="home__empty-sub">No new orders at the moment. New orders will appear here when they arrive.</p>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'active' | 'blocked'>('active')
  const [blockedFilter, setBlockedFilter] = useState<string | null>(null)
  const [section, setSection] = useState<SidebarSection>('new-order')
  const [acceptingOrders, setAcceptingOrders] = useState(true)
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS)
  const [blockedOrders, setBlockedOrders] = useState<Order[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null

  const handleAccept = () => {
    if (!selectedId) return
    setOrders((prev) => prev.filter((o) => o.id !== selectedId))
    setSelectedId(null)
  }

  const handleDecline = () => {
    if (!selectedId) return
    const order = orders.find((o) => o.id === selectedId)
    if (order) {
      setBlockedOrders((prev) => [...prev, order])
      setOrders((prev) => prev.filter((o) => o.id !== selectedId))
    }
    setSelectedId(null)
  }

  const showDetail = selectedId !== null && selectedOrder !== null
  const isNewOrder = section === 'new-order' && activeTab === 'active'
  const displayOrders = isNewOrder ? orders : []

  return (
    <div className="home">
      {/* ── App Header ──────────────────────────────────────────────────────── */}
      <header className="home__header">
        <div className="home__header-left">
          <span className="home__pharmacy-name">Shoppers Drug Mart Pembina &amp; Point</span>
        </div>
        <div className="home__header-center">
          <div className="home__search">
            <Search size={16} className="home__search-icon" />
            <input className="home__search-input" placeholder="Search orders, patients..." />
          </div>
        </div>
        <div className="home__header-right">
          <button className="home__notif-btn" aria-label="Notifications">
            <Notification size={20} />
            <span className="home__notif-dot" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="home__body">
        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className="home__sidebar">
          {/* Tabs */}
          <div className="home__tabs">
            <button
              className={['home__tab', activeTab === 'active' ? 'home__tab--active' : ''].filter(Boolean).join(' ')}
              onClick={() => { setActiveTab('active'); setBlockedFilter(null) }}
            >
              Active
            </button>
            <button
              className={['home__tab', activeTab === 'blocked' ? 'home__tab--active' : ''].filter(Boolean).join(' ')}
              onClick={() => setActiveTab('blocked')}
            >
              Blocked
            </button>
          </div>

          {/* Blocked sub-filters */}
          {activeTab === 'blocked' && (
            <div className="home__blocked-filters">
              {BLOCKED_FILTERS.map((f) => (
                <button
                  key={f}
                  className={['home__blocked-filter', blockedFilter === f ? 'home__blocked-filter--active' : ''].filter(Boolean).join(' ')}
                  onClick={() => setBlockedFilter(blockedFilter === f ? null : f)}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* Nav items */}
          <nav className="home__nav">
            {activeTab === 'active' ? (
              <>
                <NavItem label="New order" count={orders.length} active={section === 'new-order'} onClick={() => setSection('new-order')} />
                <NavItem label="Being Prepared" count={0} active={section === 'being-prepared'} onClick={() => setSection('being-prepared')} />
                <NavItem label="Waiting for Driver" active={section === 'waiting-driver'} onClick={() => setSection('waiting-driver')} />
                <NavItem label="Delivered" count={8} active={section === 'delivered'} onClick={() => setSection('delivered')} />
              </>
            ) : (
              <>
                <NavItem label="Blocked" count={blockedOrders.length} active onClick={() => {}} />
              </>
            )}
          </nav>

          {/* Accepting Orders toggle */}
          <div className="home__sidebar-footer">
            <p className="home__toggle-label">Keep turn on to receive orders</p>
            <div className="home__toggle-row">
              <Toggle
                id="accepting-orders"
                labelA=""
                labelB=""
                toggled={acceptingOrders}
                onToggle={(v) => setAcceptingOrders(v)}
                hideLabel
              />
              <span className="home__toggle-text">Accepting Orders</span>
            </div>
          </div>
        </aside>

        {/* ── Content Area ─────────────────────────────────────────────────── */}
        <main className="home__content">
          {activeTab === 'blocked' ? (
            /* Blocked view */
            blockedOrders.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="home__grid">
                {blockedOrders.map((o) => (
                  <OrderCard key={o.id} order={o} onClick={() => {}} />
                ))}
              </div>
            )
          ) : section !== 'new-order' ? (
            /* Static placeholder for other sections */
            <EmptyState />
          ) : displayOrders.length === 0 ? (
            <EmptyState />
          ) : showDetail ? (
            /* List + Detail split view */
            <div className="home__split">
              <div className="home__list">
                {displayOrders.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    compact
                    selected={o.id === selectedId}
                    onClick={() => setSelectedId(o.id)}
                  />
                ))}
              </div>
              <DetailPanel
                order={selectedOrder!}
                onClose={() => setSelectedId(null)}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            </div>
          ) : (
            /* Grid view */
            <div className="home__grid">
              {displayOrders.map((o) => (
                <OrderCard key={o.id} order={o} onClick={() => setSelectedId(o.id)} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function NavItem({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count?: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      className={['home__nav-item', active ? 'home__nav-item--active' : ''].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      <span className="home__nav-label">{label}</span>
      {count !== undefined && <span className="home__nav-count">{count}</span>}
    </button>
  )
}
