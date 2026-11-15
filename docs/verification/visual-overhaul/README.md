# Visual overhaul design review

Status (2026-11-14): **application and slide design approved; final presentation checks complete and committed on the local `redesign/visual-overhaul` branch. Not merged, pushed, or deployed.** The public site and the original presentation are unchanged.

Review sheets: [application before and after](app-review.png) · [slides before and after, with motion and demo-video frames](slides-review.png) · [live demo walkthrough](demo-walkthrough.png)

## Visual system

One identity is shared by the application and the deck. After the operator console refinement (below) it is a technical field-manual look: graphite surfaces, a restrained teal, low-opacity texture, and the four-stage trace as the signature motif.

| Token | Value | Use | Contrast |
| --- | --- | --- | --- |
| Background | `#0D1113` (deep `#090C0E`) | Page and slide background | |
| Panel / surface | `#12171A` / `#192024` | Panels, nodes, table hover | |
| Primary text | `#E4E7E1` (secondary `#B3BAB5`, muted `#8E9894`) | Warm paper white and two quieter steps | muted text 5.55:1 or better on every surface |
| Signal teal | `#7DB8AD` | Clear state, selection, primary action | 7.1:1 on its tint, 8.0:1 on panels |
| Strong teal | `#A9DCD2` | Focus rings and true highlights only | 12.5:1 on the background |
| Warning amber | `#D8AA64` | Recorded gap | 7.5:1 on its tint |
| Slate | `#A3ADC0` | Unknown, needs verification | 7.3:1 on its tint |
| Coral | `#E08B80` | Destructive actions and errors only | 6.3:1 on its tint |
| Control border | `#6B7D84` | Inputs and secondary buttons | 4.2:1 or better (3:1 required) |

Surface treatments are tokens too: `--grain` (fractal-noise texture, about 5% opacity), `--blueprint` (28px grid at 4.5% opacity), `--dots` (14px dot grid), and `--hatch` (fine 135° hatching). Text always sits on a solid color underneath; the textures only add tone. State is always carried by an icon or glyph shape and a text label as well as color.

Type is IBM Plex Sans with IBM Plex Mono for technical metadata, section labels, and readout numerals. The fonts are bundled with the application (SIL Open Font License) and no external requests are made. The smallest text is 11.5px. The recurring motifs are the trace (`01 Assets ──▸ 02 Recorded controls ──▸ 03 Findings ──▸ 04 Next actions`) and a pair of reticle brackets on opposite corners.

## Operator console refinement (2026-11-13)

Owner feedback: the redesign still read as a generic, neon "cyber SaaS" template. Goal: more tactile, technical, and distinctive, like a real analysis workspace or a cyber field manual, without fake hacker effects or any loss of readability. The information architecture, components, and behavior are unchanged.

What changed and why:

- **Less neon.** The accent moved from saturated `#55D6CF` to a desaturated teal `#7DB8AD`; the brighter `#A9DCD2` is reserved for focus and true highlights. Surfaces moved from blue-black to graphite with a faint green cast, and text to a warmer paper white. Amber, slate, and coral were muted to match. Every pair was contrast-checked before use.
- **Texture and atmosphere.** The page has a faint blueprint grid and fine grain. Panels carry grain; the navigation rail and report headers carry fine hatching; chart panels sit on a dot-grid "instrument" surface. All of it is low opacity and behind solid colors, so readability is unchanged.
- **Varied panels instead of identical cards.** The status summary is an instrument readout (darker inset surface, monospace numerals, a ten-step scale under the bar). Priority follow-ups are a worksheet with a dashed margin rule after the line numbers. Charts are instrument panels with tick-marked tracks. The relationship diagram is the blueprint panel. Finding cards have hatched report-sheet headers with colored record numbers. The details dialog has a hatched header and a dot-grid inspection panel. Badges and tags are squared labels instead of pills.
- **Operator-style labels.** Section labels end in an ASCII rule (`INVESTIGATE NEXT ─────────`), drawn with CSS generated content that has empty alt text so screen readers skip it. Navigation items are indexed `01 / 02 / 03` like a manual's contents. Dividers inside forms, stage headers, and the footer are dashed.
- **The signature motif, used on purpose.** A new `TraceMark` component puts `01 Assets ──▸ 02 Recorded controls ──▸ 03 Findings ──▸ 04 Next actions` above every page title, lighting the stages that page is about: all four on Overview, Assets and Recorded controls on Inventory, Findings and Next actions on Security findings. It replaces the old eyebrow labels and repeats the page heading, so it is hidden from assistive technology. On phones, unlit stages shrink to their numbers.
- **Slides.** Same tokens; a background plate with grain, a faint blueprint grid, and corner registration marks (`render-backgrounds.mjs`); the trace motif in each slide's footer with that slide's stages lit; dashed field-manual frames around screenshots and videos; an ASCII rule on the "It does not" panel. Both motion graphics were re-rendered in the new palette, and the demo video and all slide screenshots were re-captured from the refined app.

