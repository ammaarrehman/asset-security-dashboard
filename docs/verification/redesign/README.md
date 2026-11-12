# Interface redesign browser review

Status (2026-11-12): **GO for local owner review**. Actual Chromium QA, accessibility review, screenshot inspection, and source verification passed. Publication still requires the owner's approval.

## Browser execution

The in-process production-build interception approach was tested inside the current sandbox first. It avoided loopback binding, but Chromium failed at macOS Mach-port initialization with `bootstrap_check_in ... Permission denied (1100)`. Approval for the specific local QA command allowed isolated Chromium to launch. Browser sandbox protection stayed enabled; no unrestricted computer access, existing browser profile, listening server, remote site, or deployment was needed.

The real `dist/` artifacts were fulfilled in-process at `http://asset-review.local/asset-security-dashboard/`. All other requests are rejected. Tests use a fresh isolated browser context and fictional data. The page clock is fixed at 2026-11-11 15:00 UTC for reproducible demo dates; the report separately records the actual execution timestamp.

- Chromium: **153.0.8010.12**.
- Playwright: **1.63.0**; axe-core: **4.13.0**.
- Command: `npm run qa:visual` — passed, exit 0.
- Evidence: [results.json](chromium/results.json), including production HTML hash, browser/tool versions, accessibility diagnostics, measured layout geometry, and gallery SHA-256 hashes.

## Coverage

| Viewport | Browser results |
| --- | --- |
| Desktop, 1440 × 900 | Passed overview, inventory/search/filters/empty state, findings, details, add/edit, validation, import/preview, confirmations, keyboard navigation, and layout checks. |
| Laptop, 1280 × 800 | Passed the same page/dialog checks, including keyboard scrolling in asset details and contained action footers. |
| Tablet, 768 × 1024 | Passed the same page/dialog checks; navigation, charts, table columns, and dialog geometry reviewed. |
| Mobile, 390 × 844 | Passed the same page/dialog checks; always-visible navigation, stacked controls, two-column inventory, and scrolling dialogs reviewed. |
| Additional 320px smoke check | Passed inventory overflow and scrolling add-editor checks with visible actions. |

The suite recorded **67 layout captures/checks**, with no page or table horizontal overflow. It exercised skip-to-content, Tab/Shift+Tab, visible navigation focus, Enter navigation, heading focus, modal focus containment, Escape dismissal, and focus restoration after canceling edit/delete.

Core workflows passed: add/edit/delete; recorded patch update reducing attention count from 6 to 5; text search and status/category filters; invalid editor submission; CSV preview without mutation; malformed-header rejection; a valid row followed by an invalid row rejecting the whole import; confirmed sample import; formula-protected export and maximum-length formula-name reimport validation; rendered imported records and added records after reload; and confirmed demo reset. Markup entered as a note remained literal text. No uncaught page errors or console errors occurred.

## Accessibility

**42 axe scans reported zero violations**, using WCAG 2 A/AA, 2.1 A/AA, and 2.2 AA tags. Ten states were scanned at each requested size: overview, inventory, asset details, edit editor, add editor, validation errors, CSV import, CSV preview, findings, and reset confirmation. Desktop import-error and delete-confirmation scans also passed.

Two minimal semantic fixes came directly from browser QA:

- Made the asset-details scroll body a named, keyboard-focusable region. Axe had identified inaccessible keyboard scrolling at laptop height; PageDown scrolling and the subsequent axe scans now pass.
- Added a group role to the already-labelled status summary. This resolves axe's indeterminate ARIA naming result without changing its appearance.

Axe returned indeterminate contrast checks for 14 text nodes across ten dialog scans because it could not resolve partially overlapping backgrounds. These remain visible in the JSON report, rather than being suppressed. Inspected the corresponding import, preview, reset, and import-error captures and reviewed the browser-computed foreground/background pairs: muted copy **5.28:1**, preview copy **6.92:1**, and import-error copy **7.30:1**, all above 4.5:1 for normal text. No obscured text was found in those captures.

This verifies the tested Chromium states. It is not a complete accessibility conformance certification; screen readers, physical mobile devices, Safari, and other engines were not exercised in this redesign review.

## Screenshot review

Replaced every prior gallery PNG with actual redesigned Chromium captures. Added laptop overview and desktop editor images. Rebuilt and inspected [visual-review.png](../../screenshots/visual-review.png), and rebuilt the [screenshot ZIP](../../screenshots/asset-security-dashboard-screenshots.zip) containing ten gallery images plus the contact sheet. Archive integrity and every PNG payload were checked against the gallery.

Inspected native-size overview captures at all four dimensions, desktop inventory/findings/details/editor, mobile inventory/findings/details/editor, keyboard-scrolled details, and CSV/confirmation states. Checked spacing, text size, control alignment, semantic colors, and clipping. Small secondary metadata remains intentionally compact; primary controls and form text remain readable at the tested sizes. No blocking overflow, spacing, alignment, or inconsistent-design issues remain. Dialog bodies deliberately scroll while actions remain visible.

The skip-link test initially left overview captures scrolled and focused. The capture workflow now blurs main and returns to the top after verifying the skip link; the final contact sheet was regenerated and inspected from that normal page state.

## Reproduce locally

After `npm ci`, run from the project directory on macOS:

```sh
npm run qa:visual
```

This builds production, downloads Chromium only if missing, runs checks without manual browser interaction, writes captures/report under `docs/verification/redesign/chromium/`, and refreshes `docs/screenshots/`, the contact sheet, and ZIP after assertions pass. Any failure exits nonzero and is recorded in `results.json`. The command uses pinned development dependencies; runtime dependencies are unchanged. `ASSET_QA_MODULES` can optionally reuse another installed tools environment. The optional `--webkit` engine remains available in the underlying script but was not part of this review.

The command regenerates images automatically; visually inspect them before accepting later changes. It does not publish anything.

## Final source verification

- `npm run lint` — passed.
- `node_modules/.bin/tsc --noEmit --strict` — passed.
- `npm run test` — all **34 tests** passed across three files.
- `npm run build` — passed.
- README screenshot descriptions, local links, prototype limitations, and QA instructions reviewed.

The redesign was preserved. Validation, deterministic rules, demo schema, persistence logic, atomic import implementation, and formula protection were not changed. No Git initialization, commits, remote changes, deployment, or publication occurred.
