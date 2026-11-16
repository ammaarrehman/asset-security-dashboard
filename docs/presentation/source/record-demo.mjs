// Records the demo backup: a real Chromium session driving the production build, captured with the
// browser's own screencast (real time, real rendering), then encoded to H.264 MP4 by encode-frames.swift.
// Run from the repository root after `npm run build`:  node docs/presentation/source/record-demo.mjs
// No port, network, or deployed site is used: dist/ is served in-process at the Pages base path.
// The pointer is drawn in the page (headless browsers have no visible cursor); every click is a real mouse click.
// The native <select> dropdown list is not part of a screencast, so the patch status is chosen with
// Playwright's selectOption while the pointer rests on the field. The value change itself is real.
// For projector readability the video magnifies the key moments (the overdue record, the Patch status change, the result).
// The page is recorded at 1.5x the output resolution and encode-frames.swift crops and scales the real frames in post,
// like a screen recorder's zoom; nothing in the page is altered. The app's date is fixed to the same day as the screenshots.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '../../..')
const require = createRequire(path.join(root, 'package.json'))
const { chromium } = require('playwright')
const output = path.join(here, '../media/Demo_Recording_New.mp4')
const poster = path.join(here, '../media/Demo_Recording_New_Poster.png')
const frames = await fs.mkdtemp(path.join(os.tmpdir(), 'asd-demo-frames-'))
const origin = 'http://asset-review.local'
const base = '/asset-security-dashboard/'
const mime = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.csv': 'text/csv', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }

// 1366 x 768 CSS pixels (a common laptop size, wide enough that device names don't wrap), captured at 2880 x 1620
// and encoded at 1920 x 1080, so zoomed moments stay sharp up to 1.5x.
// The screencast ignores the context's deviceScaleFactor, so the scale is forced at launch instead.
const CSS = { w: 1366, h: 768 }, CAPTURE = { w: 2880, h: 1620 }
const browser = await chromium.launch({ chromiumSandbox: true, args: ['--force-device-scale-factor=' + CAPTURE.w / CSS.w] })
const context = await browser.newContext({ viewport: { width: 1366, height: 768 } })
await context.route('**/*', async (route) => {
  const request = new URL(route.request().url())
  assert.equal(request.origin, origin, 'Unexpected external request')
  const file = path.resolve(root, 'dist', request.pathname.slice(base.length) || 'index.html')
  assert.ok(file.startsWith(path.join(root, 'dist') + path.sep))
  await route.fulfill({ body: await fs.readFile(file), contentType: mime[path.extname(file)] })
})

// A visible pointer. It lives in the top layer (as a manual popover) so it stays above modal dialogs.
await context.addInitScript(() => addEventListener('DOMContentLoaded', () => {
  const pointer = document.createElement('div')
  pointer.setAttribute('popover', 'manual')
  pointer.style.cssText = 'position:fixed;inset:auto;left:0;top:0;margin:0;padding:0;border:0;background:transparent;width:30px;height:30px;overflow:visible;pointer-events:none;transform:translate(-200px,-200px)'
  pointer.innerHTML = '<svg width="30" height="30" viewBox="0 0 30 30" style="position:absolute;left:0;top:0;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))"><path d="M3 2v21l5.6-5.1 3.7 8.2 3.6-1.6-3.6-8h7.6z" fill="#fff" stroke="#0b1118" stroke-width="1.5" stroke-linejoin="round"/></svg>'
  document.body.append(pointer)
  const raise = () => { try { pointer.hidePopover(); pointer.showPopover() } catch { /* not shown yet */ } }
  raise()
  new MutationObserver((records) => { if (records.some((r) => r.attributeName === 'open')) raise() })
    .observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] })
  addEventListener('mousemove', (event) => { pointer.style.transform = `translate(${event.clientX - 3}px,${event.clientY - 2}px)` }, true)
  addEventListener('mousedown', () => {
    const ring = document.createElement('div')
    ring.style.cssText = 'position:absolute;left:-15px;top:-16px;width:36px;height:36px;border-radius:50%;border:3px solid #55d6cf'
    pointer.prepend(ring)
    ring.animate([{ transform: 'scale(.3)', opacity: 1 }, { transform: 'scale(1.2)', opacity: 0 }], { duration: 500, easing: 'ease-out' }).finished.then(() => ring.remove())
  }, true)
}))

