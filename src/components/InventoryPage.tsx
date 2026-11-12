import { Download, ListFilter, Plus, Search, Upload } from 'lucide-react'
import { useState } from 'react'
import { statusLabels } from '../security'
import { AssetTable, EmptyState } from './Shared'
import type { AssetView, StatusFilter } from './Shared'

export function InventoryPage({ rows, status, onStatus, onAdd, onImport, onExport, onSelect }: {
  rows: AssetView[]
  status: StatusFilter
  onStatus: (status: StatusFilter) => void
  onAdd: () => void
  onImport: () => void
  onExport: () => void
  onSelect: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const matches = rows.filter(({ asset, status: recordedStatus }) =>
    (status === 'all' || recordedStatus === status) &&
    [asset.name, asset.type, asset.os, asset.owner].some((value) => value.toLowerCase().includes(needle)))
  const [requestedPage, setPage] = useState(0)
  const perPage = 20
  const page = Math.min(requestedPage, Math.max(0, Math.ceil(matches.length / perPage) - 1))
  const first = page * perPage
  const end = Math.min(first + perPage, matches.length)

  function clearFilters() {
    setQuery('')
    onStatus('all')
    setPage(0)
  }

  return <>
    <div className="page-header">
      <div><span className="eyebrow">02 / Device records</span><h1 tabIndex={-1}>Inventory</h1><p>Manage devices, ownership, and recorded security controls.</p></div>
      <div className="button-group">
        <button className="button secondary" onClick={onImport}><Upload size={17} aria-hidden="true" /> Import CSV</button>
        <button className="button secondary" onClick={onExport} disabled={!rows.length}><Download size={17} aria-hidden="true" /> Export CSV</button>
        <button className="button primary" onClick={onAdd}><Plus size={18} aria-hidden="true" /> Add asset</button>
      </div>
    </div>
    <section className="table-panel inventory-surface" aria-label="Asset inventory">
      <div className="inventory-toolbar">
        <label className="input-icon search-control"><span className="sr-only">Search devices</span><Search size={18} aria-hidden="true" />
          <input type="search" placeholder="Search devices…" value={query} onChange={(event) => {
            setQuery(event.target.value)
            setPage(0)
          }} />
        </label>
        <label className="input-icon filter-control"><span className="sr-only">Security status filter</span><ListFilter size={17} aria-hidden="true" />
          <select value={status} onChange={(event) => {
            onStatus(event.target.value as StatusFilter)
            setPage(0)
          }}>
            <option value="all">All statuses</option>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>
      {matches.length ? <AssetTable rows={matches.slice(first, end)} onSelect={onSelect} /> :
        <EmptyState title={rows.length ? 'No matching devices' : 'No devices yet'}
          action={rows.length ? <button className="button secondary" onClick={clearFilters}>Clear filters</button> :
            <button className="button primary" onClick={onAdd}><Plus size={17} aria-hidden="true" /> Add asset</button>}>
          {rows.length ? 'Try a different search or security status.' : 'Add your first device or import an existing list from CSV.'}
        </EmptyState>}
      <div className="table-footer">
        <p role="status">{matches.length ? `Showing ${first + 1}–${end} of ${matches.length} devices` : '0 devices'}{matches.length !== rows.length ? ` (${rows.length} in inventory)` : ''}</p>
        {matches.length > perPage && <div className="button-group">
          <button className="button secondary compact" disabled={!page} onClick={() => setPage(page - 1)}>Previous</button>
          <button className="button secondary compact" disabled={end === matches.length} onClick={() => setPage(page + 1)}>Next</button>
        </div>}
      </div>
    </section>
  </>
}