Files changed in the application: `src/styles/*.css` (tokens and surface treatments), `src/components/Shared.tsx` (`TraceMark`), the three page components (use `TraceMark` instead of an eyebrow), and `public/favicon.svg` (palette). `scripts/verify-browser.mjs` gained `ASSET_QA_PREVIOUS` and `ASSET_QA_REVIEW_TITLE` so the before-and-after sheet can compare against any stored captures; `app-review.png` now compares the redesign as committed in `b9d345a` with the refinement.

Verification of the refinement: lint, strict TypeScript, all 43 unit tests, and the production build passed. `npm run qa:visual` passed at 1440×900, 1280×800, 768×1024, 390×844, and 320px: 70 layout checks with no page or table overflow, all workflows, keyboard and focus checks, and 46 axe scans with zero violations. The first run found the trace arrows at 1.76:1, then 4.42:1; they now use the muted text color (6.4:1) and the lowest measured text contrast anywhere is 6.08:1. Because the grain is a background image, axe now passes about 2,500 text nodes to the suite's own contrast review instead of about 60; each is measured against the solid color underneath. A phone capture caught the ASCII rule widening one-column layouts; the rule now contributes no intrinsic width. The reduced-motion report counts 34 "running" animations at the instant the heading appears; all have 0.01 ms durations, and a separate check found 0 running 50 ms later.

## Application changes

- **Navigation:** a left rail on desktop with a status readout (dataset, as-of date, storage), a top bar on tablets, and a bottom tab bar on phones. It is one navigation landmark in every layout.
- **Overview:** a status summary with one proportional bar, **Priority follow-ups**, findings by category split into recorded gaps and items to verify, and devices by type split by recorded status.
- **Priority follow-ups:** the top five devices with findings, each with its findings and the first recommended step. The order is a fixed sort (more recorded gaps, then more findings, then category order, then name) that is listed in the interface and covered by unit tests. It is not a risk score.
- **Relationship diagram:** assets, recorded controls, findings, and next actions. Lines between controls and findings are the seven rule paths in `security.ts`; lines from device types come from current findings. Selecting a finding category highlights its path and lists the rule, the affected devices, and the recommended follow-up. It is labeled as a diagram of the data model, not a network map or scan. On phones it becomes a vertical trace of the selected category.
- **Inventory:** aligned glyph columns for the three recorded controls, a segmented status filter with counts, a marker on review dates that produce a finding, and record cards on phones.
- **Security findings:** a category rail with counts and the method note, and one card per finding with the affected asset, the recorded field and value, the explanation, and the recommended remediation. Findings follow the same documented order as the overview.
- **Dialogs:** restyled; asset details show each recorded control with its state.

Not changed: validation, the findings rules, inventory operations, CSV import and export (including atomic imports and formula protection), storage, demo data, dependencies, and the GitHub Pages configuration. The overview's five-row inventory preview was replaced by Priority follow-ups; the full inventory is one click away.

## Motion

All motion is CSS or SVG, runs once, and uses transforms, opacity, or stroke offsets. No animation library was added.

