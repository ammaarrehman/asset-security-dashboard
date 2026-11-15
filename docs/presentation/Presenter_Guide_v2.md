# Presenter Guide (deck v2)

**Deck:** `Asset_Security_Dashboard_CRC_Capstone_v2.pptx` · 6 slides · **about 4 minutes 35 seconds**

**Demo video:** `media/Demo_Recording.mp4` (94 seconds, also built into slide 5)

**How this deck works:** the words on each slide are what you say. Read them out loud in your own voice; small changes are fine. The speaker notes repeat the same words and add what to point at and what to say if someone asks. They are a backup, not a second speech.

The [original guide](Presenter_Guide.md) still matches the original deck, which is kept as a backup.

## The project in one breath

In my Cyber Ready Clinic meetings, I learned that an organization needs to know what devices it has and how they're protected. So I built a website where a small organization can list its devices and record whether updates, protection, and backups are in place. Simple rules point out gaps and suggest what to check next. **It only works from what people record.** It doesn't scan devices or verify their security. Every device in it is made up.

## Timing

| Slide | Starts | Length | What it's about |
| --- | --- | --- | --- |
| 1. Asset Security Dashboard | 0:00 | 25 s | Who I am and what I built |
| 2. Why I decided to build this | 0:25 | 40 s | Missing or outdated device information |
| 3. What my dashboard does | 1:05 | 40 s | Record, highlight gaps, suggest next steps |
| 4. Here's an example | 1:45 | 40 s | One laptop, before and after |
| 5. Let me show you | 2:25 | 1:40 | The 94-second video |
| 6. What I took away from this | 4:05 | 30 s | What I learned, what it doesn't do, thank you |
| **End** | **4:35** | | |

Read at an easy pace, the words on slides 1 to 4 and 6 take about a minute and a half altogether, so there is room to pause and point. The demo video is the only part with a fixed length. If you run long, shorten the pauses, not the sentences.

---

## Slide 1: Asset Security Dashboard (0:00 to 0:25)

**Say:**
> Hi, I'm Ammaar, and this is my Cyber Ready Clinic capstone. I built a dashboard that helps small organizations keep track of their devices and basic security information.

**Point at:** the screenshot when you say "a dashboard." It's the real overview page, with 18 made-up devices.

## Slide 2: Why I decided to build this (0:25 to 1:05)

**Say:**
> During my Cyber Ready Clinic meetings, I learned how important it is to know what devices an organization has and how they're protected. If that information is missing or out of date, it's harder to tell what needs attention.

**What the list shows:** the kind of simple list a small team might keep. Some answers are blank, one is a question mark, and one says "Not sure." Two devices also have real problems you would only notice by reading every row.

**Point at:** the list while you say the second sentence. Give the room a second to look at the blanks.

**If someone asks:** Outreach Laptop 03 has overdue updates. Intake Laptop 01 has no protection installed and backups turned off. Volunteer Tablet 02 and Warehouse Laptop 01 are missing answers.

## Slide 3: What my dashboard does (1:05 to 1:45)

**Say:**
> My dashboard puts device information in one place. You can record whether updates, protection, and backups are in place. Based on those records, it highlights gaps and suggests what to check next.

**Point at:** the four circles, left to right, during the last two sentences: your devices, the three protections, gaps get highlighted, what to check next.

**If someone asks:** the rules are fixed, so the same record always gives the same result. There's no score and no guessing. A missing answer counts as something to check, because not knowing is a risk too.

## Slide 4: Here's an example (1:45 to 2:25)

**Say:**
> This laptop's record shows overdue updates, so the dashboard flags it. Once someone confirms the updates are installed, they update the record and the issue clears.

**Point at:** **Before** on the left when you say "overdue updates" (Patch status Overdue, Needs attention, 1 finding), then **After** on the right when you say "the issue clears" (Patch status Up to date, Healthy, 0 findings). Both are close-ups of the same record in the real app.

**If someone asks:** the dashboard doesn't touch the laptop. A person installs the updates, checks that they worked, and then changes the record.

## Slide 5: Let me show you (2:25 to 4:05)

**Recommended: play the recorded demo.** It has a fixed length. Test playback once on the presentation computer before relying on it.

1. **Click the video once** to start it. In Keynote, press the space bar once.
2. While the overview is on screen, **say the slide text:**
   > Here's the dashboard running with 18 fictional devices. I'll show how changing one record updates the findings.
