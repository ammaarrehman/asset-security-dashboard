# Final capstone presentation integration

Prepared on `release/audit-remediation`, starting clean at `abca62d7446bf8902e38084721ca34d53704e70e`. This report preserves the 14 November integration checks before publication. The owner authorized the final release on 16 November. See the [final release report](../final-release/README.md) for current commit, publication, and public deployment checks. The application design was unchanged by the integration.

## Final files

- [PowerPoint](../../presentation/Asset_Security_Dashboard_CRC_Capstone_v2.pptx), regenerated from the actual source, exactly six slides with notes and the approved 73-second video embedded on slide 5.
- [Six-slide preview](../../presentation/Slides_Preview_v2.png) and [PDF fallback](../../presentation/Asset_Security_Dashboard_CRC_Capstone_v2.pdf), rendered through Keynote from that PPTX.
- [Final natural script](../../presentation/story-review/Natural_Script.md) and [presenter guide](../../presentation/Presenter_Guide_v2.md), with synchronized wording, timing, and all 13 demo cues.
- [Preferred 73-second recording](../../presentation/story-review/Demo_Recording_73s.mp4). The [94-second original](../../presentation/media/Demo_Recording.mp4) remains an unchanged archive.
- `docs/presentation/Offline_Presentation_Package_v2.zip`, generated and ignored by Git, contains eight verified files and preserves the `story-review/` paths used by the guide. Size is about 60.7 MB.

## Wording and story

The approved design stays intact. Slide 1 is unchanged. Slide 2 names Discover 5 and keeps the connection between missing information and follow-up. Slide 3 uses “security software” for a more concrete explanation of protection. Slide 4 says “the recorded finding clears,” preserving the distinction between editing a record and fixing a device. Slide 5 opens with one laptop's record. Slide 6 explains the lesson of keeping missing information visible and keeps the scanning/verification limit.

All main spoken paragraphs are visible on the slides. Demo narration is the exception and is available in notes, the guide, and the natural script. The script uses simple language, has no em dashes in the spoken slide text, uses fictional records, and makes no claims of client deployment, scanning, patch installation, control verification, or compliance proof.

## Speaking plan

| Slide | Talk time | Allocation |
| --- | --- | --- |
| 1. Introduction | 0:00 to 0:20 | 20 s |
| 2. Discover 5 and visibility | 0:20 to 0:55 | 35 s |
| 3. How it works | 0:55 to 1:20 | 25 s |
| 4. Before and after | 1:20 to 1:40 | 20 s |
| 5. Recorded demonstration | 1:40 to 2:59 | 79 s, including 73 s playback |
| 6. Learning and close | 2:59 to 3:29 | 30 s |

**Estimated total: 3:29, about 3:30.** Target a natural 3:20 to 4:00 and finish under five minutes. There are 165 spoken words outside the demo, including “Thank you.” The allocations include pauses and pointing. Demo speech overlaps the fixed video runtime. No filler was added, and no timed human rehearsal is claimed.

Main video moments are relative to playback: Inventory 0:09, laptop 0:18, edit 0:34, Up to date 0:38, Save/Healthy 0:42, findings badge 0:48, zero findings 0:54, final overview 1:04, end 1:13. Exact frame times remain 37.800 s for the patch change and 41.867 s for the saved result.

## Quality checks

- Required `npm run lint`, `npm run test` (49 tests in six files), and `npm run build` passed on the candidate. `git diff --check` passed.
- Independent package validation passed six slides, 63 relationships, unique drawing IDs throughout the package, no unresolved references, no external media dependencies, six speaker-note parts, visible wording matching notes/guide/script, matching slide timings, and all 13 guide/script/note cues.
- The embedded MP4 is byte-identical to the approved preferred source, SHA-256 `575d34297172b3f73e80b7376091cb58e18263927a34d6eb7f71466fbf8e5cad`.
- The extracted embedded MP4 fully decoded: 2,190 frames, exactly 73 seconds, 1920 × 1080, no audio. Every presentation timestamp matches its 30-fps position, including the cut. The frame cadence check uses actual timestamps rather than AVFoundation's nominal-rate estimate for the trimmed file.
- Inspected the frames immediately before/after the patch change and Save, the Healthy result, and the zero-findings confirmation. OCR supports the cue labels. The zero/letter-O OCR ambiguity was checked visually against the actual zero-finding frame.
- Rendered and inspected all six final slides individually at 1920 × 1080. No clipped wording or unintended overlaps were found. Every native slide-object transform is unchanged. The cover is pixel-identical to the approved render. All 14 embedded PNGs are unchanged, including the screenshots, texture, status close-ups, icons, poster, and QR.
- Decoded the QR from the actual rendered slide 6: `https://ammaarrehman.github.io/asset-security-dashboard/`.
- The PDF fallback has exactly six pages, with the updated wording present on every page.
- The offline package passed unpacked-file hash verification for all eight files. Its standalone video matches the video inside the deck. Guide/script relative paths work inside the unpacked package.
- Three negative validation checks correctly reject changed guide speech, a changed natural-script cue, and a changed guide timing allocation.
- Preservation checks cover 238 application, configuration, original-kit, media, and gallery files. None changed. The 94-second archive SHA-256 remains `1954b55777deb9dad3d5d8c9e5cade487e25cb2dc3285d0da51c60fa5bcacb11`.

[Machine-readable final checks](checks.json) records hashes, geometry, QR, video, PDF, package, and consistency evidence. The earlier story review and its baseline hashes remain explicitly labeled as pre-integration history.

## Remaining manual checks

1. Play the embedded video offline in slideshow mode in the actual presentation app and computer. Confirm the Save action, Healthy result, zero findings, and the 1:13 endpoint. Native PowerPoint or Keynote slideshow playback was not verified in this integration task. Keynote rendering is a separate check.
2. Rehearse the full talk aloud with a timer. Aim for 3:20 to 4:00 and finish under five minutes.
3. Check font substitution on Windows if applicable, projected readability from the room, and scanning the projected QR code. The rendered QR destination was verified, but a physical projector was not tested.
