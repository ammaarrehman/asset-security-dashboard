# Progress

Current release status (2026-11-14): **Targeted independent-audit remediation verified locally; publication awaits owner approval.** The redesigned application and v2 deck remain local. Public main and GitHub Pages still serve the earlier release. See the [remediation record](docs/verification/remediation/README.md) and [development dependency review](docs/dependency-review.md). Native PowerPoint playback and a timed human rehearsal remain manual checks. Earlier entries below are historical.

- M1 — Project configuration, visual system, 18 fictional devices, and the dashboard.
- M2 — Inventory operations, validation, and versioned browser storage with session-only fallback.
- M3 — Deterministic findings, strict CSV validation, and spreadsheet-safe export.
- M4 — README, sample CSV, presentation outline, and browser screenshots. Lint, 32 Vitest tests, strict TypeScript, and the production build passed. Chromium verified the core workflows, mobile layout, and keyboard focus. Automated accessibility checks reported no violations on eight tested screens and dialog states.

The sandbox denied localhost port binding. Vite development middleware served the app files in-process, and Chromium exercised the production build at the intended GitHub Pages base path.

## Release audit

- Fixed stale records reappearing after site storage was cleared, future review dates passing, lost focus after canceling asset dialogs, CSV round-trip failures at field limits, and locale-dependent test assertions.
- Chromium passed the regression checks, core workflows, and eight automated accessibility scans. Both README screenshots matched fresh captures.
- Public release is on hold. The pinned Vite and Vitest tooling has published advisories. Registry DNS failures blocked the clean install, audit, and patched install attempt. Update to Vite 7.3.8 and Vitest 4.1.12 or patched compatible versions, then verify the fresh lockfile and rerun the checks.

## Visual audit

- Inspected before-and-after Chromium captures at 1440×900, 1280×800, 768×1024, and 390×844. Reviewed the dashboard, inventory, findings, details, editor, CSV import, confirmations, and empty states.
- Moved tablet navigation above the content to show complete security badges, tightened the dashboard on shorter screens, and kept modal actions visible while long content scrolls.
- Saved eight reviewed screenshots in `docs/screenshots/`, updated the README gallery, and ran the 5½-minute presentation's demo sequence through the patch update, CSV import, and refresh.
- Lint, 34 tests, strict TypeScript, the production build, and browser regression checks passed. Registry DNS still blocked the dependency update. No Git or publication changes were made.

## Publication preparation

- Created and inspected `docs/screenshots/visual-review.png` from the eight real screenshots and packaged all nine PNGs in `docs/screenshots/asset-security-dashboard-screenshots.zip`.
- Repeated Chromium workflows and all four viewport checks. Existing screenshots matched new captures byte for byte. Lint, strict TypeScript, all 34 tests, and the production build passed on the existing dependencies.
- Prepared the repository description, topics, and an MIT license for owner review.
- Registry access still fails with `ENOTFOUND`. The approval mechanism rejected network escalation under `sandbox_approval: false`. Clean installation, dependency updates, and npm audit remain blocked.
- GitHub CLI lists the personal account as active and the company account as inactive. Authentication validation is blocked. Public release remains NO-GO.

## Release finalization — 2026-11-11

