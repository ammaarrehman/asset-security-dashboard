# Targeted audit remediation — 14 November 2026

**Historical verification record:** the timings and recording references below describe the earlier audit/design state. The owner later approved the 73-second recording and final spoken wording. Current timings and integration checks are in [final presentation verification](../final-presentation/README.md) and the [current presenter guide](../../presentation/Presenter_Guide_v2.md).

Local work only. The approved visual design, six-slide wording, 94-second recording,
fictional dataset, security rules, original presentation and existing galleries are preserved.
No public main update, push, merge or deployment is authorized by these checks.

## Issue resolutions

| Audit finding | Targeted resolution |
| --- | --- |
| Slide 5 drawing ID collision | PptxGenJS 4 derives media IDs from relationship ordinals and text IDs from object ordinals. The generator now emits the movie immediately after the title and before the introduction, aligning the ordinals without changing geometry. It rejects duplicate IDs before writing the output. An independent XML/package validator also checks every part. |
| 621px page overflow | The scrolling table now contains its absolutely positioned hidden text (`position: relative`). Legitimate table scrolling remains; no visible breakpoint or design change was needed. |
| Early movie cues | Notes and guide now share a verified manifest bound to the unchanged MP4's SHA-256. Approximate cues: inventory 0:31, search 0:34, details 0:39, editor 0:55, patch change 0:59, saved result 1:03, final overview 1:26. Earlier timeline claims are corrected. |
| Primary links selected v1 | Both READMEs feature the v2 deck, guide and preview, and the planned under-five-minute timing. The original kit remains linked as an archive. |
| QA output could overwrite tracked review images | Default QA goes to ignored test output. A custom output setting also controls the comparison sheet. Writes under docs and gallery replacement require explicit `--update-gallery`; four regression tests cover destination policy. |
| Seven moderate development entries | Evaluated current registry versions and the installed call path. The latest compatible tooling still uses affected minimatch 10.2.6. Retained pins with a documented limited development-only risk; production audit remains zero. See [dependency review](../../dependency-review.md). |
| Obsolete ZIP in redesign history | Do not push the redesign branch. Prepare a separate local candidate with main as its sole parent and the exact final reviewed tree, verify newly reachable objects, and repeat release checks. Preserve the existing branch and commits. |

## Checks executed on the remediation tree

- Lint, all 49 unit tests (six files), strict TypeScript and production build passed.
- Chromium 153.0.8010.12: 98 layout checks/captures, 52 axe scans, zero violations and no page errors. Includes CRUD, CSV atomic rejection/export protection, persistence, reset, keyboard focus, reduced motion and follow-up ordering.
- At 600, 621, 640, 660, 680 and 700px, document scroll width equals viewport width. Overview, inventory, findings and add dialog were checked. The inventory at 621–660px scrolls inside its named region by keyboard.
- The independent PowerPoint validator passed six slides, 63 relationships, unique drawing IDs, notes matching visible speech, all 11 guide/notes cue rows, and the identical embedded video. Negative duplicate-ID regression tests pass.
- Keynote opened and rendered the before/after PPTX files. All six 1920×1080 slides had zero changed pixels. This is a rendering check, not native PowerPoint slideshow playback.
- Native AVFoundation fully decoded 2,820 frames: 94.0 seconds, H.264, 1920×1080, 30fps, no audio track. One-second OCR samples and extracted cue frames support the corrected guide. The video was not re-recorded.
- The offline package regenerated and verified seven unpacked files against their sources. The PDF fallback and approved slide previews need no replacement because visible slides are unchanged.
- All 43 relative links in the root README, presentation README and guide resolve to local files. No claim is made that unpublished v2 assets already exist on public main.
- SHA-256 preservation checks cover the video, original presentation kit and approved screenshot/review images. QA with a temporary output folder left these files untouched.
- Gitleaks history scanning found no leaks. Directory/archive scans and complete-tree checks are repeated on the clean local release candidate; per-run evidence stays outside tracked screenshots.

## Remaining limitations

Native Microsoft PowerPoint playback, Windows font substitution, physical projector
readability and a complete human timed rehearsal remain untested. Keynote rendering and
video decoding do not prove slideshow playback on the presentation computer. The 4:35
allocation is a budget; say slide 5's introduction over its 94-second movie. The seven
moderate development dependency entries remain disclosed, not described as patched.

## Release procedure

Keep all existing redesign commits local. A separate release candidate must have current
main as its parent and an identical final file tree. Verify that neither the obsolete
96,801,622-byte ZIP blob nor the old redesign commits are newly reachable. Repeat lint,
tests, TypeScript, build, Chromium/accessibility/reflow, presentation structure/rendering,
video/cue, offline-package and secret checks on that candidate. Confirm the personal Git
identity and conditional configuration before creating any local commits.

Only the owner can approve subsequent publication. After approval, publish the clean
candidate through a reviewed PR, update main without rewriting its public history, let
Pages finish, and verify the live build, v2 downloads and QR before announcing the release.
