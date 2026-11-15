// Read-only views over existing records and findings. Nothing here adds a rule or a score:
// every value is counted from the recorded inventory and the findings in security.ts.
import { deviceTypes, formatDate } from './assets'
import type { Asset, DeviceType } from './assets'
import { categories, reviewWindowDays } from './security'
import type { Category, Finding, SecurityStatus } from './security'

export type AssetView = { asset: Asset; findings: Finding[]; status: SecurityStatus }

export const controls = [
  { key: 'endpoint', label: 'Endpoint protection', short: 'Endpoint', field: 'endpoint_protection', ok: 'Enabled', gap: 'Missing' },
  { key: 'patch', label: 'Patch status', short: 'Patch', field: 'patch_status', ok: 'Up to date', gap: 'Overdue' },
  { key: 'backup', label: 'Backup status', short: 'Backup', field: 'backup_status', ok: 'Enabled', gap: 'Disabled' },
] as const

export type ControlKey = (typeof controls)[number]['key']
export type RecordKey = ControlKey | 'reviewed'
export type ControlState = 'ok' | 'gap' | 'unknown'

export const recordFields: { key: RecordKey; label: string; field: string }[] = [
  ...controls.map(({ key, label, field }) => ({ key, label, field })),
  { key: 'reviewed', label: 'Last reviewed', field: 'last_reviewed' },
]

export const stateLabels: Record<ControlState, string> = { ok: 'Recorded as in place', gap: 'Recorded gap', unknown: 'Unknown' }

export function controlState(asset: Asset, key: ControlKey): ControlState {
  const control = controls.find((item) => item.key === key)!
  return asset[key] === control.ok ? 'ok' : asset[key] === control.gap ? 'gap' : 'unknown'
}

/** The recorded fields a finding was produced from. */
export function findingSources(asset: Asset, finding: Finding): RecordKey[] {
  if (finding.category === 'review') return ['reviewed']
  if (finding.category === 'missing') return controls.filter(({ key }) => asset[key] === 'Unknown').map(({ key }) => key)
  return [finding.category]
}

/** The recorded field and value behind a finding, using the CSV column names. */
export function recordedEvidence(asset: Asset, finding: Finding) {
  return findingSources(asset, finding).map((key) => ({
    field: recordFields.find((item) => item.key === key)!.field,
    value: key === 'reviewed' ? (asset.reviewed ? formatDate(asset.reviewed) : 'Not recorded') : asset[key],
  }))
}

const categoryRank = (category: Category) => categories.findIndex(({ key }) => key === category)

export type FollowUp = AssetView & { gaps: number; unknowns: number; lead: Finding }

export const followUpRules = [
  'Devices with more recorded gaps come first, so any recorded gap is listed before a device that only has unknown values.',
  'Then devices with more findings overall.',
  'Then the category order of the first finding: endpoint protection, patch management, backup readiness, missing information, review recency.',
  'Remaining ties are alphabetical by device name.',
]

/** A fixed, documented sort of devices that have findings. It is an ordering, not a risk score. */
export function rankFollowUps(rows: AssetView[]): FollowUp[] {
  return rows.filter(({ findings }) => findings.length).map((row) => {
    const gaps = row.findings.filter(({ kind }) => kind === 'gap').length
    return { ...row, gaps, unknowns: row.findings.length - gaps,
      lead: row.findings.find(({ kind }) => kind === 'gap') ?? row.findings[0] }
  }).sort((a, b) =>
    b.gaps - a.gaps ||
    b.findings.length - a.findings.length ||
    categoryRank(a.lead.category) - categoryRank(b.lead.category) ||
    a.asset.name.localeCompare(b.asset.name, 'en', { numeric: true, sensitivity: 'base' }))
}

const categoryRules: Record<Category, string> = {
  endpoint: 'Endpoint protection is recorded as Missing.',
  patch: 'Patch status is recorded as Overdue.',
  backup: 'Backup status is recorded as Disabled.',
  missing: 'Endpoint protection, patch status, or backup status is recorded as Unknown.',
  review: `The review date is missing, in the future, or more than ${reviewWindowDays} days old.`,
}

const categoryActions: Record<Category, string> = {
  endpoint: 'Enable approved protection',
  patch: 'Schedule security updates',
  backup: 'Enable backups, test a restore',
  missing: 'Verify and record unknowns',
  review: 'Review device, record the date',
}

/** Which recorded field can produce which finding category, mirroring the rules in security.ts. */
export const ruleLinks: [RecordKey, Category][] = [
  ['endpoint', 'endpoint'], ['endpoint', 'missing'], ['patch', 'patch'], ['patch', 'missing'],
  ['backup', 'backup'], ['backup', 'missing'], ['reviewed', 'review'],
]

type Link<From, To> = { from: From; to: To; count: number; byCategory: Partial<Record<Category, number>> }

export type RelationshipMap = {
  types: { key: DeviceType; count: number; flagged: number }[]
  records: { key: RecordKey; label: string; field: string; ok: number; gap: number; unknown: number }[]
  categories: {
    key: Category; label: string; rule: string; action: string
    count: number; gaps: number; unknowns: number; assets: Asset[]; actions: string[]
  }[]
  typeLinks: Link<DeviceType, RecordKey>[]
  recordLinks: Link<RecordKey, Category>[]
}

/** Assets -> recorded fields -> finding categories -> next actions, counted from current findings. */
export function buildRelationshipMap(rows: AssetView[]): RelationshipMap {
  const typeLinks = new Map<string, Link<DeviceType, RecordKey>>()
  // The seven rule paths always exist; their counts come from the current findings.
  const recordLinks = new Map<string, Link<RecordKey, Category>>(ruleLinks.map(([from, to]) =>
    [from + '>' + to, { from, to, count: 0, byCategory: {} }]))
  const records = recordFields.map((item) => ({ ...item, ok: 0, gap: 0, unknown: 0 }))
  const groups = categories.map(({ key, label }) => ({
    key, label, rule: categoryRules[key], action: categoryActions[key],
    count: 0, gaps: 0, unknowns: 0, assets: [] as Asset[], actions: [] as string[],
  }))

  function bump<From extends string, To extends string>(links: Map<string, Link<From, To>>, from: From, to: To, category: Category) {
    const id = from + '>' + to
    const link = links.get(id) ?? { from, to, count: 0, byCategory: {} }
    link.count += 1
    link.byCategory[category] = (link.byCategory[category] ?? 0) + 1
    links.set(id, link)
  }

  for (const { asset, findings } of rows) {
    for (const control of controls) records.find(({ key }) => key === control.key)![controlState(asset, control.key)] += 1
    const review = findings.find(({ category }) => category === 'review')
    records.find(({ key }) => key === 'reviewed')![review ? review.kind : 'ok'] += 1

    for (const finding of findings) {
      const group = groups.find(({ key }) => key === finding.category)!
      group.count += 1
      group[finding.kind === 'gap' ? 'gaps' : 'unknowns'] += 1
      group.assets.push(asset)
      if (!group.actions.includes(finding.action)) group.actions.push(finding.action)
      for (const source of findingSources(asset, finding)) {
        bump(typeLinks, asset.type, source, finding.category)
        bump(recordLinks, source, finding.category, finding.category)
      }
    }
  }

  return {
    types: deviceTypes.map((key) => {
      const ofType = rows.filter(({ asset }) => asset.type === key)
      return { key, count: ofType.length, flagged: ofType.filter(({ findings }) => findings.length).length }
    }).filter(({ count }) => count),
    records,
    categories: groups,
    typeLinks: [...typeLinks.values()],
    recordLinks: [...recordLinks.values()],
  }
}
