# Development dependency review — 14 November 2026

The independent audit reported seven moderate package entries from one advisory,
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
The affected installed package is `minimatch` 10.2.6 under
`@typescript-eslint/typescript-estree`, reached through the development-only
`typescript-eslint` dependency. It is not part of the browser production bundle.

Registry metadata checked during remediation:

- Latest `typescript-eslint`: 8.72.2. Its estree package still requests `minimatch ^10.2.2`.
- Latest compatible minimatch 10 release: 10.2.6, already installed and locked here.
- The advisory identifies 11.0.1 as patched. It is outside the consumer's declared major range.

Updating TypeScript ESLint to the current release would therefore leave this advisory
in place. Forcing minimatch 11 underneath a consumer that declares version 10, or
accepting npm's suggested forced tooling downgrade, would introduce an unverified
compatibility change without being needed for this presentation prototype. No forced
fix or dependency/lockfile change was made.

The documented risk is development-tool availability when processing attacker-controlled
glob patterns with minimatch's `optimizationLevel >= 2`. The installed minimatch defaults
to level 1. The inspected TypeScript ESLint call passes only `{ dot: true }` for its
`allowDefaultProject` patterns, and this project's ESLint configuration does not enable
that project-service path. This limits the demonstrated exposure; it is not a claim that
the package is patched or that future tooling configurations are safe.

For this browser-only educational release, retain the current pins and record the seven
moderate development findings as a known limitation. Use reviewed, repository-controlled
lint configuration. Reassess when the consumer supports a patched release or when enabling
typed project-service linting or accepting external glob configuration. A compatible
update must pass lint, all tests, TypeScript and the build before adoption.

The production-only audit reports **zero vulnerabilities**. Full audit results remain
seven moderate entries, zero high and zero critical; seven entries do not represent
seven independent vulnerabilities. Remediation and release-candidate audit reports are
retained with the temporary verification evidence identified in the final handoff.


## Final release recheck — 16 November 2026

A fresh locked install and registry audit confirmed the same seven moderate app-development entries and zero production app vulnerabilities. No app dependencies changed.

The separate `docs/presentation/source` install reports **two high advisory entries**: `image-size` 1.2.1 and its dependent `pptxgenjs` 4.0.1. They represent parser denial-of-service advisories [GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq) and [GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr) for crafted JXL, HEIF, or ICNS images. This is presentation authoring tooling, absent from the browser app and from the delivered PPTX/PDF/video runtime.

The generator imports the package's ESM entry. Inspection of that installed entry found no `image-size` import or require. The generator supplies reviewed repository PNG files, explicit dimensions, and data-URI PNG posters; it accepts no uploaded or remote images. Offline packaging uses JSZip rather than the image parser. This makes the reported parser path nonblocking for publishing these already generated, hash-verified artifacts. It does not make the dependency patched or safe for arbitrary future inputs.

The current `pptxgenjs` release still declares `image-size ^1.2.1`; patched image-size 2.x is outside that range. npm proposes a generator downgrade to 4.0.0. Retained the approved generator pins rather than applying a cross-major override or unverified downgrade during release. Review an upstream-compatible fix before expanding authoring inputs. Only repository-controlled assets should be used in the meantime. Audit JSON is retained in the final release verification folder.
