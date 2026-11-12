import { ArrowUpRight, Info } from 'lucide-react'
import { useState } from 'react'
import { categories, reviewWindowDays } from '../security'
import type { Category } from '../security'
import { EmptyState, FindingCopy } from './Shared'
import type { AssetView } from './Shared'

export function FindingsPage({ rows, category, onCategory, onSelect }: {
  rows: AssetView[]
  category: Category | 'all'
  onCategory: (value: Category | 'all') => void
  onSelect: (id: string) => void
}) {
  const all = rows.flatMap(({ asset, findings }) => findings.map((finding) => ({ asset, finding })))
  const matches = all.filter(({ finding }) => category === 'all' || finding.category === category)
  const [visible, setVisible] = useState(20)
  return <>
    <div className="page-header"><div><span className="eyebrow">03 / Recorded gaps & unknowns</span><h1 tabIndex={-1}>Security findings</h1>
      <p>See what needs attention and what still needs to be verified.</p></div></div>
    <div className="notice">
      <Info size={18} aria-hidden="true" />
      <p>Findings use the recorded controls and a {reviewWindowDays}-day review window. “Healthy” means no gaps were flagged in the record. Devices require independent verification.</p>
    </div>
    <div className="inspection findings-panel">
      <div className="inventory-toolbar">
        <label className="category-control">Category
          <select value={category} onChange={(event) => {
            onCategory(event.target.value as Category | 'all')
            setVisible(20)
          }}>
            <option value="all">All categories</option>
            {categories.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        <p className="muted" role="status">{matches.length} {matches.length === 1 ? 'finding' : 'findings'}</p>
      </div>
      {matches.length ? <ul className="findings-list">
        {matches.slice(0, visible).map(({ asset, finding }) => <li key={asset.id + finding.category} className="finding-row">
            <div className="finding-context"><span className="report-label">{categories.find(({ key }) => key === finding.category)?.label}</span>
              <span className={`finding-kind ${finding.kind}`}>{finding.kind === 'gap' ? 'Recorded gap' : 'Needs verification'}</span>
              <span className="report-label affected-label">Affected device</span>
              <button className="text-button finding-asset" onClick={() => onSelect(asset.id)}>
              {asset.name}<ArrowUpRight size={15} aria-hidden="true" />
              </button>
            </div>
            <FindingCopy finding={finding} />
          </li>)}
      </ul> : <EmptyState title="No findings to show">
        {rows.length ? 'There are no findings for this category in the recorded inventory.' : 'Add a device to generate findings from its recorded details.'}
      </EmptyState>}
      {visible < matches.length && <div className="table-footer">
        <button className="button secondary" onClick={() => setVisible(visible + 20)}>Show more findings</button>
      </div>}
    </div>
  </>
}
