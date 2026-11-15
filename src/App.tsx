import { AlertTriangle, LayoutDashboard, ListChecks, RotateCcw, ShieldAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { dateKey } from './assets'
import { exportCsv } from './csv'
import type { InventoryAction } from './inventory'
import { classifyStatus, getFindings } from './security'
import type { Category } from './security'
import { useInventory } from './useInventory'
import { AssetDetails, AssetEditor, ConfirmDialog, CsvImport } from './components/Dialogs'
import { FindingsPage } from './components/FindingsPage'
import { InventoryPage } from './components/InventoryPage'
import { Overview } from './components/Overview'
import type { StatusFilter } from './components/Shared'

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: ListChecks },
  { id: 'findings', label: 'Security findings', icon: ShieldAlert },
] as const

type Page = (typeof navigation)[number]['id']
type Dialog = { kind: 'add' | 'reset' | 'import' }
  | { kind: 'detail'; id: string; focusAction?: 'edit' | 'delete' }
  | { kind: 'edit' | 'delete'; id: string }

export default function App() {
  const { inventory, commit } = useInventory()
  const [page, setPage] = useState<Page>('overview')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [message, setMessage] = useState('')
  const [today, setToday] = useState(() => dateKey())
  const main = useRef<HTMLElement>(null)
  const dialogTrigger = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const refresh = () => setToday(dateKey())
    const timer = window.setInterval(refresh, 60_000)
    window.addEventListener('focus', refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  const rows = inventory.assets.map((asset) => {
    const findings = getFindings(asset, today)
    return { asset, findings, status: classifyStatus(findings) }
  })
  const demoCount = inventory.assets.filter(({ demo }) => demo).length
  const selected = dialog && 'id' in dialog ? rows.find(({ asset }) => asset.id === dialog.id) : undefined
  const findingsCount = rows.reduce((count, row) => count + row.findings.length, 0)

  function focusHeading() {
    main.current?.querySelector('h1')?.focus()
  }

  function navigate(next: Page, nextStatus: StatusFilter = 'all', nextCategory: Category | 'all' = 'all') {
    setPage(next)
    setStatus(nextStatus)
    setCategory(nextCategory)
    setMessage('')
    requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      focusHeading()
    })
  }

  function openDialog(next: Dialog) {
    setMessage('')
    dialogTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setDialog(next)
  }

  function closeDialog(restore = true) {
    setDialog(null)
    requestAnimationFrame(() => {
      if (restore && dialogTrigger.current?.isConnected) dialogTrigger.current.focus()
      else focusHeading()
    })
  }

  function apply(action: InventoryAction, feedback: string) {
    try {
      commit(action)
      closeDialog(action.type !== 'delete')
      setMessage(feedback)
      return undefined
    } catch (error) {
      return error instanceof Error ? error.message : 'The inventory could not be updated.'
    }
  }

  function downloadInventory() {
    const csv = new Blob([exportCsv(inventory.assets)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(csv)
    const link = document.createElement('a')
    link.href = url
    link.download = `asset-inventory-${today}.csv`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage(`Exported ${inventory.assets.length} ${inventory.assets.length === 1 ? 'device' : 'devices'}.`)
  }

  const onSelect = (id: string) => openDialog({ kind: 'detail', id })
  const onAdd = () => openDialog({ kind: 'add' })

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="app-header">
      <div className="brand">
        <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <path className="mark-frame" d="M3 10V5a2 2 0 0 1 2-2h5M22 3h5a2 2 0 0 1 2 2v5M29 22v5a2 2 0 0 1-2 2h-5M10 29H5a2 2 0 0 1-2-2v-5" />
          <path className="mark-signal" d="M16 8.5v3.5M16 20v3.5M8.5 16H12M20 16h3.5" />
          <circle className="mark-core" cx="16" cy="16" r="3" />
        </svg>
        <div><p>Asset Security <span>Dashboard</span></p><span className="brand-caption">Device inventory & security hygiene</span></div>
      </div>
      <nav aria-label="Main navigation" className="navigation">
        {navigation.map(({ id, label, icon: Icon }) => <button key={id}
          type="button" className="nav-link" aria-current={page === id ? 'page' : undefined} onClick={() => navigate(id)}>
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
          {id === 'findings' && findingsCount > 0 && <span className="nav-count" aria-label={`${findingsCount} findings`}>{findingsCount}</span>}
        </button>)}
      </nav>
      <div className="system-panel">
        <dl className="system-readout">
          <div><dt>Dataset</dt><dd className={demoCount > 0 ? 'demo-label' : undefined}>
            {demoCount === 0 ? `${rows.length} ${rows.length === 1 ? 'device' : 'devices'}` : demoCount === rows.length ? 'Demo dataset' : `${demoCount} demo devices`}</dd></div>
          <div className="readout-extra"><dt>As of</dt><dd>{today} UTC</dd></div>
          <div className="readout-extra"><dt>Storage</dt><dd>This browser only</dd></div>
        </dl>
        <button type="button" className="text-button reset-button" onClick={() => openDialog({ kind: 'reset' })}>
          <RotateCcw size={15} aria-hidden="true" /> Reset demo
        </button>
        <span className="local-label">Browser-only prototype</span>
      </div>
    </header>
    <div className="workspace">
      <main className="main-content" id="main-content" ref={main} tabIndex={-1}>
        {inventory.issue && <div className="notice warning" role="alert"><AlertTriangle size={19} aria-hidden="true" />
          <p>{inventory.issue === 'invalid' ? 'Saved records could not be read. The existing storage is preserved until you confirm a demo reset.' :
            'Browser storage is unavailable or full.'} Changes are temporary. Export any records you want to keep before closing or reloading this page.</p>
        </div>}
        <div role="status" className={message ? 'notice success' : 'sr-only'}>{message}</div>
        <div className="page" key={page}>
        {page === 'overview' && <Overview rows={rows} onInventory={(filter) => navigate('inventory', filter)}
          onFindings={(filter) => navigate('findings', 'all', filter)} onSelect={onSelect} onAdd={onAdd} />}
        {page === 'inventory' && <InventoryPage rows={rows} status={status} onStatus={setStatus} onAdd={onAdd}
          onImport={() => openDialog({ kind: 'import' })} onExport={downloadInventory} onSelect={onSelect} />}
        {page === 'findings' && <FindingsPage rows={rows} category={category} onCategory={setCategory} onSelect={onSelect} />}
        </div>
        <footer className="app-footer">
          <p><span className="footer-label">Local records</span> Records stay in this browser. They aren’t automatically shared with other users or devices.</p>
          <span className="footer-credit">Educational prototype · Fictional demo data</span>
        </footer>
      </main>
    </div>

    {dialog?.kind === 'add' && <AssetEditor today={today} onClose={() => closeDialog()} onSave={(asset) => apply({ type: 'add', asset }, 'Asset added.')} />}
    {dialog?.kind === 'detail' && selected && <AssetDetails row={selected} focusAction={dialog.focusAction} onClose={() => closeDialog()}
      onEdit={() => setDialog({ kind: 'edit', id: selected.asset.id })}
      onDelete={() => setDialog({ kind: 'delete', id: selected.asset.id })} />}
    {dialog?.kind === 'edit' && selected && <AssetEditor row={selected} today={today}
      onClose={() => setDialog({ kind: 'detail', id: selected.asset.id, focusAction: 'edit' })}
      onSave={(asset) => apply({ type: 'edit', id: selected.asset.id, asset }, 'Asset updated.')} />}
    {dialog?.kind === 'delete' && selected && <ConfirmDialog title="Delete this asset?"
      description={`“${selected.asset.name}” will be removed from this browser’s inventory. This action is permanent.`}
      action="Delete asset" onClose={() => setDialog({ kind: 'detail', id: selected.asset.id, focusAction: 'delete' })}
      onConfirm={() => apply({ type: 'delete', id: selected.asset.id }, 'Asset deleted.')} />}
    {dialog && 'id' in dialog && !selected && <ConfirmDialog title="Device no longer available"
      description="The device was removed in another tab." action="Done" onClose={() => closeDialog(false)}
      onConfirm={() => { closeDialog(false); return undefined }} />}
    {dialog?.kind === 'reset' && <ConfirmDialog title="Reset demo data?"
      description="This will replace the entire inventory in this browser with the 18 fictional demo devices. Export your inventory first if you want to keep your records."
      action="Reset demo data" onClose={() => closeDialog()} onConfirm={() => apply({ type: 'reset' }, 'Demo inventory restored.')} />}
    {dialog?.kind === 'import' && <CsvImport today={today} count={rows.length} onClose={() => closeDialog()}
      onImport={(assets) => apply({ type: 'import', assets }, `Imported ${assets.length} ${assets.length === 1 ? 'device' : 'devices'}.`)} />}
  </div>
}
