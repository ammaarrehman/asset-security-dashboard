# Presentation story and pacing review (before integration)

**Historical review:** the owner subsequently approved the 73-second video for integration. This report records the earlier comparison and preservation state. Use `../Presenter_Guide_v2.md` and `Natural_Script.md` for the final wording, timings, and playback cues.

**Recommendation: use the 73-second alternate for the CRC talk.** Both versions can fit under five minutes. The original is unnecessarily long for this particular story because it spends about 30 seconds on overview navigation and unrelated follow-ups before opening the inventory. The alternate reaches the inventory at 0:09 and the laptop at 0:18, while preserving the entire explanation, edit, Save action, and results at their original speed.

This review covers `release/audit-remediation` at `abca62d7446bf8902e38084721ca34d53704e70e`. The approved six-slide v2 PowerPoint and final MP4 in that worktree are byte-identical to the copies in the main workspace. Deliverables are separate files in this `story-review/` folder. Neither worktree’s approved deck or original recording was changed. No application changes, commits, push, merge, deployment, or publication occurred.

## What was actually inspected

The final MP4 is 94.000 seconds, 1920 × 1080, H.264, 30 frames per second, with no audio track. Its embedded copy in slide 5 matches the standalone file. I decoded all **2,820 frames**, reviewed their chronological frame sheets, enlarged critical moments, and checked the individual frames around transitions. Critical labels were also inspected in full-resolution source frames. I inspected all six approved slide renders, extracted each slide’s text and speaker notes from the actual PPTX, and compared them with the current presenter guide.

This is a frame-based editorial review. The delivery times below are estimates, not a measured rehearsal of the presenter’s voice. Native PowerPoint playback of the new standalone alternate has not been tested. The deck still contains the original 94-second video.

## Original recording: screen dwell and editorial assessment

Times below are rounded to a tenth of a second and include each screen’s entrance motion. The totals account for the complete 94 seconds.

| Source time | Duration | Screen or action | Assessment |
| --- | ---: | --- | --- |
| 0:00–0:09.9 | 9.9 s | Opening overview, pointer on totals and Needs attention | Enough orientation. Establish 18 devices and 13 findings, then move on. |
| 0:09.9–0:11.9 | 2.0 s | Scroll down | Understandable movement, but begins a detour. |
| 0:11.9–0:26.1 | 14.2 s | Priority follow-ups, Archive Workstation, Intake Laptop 01, category chart | The slowest part of the story. Introduces other devices that are never followed through. Adds feature breadth but little to the single-laptop example. |
| 0:26.1–0:27.9 | 1.8 s | Scroll back up | Reverses the previous scroll. Easy to remove with the detour. |
| 0:27.9–0:30.1 | 2.2 s | Overview and cursor moving to Inventory | Preserve the final move and click so the next action remains readable. |
| 0:30.1–0:38.7 | 8.6 s | Inventory, search for Outreach, open laptop | Useful, legible sequence. No need to speed up typing or the click. |
| 0:38.7–0:54.8 | 16.1 s | Laptop details, overdue status, finding, recommended action | Generous but useful narration space. Explains the evidence and the real-world next step. Some still holds can feel slow after slide 4, so avoid repeating the whole slide. |
| 0:54.8–1:02.9 | 8.1 s | Edit asset, patch value changes, Save changes | Essential causal sequence. Keep intact. |
| 1:02.9–1:14.1 | 11.2 s | Saved inventory, zoom on Healthy, pan to 12 findings | The most important outcome. Count and status get separate visual emphasis. |
| 1:14.1–1:22.3 | 8.2 s | Reopened record, Up to date, Healthy, zero findings | Confirms the change inside the record. Repeats the result, but strengthens understanding. Keep for a general audience. |
| 1:22.3–1:25.0 | 2.7 s | Close record, navigate to Overview | Clear transition back to the whole inventory. |
| 1:25.0–1:34.0 | 9.0 s | Final overview, 18 total, 10 Healthy, 5 Needs attention, 3 Unknown | A useful final hold. Leaves time to connect one changed record with the overall view. |

