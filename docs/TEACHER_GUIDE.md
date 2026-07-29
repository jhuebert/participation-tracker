# Participation Tracker — Teacher Guide

A quick how-to for running class with Participation Tracker.  
*(Deploy/install is handled by your IT setup — this guide is classroom use only.)*

---

## Modes

| Mode | Use when… |
|------|-----------|
| **Teacher** | Grade laptop only — full controls, leaderboard, manage classes |
| **Student** | Projector / second screen has its own browser tab — shows the picked name large |
| **Split** | Same machine for slides + picker — PowerPoint left, tracker right |

Open Student mode on the projector **before** you start picking. Teacher and Student tabs stay in sync automatically (same browser profile on the same computer).

Tip: bookmark or use `#/student`, `#/teacher`, `#/split` in the URL.

---

## First-time setup

1. Open **Manage**.
2. Enter a **class name** and paste student names (**one per line**).
3. Click **Create class**.
4. Optional: **⚙️ Settings** → adjust weighted picks and scoring (global for all classes).
5. **Export data** occasionally so you have a backup JSON file.

### Edit a roster later

On **Manage**, click **Edit** on a class to rename the class, rename/remove students, or add students. Stats stay with a student when renamed.

---

## Daily flow (Teacher or Split)

1. Choose the class in the top bar.  
   Everyone starts **present**; uncheck absences.
2. Ask a question, then:
   - **🎲 Pick Random** — weighted so frequent participants are less likely (if weights are on)
   - **🍎 Teacher Pick** — search and choose anyone (present listed first)
   - **🙋 Volunteer** — student raises hand; marks a volunteer + pick
3. After they answer:
   - **✓ Correct** · **✗ Incorrect** · **⏭ Skip**
4. Skip has a **per-session limit** (default 3). Reset session skips from the picker if needed.

Random pick avoids calling the same student twice in a row when more than one student is present.

---

## Student (projector) view

Full navy screen with a large name. Volunteer picks show a **Volunteer** label.  
When you mark Correct / Incorrect / Skip, the projector returns to “Waiting for next student…”.

---

## Split mode + slides

1. Switch mode to **Split**.
2. On the left panel: **Load PPTX** or drop a `.pptx` file.
3. **Prev / Next**, thumbnails, or **arrow keys** move slides.
4. **⛶ Full** makes the slides panel fullscreen.
5. Drag the thin bar between slides and tracker to resize (about 20%–80%).
6. Keep using pick buttons on the right — no need to leave the deck.

### Slide limitations

Supported well enough for most lesson decks:

- Solid backgrounds  
- Embedded images  
- Basic text  

**Not** supported: animations, charts, SmartArt, complex effects, video.  
If a deck looks wrong, present it in PowerPoint/Google Slides on another window and keep tracker in Teacher mode.

Slides are **not saved** when you refresh — reload the file each period.

---

## Leaderboard

Open the **Leaderboard** tab, pick the class, and review:

- Participation points (from Settings)  
- Leaderboard score = participation points ÷ picks (blank if never picked)

**Export CSV** for gradebook import. **Reset stats** clears counts for that class (confirm first).

---

## Settings (gear)

| Section | What it does |
|---------|----------------|
| Weighted selection | Turns likelihood boosts on/off; volunteer/correct usually make a student *less* likely next time; incorrect/skip *more* |
| Scoring | Points and add/subtract per correct, volunteer, incorrect, skip |
| Session | Default skip limit |

Settings apply to **all classes**.

---

## Backup & transfer

- **Export data** (Manage) → downloads `ParticipationTracker_Backup.json`
- **Import data** replaces everything — use when moving browsers/computers

Data lives in **this browser’s** storage on this computer. Clearing site data deletes classes.

---

## Cross-tab tip

Teacher (or Split) and Student must run in the **same browser** (e.g. two Chrome windows on the same machine). Different computers do not sync.
