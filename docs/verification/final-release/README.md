# Final release verification — 16 November 2026

The owner authorized publication, PR merge, and GitHub Pages deployment of the completed release. Local verification passed. Public deployment verification follows the release PR merge and is recorded separately below when complete.

The candidate starts at `abca62d7446bf8902e38084721ca34d53704e70e`, directly above unchanged public main `66bb04add14209ac4669687e2cea07bac62d0586`. Git and GitHub identity were verified as Ammaar Rehman / `ammaarrehman`. A hash-verified working-file archive and candidate history bundle are preserved outside temporary storage in the owner's personal projects folder. The obsolete redesign branch is not being pushed.

Native slideshow playback, physical projector testing, Windows font substitution if applicable, and a timed spoken rehearsal remain manual checks. The approximately 3:29 presentation duration is an estimate.

## Release-candidate checks

- Clean installs used Node 24.22.1 and npm 11.19.1. Lint, all 49 Vitest tests across six files, strict TypeScript, and production build passed. The Vitest count includes the presentation drawing-ID and QA-output regression suites.
- [Chromium results](local-chromium-results.json): 98 layout checks, 52 axe scans with zero violations, nine workflow groups, zero page errors. Desktop 1440×900, laptop 1280×800, tablet 768×1024, mobile 390×844, 320px narrow and intermediate reflow checks passed. Keyboard navigation, patch changes, atomic invalid CSV rejection, formula-safe export, persistence and storage-failure recovery passed. Screenshots were visually inspected and written outside the tracked gallery.
- [Deck validation](deck-validation.json): six slides, 63 resolved relationships, unique drawing IDs, six notes, matching visible wording/script/guide, 13 matching demo cues, no external media dependencies, and the exact approved embedded video. Estimated talk: 209 seconds (3:29).
- [Embedded media/PDF check](media-pdf.json): full 2,190-frame decode at exactly 73 seconds, no audio, zero timestamp-grid mismatches, and six PDF pages with final wording. Key frames show the patch change, saved Healthy state, and zero recorded findings. The [rendered slide QR](rendered-qr.json) resolves to the current live site.
- Offline package generated twice; all eight [payload hashes](offline-payload-hashes.json) reproduce and match after unpacking. The generated duplicate ZIP stays ignored and uncommitted.
- [Relative links](relative-links.json) all resolved at the check. Public URL/download checks follow deployment.
- [Preservation](preservation.json): approved app, public assets, screenshot gallery, original presentation, and archived media unchanged from the pre-release snapshot. No screenshot-gallery regeneration occurred.
- Gitleaks 8.30.1 [file/archive scan](gitleaks-files.json) and [clean candidate history scan](gitleaks-history.json) found no leaks. Reviewed demo and sample data, slide/notes/script text, source assets, and documentation: no confidential Discover 5 client assessment data or claims of client deployment/outcomes were found. Automated scans do not establish an absence of every possible secret.
- The 96,801,622-byte ZIP blob `bcebc89c217183508be329933ff86294a934f87e` and historical commits `60c797f41e768afc84e085979c12619771ed6e47` / `2d762a6ea1f2b865dedf9ef0e5450b45179026cf` are not reachable from the release candidate. The candidate is directly based on public main; no historical branch, force push, or Git LFS is used.
- [Production app audit](production-audit.json): zero vulnerabilities. [Full app audit](dependency-audit.json): seven moderate development entries. [Presentation tooling audit](presentation-dependency-audit.json): two high entries in image parser tooling, absent from the delivered app. Reachability and the decision to retain approved pins are documented in the [dependency review](../../dependency-review.md).
- CI now runs build validation on pull requests. PRs skip Pages configuration/upload/deployment; only main builds publish the static application at `/asset-security-dashboard/`.

All presentation originals remain archived. Keynote-rendered slides and the PDF were retained from the approved integration; this release does not claim a new native slideshow or human rehearsal test.