### Cursor and visibility

The large white pointer, smooth movement, click rings, and existing zooms make the actions easy to follow. The meaningful targets stay visible long enough. Do not add spoken instructions for every pointer movement.

One limitation is already in the footage: the native patch-option menu is not visible. The pointer rests on the field and its value changes directly. The change itself is real and clearly readable. Say “I change Patch status to Up to date” to direct the audience’s attention. Do not describe a menu they cannot see.

The field changes at source **0:58.800, frame 1764**. Save completes at about **1:02.867, frame 1886**. The changed value remains visible for roughly four seconds before the editor closes, with the existing zoom easing out during that interval. The Healthy row then gets about five seconds of close-up, followed by about five seconds emphasizing the findings badge. The reopened record provides another eight seconds to see zero findings. These intervals remain untouched in the alternate.

The initial details zoom quickly crops the one-finding summary near the top. Use slide 4’s large, stable one-to-zero comparison for that count. In the video, narrate the clearly visible Overdue field and Patches overdue finding. The final zero-finding summary is visible much longer.

### Repetition and narration

Slide 4 already explains the before and after. Spending another 40 seconds on that slide, then watching unrelated follow-ups, delays the payoff. Shorten the spoken time on slide 4 to about 20 seconds and treat it as a preview. During the video, explain the record’s evidence, the prerequisite of installing/checking updates, and the resulting status change.

Healthy in this prototype means no gaps were flagged from the recorded values. The natural script keeps that distinction without interrupting the story. All on-screen devices are fictional. The video supports “a clearer device list helps people identify follow-up” and “one corrected record updates the findings.” It does not demonstrate installation of patches or verification of a real device.

## The separate 73-second alternate

File: [Demo_Recording_73s.mp4](Demo_Recording_73s.mp4)

The edit keeps source **[0:00, 0:08)** followed by **[0:29, 1:34)**. Only **[0:08, 0:29)** is removed: 21 seconds, or 22.3% of the original. There is one hard cut at alternate 0:08. Both sides show the same overview and unchanged data. The cursor jumps from the summary area to the left side, then follows its genuine recorded movement onto Inventory before the click at 0:09.1. This is a visible editorial cut, not an implied application status change.

The native export uses H.264 passthrough. There is no speed change, new zoom, inserted still, synthetic screen, crossfade, or replaced interface. The complete source interval from 0:29 to the end remains continuous. The alternate is 73.000 seconds, 2,190 frames, and silent, like the original.

Every alternate frame was decoded. All 2,190 decoded 480 × 270 inspection thumbnails match the corresponding source thumbnails byte for byte, with zero mismatches. This checks the retained frame order and the cut, in addition to the passthrough export. [frame-verification.json](frame-verification.json) records the result. [edit-manifest.json](edit-manifest.json) records frame ranges, cues, and hashes. The original and alternate full frame sheets remain in `/private/tmp/asset-story-review/` as local inspection evidence.

| Moment | Original | Alternate | Preserved? |
| --- | ---: | ---: | --- |
| Inventory entrance begins | 0:30.1 | 0:09.1 | Complete click and entrance |
| Laptop details entrance begins | 0:38.7 | 0:17.7 | Complete click and zoom |
| Edit sequence begins | 0:54.8 | 0:33.8 | Entire sequence |
| Patch reads Up to date | 0:58.8 | 0:37.8 | Every frame before and after |
| Save completes, Healthy appears | 1:02.9 | 0:41.9 | Entire result and zoom |
| Reopened record | 1:14.1 | 0:53.1 | Full eight-second confirmation |
| Final overview entrance | 1:25.0 | 1:04.0 | Full nine-second ending |
| End | 1:34.0 | 1:13.0 | Original final frame |

A 60-second cut is possible only with further trimming of useful explanation or result holds. The 73-second version is the stronger compromise for a CRC audience: it removes the detour while leaving the learning sequence comfortable to narrate.

