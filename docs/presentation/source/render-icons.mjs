// Renders the deck's icons from lucide-react, the icon set the application itself uses, to transparent PNGs.
// Run from the repository root:  node docs/presentation/source/render-icons.mjs
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(here, '../../../package.json'))
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const icons = require('lucide-react')
const { chromium } = require('playwright')
const out = path.join(here, '../media/icons')
await fs.mkdir(out, { recursive: true })

const cyan = '#7db8ad', amber = '#d8aa64', text = '#e4e7e1', text2 = '#b3bab5' // the app's refined tokens
const wanted = {
  TriangleAlert: [amber], CircleX: [text2], ArrowRight: [cyan],
  // Slide 3's process graphic: devices, recorded protections, gaps, what to check next.
  Laptop: [text], ShieldCheck: [cyan], ListChecks: [cyan],
}
const browser = await chromium.launch({ chromiumSandbox: true })
const page = await browser.newPage({ viewport: { width: 256, height: 256 } })
for (const [name, [color]] of Object.entries(wanted)) {
  const svg = renderToStaticMarkup(React.createElement(icons[name], { size: 256, color, strokeWidth: 1.75 }))
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`)
  await page.locator('svg').screenshot({ path: path.join(out, name + '.png'), omitBackground: true })
}
// The application's brand mark (App.tsx), drawn with the same colors as the app header.
await page.setContent(`<html><body style="margin:0;background:transparent"><svg width="256" height="256" viewBox="0 0 32 32" fill="none" stroke-width="2" stroke-linecap="round">
  <path stroke="${text}" d="M3 10V5a2 2 0 0 1 2-2h5M22 3h5a2 2 0 0 1 2 2v5M29 22v5a2 2 0 0 1-2 2h-5M10 29H5a2 2 0 0 1-2-2v-5" />
  <path stroke="${cyan}" d="M16 8.5v3.5M16 20v3.5M8.5 16H12M20 16h3.5" /><circle fill="${cyan}" stroke="none" cx="16" cy="16" r="3" /></svg></body></html>`)
await page.locator('svg').screenshot({ path: path.join(out, 'BrandMark.png'), omitBackground: true })
await browser.close()
console.log('Rendered', Object.keys(wanted).length, 'icons to', path.relative(process.cwd(), out))
