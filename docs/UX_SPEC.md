# Participation Tracker — UX Spec

Phase 0 light UX specification. Implements brand and layout decisions from `CONVERSION_PLAN.md`.  
Brand reference: [Cornerstone Christian School](https://cornerstonechristianschool.org/).

---

## 1. Goals

| Goal | Detail |
|------|--------|
| Parity | Every current classroom capability remains reachable |
| Modern | Clean SaaS/classroom-tool UI; CCS blue professional theme |
| Hero path | **Split mode** (slides + tracker) must feel first-class |
| Speed | Core pick/score actions are always one click |
| Mouse-first | Desktop Chrome / Edge; generous click targets |

Non-goals: dark-mode toggle, i18n, logo/mascot requirement, mobile-first layout.

---

## 2. Design tokens

### Color

```css
:root {
  /* Brand — Cornerstone Christian School */
  --color-primary: #106cad;
  --color-primary-hover: #0b578a;
  --color-primary-soft: #5696c6;
  --color-primary-muted: #d2e0f9;
  --color-primary-border: #a8bfe8;
  --color-navy: #1b2e49;
  --color-accent-link: #6f98cd;

  /* Surfaces */
  --color-surface: #ffffff;
  --color-surface-muted: #f4f7fb;
  --color-border: #e2e8f0;
  --color-text: #1e1e1e;
  --color-text-secondary: #4a5466;
  --color-text-on-primary: #ffffff;

  /* Semantic */
  --color-success: #159947;
  --color-success-hover: #0f7a38;
  --color-danger: #d92d20;
  --color-danger-hover: #b42318;
  --color-warning: #d97706;
  --color-warning-hover: #b45309;
  --color-volunteer: #0e8a6a;

  /* Projector (student mode) */
  --color-projector-bg: #1b2e49;
  --color-projector-text: #ffffff;
  --color-projector-muted: #99beee;
}
```

### Spacing

```css
--space-2xs: 2px;
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
```

### Radius, shadow, type, motion

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-full: 999px;

--shadow-sm: 0 1px 2px rgba(27, 46, 73, 0.06);
--shadow-md: 0 4px 12px rgba(27, 46, 73, 0.08);
--shadow-lg: 0 12px 32px rgba(27, 46, 73, 0.12);

--font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
--font-size-xs: 12px;
--font-size-sm: 13px;
--font-size-md: 15px;
--font-size-lg: 18px;
--font-size-xl: 24px;
--font-size-2xl: 32px;
--font-size-display: clamp(2.5rem, 6vw, 4.5rem); /* selected name / student view */

--transition-fast: 120ms ease;
--transition-normal: 200ms ease;

--z-dropdown: 100;
--z-drawer: 200;
--z-modal: 300;
--z-toast: 400;
```

### Usage rules

- App chrome background: `--color-surface-muted`
- Cards/panels: `--color-surface` + `--shadow-sm` + `--radius-md`
- Primary CTA (Pick Random, primary nav active): `--color-primary`
- Correct → success; Incorrect → danger; Skip → warning; Volunteer → volunteer teal
- Do **not** flood full-page backgrounds with solid primary (legacy site does; app stays light)
- Focus rings: `0 0 0 3px var(--color-primary-muted)`

---

## 3. Information architecture

### Modes (global, top-level)

| Mode | Purpose |
|------|---------|
| Teacher | Full controls, tabs, settings |
| Student | Projector display only (receives broadcast) |
| Split | Slides left + compact tracker right |

Mode selector lives in the **top bar** (always visible in teacher/split). Student mode hides teacher chrome.

### Teacher routes (hash)

| Hash | Screen |
|------|--------|
| `#/picker` | Default — pick flow + attendance + stats |
| `#/leaderboard` | Ranked table + CSV + reset |
| `#/manage` | Classes CRUD, edit roster, import/export |

Settings are **not** a top-level tab — open as a **right drawer** from Picker (and available in Split via gear).

### State orthogonal to route

- `currentClass`
- `currentStudent` / volunteer flag
- Attendance + session skips (per class, persisted)
- Scoring / weight settings (global)
- Loaded slides (memory only, split mode)

---

## 4. Layouts

### 4.1 Top bar (Teacher + Split)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Participation Tracker    [Class ▼]     [Picker|Leaderboard|Manage]        │
│                          [⚙️ Settings]              Mode: [Teacher ▼]     │
└──────────────────────────────────────────────────────────────────────────┘
```

- Left: app name (no school subtitle by default)
- Center-left: class selector (prominent)
- Center: text tabs (Teacher) or compact icon/text tabs (Split)
- Right: Settings gear + mode `<select>` or segmented control
- Height ~56–64px; white surface; bottom border

### 4.2 Teacher — Picker

```
┌─ top bar ───────────────────────────────────────────────────────────────┐
├─ main (max-width ~1100px, centered, padding) ───────────────────────────┤
│  ┌ Attendance (card) ─────────────────────────────────────────────────┐ │
│  │ Present today · Select all · Deselect all                          │ │
│  │ [✓ Alice] [✓ Bob] [  Cara] …  grid of chips/check rows             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│  ┌ Stats row ─────────────────────────────────────────────────────────┐ │
│  │ Present | Picks | Correct | Volunteers | Skips                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│  ┌ Selection stage ───────────────────────────────────────────────────┐ │
│  │                                                                    │ │
│  │              Selected name (display type)   🙋 if volunteer        │ │
│  │              or “Select a class…” / “Ready to pick!”               │ │
│  │                                                                    │ │
│  │  [ Pick Random ] [ Teacher Pick ] [ Volunteer ]                    │ │
│  │  [ Correct ] [ Incorrect ] [ Skip ]                                │ │
│  │                                                                    │ │
│  │  Skip limit [ 3 ]  [ Reset session skips ]                         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
│ Settings drawer slides over from right when gear clicked                │
```

**Action button order (locked):**

1. Row A: Pick Random (primary fill) · Teacher Pick (info/primary-soft) · Volunteer (teal)
2. Row B: Correct (success) · Incorrect (danger) · Skip (warning)

Min height ~44px; horizontal stack with wrap on narrow teacher window.

### 4.3 Teacher — Leaderboard

- Class dropdown (defaults to `currentClass`)
- Actions: Export CSV · Reset (danger, confirm modal)
- Table: Rank, Name, Picks, Volunteers, Skips, Correct, Incorrect, Participation Pts, Leaderboard Score
- Empty state: “Select a class”
- Sticky header; zebra optional; correct/incorrect tinted cells

### 4.4 Teacher — Manage

**Left / top:** Create class form  
- Class name  
- Student names (textarea, one per line)  
- Create button  

**List of classes:** each row  
- Name · student count  
- Edit · Delete  

**Edit class panel / modal:**  
- Rename class  
- Student list with rename + remove  
- Add student (inline field)  
- Save / Done  

**Backup card:** Export data · Import data  

Destructive actions use **in-app confirm modal** (not `window.confirm`).

### 4.5 Settings drawer

Width ~360–400px; overlay + scrim; Esc / backdrop closes.

**Sections (accordions or stacked cards):**

1. **Weighted selection** — enable toggle; four stat rows (volunteer/correct/incorrect/skip) each with direction radios + amount
2. **Scoring** — four stat rows with add/subtract + points; live formula preview
3. **Session** — skip limit (also visible on picker; synced)

Copy tone: short labels teachers already know (“Less likely to be picked”).

### 4.6 Student (projector)

```
┌────────────────────────────────────────────┐
│ full viewport · background navy #1B2E49    │
│                                            │
│              🙋 (if volunteer)             │
│         STUDENT NAME (huge, white)         │
│     or “Waiting for next student…”         │
│                                            │
│  optional subtle footprint: app name xs    │
└────────────────────────────────────────────┘
```

- No top bar chrome
- Soft fade/scale-in when name changes (`--transition-normal`)
- Mode can still be switched if user lands wrong (small control corner opacity 0.35 hover 1) — optional; min: URL/hash or retain mode selector faint

### 4.7 Split mode (hero)

```
┌─ top bar (compact) ─────────────────────────────────────────────────────┐
├────────── slides (~60%) ──┬ resize ┬── tracker (~40%) ──────────────────┤
│ toolbar: file · prev/next │   ║    │ class (if not in top)               │
│ counter · fullscreen      │   ║    │ ┌ selected name ─────────────────┐ │
│                           │   ║    │ │  display                        │ │
│ ┌ slide stage ──────────┐ │   ║    │ └────────────────────────────────┘ │
│ │                       │ │   ║    │ [Pick][Teacher][Vol]               │
│ │                       │ │   ║    │ [✓][✗][Skip]     ← ALWAYS VISIBLE │
│ │                       │ │   ║    │ skip limit · reset skips           │
│ └───────────────────────┘ │   ║    │ ▸ Attendance (collapsible)         │
│ thumb strip               │   ║    │ ▸ Stats (collapsible)              │
│ drop zone if empty        │   ║    │ tabs: Picker·LB·Manage compact     │
└───────────────────────────┴───────┴─────────────────────────────────────┘
```

**Non-negotiable:** action row always visible without scrolling while a class is loaded.

**Resize:** drag handle 20%–80%; default 60% slides. Cursor `col-resize`.

**Keyboard (split only):**  
- ← / ↑ previous slide  
- → / ↓ next slide  
- Esc closes topmost modal  

**Slides empty state:** dashed drop zone, “Drop a .pptx or browse”, short note on supported features.

---

## 5. Components (inventory)

| Component | Notes |
|-----------|--------|
| `Button` | variants: primary, secondary, success, danger, warning, volunteer, ghost; sizes sm/md |
| `IconButton` | gear, close, fullscreen |
| `Select` | class + mode |
| `TextField` / `TextArea` | forms |
| `Checkbox` / chip toggle | attendance |
| `Tabs` | route nav |
| `Modal` | focus trap, Esc, scrim |
| `ConfirmDialog` | title, body, cancel, destructive confirm |
| `Drawer` | settings |
| `Toast` | 3s; success/error colors |
| `StatCard` | number + label |
| `DataTable` | leaderboard |
| `EmptyState` | illustration optional, text + action |
| `Collapsible` | split secondary panels |
| `StudentStage` | large name display (teacher + shared) |
| `ActionBar` | six actions; shared Teacher/Split |
| `AttendanceGrid` | |
| `TeacherPickModal` | search + present/absent groups |
| `VolunteerModal` | present list |
| `SlidesPanel` | load, render, thumbs, fullscreen |
| `ResizeHandle` | split |

---

## 6. Key interactions

### Pick Random

1. Require present students → else toast error  
2. Run domain eligibility + weighted pick  
3. Animate name into stage (fade 150–200ms)  
4. Enable score buttons  
5. Broadcast `studentSelected`  

### Teacher Pick

1. Open modal, focus search  
2. Default list: present sorted (preserve absent group when full roster / search)  
3. Show stats + last-picked badge  
4. On choose: same as pick for broadcast (not volunteer)  

### Volunteer

1. Modal of present only  
2. Increment volunteer; stage shows name + badge  
3. Broadcast `isVolunteer: true`  

### Correct / Incorrect / Skip

- Update domain counters; clear stage to “Ready to pick!”  
- Disable score trio until next selection  
- Skip respects session limit toast  
- Broadcast `studentCleared`  

### Import

- Confirm replace-all via `ConfirmDialog`  
- Validate `app === 'Participation Tracker'`  

---

## 7. Motion

| Event | Motion |
|-------|--------|
| Tab change | Instant or 120ms fade content |
| Modal open | Fade scrim + scale 0.98→1 150ms |
| Drawer | Slide from right 200ms |
| Toast | Slide up + fade |
| Name selection | Fade/slight rise |
| Attendance toggle | Background color `--transition-fast` |

No motion longer than 250ms on the pick path. `prefers-reduced-motion: reduce` → disable transforms.

---

## 8. Copy deck (starter)

| Context | Copy |
|---------|------|
| No class | Select a class to start |
| After score | Ready to pick! |
| Student waiting | Waiting for next student… |
| No present | No students present! |
| Skip blocked | {name} has used all skips |
| Class created | Class created! |
| Delete class | Delete “{name}” and all stats? This cannot be undone. |
| Reset leaderboard | Reset all stats for “{name}”? |
| Import replace | Replace all current data with imported data? |
| PPTX bad | Could not render slides. Make sure the file is a valid .pptx. |
| PPTX types | Supported: backgrounds, images, and basic text. Animations and charts are not supported. |

Emoji on actions: optional but recommended for scanability (🎲 🍎 🙋 ✓ ✗ ⏭) — same vocabulary as today.

---

## 9. Accessibility (best-effort)

- All icon buttons have `aria-label`  
- Modals: `role="dialog"`, `aria-modal`, focus trap, return focus on close  
- Buttons disabled ↔ `aria-disabled` / native `disabled`  
- Color is not the only cue (icons/labels on Correct/Incorrect)  
- Contrast AA for text on surfaces and primary buttons  
- Visible `:focus-visible` rings  

---

## 10. Responsive / density

- Target: laptop 1366×768 and up; mouse  
- Teacher main column max-width ~1100px  
- Split: tracker min width ~320px at 20% floor on large screens  
- No dedicated mobile layout in v1  

---

## 11. Settings placement (decision)

**Right drawer** — keeps pick flow unobstructed; works in teacher and split without a route change.

---

## 12. Student view chrome (decision)

**Dark navy shell** `#1B2E49` with white name — not light theme.

---

## 13. Manual QA wire points

See `docs/ACCEPTANCE_CHECKLIST.md`.
