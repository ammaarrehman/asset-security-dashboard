import { Check, CircleAlert, CircleCheck, CircleHelp, Laptop, Minus, Monitor, Network, Package, Server, Smartphone, TriangleAlert, X } from 'lucide-react'
import { Fragment, useId, useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { formatDate } from '../assets'
import type { Asset, DeviceType } from '../assets'
import { controls, controlState, recordedEvidence } from '../insights'
import type { AssetView, ControlState } from '../insights'
import { statusLabels } from '../security'
import type { Finding, SecurityStatus } from '../security'

export type { AssetView } from '../insights'
export const deviceIcons = { Laptop, Desktop: Monitor, Server, Mobile: Smartphone, Network, Other: Package }
export const statusIcons = { healthy: CircleCheck, attention: CircleAlert, unknown: CircleHelp }
const stateIcons = { ok: Check, gap: TriangleAlert, unknown: Minus }
export type StatusFilter = SecurityStatus | 'all'

export function DeviceIcon({ type }: { type: DeviceType }) {
  const Icon = deviceIcons[type]
  return <span className="device-icon"><Icon size={17} aria-hidden="true" /></span>
}

export function StatusBadge({ status }: { status: SecurityStatus }) {
  const Icon = statusIcons[status]
  return <span className={`status-badge ${status}`}><Icon size={14} aria-hidden="true" />{statusLabels[status]}</span>
}

/** A number that plays a short settle animation whenever its value changes. */
export function Num({ value }: { value: number }) {
  return <span className="num" key={value}>{value}</span>
}

export function StateGlyph({ state }: { state: ControlState }) {
  const Icon = stateIcons[state]
  return <span className={`state-glyph ${state}`}><Icon size={13} strokeWidth={2.4} aria-hidden="true" /></span>
}

/** The three recorded controls as aligned glyphs. Shape and text carry the state, not color alone. */
export function ControlStrip({ asset }: { asset: Asset }) {
  return <span className="control-strip">
    {controls.map(({ key, label, short }) => {
      const state = controlState(asset, key)
      return <span key={key} className="control-pip" title={`${label}: ${asset[key]}`}>
        <StateGlyph state={state} />
        <span className="control-pip-label" aria-hidden="true">{short}</span>
        <span className="sr-only">{label}: {asset[key]}. </span>
      </span>
    })}
  </span>
}

// The project's core motif: every record moves through these four stages. Each page header shows where it sits.
// It repeats the page's own heading, so it is hidden from assistive technology.
const traceStages = ['Assets', 'Recorded controls', 'Findings', 'Next actions'] as const
export function TraceMark({ current }: { current: readonly number[] }) {
  return <p className="trace-mark" aria-hidden="true">{traceStages.map((label, index) => <Fragment key={label}>
    <span className={current.includes(index) ? 'trace-step is-current' : 'trace-step'}><b>{String(index + 1).padStart(2, '0')}</b><span className="trace-label">{label}</span></span>
    {index < traceStages.length - 1 && <span className="trace-arrow">──▸</span>}
  </Fragment>)}</p>
}

export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <div className="empty-state">
    <span className="device-icon"><Package size={20} aria-hidden="true" /></span>
    <h3>{title}</h3><p>{children}</p>{action}
  </div>
}