const page = await context.newPage()
page.setDefaultTimeout(7000)
await page.clock.setFixedTime(new Date('2026-11-11T15:00:00Z'))
const errors = []
page.on('pageerror', (error) => errors.push(String(error)))
await page.goto(origin + base)
await page.getByRole('heading', { name: 'Overview', level: 1 }).waitFor()
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(1200) // let the entrance motion settle before recording starts

// Capture the compositor's frames in real time.
const cdp = await context.newCDPSession(page)
const stamps = []
cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
  const file = String(stamps.length).padStart(5, '0') + '.jpg'
  stamps.push({ file, t: metadata.timestamp })
  await fs.writeFile(path.join(frames, file), Buffer.from(data, 'base64'))
  await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
})

let pointer = { x: 1000, y: 120 } // starts over empty space beside the page title
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const wait = (ms) => page.waitForTimeout(ms)
async function moveTo(x, y, ms = 900) {
  const from = { ...pointer }, steps = Math.round(ms / 16)
  for (let i = 1; i <= steps; i++) {
    const t = ease(i / steps)
    await page.mouse.move(from.x + (x - from.x) * t, from.y + (y - from.y) * t)
    await wait(16)
  }
  pointer = { x, y }
}
async function point(locator, ms, dx = 0) {
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  await moveTo(box.x + (dx || box.width / 2), box.y + box.height / 2, ms)
}
async function click(locator, ms) {
  await point(locator, ms)
  await wait(300)
  await page.mouse.down(); await wait(90); await page.mouse.up()
}
async function scrollBy(dy, ms = 1200) {
  const steps = Math.round(ms / 16)
  for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, dy / steps); await wait(16) }
}
const nav = (name) => page.getByRole('navigation').getByRole('button', { name, exact: name !== 'Security findings' })
const summary = page.getByRole('group', { name: 'Asset status summary' })
const badge = () => page.getByRole('navigation').getByLabel(/\d+ findings/)
// Zoom track for the encoder: at wall-clock time t, ease toward scale s centered on (cx, cy), as fractions of the frame.
const zooms = []
async function zoom(locators, s) {
  const boxes = await Promise.all(locators.map((locator) => locator.boundingBox()))
  const left = Math.min(...boxes.map((b) => b.x)), right = Math.max(...boxes.map((b) => b.x + b.width))
  const top = Math.min(...boxes.map((b) => b.y)), bottom = Math.max(...boxes.map((b) => b.y + b.height))
  zooms.push({ t: Date.now() / 1000, cx: (left + right) / 2 / CSS.w, cy: (top + bottom) / 2 / CSS.h, s })
}
const unzoom = () => zooms.push({ t: Date.now() / 1000, cx: 0.5, cy: 0.5, s: 1 })

await page.mouse.move(pointer.x, pointer.y)
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: CAPTURE.w, maxHeight: CAPTURE.h, everyNthFrame: 1 })
const started = Date.now()
const mark = (label) => console.log(((Date.now() - started) / 1000).toFixed(1).padStart(5) + ' s  ' + label)

// 1. The dashboard with 18 fictional devices.
mark('Overview')
await wait(1800)
await point(summary.getByText('Total assets'), 1100)
assert.match(await summary.innerText(), /18\s+Total assets/)
await wait(2800)
await point(summary.getByText('Needs attention'), 1000)
await wait(2200)

// 2. The most important recorded findings.
mark('Priority follow-ups')
await scrollBy(330)
await point(page.getByRole('heading', { name: 'Priority follow-ups' }), 1000)
await wait(1500)
const followups = page.getByRole('region', { name: 'Priority follow-ups' })
await point(followups.getByRole('button', { name: 'Archive Workstation' }), 900)
await wait(2500)
await point(followups.getByRole('button', { name: 'Intake Laptop 01' }), 900)
await wait(2000)
await point(page.getByRole('region', { name: 'Findings by category' }).getByText('Patch management'), 1100)
await wait(2500)
await scrollBy(-330, 900)

