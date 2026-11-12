# Publication preparation

Status updated 2026-11-12: **Published publicly; live deployment verification passed**. See the [redesign review](verification/redesign/README.md) for current Chromium results, accessibility diagnostics, and refreshed screenshots. The dependency audit and prior-interface results below are historical. Playwright and axe-core have since been added as pinned development tools. The owner explicitly authorized the public personal repository and GitHub Pages deployment on 2026-11-12.

The intended personal repository is `ammaarrehman/asset-security-dashboard`.

## Repository metadata

- Description — Local asset inventory and security hygiene dashboard for small nonprofits.
- Topics — `cybersecurity`, `asset-inventory`, `nonprofit`, `react`, `typescript`, `vite`, `cybersecurity-education`, `capstone-project`.
- License — MIT, copyright 2026 Ammaar Rehman.
- GitHub Pages base — `/asset-security-dashboard/`.

The metadata, license, README, sample CSV, presentation outline, screenshot gallery, and screenshot ZIP were reviewed. Local README and presentation links resolve. The application remains a local browser prototype with fictional demo data, deterministic rules, and explicit unknown values.

## Dependencies and installation

| Package | Previous | Verified |
| --- | --- | --- |
| Vite | 7.3.6 | 7.3.8 |
| Vitest | 4.1.11 | 4.1.12 |
| @vitest/mocker (transitive) | 4.1.11 | 4.1.12 |

`package.json` and `package-lock.json` were updated together through npm. All Vite consumers use the same patched version. The existing React plugin 4.7.0 and Tailwind Vite plugin 4.3.3 support Vite 7; Vitest 4.1.12 also supports it. Other direct dependency pins are unchanged.

`npm ping` and package metadata requests succeeded against `https://registry.npmjs.org/`. A clean `npm ci` using a separate fresh temporary cache passed on Node 24.22.1 / npm 11.19.1. The manifest and lockfile match, and resolved tarballs use the HTTPS npm registry. The default npm cache produced `EPERM`; a writable temporary cache resolved that filesystem issue. TLS verification remained enabled.

## Audit evaluation

- Full `npm audit`: **7 moderate dependency entries, 0 low, 0 high, 0 critical**; its nonzero exit status reflects the remaining findings below.
- `npm audit --omit=dev`: **0 vulnerabilities**, exit status 0.
- The patched versions address the [Vite code-execution advisory](https://github.com/vitejs/vite/security/advisories/GHSA-p4f5-76q4-ffq7) and the Vitest [mock-registration](https://github.com/vitest-dev/vitest/security/advisories/GHSA-qxg6-89mg-rqv8) and [Windows traversal](https://github.com/vitest-dev/vitest/security/advisories/GHSA-xp26-3454-mjgp) advisories. npm audit reports no remaining findings for Vite, Vitest, or @vitest/mocker. The Vite maintainer advisory was also checked directly because registry audit data can lag newly published advisories.

The seven moderate entries represent one underlying [minimatch glob-amplification advisory, GHSA-g3hv-75wg-m249](https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249), propagated through minimatch and six TypeScript ESLint packages. Installed `@typescript-eslint/typescript-estree` 8.71.1 requires minimatch `^10.2.2` and resolves to 10.2.6. The latest TypeScript ESLint 8.72.2 still uses that range; the advisory's patched minimatch line starts at 11.0.1.

The maintainer describes denial of service from attacker-controlled glob patterns with `optimizationLevel >= 2`. Source inspection found the parser's minimatch call passes only `{ dot: true }`, leaving minimatch's default optimization level at 1. This project also uses the recommended syntax lint configuration without project-service/default-project globs. Browser asset fields and CSV content never reach the lint tooling, which is absent from the static application. On this evidence, the residual advisory is nonblocking for the current prototype and release workflow. Track an upstream compatible fix and reassess if lint configuration begins accepting external patterns. npm's proposed forced fix downgrades TypeScript ESLint to 8.36.0; no forced downgrade or cross-major override was applied.

npm also emits an unsupported-version warning for ESLint 9.39.5. Track a supported tooling update as maintenance. npm retained its install-script approval protections; the installed platform esbuild binary worked in tests and the production build.

## Final verification

- `npm run lint` — passed.
- `node_modules/.bin/tsc --noEmit --strict` — passed; the project configuration also enables strict mode and unused-symbol checks.
- `npm run test` — 34 tests passed across three files on Vitest 4.1.12.
- `npm run build` — passed on Vite 7.3.8; output uses the configured Pages base path.
- Chromium 153.0.8010.12 and Playwright WebKit 26.6 — passed navigation, demo totals, validation, asset creation/edit/delete, search and filtering, findings updates, CSV preview/import/export and formula protection, refresh persistence, storage failure recovery, reset confirmations, keyboard focus, and mobile layout checks.
- Both engines passed the prior storage-clear, future-review-date, cancel-focus, and maximum-length CSV round-trip regressions. No uncaught page errors occurred.
- Eight automated accessibility scans per engine reported zero violations in the tested overview, inventory, findings, dialog, validation, and mobile states.
- Four Chromium viewport checks passed at 1440×900, 1280×800, 768×1024, and 390×844, including the presentation flow and keyboard scrolling. The core smoke suite also checked 320px width.
- All eight gallery screenshots matched fresh Chromium captures byte for byte using the original fixed date of 2026-11-10. The contact sheet and fresh mobile editor were visually inspected. The ZIP contains the eight screenshots and contact sheet, with all nine PNG payloads and ZIP checksums verified.

Browser tests used the actual rebuilt `dist/` through Vite preview on loopback at `/asset-security-dashboard/`. Unlike earlier checks, request interception was unnecessary. The macOS sandbox blocked browser startup through Mach-port permissions; approved host browser execution resolved it without disabling sandbox or TLS settings. WebKit verification succeeded; Safari.app itself was not exercised.

## Identity and publication boundary

`gh auth status` verifies `ammaarrehman` as the active authenticated personal account. `gh api user` independently returns login `ammaarrehman`, name `Ammaar Rehman`, and user ID `284062896`.

Effective Git author and committer: `Ammaar Rehman <ammaar2rehman@gmail.com>`. Configuration origins and scopes were inspected. The conditional work identity does not apply to this project.

The earlier preparation stopped before Git initialization or publication. The owner has now authorized initialization, commits, public repository creation, pushes, and GitHub Pages deployment. Current publication evidence is recorded in [the public release verification](verification/publication/README.md). The first Pages deployment succeeded and the actual public site passed browser verification; the README includes the verified live URL.
