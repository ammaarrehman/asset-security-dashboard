import { describe, expect, it } from 'vitest'
import { emptyAsset } from '../assets'
import type { Asset, AssetInput } from '../assets'
import { makeDemoAssets } from '../demo'
import { buildRelationshipMap, controlState, rankFollowUps, recordedEvidence } from '../insights'
import type { AssetView } from '../insights'
import { classifyStatus, getFindings } from '../security'

const today = '2026-11-11'

function view(assets: Asset[]): AssetView[] {
  return assets.map((asset) => {
    const findings = getFindings(asset, today)
    return { asset, findings, status: classifyStatus(findings) }
  })
}

function device(name: string, overrides: Partial<AssetInput> = {}): Asset {
  return { ...emptyAsset, endpoint: 'Enabled', patch: 'Up to date', backup: 'Enabled', reviewed: today,
    ...overrides, name, id: name, demo: false }
}

describe('priority follow-ups', () => {
  it('orders the demo inventory by the documented rules', () => {
    const order = rankFollowUps(view(makeDemoAssets(today))).map(({ asset }) => asset.name)
    expect(order).toEqual([
      'Archive Workstation', 'Intake Laptop 01', 'Guest Wi-Fi Gateway', 'Outreach Laptop 03',
      'Community Room Tablet', 'Shared File Server', 'Volunteer Tablet 02', 'Donation Portal Server',
      'Warehouse Laptop 01',
    ])
  })

  it('lists only devices with findings and never changes the findings themselves', () => {
    const rows = view(makeDemoAssets(today))
    const ranked = rankFollowUps(rows)
    expect(ranked).toHaveLength(rows.filter(({ findings }) => findings.length).length)
    expect(ranked.flatMap(({ findings }) => findings)).toHaveLength(rows.flatMap(({ findings }) => findings).length)
    for (const item of ranked) expect(item.gaps + item.unknowns).toBe(item.findings.length)
  })

  it('puts any recorded gap ahead of unknown-only devices and leads with the gap', () => {
    const ranked = rankFollowUps(view([
      device('Unknown twice', { endpoint: 'Unknown', reviewed: '' }),
      device('One gap', { backup: 'Disabled' }),
      device('Gap after unknown', { patch: 'Unknown', reviewed: '2026-01-01' }),
    ]))
    expect(ranked.map(({ asset }) => asset.name)).toEqual(['Gap after unknown', 'One gap', 'Unknown twice'])
    expect(ranked[0].lead.title).toBe('Device review overdue')
  })

  it('breaks ties by category order and then by name, independent of input order', () => {
    const assets = [
      device('Zeta', { patch: 'Overdue' }), device('Alpha', { patch: 'Overdue' }),
      device('Beta 10', { endpoint: 'Missing' }), device('Beta 2', { endpoint: 'Missing' }),
    ]
    const expected = ['Beta 2', 'Beta 10', 'Alpha', 'Zeta']
    expect(rankFollowUps(view(assets)).map(({ asset }) => asset.name)).toEqual(expected)
    expect(rankFollowUps(view([...assets].reverse())).map(({ asset }) => asset.name)).toEqual(expected)
  })
})

describe('relationship map', () => {
  const rows = view(makeDemoAssets(today))
  const map = buildRelationshipMap(rows)

  it('counts every asset and finding exactly once', () => {
    expect(map.types.reduce((sum, { count }) => sum + count, 0)).toBe(18)
    expect(map.categories.reduce((sum, { count }) => sum + count, 0)).toBe(rows.flatMap(({ findings }) => findings).length)
    expect(map.categories.map(({ key, count }) => [key, count])).toEqual([
      ['endpoint', 1], ['patch', 3], ['backup', 3], ['missing', 3], ['review', 3],
    ])
    for (const record of map.records) expect(record.ok + record.gap + record.unknown).toBe(18)
  })

  it('links recorded fields only to the categories the rules produce from them', () => {
    const targets = (from: string, live = false) => map.recordLinks
      .filter((link) => link.from === from && (!live || link.count)).map(({ to }) => to).sort()
    expect(map.recordLinks).toHaveLength(7)
    expect(targets('endpoint')).toEqual(['endpoint', 'missing'])
    expect(targets('patch')).toEqual(['missing', 'patch'])
    expect(targets('patch', true)).toEqual(['patch'])
    expect(targets('backup')).toEqual(['backup', 'missing'])
    expect(targets('reviewed')).toEqual(['review'])
    // 13 findings; one "missing information" finding draws on two unknown controls.
    expect(map.recordLinks.reduce((sum, { count }) => sum + count, 0)).toBe(14)
  })

  it('traces a device type to the recorded field behind its finding', () => {
    const link = map.typeLinks.find(({ from, to }) => from === 'Laptop' && to === 'patch')
    expect(link).toMatchObject({ count: 1, byCategory: { patch: 1 } })
    expect(map.categories.find(({ key }) => key === 'patch')?.assets.map(({ name }) => name))
      .toEqual(['Outreach Laptop 03', 'Guest Wi-Fi Gateway', 'Archive Workstation'])
  })

  it('omits empty device types and has no links without findings', () => {
    const empty = buildRelationshipMap(view([device('Only laptop')]))
    expect(empty.types).toEqual([{ key: 'Laptop', count: 1, flagged: 0 }])
    expect(empty.typeLinks).toEqual([])
    expect(empty.recordLinks.every(({ count }) => count === 0)).toBe(true)
  })
})

describe('recorded evidence', () => {
  it('reports the recorded field and value using the CSV column names', () => {
    const asset = device('Evidence', { patch: 'Overdue', endpoint: 'Unknown', backup: 'Unknown', reviewed: '' })
    const evidence = getFindings(asset, today).map((finding) => recordedEvidence(asset, finding))
    expect(evidence).toEqual([
      [{ field: 'patch_status', value: 'Overdue' }],
      [{ field: 'endpoint_protection', value: 'Unknown' }, { field: 'backup_status', value: 'Unknown' }],
      [{ field: 'last_reviewed', value: 'Not recorded' }],
    ])
    expect(controlState(asset, 'patch')).toBe('gap')
    expect(controlState(asset, 'endpoint')).toBe('unknown')
    expect(controlState(device('Fine'), 'backup')).toBe('ok')
  })
})