3. Then talk along with these cues. You don't need all of them. Use one line when you see each screen. The video zooms in on the record, the Patch status change, and the result, so the room can read them.

| Video time (approximately) | On screen | Say |
| --- | --- | --- |
| 0:00 | Overview: 18 total assets, 13 findings | (the slide text above) |
| 0:12 | Priority follow-ups | "These are the devices that need attention first." |
| 0:31 | Inventory opens | "I'll open the inventory." |
| 0:34 | Typing Outreach | "I'll search for Outreach Laptop 03." |
| 0:39 | The laptop's details, magnified: Patch status Overdue, finding Patches overdue | "Its updates are overdue, so there's a finding and a suggested fix." |
| 0:55 | Edit asset, magnified on Patch status | "In real life, someone installs the updates first. Then they change the record." |
| 0:59 | Patch status changes to Up to date, then Save changes | (continue the previous line) |
| 1:03 | The laptop shows Healthy; findings drop from 13 to 12 | "Now the laptop shows Healthy, and the findings went from 13 to 12." |
| 1:15 | The record reopens with 0 findings | (pause and point at the cleared finding) |
| 1:26 | Back on the overview: 10 healthy, 5 need attention | "The overview updates too." |
| 1:34 | Video ends | Move to slide 6. |

**Live demo instead (optional):** if you would rather click it yourself, do the same steps in the browser. Before presenting, click **Reset demo** in the side menu and confirm with **Reset demo data**, so the numbers match.

1. **Overview:** point at **Total assets 18**.
2. Point at **Priority follow-ups**.
3. Click **Inventory**. Click the search box and type **Outreach**.
4. Click **Outreach Laptop 03**. Point at **Overdue** and the **Patches overdue** finding.
5. Click **Edit asset**. Change **Patch status** to **Up to date**. Click **Save changes**.
6. Point at **Healthy** and at **Security findings 12**.

The live site may show the earlier design until the redesign is published. The button names and steps are the same in both designs.

## Slide 6: What I took away from this (4:05 to 4:35)

**Say:**
> One of the biggest things I learned is that good security starts with knowing what devices you have and what needs attention. My dashboard is a starting point for organizing that information. It doesn't scan devices or verify their security.

Then: **"Thank you."** Look at the room, not the slide, and stop there.

**If someone asks what it doesn't do:** it doesn't scan devices, install updates, check that protections really work, or prove compliance with a security standard. The QR code opens the live demo for anyone who wants to try it.

---

## Glossary

| Word | Simple meaning |
| --- | --- |
| **Asset** | Something an organization owns and must protect. Here, a device. |
| **Inventory** | The full list of devices and who uses them. |
| **Security control** | A protection that should be in place: security software, updates, or backups. |
| **Endpoint protection** | Security software on a device, like antivirus. |
| **Patch** | A security update that fixes a known weakness. |
| **Backup** | A saved copy of data so you can restore it. |
| **Finding** | A problem the dashboard spotted in the records. |
| **Remediation** | The fix, or the recommended next step. |
| **Scan** | Software checking real devices automatically. **This app does not scan.** |
| **Compliance** | Meeting an official security standard. **This app does not prove it.** |

## Five likely questions

**1. "Does it check the actual computers?"**
"No. It only checks what people type in. Checking real devices would need software on every computer and special permissions. Having an organized list is the first step before any of that."

**2. "Was this used by a real organization?"**
"No. It's a learning prototype, and every device in it is made up. It hasn't been used by any real organization."

**3. "Where is the data stored?"**
"Only in your own web browser. There's no server or login, and nothing is sent anywhere. That also means a team can't share one list yet."

**4. "Why show 'Unknown' instead of just leaving it blank?"**
"Not knowing is a risk too. If you don't know whether a laptop has backups, you can't count on them. Showing Unknown tells someone to go check."

**5. "What would you add next?"**
"Logins so a team can share one list, and reminders when a device hasn't been checked in a while. Later, it could pull information from tools that manage devices, so people don't have to type everything."

If you don't know an answer: "That's a good question. I didn't build that part, but I'd like to look into it."


## If something goes wrong