- Confirmed HTTPS npm registry access with `npm ping` and package metadata requests. Used a writable temporary npm cache after the default cache produced `EPERM`; TLS verification stayed enabled.
- Updated Vite from 7.3.6 to 7.3.8 and Vitest from 4.1.11 to 4.1.12 together in `package.json` and the npm-generated lockfile. All Vite consumers resolve to 7.3.8, and `@vitest/mocker` resolves to 4.1.12. Existing React and Tailwind plugin peer ranges support these versions.
- A clean `npm ci` with a separate fresh cache passed on Node 24.22.1 / npm 11.19.1. Verified the manifest matches the lockfile and all resolved tarballs use the HTTPS npm registry.
- `npm audit` reports seven moderate entries from the single minimatch glob-amplification advisory in the TypeScript ESLint chain, with zero high or critical findings. `npm audit --omit=dev` reports zero vulnerabilities. The affected optimization mode and attacker-controlled glob patterns are absent from this project's lint workflow; the advisory does not affect the static application. The latest TypeScript ESLint release still requires minimatch 10; retain the tested dependency range and track the upstream fix.
- `npm run lint`, `tsc --noEmit --strict`, all 34 tests in three files, and `npm run build` passed after the clean installation.
- Chromium 153.0.8010.12 and Playwright WebKit 26.6 passed core workflows and prior regressions against the actual production build served by Vite preview at `/asset-security-dashboard/`. Both engines passed eight accessibility scans with zero violations. macOS browser startup required approved host execution; no sandbox or TLS settings were disabled. Safari.app itself was not tested.
- Rechecked 1440×900, 1280×800, 768×1024, and 390×844 layouts, plus the 320px mobile smoke check. All eight published screenshots match fresh Chromium captures byte for byte using the original fixed capture date. Inspected the contact sheet and fresh mobile editor; verified the ZIP's nine PNGs and checksums.
- `gh auth status` and `gh api user` confirm active personal account `ammaarrehman`. Effective author and committer are `Ammaar Rehman <ammaar2rehman@gmail.com>`; the conditional work identity does not apply here.
- Reviewed repository metadata, MIT license, README links, screenshot bundle, Pages base path, and presentation outline. Updated release documentation. Application source, assets, configuration, README, and screenshots are unchanged. npm also warns that ESLint 9.39.5 is unsupported; a future tooling maintenance update remains advisable.
- No Git initialization, commits, repository creation, pushes, or deployment occurred. Publishing awaits the owner's explicit approval.

## Interface redesign — 2026-11-11

- Reviewed an external design reference read-only for typography, navigation, spacing, and responsive behavior. No reference-project files were changed or copied.
- Rebuilt the application shell around a compact text identity and top navigation. Replaced separate metric cards with a cohesive ruled strip; added editorial heading hierarchy, warm neutral surfaces, muted semantic colors, technical labels, and quieter table controls/statuses.
- Structured findings into category, affected device, recorded evidence, and action on a selective dark inspection surface. Updated asset details and grouped editor fields with semantic fieldsets, preserving dialog focus and validation behavior.
- No changes to schema/validation, findings, inventory operations, CSV/formula protection, storage hook, demo data, or Pages configuration; verified against prior release file hashes. Added no dependencies.
- Lint, strict TypeScript, all 34 tests, and production build passed. Static contrast checks passed for the primary text/status tokens; improved input boundaries to exceed 3:1. Browser accessibility scans remain pending.
- Prepared `scripts/verify-browser.mjs` for real production-bundle captures at all four requested sizes, responsive/dialog checks, critical workflows, axe scans, and contact-sheet/gallery generation. Syntax and lint pass; browser assertions have not run.
- Browser verification is blocked: Vite loopback `EPERM`, Chromium macOS sandbox initialization failure, WebKit startup abort, unavailable browser automation host, and failed native Chrome access. Automatic approval rejected the outside-sandbox verification request because sandbox escalation is disabled. No security settings were weakened.
- README gallery is explicitly marked as the previous design. New screenshots, visual inspection, browser/accessibility verification, contact sheet replacement, and ZIP refresh remain required before owner review/publication.
- No Git initialization, commits, remote changes, publication, or deployment occurred.


## Redesign browser QA and documentation — 2026-11-12

- First retried in-process production artifact interception inside the current sandbox. Chromium still failed at macOS Mach-port initialization. Scoped approval for the QA command allowed browser execution with browser sandbox protection enabled, using an isolated profile and no listening port.
- Added pinned Playwright 1.63.0 and axe-core 4.13.0 development tooling and `npm run qa:visual`. It builds production, installs Chromium if needed, runs browser checks, captures all four requested sizes, generates the contact sheet and screenshot ZIP, and exits nonzero with diagnostic JSON on failure.
- Corrected test timing for animation-frame focus restoration and a stale category selector. Actual axe testing found a non-focusable scrolling asset-details body; made it a named focusable region and verified PageDown scrolling. Added the proper group role to the labelled status summary. No visual redesign or data/validation/business-rule changes were made.
- Chromium 153.0.8010.12 passed overview, inventory/search/filters/empty state, findings, details, add/edit, CSV import/preview, confirmations, and keyboard navigation at 1440×900, 1280×800, 768×1024, and 390×844, plus a 320px smoke check. The suite recorded 67 layout captures/checks with no page/table overflow.
- Passed CRUD, finding-count updates, mixed valid/invalid CSV atomicity, formula-safe export and reimport validation, sample import, literal markup rendering, refresh persistence, reset, skip-to-content, focus containment/restoration, and visible navigation focus. No page or console errors occurred.
- All 42 WCAG-tagged axe scans reported zero violations. Retained 14 indeterminate dialog contrast nodes in the report and reviewed computed colors and actual captures: 5.28:1 muted text, 6.92:1 preview copy, 7.30:1 error copy. Screen-reader and other-engine testing are outside this review's scope.
- Replaced all outdated gallery PNGs; added laptop overview and desktop editor. Rebuilt and inspected the contact sheet and individual native-size responsive/dialog screenshots. Corrected the capture setup to reset scrolling/focus after the skip-link test. Rebuilt the 11-PNG ZIP and verified its contents against the gallery.
- Updated README screenshots/QA instructions, redesign review, and current release status. Lint, strict TypeScript, all 34 tests, and production build passed after the screenshot refresh.
- No Git initialization, commits, publishing, deployment, or remote changes occurred. Final verdict: GO for local owner review; publication still requires explicit owner approval.


