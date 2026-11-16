# Asset Security Dashboard

A browser-based asset inventory for small nonprofits. Track device ownership, endpoint protection, patching, and backups in one place. The dashboard applies explicit rules to flag recorded gaps and show what still needs verification.

Built as a Cyber Ready Clinic capstone. The app opens with 18 fictional nonprofit devices. The [current presentation](docs/presentation/Presenter_Guide_v2.md) has an estimated duration of approximately **3:29**, with a natural target of 3:20 to 4:00 and a hard maximum under five minutes. This is a plan, not a measured rehearsal.

**[Live demo](https://ammaarrehman.github.io/asset-security-dashboard/)** · [Source code](https://github.com/ammaarrehman/asset-security-dashboard)

Release checks and public verification are recorded in the [final release report](docs/verification/final-release/README.md). The [12 November publication report](docs/verification/publication/README.md) preserves the earlier public interface checks.

## Why this project

During Discover 5 in Cyber Ready Clinic, I learned why organizations need visibility into the devices they own and the security information recorded for each one. Missing owners, outdated records, and unknown controls make follow-up harder. This capstone explores that lesson with a fictional inventory, visible unknowns, and clear next actions. It contains no confidential client assessment data and makes no claim of client deployment or measured client outcomes.

## Try the live demonstration

1. Open the [live dashboard](https://ammaarrehman.github.io/asset-security-dashboard/) in a separate browser profile for a fresh fictional inventory, or choose **Reset demo** and confirm.
2. Open **Inventory**, search for **Outreach Laptop 03**, and open its details. Review the recorded overdue patch finding and recommended action.
3. For this fictional example, simulate that a person has installed and verified the updates. Choose **Edit asset**, change **Patch status** to **Up to date**, then save. The recorded patch finding clears. The app does not install or verify updates. Other findings depend on the saved values and current UTC review date.
4. Explore **Unknown** records, import the [sample CSV](public/sample-assets.csv) after its confirmation preview, or export the inventory. Refresh to see browser persistence. Reset the demo when finished.

The [73-second recorded demonstration](docs/presentation/story-review/Demo_Recording_73s.mp4) uses a fixed review date of 11 November 2026 so the presentation totals stay reproducible. The live app evaluates review dates using today in UTC.

## Capstone Presentation

Explore the Cyber Ready Clinic capstone through six slides and a timed presenter guide, including the approved 73-second recorded demonstration. The planned talk is approximately **3:29 (estimated)**, with a target of 3:20 to 4:00 and a hard maximum under five minutes. The materials use fictional nonprofit data and explain the prototype's scope and limitations. Playback and delivery should be rehearsed on the presentation computer.

- [Download the current PowerPoint (v2)](docs/presentation/Asset_Security_Dashboard_CRC_Capstone_v2.pptx)
- [Read the prepared Wednesday speaker notes](docs/presentation/Prepared_Speaker_Notes.md)
- [Read the current presenter guide](docs/presentation/Presenter_Guide_v2.md)
- [View the current slide preview](docs/presentation/Slides_Preview_v2.png)
- [Download the PDF fallback](docs/presentation/Asset_Security_Dashboard_CRC_Capstone_v2.pdf)
- [Watch the current 73-second demonstration](docs/presentation/story-review/Demo_Recording_73s.mp4)
- [Open the live application](https://ammaarrehman.github.io/asset-security-dashboard/)

The [presentation kit](docs/presentation/README.md) includes the recording, PDF fallback, and live-demo QR code. Archived originals remain available: [PowerPoint](docs/presentation/Asset_Security_Dashboard_CRC_Capstone.pptx), [guide](docs/presentation/Presenter_Guide.md), [preview](docs/presentation/Slides_Preview.png), and [outline](docs/capstone-outline.md). Their earlier timing is not the current under-five-minute plan. See [future improvement ideas](docs/future-improvements.md) for optional work beyond this presentation.

## Screenshots

Actual Chromium captures of the interface on this branch, using fictional demo devices and a fixed review date of 11 November 2026. See the [visual overhaul review](docs/verification/visual-overhaul/README.md) for results, coverage, and before-and-after sheets.

[Visual review contact sheet](docs/screenshots/visual-review.png) · [Download all screenshots](docs/screenshots/asset-security-dashboard-screenshots.zip)

![Overview with the 18-device demo, status totals, priority follow-ups, and charts](docs/screenshots/dashboard-desktop.png)

![Relationship diagram linking assets, recorded controls, findings, and next actions](docs/screenshots/relationship-diagram.png)

<details>
<summary>Inventory, findings, and responsive layouts</summary>

![Desktop inventory showing seven Windows devices, their owners, and security statuses](docs/screenshots/inventory-desktop.png)

![Overview at 1280 by 800 with the summary strip and two charts](docs/screenshots/dashboard-laptop.png)

![Asset details for Outreach Laptop 03 showing the overdue patch finding and recommended action](docs/screenshots/asset-details.png)

![Desktop asset editor with grouped identity, recorded controls, and review fields](docs/screenshots/edit-asset-desktop.png)

![Security findings with recorded gaps, unknown information, and recommended actions](docs/screenshots/security-findings.png)

![Tablet dashboard with top navigation, charts, and all inventory columns visible](docs/screenshots/dashboard-tablet.png)

| Mobile dashboard | Mobile inventory | Mobile asset editor |
| --- | --- | --- |
| ![Dashboard with mobile navigation, status totals, charts, and inventory preview](docs/screenshots/dashboard-mobile.png) | ![Mobile inventory with device names and security status side by side](docs/screenshots/inventory-mobile.png) | ![Mobile edit form with visible cancel and save buttons](docs/screenshots/edit-asset-mobile.png) |

</details>

## Features

- Overview with total devices, three recorded security statuses, priority follow-ups in a documented fixed order, findings by category, device types, and a diagram of how recorded values lead to findings.
- Searchable, filterable inventory with add, edit, and confirmed delete.
- Device details with recorded controls, findings, and recommended actions.
- CSV import with validation and a confirmation preview. CSV export includes the full inventory and escapes formula-like cells.
- **Reset demo** restores the fictional dataset after confirmation.

## Run locally

Use Node.js 24.12 or later.

```sh
npm ci
npm run dev
```

Open the address printed by Vite, typically [http://localhost:5173/asset-security-dashboard/](http://localhost:5173/asset-security-dashboard/).

## Security rules

| Recorded condition | Finding | Recommended first step |
| --- | --- | --- |
| Endpoint protection is Missing | Endpoint protection missing | Enable approved protection and verify it is running and current. |
| Patch status is Overdue | Patches overdue | Schedule security updates and verify the result. |
| Backup status is Disabled | Backups disabled | Enable an approved backup process and test a restore. |
| Any of the three controls is Unknown | Security information missing | Verify the missing controls and update the record. |
| Review date is missing | Review date missing | Review the device and enter the date. |
| A saved review date is after today in UTC | Review date is in the future | Verify and correct the date. |
| Last review is more than 90 UTC calendar days old | Device review overdue | Recheck the device and update the review date. |

**Needs attention** means at least one recorded gap. **Unknown** means the record needs verification and the rules flagged no recorded gaps. **Healthy** means the record is complete for these checks and the rules flagged no gaps. It provides no assurance about the device itself. A device may contribute to several finding categories.

## CSV format

Start with [the sample CSV](public/sample-assets.csv). Use UTF-8 and keep all nine column names, in any order. The device name and device type are required. Blank protection, patch, and backup values become **Unknown**. Review dates use `YYYY-MM-DD` and must be today or earlier in UTC. The editor and importer apply the same field rules.

Imports append devices after confirmation and assign new IDs. Reimporting the same file adds new records. An invalid row rejects the full file. Files are limited to 3 MiB, and the inventory holds up to 1,000 devices. Exports quote every data field and prepend a protective apostrophe to formula-like text. Import removes one protective apostrophe from such fields so the values round-trip. If you edit an export in a spreadsheet, keep formula-like fields formatted as text. Some spreadsheet programs can remove the protection when saving a CSV again. [OWASP CSV injection guidance](https://owasp.org/www-community/attacks/CSV_Injection)

## Technology and limitations

React, strict TypeScript, Vite, Tailwind CSS, Lucide, Vitest, and browser LocalStorage.

Records stay in the current browser profile and site origin. Scripts on the same origin can access them. Records aren’t automatically shared with other users or devices. Clearing site data removes saved records. If storage is blocked, full, or unreadable, the app warns you and keeps session changes in memory so you can export them before leaving. CSV files are plain text.

This browser-only educational prototype evaluates manually entered records using deterministic hygiene rules. It **does not scan real devices, install security updates, independently verify security controls, prove compliance, or synchronize inventories across users**. It has no authentication or server. Use fictional demonstration data; do not enter confidential client assessment information.

## Testing and production build

```sh
npm run lint
npm run test
npm run build
npm run qa:visual
npm run preview
```

Vitest covers findings, status classification, CSV validation and export safety, inventory operations, and storage failure handling. The build checks TypeScript and writes the static app to `dist/`. Vite uses `/asset-security-dashboard/` as its base path for GitHub Pages.

On macOS, `npm run qa:visual` builds the production app and uses Playwright Chromium to check 1440×900, 1280×800, 768×1024, and 390×844 layouts, plus 320px and 600/621/640/660/680/700px reflow, keyboard interaction, inventory workflows, CSV import/export, and refresh persistence. It runs axe-core accessibility scans and captures real browser screenshots under ignored `test-results/browser-qa/`, or `ASSET_QA_OUTPUT` when supplied. All review images stay there. Playwright and axe-core are pinned development dependencies; the command downloads Chromium if it is missing. The app is loaded through local request interception at the configured base path, so no listening server or deployment is needed. A fresh isolated browser profile keeps existing browser records untouched.

Failures produce a nonzero exit status and `results.json` in the chosen output folder. Replacing committed captures, galleries, comparison images and the ZIP requires the explicit `--update-gallery` option (`npm run qa:update-gallery`) and happens only after browser assertions pass. Output under `docs/` is rejected without that option. The [earlier approved report](docs/verification/visual-overhaul/chromium/results.json) remains available. Inspect generated images after each run. Automated checks do not establish complete accessibility conformance or replace assistive-technology testing.

GitHub Actions runs a clean install, lint, tests, TypeScript checks, and the production build on pull requests targeting `main` and on every push to `main`. Only main builds deploy `dist/` to GitHub Pages. The workflow also supports manual dispatch and serializes deployments. [Deployment runs](https://github.com/ammaarrehman/asset-security-dashboard/actions/workflows/deploy-pages.yml)

To run the same browser suite against the public deployment without changing the screenshot gallery:

```sh
ASSET_QA_URL=https://ammaarrehman.github.io/asset-security-dashboard/ \
ASSET_QA_OUTPUT=/tmp/asset-security-live-qa \
node scripts/verify-browser.mjs
```

## License

[MIT](LICENSE), copyright 2026 Ammaar Rehman.