- Diagram lines draw in the first time the diagram scrolls into view; a short pulse travels the selected path from device to finding to action when the selection changes.
- Status bar segments, chart bars, and counts transition when a record changes.
- Chart bars, follow-up rows, and finding cards reveal with a short stagger; pages and dialogs fade in.
- With `prefers-reduced-motion: reduce`, durations collapse to effectively zero, the pulse is removed, and the diagram is complete without scrolling. The browser suite measures this.

## Presentation changes

- New file `docs/presentation/Asset_Security_Dashboard_CRC_Capstone_v2.pptx`; the original deck, guide, preview, and QR are untouched.
- Six 16:9 slides. Text, the device list, the process diagram, and callouts are native editable objects. Screenshots are real captures of the redesigned application. Icons come from lucide, the icon set the application uses, and the footer carries the application's brand mark.
- Two original clips (H.264 MP4, about 8 seconds each, re-rendered in the refined palette by `render-motion.mjs`, which now also encodes them): the trace diagram on slide 3 and the recorded status change on slide 4. Each opens and ends on its finished frame, so slides are complete without playback. Slides use a plain fade transition.
- Speaker notes on every slide, a regenerated QR code that is decoded and compared with the live URL during the build, a PDF, per-slide images, and an offline package.

### 4:30 revision (2026-11-13)

Revised after the Week 9 Cyber Ready Clinic meeting: talks must stay under five minutes and explain why the project was made, why it matters, and how it works. [Before and after](slides-review.png).

- Six slides timed at 25, 40, 45, 40, 95, and 25 seconds (4:30). Each has a short title and two or three read-aloud sentences at 22 to 24 pt (titles 40 pt). Eyebrow labels, image captions, and the footer tagline were removed; the footer keeps only the brand mark and slide number.
- Story: the Discover 5 lesson ("an organization can't protect devices it doesn't know it has") leads to the problem, the solution, the Outreach Laptop 03 example, the demo, and the limits. No client names or client details appear anywhere; all data is fictional and the deck does not claim the prototype was used by a real organization.
- The trace diagram moved from slide 1 to slide 3, where it explains how records, controls, findings, and next actions connect. Slide 1 now shows the real overview. Slide 4 pairs the real record (before) with the status-change clip (after). Slide 6 states that the prototype does not scan devices, install patches, verify controls, or prove compliance.
- New recorded demo `docs/presentation/media/Demo_Recording.mp4` (94.0 s, 1920 × 1080, H.264, 30 fps) embedded on slide 5. It was recorded by `record-demo.mjs` from a real Chromium session driving the production build: Chromium's screencast frames, encoded with macOS AVFoundation (`encode-frames.swift`), since ffmpeg is not installed. The pointer is drawn in the page because headless browsers have no visible cursor; every click is a real mouse event. The native dropdown list for Patch status is not part of a screencast, so the value is selected programmatically while the pointer rests on the field; the change itself is real. The recording asserts the same counts as the walkthrough.
- `Presenter_Guide_v2.md` was rewritten for the 4:30 talk with demo cues keyed to video timestamps, an offline fallback plan, and a rehearsal checklist.
- One build setting changed in the application: `src/styles.css` now has `@source not "../docs"`. Tailwind scans the whole repository for class names, so words in the deck tooling (`ring`, `ease-out`, and earlier `border`, `transition`) were adding unused utilities to the app's CSS. With the exclusion, the CSS drops from 49.64 kB to 48.41 kB; the only removed rules (`.border`, `.collapse`, `.transform`, `.transition`) are not used by any component or `index.html`. Re-running the demo walkthrough produced captures identical to the earlier build except for one anti-aliased pixel that also varies between two runs of the same build. Security rules, validation, CSV handling, storage, components, and demo data are unchanged. `npm run qa:visual` was not rerun.

## Verification performed

Application, production build served to Chromium 153 through local request interception, fixed date 2026-11-11:

