# Manual Acceptance Checklist

Run before trusting a live class period / cutting over Docker `2.x`.

## Data compatibility

- [ ] Browser with **legacy v1 localStorage** data: open new app → all classes and stats appear
- [ ] Import an **old** `ParticipationTracker_Backup.json` → confirm replace → data loads
- [ ] Export from new app → re-import → round-trip OK
- [ ] Scoring and weight settings restore from legacy keys

## Teacher — Picker

- [ ] Create is not required if classes exist; select class → attendance defaults all present
- [ ] Deselect / select all attendance
- [ ] Pick Random with 2+ present → never same student twice in a row
- [ ] Only one student present → still picks (fewest-picks fallback)
- [ ] No one present → error toast, no crash
- [ ] Teacher Pick: search, present list, stats, last-picked marker
- [ ] Teacher Pick can reach absent via search when browsing full roster (parity)
- [ ] Volunteer: present only; name + volunteer indicator; student view gets badge
- [ ] Correct / Incorrect / Skip update counts and clear selection
- [ ] Skip limit blocks with toast; Reset session skips clears block
- [ ] Weighted off → uniform random among eligible
- [ ] Settings drawer: scoring formula preview; weights save and affect picks
- [ ] Refresh page mid-class: attendance + session skips restored (if feature enabled)

## Leaderboard

- [ ] Defaults to current class when opening tab
- [ ] Sort order by leaderboard score
- [ ] Participation pts and score match expected settings math
- [ ] Export CSV opens in spreadsheet with expected columns
- [ ] Reset clears stats after confirm; cancel leaves data

## Manage

- [ ] Create class (name + roster)
- [ ] Rename class
- [ ] Add / rename / remove student (stats preserved on rename)
- [ ] Delete class with confirm
- [ ] Duplicate class name rejected on create

## Modes & broadcast

- [ ] Teacher tab + Student tab: pick updates projector name
- [ ] Clear after score updates student to waiting
- [ ] Volunteer shows indicator on student view
- [ ] Mode titles/backgrounds appropriate (student navy shell)

## Split mode (hero)

- [ ] Layout: slides left, tracker right, drag resize 20–80%
- [ ] Load real classroom `.pptx` via button and drag-drop
- [ ] Thumbs, prev/next, counter, arrow keys
- [ ] Fullscreen slides panel
- [ ] **Action bar always one-click visible:** Pick, Teacher Pick, Volunteer, Correct, Incorrect, Skip
- [ ] Pick/score while deck visible without hunting menus
- [ ] Attendance/stats collapsible; do not push actions off-screen
- [ ] Rendering quality ≥ old app on a typical lesson deck

## Visual / UX

- [ ] Primary UI uses school blue `#106CAD` (no purple gradient brand)
- [ ] Semantic colors distinct for correct / incorrect / skip
- [ ] Toasts readable; modals Esc-closable
- [ ] Tasteful motion; no lag on pick

## Deploy

- [ ] `docker run -p 80:80 …` serves app (static nginx)
- [ ] Compose workflow unchanged operationally
- [ ] Chrome smoke
- [ ] Edge smoke

## Docs

- [ ] Teacher can follow `docs/TEACHER_GUIDE.md` without deploy knowledge
- [ ] README sufficient for `pnpm dev` / release
