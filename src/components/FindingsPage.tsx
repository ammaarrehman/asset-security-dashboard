import { ArrowUpRight, Info } from 'lucide-react'
import { useState } from 'react'
import type { CSSProperties } from 'react'
import { formatDate } from '../assets'
import { rankFollowUps } from '../insights'
import { categories, reviewWindowDays } from '../security'
import type { Category } from '../security'
import { DeviceIcon, EmptyState, FindingCopy, FindingKind, TraceMark } from './Shared'
import type { AssetView } from './Shared'

const pageSize = 20

export function FindingsPage({ rows, category, onCategory, onSelect }: {
  rows: AssetView[]
  category: Category | 'all'
  onCategory: (value: Category | 'all') => void
  onSelect: (id: string) => void
}) {
  // Same documented device order as the overview's priority follow-ups.
  const all = rankFollowUps(rows).flatMap(({ asset, findings }) => findings.map((finding) => ({ asset, finding })))
  const matches = all.filter(({ finding }) => category === 'all' || finding.category === category)
  const [visible, setVisible] = useState(pageSize)
  const filters = [{ key: 'all' as const, label: 'All findings', count: all.length },
    ...categories.map(({ key, label }) => ({ key, label, count: all.filter(({ finding }) => finding.category === key).length }))]
  const gaps = matches.filter(({ finding }) => finding.kind === 'gap').length

  return <>
    <TraceMark current={[2, 3]} />
    <div className="page-header"><div><h1 tabIndex={-1}>Security findings</h1>
      <p>See what needs attention and what still needs to be verified.</p></div></div>

    <div className="workstation">
      <aside className="workstation-rail" aria-label="Finding filters and method">
        <div className="filter-list" role="group" aria-label="Finding category">
          {filters.map(({ key, label, count }) => <button key={key} type="button" className="filter-item" aria-pressed={category === key}
            onClick={() => { onCategory(key); setVisible(pageSize) }}>
            <span>{label}</span><span className="filter-count">{count}</span>
          </button>)}
        </div>
        <div className="notice method-note">
          <Info size={17} aria-hidden="true" />
          <p>Findings use the recorded controls and a {reviewWindowDays}-day review window. “Healthy” means no gaps were flagged in the record. Devices require independent verification.</p>
        </div>
      </aside>

      <div className="findings-panel">
        <div className="findings-summary">
          <p role="status"><strong>{matches.length} {matches.length === 1 ? 'finding' : 'findings'}</strong></p>
          {matches.length > 0 && <p className="findings-split">{gaps} recorded {gaps === 1 ? 'gap' : 'gaps'} · {matches.length - gaps} to verify · ordered by follow-up priority</p>}
        </div>
        {matches.length ? <ol className="findings-list">
          {matches.slice(0, visible).map(({ asset, finding }, index) => <li key={asset.id + finding.category}
            className={`finding-row ${finding.kind}`} style={{ '--i': Math.min(index, 8) } as CSSProperties}>
            <div className="finding-head">
              <span className="finding-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div className="finding-title">
                <span className="report-label">{categories.find(({ key }) => key === finding.category)?.label}</span>
                <h2>{finding.title}</h2>
              </div>
              <FindingKind kind={finding.kind} />
            </div>
            <div className="finding-body">
              <div className="finding-asset-block">
                <span className="report-label">Affected asset</span>
                <button type="button" className="finding-asset" onClick={() => onSelect(asset.id)}>
                  <DeviceIcon type={asset.type} /><span>{asset.name}</span><ArrowUpRight size={15} aria-hidden="true" />
                </button>
                <p className="finding-asset-meta">{asset.type} · {asset.owner || 'Unassigned'}</p>
                <p className="finding-asset-meta">Reviewed {formatDate(asset.reviewed).toLowerCase() === 'not recorded' ? 'date not recorded' : formatDate(asset.reviewed)}</p>
              </div>
              <FindingCopy asset={asset} finding={finding} />
            </div>
          </li>)}
        </ol> : <EmptyState title="No findings to show">
          {rows.length ? 'There are no findings for this category in the recorded inventory.' : 'Add a device to generate findings from its recorded details.'}
        </EmptyState>}
        {visible < matches.length && <div className="table-footer">
          <button className="button secondary" onClick={() => setVisible(visible + pageSize)}>Show more findings</button>
        </div>}
      </div>
    </div>
  </>
}
