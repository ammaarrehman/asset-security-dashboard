# Public release verification

Verified on 12 November 2026. The owner explicitly authorized publication under the personal account and GitHub Pages deployment. The application remains the reviewed browser-only educational prototype; no application redesign or feature expansion was made during publication.

- Public repository: [ammaarrehman/asset-security-dashboard](https://github.com/ammaarrehman/asset-security-dashboard), default branch `main`, MIT license.
- Live application: [Asset Security Dashboard](https://ammaarrehman.github.io/asset-security-dashboard/).
- First successful deployment: [GitHub Actions run 43168230433](https://github.com/ammaarrehman/asset-security-dashboard/actions/runs/43168230433), commit `691e9b10f64a5b8929284970dca608e8b3d4aba0`.
- Subsequent documentation updates use the same [automatic deployment workflow](https://github.com/ammaarrehman/asset-security-dashboard/actions/workflows/deploy-pages.yml).

## Identity and publication audit

`gh auth status` and `gh api user` independently confirmed the active owner as `ammaarrehman`. Effective author and committer were `Ammaar Rehman <ammaar2rehman@gmail.com>`; Git configuration origins and conditional includes were checked before committing. The project has a local personal identity and the HTTPS remote belongs to the personal account.

Reviewed all intended project files, demo records, sample CSV, release metadata, and documentation for credentials, private files, and real client information. The dataset is fictional. Gitleaks directory/archive and Git-history scans found no leaks; GitHub secret scanning was enabled and reported no alerts at verification time. Push protection remained enabled. No sensitive configuration files or symlinks were present in the intended files. Ignore checks confirmed that dependencies, production output, local environment files, coverage, logs, and temporary test output are excluded.

Verified the MIT license, manifest/lockfile consistency, HTTPS npm registry sources, README links, screenshot hashes, and ZIP contents. After the initial push, all 117 remote project files matched their local Git blob hashes, including source, documentation, license, lockfile, and current screenshots. No force push was used.

## Build and dependencies

Clean `npm ci` passed with Node 24.22.1 / npm 11.19.1. `npm run lint`, `npm run test` (34 tests across three files), explicit strict TypeScript checks, and `npm run build` passed locally. The deployed Actions build independently passed clean installation, lint, tests, and TypeScript/production compilation.

- [Full dependency audit](dependency-audit.json): seven moderate entries in development lint tooling; zero high or critical findings.
- [Production dependency audit](production-dependency-audit.json): zero vulnerabilities.

The moderate minimatch advisory and ESLint support warning remain maintenance items described in [release preparation](../../release-preparation.md). No forced dependency changes or disabled protections were used.

## Real public browser verification

The existing Playwright suite ran against the actual HTTPS Pages URL using real network responses, without local route interception. Chromium 153.0.8010.12 / Playwright 1.63.0 passed; see [complete browser evidence](chromium-results.json). Tests used an isolated browser context and fictional records. A fixed 11 November clock keeps demo dates and screenshots reproducible; actual execution time is recorded separately.

- Dashboard and 18 fictional devices, navigation, search, status/category filtering, empty states, and recorded findings.
- Asset validation, creation, editing, deletion, finding-count updates, literal markup rendering, and confirmation dialogs.
- CSV preview without mutation, malformed-header rejection, mixed-validity atomic rejection, confirmed import, export, protective apostrophes on formula-like fields, and maximum-length formula-name round-trip validation.
- Imported and added records persisted after refresh; confirmed reset restored 18 fictional devices.
- Four viewports (1440×900, 1280×800, 768×1024, 390×844) plus 320px checks; 67 layout checks without page/table horizontal overflow, including mobile editor scrolling and visible action buttons.
- Keyboard navigation, skip link, heading focus, dialog focus containment/restoration, Escape dismissal, and validation focus behavior.
- All 42 axe scans reported zero violations. Indeterminate contrast diagnostics remain recorded; these are not a conformance certification.
- No uncaught page errors, console errors, failed requests, HTTP errors, or requests outside the configured `/asset-security-dashboard/` base path.

The macOS process sandbox initially blocked Chromium launch. Scoped host execution allowed the isolated tests to run with Chromium sandbox protection enabled. No security settings were disabled.

## Public assets and portfolio presentation

[HTTP and README browser evidence](http-readme-results.json) confirms HTTP 200 for the public site, JavaScript, CSS, favicon, and sample CSV. Required assets use the repository base path and appropriate content types. The deployed HTML and asset bytes matched the audited local production build. The repository page loaded anonymously, and all ten expanded README gallery images rendered with nonzero natural dimensions.

[Gallery comparison](gallery-comparison.json) records hashes of fresh public-site captures against the existing redesigned screenshot gallery. Nine of ten captures matched byte for byte. The details capture had a slightly different internal scroll position; visual inspection confirmed the same content and interface. README now includes the verified live demo, overview, screenshots, features, installation, limitations, testing, and Cyber Ready Clinic capstone context.

## Scope and remaining limitations

No blocking publication issues were found. Remaining maintenance consists of the documented development-tool advisory and ESLint support update. Public-site browser testing covered desktop Chromium with emulated responsive viewports; Safari, Firefox, physical mobile devices, and screen-reader testing were not performed for this publication review.

This is a local-browser educational inventory, without authentication, server-side storage, device scanning, or independent security/compliance verification. The public demo retains the documented browser storage and CSV limitations. No Cyber Ready Clinic portal form was submitted.
