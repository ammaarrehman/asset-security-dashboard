// Builds the capstone deck (v2). Run from docs/presentation/source: npm install && npm run build
// Text, tables, and the process graphic are native PowerPoint objects so the deck stays editable.
// Six slides, each built around one subject, with the words the presenter says printed on the slide.
// No running footer, slide numbers, numbered labels, or decorative frames: the layout changes with the content.
// Timing comes from presentation-story.json: about 3:30 including the preferred 73-second demo.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'
import jsQR from 'jsqr'
import { PNG } from 'pngjs'
import pptxgen from 'pptxgenjs'
import QRCode from 'qrcode'
import { createHash } from 'node:crypto'
import { assertUniqueDrawingIds } from './drawing-ids.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const kit = path.join(here, '..')
const media = (name) => path.join(kit, 'media', name)
const icon = (name) => media(path.join('icons', name + '.png'))
const poster = async (name) => 'image/png;base64,' + await fs.readFile(media(name), 'base64')
const output = path.join(kit, 'Asset_Security_Dashboard_CRC_Capstone_v2.pptx')
const liveUrl = 'https://ammaarrehman.github.io/asset-security-dashboard/'
const githubUrl = 'https://github.com/ammaarrehman/asset-security-dashboard'
// Preserve the owner's newer Wednesday narration independently of visible text.
const preparedNotes = JSON.parse(await fs.readFile(path.join(here, 'prepared-notes.json'), 'utf8'))
if (preparedNotes.slides.length !== 6 || preparedNotes.slides.some((note, i) => note.slide !== i + 1)) throw new Error('Expected six ordered prepared notes')
const story = JSON.parse(await fs.readFile(path.join(here, 'presentation-story.json'), 'utf8'))
const demoCues = JSON.parse(await fs.readFile(path.join(here, 'demo-cues.json'), 'utf8'))
if (createHash('sha256').update(await fs.readFile(path.join(kit, demoCues.videoPath))).digest('hex') !== demoCues.videoSha256) {
  throw new Error('The demo video changed. Reinspect its timestamps before rebuilding the deck.')
}

if (createHash('sha256').update(await fs.readFile(path.join(kit, demoCues.archivePath))).digest('hex') !== demoCues.archiveSha256) {
  throw new Error('The archived original recording changed.')
}

// The application's tokens: graphite surfaces, restrained teal for clear/selected, amber for recorded gaps.
const C = { bg: '0D1113', deep: '090C0E', panel: '12171A', line: '33403F', text: 'E4E7E1', text2: 'B3BAB5', text3: '8E9894',
  cyan: '7DB8AD', amber: 'D8AA64' }
// Default fonts ship with macOS, so the deck opens correctly in Keynote or PowerPoint for Mac with nothing to install.
// DECK_FONTS=plex switches to the application's IBM Plex Sans (bundled in ../fonts; install it first).
const SANS = process.env.DECK_FONTS === 'plex' ? 'IBM Plex Sans' : 'Helvetica Neue'
const W = 13.333
const H = 7.5
const M = 0.8 // left margin
const R = W - M // right edge of the text area
const READ = 24 // size of the read-aloud sentences

// The QR code is generated here and decoded again before it is placed on a slide.
const qrFile = path.join(kit, 'Live_Demo_QR_v2.png')
await QRCode.toFile(qrFile, liveUrl, { errorCorrectionLevel: 'M', margin: 3, scale: 12, color: { dark: '#0D1113', light: '#FFFFFF' } })
const qrImage = PNG.sync.read(await fs.readFile(qrFile))
const decoded = jsQR(new Uint8ClampedArray(qrImage.data), qrImage.width, qrImage.height)?.data
if (decoded !== liveUrl) throw new Error('QR code does not decode to the live demo URL: ' + decoded)

const pres = new pptxgen()
pres.layout = 'LAYOUT_WIDE'
pres.author = 'Ammaar Rehman'
pres.title = 'Asset Security Dashboard'
pres.subject = 'Cyber Ready Clinic capstone'
pres.theme = { headFontFace: SANS, bodyFontFace: SANS }

const titlePlaceholder = (size, y, h) => ({ placeholder: { options: { name: 'title', type: 'title', x: M, y, w: R - M, h, margin: 0,
  fontFace: SANS, fontSize: size, bold: true, color: C.text, align: 'left', valign: 'top' }, text: '' } })
