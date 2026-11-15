// ASSET_QA_MODULES optionally reuses existing Playwright/axe development tooling.
// ASSET_QA_PREVIOUS points the before-and-after sheet at another set of stored captures (default: the pre-overhaul design);
// ASSET_QA_REVIEW_TITLE names that sheet.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { qaOutputPaths } from './qa-output.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(process.env.ASSET_QA_MODULES
  ? path.join(process.env.ASSET_QA_MODULES, 'asset-review.cjs')
  : new URL('../package.json', import.meta.url))
const { chromium, webkit } = require('playwright')
const axePath = require.resolve('axe-core/axe.min.js')
const engine = process.argv.includes('--webkit') ? 'webkit' : 'chromium'
const liveUrl = process.env.ASSET_QA_URL
const updateGallery = process.argv.includes('--update-gallery')
const destinations = qaOutputPaths(root, { output: process.env.ASSET_QA_OUTPUT, updateGallery, engine })
const { output } = destinations
const storageKey = 'asset-security-dashboard.inventory.v1'
const origin = liveUrl ? new URL(liveUrl).origin : 'http://asset-review.local'
const base = '/asset-security-dashboard/'
const url = origin + base
if (liveUrl) assert.equal(liveUrl, url, 'Live QA URL must use the configured repository base path')
const viewports = { desktop: [1440, 900], laptop: [1280, 800], tablet: [768, 1024], mobile: [390, 844] }
const mime = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.csv': 'text/csv', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }
const report = { status: 'running', executedAt: new Date().toISOString(), engine, version: '', playwright: require('playwright/package.json').version,
  axe: require('axe-core/package.json').version, fixedDate: '2026-11-11T15:00:00Z',
  url, serving: liveUrl ? 'public network' : 'local artifact interception',
  accessibility: [], layouts: [], workflows: [], motion: {}, errors: [], network: [], gallery: {} }
