export const deviceTypes = ['Laptop', 'Desktop', 'Server', 'Mobile', 'Network', 'Other'] as const
export const endpointOptions = ['Enabled', 'Missing', 'Unknown'] as const
export const patchOptions = ['Up to date', 'Overdue', 'Unknown'] as const
export const backupOptions = ['Enabled', 'Disabled', 'Unknown'] as const

export const fieldLimits = { name: 100, os: 100, owner: 100, notes: 600 }
export const maxAssets = 1000

export type DeviceType = (typeof deviceTypes)[number]
export type AssetInput = {
  name: string
  type: DeviceType
  os: string
  owner: string
  endpoint: (typeof endpointOptions)[number]
  patch: (typeof patchOptions)[number]
  backup: (typeof backupOptions)[number]
  reviewed: string
  notes: string
}
export type Asset = AssetInput & { id: string; demo: boolean }
export type AssetErrors = Partial<Record<keyof AssetInput, string>>

export const emptyAsset: AssetInput = {
  name: '',
  type: 'Laptop',
  os: '',
  owner: '',
  endpoint: 'Unknown',
  patch: 'Unknown',
  backup: 'Unknown',
  reviewed: '',
  notes: '',
}

export function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function dateDaysAgo(date: string, days: number) {
  const shifted = new Date(date + 'T00:00:00Z')
  shifted.setUTCDate(shifted.getUTCDate() - days)
  return dateKey(shifted)
}

export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false
  const date = new Date(value + 'T00:00:00Z')
  return Number.isFinite(date.valueOf()) && dateKey(date) === value
}

export function formatDate(value: string) {
  if (!value) return 'Not recorded'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(value + 'T00:00:00Z'))
}

export function validateAsset(values: Partial<Record<keyof AssetInput, unknown>>, today = dateKey()) {
  const errors: AssetErrors = {}
  function readText(field: keyof typeof fieldLimits) {
    const raw = values[field]
    if (typeof raw !== 'string') {
      errors[field] = 'Enter text.'
      return ''
    }
    const value = raw.trim()
    const forbidden = field === 'notes' ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u : /[\u0000-\u001f\u007f]/u
    if (forbidden.test(raw)) errors[field] = 'Remove unsupported control characters.'
    else if (value.length > fieldLimits[field]) errors[field] = `Use at most ${fieldLimits[field]} characters.`
    else if (field === 'name' && !value) errors[field] = 'Enter a device name.'
    return value
  }

  function readOption<T extends string>(field: keyof AssetInput, options: readonly T[], fallback: T): T {
    const selected = options.find((option) => option === values[field])
    if (selected) return selected
    errors[field] = `Choose ${options.join(', ')}.`
    return fallback
  }

  const reviewed = typeof values.reviewed === 'string' ? values.reviewed.trim() : ''
  if (typeof values.reviewed !== 'string' || (reviewed && !validDate(reviewed))) {
    errors.reviewed = 'Enter a valid date in YYYY-MM-DD format.'
  } else if (reviewed > today) {
    errors.reviewed = 'Use today’s date or an earlier date.'
  }

  const asset: AssetInput = {
    name: readText('name'),
    type: readOption('type', deviceTypes, 'Laptop'),
    os: readText('os'),
    owner: readText('owner'),
    endpoint: readOption('endpoint', endpointOptions, 'Unknown'),
    patch: readOption('patch', patchOptions, 'Unknown'),
    backup: readOption('backup', backupOptions, 'Unknown'),
    reviewed,
    notes: readText('notes'),
  }

  return Object.keys(errors).length ? { errors } : { asset }
}
