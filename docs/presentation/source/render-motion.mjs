// Renders docs/presentation/source/motion.html to PNG frames and final-state stills, then encodes each clip to
// H.264 MP4 with encode-frames.swift (macOS AVFoundation).  usage: node render-motion.mjs <framesDir>   (uses the repository's Playwright)
import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(here, '../../../package.json'))
const { chromium } = require('playwright')
const frames = process.argv[2]
const fps = 30
const scenes = { trace: [1280, 860, 'Trace_Diagram'], status: [1600, 560, 'Status_Change'] }
const browser = await chromium.launch()
for (const [scene, [width, height, name]] of Object.entries(scenes)) {
  const page = await browser.newPage({ viewport: { width, height } })
  await page.goto(pathToFileURL(path.join(here, 'motion.html')).href + '?scene=' + scene)
  await page.evaluate(() => document.fonts.ready)
  const duration = await page.evaluate(() => window.duration)
  const dir = path.join(frames, scene)
  await fs.rm(dir, { recursive: true, force: true }); await fs.mkdir(dir, { recursive: true })
  const total = Math.round(duration * fps)
  for (let frame = 0; frame <= total; frame++) {
    await page.evaluate(t => window.seek(t), frame / fps)
    await page.screenshot({ path: path.join(dir, String(frame).padStart(4, '0') + '.png') })
  }
  await fs.copyFile(path.join(dir, String(total).padStart(4, '0') + '.png'), path.join(here, '../media', name + '_Static.png'))
  console.log(scene, total + 1, 'frames')
  // Frames are evenly spaced, so their timestamps are simply frame / fps.
  await fs.writeFile(path.join(dir, 'frames.json'), JSON.stringify(Array.from({ length: total + 1 }, (_, frame) => ({ file: String(frame).padStart(4, '0') + '.png', t: frame / fps }))))
  execFileSync('swift', ['-suppress-warnings', path.join(here, 'encode-frames.swift'), dir, path.join(here, '../media', name + '.mp4'), String(fps)], { stdio: 'inherit' })
  await page.close()
}
await browser.close()