export function AssetTable({ rows, onSelect }: { rows: AssetView[]; onSelect: (id: string) => void }) {
  return <div className="table-scroll" role="region" aria-label="Asset table" tabIndex={0}>
    <table role="table">
      <caption className="sr-only">Device records, recorded controls, and recorded security status</caption>
      <thead role="rowgroup"><tr role="row">
        <th role="columnheader" scope="col">Device</th>
        <th role="columnheader" scope="col" className="col-type">Type</th>
        <th role="columnheader" scope="col" className="col-owner">Owner</th>
        <th role="columnheader" scope="col" className="col-controls">
          <span className="sr-only">Recorded controls: endpoint protection, patch status, backup status</span>
          <span className="control-heads" aria-hidden="true">{controls.map(({ key, short }) => <span key={key}>{short}</span>)}</span>
        </th>
        <th role="columnheader" scope="col" className="col-status">Security status</th>
        <th role="columnheader" scope="col" className="col-reviewed">Last reviewed</th>
      </tr></thead>
      <tbody role="rowgroup">
        {rows.map(({ asset, status, findings }) => {
          const review = findings.find(({ category }) => category === 'review')
          return <tr role="row" key={asset.id}>
          <th role="rowheader" scope="row" className="col-device">
            <button type="button" className="device-link" onClick={() => onSelect(asset.id)}>
              <DeviceIcon type={asset.type} />
              <span className="min-w-0"><span className="device-name">{asset.name}</span>
                {asset.os && <span className="device-os">{asset.os}</span>}
              </span>
            </button>
            <span className="device-meta">{asset.type} · {asset.owner || 'Unassigned'}</span>
          </th>
          <td role="cell" className="col-type">{asset.type}</td>
          <td role="cell" className="col-owner">{asset.owner || 'Unassigned'}</td>
          <td role="cell" className="col-controls"><ControlStrip asset={asset} /></td>
          <td role="cell" className="col-status"><StatusBadge status={status} /></td>
          <td role="cell" className={review ? `col-reviewed ${review.kind}` : 'col-reviewed'} title={review?.title}>
            {review && (review.kind === 'gap' ? <TriangleAlert size={13} aria-hidden="true" /> : <CircleHelp size={13} aria-hidden="true" />)}
            <span className="reviewed-label" aria-hidden="true">Reviewed </span>{formatDate(asset.reviewed)}
            {review && <span className="sr-only"> ({review.title})</span>}
          </td>
        </tr>
        })}
      </tbody>
    </table>
  </div>
}

export function Modal({ title, description, children, onClose, wide = false, lead }: {
  title: string; description?: string; children: ReactNode; onClose: () => void; wide?: boolean; lead?: ReactNode
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const heading = useId()
  const help = useId()
  useLayoutEffect(() => {
    const node = dialog.current!
    node.showModal()
    node.querySelector<HTMLElement>('[data-initial-focus]')?.focus()
    return () => { node.close() }
  }, [])
  return <dialog ref={dialog} className={wide ? 'modal modal-wide' : 'modal'} aria-labelledby={heading}
    aria-describedby={description ? help : undefined}
    onCancel={(event) => { event.preventDefault(); onClose() }}>
    <div className="modal-header">
      {lead}
      <div className="modal-title"><h2 id={heading}>{title}</h2>{description && <p id={help}>{description}</p>}</div>
      <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}><X size={20} aria-hidden="true" /></button>
    </div>
    {children}
  </dialog>
}

export function Evidence({ asset, finding }: { asset: Asset; finding: Finding }) {
  return <ul className="evidence-list" aria-label="Recorded values">
    {recordedEvidence(asset, finding).map(({ field, value }) => <li key={field} className="evidence-chip">
      <span className="evidence-field">{field}</span><span className="evidence-value">{value}</span>
    </li>)}
  </ul>
}

export function FindingKind({ kind }: { kind: Finding['kind'] }) {
  const Icon = kind === 'gap' ? TriangleAlert : CircleHelp
  return <span className={`finding-kind ${kind}`}><Icon size={14} aria-hidden="true" />{kind === 'gap' ? 'Recorded gap' : 'Needs verification'}</span>
}

export function FindingCopy({ asset, finding }: { asset: Asset; finding: Finding }) {
  return <div className="finding-copy">
    <div className="finding-evidence"><span className="report-label">Recorded evidence</span>
      <Evidence asset={asset} finding={finding} /><p>{finding.explanation}</p></div>
    <div className="finding-action"><span className="report-label">Recommended remediation</span><p>{finding.action}</p></div>
  </div>
}
