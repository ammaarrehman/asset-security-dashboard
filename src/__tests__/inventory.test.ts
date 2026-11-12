import { describe, expect, it } from 'vitest'
import { emptyAsset, maxAssets, validateAsset } from '../assets'
import { makeDemoAssets } from '../demo'
import { readInventory, saveInventory, storageKey, updateInventory } from '../inventory'

const today = '2026-11-10'
const draft = { ...emptyAsset, name: 'Volunteer Laptop' }

function memoryStorage() {
  const data = new Map<string, string>()
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value) } }
}

describe('asset operations', () => {
  it('adds, edits, and deletes a record without mutating the original inventory', () => {
    const initial = makeDemoAssets(today)
    const added = updateInventory(initial, { type: 'add', asset: draft }, today, () => 'new')
    const edited = updateInventory(added, { type: 'edit', id: 'new', asset: { ...draft, owner: 'Outreach' } }, today)
    expect(added[0]).toMatchObject({ id: 'new', owner: '', demo: false })
    expect(edited[0]).toMatchObject({ id: 'new', owner: 'Outreach', demo: false })
    expect(updateInventory(edited, { type: 'delete', id: 'new' }, today)).toEqual(initial)
    expect(initial).toHaveLength(18)
  })

  it('preserves demo provenance and rejects edits or deletions of missing records', () => {
    const initial = makeDemoAssets(today)
    const changed = updateInventory(initial, { type: 'edit', id: initial[0].id, asset: draft }, today)
    expect(changed[0]).toMatchObject({ name: draft.name, demo: true })
    expect(() => updateInventory(initial, { type: 'edit', id: 'missing', asset: draft }, today)).toThrow(/no longer/)
    expect(() => updateInventory(initial, { type: 'delete', id: 'missing' }, today)).toThrow(/no longer/)
  })

  it('checks generated identifiers against existing records and the whole import batch', () => {
    const initial = makeDemoAssets(today)
    const sequence = [initial[0].id, 'new-1', 'new-1', 'new-2']
    const imported = updateInventory(initial, { type: 'import', assets: [draft, draft] }, today, () => sequence.shift() ?? '')
    expect(imported.slice(0, 2).map(({ id }) => id)).toEqual(['new-1', 'new-2'])
    expect(() => updateInventory(initial, { type: 'add', asset: draft }, today, () => initial[0].id)).toThrow(/unique/)
  })

  it('rejects invalid data and capacity overflow without partially importing', () => {
    const initial = makeDemoAssets(today)
    expect(() => updateInventory(initial, { type: 'import', assets: [draft, emptyAsset] }, today, () => 'new')).toThrow(/device details/)
    expect(() => updateInventory(initial, { type: 'import', assets: Array(maxAssets).fill(draft) }, today))
      .toThrow(`The inventory can hold up to ${maxAssets.toLocaleString()} devices.`)
    expect(initial).toHaveLength(18)
    expect(updateInventory([], { type: 'reset' }, today)).toEqual(initial)
  })

  it('normalizes names and rejects impossible review dates and control characters', () => {
    expect(validateAsset({ ...draft, name: '  Outreach Laptop  ', reviewed: '2024-02-29' }, today).asset?.name).toBe('Outreach Laptop')
    expect(validateAsset({ ...draft, owner: 'Team\nName', reviewed: '2025-02-29' }, today).errors)
      .toMatchObject({ owner: expect.any(String), reviewed: expect.any(String) })
  })
})

describe('browser storage format', () => {
  it('seeds missing storage and round-trips records including an intentionally empty inventory', () => {
    const storage = memoryStorage()
    const initial = readInventory(storage, today)
    expect(initial.uninitialized).toBe(true)
    const changed = updateInventory(initial.assets, { type: 'add', asset: draft }, today, () => 'new')
    expect(saveInventory(storage, changed)).toBe(true)
    expect(readInventory(storage, today)).toEqual({ assets: changed })
    expect(saveInventory(storage, [])).toBe(true)
    expect(readInventory(storage, today)).toEqual({ assets: [] })
  })

  it('reports corrupt, unsupported, and duplicate records without modifying the stored value', () => {
    const storage = memoryStorage()
    const demo = makeDemoAssets(today)
    for (const raw of ['{bad json', '{"version":2,"assets":[]}', JSON.stringify({ version: 1, assets: [demo[0], demo[0]] })]) {
      storage.setItem(storageKey, raw)
      expect(readInventory(storage, today)).toEqual({ assets: demo, issue: 'invalid' })
      expect(storage.getItem(storageKey)).toBe(raw)
    }
  })

  it('catches both read and write failures', () => {
    const fail = () => { throw new Error('Browser storage blocked') }
    const storage = { getItem: fail, setItem: fail }
    expect(readInventory(storage, today).issue).toBe('unavailable')
    expect(saveInventory(storage, [])).toBe(false)
  })
})
