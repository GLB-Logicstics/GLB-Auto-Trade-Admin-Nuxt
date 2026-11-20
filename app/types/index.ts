export interface Option {
  label: string
  value: string
}

export interface Admin {
  id: number
  name: string
  email: string
  role: string
  permissions: string[]
}

export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'image'
  | 'images'
  | 'lines'
  | 'json'

export interface Field {
  key: string
  label: string
  type: FieldType
  options?: Option[]
  help?: string
  wide?: boolean
  translate?: boolean
  optionsFrom?: 'cities' | 'partTypes'
}

export interface FieldGroup {
  title: string
  fields: Field[]
}

export interface Column {
  key: string
  label: string
  type?: 'image' | 'money' | 'option' | 'owner'
  options?: Option[]
}

export interface CollectionConfig {
  name: string
  label: string
  single: string
  icon: string
  hasSlug: boolean
  columns: Column[]
  groups: FieldGroup[]
  empty: () => Record<string, unknown>
}

export interface CollectionItem {
  id: number
  slug: string | null
  title: string
  isActive: boolean
  sortOrder: number
  data: Record<string, unknown>
  createdAt: string
  updatedAt: string
  ownerEmail?: string
}

export interface RequestItem {
  id: number
  subject: string
  name: string
  phone: string
  email: string
  message: string
  status: string
  note: string
  created_at: string
  assigned_to: number | null
  assigned_name: string
  user_email: string
}

export interface ShippingRow {
  id: number
  auction: string
  location: string
  price: number
  updated_at: string
}

export interface Stats {
  counts: { name: string; label: string; total: number; active: number }[]
  requests: { total: number; new: number }
  users: { total: number; dealers: number; pending: number }
  shipping: { total: number }
  latestRequests: RequestItem[]
}

export interface Setting {
  key: string
  value: unknown
  updated_at: string
}

export interface SiteUser {
  id: number
  name: string
  email: string
  phone: string
  role: 'user' | 'dealer'
  company: string
  dealer_status: string
  is_blocked: boolean
  created_at: string
  requests: number
  cars: number
}

export interface StaffMember {
  id: number
  name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

export interface AuditEntry {
  id: number
  admin_id: number | null
  admin_name: string
  action: string
  entity: string
  entity_id: string
  summary: string
  created_at: string
}

export interface Language {
  code: string
  name: string
  is_active: boolean
  is_default: boolean
  sort_order: number
}

export interface MarketPrice {
  id: number
  country: string
  make: string
  model: string
  year: number
  price: number
  source: string
  updated_at: string
}