## Six-slide wording critique against the CRC goals

These are spoken suggestions only. Keep all current titles, layouts, colors, typography, diagrams, screenshots, and slide order.

| Slide | CRC role | Concise critique and suggested treatment |
| --- | --- | --- |
| 1 — Asset Security Dashboard | Establish what I built | Clear introduction. Keep it. “Basic security information” is broad but the next slides explain it, so no extra definition is needed here. |
| 2 — Why I decided to build this | Why I built it; why visibility matters | The device list makes the problem concrete. “During my Cyber Ready Clinic meetings” is less personal than the intended story and no longer names Discover 5. Say “During Discover 5 in Cyber Ready Clinic…” and keep the consequence of missing/outdated information. Describe a lesson, without client details or claims of deployment. |
| 3 — What my dashboard does | How the app works | Strong, concise explanation. Keep “based on those records,” which prevents a scanning claim. Say “security software” for “protection” if the audience needs a concrete term. The diagram already covers the flow. Avoid a feature list. |
| 4 — Here’s an example | How it works, with cause and effect | The real close-ups support the story. “The issue clears” can sound as if the app fixed the laptop. Say “the recorded finding clears.” Preserve the person’s confirmation before editing the record. Around 20 seconds avoids repeating the demo. |
| 5 — Let me show you | Demonstrate how it works | Clear setup, but “changing one record updates the findings” repeats slide 4. Use the short opening cue once, then follow the actions. Explain the prerequisite before the field changes. Leave silence for Healthy and zero findings. |
| 6 — What I took away from this | What I learned during CRC | “One of the biggest things I learned” and “a starting point” sound generic. Say “CRC taught me…” and add the concrete learning that missing information should stay visible. Keep the explicit scanning/verification limit and “Thank you.” |

All four goals are covered. The main wording improvement is making the personal lesson explicit on slide 2 and the learning more specific on slide 6. The other changes are small clarifications, not a new story or a redesign.

## Total presentation timing and choice

Use [Natural_Script.md](Natural_Script.md) for the complete read-aloud wording, cues for both videos, and a slide-by-slide rehearsal schedule. It has 171 words outside the demo. At 115–135 words per minute, those words take roughly 76–89 seconds before pointing and pauses. Allow roughly 35–60 seconds more for those pauses, and six seconds to start/advance the video. Video narration overlaps playback and must not be counted twice.

| Measure | Original | Alternate |
| --- | ---: | ---: |
| Video runtime | 1:34 | 1:13 |
| Rehearsal target with suggested script and pointing | **3:45** | **3:24** |
| Reasonable estimated delivery range | **3:30–4:10** | **3:09–3:49** |
| Existing guide’s full allowances, changing only runtime | 4:35 | 4:14 |
| Remaining margin under five minutes at rehearsal target | 1:15 | 1:36 |

Neither version inherently breaks the five-minute limit. Prefer the **73-second alternate** because the main example starts earlier and the same status change remains fully understandable. It also gives you room to speak naturally about Discover 5 and your learning. Keep the original as the slower backup if you want to discuss prioritization or take an audience question during playback.

The suggested script can be spoken over the current slides without changing them. Choose the video before anyone replaces the embedded media or revises the approved PowerPoint. This review does not change that deck or the existing offline package.

## Preservation and required checks

- Original MP4 SHA-256: `1954b55777deb9dad3d5d8c9e5cade487e25cb2dc3285d0da51c60fa5bcacb11`.
- Approved v2 PPTX SHA-256: `4aa9a4b5e55dfbae8691f4dfda5ebba743cdcc20c4349f30fc85b6e8fb8310d8`.
- Both originals were rechecked after the alternate was created. The embedded MP4 still matches the original.
- Required repository checks passed in the primary workspace: `npm run lint`, `npm run test` (49 tests), `npm run build`. Application source, package manifests, and relevant checked build configuration match the release candidate. No software remediation was performed.
