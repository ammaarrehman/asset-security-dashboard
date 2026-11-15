import { ArrowRight, CornerDownRight } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { buildRelationshipMap } from '../insights'
import type { AssetView } from '../insights'
import type { Category } from '../security'
import { deviceIcons, Num } from './Shared'

type Edge = { id: string; from: string; to: string; stage: 0 | 1 | 2; live: boolean; active: boolean }
type Geometry = { width: number; height: number; paths: Record<string, { d: string; x1: number; y1: number; x2: number; y2: number }> }

const stageStyle = (stage: number) => ({ '--stage': stage }) as CSSProperties
const maxDevices = 6

/**
 * Assets -> recorded fields -> findings -> next actions.
 * A diagram of the app's own rules and current records. It is not a network map or a scan.
 */
export function RelationshipMap({ rows, initial, onSelect, onFindings }: {
  rows: AssetView[]
  initial?: Category
  onSelect: (id: string) => void
  onFindings: (category: Category) => void
}) {
  const map = buildRelationshipMap(rows)
  const [picked, setPicked] = useState<Category | null>(null)
  const active = picked ?? initial ?? null
  const selected = map.categories.find(({ key }) => key === active)

  const edges: Edge[] = [
    ...map.typeLinks.map((link) => ({
      id: `t:${link.from}>${link.to}`, from: `type:${link.from}`, to: `record:${link.to}`, stage: 0 as const,
      live: true, active: !!active && !!link.byCategory[active],
    })),
    ...map.recordLinks.map((link) => ({
      id: `r:${link.from}>${link.to}`, from: `record:${link.from}`, to: `category:${link.to}`, stage: 1 as const,
      live: link.count > 0, active: link.to === active && link.count > 0,
    })),
    ...map.categories.map((category) => ({
      id: `a:${category.key}`, from: `category:${category.key}`, to: `action:${category.key}`, stage: 2 as const,
      live: category.count > 0, active: category.key === active,
    })),
  ]
  const activeNodes = new Set(edges.filter((edge) => edge.active).flatMap(({ from, to }) => [from, to]))
  if (active) activeNodes.add(`category:${active}`).add(`action:${active}`)
  const nodeClass = (id: string, extra = '') =>
    `flow-node ${extra} ${!active ? '' : activeNodes.has(id) ? 'is-on' : 'is-off'}`.replace(/\s+/g, ' ').trim()

  const container = useRef<HTMLDivElement>(null)
  const edgeList = useRef(edges)
  edgeList.current = edges
  const [geometry, setGeometry] = useState<Geometry | null>(null)
  const signature = edges.map(({ id }) => id).join('|') + '#' + map.types.map(({ key }) => key).join('|')

  useLayoutEffect(() => {
    const root = container.current
    if (!root) return
    function measure() {
      const svg = root!.querySelector('svg')
      if (!svg || getComputedStyle(svg).display === 'none') return
      const frame = root!.getBoundingClientRect()
      const boxes = new Map<string, DOMRect>()
      root!.querySelectorAll<HTMLElement>('[data-node]').forEach((node) => boxes.set(node.dataset.node!, node.getBoundingClientRect()))
      const ends = edgeList.current.filter(({ from, to }) => boxes.get(from)?.width && boxes.get(to)?.width)
      const centre = (id: string) => { const box = boxes.get(id)!; return box.top + box.height / 2 }
      // Spread the attachment points along each node edge so lines do not stack on one pixel.
      function port(node: string, side: 'from' | 'to', id: string) {
        const box = boxes.get(node)!
        const other = side === 'from' ? 'to' : 'from'
        const siblings = ends.filter((edge) => edge[side] === node).sort((a, b) => centre(a[other]) - centre(b[other]))
        const step = Math.min(7, (box.height - 14) / Math.max(siblings.length, 1))
        const offset = (siblings.findIndex((edge) => edge.id === id) - (siblings.length - 1) / 2) * step
        return { x: (side === 'from' ? box.right : box.left) - frame.left, y: box.top + box.height / 2 + offset - frame.top }
      }
      const paths: Geometry['paths'] = {}
      for (const { id, from, to } of ends) {
        const a = port(from, 'from', id)
        const b = port(to, 'to', id)
        const bend = (b.x - a.x) * 0.5
        const r = (value: number) => Math.round(value * 10) / 10
        paths[id] = { d: `M${r(a.x)} ${r(a.y)}C${r(a.x + bend)} ${r(a.y)} ${r(b.x - bend)} ${r(b.y)} ${r(b.x)} ${r(b.y)}`,
          x1: r(a.x), y1: r(a.y), x2: r(b.x), y2: r(b.y) }
      }
      const next = { width: Math.round(frame.width), height: Math.round(frame.height), paths }
      setGeometry((current) => JSON.stringify(current) === JSON.stringify(next) ? current : next)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    let cancelled = false
    document.fonts?.ready.then(() => { if (!cancelled) measure() })
    return () => { cancelled = true; observer.disconnect() }
  }, [signature])

  // Lines draw in once, the first time the diagram scrolls into view.
  const [revealed, setRevealed] = useState(() => typeof IntersectionObserver === 'undefined' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const root = container.current
    if (revealed || !root) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setRevealed(true)
    }, { threshold: 0.2 })
    observer.observe(root)
    return () => observer.disconnect()
  }, [revealed])

  const flaggedTotal = rows.filter(({ findings }) => findings.length).length
  const findingsTotal = map.categories.reduce((sum, { count }) => sum + count, 0)

  return <section className="flow bracketed" aria-labelledby="flow-title">
    <div className="panel-heading">
      <div><span className="eyebrow">Relationship diagram</span><h2 id="flow-title">How records become findings</h2>
        <p>Each line is one of the app’s rules applied to a recorded value. This diagram shows the data model. It is not a network map or a scan.</p></div>
    </div>

    <div className={active ? 'flow-map has-active' : 'flow-map'} ref={container} data-armed={revealed ? undefined : ''}>
      <svg className="flow-links" aria-hidden="true" focusable="false"
        width={geometry?.width ?? 0} height={geometry?.height ?? 0} viewBox={`0 0 ${geometry?.width ?? 0} ${geometry?.height ?? 0}`}>
        {/* Decorative canvas dots live in the hidden SVG, so text always sits on a solid background. */}
        <defs><pattern id="flow-dot-grid" width="22" height="22" patternUnits="userSpaceOnUse"><circle className="flow-dots" cx="11" cy="11" r="1" /></pattern></defs>
        {geometry && <rect x={-24} y={0} width={geometry.width + 48} height={geometry.height} fill="url(#flow-dot-grid)" />}
        {geometry && edges.filter(({ id }) => geometry.paths[id]).sort((a, b) => Number(a.active) - Number(b.active)).map((edge) => {
          const path = geometry.paths[edge.id]
          const state = edge.active ? 'is-active' : edge.live ? 'is-live' : 'is-rule'
          return <g key={edge.id} className={`flow-edge ${state}`} style={stageStyle(edge.stage)}>
            <path className="flow-line" d={path.d} pathLength={1} />
            <circle className="flow-port" cx={path.x1} cy={path.y1} r={2.25} />
            <circle className="flow-port" cx={path.x2} cy={path.y2} r={2.25} />
          </g>
        })}
        {geometry && active && revealed && edges.filter((edge) => edge.active && geometry.paths[edge.id]).map((edge) =>
          <path key={`${active}:${edge.id}`} className="flow-pulse" d={geometry.paths[edge.id].d} pathLength={1} style={stageStyle(edge.stage)} />)}
      </svg>

      <div className="flow-stage" data-stage="assets">
        <h3 className="stage-label"><span className="stage-index">01</span>Assets<span className="stage-count">{rows.length} recorded</span></h3>
        {map.types.length ? <ul className="stage-nodes">
          {map.types.map(({ key, count, flagged }) => {
            const Icon = deviceIcons[key]
            return <li key={key} className={nodeClass(`type:${key}`)} data-node={`type:${key}`}>
              <Icon size={16} aria-hidden="true" />
              <span className="node-label">{key}</span>
              <span className="node-count" title={`${flagged} of ${count} with findings`}>{count}</span>
              <span className="sr-only">devices, {flagged} with findings</span>
            </li>
          })}
        </ul> : <p className="stage-empty">No devices recorded.</p>}
      </div>

      <div className="flow-stage" data-stage="records">
        <h3 className="stage-label"><span className="stage-index">02</span>Recorded controls<span className="stage-count">4 fields</span></h3>
        <ul className="stage-nodes">
          {map.records.map(({ key, label, field, ok, gap, unknown }) => <li key={key} className={nodeClass(`record:${key}`, 'record-node')} data-node={`record:${key}`}>
            <span className="node-label">{label}</span>
            <span className="node-field">{field}</span>
            {rows.length > 0 && <span className="mini-bar" aria-hidden="true">
              {ok > 0 && <span className="ok" style={{ flexGrow: ok }} />}
              {gap > 0 && <span className="gap" style={{ flexGrow: gap }} />}
              {unknown > 0 && <span className="unknown" style={{ flexGrow: unknown }} />}
            </span>}
            <span className="node-note">{ok} clear · {gap} gap · {unknown} unknown</span>
          </li>)}
        </ul>
      </div>

      <div className="flow-stage" data-stage="findings">
        <h3 className="stage-label"><span className="stage-index">03</span>Findings<span className="stage-count">{findingsTotal} on {flaggedTotal} {flaggedTotal === 1 ? 'device' : 'devices'}</span></h3>
        <ul className="stage-nodes">
          {map.categories.map(({ key, label, count, gaps, unknowns }) => <li key={key}>
            <button type="button" className={nodeClass(`category:${key}`, 'category-node')} data-node={`category:${key}`}
              aria-pressed={active === key} onClick={() => setPicked(key)}>
              <span className="node-label">{label}</span>
              <span className="node-count"><Num value={count} /></span>
              <span className="node-note">{count ? [gaps && `${gaps} recorded ${gaps === 1 ? 'gap' : 'gaps'}`, unknowns && `${unknowns} to verify`].filter(Boolean).join(' · ') : 'None recorded'}</span>
            </button>
          </li>)}
        </ul>
      </div>

      <div className="flow-stage" data-stage="actions">
        <h3 className="stage-label"><span className="stage-index">04</span>Next actions<span className="stage-count">per finding</span></h3>
        <ul className="stage-nodes">
          {map.categories.map(({ key, action }) => <li key={key} className={nodeClass(`action:${key}`, 'action-node')} data-node={`action:${key}`}>
            <CornerDownRight size={15} aria-hidden="true" /><span className="node-label">{action}</span>
          </li>)}
        </ul>
      </div>
    </div>

    {selected ? <div className="flow-trace" key={selected.key} role="group" aria-label={`Selected trace: ${selected.label}`}>
      <div className="trace-cell">
        <span className="report-label">Rule</span>
        <p className="trace-rule">{selected.rule}</p>
      </div>
      <div className="trace-cell">
        <span className="report-label">Affected devices · {selected.assets.length}</span>
        {selected.assets.length ? <ul className="trace-devices">
          {selected.assets.slice(0, maxDevices).map((asset) => <li key={asset.id}>
            <button type="button" className="chip-button" onClick={() => onSelect(asset.id)}>{asset.name}</button>
          </li>)}
          {selected.assets.length > maxDevices && <li className="trace-more">+{selected.assets.length - maxDevices} more</li>}
        </ul> : <p>No recorded values match this rule right now.</p>}
      </div>
      <div className="trace-cell">
        <span className="report-label">Recommended follow-up</span>
        {(selected.actions.length ? selected.actions : [selected.action + '.']).map((action) => <p key={action}>{action}</p>)}
      </div>
      {selected.count > 0 && <button type="button" className="button secondary compact trace-open" onClick={() => onFindings(selected.key)}>
        View {selected.count === 1 ? 'this finding' : `these ${selected.count} findings`} <ArrowRight size={15} aria-hidden="true" />
      </button>}
    </div> : <p className="flow-trace flow-clear">{rows.length ? 'No findings from the recorded information. Select a finding category to see its rule.' : 'Add a device to see how its recorded values lead to findings.'}</p>}
  </section>
}
