import { dateDaysAgo, dateKey } from './assets'
import type { AssetInput } from './assets'

export const categories = [
  { key: 'endpoint', label: 'Endpoint protection', color: 'red' },
  { key: 'patch', label: 'Patch management', color: 'amber' },
  { key: 'backup', label: 'Backup readiness', color: 'blue' },
  { key: 'missing', label: 'Missing information', color: 'purple' },
  { key: 'review', label: 'Review recency', color: 'teal' },
] as const

export const statusLabels = { healthy: 'Healthy', attention: 'Needs attention', unknown: 'Unknown' } as const
export type SecurityStatus = keyof typeof statusLabels
export type Category = (typeof categories)[number]['key']
export type Finding = {
  category: Category
  kind: 'gap' | 'unknown'
  title: string
  explanation: string
  action: string
}

export const reviewWindowDays = 90

export function getFindings(asset: AssetInput, today = dateKey()): Finding[] {
  const findings: Finding[] = []
  if (asset.endpoint === 'Missing') findings.push({
    category: 'endpoint', kind: 'gap', title: 'Endpoint protection missing',
    explanation: 'The asset record indicates that endpoint protection is missing.',
    action: 'Enable or install the organization’s approved endpoint protection and confirm it is running and up to date.',
  })
  if (asset.patch === 'Overdue') findings.push({
    category: 'patch', kind: 'gap', title: 'Patches overdue',
    explanation: 'The asset record indicates that security updates are overdue.',
    action: 'Check for available security updates, schedule installation, and verify that the device reports current.',
  })
  if (asset.backup === 'Disabled') findings.push({
    category: 'backup', kind: 'gap', title: 'Backups disabled',
    explanation: 'The asset record indicates that backups are disabled.',
    action: 'Enable an approved backup process, confirm it completes, and test a restore.',
  })

  const missing = [
    asset.endpoint === 'Unknown' && 'endpoint protection',
    asset.patch === 'Unknown' && 'patch status',
    asset.backup === 'Unknown' && 'backup status',
  ].filter(Boolean)
  if (missing.length) findings.push({
    category: 'missing', kind: 'unknown', title: 'Security information missing',
    explanation: `The following details are unknown: ${missing.join(', ')}.`,
    action: 'Verify the missing details with the device owner or administrator and update the record.',
  })

  if (!asset.reviewed) findings.push({
    category: 'review', kind: 'unknown', title: 'Review date missing',
    explanation: 'The record has no last-reviewed date.',
    action: 'Review the device with its owner, verify the recorded controls, and enter the review date.',
  })
  else if (asset.reviewed > today) findings.push({
    category: 'review', kind: 'unknown', title: 'Review date is in the future',
    explanation: 'The last recorded review is after today’s UTC date.',
    action: 'Verify the review date and correct the record.',
  })
  else if (asset.reviewed < dateDaysAgo(today, reviewWindowDays)) findings.push({
    category: 'review', kind: 'gap', title: 'Device review overdue',
    explanation: `The last recorded review was more than ${reviewWindowDays} days ago.`,
    action: 'Recheck the device’s controls and ownership, then record the new review date.',
  })

  return findings
}

export function classifyStatus(findings: Finding[]): SecurityStatus {
  if (findings.some((finding) => finding.kind === 'gap')) return 'attention'
  return findings.length ? 'unknown' : 'healthy'
}
