import { ArrowRight, ArrowUpRight, Plus, ShieldCheck } from 'lucide-react'
import type { CSSProperties } from 'react'
import { deviceTypes } from '../assets'
import { followUpRules, rankFollowUps } from '../insights'
import { categories, statusLabels } from '../security'
import type { Category, SecurityStatus } from '../security'
import { RelationshipMap } from './RelationshipMap'
import { deviceIcons, EmptyState, Num, statusIcons, TraceMark } from './Shared'
import type { AssetView, StatusFilter } from './Shared'

const statuses = [
  { key: 'healthy', hint: 'No recorded gaps' },
  { key: 'attention', hint: 'Recorded gaps' },
  { key: 'unknown', hint: 'Needs verification' },
] as const satisfies readonly { key: SecurityStatus; hint: string }[]
const shownFollowUps = 5
const order = (index: number) => ({ '--i': index }) as CSSProperties
const plural = (count: number, one: string, many = one + 's') => `${count} ${count === 1 ? one : many}`

export function Overview({ rows, onInventory, onFindings, onAdd, onSelect }: {
  rows: AssetView[]
  onInventory: (status?: StatusFilter) => void
  onFindings: (category?: Category) => void
  onAdd: () => void
  onSelect: (id: string) => void
}) {
  const total = rows.length
  const count = (status: SecurityStatus) => rows.filter((row) => row.status === status).length
  const findings = rows.flatMap((row) => row.findings)
  const followUps = rankFollowUps(rows)
  const byCategory = categories.map(({ key, label }) => {
    const matches = findings.filter((finding) => finding.category === key)
    const gaps = matches.filter(({ kind }) => kind === 'gap').length
    return { key, label, count: matches.length, gaps, unknowns: matches.length - gaps }
  })
  const maxFindings = Math.max(1, ...byCategory.map((item) => item.count))
  const byType = deviceTypes.map((type) => {
    const ofType = rows.filter(({ asset }) => asset.type === type)
    return { type, count: ofType.length, healthy: ofType.filter(({ status }) => status === 'healthy').length,
      attention: ofType.filter(({ status }) => status === 'attention').length,
      unknown: ofType.filter(({ status }) => status === 'unknown').length }
  }).sort((a, b) => b.count - a.count)
  const maxType = Math.max(1, ...byType.map((item) => item.count))
  const percent = (value: number, max: number) => `${100 * value / max}%`

  return <>
    <TraceMark current={[0, 1, 2, 3]} />
    <div className="page-header overview-header">
      <div><h1 tabIndex={-1}>Overview</h1>
        <p>What the device records say today, and where to follow up first.</p></div>
      <button className="button primary" onClick={onAdd}><Plus size={18} aria-hidden="true" /> Add asset</button>
    </div>

    <div className="posture bracketed" role="group" aria-label="Asset status summary">
      <button type="button" className="metric all" onClick={() => onInventory('all')}>
        <span className="metric-number"><Num value={total} /></span>
        <span className="metric-description"><span className="metric-label">Total assets</span>
          <span className="metric-hint">{plural(findings.length, 'finding')} on {plural(followUps.length, 'device')}</span></span>
        <ArrowUpRight className="metric-arrow" size={16} aria-hidden="true" />
      </button>
      {statuses.map(({ key, hint }) => {
        const Icon = statusIcons[key]
        return <button key={key} type="button" className={`metric ${key}`} onClick={() => onInventory(key)}>
          <span className="metric-number"><Num value={count(key)} /></span>
          <span className="metric-description"><span className="metric-label"><Icon size={15} aria-hidden="true" />{statusLabels[key]}</span>
            <span className="metric-hint">{hint}</span></span>
          <ArrowUpRight className="metric-arrow" size={16} aria-hidden="true" />
        </button>
      })}
      <div className="posture-bar" aria-hidden="true">
        {total ? statuses.map(({ key }) => <span key={key} className={key} style={{ flexGrow: count(key) }} />) : <span className="empty" />}
      </div>
    </div>

    <div className="overview-grid">
      <section className="followups" aria-labelledby="followups-title">
        <div className="panel-heading">
          <div><span className="eyebrow">Investigate next</span><h2 id="followups-title">Priority follow-ups</h2>
            <p>{followUps.length ? `Top ${Math.min(shownFollowUps, followUps.length)} of ${plural(followUps.length, 'device')} with recorded findings` : 'Devices with recorded findings appear here'}</p></div>
          {findings.length > 0 && <button className="button secondary compact" onClick={() => onFindings()}>All findings <ArrowRight size={15} aria-hidden="true" /></button>}
        </div>
        {followUps.length ? <ol className="followup-list">
          {followUps.slice(0, shownFollowUps).map(({ asset, findings: found, lead }, index) => <li key={asset.id} className="followup" style={order(index)}>
            <span className="followup-rank" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <div className="followup-main">
              <button type="button" className="followup-device" onClick={() => onSelect(asset.id)}>{asset.name}</button>
              <span className="followup-meta">{asset.type} · {asset.owner || 'Unassigned'}</span>
              <ul className="finding-tags" aria-label="Findings">
                {found.map((finding) => <li key={finding.category} className={`tag ${finding.kind}`}>{finding.title}</li>)}
              </ul>
            </div>
            <p className="followup-action"><span className="report-label">Start with</span>{lead.action}</p>
          </li>)}
        </ol> : rows.length ? <p className="followup-clear"><ShieldCheck size={18} aria-hidden="true" /> No findings from the recorded information. Verify controls independently.</p> :
          <EmptyState title="No devices yet">Add an asset or import a CSV from the inventory.</EmptyState>}
        {followUps.length > 0 && <details className="method">
          <summary>How this order is decided</summary>
          <ol>{followUpRules.map((rule) => <li key={rule}>{rule}</li>)}</ol>
          <p>This is a fixed sort of the recorded findings. It is not a risk score and uses no information beyond the records.</p>
        </details>}
      </section>

      <div className="overview-charts">
        <section className="chart-panel" aria-labelledby="finding-chart">
          <div className="panel-heading"><div><span className="eyebrow">Findings</span><h2 id="finding-chart">Findings by category</h2>
            <p>{plural(findings.length, 'finding')} across {plural(followUps.length, 'device')}</p></div>
            <ul className="legend" aria-label="Legend"><li><i className="swatch gap" />Recorded gap</li><li><i className="swatch unknown" />Needs verification</li></ul>
          </div>
          {findings.length ? <ul className="chart-list">
            {byCategory.map(({ key, label, count: value, gaps, unknowns }, index) => <li key={key}>
              <button type="button" onClick={() => onFindings(key)} className="chart-row finding-chart-row" style={order(index)}
                title={`${label}: ${plural(gaps, 'recorded gap')}, ${unknowns} to verify`}>
                <span className="chart-label">{label}</span>
                <span className="chart-track" aria-hidden="true"><span className="chart-fill">
                  {gaps > 0 && <span className="gap" style={{ width: percent(gaps, maxFindings) }} />}
                  {unknowns > 0 && <span className="unknown" style={{ width: percent(unknowns, maxFindings) }} />}
                </span></span>
                <span className="chart-value"><Num value={value} /></span>
                <span className="sr-only">{plural(value, 'finding')}: {plural(gaps, 'recorded gap')}, {unknowns} to verify</span>
              </button>
            </li>)}
          </ul> : <p className="chart-empty">{rows.length ? 'No findings from the recorded information.' : 'Findings will appear after you add devices.'}</p>}
        </section>

        <section className="chart-panel" aria-labelledby="device-chart">
          <div className="panel-heading"><div><span className="eyebrow">Composition</span><h2 id="device-chart">Devices by type</h2>
            <p>{plural(total, 'device')}, split by recorded status</p></div>
            <ul className="legend" aria-label="Legend">{statuses.map(({ key }) => <li key={key}><i className={`swatch ${key}`} />{statusLabels[key]}</li>)}</ul>
          </div>
          {total ? <ul className="chart-list">
            {byType.map(({ type, count: value, healthy, attention, unknown }, index) => {
              const Icon = deviceIcons[type]
              return <li key={type} className="chart-row device-chart-row" style={order(index)}
                title={`${type}: ${healthy} healthy, ${attention} need attention, ${unknown} unknown`}>
                <span className="chart-label"><Icon size={15} aria-hidden="true" />{type}</span>
                <span className="chart-track" aria-hidden="true"><span className="chart-fill">
                  {healthy > 0 && <span className="healthy" style={{ width: percent(healthy, maxType) }} />}
                  {attention > 0 && <span className="attention" style={{ width: percent(attention, maxType) }} />}
                  {unknown > 0 && <span className="unknown" style={{ width: percent(unknown, maxType) }} />}
                </span></span>
                <span className="chart-value">{value}</span>
                <span className="sr-only">{plural(value, 'device')}: {healthy} healthy, {attention} need attention, {unknown} unknown</span>
              </li>
            })}
          </ul> : <p className="chart-empty">Add a device to see the breakdown.</p>}
        </section>
      </div>
    </div>

    <RelationshipMap rows={rows} initial={followUps[0]?.lead.category} onSelect={onSelect} onFindings={onFindings} />
  </>
}
