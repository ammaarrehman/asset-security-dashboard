// Builds Offline_Presentation_Package_v2.zip: everything needed to present with no internet, and nothing else.
// The package is generated, not committed: every file in it is already in the repository, so committing the ZIP
// would duplicate the deck and recording. Run before presentation day and copy the ZIP to a USB drive.
// Run from docs/presentation/source:  npm run package
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'

const here = path.dirname(fileURLToPath(import.meta.url))
const kit = path.join(here, '..')
const output = path.join(kit, 'Offline_Presentation_Package_v2.zip')
// [path inside the package, source file]
const files = [
  ['Asset_Security_Dashboard_CRC_Capstone_v2.pptx', path.join(kit, 'Asset_Security_Dashboard_CRC_Capstone_v2.pptx')], // demo video embedded
  ['Asset_Security_Dashboard_CRC_Capstone_v2.pdf', path.join(kit, 'Asset_Security_Dashboard_CRC_Capstone_v2.pdf')], // static fallback
  ['story-review/Demo_Recording_73s.mp4', path.join(kit, 'story-review/Demo_Recording_73s.mp4')], // plays in QuickTime if the deck's video won't
  ['story-review/Natural_Script.md', path.join(kit, 'story-review/Natural_Script.md')],
  ['Presenter_Guide_v2.md', path.join(kit, 'Presenter_Guide_v2.md')],
  ['Slides_Preview_v2.png', path.join(kit, 'Slides_Preview_v2.png')],
  ['Live_Demo_QR_v2.png', path.join(kit, 'Live_Demo_QR_v2.png')],
  ['sample-assets.csv', path.join(kit, '../../public/sample-assets.csv')], // for a live CSV import demo
]
const sha = async (file) => createHash('sha256').update(await fs.readFile(file)).digest('hex')

// The deck must carry the same demo video as the standalone file, or the fallback would not match the slide.
const deck = await JSZip.loadAsync(await fs.readFile(files[0][1]))
const embedded = Object.keys(deck.files).filter((name) => name.startsWith('ppt/media/') && name.endsWith('.mp4'))
assert.equal(embedded.length, 1, 'Expected exactly one embedded video')
assert.equal(createHash('sha256').update(await deck.file(embedded[0]).async('nodebuffer')).digest('hex'), await sha(files[2][1]),
  'The video inside the deck differs from story-review/Demo_Recording_73s.mp4')

const stage = await fs.mkdtemp(path.join(os.tmpdir(), 'asd-offline-'))
for (const [name, source] of files) {
  await fs.mkdir(path.dirname(path.join(stage, name)), { recursive: true })
  await fs.copyFile(source, path.join(stage, name))
}
await fs.rm(output, { force: true })
execFileSync('/usr/bin/zip', ['-q', '-X', output, ...files.map(([name]) => name)], { cwd: stage })
await fs.rm(stage, { recursive: true, force: true })

// Unpack into an empty folder and compare every file with its source.
const check = await fs.mkdtemp(path.join(os.tmpdir(), 'asd-offline-check-'))
execFileSync('/usr/bin/unzip', ['-q', output, '-d', check])
const unpacked = (await fs.readdir(check, { recursive: true, withFileTypes: true }))
  .filter((entry) => entry.isFile()).map((entry) => path.relative(check, path.join(entry.parentPath, entry.name)))
assert.deepEqual(unpacked.sort(), files.map(([name]) => name).sort())
for (const [name, source] of files) assert.equal(await sha(path.join(check, name)), await sha(source), name + ' differs after unpacking')
await fs.rm(check, { recursive: true, force: true })
const { size } = await fs.stat(output)
console.log(`Wrote ${path.relative(process.cwd(), output)}: ${files.length} files, ${(size / 1e6).toFixed(1)} MB, verified after unpacking`)