- `npm run lint`, `npm run test` (43 tests in 4 files; 9 are new), and `npm run build` (includes `tsc --noEmit`) passed.
- `npm run qa:visual` passed at 1440×900, 1280×800, 768×1024, and 390×844, plus a 320px check: 70 layout checks with no page or table overflow, keyboard and focus checks, CRUD, filters, CSV preview, atomic rejection, formula-safe export and re-import, persistence, and reset.
- 46 axe scans (WCAG 2.0, 2.1, and 2.2 A/AA tags) reported zero violations. Axe left 63 text nodes as indeterminate contrast; their computed ratios are recorded in [results.json](chromium/results.json) and the lowest is 6.78:1.
- Reduced motion: longest animation and transition 0.00001 s, no running animations, diagram complete on load. No infinite animations exist with motion enabled.
- Screenshots at all four sizes were inspected, including the phone diagram, inventory cards, findings, details, and editor.

Presentation (4:30 revision, 2026-11-13):

- The PPTX passed Office Open XML schema and package validation. The build fails if a local file path is written into the package; every image has alt text.
- Keynote opened the PPTX and imported three movies (slides 3, 4, and 5) and speaker notes on all six slides. Every slide was exported from Keynote to PDF, rendered at 1920 × 1080, and inspected for clipping, overflow, overlap, alignment, and contrast. Fixes included a hyphen break on slide 1, a screenshot crop on slide 4, and the QR code touching the panel on slide 6.
- The video embedded on slide 5 is byte-identical to the standalone MP4. AVFoundation reads it as 94.00 s, 1920 × 1080, avc1, 30 fps. Frames at 1, 15, 40, 58, 66, and 93 seconds were extracted and inspected (shown in the review sheet).
- The recording session asserted: 18 total assets; Outreach Laptop 03 is Needs attention with a "Patches overdue" finding; after Up to date and Save changes, "Asset updated." appears, the row shows Healthy, the findings badge reads 12, the record shows 0 findings, and the overview shows Healthy 10 and Needs attention 5. No page errors.
- No em dashes in slide text or notes. The QR code decodes to `https://ammaarrehman.github.io/asset-security-dashboard/`.

## Final presentation checks (2026-11-14)

The owner approved the slide design. No redesign followed; these are the last fixes and checks.

**Slide 4 close-ups.** On a projector the earlier crops showed "Overdue" and "Up to date" at about 15 px. `source/capture-status-fields.mjs` now drives the production build through the demo's steps and asserts the data: Patch status Overdue with "Needs attention, 1 finding from this record", then the real edit form sets Up to date, and the reopened record shows Up to date with "Healthy, 0 findings from this record". It saves element screenshots of the Patch status field and the status line at 3× pixel density. Slide 4 shows the field at about 3.4× (the value is about 50 px tall at 1920 × 1080) and the status line at 2×. Nothing is drawn over the captures. The labels now read **Before  Patches overdue** and **After  Patches up to date**, in the existing amber and teal. The layout, wording, and palette are unchanged.

**Demo video readability.** On slide 5 the video plays at about 0.73× of its 1920 px width, so app text appeared at roughly 13 to 15 px and the Patch status change (a native select) was hard to read from a distance. `record-demo.mjs` now records the same real session at 2880 × 1620, and `encode-frames.swift` applies a zoom track in post, cropping and scaling the real frames with 0.8 s eased moves:

- the overdue record (1.5×);
- the Patch status field while it changes (1.5×);
- the Healthy row (1.4×), then a pan to "Security findings 12" (1.4×);
- the reopened record (1.5×);
- the overview at the end (1.25×).

At slide size, the key values now appear at about 20 to 25 px. The app's date is fixed to 2026-11-11, the same as every screenshot, which removes the earlier date mismatch. The video is 94.0 s, 1920 × 1080, H.264, 30 fps, and 34.5 MB. Frames at 0:00, 0:15, 0:30, 0:40, 0:55, 0:58, 0:59.5, 1:05, 1:09, 1:15, and 1:33.9 were inspected. Corrected after the independent audit: inventory about 0:31, search 0:34, record 0:39, edit 0:55, Up to date 0:59, Healthy and 12 at 1:03, overview 1:26, end 1:34. The recording is unchanged; the final notes and guide use these cues.

