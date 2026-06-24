import { useState, useEffect } from 'react'
import { Toggle, ProgressIndicator, ProgressStep, Checkbox, InlineLoading, RadioButtonGroup, RadioButton } from '@carbon/react'
import {
  Notification,
  Search,
  Close,
  Medication,
  Document,
  ChevronDown,
  ChevronUp,
  Warning,
  ArrowRight,
  CheckmarkFilled,
  WarningAltFilled,
  ErrorFilled,
} from '@carbon/icons-react'
import './HomePage.scss'
import SettingContent from './SettingContent'

// ── Types ────────────────────────────────────────────────────────────────────

type OrderType = 'Rx' | 'OTC' | 'Supplement'
type OrderStatus = 'Verified' | 'Pending'
type IssueType = 'Insurance' | 'Prescription' | 'Out of Stock' | 'Verification'
type FlagReason =
  | 'Suspected duplicate order'
  | "Patient information doesn't match our records"
  | 'Prescription details look incorrect'
  | 'Suspected fraudulent or forged order'
  | 'Other'
type OrderState = 'new' | 'preparing' | 'waiting-driver' | 'in-transit' | 'delivered' | 'blocked'
type SidebarSection = 'new-order' | 'being-prepared' | 'waiting-driver' | 'in-transit' | 'delivered'

interface Prescription {
  name: string
  form: string
  qty: number
  directions: string
  ndc: string
  dea: string
  refills: number
}

interface Driver {
  name: string
  phone: string
  pickupEta: string
  assignedAt: string
}