await fs.mkdir(output, { recursive: true })
let browser
try {
  const browserType = engine === 'webkit' ? webkit : chromium
  // A fresh npm ci does not download Playwright browsers. Make the QA command self-contained.
  try { await fs.access(browserType.executablePath()) } catch {
    execFileSync(process.execPath, [require.resolve('playwright/cli'), 'install', engine], { stdio: 'inherit' })
  }
  report.productionHtmlSha256 = createHash('sha256').update(await fs.readFile(path.join(root, 'dist/index.html'))).digest('hex')
  browser = await browserType.launch(engine === 'webkit' ? {} : { chromiumSandbox: true })
  report.version = browser.version()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true })
  // Serve the unmodified production artifacts in-process, at the configured Pages path.
  // No listening port, external site, backend, or published deployment is required.
  if (!liveUrl) await context.route('**/*', async route => {
    const request = new URL(route.request().url())
    assert.equal(request.origin, origin, 'Unexpected external request')
    assert.ok(request.pathname.startsWith(base), 'Request outside Pages base')
    const relative = request.pathname.slice(base.length) || 'index.html'
    const file = path.resolve(root, 'dist', relative)
    assert.ok(file.startsWith(path.join(root, 'dist') + path.sep))
    await route.fulfill({ body: await fs.readFile(file), contentType: mime[path.extname(file)] })
  })
  const page = await context.newPage()
  page.setDefaultTimeout(7000)
  await page.clock.setFixedTime(new Date('2026-11-11T15:00:00Z'))
  page.on('pageerror', error => report.errors.push(String(error)))
  page.on('console', event => { if (event.type() === 'error') report.errors.push(event.text()) })
  if (liveUrl) {
    page.on('response', response => {
      report.network.push({ url: response.url(), status: response.status(), type: response.request().resourceType() })
      if (response.status() >= 400) report.errors.push('HTTP ' + response.status() + ': ' + response.url())
      const requestUrl = new URL(response.url())
      if (requestUrl.origin !== origin || !requestUrl.pathname.startsWith(base)) report.errors.push('Request outside Pages base: ' + response.url())
    })
    page.on('requestfailed', request => report.errors.push('Request failed: ' + request.url() + ': ' + request.failure()?.errorText))
  }
  const modal = () => page.getByRole('dialog')
  const button = name => page.getByRole('button', { name, exact: true })
  const nav = name => page.getByRole('navigation').getByRole('button', { name, exact: name !== 'Security findings' })
  const goto = async name => {
    await nav(name).click()
    await page.getByRole('heading', { name, level: 1 }).waitFor()
    await page.waitForFunction(() => document.querySelector('h1') === document.activeElement)
    // Pointer navigation still moves focus to the heading for screen readers, but must not draw a focus ring.
    assert.equal(await page.locator('h1').evaluate(el => el.matches(':focus-visible') + ' ' + getComputedStyle(el).outlineStyle), 'false none', 'No focus ring after mouse navigation')
  }
  const close = async () => { await page.keyboard.press('Escape'); await modal().waitFor({ state: 'hidden' }) }
  const waitFocus = async locator => {
    await locator.waitFor()
    await page.waitForFunction(element => element === document.activeElement, await locator.elementHandle())
  }
  async function keyboardDialog() {
    for (let step = 0; step < 16; step++) {
      await page.keyboard.press(step < 8 ? 'Tab' : 'Shift+Tab')
      assert.equal(await modal().evaluate(el => el.contains(document.activeElement)), true, 'Modal focus escaped')
    }
  }
  const count = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)).assets.length, storageKey)
  const reset = async () => {
    await page.goto(url)
    await page.evaluate(key => localStorage.removeItem(key), storageKey)
    await page.reload()
    await page.getByRole('heading', { name: 'Overview', level: 1 }).waitFor()
    assert.equal(await count(), 18)
  }
  // Entrance animations are short and finite. Wait for them so scans and captures see the settled interface.
  const settle = () => page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {})))
  })
  const statusFilter = name => page.getByRole('group', { name: 'Security status filter' }).getByRole('button', { name })
  const categoryFilter = name => page.getByRole('group', { name: 'Finding category' }).getByRole('button', { name })
  async function axe(label) {
    await settle()
    await page.addScriptTag({ path: axePath })
    const results = await page.evaluate(() => window.axe.run({ runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }))
    const summarize = ({ id, impact, help, helpUrl, nodes }) => ({ id, impact, help, helpUrl,
      targets: nodes.map(({ target }) => target),
      details: nodes.map(({ failureSummary, any, all, none }) => ({ failureSummary, checks: [...any, ...all, ...none].map(({ id, message, data }) => ({ id, message, data })) })) })
    const violations = results.violations.map(summarize)
    // Record browser-computed evidence for manual review of axe's indeterminate contrast checks.
    const contrastReview = await page.evaluate(incomplete => {
      const luminance = rgb => {
        const channels = rgb.match(/[\d.]+/g).slice(0, 3).map(Number).map(c => {
          c /= 255
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
        })
        return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722
      }
      return incomplete.filter(item => item.id === 'color-contrast').flatMap(item => item.nodes.map(node => {
        const el = document.querySelector(node.target[0])
        const style = getComputedStyle(el)
        let ancestor = el
        let background = 'rgba(0, 0, 0, 0)'
        while (ancestor && background === 'rgba(0, 0, 0, 0)') {
          background = getComputedStyle(ancestor).backgroundColor
          ancestor = ancestor.parentElement
        }
        const a = luminance(style.color)
        const b = luminance(background)
        return { target: node.target, foreground: style.color, background, fontSize: style.fontSize,
          ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) }
      }))
    }, results.incomplete)
    report.accessibility.push({ label, violations, incomplete: results.incomplete.map(summarize), contrastReview, passedRules: results.passes.length })
    assert.deepEqual(violations, [], label)
  }
  async function capture(viewport, name, fullPage = false, allowTableScroll = false) {
    await settle()
    const layout = await page.evaluate(() => {
      const dialog = document.querySelector('dialog[open]')
      const footer = dialog?.querySelector('.modal-footer')
      const table = document.querySelector('.table-scroll')
      const rect = element => element ? element.getBoundingClientRect().toJSON() : null
      return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        tableWidth: table?.clientWidth, tableScrollWidth: table?.scrollWidth,
        dialog: rect(dialog), footer: rect(footer) }
    })
    assert.equal(layout.scrollWidth, layout.width, viewport + '/' + name + ': page overflow')
    if (layout.tableWidth && !allowTableScroll) assert.equal(layout.tableWidth, layout.tableScrollWidth, viewport + '/' + name + ': table overflow')
    if (layout.footer) {
      assert.ok(layout.dialog.top >= 0 && layout.dialog.bottom <= page.viewportSize().height, 'Dialog outside viewport')
      assert.ok(layout.footer.bottom <= layout.dialog.bottom)
      assert.ok(layout.footer.top >= layout.dialog.top)
    }
    report.layouts.push({ viewport, name, ...layout })
    const folder = path.join(output, viewport)
    await fs.mkdir(folder, { recursive: true })
    await page.screenshot({ path: path.join(folder, name + '.png'), fullPage, animations: 'disabled', caret: 'hide' })
  }

  for (const [viewport, [width, height]] of Object.entries(viewports)) {
    await page.setViewportSize({ width, height })
    await reset()
    await page.keyboard.press('Tab')
    await waitFocus(page.getByRole('link', { name: 'Skip to content' }))
    await page.keyboard.press('Enter')
    await waitFocus(page.getByRole('main'))
    // The skip link intentionally scrolls to main; restore the normal overview capture state.
    await page.getByRole('main').evaluate(el => el.blur())
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForFunction(() => scrollY === 0)
    await axe(viewport + ': overview')
    await capture(viewport, 'dashboard')
    assert.equal(await page.locator('.followup-device').first().innerText(), 'Archive Workstation', 'Documented follow-up order')
    assert.equal(await page.locator('.followup').count(), 5)
    // The relationship diagram draws its lines the first time it scrolls into view.
    const diagram = page.locator('.flow-map')
    await diagram.scrollIntoViewIfNeeded()
    await page.waitForFunction(() => !document.querySelector('.flow-map').hasAttribute('data-armed'))
    await page.waitForTimeout(1700)
    if (width > 700) assert.ok(await page.locator('.flow-line').count() >= 20, 'Relationship lines rendered')
    else assert.equal(await page.locator('.flow-links').evaluate(el => getComputedStyle(el).display), 'none')
    await diagram.getByRole('button', { name: /^Backup readiness/ }).click()
    assert.equal(await diagram.getByRole('button', { name: /^Backup readiness/ }).getAttribute('aria-pressed'), 'true')
    await page.getByRole('group', { name: 'Selected trace: Backup readiness' }).getByRole('button', { name: 'Community Room Tablet' }).waitFor()
    await diagram.getByRole('button', { name: /^Patch management/ }).click()
    await page.getByRole('group', { name: 'Selected trace: Patch management' }).getByRole('button', { name: 'Outreach Laptop 03' }).waitFor()
    await axe(viewport + ': relationship diagram')
    await capture(viewport, 'relationship-diagram')
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForFunction(() => scrollY === 0)
    await capture(viewport, 'dashboard-full', true)
    await nav('Overview').focus()
    await page.keyboard.press('Tab')
    await waitFocus(nav('Inventory'))
    assert.equal(await nav('Inventory').evaluate(el => getComputedStyle(el).outlineStyle), 'solid')
    await capture(viewport, 'keyboard-navigation')
    await page.keyboard.press('Enter')
    await waitFocus(page.locator('h1'))
    // Keyboard navigation shows the app's own ring around the heading text, not the browser's default box.
    assert.deepEqual(await page.locator('h1').evaluate(el => {
      const style = getComputedStyle(el), range = document.createRange()
      range.selectNodeContents(el)
      return [el.matches(':focus-visible'), style.outlineStyle, style.outlineWidth, Math.abs(el.getBoundingClientRect().width - range.getBoundingClientRect().width) < 2]
    }), [true, 'solid', '2px', true], 'Keyboard focus ring on the page heading')
    await capture(viewport, 'keyboard-heading')
    await axe(viewport + ': inventory')
    // The ordinary inventory capture shows the page as a pointer user sees it, without a focused heading.
    await page.locator('h1').evaluate(el => el.blur())
    await capture(viewport, 'inventory')
    await page.getByRole('searchbox').fill('Windows')
    await page.getByText('Showing 1–7 of 7 devices (18 in inventory)').waitFor()
    await capture(viewport, 'inventory-search', viewport === 'mobile')
    await statusFilter(/Needs attention/).click()
    await page.getByText('Showing 1–3 of 3 devices (18 in inventory)').waitFor()
    await page.getByRole('searchbox').clear()
    await statusFilter(/^All/).click()
    await page.getByRole('searchbox').fill('No fictional device matches this query')
    await page.getByRole('heading', { name: 'No matching devices' }).waitFor()
    await capture(viewport, 'inventory-empty')
    await button('Clear filters').click()
    await button('Outreach Laptop 03 Windows 11').click()
    await modal().getByRole('heading', { name: 'Patches overdue' }).waitFor()
    const detailBody = modal().getByRole('region', { name: 'Asset details' })
    await detailBody.focus()
    if (await detailBody.evaluate(el => el.scrollHeight > el.clientHeight)) {
      await page.keyboard.press('PageDown')
      await page.waitForFunction(el => el.scrollTop > 0, await detailBody.elementHandle())
      await capture(viewport, 'asset-details-scrolled')
      await detailBody.evaluate(el => el.scrollTo(0, 0))
    }
    await modal().getByRole('button', { name: 'Close dialog' }).focus()
    await axe(viewport + ': detail')
    await capture(viewport, 'asset-details')
    await modal().getByRole('button', { name: 'Edit asset' }).click()
    await axe(viewport + ': editor')
    await capture(viewport, 'edit-asset')
    await modal().getByRole('button', { name: 'Cancel' }).click()
    await page.waitForFunction(() => document.activeElement.textContent.trim() === 'Edit asset')
    await close()
    await button('Add asset').click()
    assert.equal(await page.evaluate(() => document.activeElement.id), 'asset-name')
    await axe(viewport + ': add editor')
    await capture(viewport, 'add-asset')
    await keyboardDialog()
    await modal().getByRole('button', { name: 'Save asset' }).click()
    await modal().getByText('Enter a device name.').waitFor()
    await axe(viewport + ': validation')
    await capture(viewport, 'add-validation')
    await close()
    await button('Import CSV').click()
    await axe(viewport + ': import')
    await capture(viewport, 'csv-import')
    await modal().getByLabel('CSV file').setInputFiles(path.join(root, 'public/sample-assets.csv'))
    await modal().getByText('3 devices ready to import').waitFor()
    assert.equal(await count(), 18)
    await axe(viewport + ': import preview')
    await capture(viewport, 'csv-preview')
    await close()
    await goto('Security findings')
    await axe(viewport + ': findings')
    await capture(viewport, 'security-findings')
    await categoryFilter(/Patch management/).click()
    await page.getByText('3 findings', { exact: true }).waitFor()
    await capture(viewport, 'security-findings-filtered', true)
    await button('Reset demo').click()
    await axe(viewport + ': reset confirmation')
    await capture(viewport, 'reset-confirmation')
    await close()
    console.log(viewport + ': layouts, dialogs, keyboard navigation, filters, relationship diagram, and 11 accessibility scans passed')
  }

  await page.setViewportSize({ width: 1440, height: 900 })
  await reset()
  await page.getByRole('button', { name: /Needs attention/ }).click()
  assert.equal(await statusFilter(/Needs attention/).getAttribute('aria-pressed'), 'true')
  await button('Outreach Laptop 03 Windows 11').click()
  await modal().getByRole('button', { name: 'Edit asset' }).click()
  await modal().getByLabel('Patch status').selectOption('Up to date')
  await modal().getByRole('button', { name: 'Save changes' }).click()
  await goto('Overview')
  assert.match(await page.getByRole('button', { name: /Needs attention/ }).innerText(), /^5\s/)
  assert.match(await page.locator('.flow-map').getByRole('button', { name: /^Patch management/ }).innerText(), /\b2\b/, 'Diagram count follows the record')
  assert.equal(await page.locator('.followup-device').filter({ hasText: 'Outreach Laptop 03' }).count(), 0, 'Resolved record leaves the follow-ups')
  await goto('Inventory')
  await button('Add asset').click()
  const formulaName = '=' + 'A'.repeat(99)
  await modal().getByLabel('Device name').fill(formulaName)
  await modal().getByLabel('Notes').fill('<img src=x onerror=alert(1)>')
  await modal().getByRole('button', { name: 'Save asset' }).click()
  assert.equal(await count(), 19)
  await button(formulaName).click()
  assert.equal(await modal().locator('img').count(), 0)
  await modal().getByText('<img src=x onerror=alert(1)>', { exact: true }).waitFor()
  await close()
  const downloading = page.waitForEvent('download')
  await button('Export CSV').click()
  const csv = await fs.readFile(await (await downloading).path(), 'utf8')
  assert.ok(csv.includes('"\'' + formulaName + '"'))
  await button('Import CSV').click()
  await modal().getByLabel('CSV file').setInputFiles({ name: 'invalid.csv', mimeType: 'text/csv', buffer: Buffer.from('device_name,device_type\nInvalid,Laptop\n') })
  await modal().getByRole('alert').waitFor()
  assert.equal(await count(), 19)
  const mixedCsv = (await fs.readFile(path.join(root, 'public/sample-assets.csv'), 'utf8')).replace('Workshop Tablet,Mobile', 'Workshop Tablet,Unsupported')
  await modal().getByLabel('CSV file').setInputFiles({ name: 'mixed-valid-invalid.csv', mimeType: 'text/csv', buffer: Buffer.from(mixedCsv) })
  await modal().getByRole('alert').waitFor()
  assert.equal(await modal().getByRole('button', { name: 'Import devices', exact: true }).isDisabled(), true)
  assert.equal(await count(), 19, 'A valid row followed by an invalid row must reject the entire import')
  await axe('desktop: import error')
  await capture('desktop', 'csv-invalid')
  await modal().getByLabel('CSV file').setInputFiles({ name: 'roundtrip.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) })
  await modal().getByText('19 devices ready to import').waitFor()
  assert.equal(await count(), 19)
  await close()
  await button('Import CSV').click()
  await modal().getByLabel('CSV file').setInputFiles(path.join(root, 'public/sample-assets.csv'))
  await modal().getByText('3 devices ready to import').waitFor()
  await modal().getByRole('button', { name: 'Import 3 devices' }).click()
  assert.equal(await count(), 22)
  await page.reload()
  assert.equal(await count(), 22)
  await goto('Inventory')
  await page.getByRole('searchbox').fill('Mobile Pantry Laptop')
  await button('Mobile Pantry Laptop Windows 11').waitFor()
  await page.getByRole('searchbox').clear()
  await button(formulaName).click()
  await modal().getByRole('button', { name: 'Delete asset' }).click()
  await axe('desktop: delete confirmation')
  await capture('desktop', 'delete-confirmation')
  await modal().getByRole('button', { name: 'Cancel' }).click()
  await page.waitForFunction(() => document.activeElement.textContent.trim() === 'Delete asset')
  await modal().getByRole('button', { name: 'Delete asset' }).click()
  await modal().getByRole('button', { name: 'Delete asset' }).click()
  assert.equal(await count(), 21)
  await button('Reset demo').click()
  await modal().getByRole('button', { name: 'Reset demo data' }).click()
  assert.equal(await count(), 18)
  report.workflows.push('CRUD and findings updates', 'search, status/category filters', 'keyboard navigation, modal focus containment, Escape, validation and focus restoration', 'CSV atomic failure, preview, import, export and formula round-trip', 'refresh persistence and reset')
  await page.setViewportSize({ width: 320, height: 780 })
  await capture('narrow', 'inventory')
  await button('Add asset').click()
  assert.ok(await modal().locator('.modal-body').evaluate(el => el.scrollHeight > el.clientHeight))
  await capture('narrow', 'add-asset')
  await close()
  assert.deepEqual(report.errors, [])
  if (liveUrl) for (const type of ['document', 'script', 'stylesheet']) {
    assert.ok(report.network.some(response => response.type === type && response.status === 200), 'Missing successful live ' + type + ' response')
  }
  report.workflows.push('320px layout and scrolling editor with visible actions')
  // Exercise both sides of the mobile breakpoint. A data table may scroll inside its
  // named keyboard-focusable region, but hidden labels must never widen the page.
  for (const width of [600, 621, 640, 660, 680, 700]) {
    await page.setViewportSize({ width, height: 900 })
    await goto('Inventory')
    await capture('intermediate-' + width, 'inventory', false, true)
    const table = page.getByRole('region', { name: 'Asset table' })
    if (await table.evaluate(el => el.scrollWidth > el.clientWidth)) {
      await table.focus()
      await page.keyboard.press('ArrowRight')
      await page.waitForFunction(el => el.scrollLeft > 0, await table.elementHandle())
      await table.evaluate(el => el.scrollLeft = 0)
    }
    await axe(width + 'px: inventory reflow')
    await button('Add asset').click()
    await capture('intermediate-' + width, 'add-asset', false, true)
    await close()
    await goto('Overview')
    await capture('intermediate-' + width, 'overview', false, true)
    await goto('Security findings')
    await capture('intermediate-' + width, 'findings', false, true)
  }
  report.workflows.push('600/621/640/660/680/700px page reflow and keyboard table scrolling')
  // Reduced motion: nothing should animate, and the diagram must be complete without scrolling into view.
  const calm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  if (!liveUrl) await calm.route('**/*', async route => {
    const request = new URL(route.request().url())
    const file = path.resolve(root, 'dist', request.pathname.slice(base.length) || 'index.html')
    await route.fulfill({ body: await fs.readFile(file), contentType: mime[path.extname(file)] })
  })
  const calmPage = await calm.newPage()
  await calmPage.clock.setFixedTime(new Date('2026-11-11T15:00:00Z'))
  await calmPage.goto(url)
  await calmPage.getByRole('heading', { name: 'Overview', level: 1 }).waitFor()
  report.motion = await calmPage.evaluate(() => {
    const seconds = value => Math.max(...value.split(',').map(part => parseFloat(part) * (part.trim().endsWith('ms') ? .001 : 1)))
    const all = [...document.querySelectorAll('*')].map(el => getComputedStyle(el))
    return {
      reducedMotionMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      longestAnimationSeconds: Math.max(...all.map(style => seconds(style.animationDuration))),
      longestTransitionSeconds: Math.max(...all.map(style => seconds(style.transitionDuration))),
      runningAnimations: document.getAnimations().filter(animation => animation.playState === 'running').length,
      diagramArmed: document.querySelector('.flow-map').hasAttribute('data-armed'),
      pulseDisplay: [...document.querySelectorAll('.flow-pulse')].map(el => getComputedStyle(el).display),
    }
  })
  assert.equal(report.motion.reducedMotionMatches, true)
  assert.ok(report.motion.longestAnimationSeconds <= .001 && report.motion.longestTransitionSeconds <= .001, 'Reduced motion leaves no perceptible animation')
  assert.equal(report.motion.diagramArmed, false, 'Diagram is complete without a reveal')
  assert.ok(report.motion.pulseDisplay.every(display => display === 'none'))
  await fs.mkdir(path.join(output, 'reduced-motion'), { recursive: true })
  await calmPage.locator('.flow').scrollIntoViewIfNeeded()
  await calmPage.screenshot({ path: path.join(output, 'reduced-motion/relationship-diagram.png') })
  // With motion allowed, every animation must be finite.
  report.motion.infiniteAnimations = await page.evaluate(() => document.getAnimations()
    .filter(animation => animation.effect?.getComputedTiming().iterations === Infinity).length)
  assert.equal(report.motion.infiniteAnimations, 0)
  await calm.close()
  report.workflows.push('reduced-motion preference and finite animations', 'priority follow-up order and relationship-diagram selection')

  const sheet = await context.newPage()
  await sheet.setViewportSize({ width: 2400, height: 1000 })
  const image = async file => 'data:image/png;base64,' + await fs.readFile(file, 'base64')
  const figures = async entries => Promise.all(entries.map(async ([label, file]) =>
    `<figure><figcaption>${label}</figcaption><img alt="${label}" src="${await image(path.join(output, file))}"></figure>`))
  const sheetStyle = `*{box-sizing:border-box}body{margin:44px;background:#080d13;color:#eaf2f2;font-family:"IBM Plex Sans",system-ui,sans-serif}
    @font-face{font-family:"IBM Plex Sans";font-weight:400;src:url("${'data:font/woff2;base64,' + await fs.readFile(path.join(root, 'src/fonts/IBMPlexSans-Regular-Latin1.woff2'), 'base64')}")}
    @font-face{font-family:"IBM Plex Sans";font-weight:600;src:url("${'data:font/woff2;base64,' + await fs.readFile(path.join(root, 'src/fonts/IBMPlexSans-SemiBold-Latin1.woff2'), 'base64')}")}
    h1{font-size:40px;font-weight:600;letter-spacing:-.025em;margin:0 0 8px}p{font-size:17px;color:#b7c6ca;margin:0 0 30px}
    h2{font-size:24px;font-weight:600;margin:40px 0 18px;padding-top:22px;border-top:1px solid #2c4553}section{display:grid;gap:28px;align-items:start}
    .desktop{grid-template-columns:1fr 1fr}.responsive{grid-template-columns:768px 390px 390px 390px;justify-content:space-between}
    .pair{grid-template-columns:1fr 1fr}.pair.phones{grid-template-columns:repeat(4,390px);justify-content:space-between}
    figure{margin:0;min-width:0}figcaption{font-size:15px;margin-bottom:10px;color:#b7c6ca}figcaption b{color:#55d6cf;font-weight:600;margin-right:8px}
    img{display:block;width:100%;height:auto;border:1px solid #2c4553;border-radius:4px}`
  const desktop = await figures([
    ['Overview · 1440 × 900', 'desktop/dashboard.png'],
    ['Overview · 1280 × 800', 'laptop/dashboard.png'],
    ['Relationship diagram · 1440 × 900', 'desktop/relationship-diagram.png'],
    ['Inventory · 1440 × 900', 'desktop/inventory-search.png'],
    ['Security findings · 1440 × 900', 'desktop/security-findings.png'],
    ['Asset details · 1440 × 900', 'desktop/asset-details.png'],
  ])
  const responsive = await figures([
    ['Tablet · 768 × 1024', 'tablet/dashboard.png'],
    ['Mobile overview · 390px, full page', 'mobile/dashboard-full.png'],
    ['Mobile inventory · 390px, search results', 'mobile/inventory-search.png'],
    ['Mobile editor · 390 × 844', 'mobile/edit-asset.png'],
  ])
  await sheet.setContent(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Asset Security Dashboard visual review</title><style>${sheetStyle}</style>
    <h1>Asset Security Dashboard</h1><p>Visual review · Actual ${engine} captures · Fictional demo devices · Fixed review date: 11 November 2026</p>
    <section class="desktop">${desktop.join('')}</section><h2>Responsive working surfaces</h2><section class="responsive">${responsive.join('')}</section></html>`)
  await sheet.evaluate(() => Promise.all(Array.from(document.images, image => image.decode())))
  assert.equal(await sheet.evaluate(() => document.documentElement.scrollWidth), 2400)
  await sheet.screenshot({ path: path.join(output, 'visual-review.png'), fullPage: true, animations: 'disabled' })

  // Before-and-after sheet against the previous design's stored captures.
  const previous = process.env.ASSET_QA_PREVIOUS ? path.resolve(process.env.ASSET_QA_PREVIOUS) : path.join(root, 'docs/verification/redesign/chromium')
  const reviewTitle = process.env.ASSET_QA_REVIEW_TITLE || 'Asset Security Dashboard · application redesign'
  const comparison = async (label, file, afterFile = file) => {
    try { await fs.access(path.join(previous, file)) } catch { return '' }
    return `<figure><figcaption><b>Before</b>${label}</figcaption><img alt="Before: ${label}" src="${await image(path.join(previous, file))}"></figure>
      <figure><figcaption><b>After</b>${label}</figcaption><img alt="After: ${label}" src="${await image(path.join(output, afterFile))}"></figure>`
  }
  const pairs = (await Promise.all([
    comparison('Overview · 1440 × 900', 'desktop/dashboard.png'),
    comparison('Inventory · 1440 × 900', 'desktop/inventory.png'),
    comparison('Security findings · 1440 × 900', 'desktop/security-findings.png'),
    comparison('Asset details · 1440 × 900', 'desktop/asset-details.png'),
    comparison('Overview · 1280 × 800', 'laptop/dashboard.png'),
    comparison('Overview · 768 × 1024', 'tablet/dashboard.png'),
  ])).join('')
  const phones = (await Promise.all([
    comparison('Mobile overview · 390 × 844', 'mobile/dashboard.png'),
    comparison('Mobile inventory · 390 × 844', 'mobile/inventory.png'),
  ])).join('')
  if (pairs && engine === 'chromium' && !liveUrl) {
    const added = await figures([
      ['Relationship diagram with a selected finding category', 'desktop/relationship-diagram.png'],
      ['Relationship diagram on a phone (vertical trace)', 'mobile/relationship-diagram.png'],
    ])
    await sheet.setContent(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Application before and after</title><style>${sheetStyle}
      .added{grid-template-columns:1440px 390px;justify-content:start}</style>
      <h1>${reviewTitle}</h1><p>Before and after · Actual Chromium captures of the same fictional demo data · Fixed review date: 11 November 2026</p>
      <section class="pair">${pairs}</section><h2>Phone layouts</h2><section class="pair phones">${phones}</section>
      <h2>The core motif: how records become findings</h2><section class="added">${added.join('')}</section></html>`)
    await sheet.evaluate(() => Promise.all(Array.from(document.images, image => image.decode())))
    await sheet.screenshot({ path: destinations.comparison, fullPage: true, animations: 'disabled' })
  }
  if (updateGallery) {
    assert.equal(engine, 'chromium', 'Use the Chromium captures for the documentation gallery')
    const gallery = destinations.gallery
    if (pairs && !liveUrl) await fs.copyFile(destinations.comparison, destinations.publishedComparison)
    const files = {
      'dashboard-desktop.png': 'desktop/dashboard.png',
      'dashboard-laptop.png': 'laptop/dashboard.png',
      'inventory-desktop.png': 'desktop/inventory-search.png',
      'asset-details.png': 'desktop/asset-details.png',
      'security-findings.png': 'desktop/security-findings.png',
      'edit-asset-desktop.png': 'desktop/edit-asset.png',
      'dashboard-tablet.png': 'tablet/dashboard.png',
      'dashboard-mobile.png': 'mobile/dashboard-full.png',
      'inventory-mobile.png': 'mobile/inventory-search.png',
      'relationship-diagram.png': 'desktop/relationship-diagram.png',
      'edit-asset-mobile.png': 'mobile/edit-asset.png',
      'visual-review.png': 'visual-review.png',
    }
    await fs.mkdir(gallery, { recursive: true })
    for (const [name, file] of Object.entries(files)) {
      await fs.copyFile(path.join(output, file), path.join(gallery, name))
      report.gallery[name] = createHash('sha256').update(await fs.readFile(path.join(gallery, name))).digest('hex')
    }
    const archive = path.join(output, 'asset-security-dashboard-screenshots.zip')
    await fs.rm(archive, { force: true })
    execFileSync('/usr/bin/zip', ['-q', '-X', archive, ...Object.keys(files)], { cwd: gallery })
    execFileSync('/usr/bin/unzip', ['-t', archive], { stdio: 'pipe' })
    await fs.copyFile(archive, path.join(gallery, path.basename(archive)))
    console.log('Updated gallery, visual-review.png, and verified ZIP (' + Object.keys(files).length + ' PNGs).')
  }
  report.status = 'passed'
  console.log(engine + ': all browser checks passed. Captures: ' + output)
} catch (error) {
  report.status = 'failed'
  report.errors.push(error.stack || String(error))
  console.error(error)
  process.exitCode = 1
} finally {
  await browser?.close()
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(report, null, 2) + '\n')
}
