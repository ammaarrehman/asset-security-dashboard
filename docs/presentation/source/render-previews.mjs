// Builds the review sheets from rendered slides and demo captures (run render-slides.sh, demo-walkthrough.mjs, and record-demo.mjs first).
// usage (from the repository root): node docs/presentation/source/render-previews.mjs [previousSlidesDir] [beforeLabel]
//   - docs/presentation/Slides_Preview_v2.png                    all six slides
//   - docs/verification/visual-overhaul/demo-walkthrough.png     the live demo, step by step, from real captures
//   - docs/verification/visual-overhaul/slides-review.png        previous v2 beside revised v2, plus motion and demo-video frames (needs previousSlidesDir)
import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const kit = path.join(here, '..')
const review = path.join(kit, '../verification/visual-overhaul')
const require = createRequire(path.join(kit, '../../package.json'))
const { chromium } = require('playwright')
const previous = process.argv[2] && path.resolve(process.argv[2])
const beforeLabel = process.argv[3] || 'the previous render'
const url = (file) => pathToFileURL(file).href
const story = JSON.parse(await fs.readFile(path.join(here, 'presentation-story.json'), 'utf8'))
const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
const titles = ['Introduction', 'Why I built it', 'What it does', 'Example', 'Demo', 'What I took away']
  .map((label, index) => `${label} · ${index === 4 ? clock(story.slides[index].durationSeconds) + ' with the 73 s video' : story.slides[index].durationSeconds + ' s'}`)
const slide = (n) => path.join(kit, 'slides', `Slide_0${n}.png`)

const page = (body, width) => `<!doctype html><meta charset="utf-8"><style>
  @font-face { font-family: Plex; font-weight: 400; src: url("${url(path.join(kit, 'fonts/IBMPlexSans-Regular.ttf'))}"); }
  @font-face { font-family: Plex; font-weight: 700; src: url("${url(path.join(kit, 'fonts/IBMPlexSans-Bold.ttf'))}"); }
  @font-face { font-family: PlexMono; src: url("${url(path.join(kit, 'fonts/IBMPlexMono-Regular.ttf'))}"); }
  body { margin: 0; width: ${width}px; background: #080d13; color: #eaf2f2; font-family: Plex, sans-serif; }
  main { padding: 44px; }
  h1 { font-size: 40px; margin: 0 0 8px; } h2 { font-size: 26px; margin: 40px 0 16px; }
  p.sub { color: #b7c6ca; font-size: 19px; margin: 0 0 28px; }
  .tiles { display: grid; gap: 28px 24px; }
  figure { margin: 0; } figcaption { font-size: 18px; color: #b7c6ca; margin-bottom: 10px; }
  figcaption b { font-family: PlexMono, monospace; color: #55d6cf; font-weight: 400; margin-right: 10px; }
  figcaption i { font-style: normal; color: #e9b66a; font-family: PlexMono, monospace; margin-right: 10px; }
  img { display: block; width: 100%; border: 1px solid #2c4553; }
</style><main>${body}</main>`

const browser = await chromium.launch({ chromiumSandbox: true })
async function sheet(html, width, file) {
  // Load from a file URL so the local slide images and fonts are allowed to load.
  const temp = path.join(os.tmpdir(), 'asd-preview-' + path.basename(file, '.png') + '.html')
  await fs.writeFile(temp, html)
  const tab = await browser.newPage({ viewport: { width, height: 800 } })
  await tab.goto(url(temp), { waitUntil: 'load' })
  await tab.evaluate(() => document.fonts.ready)
  await tab.screenshot({ path: file, fullPage: true })
  await tab.close()
  await fs.rm(temp)
  console.log('Wrote', path.relative(process.cwd(), file))
}

await sheet(page(`<h1>Asset Security Dashboard · capstone deck v2</h1>
  <p class="sub">Six slides, about 3 minutes 30 seconds · Keynote renders of the PowerPoint file · fictional demo data</p>
  <div class="tiles" style="grid-template-columns: repeat(3, 1fr)">${titles.map((t, i) => `<figure><figcaption><b>${i + 1}</b>${t}</figcaption><img src="${url(slide(i + 1))}"></figure>`).join('')}</div>`, 2400),
2400, path.join(kit, 'Slides_Preview_v2.png'))

const steps = [
  [1, 'Overview: 18 fictional devices, 13 findings'],
  [2, 'Inventory: search "Outreach" to find Outreach Laptop 03'],
  [3, 'Details: patch status Overdue, finding "Patches overdue"'],
  [4, 'Edit asset: set Patch status to Up to date'],
  [5, 'Saved: the laptop is Healthy, findings drop to 12'],
  [6, 'Details again: 0 findings from this record'],
]
if (process.env.PRESENTATION_WALKTHROUGH === '1') await sheet(page(`<h1>Live demo walkthrough</h1>
  <p class="sub">Real captures of the production build, made by demo-walkthrough.mjs, which also checks every count · fixed date 2026-11-11</p>
  <div class="tiles" style="grid-template-columns: repeat(2, 1fr)">${steps.map(([n, t]) => `<figure><figcaption><b>Step ${n}</b>${t}</figcaption><img src="${url(path.join(kit, 'media', `Demo_Step_${n}.png`))}"></figure>`).join('')}</div>`, 2400),
2400, path.join(review, 'demo-walkthrough.png'))

if (previous) {
  // Real frames from the recorded demo, pulled from the MP4 itself.
  const frames = await fs.mkdtemp(path.join(os.tmpdir(), 'asd-video-frames-'))
  const moments = [['0:01', 1, '18 fictional devices'], ['0:18', 18, 'Overdue laptop record'], ['0:35', 35, 'Patch status before the change'], ['0:38', 38.5, 'Patch status set to Up to date'], ['0:45', 45, 'Healthy result'], ['1:10', 70, 'Overview after the change']]
  execFileSync('swift', ['-suppress-warnings', path.join(here, 'video-frames.swift'), path.join(kit, 'story-review/Demo_Recording_73s.mp4'), frames, ...moments.map(([, t]) => String(t))], { stdio: 'ignore' })
  const frame = (t) => path.join(frames, `frame-${t.toFixed(2).padStart(6, '0')}.png`)
  const rows = titles.map((t, i) => `<figure><figcaption><i>Before</i>Slide ${i + 1}</figcaption><img src="${url(path.join(previous, `Slide_0${i + 1}.png`))}"></figure>
    <figure><figcaption><b>After</b>${t}</figcaption><img src="${url(slide(i + 1))}"></figure>`).join('')
  await sheet(page(`<h1>Asset Security Dashboard · deck v2, presentation design revision</h1>
    <p class="sub">Before: ${beforeLabel} · After: final natural wording and the preferred 73-second recording · approved layout, palette, texture, and screenshots preserved · both rendered in Keynote · the original deck is unchanged</p>
    <div class="tiles" style="grid-template-columns: repeat(2, 1fr)">${rows}</div>
    <h2>Recorded demo on slide 5 (Demo_Recording_73s.mp4, 73 s, 1920 × 1080, real browser session; key moments magnified for the projector)</h2>
    <div class="tiles" style="grid-template-columns: repeat(3, 1fr)">${moments.map(([at, t, label]) => `<figure><figcaption><b>${at}</b>${label}</figcaption><img src="${url(frame(t))}"></figure>`).join('')}</div>`, 2400),
  2400, path.join(review, 'slides-review.png'))
  await fs.rm(frames, { recursive: true, force: true })
}
await browser.close()
