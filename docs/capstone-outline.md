# Capstone presentation outline

**Asset Security Dashboard · Cyber Ready Clinic · 5 minutes 30 seconds**

| Time | Topic | What to show or say |
| --- | --- | --- |
| 0:00–0:35 | The problem | A nonprofit has laptops, tablets, and shared devices. When teams track updates, backups, and protection separately, it's hard to see what needs follow-up. |
| 0:35–1:20 | Overview | Start with **18** fictional devices. Explain what **Healthy**, **Needs attention**, and **Unknown** mean for recorded data. Point out that a device can contribute to several findings. |
| 1:20–2:35 | Follow a finding | Click **Needs attention**, search for **Outreach Laptop 03**, and open its overdue patch finding. Describe how the owner would verify an update. Simulate recording that verification by editing **Patch status** to **Up to date** and saving. The laptop disappears from the filtered view, and the dashboard count drops from **6** to **5**. |
| 2:35–3:30 | Handle unknowns | Go back to **Overview**, select **Unknown**, and open **Volunteer Tablet 02**. Show its unknown controls and missing review date. Explain the 90-day review rule and why a recorded gap takes priority over missing information. |
| 3:30–4:45 | Import and refresh | Open **Inventory**, choose **Import CSV**, and select the [sample CSV](../public/sample-assets.csv). Show the three-device preview, confirm the import, and refresh. The overview now shows **21** devices. Mention that a single invalid row rejects an import and that exports escape formula-like text. |
| 4:45–5:30 | Scope and close | Point to the browser storage disclosure. Explain that reviewers verify controls themselves, record the results, and use the findings to plan follow-up. |

Before presenting, reset the demo dataset in the browser used for the presentation and keep the sample CSV ready for the import. Return to **Overview** before beginning.