// The cover gets a larger title. Keynote ignores per-slide size overrides on a title placeholder, so it is its own layout.
pres.defineSlideMaster({
  title: 'COVER',
  background: { color: C.bg },
  objects: [
    { image: { path: media('Slide_Background.png'), x: 0, y: 0, w: W, h: H, altText: 'Background texture' } },
    titlePlaceholder(60, 0.6, 1.0),
  ],
})
pres.defineSlideMaster({
  title: 'PLAIN',
  // Graphite with a faint blueprint grid and grain (render-backgrounds.mjs). Nothing else repeats from slide to slide.
  // Keynote ignores a layout's background picture, so the plate is a full-bleed image on top of a solid fill.
  background: { color: C.bg },
  objects: [
    { image: { path: media('Slide_Background.png'), x: 0, y: 0, w: W, h: H, altText: 'Background texture' } },
    // A real title placeholder, so every slide keeps its title in the outline and for screen readers.
    titlePlaceholder(40, 0.6, 0.85),
  ],
})

const text = (slide, value, options) => slide.addText(value, { isTextBox: true, margin: 0, fontFace: SANS, color: C.text, valign: 'top', ...options })
const title = (slide, value, options = {}) => slide.addText(value, { placeholder: 'title', ...options })
// The sentences the presenter reads aloud: one paragraph each, large, high contrast.
function script(slide, sentences, box, size = READ) {
  text(slide, sentences.map((value, i) => ({ text: value, options: { breakLine: i < sentences.length - 1, paraSpaceAfter: 16 } })),
    { ...box, fontSize: size, lineSpacingMultiple: 1.08, objectName: 'Read-aloud text' })
}
// A screenshot shown at a crop of its real pixels. `crop` is in source pixels: [x, y, w, h] of a sourceW-wide image.
function shot(slide, file, box, [cx, cy, cw, ch], altText) {
  const scale = box.w / cw
  slide.addImage({ path: media(file), x: box.x, y: box.y, w: 1440 * scale, h: 900 * scale,
    sizing: { type: 'crop', x: cx * scale, y: cy * scale, w: box.w, h: ch * scale }, altText })
  return { ...box, h: ch * scale }
}
const hairline = (slide, box) => slide.addShape(pres.ShapeType.rect, { ...box, fill: { type: 'none' }, line: { color: C.line, width: 1 } })
const iconImage = (slide, name, x, y, size, altText) => slide.addImage({ path: icon(name), x, y, w: size, h: size, altText })
const newSlide = (masterName = 'PLAIN') => pres.addSlide({ masterName })

// 1. Cover: who I am, what I built, and the real overview filling the lower half.
{
  const slide = newSlide('COVER')
  title(slide, 'Asset Security Dashboard')
  const say = story.slides[0].say
  script(slide, say, { x: M, y: 1.8, w: 10.6, h: 1.55 })
  // The top of the real overview, at 1.25x, running off the right and bottom edges of the slide.
  const sy = 3.6
  const box = shot(slide, 'Demo_Step_1.png', { x: M, y: sy, w: W - M }, [0, 0, 1440, (H - sy) * 1440 / (W - M)],
    'Screenshot of the dashboard overview: 18 fictional devices, 9 healthy, 6 needing attention, 3 unknown')
  hairline(slide, { ...box, w: box.w + 0.1, h: box.h + 0.1 })
  slide.addNotes(preparedNotes.slides[0].notes)
}

// 2. Why: a plain device list where some answers are blank or unsure. No highlighting; the gaps are the point.
{
  const slide = newSlide()
  title(slide, 'Why I decided to build this')
  const rows = [
    ['Finance Desktop 01', 'Up to date', 'Installed', 'Weekly'],
    ['Outreach Laptop 03', 'Overdue', 'Installed', 'Weekly'],
    ['Volunteer Tablet 02', '?', '', ''],
    ['Intake Laptop 01', 'Up to date', 'Not installed', 'Off'],
    ['Reception Desktop', 'Up to date', 'Installed', 'Weekly'],
    ['Warehouse Laptop 01', '', 'Installed', 'Not sure'],
  ]
  const ty = 1.85, rh = 0.62, tw = 7.4
  const cols = [[0, 2.95], [3.0, 1.4], [4.45, 1.65], [6.15, 1.25]]
  ;['Device', 'Updates', 'Protection', 'Backups'].forEach((value, c) =>
    text(slide, value, { x: M + cols[c][0], y: ty, w: cols[c][1], h: rh, fontSize: 17, bold: true, color: C.text3, valign: 'middle' }))
  rows.forEach((row, r) => {
    const y = ty + rh * (r + 1)
    slide.addShape(pres.ShapeType.line, { x: M, y, w: tw, h: 0, line: { color: C.line, width: 0.75 } })
    row.forEach((value, c) => value && text(slide, value, { x: M + cols[c][0], y, w: cols[c][1], h: rh, fontSize: 19, bold: c === 0, color: c === 0 ? C.text : C.text2, valign: 'middle' }))
  })
  slide.addShape(pres.ShapeType.line, { x: M, y: ty + rh * (rows.length + 1), w: tw, h: 0, line: { color: C.line, width: 0.75 } })
  const say = story.slides[1].say
  script(slide, say, { x: 8.7, y: 1.95, w: R - 8.7, h: 4.6 })
  slide.addNotes(preparedNotes.slides[1].notes)
}