## Authorized publication — 2026-11-12

- Owner explicitly authorized the public personal repository `ammaarrehman/asset-security-dashboard`, commits, pushes, and GitHub Pages deployment. No capstone portal submission is authorized.
- Verified working directory, active GitHub login `ammaarrehman`, effective personal author/committer, and conditional identity configuration. Initialized `main` and pinned the personal identity locally.
- Reviewed intended files and fictional demo/sample data. Gitleaks found no secrets, including archive scanning. Verified ignore rules, MIT license, lockfile/manifest consistency, HTTPS registry sources, README links, screenshot hashes, and ZIP contents. Removed internal reference-project names/paths from release notes.
- Clean `npm ci` passed on Node 24.22.1 / npm 11.19.1. Lint, strict TypeScript, all 34 tests, and production build passed. Full audit: seven moderate development lint-tool findings; zero high/critical. Production audit: zero vulnerabilities. Existing upstream tooling advisory remains documented in release preparation.
- Added the GitHub Actions Pages workflow with pinned official actions, `npm ci`, lint/tests/build, `dist` upload, separate least-privilege deployment, and serialized deployments. Vite base is `/asset-security-dashboard/`.
- Extended the existing browser suite to accept a real public URL and separate evidence directory, with HTTP/request failure and base-path checks. Application behavior and redesigned interface are unchanged.
- Created the public personal repository, applied the prepared metadata, pushed the initial commit, and verified all 117 remote file hashes. Pages uses GitHub Actions with HTTPS; initial run 43168230433 succeeded.
- The real public URL passed Chromium workflows, 67 responsive layout checks, 42 axe scans with zero violations, CSV atomicity/formula round-trip, editing/findings, persistence, keyboard interaction, and 320px layout. No browser/HTTP/request errors occurred. Live HTML and required assets matched the audited production build; all ten README images rendered on the anonymous GitHub page.
- Added the verified live URL to README and publication evidence under `docs/verification/publication/`. No blocking issues remain; documented development-tool maintenance and browser coverage limitations remain. The documentation follow-up deployment is checked before handoff. No capstone portal form was submitted.

## Capstone presentation integration — 2026-11-12

