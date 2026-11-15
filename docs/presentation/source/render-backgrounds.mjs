// Renders the slide background plate from the application's surface tokens: graphite, a faint blueprint grid,
// and fine grain. Everything is low opacity so text contrast is unchanged. No corner marks or other decoration.
// Run from the repository root:  node docs/presentation/source/render-backgrounds.mjs
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(here, '../../../package.json'))
const { chromium } = require('playwright')
const output = path.join(here, '../media/Slide_Background.png')

const grain = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .78 0 0 0 0 .84 0 0 0 0 .8 .2 0 0 0 -.06'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")"
const grid = 'rgb(150 182 174 / .05)'
// The CSS lives in a <style> block: the grain is a data URI with quotes that cannot sit inside a style attribute.
const html = `<!doctype html><html><head><style>
  body { margin: 0; }
  .plate { position: relative; width: 1920px; height: 1080px; background: ${grain},
    linear-gradient(${grid} 1px, transparent 1px) 0 0 / 48px 48px,
    linear-gradient(90deg, ${grid} 1px, transparent 1px) 0 0 / 48px 48px, #0d1113; }
</style></head><body><div class="plate"></div></body></html>`

const browser = await chromium.launch({ chromiumSandbox: true })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
await page.setContent(html)
await page.screenshot({ path: output })
await browser.close()
console.log('Wrote', path.relative(process.cwd(), output))