// 3. What it does: one process, drawn large across the slide.
{
  const slide = newSlide()
  title(slide, 'What my dashboard does')
  const say = story.slides[2].say
  script(slide, say, { x: M, y: 1.85, w: R - M, h: 1.9 })
  const steps = [
    ['Laptop', 'Your devices', C.line],
    ['ShieldCheck', 'Updates, protection, and backups', C.line],
    ['TriangleAlert', 'Gaps get highlighted', C.amber],
    ['ListChecks', 'What to check next', C.cyan],
  ]
  const d = 1.35, cy = 4.35, span = (R - M) / steps.length
  steps.forEach(([name, label, ring], i) => {
    const cx = M + span * (i + 0.5)
    slide.addShape(pres.ShapeType.ellipse, { x: cx - d / 2, y: cy, w: d, h: d, fill: { color: C.panel }, line: { color: ring, width: 1.5 }, objectName: label })
    iconImage(slide, name, cx - 0.33, cy + d / 2 - 0.33, 0.66, label)
    text(slide, label, { x: cx - span / 2 + 0.1, y: cy + d + 0.22, w: span - 0.2, h: 0.85, fontSize: 20, align: 'center', color: i === 3 ? C.cyan : C.text })
    if (i < steps.length - 1) slide.addShape(pres.ShapeType.line, { x: cx + d / 2 + 0.18, y: cy + d / 2, w: span - d - 0.36, h: 0,
      line: { color: C.text3, width: 1.5, endArrowType: 'triangle' }, objectName: 'Arrow' })
  })
  slide.addNotes(preparedNotes.slides[2].notes)
}

// 4. Example: the same record before and after, from the real app, large enough to read.
{
  const slide = newSlide()
  title(slide, 'Here’s an example')
  const say = story.slides[3].say
  script(slide, say, { x: M, y: 1.65, w: R - M, h: 1.3 }, 22)
  // The real Patch status field and status line, captured at 3x by capture-status-fields.mjs from the same steps as the demo.
  // The field is shown at about 3.4x and the status line at 2x, so "Overdue" and "Up to date" read from the back of a room.
  const gap = 0.9, w = (R - M - gap) / 2, y = 3.85
  const fieldH = w * 216 / 690, lineY = y + fieldH + 0.3, linePx = 2 / 3 / 144 // 2 CSS px per source pixel trio, in inches
  const side = (x, stage, word, rest, color, lineW, altField, altLine) => {
    text(slide, [
      { text: word, options: { bold: true, color } },
      { text: '   ' + rest, options: { color: C.text2 } },
    ], { x, y: y - 0.62, w, h: 0.42, fontSize: 22, valign: 'bottom', objectName: word + ' label' })
    slide.addImage({ path: media(`Status_${stage}_Patch.png`), x, y, w, h: fieldH, altText: altField })
    slide.addImage({ path: media(`Status_${stage}_Summary.png`), x, y: lineY, w: lineW * linePx, h: 120 * linePx, altText: altLine })
  }
  side(M, 'Before', 'Before', 'Patches overdue', C.amber, 942, 'Screenshot: Patch status Overdue', 'Screenshot: Needs attention, 1 finding from this record')
  side(M + w + gap, 'After', 'After', 'Patches up to date', C.cyan, 816, 'Screenshot: Patch status Up to date', 'Screenshot: Healthy, 0 findings from this record')
  iconImage(slide, 'ArrowRight', M + w + gap / 2 - 0.22, y + fieldH / 2 - 0.22, 0.44, 'Arrow from before to after')
  slide.addNotes(preparedNotes.slides[3].notes)
}

