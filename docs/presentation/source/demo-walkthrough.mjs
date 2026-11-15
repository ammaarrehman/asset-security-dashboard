// Rehearses the live demo against the production build and captures each step.
// Run from the repository root after `npm run build`:  node docs/presentation/source/demo-walkthrough.mjs
// Serves dist/ in-process at the Pages base path (no port, no network) with the same fixed date as the browser QA.
// Writes media/Demo_Step_*.png and App_Outreach_Laptop_03_Finding.png, and fails if any count in the presenter guide is wrong.
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
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
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
// Entrance animations are short and finite. Wait for them so captures show the settled interface.
const shot = async (n) => {
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {})))
  })
  await page.screenshot({ path: path.join(out, `Demo_Step_${n}.png`), animations: 'disabled', caret: 'hide' })
}
const nav = (name) => page.getByRole('navigation').getByRole('button', { name, exact: name !== 'Security findings' })
const findingsBadge = () => page.getByRole('navigation').getByLabel(/\d+ findings/).getAttribute('aria-label')
const results = []

await page.goto(origin + base)
await page.getByRole('heading', { name: 'Overview', level: 1 }).waitFor()

// Step 1: the 18 fictional devices.
const summary = page.getByRole('group', { name: 'Asset status summary' })
assert.match(await summary.innerText(), /18\s+Total assets/)
assert.equal(await findingsBadge(), '13 findings')
results.push('1 Overview: 18 total assets, 13 findings')
await shot(1)

// Step 2: find Outreach Laptop 03 with the inventory search.
await nav('Inventory').click()
await page.getByRole('heading', { name: 'Inventory', level: 1 }).waitFor()
assert.match(await page.getByRole('group', { name: 'Security status filter' }).innerText(), /All\s*18/)
await page.getByRole('searchbox').fill('Outreach')
const row = page.getByRole('row', { name: /Outreach Laptop 03/ })
await row.waitFor()
assert.match(await row.innerText(), /Needs attention/)
results.push('2 Inventory: All 18, search "Outreach" shows Outreach Laptop 03 as Needs attention')
await shot(2)

// Step 3: the recorded overdue patch status and its finding.
await page.getByRole('button', { name: 'Outreach Laptop 03 Windows 11', exact: true }).click()
const dialog = page.getByRole('dialog')
await dialog.getByRole('heading', { name: 'Patches overdue' }).waitFor()
assert.match(await dialog.innerText(), /1 finding from this record/)
results.push('3 Details: Patch status Overdue, 1 finding "Patches overdue"')
await shot(3)
// The record dialog on its own, used on the example slide.
await dialog.screenshot({ path: path.join(out, 'App_Outreach_Laptop_03_Finding.png'), animations: 'disabled', caret: 'hide' })

// Step 4: edit the recorded patch status.
await dialog.getByRole('button', { name: 'Edit asset' }).click()
await page.getByRole('heading', { name: 'Edit asset' }).waitFor()
await page.getByLabel('Patch status').selectOption('Up to date')
await page.getByLabel('Patch status').scrollIntoViewIfNeeded()
results.push('4 Edit asset: Patch status set to Up to date')
await shot(4)
await page.getByRole('button', { name: 'Save changes' }).click()
await page.getByText('Asset updated.').waitFor()

// Step 5: the finding updates.
assert.match(await row.innerText(), /Healthy/)
assert.equal(await findingsBadge(), '12 findings')
results.push('5 Saved: "Asset updated.", row now Healthy, Security findings badge 13 -> 12')
await shot(5)
await page.getByRole('button', { name: 'Outreach Laptop 03 Windows 11', exact: true }).click()
assert.match(await page.getByRole('dialog').innerText(), /0 findings from this record/)
results.push('5b Details reopened: Healthy, 0 findings')
await shot(6)
await page.keyboard.press('Escape')
await nav('Overview').click()
assert.match(await summary.innerText(), /10\s+Healthy[\s\S]*5\s+Needs attention/)
results.push('5c Overview: Healthy 9 -> 10, Needs attention 6 -> 5')
await shot(7)

assert.deepEqual(errors, [])
await browser.close()
console.log(results.join('\n'))