- Owner authorized documentation and presentation commits and pushes to the existing public personal repository on `main`. Verified the HTTPS origin, active CLI account `ammaarrehman`, public repository ownership, personal Git author/committer, and conditional identity configuration. The connected GitHub plugin uses the company account, so publication uses the verified personal CLI.
- Confirmed `docs/presentation/` contains exactly the five required files. Inspected the six-slide deck's XML, supplied preview, embedded screenshots, metadata, and image integrity. Replaced six broken `[object Object]` speaker-note placeholders with the corresponding presenter-guide sections; every other PPTX archive entry, including slides and images, is unchanged.
- Added the main README's Capstone Presentation section with PowerPoint download, presenter guide, preview, and live application links. Linked the complete kit and preserved the original outline, correcting its date-sensitive claim about fixed status totals.
- Added `docs/future-improvements.md` with the four requested optional ideas, explicitly marked as unimplemented. Replaced the guide's duplicate improvement list with a link to that document. Application source, functionality, visual design, dependencies, and deployment configuration are unchanged.
- Verified 32 local Markdown links. Decoded the standalone, embedded, and preview QR codes to the existing HTTPS live application. Reviewed metadata and fictional screenshots; found no private personal data beyond intended public presenter attribution, credentials, or unnecessary additions. Gitleaks found no secrets across the intended repository files and explicitly extracted PPTX XML.
- `npm run lint`, all 34 tests, and `npm run build` passed. Pushed presentation commit `3bf03f9` to the existing `main`; [Pages workflow 43176935183](https://github.com/ammaarrehman/asset-security-dashboard/actions/runs/43176935183) completed successfully.
- Inspected the anonymous GitHub README in Chromium: the Capstone Presentation section renders correctly and all four requested links returned HTTP 200. All nine published files matched local SHA-256 hashes. Verified the presentation-kit README's rendered links against available published targets, including the original outline and sample CSV. A transient anonymous GitHub rate limit cleared on retry.
- The live Pages URL returned HTTP 200 and rendered the 18-device overview without browser errors. Its HTML, JavaScript, and CSS match the unchanged production build byte for byte. Verification scripts, screenshots, scans, and temporary copies stayed outside the repository. The final progress-only commit receives the same deployment check before handoff.

## Visual overhaul — 2026-11-12 (local branch, not published)

- Created local branch `redesign/visual-overhaul`. No push, deployment, or remote change. The public site and the original deck are untouched.
- New dark security-operations identity: supplied palette refined by contrast testing, IBM Plex Sans/Mono bundled locally under the OFL, reticle-bracket motif, minimum text size raised from 9px to 11.5px.
- Application: left rail / top bar / phone tab bar navigation; overview with status summary, Priority follow-ups (documented fixed sort, not a score), split charts, and an interactive relationship diagram of assets, recorded controls, findings, and next actions; inventory with control glyph columns, segmented filter, and phone record cards; findings workstation with recorded field/value evidence. Purposeful one-shot CSS/SVG motion with a reduced-motion path. No dependency, rule, validation, CSV, storage, demo-data, or Pages changes.
- Added `src/insights.ts` (read-only ordering and relationship views) with 9 unit tests; 43 tests pass. Lint and production build pass.
- `npm run qa:visual` now writes to `docs/verification/visual-overhaul/chromium/`: four viewports plus 320px, 70 layout checks, 46 axe scans with zero violations (63 indeterminate contrast nodes, lowest measured 6.78:1), reduced-motion and finite-animation assertions, and before/after sheet `app-review.png`.
- Presentation: new `Asset_Security_Dashboard_CRC_Capstone_v2.pptx` (six editable slides, notes, two embedded H.264 clips with complete first and last frames, verified QR), `Presenter_Guide_v2.md`, preview montage, per-slide images, PDF, offline ZIP, and generator source under `docs/presentation/source/`. Schema validation passed; rendered and inspected in Keynote 15.4. PowerPoint was not available for testing.
- Known gaps: PowerPoint playback untested, Windows font substitution, Chromium-only browser testing, and slide screenshots that show the unpublished redesign.

## Deck v2 delivery revision — 2026-11-13 (local branch, not published)

- Revised the v2 deck in place for an easy first-time delivery. Each of the six slides (what I built, the problem, my solution, real example, live demo, conclusion) has a plain title and two or three short sentences to read aloud at 21 to 24 pt. Speaker notes give time, the exact words, what to point at, and optional extra context. Kept both motion clips, the reticle motif, and real screenshots; added lucide icons and the app's brand mark so the deck and app read as one product. No em dashes in slide text or notes.
- Rewrote `Presenter_Guide_v2.md`: words per slide, plain explanations, pointing cues, a click-by-click demo with expected numbers, about 5 minutes 15 seconds of timing, a glossary, and five likely questions.
- Added `docs/presentation/source/demo-walkthrough.mjs`, which rehearses the demo against the production build and asserts every count in the guide (18 devices, 13 to 12 findings, Overdue to Healthy). It passed. New captures in `docs/presentation/media/Demo_Step_*.png` and the sheet `docs/verification/visual-overhaul/demo-walkthrough.png`.
- Rendered every slide in Keynote at 1920 × 1080 and fixed clipping, overlaps, and wrapped labels over several rounds. Found and fixed pptxgenjs writing local file paths (including the macOS user name) as icon alt text; the build now fails if any local path reaches the package. Schema validation passed. Updated the PDF, `slides/`, `Slides_Preview_v2.png`, `slides-review.png` (previous v2 beside revised), and the offline ZIP.
- Application code, security rules, validation, CSV handling, storage, and demo data are unchanged. Lint, tests, and build were rerun. Not committed, pushed, merged, or deployed.
- Remaining: PowerPoint itself is untested (Keynote only); Windows font substitution; the public site and QR still show the earlier design until the branch is deployed.

## Deck v2, 4:30 revision and recorded demo — 2026-11-13 (local branch, not published)

- Rebuilt the v2 deck for CRC's under-five-minute format: six slides at 25/40/45/40/95/25 seconds (4:30), each with a short title and two or three read-aloud sentences. Removed eyebrows, captions, and the footer tagline. Story runs from the Discover 5 lesson to the problem, solution, Outreach Laptop 03 example, demo, and explicit limits (no scanning, patching, control verification, or compliance proof). Fictional data only; no client details or claims of real use.
- Recorded `docs/presentation/media/Demo_Recording.mp4` (94.0 s, 1920 × 1080, H.264) from a real Chromium session of the production build with `source/record-demo.mjs` (screencast frames encoded by AVFoundation in `source/encode-frames.swift`; no ffmpeg available). Embedded it on slide 5 and kept it as a standalone file. The pointer is drawn in-page and the Patch status value is selected programmatically because native dropdowns are not captured; both are documented.
- Rewrote `Presenter_Guide_v2.md` with video-timed cues, an optional live path, a short glossary, five questions, an offline fallback, and a rehearsal checklist. Added `source/video-frames.swift` for inspecting video frames and npm shortcuts in `source/package.json`.
- Validation passed; Keynote imported three movies and all notes; all six slides were rendered and inspected; the embedded video matches the standalone file. Refreshed the PDF, `slides/`, `Slides_Preview_v2.png`, `slides-review.png`, and the offline ZIP.
- Added `@source not "../docs"` to `src/styles.css` so deck tooling can no longer add Tailwind utilities to the app (it had added unused `ring`/`ease-out`, and earlier `border`/`transition`). The removed rules are unused; walkthrough captures match the earlier build apart from one-pixel run-to-run noise. Lint, 43 tests, and build pass. App behavior, rules, data, and `app-review.png` are unchanged; `qa:visual` was not rerun.
- Not committed, pushed, merged, or deployed. PowerPoint and in-slideshow video playback remain untested.

## Operator console refinement — 2026-11-13 (local branch, not published)

- Second visual pass on the app and deck to remove the generic neon "cyber SaaS" feel. Restrained palette (teal `#7DB8AD` on graphite, strong teal only for focus and highlights), low-opacity grain, blueprint grid, dot grid, and hatching as tokens; varied panel treatments (instrument readout, worksheet, instrument charts, blueprint diagram, report-sheet findings, inspection dialog); squared badges; ASCII section rules; indexed navigation; and a `TraceMark` showing Assets → Recorded controls → Findings → Next actions above every page title. No information-architecture, behavior, rule, validation, CSV, storage, or demo-data changes.
- Deck matches: textured background plate, trace motif in each footer, dashed field-manual frames, ASCII rule on the limits panel. Re-rendered both motion graphics (`render-motion.mjs` now encodes the MP4s itself), re-recorded the 94 s demo, and re-captured the slide screenshots from the refined app.
- Lint, strict TypeScript, 43 tests, and build pass. `npm run qa:visual` passed: 70 layout checks, all workflows, 46 axe scans with zero violations, lowest measured text contrast 6.08:1. Regenerated `app-review.png` (against the `b9d345a` captures), `slides-review.png`, the README gallery, PDF, slide images, and offline ZIP. Keynote imported all three videos and all notes; PowerPoint remains untested.
- Not committed, pushed, merged, or deployed.

## Release-readiness checks — 2026-11-14 (local branch, committed locally, not pushed or deployed)

- **Heading focus outline.** Navigation moves focus to the page `h1` (`tabindex="-1"`) so screen readers announce the new page. With the mouse, Chromium and WebKit showed no ring. After keyboard navigation, the browser drew its default `outline: auto` box across the full-width heading block, because the app's focus rule does not cover `tabindex="-1"`. The QA suite captured `inventory.png` straight after that keyboard step, so the box appeared in the review sheet. Fix in `src/styles/shell.css`: the heading is as wide as its text, keyboard focus uses the app's 2px strong-teal ring, and pointer or script focus shows none. `verify-browser.mjs` now asserts no ring after mouse navigation, asserts the designed ring after keyboard navigation (new `keyboard-heading.png` at each viewport), and takes the ordinary `inventory.png` without a focused heading. Keyboard access and all other focus indicators are unchanged.
- **Slide 4.** Added two native 20 pt labels above the pictures: `BEFORE  Patches: Overdue` (amber) and `AFTER  Patches: Up to date` (teal). The read-aloud text, layout, media, and timing are unchanged; the speaker note and guide now point at the labels. Keynote renders of slides 1, 2, 3, 5, and 6 are pixel-identical to the approved renders.
- **Projector check (1920 × 1080 Keynote renders).** Read-aloud text is 22 to 24 pt, titles 40 pt, and slide 4 labels 20 pt. No clipping, overlap, or overflow. Screenshot text inside the pictures is supporting detail only.
- **Timing.** Slide budgets total 4:30. The 94.0 s demo fits slide 5's 95 s slot, and the slide 5 sentences are spoken over its opening. Read aloud at a slow 110 words per minute, with both optional 8 s clips played and the slide 6 box read, the spoken content takes about 3:42.
- **Videos and offline use.** The three MP4s inside the PPTX are byte-identical to the standalone files and decode through their final frames (7.8 s, 8.0 s, 94.0 s, H.264, 30 fps). The package has no external relationships. Keynote opened the deck, imported three movie objects (slides 3, 4, and 5), and started a slideshow. Advancing the slideshow to play the movies could not be automated: Keynote rejects `show next` during a slideshow, and synthetic key presses were stopped because a system permission dialog was on screen. The exact manual check, with Wi-Fi off, is now in `Presenter_Guide_v2.md`. The rebuilt offline ZIP has the same 45 entries, and its unpacked deck, PDF, guide, and videos match the repository files.
- Lint, 43 unit tests, the production build, and `npm run qa:visual` passed: 74 layout checks, 46 axe scans with zero violations, and no page errors. Regenerated the review captures, `app-review.png`, the README gallery, the slide images, the PDF, `Slides_Preview_v2.png`, and the offline ZIP. `slides-review.png` is kept as the record of the approved refinement. The original presentation files, security rules, validation, and demo data are unchanged.

## Slide design revision — 2026-11-14 (approved)

- Owner approved the application but found the slides AI-generated in pattern: numbering, breadcrumbs, a repeated footer, generic titles, tiny captions, one repeated layout, framed boxes, and generated-sounding writing. Rebuilt the v2 deck's six slides around one subject each, using the owner's wording with light edits: a cover with a bleeding overview screenshot, a plain incomplete device list, one four-step graphic, a large before-and-after of the real record, a centered unframed demo video, and a text-only conclusion ending in "Thank you."
- Removed the trace footer, slide numbers, footer brand mark, background corner marks, dashed frames and reticles, monospace labels, callout boxes, and both motion clips (files kept). Kept the palette, texture, real screenshots, recorded demo, and read-aloud wording. Talk is about 4:35. No application files changed.
- Rendered every slide in Keynote at 1920 × 1080 and inspected each one; fixed overlaps, wraps, and crops. Keynote imports notes on all six slides and the slide 5 movie. Rewrote `Presenter_Guide_v2.md`; regenerated the PDF, slide PNGs, `Slides_Preview_v2.png`, `slides-review.png`, and the offline ZIP (99.2 MB). Details in the visual overhaul README.

## Final presentation checks — 2026-11-14 (committed locally, not pushed or deployed)

- Slide 4 now shows close-ups of the real Patch status field (about 3.4×) and status line (2×), before and after. They are captured at 3× by the new `capture-status-fields.mjs`, which asserts the data at each step. The labels read "Before  Patches overdue" and "After  Patches up to date". The palette, layout, and wording are unchanged.
- The demo video is re-recorded from the same real session at 1.5× resolution, with magnified key moments applied in post by `encode-frames.swift`. The app date is fixed to 2026-11-11 to match the screenshots, and the video is still 94.0 s. Those original cue estimates were corrected after the independent audit: inventory about 0:31, search 0:34, record 0:39, edit 0:55, change 0:59, saved result 1:03, overview 1:26.
- The offline ZIP is no longer committed. It is generated and verified by `npm run package` (7 files, 76.8 MB) and listed in `.gitignore`.
- Slide text, speaker notes, and guide match exactly, checked automatically. Timing is 4:35 budgeted and about 3:13 of speech and video. All six slides were re-rendered and inspected; slides 1, 2, 3, and 6 are pixel-identical to the approved renders. The original deck and the app are unchanged.


## Targeted independent-audit remediation — 2026-11-14

- Fixed the generator's slide 5 text/media drawing-ID collision at generation time; rejects duplicate IDs before replacing the delivered PPTX. Added regression tests and a separate standard-library XML/package validator for every part, all relationships, six slides, notes/SAY agreement, eleven cue rows and embedded-video identity.
- Bound the corrected cue manifest to the unchanged 94-second MP4's SHA-256. Updated the guide, notes and related timeline documentation; preserved every visible read-aloud paragraph and all slide geometry. Native AVFoundation decoded all 2,820 frames and OCR/cue frames confirmed the new timestamps.
- Keynote rendered all six before/after slides with zero changed pixels. Desktop/laptop/tablet/mobile overview, inventory and findings captures are also pixel-identical to the independent audit captures. The original presentation kit and approved source screenshots were not replaced.
- Fixed 621px page overflow by containing hidden table labels. Retained keyboard table scrolling. Chromium passed 98 layout checks and 52 axe scans with zero violations, including 600/621/640/660/680/700px overview, inventory, findings and editor checks.
- QA defaults to ignored output; ASSET_QA_OUTPUT contains comparison sheets too. All writes under docs/ and gallery replacement require --update-gallery. Four destination-policy regression tests pass; the full custom-output run left approved screenshots unchanged.
- Featured v2 PPTX/guide/preview and the under-five-minute 4:35 budget in both READMEs; original kit stays linked as an archive. Checked all 43 relative links. Offline packaging passed seven-file unpacked hash verification.
- Evaluated the current dependency releases: latest TypeScript ESLint still requests vulnerable minimatch 10, whose latest compatible version is already locked. Kept the pins with an explicit limited development-only risk review instead of forcing an incompatible major. Full audit: seven moderate entries from one advisory; production: zero.
- Lint, all 49 tests, strict TypeScript, production build and presentation checks pass. Native Microsoft PowerPoint slideshow playback, Windows fonts and a complete human timed rehearsal remain untested. No push, merge or deployment. The clean-release procedure preserves the redesign history locally and bases the release candidate directly on unchanged main; candidate identifiers and repeated-check evidence are in the handoff.

## Final capstone presentation integration — 2026-11-14

- Confirmed a clean `release/audit-remediation` worktree at `abca62d7446bf8902e38084721ca34d53704e70e` before changes. Imported the owner's approved story-review files from the primary workspace and integrated the unchanged 73-second MP4 on slide 5. The 94-second original remains a hash-verified archive.
- Regenerated the six-slide PowerPoint from its actual source. Shared wording/timing now lives in `presentation-story.json`: explicit Discover 5 connection, concrete security-software wording, “the recorded finding clears,” one-laptop demo setup, and a specific CRC learning about missing information. Most speech remains visible. The planned total is 3:29, with a natural target of 3:20 to 4:00. Notes, final natural script, presenter guide, 13 video cues, READMEs, and preview labels agree.
- Preserved all native object transforms and all 14 embedded PNGs, including the graphite/teal design, texture, screenshots, slide 4 close-ups, and QR. Rendered all six slides through Keynote, inspected each, and regenerated the PDF and preview. The cover is pixel-identical. The actual rendered QR decodes to the dashboard URL.
- Verified the embedded preferred MP4 byte for byte, then decoded all 2,190 frames over exactly 73 seconds. Every timestamp matches the 30-fps sequence. Inspected the patch change, actual Save click, Healthy result, and zero-findings confirmation. Generated and unpack-verified the eight-file 60.7 MB offline package, including the preferred standalone recording and final script.
- Lint, 49 tests, strict TypeScript/production build, package structure/ID/relationship checks, six-page PDF checks, and three negative speech/cue/timing consistency checks pass. Protected-file checks confirm 238 application/configuration/original-kit/media/gallery files unchanged. Verification is in `docs/verification/final-presentation/`.
- No application redesign, security-rule change, commit, push, merge, deployment, or publication. Native slideshow playback on the presentation computer, Windows fonts if used, projector/QR readability, and a complete timed human rehearsal remain manual checks before presentation.


## Final GitHub release preparation — 2026-11-16

- Owner explicitly authorized publication, PR merge, and deployment. Confirmed `release/audit-remediation` at `abca62d`, directly based on unchanged public main `66bb04a`; personal Git identity and active GitHub `ammaarrehman` verified. Preserved all working files, untracked final assets, ignored offline ZIP, and clean candidate history outside temporary storage with hash verification before release operations.
- Audited the final six-slide v2 kit and archives. Updated root/presentation READMEs with the final deck, script, guide, recording, preview, PDF, approximately 3:29 estimated plan, CRC/Discover 5 context, fictional demo instructions, and explicit prototype limits. Marked older outlines/reports as historical. No app or slide redesign.
- Added PR build validation to the existing Pages workflow, with deployment steps skipped on PRs. Lint, 49 tests, strict TypeScript and production build pass. Chromium passed 98 layout checks, 52 axe scans with zero violations, all workflow groups and no page errors. QA output stayed outside the tracked screenshot gallery.
- Deck/package validation, notes/cues/script consistency, archived recording identity, repeated eight-file offline payload reproduction, local documentation links, and clean-history/file secret scans pass. The obsolete 96.8 MB ZIP blob and its historical commits are excluded. Separate presentation tool advisories were evaluated and documented alongside the known development lint advisory; production app audit is zero.
- Publication and subsequent real-site verification are recorded in `docs/verification/final-release/`. Native slideshow playback, projector testing, and timed spoken rehearsal remain manual.


## Final public release verification — 2026-11-16

- Published the clean candidate through PR #1 after its build checks passed. Normal merge `46b3eae` preserves the clean candidate ancestry and excludes the obsolete ZIP history. All 224 remote PR files matched the local blobs. Pages run `43829508333` succeeded.
- Tested the actual public site in isolated Chromium: 98 layout checks, 52 axe scans with zero violations, all nine workflow groups and no page errors. A separate unmocked current-date patch edit reached Healthy/zero findings and survived reload. Desktop/mobile screenshots were inspected; eight gallery views match pixels exactly and three have only minor rasterization differences, with no layout/content change.
- All 55 public HTTP/download checks passed; deployed artifacts, final v2 PowerPoint, PDF, guide, recording, script and previews match local release bytes. The anonymous GitHub README renders all 11 gallery images and final primary links. The rendered QR reaches the verified site. No tracked screenshot gallery was overwritten.
- Published the supporting verification record through a documentation-only follow-up. Presentation/app design and binaries are unchanged. Native slideshow playback, physical projector checks, and timed spoken rehearsal remain manual; 3:29 is an estimate. Known development/authoring dependency limitations remain documented.


## Capstone Q&A documentation audit — 2026-11-16

- Confirmed public main remains `a4a124087d0d17b264a11318dbf7e299290ba4b7`; the clean local tree initially matched it. Created the separate `docs/capstone-qa-clarifications` branch. Existing release work and archives are preserved.
- Corrected the current presenter guide's stale QR/publication statement and replaced the absolute no-transmission claim with the actual LocalStorage/no-inventory-backend behavior and static GitHub Pages requests. Clarified the UTC-date input to deterministic rules and removed the claim that every real-device check requires installed software.
- Marked the overview follow-ups and consolidated device/remediation context as delivered in the future-ideas page. No final spoken wording, PPTX, recording, QR image, preview, app source or historical verification evidence changed.
- Lint, 49 Vitest tests, strict TypeScript/production build, six-slide package/notes/cues validation and all 120 relative Markdown links passed. A live isolated-browser check confirmed the redesigned QR destination, static asset requests, and a fictional patch edit saved to LocalStorage without issuing a network request. Published README, script, deck, 73-second video and release report match the unchanged release files.
- Documentation-only PR prepared for owner review. No merge or deployment is authorized by this audit; public main remains unchanged pending owner approval.
