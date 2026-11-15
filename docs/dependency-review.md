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