// 3. Outreach Laptop 03.
mark('Inventory search')
await click(nav('Inventory'), 1100)
await page.getByRole('heading', { name: 'Inventory', level: 1 }).waitFor()
await wait(1600)
await click(page.getByRole('searchbox'), 900)
await wait(400)
await page.getByRole('searchbox').pressSequentially('Outreach', { delay: 150 })
const row = page.getByRole('row', { name: /Outreach Laptop 03/ })
await row.waitFor()
assert.match(await row.innerText(), /Needs attention/)
await wait(2000)

// 4. Its overdue patch finding.
mark('Details')
await click(page.getByRole('button', { name: 'Outreach Laptop 03 Windows 11', exact: true }), 1000)
const dialog = page.getByRole('dialog')
await dialog.getByRole('heading', { name: 'Patches overdue' }).waitFor()
await zoom([dialog.locator('.controls-grid'), dialog.locator('.detail-inspection')], 1.5)
await wait(2000)
await point(dialog.getByText('Overdue', { exact: true }).first(), 1000)
await wait(3000)
await point(dialog.getByRole('heading', { name: 'Patches overdue' }), 1000)
await wait(2200)
await point(dialog.getByText(/Check for available security updates/), 1000)
await wait(2500)

// 5. Changing the recorded patch status.
mark('Edit asset')
unzoom()
await click(dialog.getByRole('button', { name: 'Edit asset' }), 1000)
await page.getByRole('heading', { name: 'Edit asset' }).waitFor()
const patch = page.getByLabel('Patch status')
await zoom([patch], 1.5)
await wait(1600)
await point(patch, 1000)
await wait(900)
await patch.selectOption('Up to date')
await wait(2000)
unzoom()
await click(page.getByRole('button', { name: 'Save changes' }), 1100)
await page.getByText('Asset updated.').waitFor()

// 6. The updated finding and status.
mark('Saved')
assert.match(await row.innerText(), /Healthy/)
await zoom([row], 1.4)
await wait(1800)
await point(row.getByText('Healthy'), 1000)
await wait(2500)
assert.equal(await badge().getAttribute('aria-label'), '12 findings')
await zoom([nav('Security findings')], 1.4) // pan to the sidebar so the whole "Security findings 12" item is in view
await point(badge(), 1100)
await wait(2500)
await click(page.getByRole('button', { name: 'Outreach Laptop 03 Windows 11', exact: true }), 1100)
assert.match(await page.getByRole('dialog').innerText(), /0 findings from this record/)
await zoom([dialog.locator('.detail-summary'), dialog.locator('.detail-inspection')], 1.5)
await wait(2000)
await point(page.getByRole('dialog').getByText(/No gaps flagged/), 1000)
await wait(2800)
unzoom()
await click(page.getByRole('dialog').getByRole('button', { name: 'Close dialog' }), 1000)
await wait(800)
mark('Overview again')
await click(nav('Overview'), 1100)
await zoom([summary], 1.25)
await wait(1500)
assert.match(await summary.innerText(), /10\s+Healthy[\s\S]*5\s+Needs attention/)
await point(summary.getByText('Healthy', { exact: true }), 1000)
await wait(2500)
await point(summary.getByText('Total assets'), 1000)
await wait(Math.max(1200, 93500 - (Date.now() - started)))
// The screencast only sends frames when the screen changes; a 1 px nudge stamps the true end of the hold.
await page.mouse.move(pointer.x + 1, pointer.y)
await wait(200)
mark('End')

await cdp.send('Page.stopScreencast')
await wait(300)
assert.deepEqual(errors, [])
await browser.close()
assert.ok(stamps.length > 300, 'Too few frames captured: ' + stamps.length)
await fs.writeFile(path.join(frames, 'frames.json'), JSON.stringify(stamps))
await fs.writeFile(path.join(frames, 'zooms.json'), JSON.stringify(zooms))
console.log(stamps.length, 'frames captured,', zooms.length, 'zoom moves')

execFileSync('swift', ['-suppress-warnings', path.join(here, 'encode-frames.swift'), frames, output, '30', '1920', '1080'], { stdio: 'inherit' })
// The video's first frame becomes the slide's still image, shown whenever the video is not playing.
execFileSync('sips', ['-s', 'format', 'png', '-z', '1080', '1920', path.join(frames, stamps[0].file), '--out', poster], { stdio: 'ignore' })
await fs.rm(frames, { recursive: true, force: true })
console.log('Wrote', path.relative(process.cwd(), output))
