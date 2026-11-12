import { describe, expect, it } from 'vitest'
import { dateDaysAgo, emptyAsset } from '../assets'
import { makeDemoAssets } from '../demo'
import { classifyStatus, getFindings, reviewWindowDays } from '../security'

const today = '2026-11-10'
const healthy = {
  ...emptyAsset, name: 'Clinic Demo Laptop', endpoint: 'Enabled', patch: 'Up to date', backup: 'Enabled',
  reviewed: today,
} as const

describe('security findings', () => {
  it('flags each recorded gap and gives an explanation and action', () => {
    const findings = getFindings({
      ...healthy, endpoint: 'Missing', patch: 'Overdue', backup: 'Disabled', reviewed: '2026-05-30',
    }, today)
    expect(findings.map(({ category }) => category)).toEqual(['endpoint', 'patch', 'backup', 'review'])
    for (const finding of findings) {
      expect(finding.kind).toBe('gap')
      expect(finding.explanation.length).toBeGreaterThan(10)
      expect(finding.action.length).toBeGreaterThan(10)
    }
  })

  it('groups unknown controls and calls out a missing review date separately', () => {
    const findings = getFindings(emptyAsset, today)
    expect(findings.map(({ category }) => category)).toEqual(['missing', 'review'])
    expect(findings[0].explanation).toContain('endpoint protection, patch status, backup status')
    expect(findings.every(({ kind }) => kind === 'unknown')).toBe(true)
  })

  it('flags reviews only when they are more than 90 UTC days old', () => {
    expect(getFindings({ ...healthy, reviewed: dateDaysAgo(today, reviewWindowDays) }, today)).toEqual([])
    expect(getFindings({ ...healthy, reviewed: dateDaysAgo(today, reviewWindowDays + 1) }, today)[0].title)
      .toBe('Device review overdue')
  })
})

describe('status classification', () => {
  it('calls complete passing records healthy', () => {
    expect(classifyStatus(getFindings(healthy, today))).toBe('healthy')
  })

  it('keeps missing controls or dates from passing', () => {
    expect(classifyStatus(getFindings({ ...healthy, patch: 'Unknown' }, today))).toBe('unknown')
    expect(classifyStatus(getFindings({ ...healthy, reviewed: '' }, today))).toBe('unknown')
  })

  it('treats a stored future review date as unknown without suppressing known gaps', () => {
    const asset = { ...healthy, reviewed: '2026-11-11' }
    const findings = getFindings(asset, today)
    expect(findings).toMatchObject([{ category: 'review', kind: 'unknown', title: 'Review date is in the future' }])
    expect(classifyStatus(findings)).toBe('unknown')
    expect(classifyStatus(getFindings({ ...asset, patch: 'Overdue' }, today))).toBe('attention')
  })

  it('prioritizes recorded gaps while retaining unknown findings', () => {
    const findings = getFindings({ ...healthy, endpoint: 'Missing', patch: 'Unknown' }, today)
    expect(findings.map(({ kind }) => kind)).toEqual(['gap', 'unknown'])
    expect(classifyStatus(findings)).toBe('attention')
  })

  it('seeds all statuses with 18 fictional assets and unique identifiers', () => {
    const assets = makeDemoAssets(today)
    const statuses = assets.map((asset) => classifyStatus(getFindings(asset, today)))
    expect(new Set(assets.map(({ id }) => id)).size).toBe(18)
    expect(assets.every(({ demo }) => demo)).toBe(true)
    expect(new Set(statuses)).toEqual(new Set(['healthy', 'attention', 'unknown']))
  })
})