**Offline ZIP.** The committed ZIP (96.8 MB, then 99.2 MB) duplicated files already in the repository: the deck, which embeds the 34.5 MB video; the video again; slide PNGs that duplicate the PDF; unused media; and fonts the deck does not need. It is no longer tracked and is listed in `.gitignore`. `source/package-offline.mjs` (`npm run package`) builds it from the committed files: the deck, PDF, demo MP4, guide, preview, QR, and sample CSV. That is 7 files and 76.8 MB. The script checks that the video embedded in the deck is byte-identical to the standalone MP4, unpacks the ZIP into an empty folder, and compares every file. The deck and the standalone MP4 are intentionally both kept: the MP4 is the QuickTime fallback.

**Consistency and timing.** An automated comparison found the read-aloud text identical on each slide, in its speaker notes, and in the guide's "Say" lines for all six slides, and the five video cue times identical in the notes and the guide. Timing is unchanged: budgets total 4:35, and speech plus the 94.0 s video is about 3:13 at a slow 110 words per minute.

**Renders.** All six slides were re-rendered in Keynote at 1920 × 1080. Slides 1, 2, 3, and 6 are pixel-identical to the approved renders. Slide 4 changed as described. Slide 5 changed only in the video's still image, the new first frame with the 2026-11-11 date. The PPTX has 43 well-formed XML parts, no external relationships, no em dashes, and no local paths. Keynote imports speaker notes on all six slides and one movie, on slide 5.

## Slide design revision (2026-11-14, approved)

Owner feedback: the application is approved, but the slides still read as AI-generated. The problem was the patterns, not the palette: decorative 01/02/03 numbering, technical breadcrumbs, the four-stage footer on every slide, generic titles, tiny captions, the same text-left/image-right layout, too many framed boxes and diagram labels, and generated-sounding writing. [Before and after](slides-review.png) (before: the deck as committed in `60c797f`).

Kept: graphite and muted teal, the grain and blueprint texture, real screenshots, the recorded demo, six slides, read-aloud wording, and a talk under five minutes. The application was not touched.

Removed from every slide: the trace footer, slide numbers, the footer brand mark, the corner registration marks on the background plate, dashed frames with reticle brackets, monospace eyebrow-style labels, and callout boxes. Titles are now plain sentences in the presenter's voice. Each slide keeps a real title placeholder, so titles still appear in the outline and to screen readers.

| Slide | Before | After |
| --- | --- | --- |
| 1 | Text column left, framed screenshot right, footer | 60 pt title, two sentences, and the real overview at 1.25× running off the right and bottom edges |
| 2 | Device table in a panel, amber "3 problems" callout | A plain list of six fictional devices with blank, "?", and "Not sure" answers, next to the explanation. No highlighting; the gaps are the point |
| 3 | Dense relationship-diagram clip with numbered columns and small labels | One four-step graphic in native shapes: your devices, updates/protection/backups, gaps get highlighted, what to check next |
| 4 | Small screenshot plus a status-change clip with five numbered steps | The same record from the real app, before and after, at about 1× with large Before/After labels |
| 5 | Narrow text column beside a framed video | Title and the two sentences in one band, with the video centered and unframed below |
| 6 | Boxed "It does not" list | Two paragraphs at 28 pt, then "Thank you." The QR code stays, labeled "Try it yourself" |

Wording follows the owner's draft with small edits for rhythm. Slide 4's sentences were shortened so the before-and-after has room. No em dashes appear in the slides or notes.

Media: the two motion clips were removed from slides 3 and 4, because they carried the numbered steps, tiny captions, and boxes the owner asked to remove. Slide 3 now uses a native graphic and slide 4 real screenshots (`Demo_Step_3.png`, `Demo_Step_6.png`). The clip files stay in `media/`. The recorded demo is unchanged, and the copy embedded in the PPTX is byte-identical to `media/Demo_Recording.mp4`. Three lucide icons (Laptop, ShieldCheck, ListChecks) were added by `render-icons.mjs`; the existing icons are byte-identical.

Checks:

