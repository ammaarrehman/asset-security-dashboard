import { maxAssets, validateAsset } from './assets'
import type { Asset, AssetInput } from './assets'
import { makeDemoAssets } from './demo'

export const storageKey = 'asset-security-dashboard.inventory.v1'
export type StorageIssue = 'unavailable' | 'invalid'
type StorageAccess = Pick<Storage, 'getItem' | 'setItem'>
export type Inventory = { assets: Asset[]; issue?: StorageIssue; uninitialized?: boolean }
export type InventoryAction =
  | { type: 'add'; asset: AssetInput }
  | { type: 'edit'; id: string; asset: AssetInput }
  | { type: 'delete'; id: string }
  | { type: 'import'; assets: AssetInput[] }
  | { type: 'reset' }

export function browserStorage() {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

export function readInventory(storage: StorageAccess | undefined, today: string): Inventory {
  let raw: string | null
  try {
    if (!storage) throw new Error('Storage unavailable')
    raw = storage.getItem(storageKey)
  } catch {
    return { assets: makeDemoAssets(today), issue: 'unavailable' }
  }
  if (raw === null) return { assets: makeDemoAssets(today), uninitialized: true }

  try {
    const saved = JSON.parse(raw)
    if (saved?.version !== 1 || !Array.isArray(saved.assets) || saved.assets.length > maxAssets) {
      throw new Error('Invalid inventory')
    }
    const ids = new Set<string>()
    const assets = saved.assets.map((record: Asset) => {
      if (typeof record?.id !== 'string' || !record.id || record.id.length > 100 ||
          ids.has(record.id) || typeof record.demo !== 'boolean') {
        throw new Error('Invalid asset identifier')
      }
      // A clock change must not make an otherwise valid saved inventory unreadable.
      const result = validateAsset(record, '9999-12-31')
      if (!result.asset) throw new Error('Invalid saved asset')
      ids.add(record.id)
      return { ...result.asset, id: record.id, demo: record.demo }
    })
    return { assets }
  } catch {
    return { assets: makeDemoAssets(today), issue: 'invalid' }
  }
}

export function saveInventory(storage: StorageAccess | undefined, assets: Asset[]) {
  try {
    if (!storage) return false
    storage.setItem(storageKey, JSON.stringify({ version: 1, assets }))
    return true
  } catch {
    return false
  }
}

function makeId() {
  // getRandomValues works in browsers even when the origin is not a secure context.
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function updateInventory(
  assets: Asset[], action: InventoryAction, today: string, generateId = makeId,
): Asset[] {
  switch (action.type) {
    case 'reset':
      return makeDemoAssets(today)
    case 'delete':
    case 'edit': {
      const existing = assets.find((asset) => asset.id === action.id)
      if (!existing) throw new Error('This device is no longer in the inventory.')
      if (action.type === 'delete') return assets.filter((asset) => asset.id !== action.id)
      const result = validateAsset(action.asset, today)
      if (!result.asset) throw new Error('Check the device details and try again.')
      return assets.map((asset) => asset.id === action.id ? { ...existing, ...result.asset } : asset)
    }
    case 'add':
    case 'import': {
      const incoming = action.type === 'add' ? [action.asset] : action.assets
      if (assets.length + incoming.length > maxAssets) {
        throw new Error(`The inventory can hold up to ${maxAssets.toLocaleString()} devices.`)
      }
      const usedIds = new Set(assets.map((asset) => asset.id))
      const additions = incoming.map((values) => {
        const result = validateAsset(values, today)
        if (!result.asset) throw new Error('Check the device details and try again.')
        for (let attempt = 0; attempt < 10; attempt++) {
          const id = generateId()
          if (id && id.length <= 100 && !usedIds.has(id)) {
            usedIds.add(id)
            return { ...result.asset, id, demo: false }
          }
        }
        throw new Error('A unique device identifier could not be created. Try again.')
      })
      return [...additions, ...assets]
    }
  }
}