interface Order {
  id: string
  patientName: string
  type: OrderType
  status: OrderStatus
  prescriptions: Prescription[]
  scriptCount: number
  scriptLabel: string
  time: string
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
  orderState: OrderState
  checklistChecked: boolean[]
  driver?: Driver
  requestedAt?: string
  estimatedTime?: string
  issueType?: IssueType
  flagReason?: FlagReason
  issueNotes?: string
  isHeld?: boolean
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_DRIVER: Driver = {
  name: 'Marcus T.',
  phone: '(512) 555-0847',
  pickupEta: 'Arriving in ~8 min',
  assignedAt: '2:35 PM',
}

const INITIAL_ORDERS: Order[] = [
  // ── New Orders ─────────────────────────────────────────────────────────────
  {
    id: '#GN-201', patientName: 'Margaret Holloway', type: 'Rx', status: 'Verified',
    prescriptions: [
      { name: 'Amlodipine 5mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet by mouth once daily', ndc: '00069-1530-66', dea: 'Non-controlled', refills: 5 },
      { name: 'Ramipril 5mg', form: 'Capsule', qty: 30, directions: 'Take 1 capsule by mouth once daily', ndc: '00071-0221-23', dea: 'Non-controlled', refills: 3 },
      { name: 'Rosuvastatin 10mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet at bedtime', ndc: '00310-0751-90', dea: 'Non-controlled', refills: 2 },
    ],
    scriptCount: 1, scriptLabel: 'Prescription', time: '7:30 PM',
    din: '09837812', dob: 'July 12, 1953 (age 71)', gender: 'Female', phone: '(512) 555-0183',
    address: '1204 Enfield Rd, Apt 8, Austin', allergies: 'None on file',
    doctor: 'Dr. Karen Li', npi: '1098765432',
    plan: 'Medicare Part D — Humana Walmart Rx Plan', claim: 'Approval', copay: '$32.00',
    orderState: 'new', checklistChecked: [false, false, false], requestedAt: '7:30 PM', estimatedTime: '5 – 8 mins',
  },
  {
    id: '#GN-202', patientName: 'Jamal Thompson', type: 'OTC', status: 'Pending',
    prescriptions: [
      { name: 'Ibuprofen 200mg', form: 'Tablet', qty: 24, directions: 'Take 1-2 tablets every 4-6 hours as needed', ndc: '00573-0168-27', dea: 'Non-controlled', refills: 0 },
      { name: 'Acetaminophen 500mg', form: 'Tablet', qty: 50, directions: 'Take 2 tablets every 6 hours as needed', ndc: '50580-0449-36', dea: 'Non-controlled', refills: 0 },
    ],
    scriptCount: 1, scriptLabel: 'Over-the-Counter', time: '3:15 PM',
    din: '06219834', dob: 'Jul 22, 1988', gender: 'Male', phone: '(204) 555-0147',
    address: '320 Donald St, Winnipeg, MB R3B 2H3', allergies: 'None known',
    doctor: 'Dr. Ahmed Syed', npi: '2034561890',
    plan: 'Sun Life Financial', claim: 'CLM-88422', copay: '$5.00',
    orderState: 'new', checklistChecked: [false, false], requestedAt: '3:15 PM', estimatedTime: '5 – 8 mins',
  },
  {
    id: '#GN-203', patientName: 'Sofia Martinez', type: 'OTC', status: 'Verified',
    prescriptions: [
      { name: 'Metformin 500mg', form: 'Tablet', qty: 60, directions: 'Take 1 tablet twice daily with meals', ndc: '00093-1048-01', dea: 'Non-controlled', refills: 5 },
      { name: 'Glipizide 5mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet 30 min before breakfast', ndc: '00049-1560-66', dea: 'Non-controlled', refills: 2 },
    ],
    scriptCount: 2, scriptLabel: 'Prescription', time: '10:45 AM',
    din: '07345219', dob: 'Nov 3, 1975', gender: 'Female', phone: '(204) 555-0281',
    address: '99 Osborne St, Winnipeg, MB R3L 1Y5', allergies: 'Aspirin',
    doctor: 'Dr. Maria Chen', npi: '3012348765',
    plan: 'Manulife', claim: 'CLM-88423', copay: '$18.75',
    orderState: 'new', checklistChecked: [false, false], requestedAt: '10:45 AM', estimatedTime: '5 – 8 mins',
  },
  {
    id: '#GN-204', patientName: "Liam O'Connor", type: 'Supplement', status: 'Verified',
    prescriptions: [
      { name: 'Vitamin D3 2000 IU', form: 'Softgel', qty: 90, directions: 'Take 1 softgel daily with a meal', ndc: '31604-0070-90', dea: 'Non-controlled', refills: 0 },
    ],
    scriptCount: 1, scriptLabel: 'Supplement', time: '1:00 PM',
    din: '04567128', dob: 'Feb 9, 1995', gender: 'Male', phone: '(204) 555-0339',
    address: '245 Portage Ave, Winnipeg, MB R3B 2A9', allergies: 'Latex',
    doctor: 'Dr. James Park', npi: '4098123456',
    plan: 'Great-West Life', claim: 'CLM-88424', copay: '$0.00',
    orderState: 'new', checklistChecked: [false], requestedAt: '1:00 PM', estimatedTime: '5 – 8 mins',
  },
  // ── Being Prepared ─────────────────────────────────────────────────────────
  {
    id: '#GN-205', patientName: 'Carlos Robert', type: 'Rx', status: 'Verified',
    prescriptions: [
      { name: 'Lisinopril 10mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet once daily', ndc: '68180-513-06', dea: 'Non-controlled', refills: 3 },
      { name: 'Hydrochlorothiazide 25mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet once daily', ndc: '00378-0214-01', dea: 'Non-controlled', refills: 2 },
    ],
    scriptCount: 2, scriptLabel: 'Prescriptions', time: '8:30 PM',
    din: '08921345', dob: 'May 3, 1968', gender: 'Male', phone: '(512) 555-0234',
    address: '500 Main St, Austin, TX 78701', allergies: 'None on file',
    doctor: 'Dr. Karen Li', npi: '1098765432',
    plan: 'Medicare Part D', claim: 'CLM-88425', copay: '$15.00',
    orderState: 'preparing', checklistChecked: [true, false], requestedAt: '8:30 PM', estimatedTime: '5 – 8 mins',
  },
  // ── Waiting for Driver ─────────────────────────────────────────────────────
  {
    id: '#GN-206', patientName: 'Priya Sharma', type: 'Rx', status: 'Verified',
    prescriptions: [
      { name: 'Metoprolol 50mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet twice daily', ndc: '00378-0751-01', dea: 'Non-controlled', refills: 4 },
      { name: 'Atorvastatin 20mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet at bedtime', ndc: '00071-0157-23', dea: 'Non-controlled', refills: 2 },
    ],
    scriptCount: 2, scriptLabel: 'Prescriptions', time: '2:15 PM',
    din: '05678234', dob: 'Mar 12, 1979', gender: 'Female', phone: '(512) 555-0412',
    address: '2800 S Congress Ave, Austin, TX 78704', allergies: 'Penicillin',
    doctor: 'Dr. Sarah Wells', npi: '5021348976',
    plan: 'Blue Shield', claim: 'CLM-88426', copay: '$22.00',
    orderState: 'waiting-driver', checklistChecked: [true, true], driver: undefined,
    requestedAt: '2:31 PM', estimatedTime: '5 – 8 mins',
  },
  {
    id: '#GN-207', patientName: 'James Wilson', type: 'OTC', status: 'Verified',
    prescriptions: [
      { name: 'Aspirin 81mg', form: 'Tablet', qty: 90, directions: 'Take 1 tablet daily', ndc: '00280-0402-04', dea: 'Non-controlled', refills: 0 },
    ],
    scriptCount: 1, scriptLabel: 'Over-the-Counter', time: '1:45 PM',
    din: '03456891', dob: 'Aug 17, 1962', gender: 'Male', phone: '(512) 555-0677',
    address: '100 Congress Ave, Austin, TX 78701', allergies: 'None known',
    doctor: 'Dr. Tom Hughes', npi: '6034512897',
    plan: 'Aetna', claim: 'CLM-88427', copay: '$0.00',
    orderState: 'waiting-driver', checklistChecked: [true], driver: MOCK_DRIVER,
    requestedAt: '2:20 PM', estimatedTime: '5 – 8 mins',
  },
  // ── In Transit ─────────────────────────────────────────────────────────────
  {
    id: '#GN-208', patientName: 'Rachel Green', type: 'Rx', status: 'Verified',
    prescriptions: [
      { name: 'Lisinopril 10mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet once daily', ndc: '68180-513-06', dea: 'Non-controlled', refills: 3 },
      { name: 'Lisinopril 20mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet once daily', ndc: '68180-514-06', dea: 'Non-controlled', refills: 2 },
    ],
    scriptCount: 2, scriptLabel: 'Prescription', time: '7:30 PM',
    din: '02345678', dob: 'Jun 14, 1980', gender: 'Female', phone: '(512) 555-0921',
    address: '1408 South St, Austin, TX 78704', allergies: 'None on file',
    doctor: 'Dr. Karen Li', npi: '1098765432',
    plan: 'Cigna', claim: 'CLM-88428', copay: '$18.00',
    orderState: 'in-transit', checklistChecked: [true, true],
    driver: { name: 'Marcus T.', phone: '(512) 555-0847', pickupEta: 'Arriving in ~8 min', assignedAt: '2:35 PM' },
    requestedAt: '7:30 PM', estimatedTime: '5 – 8 mins',
  },
  {
    id: '#GN-209', patientName: 'Victor Okafor', type: 'Rx', status: 'Verified',
    prescriptions: [
      { name: 'Metformin 500mg', form: 'Tablet', qty: 60, directions: 'Take 1 tablet twice daily', ndc: '00093-1048-01', dea: 'Non-controlled', refills: 4 },
      { name: 'Atorvastatin 20mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet at bedtime', ndc: '00071-0157-23', dea: 'Non-controlled', refills: 2 },
      { name: 'Amlodipine 5mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet once daily', ndc: '00069-1530-66', dea: 'Non-controlled', refills: 5 },
    ],
    scriptCount: 3, scriptLabel: 'Prescriptions', time: '8:15 PM',
    din: '01234567', dob: 'Sep 22, 1971', gender: 'Male', phone: '(512) 555-0456',
    address: '3200 Red River St, Austin, TX 78705', allergies: 'Sulfa drugs',
    doctor: 'Dr. Maria Chen', npi: '3012348765',
    plan: 'UnitedHealth', claim: 'CLM-88429', copay: '$28.50',
    orderState: 'in-transit', checklistChecked: [true, true, true],
    driver: { name: 'Elena M.', phone: '(512) 555-0312', pickupEta: 'Arriving in ~12 min', assignedAt: '3:10 PM' },
    requestedAt: '8:00 PM', estimatedTime: '8 – 12 mins',
  },
  {
    id: '#GN-210', patientName: 'Yuki Tanaka', type: 'OTC', status: 'Verified',
    prescriptions: [
      { name: 'Amoxicillin 250mg', form: 'Capsule', qty: 21, directions: 'Take 1 capsule three times daily', ndc: '00093-4159-05', dea: 'Non-controlled', refills: 0 },
      { name: 'Ibuprofen 400mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet every 6 hours with food', ndc: '00536-3603-01', dea: 'Non-controlled', refills: 0 },
    ],
    scriptCount: 2, scriptLabel: 'Prescriptions', time: '8:45 PM',
    din: '09123456', dob: 'Dec 5, 1990', gender: 'Female', phone: '(512) 555-0789',
    address: '1500 Guadalupe St, Austin, TX 78701', allergies: 'None known',
    doctor: 'Dr. Ahmed Syed', npi: '2034561890',
    plan: 'Humana', claim: 'CLM-88430', copay: '$6.00',
    orderState: 'in-transit', checklistChecked: [true, true],
    driver: { name: 'Jamal R.', phone: '(512) 555-0654', pickupEta: 'Arriving in ~5 min', assignedAt: '3:40 PM' },
    requestedAt: '8:45 PM', estimatedTime: '5 – 8 mins',
  },
  // ── Blocked ────────────────────────────────────────────────────────────────
  {
    id: '#GN-214', patientName: 'Diana Prince', type: 'Rx', status: 'Pending',
    prescriptions: [
      { name: 'Atorvastatin 40mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet at bedtime', ndc: '00071-0157-23', dea: 'Non-controlled', refills: 2 },
    ],
    scriptCount: 1, scriptLabel: 'Prescription', time: '9:15 AM',
    din: '03948271', dob: 'Apr 5, 1978', gender: 'Female', phone: '(512) 555-0221',
    address: '820 Lamar Blvd, Austin, TX 78703', allergies: 'None on file',
    doctor: 'Dr. Karen Li', npi: '1098765432',
    plan: 'BlueCross BlueShield', claim: 'CLM-88501', copay: '$12.00',
    orderState: 'blocked', checklistChecked: [false],
    issueType: 'Insurance', issueNotes: 'Claim rejected — coverage not found', isHeld: false,
  },
  {
    id: '#GN-215', patientName: 'Henry Ford', type: 'Rx', status: 'Pending',
    prescriptions: [
      { name: 'Oxycodone 5mg', form: 'Tablet', qty: 20, directions: 'Take 1 tablet every 6 hours as needed', ndc: '00406-0512-01', dea: 'Schedule II', refills: 0 },
      { name: 'Ibuprofen 600mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet every 8 hours with food', ndc: '00536-3603-01', dea: 'Non-controlled', refills: 2 },
    ],
    scriptCount: 2, scriptLabel: 'Prescriptions', time: '10:30 AM',
    din: '07123984', dob: 'Jul 30, 1965', gender: 'Male', phone: '(512) 555-0449',
    address: '305 Congress Ave, Austin, TX 78701', allergies: 'Codeine',
    doctor: 'Dr. Ahmed Syed', npi: '2034561890',
    plan: 'Aetna', claim: 'CLM-88502', copay: '$8.50',
    orderState: 'blocked', checklistChecked: [false, false],
    issueType: 'Prescription', issueNotes: 'Prescription requires review — DEA Schedule II', isHeld: true,
  },
  {
    id: '#GN-216', patientName: 'Nina Simone', type: 'OTC', status: 'Verified',
    prescriptions: [
      { name: 'Amoxicillin 500mg', form: 'Capsule', qty: 21, directions: 'Take 1 capsule three times daily', ndc: '00093-4159-05', dea: 'Non-controlled', refills: 0 },
    ],
    scriptCount: 1, scriptLabel: 'Over-the-Counter', time: '11:00 AM',
    din: '05812347', dob: 'Feb 21, 1933', gender: 'Female', phone: '(512) 555-0667',
    address: '112 Red River St, Austin, TX 78701', allergies: 'Penicillin',
    doctor: 'Dr. Sarah Wells', npi: '5021348976',
    plan: 'Humana', claim: 'CLM-88503', copay: '$0.00',
    orderState: 'blocked', checklistChecked: [false],
    issueType: 'Out of Stock', issueNotes: 'Amoxicillin 500mg capsules currently unavailable', isHeld: false,
  },
  {
    id: '#GN-217', patientName: 'Carlos Ruiz', type: 'Rx', status: 'Pending',
    prescriptions: [
      { name: 'Warfarin 5mg', form: 'Tablet', qty: 30, directions: 'Take as directed by physician', ndc: '00056-0170-70', dea: 'Non-controlled', refills: 3 },
    ],
    scriptCount: 1, scriptLabel: 'Prescription', time: '12:20 PM',
    din: '09234561', dob: 'Nov 14, 1960', gender: 'Male', phone: '(512) 555-0882',
    address: '2100 Guadalupe St, Austin, TX 78705', allergies: 'Aspirin',
    doctor: 'Dr. Maria Chen', npi: '3012348765',
    plan: 'Medicare Part D', claim: 'CLM-88504', copay: '$4.25',
    orderState: 'blocked', checklistChecked: [false],
    issueType: 'Verification', issueNotes: 'Patient identity requires manual verification', isHeld: true,
  },
  // ── Delivered ──────────────────────────────────────────────────────────────
  {
    id: '#GN-211', patientName: 'Margaret Holloway', type: 'Rx', status: 'Verified',
    prescriptions: [
      { name: 'Lisinopril 10mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet once daily', ndc: '68180-513-06', dea: 'Non-controlled', refills: 3 },
      { name: 'Lisinopril 20mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet once daily', ndc: '68180-514-06', dea: 'Non-controlled', refills: 2 },
    ],
    scriptCount: 2, scriptLabel: 'Prescription', time: '7:30 PM',
    din: '09837812', dob: 'July 12, 1953 (age 71)', gender: 'Female', phone: '(512) 555-0183',
    address: '1204 Enfield Rd, Apt 8, Austin', allergies: 'None on file',
    doctor: 'Dr. Karen Li', npi: '1098765432',
    plan: 'Medicare Part D', claim: 'CLM-88431', copay: '$32.00',
    orderState: 'delivered', checklistChecked: [true, true],
    driver: { name: 'Marcus T.', phone: '(512) 555-0847', pickupEta: 'Delivered', assignedAt: '2:35 PM' },
    requestedAt: '7:30 PM', estimatedTime: '5 – 8 mins',
  },
  {
    id: '#GN-212', patientName: 'Victor Okafor', type: 'Rx', status: 'Verified',
    prescriptions: [
      { name: 'Metformin 500mg', form: 'Tablet', qty: 60, directions: 'Take 1 tablet twice daily', ndc: '00093-1048-01', dea: 'Non-controlled', refills: 4 },
      { name: 'Atorvastatin 20mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet at bedtime', ndc: '00071-0157-23', dea: 'Non-controlled', refills: 2 },
      { name: 'Amlodipine 5mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet once daily', ndc: '00069-1530-66', dea: 'Non-controlled', refills: 5 },
    ],
    scriptCount: 3, scriptLabel: 'Prescriptions', time: '8:15 PM',
    din: '01234567', dob: 'Sep 22, 1971', gender: 'Male', phone: '(512) 555-0456',
    address: '3200 Red River St, Austin, TX 78705', allergies: 'Sulfa drugs',
    doctor: 'Dr. Maria Chen', npi: '3012348765',
    plan: 'UnitedHealth', claim: 'CLM-88432', copay: '$28.50',
    orderState: 'delivered', checklistChecked: [true, true, true],
    driver: { name: 'Olivia K.', phone: '(512) 555-0199', pickupEta: 'Delivered', assignedAt: '3:15 PM' },
    requestedAt: '8:00 PM', estimatedTime: '8 – 12 mins',
  },
  {
    id: '#GN-213', patientName: 'Yuki Tanaka', type: 'OTC', status: 'Verified',
    prescriptions: [
      { name: 'Amoxicillin 250mg', form: 'Capsule', qty: 21, directions: 'Take 1 capsule three times daily', ndc: '00093-4159-05', dea: 'Non-controlled', refills: 0 },
      { name: 'Cetirizine 10mg', form: 'Tablet', qty: 30, directions: 'Take 1 tablet daily', ndc: '45802-0650-78', dea: 'Non-controlled', refills: 0 },
    ],
    scriptCount: 2, scriptLabel: 'Prescriptions', time: '9:00 PM',
    din: '09123456', dob: 'Dec 5, 1990', gender: 'Female', phone: '(512) 555-0789',
    address: '1500 Guadalupe St, Austin, TX 78701', allergies: 'None known',
    doctor: 'Dr. Ahmed Syed', npi: '2034561890',
    plan: 'Humana', claim: 'CLM-88433', copay: '$6.00',
    orderState: 'delivered', checklistChecked: [true, true],
    driver: { name: 'Liam S.', phone: '(512) 555-0334', pickupEta: 'Delivered', assignedAt: '4:05 PM' },
    requestedAt: '9:00 PM', estimatedTime: '5 – 8 mins',
  },
]

const ISSUE_TYPES: IssueType[] = ['Insurance', 'Prescription', 'Out of Stock', 'Verification']
const BLOCKED_FILTERS = ISSUE_TYPES

const FLAG_REASONS: FlagReason[] = [
  'Suspected duplicate order',
  "Patient information doesn't match our records",
  'Prescription details look incorrect',
  'Suspected fraudulent or forged order',
  'Other',
]

const FLAG_REASON_TO_ISSUE: Record<FlagReason, IssueType> = {
  'Suspected duplicate order':                    'Verification',
  "Patient information doesn't match our records": 'Verification',
  'Prescription details look incorrect':          'Prescription',
  'Suspected fraudulent or forged order':         'Verification',
  'Other':                                        'Verification',
}

const ISSUE_LABELS: Record<IssueType, { tag: string; message: (name: string) => string; modalTitle: string }> = {
  Insurance:      { tag: 'Rejected claims',    message: (n) => `Coverage not found for ${n}`,         modalTitle: 'Insurance Rejection'   },
  Prescription:   { tag: 'Rx issue',           message: (n) => `Prescription requires review for ${n}`, modalTitle: 'Prescription Issue'    },
  'Out of Stock': { tag: 'Out of stock',       message: (n) => `Medication out of stock for ${n}`,     modalTitle: 'Out of Stock'          },
  Verification:   { tag: 'Needs verification', message: (n) => `Verification required for ${n}`,       modalTitle: 'Verification Required' },
}
const PROGRESS_STEPS = ['Receive', 'Preparing', 'Waiting driver', 'Transit']

const SECTION_TITLES: Record<SidebarSection, string> = {
  'new-order': 'New Orders',
  'being-prepared': 'Being Prepared',
  'waiting-driver': 'Waiting for Driver',
  'in-transit': 'In Transit',
  'delivered': 'Delivered',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function typeTagClass(type: OrderType) {
  if (type === 'Rx') return 'home__tag home__tag--teal'
  if (type === 'OTC') return 'home__tag home__tag--blue'
  return 'home__tag home__tag--teal'
}

function statusTagClass(status: OrderStatus) {
  return status === 'Verified' ? 'home__tag home__tag--green' : 'home__tag home__tag--orange'
}

function progressIndex(state: OrderState): number {
  if (state === 'new') return 0
  if (state === 'preparing') return 1
  if (state === 'waiting-driver') return 2
  if (state === 'in-transit') return 3
  return 4 // delivered → all steps complete
}

// ── Drug list ─────────────────────────────────────────────────────────────────

function DrugList({ prescriptions }: { prescriptions: Prescription[] }) {
  const visible = prescriptions.slice(0, 2)
  const extra = prescriptions.length - 2
  return (
    <div className="home__drug-list">
      <Medication size={16} className="home__drug-icon" />
      <span className="home__drug-names">
        {visible.map((p) => p.name).join('; ')}
        {extra > 0 && <span className="home__drug-more"> +{extra} more</span>}
      </span>
    </div>
  )
}

// ── Order Card ────────────────────────────────────────────────────────────────

function OrderCard({
  order, compact, selected, onClick,
}: {
  order: Order; compact?: boolean; selected?: boolean; onClick: () => void
}) {
  const { orderState } = order
  const isWaiting = orderState === 'waiting-driver'
  const isInTransit = orderState === 'in-transit'
  const isDelivered = orderState === 'delivered'
  const isBlocked = orderState === 'blocked'
  const showDriverRow = isInTransit || isDelivered

  return (
    <button
      className={['home__card', compact ? 'home__card--compact' : '', selected ? 'home__card--selected' : '', isBlocked ? 'home__card--blocked' : ''].filter(Boolean).join(' ')}
      onClick={onClick}
      aria-pressed={selected}
    >
      <div className="home__card-row">
        <span className="home__card-id">{order.id}</span>
        {isWaiting && <InlineLoading description="Waiting for driver..." status="active" className="home__card-loading" />}
        {isInTransit && <InlineLoading description="Delivering..." status="active" className="home__card-loading" />}
        {isBlocked && (
          <span className="home__tag home__tag--blocked">
            {order.issueType ? ISSUE_LABELS[order.issueType].tag : 'Blocked'}
          </span>
        )}
        {!isWaiting && !isInTransit && !isDelivered && !isBlocked && (
          <span className={typeTagClass(order.type)}>{order.type}</span>
        )}
      </div>
      <div className="home__card-row">
        {showDriverRow ? (
          <span className="home__card-driver">Driver: {order.driver?.name ?? '—'}</span>
        ) : (
          <span className="home__card-patient">{order.patientName}</span>
        )}
        {!isWaiting && !showDriverRow && !isBlocked && (
          <span className={statusTagClass(order.status)}>{order.status}</span>
        )}
        {isBlocked && order.isHeld && (
          <span className="home__tag home__tag--held">On Hold</span>
        )}
      </div>
      <DrugList prescriptions={order.prescriptions} />
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

// ── Collapsible section ───────────────────────────────────────────────────────

function CollapsibleSection({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="home__detail-section">
      <button className="home__section-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="home__detail-section-title">{title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="home__section-body">{children}</div>}
    </section>
  )
}

// ── Detail Row ────────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="home__detail-row">
      <span className="home__detail-label">{label}</span>
      <span className="home__detail-value">{value}</span>
    </div>
  )
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

function DetailPanel({ order, onClose, onAccept, onFlagIssues, onReadyForPickup, onPackageHandoff, onChecklistToggle }: {
  order: Order; onClose: () => void; onAccept: () => void; onFlagIssues: () => void
  onReadyForPickup: () => void; onPackageHandoff: () => void
  onChecklistToggle: (rxIndex: number, checked: boolean) => void
}) {
  const [openRxIndexes, setOpenRxIndexes] = useState<Set<number>>(new Set([0]))

  const toggleRx = (i: number) => {
    setOpenRxIndexes((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
  }

  const allChecked = order.checklistChecked.every(Boolean)

  // Shared close + meta header
  const metaHeader = (
    <>
      <div className="home__detail-close-row">
        <button className="home__detail-close" onClick={onClose} aria-label="Close">
          <Close size={20} />
        </button>
      </div>
      <div className="home__detail-meta">
        <div className="home__detail-meta-left">
          <p className="home__detail-id">{order.id}</p>
          <p className="home__detail-name">{order.patientName}</p>
        </div>
        <div className="home__detail-meta-tags">
          <span className={typeTagClass(order.type)}>{order.type}</span>
          <span className={statusTagClass(order.status)}>{order.status}</span>
        </div>
      </div>
    </>
  )

  // Shared progress indicator
  const progressBar = (
    <div className="home__progress-wrap">
      <ProgressIndicator currentIndex={progressIndex(order.orderState)} spaceEqually>
        {PROGRESS_STEPS.map((step) => <ProgressStep key={step} label={step} />)}
      </ProgressIndicator>
    </div>
  )

  // Shared collapsed sections (Patient, Prescriptions, Insurance)
  const collapsedSections = (
    <>
      <CollapsibleSection title="Patient">
        <DetailRow label="DIN" value={order.din} />
        <DetailRow label="Date of birth" value={order.dob} />
        <DetailRow label="Gender" value={order.gender} />
        <DetailRow label="Phone" value={order.phone} />
        <DetailRow label="Delivery address" value={order.address} />
        <DetailRow label="Allergies" value={order.allergies} />
      </CollapsibleSection>
      <CollapsibleSection title="Prescriptions">
        <p className="home__detail-doctor" style={{ marginBottom: '8px' }}>{order.doctor} · NPI {order.npi}</p>
        {order.prescriptions.map((rx) => <p key={rx.name} className="home__detail-rx-name">{rx.name}</p>)}
      </CollapsibleSection>
      <CollapsibleSection title="Insurance &amp; Payment">
        <DetailRow label="Plan" value={order.plan} />
        <DetailRow label="Claim" value={order.claim} />
        <DetailRow label="Total copay" value={order.copay} />
      </CollapsibleSection>
    </>
  )

  // ── New Orders ─────────────────────────────────────────────────────────────
  if (order.orderState === 'new') {
    return (
      <div className="home__detail">
        {metaHeader}{progressBar}
        <div className="home__detail-body">
          <section className="home__detail-section">
            <h3 className="home__detail-section-title">Patient</h3>
            <DetailRow label="DIN" value={order.din} />
            <DetailRow label="Date of birth" value={order.dob} />
            <DetailRow label="Gender" value={order.gender} />
            <DetailRow label="Phone" value={order.phone} />
            <DetailRow label="Delivery address" value={order.address} />
            <DetailRow label="Allergies" value={order.allergies} />
          </section>
          <section className="home__detail-section">
            <div className="home__detail-section-header">
              <h3 className="home__detail-section-title">Prescriptions</h3>
              <span className="home__detail-doctor">{order.doctor} · NPI {order.npi}</span>
            </div>
            {order.prescriptions.map((rx, i) => {
              const isOpen = openRxIndexes.has(i)
              return (
                <div key={rx.name} className="home__accordion-item">
                  <button className="home__accordion" onClick={() => toggleRx(i)} aria-expanded={isOpen}>
                    <span>{rx.name}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {isOpen && (
                    <div className="home__accordion-body">
                      <div className="home__accordion-row"><span className="home__accordion-label">Form</span><span className="home__accordion-value">{rx.form} · QTY {rx.qty}</span></div>
                      <div className="home__accordion-row"><span className="home__accordion-label">Directions</span><span className="home__accordion-value">{rx.directions}</span></div>
                      <div className="home__accordion-row"><span className="home__accordion-label">NDC</span><span className="home__accordion-value">{rx.ndc}</span></div>
                      <div className="home__accordion-row"><span className="home__accordion-label">DEA</span><span className="home__accordion-value">{rx.dea}</span></div>
                      <div className="home__accordion-row"><span className="home__accordion-label">Refills</span><span className="home__accordion-value">{rx.refills} remaining</span></div>
                    </div>
                  )}
                </div>
              )
            })}
          </section>
          <section className="home__detail-section">
            <h3 className="home__detail-section-title">Insurance &amp; Payment</h3>
            <DetailRow label="Plan" value={order.plan} />
            <DetailRow label="Claim" value={order.claim} />
            <DetailRow label="Total copay" value={order.copay} />
          </section>
        </div>
        <div className="home__detail-footer">
          <button className="home__detail-btn home__detail-btn--flag" onClick={onFlagIssues}><Warning size={16} /> Flag Issues</button>
          <button className="home__detail-btn home__detail-btn--accept" onClick={onAccept}>Accept &amp; Prepare <ArrowRight size={16} /></button>
        </div>
      </div>
    )
  }

  // ── Being Prepared ─────────────────────────────────────────────────────────
  if (order.orderState === 'preparing') {
    return (
      <div className="home__detail">
        {metaHeader}{progressBar}
        <div className="home__detail-body">
          <CollapsibleSection title="Patient">
            <DetailRow label="DIN" value={order.din} />
            <DetailRow label="Date of birth" value={order.dob} />
            <DetailRow label="Gender" value={order.gender} />
            <DetailRow label="Phone" value={order.phone} />
            <DetailRow label="Delivery address" value={order.address} />
            <DetailRow label="Allergies" value={order.allergies} />
          </CollapsibleSection>
          <section className="home__detail-section">
            <div className="home__detail-section-header">
              <div>
                <h3 className="home__detail-section-title">Prescriptions</h3>
                <p className="home__detail-section-sub">Check each item as you fill it</p>
              </div>
              <span className="home__detail-doctor">{order.doctor} · NPI {order.npi}</span>
            </div>
            {order.prescriptions.map((rx, i) => {
              const isOpen = openRxIndexes.has(i)
              const checked = order.checklistChecked[i]
              return (
                <div key={rx.name} className="home__rx-row">
                  <Checkbox id={`rx-${order.id}-${i}`} labelText="" hideLabel checked={checked}
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => onChecklistToggle(i, evt.target.checked)}
                    className="home__rx-checkbox"
                  />
                  <div className="home__accordion-item home__accordion-item--flex">
                    <button className={['home__accordion', checked ? 'home__accordion--checked' : ''].filter(Boolean).join(' ')} onClick={() => toggleRx(i)} aria-expanded={isOpen}>
                      <span>{rx.name}</span>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {isOpen && (
                      <div className="home__accordion-body">
                        <div className="home__accordion-row"><span className="home__accordion-label">Form</span><span className="home__accordion-value">{rx.form} · QTY {rx.qty}</span></div>
                        <div className="home__accordion-row"><span className="home__accordion-label">Directions</span><span className="home__accordion-value">{rx.directions}</span></div>
                        <div className="home__accordion-row"><span className="home__accordion-label">NDC</span><span className="home__accordion-value">{rx.ndc}</span></div>
                        <div className="home__accordion-row"><span className="home__accordion-label">DEA</span><span className="home__accordion-value">{rx.dea}</span></div>
                        <div className="home__accordion-row"><span className="home__accordion-label">Refills</span><span className="home__accordion-value">{rx.refills} remaining</span></div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </section>
          <CollapsibleSection title="Insurance &amp; Payment">
            <DetailRow label="Plan" value={order.plan} />
            <DetailRow label="Claim" value={order.claim} />
            <DetailRow label="Total copay" value={order.copay} />
          </CollapsibleSection>
        </div>
        <div className="home__detail-footer">
          <button className="home__detail-btn home__detail-btn--flag" onClick={onFlagIssues}><Warning size={16} /> Flag Issues</button>
          <button
            className={['home__detail-btn', allChecked ? 'home__detail-btn--accept' : 'home__detail-btn--disabled'].join(' ')}
            onClick={allChecked ? onReadyForPickup : undefined}
            disabled={!allChecked}
          >
            Ready for Pickup <ArrowRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  // ── Waiting for Driver ─────────────────────────────────────────────────────
  if (order.orderState === 'waiting-driver') {
    const driverFound = !!order.driver
    return (
      <div className="home__detail">
        {metaHeader}{progressBar}
        <div className="home__detail-body">
          {collapsedSections}
          <section className="home__detail-section home__driver-section">
            <h3 className="home__detail-section-title">Driver</h3>
            {driverFound ? (
              <>
                <InlineLoading description="Driver found" status="finished" className="home__driver-status" />
                <DetailRow label="Name" value={order.driver!.name} />
                <DetailRow label="Phone" value={order.driver!.phone} />
                <DetailRow label="Pickup ETA" value={order.driver!.pickupEta} />
                <DetailRow label="Assigned at" value={order.driver!.assignedAt} />
              </>
            ) : (
              <>
                <InlineLoading description="Looking for a nearby driver..." status="active" className="home__driver-status" />
                <p className="home__driver-note">Order is ready at the counter. A driver will be assigned automatically — no action needed.</p>
                <DetailRow label="Requested" value={order.requestedAt ?? '—'} />
                <DetailRow label="Time estimated" value={order.estimatedTime ?? '—'} />
              </>
            )}
          </section>
        </div>
        <div className="home__detail-footer">
          <button className="home__detail-btn home__detail-btn--flag" onClick={onFlagIssues}><Warning size={16} /> Flag Issues</button>
          <button
            className={['home__detail-btn', driverFound ? 'home__detail-btn--accept' : 'home__detail-btn--disabled'].join(' ')}
            onClick={driverFound ? onPackageHandoff : undefined}
            disabled={!driverFound}
          >
            Package Handoff <ArrowRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  // ── In Transit ─────────────────────────────────────────────────────────────
  if (order.orderState === 'in-transit') {
    return (
      <div className="home__detail">
        {metaHeader}{progressBar}
        <div className="home__detail-body">
          {collapsedSections}
          <section className="home__detail-section home__driver-section">
            <h3 className="home__detail-section-title">Driver</h3>
            <InlineLoading description="Driver en route" status="active" className="home__driver-status" />
            <DetailRow label="Name" value={order.driver?.name ?? '—'} />
            <DetailRow label="Phone" value={order.driver?.phone ?? '—'} />
            <DetailRow label="Pickup ETA" value={order.driver?.pickupEta ?? '—'} />
            <DetailRow label="Assigned at" value={order.driver?.assignedAt ?? '—'} />
          </section>
        </div>
        <div className="home__detail-footer home__detail-footer--right">
          <button className="home__detail-btn home__detail-btn--flag" onClick={onFlagIssues}><Warning size={16} /> Flag Issues</button>
        </div>
      </div>
    )
  }

  // ── Delivered (read-only) ──────────────────────────────────────────────────
  if (order.orderState === 'delivered') {
    return (
      <div className="home__detail">
        {metaHeader}
        {/* Delivered badge replaces progress indicator */}
        <div className="home__delivered-badge">
          <CheckmarkFilled size={16} className="home__delivered-icon" />
          <span>Order delivered</span>
        </div>
        <div className="home__detail-body">
          {collapsedSections}
          <CollapsibleSection title="Driver">
            <DetailRow label="Name" value={order.driver?.name ?? '—'} />
            <DetailRow label="Phone" value={order.driver?.phone ?? '—'} />
            <DetailRow label="Pickup ETA" value={order.driver?.pickupEta ?? '—'} />
            <DetailRow label="Assigned at" value={order.driver?.assignedAt ?? '—'} />
          </CollapsibleSection>
        </div>
        {/* No footer — read-only */}
      </div>
    )
  }

  return null
}

// ── Flag Issues Modal ─────────────────────────────────────────────────────────

function FlagIssuesModal({ order, onClose, onSubmit }: {
  order: Order
  onClose: () => void
  onSubmit: (reason: FlagReason, notes: string, hold: boolean) => void
}) {
  const [reason, setReason] = useState<FlagReason | ''>('')
  const [notes, setNotes] = useState('')
  const [hold, setHold] = useState(false)
  const MAX = 100

  return (
    <div className="home__modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="home__modal" role="dialog" aria-modal="true" aria-labelledby="flag-modal-title">
        {/* Header */}
        <div className="home__modal-header">
          <h2 className="home__modal-title" id="flag-modal-title">Flag an Issue</h2>
          <button className="home__modal-close" onClick={onClose} aria-label="Close">
            <Close size={20} />
          </button>
        </div>

        {/* Order identity row */}
        <div className="home__modal-order-row">
          <span className="home__modal-order-id">{order.id}</span>
          <span className="home__modal-order-name">{order.patientName}</span>
        </div>

        {/* Reason radio group */}
        <div className="home__modal-section">
          <RadioButtonGroup
            legendText="What is the issues"
            name="flag-reason"
            valueSelected={reason}
            onChange={(val) => setReason(val as FlagReason)}
            orientation="vertical"
            className="home__modal-radio-group"
          >
            {FLAG_REASONS.map((r) => (
              <RadioButton key={r} labelText={r} value={r} id={`reason-${r.replace(/[\s']/g, '-').toLowerCase().slice(0, 40)}`} />
            ))}
          </RadioButtonGroup>
        </div>

        {/* Notes */}
        <div className="home__modal-section">
          <div className="home__flag-note-header">
            <span className="home__flag-note-label">
              Add a note <span className="home__flag-note-optional">(optional)</span>
            </span>
            <span className="home__flag-note-count">{notes.length}/{MAX}</span>
          </div>
          <textarea
            className="home__resolve-textarea"
            placeholder="What did you observe?"
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, MAX))}
            rows={4}
          />
          <p className="home__flag-note-helper">Visible to GetNow operations team only</p>
        </div>

        {/* Hold section */}
        <div className="home__modal-hold-section">
          <div className="home__modal-hold-warning">
            <div className="home__modal-hold-heading">
              <WarningAltFilled size={16} className="home__modal-warning-icon" />
              <span>Do you want to hold this order?</span>
            </div>
            <p className="home__modal-hold-desc">The order won't be accepted until you clear the flag.</p>
            <div className="home__modal-hold-checkbox-row">
              <input
                type="checkbox"
                id="hold-order"
                checked={hold}
                onChange={(e) => setHold(e.target.checked)}
                className="home__modal-hold-checkbox"
              />
              <label htmlFor="hold-order" className="home__modal-hold-checkbox-label">
                Yes, hold this order while I investigate
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="home__modal-footer">
          <button className="home__modal-btn home__modal-btn--cancel" onClick={onClose}>
            Cancel Flag
          </button>
          <button
            className={['home__modal-btn', reason ? 'home__modal-btn--submit' : 'home__modal-btn--submit-disabled'].join(' ')}
            disabled={!reason}
            onClick={() => reason && onSubmit(reason as FlagReason, notes, hold)}
          >
            Flag Issue
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Resolve Modal ──────────────────────────────────────────────────────────────

function ResolveModal({ order, onClose, onResolve, onCancel }: {
  order: Order; onClose: () => void
  onResolve: (note: string) => void; onCancel: (note: string) => void
}) {
  const [note, setNote] = useState('')
  const MAX = 100
  const info = order.issueType ? ISSUE_LABELS[order.issueType] : null

  return (
    <div className="home__modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="home__resolve-modal" role="dialog" aria-modal="true" aria-labelledby="resolve-modal-title">
        <div className="home__resolve-modal-inner">
          <p className="home__resolve-sublabel">Issue Resolve Form</p>
          <div className="home__resolve-header">
            <h2 className="home__resolve-title" id="resolve-modal-title">{info?.modalTitle ?? 'Resolve Issue'}</h2>
            <button className="home__modal-close" onClick={onClose} aria-label="Close"><Close size={20} /></button>
          </div>
          <div className="home__resolve-body">
            <div className="home__resolve-note-row">
              <span className="home__resolve-note-label">Pharmacist's note</span>
              <span className="home__resolve-char-count">{note.length}/{MAX}</span>
            </div>
            <textarea
              className="home__resolve-textarea"
              placeholder="Reasons to cancel this order..."
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, MAX))}
              rows={5}
            />
          </div>
        </div>
        <div className="home__resolve-footer">
          <button className="home__resolve-btn home__resolve-btn--cancel" onClick={() => onCancel(note)}>
            Cancel Order
          </button>
          <button className="home__resolve-btn home__resolve-btn--resolve" onClick={() => onResolve(note)}>
            Issue Resolved
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Blocked Detail Panel ──────────────────────────────────────────────────────

function BlockedDetailPanel({ order, onClose, onOpenResolve }: {
  order: Order; onClose: () => void; onOpenResolve: () => void
}) {
  const [openRxIndexes, setOpenRxIndexes] = useState<Set<number>>(new Set([0]))
  const toggleRx = (i: number) => {
    setOpenRxIndexes((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
  }
  const info = order.issueType ? ISSUE_LABELS[order.issueType] : null

  return (
    <div className="home__detail">
      {/* Close row */}
      <div className="home__detail-close-row">
        <button className="home__detail-close" onClick={onClose} aria-label="Close">
          <Close size={20} />
        </button>
      </div>

      {/* Order meta — Rx tag + issue tag (Rejected claims etc.) */}
      <div className="home__detail-meta">
        <div className="home__detail-meta-left">
          <p className="home__detail-id">{order.id}</p>
          <p className="home__detail-name">{order.patientName}</p>
        </div>
        <div className="home__detail-meta-tags">
          <span className={typeTagClass(order.type)}>{order.type}</span>
          {info && <span className="home__tag home__tag--issue">{info.tag}</span>}
        </div>
      </div>

      {/* Error notification banner — matches Carbon InlineNotification error style */}
      <div className="home__blocked-notification">
        <div className="home__blocked-notification-left">
          <ErrorFilled size={16} className="home__blocked-notification-icon" />
          <span className="home__blocked-notification-category">{order.issueType}</span>
          <span className="home__blocked-notification-msg">
            {info ? info.message(order.patientName) : 'Issue needs resolution'}
          </span>
        </div>
        <button className="home__blocked-notification-resolve" onClick={onOpenResolve}>
          Resolve
        </button>
      </div>

      {/* Progress indicator — blocked at Receive step */}
      <div className="home__progress-wrap">
        <ProgressIndicator currentIndex={0} spaceEqually>
          {PROGRESS_STEPS.map((step) => <ProgressStep key={step} label={step} />)}
        </ProgressIndicator>
      </div>

      {/* Body — Patient expanded + Prescriptions accordion (no Insurance section) */}
      <div className="home__detail-body">
        <section className="home__detail-section">
          <h3 className="home__detail-section-title">Patient</h3>
          <DetailRow label="DIN" value={order.din} />
          <DetailRow label="Date of birth" value={order.dob} />
          <DetailRow label="Gender" value={order.gender} />
          <DetailRow label="Phone" value={order.phone} />
          <DetailRow label="Delivery address" value={order.address} />
          <DetailRow label="Allergies" value={order.allergies} />
        </section>

        <section className="home__detail-section">
          <div className="home__detail-section-header">
            <h3 className="home__detail-section-title">Prescriptions</h3>
            <span className="home__detail-doctor">{order.doctor} · NPI {order.npi}</span>
          </div>
          {order.prescriptions.map((rx, i) => {
            const isOpen = openRxIndexes.has(i)
            return (
              <div key={rx.name} className="home__accordion-item">
                <button className="home__accordion" onClick={() => toggleRx(i)} aria-expanded={isOpen}>
                  <span>{rx.name}</span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isOpen && (
                  <div className="home__accordion-body">
                    <div className="home__accordion-row"><span className="home__accordion-label">Form</span><span className="home__accordion-value">{rx.form} · QTY {rx.qty}</span></div>
                    <div className="home__accordion-row"><span className="home__accordion-label">Directions</span><span className="home__accordion-value">{rx.directions}</span></div>
                    <div className="home__accordion-row"><span className="home__accordion-label">NDC</span><span className="home__accordion-value">{rx.ndc}</span></div>
                    <div className="home__accordion-row"><span className="home__accordion-label">DEA</span><span className="home__accordion-value">{rx.dea}</span></div>
                    <div className="home__accordion-row"><span className="home__accordion-label">Refills</span><span className="home__accordion-value">{rx.refills} remaining</span></div>
                  </div>
                )}
              </div>
            )
          })}
        </section>
      </div>
      {/* No footer buttons — action is the Resolve link in the notification */}
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
      <p className="home__empty-sub">You're all caught up. Orders will appear here automatically.</p>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'active' | 'blocked'>('active')
  const [blockedFilter, setBlockedFilter] = useState<IssueType | null>(null)
  const [section, setSection] = useState<SidebarSection>('new-order')
  const [acceptingOrders, setAcceptingOrders] = useState(true)
  const [allOrders, setAllOrders] = useState<Order[]>(INITIAL_ORDERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [flaggingOrderId, setFlaggingOrderId] = useState<string | null>(null)
  const [resolveModalOrderId, setResolveModalOrderId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Auto-assign driver after 8s for waiting orders without one
  const waitingNoDriverKey = allOrders.filter((o) => o.orderState === 'waiting-driver' && !o.driver).map((o) => o.id).join(',')
  useEffect(() => {
    if (!waitingNoDriverKey) return
    const timers = waitingNoDriverKey.split(',').map((id) =>
      window.setTimeout(() => setAllOrders((prev) => prev.map((o) => o.id === id ? { ...o, driver: MOCK_DRIVER } : o)), 8000)
    )
    return () => timers.forEach(clearTimeout)
  }, [waitingNoDriverKey])

  const ordersForSection = (s: SidebarSection): Order[] => {
    switch (s) {
      case 'new-order':      return allOrders.filter((o) => o.orderState === 'new')
      case 'being-prepared': return allOrders.filter((o) => o.orderState === 'preparing')
      case 'waiting-driver': return allOrders.filter((o) => o.orderState === 'waiting-driver')
      case 'in-transit':     return allOrders.filter((o) => o.orderState === 'in-transit')
      case 'delivered':      return allOrders.filter((o) => o.orderState === 'delivered')
    }
  }

  const countOf = (state: OrderState) => allOrders.filter((o) => o.orderState === state).length
  const blockedOrders = allOrders.filter((o) => o.orderState === 'blocked')
  const filteredBlockedOrders = blockedFilter ? blockedOrders.filter((o) => o.issueType === blockedFilter) : blockedOrders
  const displayOrders = activeTab === 'blocked' ? filteredBlockedOrders : ordersForSection(section)
  const selectedOrder = allOrders.find((o) => o.id === selectedId) ?? null
  const showDetail = !!selectedId && !!selectedOrder
  const flaggingOrder = flaggingOrderId ? allOrders.find((o) => o.id === flaggingOrderId) : null
  const resolveModalOrder = resolveModalOrderId ? allOrders.find((o) => o.id === resolveModalOrderId) : null

  const changeSection = (s: SidebarSection) => { setSection(s); setSelectedId(null); setShowSettings(false) }

  const updateOrder = (id: string, patch: Partial<Order>) =>
    setAllOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleAccept = () => {
    if (!selectedId) return
    updateOrder(selectedId, { orderState: 'preparing', checklistChecked: allOrders.find((o) => o.id === selectedId)!.prescriptions.map(() => false) })
    setSection('being-prepared')
  }

  // Opens the Flag Issues modal instead of blocking directly
  const handleFlagIssues = () => {
    if (!selectedId) return
    setFlaggingOrderId(selectedId)
  }

  const handleFlagSubmit = (reason: FlagReason, notes: string, hold: boolean) => {
    if (!flaggingOrderId) return
    updateOrder(flaggingOrderId, {
      orderState: 'blocked',
      issueType: FLAG_REASON_TO_ISSUE[reason],
      flagReason: reason,
      issueNotes: notes || undefined,
      isHeld: hold,
    })
    setSelectedId(null)
    setFlaggingOrderId(null)
    showToast('Order flagged and moved to Blocked.')
  }

  const handleFlagModalClose = () => setFlaggingOrderId(null)

  const handleOpenResolve = () => {
    if (!selectedId) return
    setResolveModalOrderId(selectedId)
  }

  const handleResolveIssue = (_note: string) => {
    if (!resolveModalOrderId) return
    updateOrder(resolveModalOrderId, { orderState: 'new', issueType: undefined, issueNotes: undefined, isHeld: false })
    setSelectedId(null)
    setResolveModalOrderId(null)
    setActiveTab('active')
    setSection('new-order')
    showToast('Order resolved.')
  }

  const handleCancelOrder = (_note: string) => {
    if (!resolveModalOrderId) return
    setAllOrders((prev) => prev.filter((o) => o.id !== resolveModalOrderId))
    setSelectedId(null)
    setResolveModalOrderId(null)
    showToast('Order cancelled.')
  }

  const handleReadyForPickup = () => {
    if (!selectedId) return
    updateOrder(selectedId, { orderState: 'waiting-driver', driver: undefined, requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    setSection('waiting-driver')
  }

  const handlePackageHandoff = () => {
    if (!selectedId) return
    updateOrder(selectedId, { orderState: 'in-transit' })
    setSection('in-transit')
  }

  const handleChecklistToggle = (rxIndex: number, checked: boolean) => {
    if (!selectedId) return
    const order = allOrders.find((o) => o.id === selectedId)
    if (!order) return
    const newChecked = [...order.checklistChecked]
    newChecked[rxIndex] = checked
    updateOrder(selectedId, { checklistChecked: newChecked })
  }

  return (
    <div className="home">
      <header className="home__header">
        <div className="home__header-left">
          <span className="home__pharmacy-name">Shoppers Drug Mart Pembina &amp; Point</span>
        </div>
        <div className="home__header-center">
          <div className="home__search">
            <Search size={16} className="home__search-icon" />
            <input className="home__search-input" placeholder="Search orders, patients, drug, or order ID..." />
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
        <aside className="home__sidebar">
          <div className="home__tabs">
            <button className={['home__tab', activeTab === 'active' ? 'home__tab--active' : ''].filter(Boolean).join(' ')} onClick={() => { setActiveTab('active'); setBlockedFilter(null); setSelectedId(null); setShowSettings(false) }}>Active</button>
            <button className={['home__tab', activeTab === 'blocked' ? 'home__tab--active' : ''].filter(Boolean).join(' ')} onClick={() => { setActiveTab('blocked'); setSelectedId(null); setShowSettings(false) }}>Blocked ({blockedOrders.length})</button>
          </div>

          {activeTab === 'blocked' && (
            <div className="home__blocked-filters">
              {BLOCKED_FILTERS.map((f) => {
                const cnt = blockedOrders.filter((o) => o.issueType === f).length
                return (
                  <button
                    key={f}
                    className={['home__blocked-filter', blockedFilter === f ? 'home__blocked-filter--active' : ''].filter(Boolean).join(' ')}
                    onClick={() => setBlockedFilter(blockedFilter === f ? null : f)}
                  >
                    {cnt > 0 ? `${f} (${cnt})` : f}
                  </button>
                )
              })}
            </div>
          )}

          <nav className="home__nav">
            {activeTab === 'active' ? (
              <>
                <NavItem label="New order" count={countOf('new')} active={section === 'new-order'} onClick={() => changeSection('new-order')} />
                <NavItem label="Being Prepared" count={countOf('preparing')} active={section === 'being-prepared'} onClick={() => changeSection('being-prepared')} />
                <NavItem label="Waiting for Driver" count={countOf('waiting-driver')} active={section === 'waiting-driver'} onClick={() => changeSection('waiting-driver')} />
                <NavItem label="In transit" count={countOf('in-transit')} active={section === 'in-transit'} onClick={() => changeSection('in-transit')} />
                <NavItem label="Delivered" count={countOf('delivered')} active={section === 'delivered'} onClick={() => changeSection('delivered')} />
                <div className="home__nav-divider" />
                <NavItem label="History" active={false} onClick={() => {}} />
                <NavItem label="Setting" active={showSettings} onClick={() => { setShowSettings(true); setSelectedId(null) }} />
              </>
            ) : null}
          </nav>

          <div className="home__sidebar-footer">
            <p className="home__toggle-label">Keep turn on to receive orders</p>
            <div className="home__toggle-row">
              <Toggle id="accepting-orders" labelA="" labelB="" toggled={acceptingOrders} onToggle={(v) => setAcceptingOrders(v)} hideLabel />
              <span className="home__toggle-text">Accepting Orders</span>
            </div>
          </div>
        </aside>

        <main className={`home__content${showSettings ? ' home__content--settings' : ''}`}>
          {showSettings ? (
            <SettingContent />
          ) : displayOrders.length === 0 ? (
            <EmptyState />
          ) : showDetail ? (
            <div className="home__split">
              <div className="home__list">
                <p className="home__list-title">
                  {activeTab === 'blocked' ? (blockedFilter ? `${blockedFilter} Issues` : 'Blocked Orders') : SECTION_TITLES[section]}
                </p>
                {displayOrders.map((o) => (
                  <OrderCard key={o.id} order={o} compact selected={o.id === selectedId} onClick={() => setSelectedId(o.id)} />
                ))}
              </div>
              {selectedOrder!.orderState === 'blocked' ? (
                <BlockedDetailPanel
                  key={selectedOrder!.id}
                  order={selectedOrder!}
                  onClose={() => setSelectedId(null)}
                  onOpenResolve={handleOpenResolve}
                />
              ) : (
                <DetailPanel
                  key={selectedOrder!.id}
                  order={selectedOrder!}
                  onClose={() => setSelectedId(null)}
                  onAccept={handleAccept}
                  onFlagIssues={handleFlagIssues}
                  onReadyForPickup={handleReadyForPickup}
                  onPackageHandoff={handlePackageHandoff}
                  onChecklistToggle={handleChecklistToggle}
                />
              )}
            </div>
          ) : (
            <>
              <p className="home__content-title">
                {activeTab === 'blocked' ? `Blocked${blockedFilter ? ` — ${blockedFilter}` : ''}` : SECTION_TITLES[section]}
              </p>
              <div className="home__grid">
                {displayOrders.map((o) => (
                  <OrderCard key={o.id} order={o} onClick={() => setSelectedId(o.id)} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Flag Issues Modal */}
      {flaggingOrder && (
        <FlagIssuesModal
          order={flaggingOrder}
          onClose={handleFlagModalClose}
          onSubmit={handleFlagSubmit}
        />
      )}

      {/* Resolve Modal */}
      {resolveModalOrder && (
        <ResolveModal
          order={resolveModalOrder}
          onClose={() => setResolveModalOrderId(null)}
          onResolve={handleResolveIssue}
          onCancel={handleCancelOrder}
        />
      )}

      {/* Success Toast */}
      {toastMessage && (
        <div className="home__toast" role="status" aria-live="polite">
          <CheckmarkFilled size={16} className="home__toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

function NavItem({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button className={['home__nav-item', active ? 'home__nav-item--active' : ''].filter(Boolean).join(' ')} onClick={onClick}>
      <span className="home__nav-label">{label}</span>
      {count !== undefined && <span className="home__nav-count">{count}</span>}
    </button>
  )
}