- All six slides rendered in Keynote at 1920 × 1080 and inspected one at a time. Fixed in rounds: the cover title size (Keynote ignores a per-slide size on a title placeholder, so the cover has its own layout), cover text touching the screenshot, a wrapped "Not sure" and "Warehouse Laptop 01", slide 4 text running into its labels, crop edges that cut through text, and slide 5's text crowding the title.
- Projector sizes: titles 40 pt (cover 60 pt), read-aloud text 22 to 28 pt (slide 5 19 pt, beside the video), table 19 pt, process labels 20 pt, and the smallest text "Try it yourself" at 16 pt. The screenshots on slides 1 and 4 are shown at 1.25× and about 1×.
- The PPTX has 43 well-formed XML parts and no external relationships. Keynote imports speaker notes on all six slides and one movie (slide 5).
- Timing: budgets 25 + 40 + 40 + 40 + 100 + 30 s = 4:35. Slide words are 28, 39, 32, 26, 17, and 40. At a slow 110 words per minute, speech plus the 94 s video is about 3:13.
- The offline ZIP was then 99.2 MB; see the final checks below for how it was reduced and taken out of the repository.
- `Slides_Preview_v2.png`, `slides-review.png`, the PDF, and `slides/` were regenerated; `demo-walkthrough.png` regenerated unchanged. `Presenter_Guide_v2.md` was rewritten for the new slides.

## Release-readiness checks (2026-11-14)

No redesign. Two small fixes, then the delivery checks.

**Inventory heading focus outline.** Each page's `h1` has `tabindex="-1"` and receives focus after navigation, so screen readers announce the new page. A probe of the production build showed:

| Engine | Mouse to Inventory | Keyboard (Tab, Enter) to Inventory |
| --- | --- | --- |
| Chromium 153 | `:focus-visible` false, no outline | `:focus-visible` true, browser default `outline: auto` on the full-width block |
| WebKit (Playwright) | `:focus-visible` false, no outline | not reached (WebKit does not tab to buttons by default) |

The outline in the screenshots was therefore the browser's default ring, drawn because the app's focus rule (`:where(button, a, …, [tabindex="0"])`) does not cover `tabindex="-1"`. The QA suite captured `inventory.png` right after its keyboard-navigation step. The recorded demo and the slide screenshots use real mouse clicks and never showed it.

Fix (`src/styles/shell.css`): the page heading is `width: fit-content`; `:focus` draws no outline; `:focus-visible` draws the app's own ring (2px `--signal-strong`, 6px offset). Keyboard users still see where focus went, as a ring that fits the heading text. Pointer navigation and script focus without keyboard use show nothing. `scripts/verify-browser.mjs` now:

- asserts `:focus-visible` false and `outline-style: none` after every mouse navigation;
- asserts the designed ring (solid, 2px, as wide as the text) after keyboard navigation and saves it as `<viewport>/keyboard-heading.png`;
- blurs the heading before the ordinary `inventory.png` capture.

**Slide 4.** On a projector the screenshot text that carried the point (Overdue, Up to date) was 11 to 14 px. Two native 20 pt labels now sit directly above the pictures: **BEFORE  Patches: Overdue** in amber and **AFTER  Patches: Up to date** in teal. The title, read-aloud sentences, layout, screenshot, clip, and timing are unchanged; the read-aloud box was shortened to its rendered height so it does not overlap the labels. The speaker note and guide point at the labels. Keynote renders of the other five slides are pixel-identical to the approved renders.

**Projector readability (Keynote renders at 1920 × 1080).** Titles are 40 pt (80 px), read-aloud text 22 to 24 pt (44 to 48 px), slide 4 labels 20 pt (40 px), and the footer trace 10 pt, which is decorative. Text colors on the graphite plate measure 6:1 or better. All six renders were inspected for clipping, overlap, and overflow.

**Timing.** Budgets: 25 + 40 + 45 + 40 + 95 + 25 s = 4:30. The demo is 94.0 s inside slide 5's 95 s, and the two slide 5 sentences are spoken over its opening. Speaking time of the slide text by word count:

