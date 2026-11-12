import { useEffect, useState } from 'react'
import { dateKey } from './assets'
import { browserStorage, readInventory, saveInventory, storageKey, updateInventory } from './inventory'
import type { InventoryAction } from './inventory'

export function useInventory() {
  const [inventory, setInventory] = useState(() => readInventory(browserStorage(), dateKey()))

  useEffect(() => {
    const storage = browserStorage()
    const initial = readInventory(storage, dateKey())
    if (initial.uninitialized && !saveInventory(storage, initial.assets)) {
      setInventory({ assets: initial.assets, issue: 'unavailable' })
    }

    function sync(event: StorageEvent) {
      if (!storage || event.storageArea !== storage || (event.key !== storageKey && event.key !== null)) return
      const latest = readInventory(storage, dateKey())
      setInventory((current) => current.issue ? current : { ...latest, assets: latest.issue ? current.assets : latest.assets })
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  function commit(action: InventoryAction) {
    const storage = browserStorage()
    const today = dateKey()
    const latest = inventory.issue ? inventory : readInventory(storage, today)
    const previous = latest.issue ? inventory.assets : latest.assets
    const assets = updateInventory(previous, action, today)
    const issue = action.type === 'reset' || !latest.issue
      ? saveInventory(storage, assets) ? undefined : 'unavailable'
      : latest.issue
    setInventory({ assets, issue })
  }

  return { inventory, commit }
}
