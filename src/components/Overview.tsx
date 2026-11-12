import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react'
import { deviceTypes } from '../assets'
import { categories, statusLabels } from '../security'
import type { Category } from '../security'
import { AssetTable, EmptyState } from './Shared'
import type { AssetView, StatusFilter } from './Shared'

export function Overview({ rows, onInventory, onFindings, onAdd, onSelect }: {
  rows: AssetView[]
  onInventory: (status?: StatusFilter) => void
  onFindings: (category?: Category) => void
  onAdd: () => void
  onSelect: (id: string) => void
}) {
  const metrics = [
    { key: 'all', label: 'Total assets', hint: 'Devices in inventory' },
    { key: 'healthy', label: statusLabels.healthy, hint: 'No recorded gaps' },
    { key: 'attention', label: statusLabels.attention, hint: 'Recorded gaps' },
    { key: 'unknown', label: statusLabels.unknown, hint: 'Needs verification' },
  ] as const
  const byType = deviceTypes.map((type) => ({
    type, count: rows.filter(({ asset }) => asset.type === type).length,
  })).sort((a, b) => b.count - a.count)
  const findings = rows.flatMap((row) => row.findings)
  const byCategory = categories.map((category) => ({
    ...category, count: findings.filter((finding) => finding.category === category.key).length,
  }))
  const maxFindings = Math.max(1, ...byCategory.map(({ count }) => count))

  return <>
    <div className="page-header overview-header">
      <div><span className="eyebrow">01 / Inventory at a glance</span><h1 tabIndex={-1}>Overview</h1><p>A clearer view of your devices. A practical place to start.</p></div>
      <button className="button primary" onClick={onAdd}><Plus size={18} aria-hidden="true" /> Add asset</button>
    </div>

    <div className="metrics-grid" role="group" aria-label="Asset status summary">
      {metrics.map(({ key, label, hint }) => <button key={key} type="button"
        className={`metric ${key}`} onClick={() => onInventory(key)}>
        <span className="metric-number">{key === 'all' ? rows.length : rows.filter(({ status }) => status === key).length}</span>
        <span className="metric-description"><span className="metric-label">{label}</span><span className="metric-hint">{hint}</span></span>
        <ArrowUpRight className="metric-arrow" size={16} aria-hidden="true" />
      </button>)}
    </div>

    <div className="charts-grid">
      <section className="chart-panel device-breakdown" aria-labelledby="device-chart">
        <div className="panel-heading"><div><span className="eyebrow">Composition</span><h2 id="device-chart">Devices by type</h2><p>Breakdown of the inventory</p></div><span className="section-total">{rows.length} devices</span></div>
        {rows.length ? <ul className="chart-list">
          {byType.map(({ type, count }) => <li key={type} className="chart-row device-chart-row">
              <span className="chart-label">{type}</span>
              <span className="chart-track" aria-hidden="true"><span style={{ width: `${100 * count / rows.length}%` }} /></span>
              <span className="chart-value">{count}</span>
            </li>)}
        </ul> : <p className="chart-empty">Add a device to see the breakdown.</p>}
      </section>
      <section className="chart-panel inspection" aria-labelledby="finding-chart">
        <div className="panel-heading"><div><span className="eyebrow">Review priorities</span><h2 id="finding-chart">Findings by category</h2><p>{findings.length} {findings.length === 1 ? 'finding' : 'findings'} across {rows.filter((row) => row.findings.length).length} devices</p></div>
          <button className="inspection-link" onClick={() => onFindings()} aria-label="View all security findings"><ArrowUpRight size={22} aria-hidden="true" /></button></div>
        {findings.length ? <ul className="chart-list">
          {byCategory.map(({ key, label, count }) => <li key={key}>
            <button type="button" onClick={() => onFindings(key)} className="chart-row finding-chart-row">
              <span className="chart-label">{label}</span>
              <span className="chart-track" aria-hidden="true"><span style={{ width: `${100 * count / maxFindings}%` }} /></span>
              <span className="chart-value">{count}</span>
            </button>
          </li>)}
        </ul> : <p className="chart-empty">{rows.length ? 'No findings from the recorded information.' : 'Findings will appear after you add devices.'}</p>}
      </section>
    </div>

    <section className="table-panel" aria-labelledby="inventory-preview">
      <div className="panel-heading"><div><span className="eyebrow">Device records</span><h2 id="inventory-preview">Inventory preview</h2>
        <p>{rows.length ? `Showing ${Math.min(5, rows.length)} of ${rows.length} devices` : 'A snapshot of your device records'}</p></div>
        <button className="button secondary compact" onClick={() => onInventory()}>View inventory <ArrowRight size={15} aria-hidden="true" /></button>
      </div>
      {rows.length ? <AssetTable rows={rows.slice(0, 5)} onSelect={onSelect} /> :
        <EmptyState title="No devices yet">Add an asset or import a CSV from the inventory.</EmptyState>}
    </section>
  </>
}