| Slide | Words | at 130 wpm | at 110 wpm | Budget |
| --- | --- | --- | --- | --- |
| 1 | 36 | 17 s | 20 s | 25 s |
| 2 | 43 | 20 s | 24 s | 40 s |
| 3 | 32 | 15 s | 18 s | 45 s |
| 4 | 38 | 18 s | 21 s | 40 s |
| 5 | 15 | over the video | over the video | 95 s |
| 6 | 27, plus the box | 20 s | 22 s | 25 s |

Worst case (110 wpm, both optional 8 s clips, slide 5 sentences not overlapped): about 3:42 of speech and video, leaving more than a minute before 5:00 for pauses and pointing.

**Videos.** The three MP4s inside the PPTX are byte-identical to `media/Trace_Diagram.mp4` (7.8 s, 1280 × 860), `media/Status_Change.mp4` (8.0 s, 1600 × 560), and `media/Demo_Recording.mp4` (94.0 s, 1920 × 1080). All are H.264 at 30 fps, and AVFoundation decodes each through its final frame. Keynote (Creator Studio) opened the deck, reported one movie object each on slides 3, 4, and 5 (volume 100, no repeat), and started a slideshow from slide 3. Playback inside the slideshow could not be automated: Keynote's `show next` returns "No window" while a slideshow is playing, and synthetic key presses were stopped because a macOS permission dialog had keyboard focus. The exact manual check is in the [presenter guide](../../presentation/Presenter_Guide_v2.md#video-playback-check-once-on-the-computer-you-will-present-from).

**Offline.** The PPTX has no external relationships; the only URL is the QR code, which is for the audience's phones. Fonts are system fonts (Helvetica Neue, Menlo). The offline ZIP was rebuilt with the same 45 entries; unpacked into an empty folder, its deck, PDF, guide, slide images, and all three videos match the repository files byte for byte. The manual check in the guide is run with Wi-Fi off.

**Verification.** `npm run lint`, `npm run test` (43 tests), `npm run build`, and `npm run qa:visual` passed: four viewports plus 320px, 74 layout checks (70 plus the four `keyboard-heading` captures), all workflows, keyboard and focus checks, 46 axe scans with zero violations, reduced motion, and no page errors. Regenerated: the Chromium captures, `app-review.png` (against the `b9d345a` captures, as before), the README gallery and ZIP, the slide PNGs, the PDF, `Slides_Preview_v2.png`, and the offline ZIP. `demo-walkthrough.png` regenerated byte-identical. `slides-review.png` is kept as the record of the approved refinement; its "before" renders are not stored, so it was not regenerated. The current slide 4 is in `Slides_Preview_v2.png` and `slides/Slide_04.png`.

## Known limitations

- **PowerPoint itself was not available.** The deck was validated and opened and rendered in Keynote only. Keynote recognizes all three movies, but playback inside a running slideshow could not be automated in either app. Do the guide's video playback check, with Wi-Fi off, on the computer you will present from.
- The PPTX (38.5 MB) and the demo MP4 (34.5 MB) are each under GitHub's 50 MB per-file warning size. The offline ZIP is no longer committed, but the earlier 96.8 MB ZIP still exists in commit `60c797f` on this branch, so pushing the branch as is would upload it once. It is under the limit; squashing the branch before the first push would avoid it.
- The deck uses Helvetica Neue and Menlo so it needs no font installation on a Mac. On Windows, PowerPoint substitutes fonts and line breaks may shift. The IBM Plex variant of the deck was not render-checked.
- Videos play on click (one advance in Keynote). The demo video has no audio; the presenter narrates. They were not set to auto-play, to avoid hand-written timing XML that could not be tested in PowerPoint.
- Slide screenshots and the demo video show the redesigned application. The public demo and the QR code on slide 6 show the earlier design until this branch is approved and deployed. The live demo steps work in both designs.
- Only Chromium was exercised for the redesign. Safari, Firefox, physical phones, and screen readers were not tested. Automated scans are not a conformance certification.
- The README gallery in `docs/screenshots/` was regenerated on this branch; the stored captures of the earlier design remain in `docs/verification/redesign/`.
