import { dateKey, maxAssets, validateAsset } from './assets'
import type { AssetInput } from './assets'

export const maxCsvBytes = 3 * 1024 * 1024
export const csvColumns = [
  ['name', 'device_name'],
  ['type', 'device_type'],
  ['os', 'operating_system'],
  ['owner', 'owner'],
  ['endpoint', 'endpoint_protection'],
  ['patch', 'patch_status'],
  ['backup', 'backup_status'],
  ['reviewed', 'last_reviewed'],
  ['notes', 'notes'],
] as const satisfies readonly [keyof AssetInput, string][]

type Row = { cells: string[]; line: number }
const formulaLike = /^'*[\p{White_Space}\p{Cf}]*[=+\-@＝＋－＠\t\r\n]/u

function readRows(csv: string) {
  const rows: Row[] = []
  let cells: string[] = []
  let cell = ''
  let state: 'start' | 'text' | 'quoted' | 'closed' = 'start'
  let line = 1
  let rowLine = 1

  function finishCell() {
    cells.push(cell)
    if (cells.length > csvColumns.length) throw new Error(`Line ${rowLine}: expected ${csvColumns.length} columns.`)
    cell = ''
    state = 'start'
  }

  function finishRow() {
    finishCell()
    if (cells.length > 1 || cells[0].trim()) {
      rows.push({ cells, line: rowLine })
      if (rows.length > maxAssets + 1) throw new Error(`Import at most ${maxAssets.toLocaleString()} devices at a time.`)
    }
    cells = []
  }

  for (let index = csv.charCodeAt(0) === 0xfeff ? 1 : 0; index < csv.length; index++) {
    const char = csv[index]
    if (state === 'quoted') {
      if (char === '"') {
        if (csv[index + 1] === '"') {
          cell += '"'
          index++
        } else state = 'closed'
      } else {
        cell += char
        if (char === '\n' || (char === '\r' && csv[index + 1] !== '\n')) line++
      }
    } else if (char === ',') {
      finishCell()
    } else if (char === '\r' || char === '\n') {
      finishRow()
      if (char === '\r' && csv[index + 1] === '\n') index++
      rowLine = ++line
    } else if (char === '"' && state === 'start') {
      state = 'quoted'
    } else {
      if (char === '"' || state === 'closed') throw new Error(`Line ${line}: unexpected character near a quoted field.`)
      cell += char
      state = 'text'
    }
  }
  if (state === 'quoted') throw new Error(`Line ${rowLine}: a quoted field was not closed.`)
  if (state !== 'start' || cells.length) finishRow()
  return rows
}

export function importCsv(csv: string, today = dateKey()): { assets: AssetInput[]; errors: string[] } {
  try {
    if (csv.length > maxCsvBytes || new TextEncoder().encode(csv).byteLength > maxCsvBytes) {
      throw new Error('Choose a CSV file no larger than 3 MiB.')
    }
    if (csv.includes('\0')) throw new Error('The file contains a null character. Save it as UTF-8 CSV.')
    const [header, ...rows] = readRows(csv)
    if (!header) throw new Error('The CSV file is empty.')
    const columns = header.cells.map((value) => value.trim())
    if (columns.length !== csvColumns.length || csvColumns.some(([, label]) => !columns.includes(label))) {
      throw new Error('Use all nine column headers from the sample CSV, each exactly once.')
    }
    if (!rows.length) throw new Error('Include at least one device below the header.')

    const assets: AssetInput[] = []
    const errors: string[] = []
    let invalid = 0
    for (const row of rows) {
      if (row.cells.length !== columns.length) {
        invalid++
        if (errors.length < 8) errors.push(`Line ${row.line}: expected ${columns.length} columns.`)
        continue
      }
      const raw = Object.fromEntries(csvColumns.map(([key, label]) => [key, row.cells[columns.indexOf(label)]]))
      for (const field of ['name', 'os', 'owner', 'notes']) {
        if (raw[field].startsWith("'") && formulaLike.test(raw[field])) raw[field] = raw[field].slice(1)
      }
      for (const field of ['endpoint', 'patch', 'backup']) raw[field] = raw[field].trim() || 'Unknown'
      raw.type = raw.type.trim()
      const result = validateAsset(raw, today)
      if (result.asset) assets.push(result.asset)
      else {
        invalid++
        if (errors.length < 8) {
          const details = csvColumns.flatMap(([key, label]) => result.errors?.[key] ? [`${label}: ${result.errors[key]}`] : [])
          errors.push(`Line ${row.line}: ${details.join(' ')}`)
        }
      }
    }
    if (invalid > errors.length) errors.push(`${invalid - errors.length} more invalid rows.`)
    return { assets: errors.length ? [] : assets, errors }
  } catch (error) {
    return { assets: [], errors: [error instanceof Error ? error.message : 'The CSV could not be read.'] }
  }
}

function csvCell(value: string) {
  // Quoting keeps delimiters in the cell. A leading apostrophe makes formula-like text literal.
  // Escape literal leading apostrophes on formula-like text so import can reverse the prefix.
  const safe = formulaLike.test(value) ? "'" + value : value
  return '"' + safe.replaceAll('"', '""') + '"'
}

export function exportCsv(assets: AssetInput[]) {
  return [
    csvColumns.map(([, label]) => label).join(','),
    ...assets.map((asset) => csvColumns.map(([key]) => csvCell(asset[key])).join(',')),
  ].join('\r\n') + '\r\n'
}