- **The video won't play:** stay on slide 5. Say the steps out loud using the table above, then go back to slide 4, which shows the before and after. Or open `media/Demo_Recording.mp4` directly in QuickTime.
- **No internet:** nothing in the deck needs the internet. The video is inside the file. The QR code needs internet only on the audience's phones.
- **PowerPoint or Keynote won't open the file:** present from `Asset_Security_Dashboard_CRC_Capstone_v2.pdf` and play `media/Demo_Recording.mp4` separately. Both are also in `Offline_Presentation_Package_v2.zip` (see the rehearsal checklist).
- **Running out of time:** skip the cue lines during the video. Never skip the last sentence on slide 6 ("It doesn't scan devices or verify their security").

## Video playback check (once, on the computer you will present from)

The demo video is stored inside the deck file, so this also proves the deck works without internet.

1. Turn **Wi-Fi off**.
2. Open `Asset_Security_Dashboard_CRC_Capstone_v2.pptx` in Keynote. Keynote converts it into a new presentation; the original file is not changed.
3. Click slide 5 in the slide list, then choose **Play ▸ Play Slideshow** (Option-Command-P).
4. Press the **space bar once**. The demo plays. Check that Inventory opens at about 0:31 and the search starts around 0:34, Patch status changes to **Up to date** at about 0:59, **Healthy** and **12** findings appear at about 1:03, the final overview appears around 1:26, and it stops at 1:34 on that overview (Healthy 10, Needs attention 5). There is no sound; that is expected.
5. Press **Esc**, close the presentation, and choose **Don't Save** (or **Delete**). Turn Wi-Fi back on.

If the video shows only a still picture, play `media/Demo_Recording.mp4` in QuickTime instead (see "If something goes wrong").

In PowerPoint, the same check is: **Slide Show ▸ Play from Current Slide** on slide 5, then click the video once. PowerPoint was not available for testing.

## Rehearsal checklist

- [ ] Do the video playback check above, with Wi-Fi off.
- [ ] Click through all six slides once in slideshow mode.
- [ ] Practice the whole talk once with a timer. Aim for about 4:35. Stop at 5:00 no matter what.
- [ ] Practice saying the slide 5 sentences while the video starts.
- [ ] If you'll use PowerPoint instead, open the deck there once and check that the video plays.
- [ ] Build the offline package (in `docs/presentation/source`, run `npm run package`) and copy `Offline_Presentation_Package_v2.zip` to a USB drive. It holds the deck, the PDF, the demo video, this guide, the slide preview, the QR code, and the sample CSV. It is generated rather than stored in the repository, because every file in it is already there.
- [ ] If doing a live demo: click **Reset demo** right before you present.

## Fonts

The deck uses Helvetica Neue, which comes with every Mac. On Windows, PowerPoint swaps in a similar font and line breaks can shift a little, so click through once or present from the PDF.

## For whoever maintains the deck

Everything is generated by scripts in `source/`. From the repository root, after `npm run build`:

| Script | What it does |
| --- | --- |
| `node docs/presentation/source/record-demo.mjs` | Records `media/Demo_Recording.mp4` from a real Chromium session (about 2 minutes). It records at 1.5x and magnifies the key moments in post |
| `node docs/presentation/source/capture-status-fields.mjs` | Captures slide 4's close-ups of the real Patch status field and status line, before and after |
| `node docs/presentation/source/demo-walkthrough.mjs` | Clicks through the demo and fails if any number in this guide is wrong |
| `node docs/presentation/source/render-icons.mjs` | Makes the icons from the app's own icon set |
| `cd docs/presentation/source && npm install && npm run build` | Builds the PowerPoint |
| `cd docs/presentation/source && npm run validate` | Checks drawing IDs, relationships, notes, the unchanged recording, and guide/notes cue agreement |
| `docs/presentation/source/render-slides.sh <deck.pptx> <outDir>` | Renders the slides in Keynote to a PDF and 1920 × 1080 PNGs |
| `node docs/presentation/source/render-previews.mjs <previousSlidesDir>` | Builds the preview and review sheets |
| `cd docs/presentation/source && npm run package` | Builds and verifies `Offline_Presentation_Package_v2.zip` |

The approximate movie cues come from `source/demo-cues.json`. Its video hash prevents a new recording from silently keeping the old timestamps. After changing a recording, inspect its frames and update the manifest and guide together before rebuilding. `npm run build` also runs the independent package validator. The current video is unchanged.
