# Progress

Current release status (2026-11-12): **Published publicly; live GitHub Pages browser verification passed**. Chromium passed all four requested viewports, core workflows, keyboard checks, and 42 axe scans with zero violations; indeterminate contrast items were reviewed separately. New screenshots, inspected contact sheet, ZIP, and a reproducible `npm run qa:visual` command are available. See the [redesign review](docs/verification/redesign/README.md). The owner explicitly authorized publication on the personal account. Earlier entries below are historical.

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
- `npm run lint`, all 34 tests, and `npm run build` passed. The existing Pages workflow was successful before this update. After the authorized push, verify the rendered GitHub README, all published presentation files, the new deployment, and the live application before handoff.
