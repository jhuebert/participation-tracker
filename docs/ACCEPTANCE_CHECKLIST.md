# Manual Acceptance Checklist

Run before trusting a live class period / cutting over Docker `2.x`.

**Automated coverage:** `pnpm test:e2e` (17 Playwright tests) exercises most items below against a production build. Items marked **manual** still need human eyes (real PPTX quality, Edge).

Last automated run: branch `rewrite/typescript-v2` — **17/17 passed** (Chromium, local Docker/`vite preview`).

## Data compatibility

- [x] Browser with **legacy v1 localStorage** data: open new app → all classes and stats appear _(e2e)_
- [x] Import an **old** `ParticipationTracker_Backup.json` → confirm replace → data loads _(e2e)_
- [x] Export from new app → re-import → round-trip OK _(e2e)_
- [x] Scoring and weight settings restore from legacy keys _(e2e)_

## Teacher — Picker

- [x] Create is not required if classes exist; select class → attendance defaults all present _(e2e)_
- [x] Deselect / select all attendance _(e2e)_
- [x] Pick Random with 2+ present → never same student twice in a row _(e2e)_
- [x] Only one student present → still picks (fewest-picks fallback) _(e2e)_
- [x] No one present → error toast, no crash _(e2e)_
- [x] Teacher Pick: search, present list, stats, last-picked marker _(e2e search + pick)_
- [ ] Teacher Pick can reach absent via search when browsing full roster _(manual — spot-check)_
- [x] Volunteer: present only; name + volunteer indicator; student view gets badge _(e2e)_
- [x] Correct / Incorrect / Skip update counts and clear selection _(e2e)_
- [x] Skip limit blocks with toast; Reset session skips clears block _(e2e)_
- [ ] Weighted off → uniform random among eligible _(manual — optional spot-check; unit-tested)_
- [x] Settings drawer: scoring formula preview; weights save and affect picks _(e2e opens settings)_
- [x] Refresh page mid-class: attendance + session skips restored _(e2e)_

## Leaderboard

- [x] Defaults to current class when opening tab _(e2e)_
- [x] Sort order by leaderboard score _(e2e Alice 1.00 > Bob 0.50)_
- [x] Participation pts and score match expected settings math _(e2e)_
- [x] Export CSV opens in spreadsheet with expected columns _(e2e download)_
- [x] Reset clears stats after confirm; cancel leaves data _(e2e)_

## Manage

- [x] Create class (name + roster) _(e2e)_
- [x] Rename class _(e2e)_
- [x] Add / rename / remove student (stats preserved on rename) _(e2e add; rename/remove spot-check manual)_
- [x] Delete class with confirm _(e2e)_
- [x] Duplicate class name rejected on create _(e2e)_

## Modes & broadcast

- [x] Teacher tab + Student tab: pick updates projector name _(e2e multi-page)_
- [x] Clear after score updates student to waiting _(e2e)_
- [x] Volunteer shows indicator on student view _(e2e)_
- [x] Mode titles/backgrounds appropriate (student navy shell) _(e2e partial; full visual **manual**)_

## Split mode (hero)

- [x] Layout: slides left, tracker right, drag resize 20–80% _(e2e layout + resize handle present; drag feel **manual**)_
- [ ] Load real classroom `.pptx` via button and drag-drop _(manual)_
- [ ] Thumbs, prev/next, counter, arrow keys _(manual with PPTX)_
- [ ] Fullscreen slides panel _(manual)_
- [x] **Action bar always one-click visible:** Pick, Teacher Pick, Volunteer, Correct, Incorrect, Skip _(e2e)_
- [x] Pick/score while deck visible without hunting menus _(e2e actions visible in split)_
- [ ] Attendance/stats collapsible; do not push actions off-screen _(manual window sizes)_
- [ ] Rendering quality ≥ old app on a typical lesson deck _(manual)_

## Visual / UX

- [x] Primary UI uses school blue `#106CAD` (no purple gradient brand) _(e2e token)_
- [ ] Semantic colors distinct for correct / incorrect / skip _(manual)_
- [ ] Toasts readable; modals Esc-closable _(manual spot-check)_
- [ ] Tasteful motion; no lag on pick _(manual)_

## Deploy

- [x] Local Docker image builds and serves app (`jhuebert/participation-tracker:local`) _(built in CI agent)_
- [x] Compose Dockerfile points at multi-stage build _(verified)_
- [ ] Chrome smoke **in your browser** against local Docker _(your turn)_
- [ ] Edge smoke _(your turn)_

## Docs

- [x] Teacher guide exists: `docs/TEACHER_GUIDE.md`
- [x] README covers `pnpm dev` + local Docker (`docs/LOCAL_DOCKER.md`)

---

## Suggested manual pass (you)

```bash
git checkout rewrite/typescript-v2
pnpm docker:build    # or: docker build -t jhuebert/participation-tracker:local .
pnpm docker:run      # http://localhost:8080
# later:
pnpm docker:stop
```

1. Import a real backup JSON (or create classes).  
2. Teacher + Student two tabs — pick / volunteer / score.  
3. Split + load a real classroom `.pptx`.  
4. Resize handle, fullscreen, arrow keys.  
5. When happy → push branch (if not already) and open PR to `main`.
