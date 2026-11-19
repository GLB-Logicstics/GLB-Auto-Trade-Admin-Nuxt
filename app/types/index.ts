export interface Option {
  label: string
  value: string
}

export interface Admin {
  id: number
  name: string
  email: string
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
}

export interface FieldGroup {
  title: string
  fields: Field[]
}

export interface Column {
  key: string
  label: string
  type?: 'image' | 'money' | 'option'
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
  shipping: { total: number }
  latestRequests: RequestItem[]
}

export interface Setting {
  key: string
  value: unknown
  updated_at: string
}
