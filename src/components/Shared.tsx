import { CircleAlert, CircleCheck, CircleHelp, Laptop, Monitor, Network, Package, Server, Smartphone, X } from 'lucide-react'
import { useId, useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { formatDate } from '../assets'
import type { Asset, DeviceType } from '../assets'
import { statusLabels } from '../security'
import type { Finding, SecurityStatus } from '../security'

export type AssetView = { asset: Asset; findings: Finding[]; status: SecurityStatus }
export const deviceIcons = { Laptop, Desktop: Monitor, Server, Mobile: Smartphone, Network, Other: Package }
export const statusIcons = { healthy: CircleCheck, attention: CircleAlert, unknown: CircleHelp }
export type StatusFilter = SecurityStatus | 'all'

export function DeviceIcon({ type }: { type: DeviceType }) {
  const Icon = deviceIcons[type]
  return <span className="device-icon"><Icon size={17} aria-hidden="true" /></span>
}

export function StatusBadge({ status }: { status: SecurityStatus }) {
  const Icon = statusIcons[status]
  return <span className={`status-badge ${status}`}><Icon size={13} aria-hidden="true" />{statusLabels[status]}</span>
}

export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <div className="empty-state">
    <span className="device-icon"><Package size={20} aria-hidden="true" /></span>
    <h3>{title}</h3><p>{children}</p>{action}
  </div>
}

export function AssetTable({ rows, onSelect }: { rows: AssetView[]; onSelect: (id: string) => void }) {
  return <div className="table-scroll" role="region" aria-label="Asset table" tabIndex={0}>
    <table>
      <caption className="sr-only">Device records and recorded security status</caption>
      <thead><tr>
        <th scope="col">Device</th><th scope="col" className="table-metadata">Type</th>
        <th scope="col" className="table-metadata table-owner">Owner</th>
        <th scope="col">Security status</th><th scope="col" className="table-metadata">Last reviewed</th>
      </tr></thead>
      <tbody>
        {rows.map(({ asset, status }) => <tr key={asset.id}>
          <th scope="row">
            <button type="button" className="device-link" onClick={() => onSelect(asset.id)}>
              <DeviceIcon type={asset.type} />
              <span className="min-w-0"><span className="device-name">{asset.name}</span>
                {asset.os && <span className="device-os">{asset.os}</span>}
              </span>
            </button>
          </th>
          <td className="table-metadata whitespace-nowrap">{asset.type}</td>
          <td className="table-metadata table-owner">{asset.owner || 'Unassigned'}</td>
          <td><StatusBadge status={status} /></td>
          <td className="table-metadata whitespace-nowrap">{formatDate(asset.reviewed)}</td>
        </tr>)}
      </tbody>
    </table>
  </div>
}

export function Modal({ title, description, children, onClose, wide = false }: {
  title: string; description?: string; children: ReactNode; onClose: () => void; wide?: boolean
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
      <div><h2 id={heading}>{title}</h2>{description && <p id={help}>{description}</p>}</div>
      <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}><X size={20} aria-hidden="true" /></button>
    </div>
    {children}
  </dialog>
}

export function FindingCopy({ finding, heading: Heading = 'h3' }: { finding: Finding; heading?: 'h3' | 'h4' }) {
  return <div className="finding-copy">
    <Heading>{finding.title}</Heading>
    <div className="finding-evidence"><span className="report-label">Recorded evidence</span><p>{finding.explanation}</p></div>
    <div className="finding-action"><span className="report-label">Recommended action</span><p>{finding.action}</p></div>
  </div>
}
