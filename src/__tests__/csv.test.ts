import { describe, expect, it } from 'vitest'
import { emptyAsset, fieldLimits, maxAssets } from '../assets'
import { csvColumns, exportCsv, importCsv, maxCsvBytes } from '../csv'

const today = '2026-11-10'
const header = csvColumns.map(([, label]) => label).join(',')
const row = 'Community Laptop,Laptop,Windows 11,Outreach,Enabled,Up to date,Enabled,2026-10-15,'
const parse = (csv: string) => importCsv(csv, today)

describe('CSV validation', () => {
  it('reads UTF-8 BOMs, mixed line breaks, escaped quotes, and multiline notes', () => {
    const result = parse(`\ufeff${header}\r\n${row}"Check, then say ""ready"".\r\nSecond line."\n`)
    expect(result.errors).toEqual([])
    expect(result.assets[0]).toMatchObject({ name: 'Community Laptop', notes: 'Check, then say "ready".\r\nSecond line.' })
  })

  it('accepts reordered headers and records blank statuses as unknown', () => {
    const result = parse('notes,last_reviewed,backup_status,patch_status,endpoint_protection,owner,operating_system,device_type,device_name\n,,,,,,,Laptop,Sample')
    expect(result).toEqual({ errors: [], assets: [{ ...emptyAsset, name: 'Sample' }] })
  })

  it('requires a nonempty file, exact unique headers, and rows of the proper width', () => {
    expect(parse('  ').errors[0]).toMatch(/empty/)
    expect(parse(header).errors[0]).toMatch(/at least one/)
    expect(parse(header.replace('owner', 'notes') + '\n' + row).errors[0]).toMatch(/each exactly once/)
    expect(parse(header + '\nLaptop,Laptop').errors[0]).toMatch(/Line 2.*9 columns/)
    expect(parse(header + '\n' + row + ',extra').errors[0]).toMatch(/Line 2.*9 columns/)
  })

  it('rejects unclosed quotes, quote fragments, trailing data, and null bytes', () => {
    for (const invalid of ['"unfinished', 'plain"bad', '"note"suffix', 'bad\0byte']) {
      expect(parse(header + '\n' + row + invalid).assets).toEqual([])
      expect(parse(header + '\n' + row + invalid).errors).toHaveLength(1)
    }
  })

  it('rejects bad field values atomically and reports physical row numbers', () => {
    const invalid = ' ,Toaster,,Owner,Maybe,Late,Off,2026-02-30,' + 'x'.repeat(601)
    const result = parse(`${header}\n${row}"line 1\nline 2"\n${invalid}`)
    expect(result.assets).toEqual([])
    expect(result.errors[0]).toMatch(/^Line 4:/)
    for (const field of ['device_name', 'device_type', 'endpoint_protection', 'patch_status', 'backup_status', 'last_reviewed', 'notes']) {
      expect(result.errors[0]).toContain(field)
    }
    expect(parse(header + '\n' + row.replace('2026-10-15', '2026-11-11')).errors[0]).toContain('earlier date')
  })

  it('bounds bytes, rows, and error output', () => {
    expect(parse('x'.repeat(maxCsvBytes + 1)).errors[0]).toMatch(/3 MiB/)
    expect(parse('é'.repeat(maxCsvBytes / 2 + 1)).errors[0]).toMatch(/3 MiB/)
    expect(parse(header + '\n' + (row + '\n').repeat(maxAssets + 1)).errors[0])
      .toBe(`Import at most ${maxAssets.toLocaleString()} devices at a time.`)
    expect(parse(header + '\n' + 'bad\n'.repeat(12)).errors.at(-1)).toBe('4 more invalid rows.')
  })
})

describe('CSV export', () => {
  it('round-trips commas, quotes, and multiline text', () => {
    const asset = { ...emptyAsset, name: 'Food Pantry, West', owner: 'Operations', notes: 'A "quoted" note.\nAnother line.' }
    const csv = exportCsv([asset])
    expect(csv).toContain('"Food Pantry, West"')
    expect(csv).toContain('"A ""quoted"" note.\nAnother line."')
    expect(parse(csv)).toEqual({ assets: [asset], errors: [] })
  })

  it.each(['=1+1', '+1', '-1', '@SUM(A1)', '  =1+1', '\ttext', '\ntext', '＝1+1', '\ufeff+1'])(
    'neutralizes formula-like cells (%j)', (value) => {
      const csv = exportCsv([{ ...emptyAsset, name: value, owner: value, os: value, notes: value }])
      const escaped = '"' + "'" + value + '"'
      expect(csv.split(escaped)).toHaveLength(5)
    },
  )

  it('keeps a delimiter-and-quote payload inside one literal cell', () => {
    const asset = { ...emptyAsset, name: 'Demo', notes: '=1,"=2"' }
    const csv = exportCsv([asset])
    expect(csv).toContain(`"'=1,""=2"""`)
    expect(parse(csv)).toEqual({ assets: [asset], errors: [] })
  })

  it('round-trips formula-like text at field limits and preserves literal apostrophes', () => {
    const asset = {
      ...emptyAsset,
      name: '=' + 'x'.repeat(fieldLimits.name - 1),
      os: "'=legacy",
      owner: "'Outreach",
      notes: "''+" + 'x'.repeat(fieldLimits.notes - 3),
    }
    const csv = exportCsv([asset])
    expect(csv).toContain(`"''=legacy"`)
    expect(csv).toContain(`"'''+x`)
    expect(parse(csv)).toEqual({ assets: [asset], errors: [] })
  })
})