// 5. Demo: the recorded video is the slide.
{
  const slide = newSlide()
  title(slide, 'Let me show you')
  const say = story.slides[4].say
  const video = { h: 5.45 }
  video.w = video.h * 16 / 9; video.x = (W - video.w) / 2; video.y = 1.75
  slide.addMedia({ type: 'video', path: path.join(kit, demoCues.videoPath), cover: await poster('Demo_Recording_Poster.png'), ...video, objectName: 'Recorded demo, 73 seconds (video, opening frame as still image)' })
  // PptxGenJS 4 uses mediaRid + 2 for the movie drawing ID, but object index + 2
  // for text. Emit this first relationship-bearing object immediately after the
  // title, so both allocation sequences agree (movie 3, introduction 4). Putting
  // the introduction before the movie gave both objects ID 3. Geometry is unchanged.
  text(slide, say.map((value, i) => ({ text: value, options: { breakLine: i < say.length - 1 } })),
    { x: 5.75, y: 0.55, w: R - 5.75, h: 0.95, fontSize: 19, color: C.text2, lineSpacingMultiple: 1.15, valign: 'middle', objectName: 'Read-aloud text' })
  hairline(slide, video)
  slide.addNotes(preparedNotes.slides[4].notes)
}

// 6. Keep the conclusion and thanks; links sit beside the existing demo QR.
{
  const slide = newSlide()
  title(slide, 'What I took away from this')
  const say = story.slides[5].say
  script(slide, say, { x: M, y: 1.9, w: 8.9, h: 3.2 }, 28)
  text(slide, 'Thank you.', { x: M, y: 5.55, w: 6, h: 0.9, fontSize: 48, bold: true, color: C.cyan, objectName: 'Thank you' })
  for (const [label, url, y] of [['LIVE DEMO', liveUrl, 5.12], ['GITHUB SOURCE', githubUrl, 6.02]]) {
    text(slide, label, { x: 4.65, y, w: 6.4, h: 0.30, fontSize: 18, bold: true, color: C.cyan,
      hyperlink: { url }, objectName: label + ' link' })
    text(slide, url.replace('https://', ''), { x: 4.65, y: y + 0.34, w: 6.4, h: 0.38, fontSize: 18, color: C.text2,
      hyperlink: { url }, objectName: label + ' URL' })
  }
  const qs = 1.25, qx = R - qs, qy = 5.35
  text(slide, 'Try it yourself', { x: qx - 1.0, y: qy - 0.48, w: qs + 1.0, h: 0.36, fontSize: 16, color: C.text2, align: 'right' })
  slide.addImage({ path: qrFile, x: qx, y: qy, w: qs, h: qs, altText: 'QR code linking to the live demo at ' + liveUrl })
  slide.addNotes(preparedNotes.slides[5].notes)
}

// A plain fade between slides. pptxgenjs has no transition option, so the standard element is added afterwards.
// Validate in memory before replacing the delivered file, so an ID regression
// cannot leave a broken draft at the final PowerPoint path.
const zip = await JSZip.loadAsync(await pres.write({ outputType: 'nodebuffer' }))
// Keynote uses theme link colors even when a run specifies its own fill.
// Keep both unvisited and visited links in the existing muted teal palette.
for (const name of Object.keys(zip.files).filter((file) => /^ppt\/theme\/theme\d+\.xml$/.test(file))) {
  const xml = await zip.file(name).async('string')
  zip.file(name, xml.replace(/(<a:(?:hlink|folHlink)><a:srgbClr val=")[^"]+/g, '$1' + C.cyan))
}
for (const name of Object.keys(zip.files).filter((file) => /^ppt\/slides\/slide\d+\.xml$/.test(file))) {
  const xml = await zip.file(name).async('string')
  assertUniqueDrawingIds(xml, name)
  if (!xml.includes('<p:transition')) zip.file(name, xml.replace('</p:clrMapOvr>', '</p:clrMapOvr><p:transition spd="med"><p:fade/></p:transition>'))
}
// Repack without folder entries, which some cloud services fail to open.
const packed = new JSZip()
for (const [name, entry] of Object.entries(zip.files)) if (!entry.dir) packed.file(name, await entry.async('nodebuffer'), { createFolders: false })
for (const [name, entry] of Object.entries(packed.files)) {
  if (/\.(xml|rels)$/.test(name) && (await entry.async('string')).includes(kit)) throw new Error('Local file path written into ' + name)
}
await fs.writeFile(output, await packed.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }))
console.log('Wrote', path.relative(kit, output), '· QR decodes to', decoded)
