import { Download, FileUp, Pencil, ShieldCheck, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { backupOptions, deviceTypes, emptyAsset, endpointOptions, fieldLimits, formatDate, maxAssets, patchOptions, validateAsset } from '../assets'
import type { AssetErrors, AssetInput } from '../assets'
import { importCsv, maxCsvBytes } from '../csv'
import { DeviceIcon, FindingCopy, Modal, StatusBadge } from './Shared'
import type { AssetView } from './Shared'

const selectFields = [
  { key: 'type', label: 'Device type', options: deviceTypes },
  { key: 'endpoint', label: 'Endpoint protection', options: endpointOptions },
  { key: 'patch', label: 'Patch status', options: patchOptions },
  { key: 'backup', label: 'Backup status', options: backupOptions },
] as const

export function AssetEditor({ row, today, onClose, onSave }: {
  row?: AssetView
  today: string
  onClose: () => void
  onSave: (value: AssetInput) => string | undefined
}) {
  const [draft, setDraft] = useState<AssetInput>(row?.asset ?? emptyAsset)
  const [errors, setErrors] = useState<AssetErrors>({})
  const [saveError, setSaveError] = useState('')

  function change(field: keyof AssetInput, value: string) {
    setDraft({ ...draft, [field]: value })
    if (errors[field]) setErrors({ ...errors, [field]: undefined })
    setSaveError('')
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const dateInput = form.elements.namedItem('reviewed')
    const reviewed = dateInput instanceof HTMLInputElement && dateInput.validity.badInput ? undefined : draft.reviewed
    const result = validateAsset({ ...draft, reviewed }, today)
    if (!result.asset) {
      const first = Array.from(form.elements).find((control) =>
        control instanceof HTMLElement && result.errors[control.getAttribute('name') as keyof AssetInput])
      setErrors(result.errors)
      if (first instanceof HTMLElement) requestAnimationFrame(() => first.focus())
      return
    }
    setSaveError(onSave(result.asset) ?? '')
  }

  function attributes(field: keyof AssetInput) {
    return { id: `asset-${field}`, name: field, 'aria-invalid': !!errors[field],
      'aria-describedby': errors[field] ? `asset-${field}-error` : undefined }
  }

  function errorFor(field: keyof AssetInput) {
    return errors[field] && <span id={`asset-${field}-error`} className="field-error">{errors[field]}</span>
  }

  function textField(field: 'name' | 'os' | 'owner', label: string, placeholder: string) {
    return <div className={field === 'name' || field === 'owner' ? 'field mobile-full-width' : 'field'}>
      <label htmlFor={`asset-${field}`}>{label}</label>
      <input {...attributes(field)} value={draft[field]} required={field === 'name'}
        data-initial-focus={field === 'name' ? '' : undefined} maxLength={fieldLimits[field]} placeholder={placeholder}
        onChange={(event) => change(field, event.target.value)} />
      {errorFor(field)}
    </div>
  }

  function selectField({ key, label, options }: typeof selectFields[number]) {
    return <div className="field" key={key}>
      <label htmlFor={`asset-${key}`}>{label}</label>
      <select {...attributes(key)} value={draft[key]} onChange={(event) => change(key, event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
      {errorFor(key)}
    </div>
  }

  return <Modal title={row ? 'Edit asset' : 'Add asset'} description="Record what you know about this device. Leave unverified controls as Unknown." onClose={onClose} wide>
    <form noValidate onSubmit={submit}>
      <div className="modal-body editor-body">
        <fieldset className="form-section"><legend>Device identity</legend><div className="form-grid">
          {textField('name', 'Device name (required)', 'e.g. Outreach Laptop 01')}
          {selectField(selectFields[0])}
          {textField('os', 'Operating system', 'e.g. Windows 11')}
          {textField('owner', 'Owner or team', 'e.g. Outreach')}
        </div></fieldset>
        <fieldset className="form-section"><legend>Recorded security controls</legend><div className="form-grid control-fields">
          {selectFields.slice(1).map(selectField)}
        </div></fieldset>
        <fieldset className="form-section"><legend>Review & context</legend><div className="form-grid">
          <div className="field"><label htmlFor="asset-reviewed">Last reviewed</label>
          <input {...attributes('reviewed')} type="date" min="0001-01-01" max={today}
            value={draft.reviewed} onChange={(event) => change('reviewed', event.target.value)} />
          {errorFor('reviewed')}
          </div>
          <div className="field full-width"><label htmlFor="asset-notes">Notes</label>
          <textarea {...attributes('notes')} value={draft.notes} rows={3} maxLength={fieldLimits.notes}
            onChange={(event) => change('notes', event.target.value)} />
          {errorFor('notes')}
          </div>
        </div></fieldset>
        {saveError && <p className="field-error full-width" role="alert">{saveError}</p>}
      </div>
      <div className="modal-footer">
        <button className="button secondary" type="button" onClick={onClose}>Cancel</button>
        <button className="button primary" type="submit">{row ? 'Save changes' : 'Save asset'}</button>
      </div>
    </form>
  </Modal>
}

export function AssetDetails({ row: { asset, findings, status }, focusAction, onClose, onEdit, onDelete }: {
  row: AssetView; focusAction?: 'edit' | 'delete'; onClose: () => void; onEdit: () => void; onDelete: () => void
}) {
  const details = [
    ['Device type', asset.type], ['Operating system', asset.os || 'Not recorded'],
    ['Owner or team', asset.owner || 'Unassigned'], ['Last reviewed', formatDate(asset.reviewed)],
  ]
  const controls = [
    ['Endpoint protection', asset.endpoint], ['Patch status', asset.patch], ['Backup status', asset.backup],
  ]
  return <Modal title={asset.name} description={asset.demo ? 'Fictional demo device' : 'Device record'} onClose={onClose} wide>
    <div className="modal-body detail-body" role="region" aria-label="Asset details" tabIndex={0}>
      <div className="detail-summary"><DeviceIcon type={asset.type} /><StatusBadge status={status} /></div>
      <dl className="detail-grid">{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <section><h3>Recorded security controls</h3>
        <dl className="detail-grid controls-grid">{controls.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </section>
      <section className="detail-inspection inspection"><h3>Findings and actions</h3>
        {findings.length ? <ul className="detail-findings">{findings.map((finding) => <li key={finding.category}>
          <FindingCopy finding={finding} heading="h4" />
        </li>)}</ul> : <p className="detail-clear"><ShieldCheck size={18} aria-hidden="true" /> No gaps flagged in the record. Verify controls independently.</p>}
      </section>
      {asset.notes && <section><h3>Notes</h3><p className="asset-notes">{asset.notes}</p></section>}
    </div>
    <div className="modal-footer detail-footer">
      <button className="button danger-text" data-initial-focus={focusAction === 'delete' ? '' : undefined}
        onClick={onDelete}><Trash2 size={17} aria-hidden="true" /> Delete asset</button>
      <button className="button primary" data-initial-focus={focusAction === 'edit' ? '' : undefined}
        onClick={onEdit}><Pencil size={16} aria-hidden="true" /> Edit asset</button>
    </div>
  </Modal>
}

export function CsvImport({ today, count, onClose, onImport }: {
  today: string; count: number; onClose: () => void; onImport: (assets: AssetInput[]) => string | undefined
}) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<AssetInput[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const version = useRef(0)
  const capacity = maxAssets - count

  async function read(file: File | undefined) {
    const attempt = ++version.current
    setPreview([])
    setErrors([])
    setLoading(false)
    if (!file) return
    if (file.size > maxCsvBytes) {
      setErrors(['Choose a CSV file no larger than 3 MiB.'])
      return
    }
    setLoading(true)
    try {
      const csv = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer())
      const result = importCsv(csv, today)
      if (attempt !== version.current) return
      setPreview(result.assets)
      setErrors(result.errors)
    } catch {
      if (attempt === version.current) setErrors(['The file could not be read. Save it as UTF-8 CSV and try again.'])
    } finally {
      if (attempt === version.current) setLoading(false)
    }
  }

  const tooMany = preview.length > capacity
  return <Modal title="Import CSV" description="Review the file before adding its devices to your current inventory." onClose={onClose}>
    <div className="modal-body import-body">
      <p>Use a UTF-8 CSV up to 3 MiB with the nine columns in the sample file. This inventory has room for {capacity.toLocaleString()} more {capacity === 1 ? 'device' : 'devices'}.</p>
      <a className="text-button" href={import.meta.env.BASE_URL + 'sample-assets.csv'} download><Download size={16} aria-hidden="true" /> Download sample CSV</a>
      <div className="field"><label htmlFor="csv-file">CSV file</label>
        <input id="csv-file" type="file" accept=".csv,text/csv" onChange={(event) => void read(event.target.files?.[0])} data-initial-focus />
      </div>
      {loading && <p role="status">Validating file…</p>}
      {!!errors.length && <div className="form-alert" role="alert"><strong>Import could not proceed</strong>
        <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
      </div>}
      {tooMany && <p className="form-alert" role="alert">This file contains more devices than the inventory can hold.</p>}
      {!!preview.length && !tooMany && <div className="import-preview" role="status">
        <strong>{preview.length} {preview.length === 1 ? 'device' : 'devices'} ready to import</strong>
        <p>{preview.slice(0, 4).map(({ name }) => name).join(', ')}{preview.length > 4 ? ` and ${preview.length - 4} more` : ''}</p>
      </div>}
    </div>
    <div className="modal-footer">
      <button className="button secondary" type="button" onClick={onClose}>Cancel</button>
      <button className="button primary" type="button" disabled={!preview.length || tooMany || loading}
        onClick={() => { const error = onImport(preview); if (error) setErrors([error]) }}>
        <FileUp size={17} aria-hidden="true" /> {preview.length ? `Import ${preview.length} ${preview.length === 1 ? 'device' : 'devices'}` : 'Import devices'}
      </button>
    </div>
  </Modal>
}

export function ConfirmDialog({ title, description, action, onClose, onConfirm }: {
  title: string; description: string; action: string; onClose: () => void; onConfirm: () => string | undefined
}) {
  const [error, setError] = useState('')
  return <Modal title={title} description={description} onClose={onClose}>
    {error && <div className="modal-body"><p className="field-error" role="alert">{error}</p></div>}
    <div className="modal-footer">
      <button className="button secondary" data-initial-focus type="button" onClick={onClose}>Cancel</button>
      <button className="button danger" type="button" onClick={() => setError(onConfirm() ?? '')}>{action}</button>
    </div>
  </Modal>
}
