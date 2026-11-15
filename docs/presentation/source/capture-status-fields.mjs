// Captures the real Patch status field and status line of Outreach Laptop 03, before and after the demo's one change,
// at 3x pixel density so slide 4 can show them large without blurring. Nothing is edited or drawn over: these are
// element screenshots of the production build, taken while the same steps as the demo run and are checked.
// Run from the repository root after `npm run build`:  node docs/presentation/source/capture-status-fields.mjs
// Writes media/Status_{Before,After}_{Patch,Summary}.png.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '../../..')
const require = createRequire(path.join(root, 'package.json'))
const { chromium } = require('playwright')
const out = path.join(here, '../media')
const origin = 'http://asset-review.local'
const base = '/asset-security-dashboard/'
const mime = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.csv': 'text/csv', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }

const browser = await chromium.launch({ chromiumSandbox: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3, reducedMotion: 'reduce' })
await context.route('**/*', async (route) => {
  const request = new URL(route.request().url())
  assert.equal(request.origin, origin, 'Unexpected external request')
  const file = path.resolve(root, 'dist', request.pathname.slice(base.length) || 'index.html')
  assert.ok(file.startsWith(path.join(root, 'dist') + path.sep))
  await route.fulfill({ body: await fs.readFile(file), contentType: mime[path.extname(file)] })
})
const page = await context.newPage()
page.setDefaultTimeout(7000)
await page.clock.setFixedTime(new Date('2026-11-11T15:00:00Z'))
const errors = []
page.on('pageerror', (error) => errors.push(String(error)))

const dialog = page.getByRole('dialog')
const patchField = () => dialog.locator('.control-tile').filter({ hasText: 'Patch status' })
const statusLine = () => dialog.locator('.detail-summary')
async function capture(stage) {
  await page.evaluate(() => document.fonts.ready)
  await patchField().screenshot({ path: path.join(out, `Status_${stage}_Patch.png`), animations: 'disabled', caret: 'hide' })
  // The status line spans the dialog's width; clip it to the badge and finding count, with a little of the dialog around them.
  const clip = await statusLine().evaluate((line) => {
    const boxes = [...line.children].map((child) => child.getBoundingClientRect())
    const left = Math.min(...boxes.map((b) => b.left)), right = Math.max(...boxes.map((b) => b.right))
    const top = Math.min(...boxes.map((b) => b.top)), bottom = Math.max(...boxes.map((b) => b.bottom))
    return { x: left - 6, y: top - 6, width: right - left + 12, height: bottom - top + 12 }
  })
  await page.screenshot({ path: path.join(out, `Status_${stage}_Summary.png`), clip, animations: 'disabled', caret: 'hide' })
}
const openRecord = () => page.getByRole('button', { name: 'Outreach Laptop 03 Windows 11', exact: true }).click()

await page.goto(origin + base)
await page.getByRole('navigation').getByRole('button', { name: 'Inventory', exact: true }).click()
await page.getByRole('searchbox').fill('Outreach')
await openRecord()

// Before: the record as the demo data has it.
assert.equal(await patchField().innerText().then((t) => t.replace(/\s+/g, ' ').trim()), 'PATCH STATUS Overdue') // the label is uppercased by CSS
assert.equal(await statusLine().innerText().then((t) => t.replace(/\s+/g, ' ').trim()), 'Needs attention 1 finding from this record')
await dialog.getByRole('heading', { name: 'Patches overdue' }).waitFor()
await capture('Before')

// The one change from the demo: Patch status set to Up to date, through the real edit form.
await dialog.getByRole('button', { name: 'Edit asset' }).click()
await page.getByLabel('Patch status').selectOption('Up to date')
await page.getByRole('button', { name: 'Save changes' }).click()
await page.getByText('Asset updated.').waitFor()
await openRecord()

// After: the same record, reopened.
assert.equal(await patchField().innerText().then((t) => t.replace(/\s+/g, ' ').trim()), 'PATCH STATUS Up to date')
assert.equal(await statusLine().innerText().then((t) => t.replace(/\s+/g, ' ').trim()), 'Healthy 0 findings from this record')
await capture('After')

assert.deepEqual(errors, [])
await browser.close()
console.log('Captured Status_Before_* and Status_After_* (Patch status Overdue -> Up to date; 1 finding -> 0)')
