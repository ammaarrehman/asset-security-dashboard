# Asset Security Dashboard | CRC Capstone Presenter Guide

**Presentation length:** Approximately 5 minutes 30 seconds, including a live demo.

**Slides:** 6.

**Live demo:** https://ammaarrehman.github.io/asset-security-dashboard/

**Repository:** https://github.com/ammaarrehman/asset-security-dashboard

The PowerPoint also includes speaker notes. You can read these notes aloud, paraphrase them, or use this guide as a backup.

## Slide 1 | Introduction (0:00 to 0:30)

"Hi, I'm Ammaar. For my Cyber Ready Clinic capstone, I built Asset Security Dashboard. It's a simple browser-based inventory for small nonprofits. The goal is to make it easier to see which devices have recorded security gaps and what needs follow-up."

## Slide 2 | The problem (0:30 to 1:15)

"Small organizations often have laptops, desktops, tablets, and shared devices, but the information about them can be scattered. A spreadsheet might say a device exists without showing if its updates are current, if endpoint protection is enabled, or whether backups are configured. This makes it harder for a small team to know where to focus."

## Slide 3 | What I built (1:15 to 2:00)

"The app starts with 18 fictional nonprofit devices. You can add and edit assets, search and filter the inventory, and record basic security information. It generates findings based on those records and recommends a next step. You can also import and export CSV files. It runs locally in the browser, without a database or paid service."

## Slide 4 | How findings work (2:00 to 2:45)

"For example, when a record shows that patches are overdue, the tool flags that and suggests verifying the update. It also distinguishes an unknown value from a passing result. This is important because missing information does not mean a device is secure. These are rules based on entered information, not actual vulnerability scans."

## Slide 5 | Live demonstration (2:45 to 4:55)

1. Open the live demo and use **Reset demo** so you start with 18 fictional assets.
2. On **Overview**, briefly point out totals and the findings by category.
3. Open **Inventory**. Find **Outreach Laptop 03** and open its details. Explain the overdue patch finding.
4. Edit **Patch status** to **Up to date**, save, and show that the recorded finding changes. In a real organization, someone would verify the update before changing the status.
5. Choose **Import CSV**. Import the three-device `sample-assets.csv` from the project. Show the preview, confirm, then refresh to show that the records persist.

Do not promise that a specific number will change from 6 to 5. Date-based findings can change between now and presentation day. Focus on the record and what the app actually does.

## Slide 6 | Honest limits and closing (4:55 to 5:30)

"This is an educational prototype. It organizes records and shows basic hygiene gaps, but it does not scan devices or prove they're secure. I learned how important it is to make findings easy to understand without overstating what the data actually proves. The source code and live demo are available through the QR code. Thank you."

## Before your presentation

- [ ] Open the presentation in PowerPoint or Keynote. Check that the QR code and images display correctly.
- [ ] Open the [live app](https://ammaarrehman.github.io/asset-security-dashboard/) in your browser and verify it loads on the presentation Wi-Fi.
- [ ] Download the example CSV from [public/sample-assets.csv](https://github.com/ammaarrehman/asset-security-dashboard/raw/refs/heads/main/public/sample-assets.csv) into your Downloads folder.
- [ ] Use **Reset demo**, then leave the browser on **Overview**.
- [ ] Increase the browser zoom if projector text seems small. A laptop can show smaller text than an audience will be able to read.
- [ ] Practice the update and import workflow once, then reset again before presenting.
- [ ] Keep Slides 3 and 4 as backup screenshots in case the live website or Wi-Fi fails.
- [ ] Have the repo and demo URLs bookmarked.

## If the live demo fails

Say: "I also captured actual screenshots of the working application. Here is the overview, and this is the findings page. You can see how an overdue patch becomes a recommendation. The public repository includes browser testing and the source code." Then continue to Slide 6. Do not spend the remaining presentation time troubleshooting Wi-Fi.

## Questions you might get

**Does it really scan computers?**

No. It analyzes records entered by a person. Endpoint verification and scanning would require separate agents, APIs, and permission controls.

**What does 'Healthy' mean?**

The recorded fields did not trigger the included rules. It does not independently verify device security.

**Why no backend or login?**

I focused on a private, local-first prototype that was easy to demonstrate and did not require paid infrastructure. Shared inventory and authentication would be future features.

**How does it protect CSV exports?**

It escapes formula-like values to reduce spreadsheet formula injection risk. I also documented that spreadsheet programs can change the protection on re-save.

**What would you improve next?**

Shared multi-user records with access controls, historical changes, and deeper but properly authorized security verification. I would keep the current prototype's clear scope first.

**Did you use AI to build it?**

I used Codex to assist with implementation and testing. I defined the project scope, reviewed the functionality and visual design, and kept the security claims limited to what the app actually verifies.

## Future improvement ideas

See [future improvement ideas](../future-improvements.md) for optional overview, chart, typography, and remediation-context improvements. These ideas are not implemented features or changes required for the presentation.
