# Participation Tracker — TypeScript Conversion Plan

## Purpose

Convert the single-file HTML/JS classroom app into a **modern, maintainable TypeScript codebase** with a **redesigned UX**, while preserving **behavioral parity** for all existing classroom workflows.

This is a **big-bang rewrite on one long branch** (solo), ending in the same deployment model as today: a Docker image serving static assets behind nginx.

### Implementation status

| Phase | Status |
|-------|--------|
| 0 UX spec + acceptance checklist | **Done** — `docs/UX_SPEC.md`, `docs/ACCEPTANCE_CHECKLIST.md` |
| 1 Project foundation | **Done** — Vite/Preact/TS, CI, docker multi-stage, shell UI |
| 2 Domain + persistence | **Done** — hydrate/autosave, import-export, session, broadcast |
| 3 Teacher chrome + settings | **Done** — top bar, tabs, settings drawer, toasts, confirms |
| 4 Picker flow | **Done** — attendance, action bar, volunteer/teacher modals, skip limit |
| 5 Leaderboard + manage | **Done** — table/CSV/reset, create/edit/delete class, import/export |
| 6 Split + slides | **Done** — resize, lazy PPTX engine, thumbs, fullscreen, arrows |
| 7 Docs + polish | **Mostly done** — teacher guide + README; manual QA remaining |
| 8 Cutover | **Ready** — `VERSION` 2.0.0; root Dockerfile = multi-stage v2; `legacy/` retained for reference |

**v1 monolith preserved at** `legacy/index.html` (root `Dockerfile` still serves it until cutover). **v2 image:** `docker/Dockerfile`.

---

## Locked Decisions

| Decision | Choice |
|----------|--------|
| Goal | Feature/behavior parity + modern UX overhaul |
| Rewrite style | Big-bang on one long branch |
| UI approach | Componentized **Preact + TypeScript** (signals for state) |
| Build | **Vite** + **pnpm** |
| Styling | Design tokens + CSS Modules (or colocated CSS); single refreshed theme |
| Settings scope | **Global** (not per-class) for scoring & weights |
| Class management | **v1 includes** rename class, add/remove/rename students (plus create/delete) |
| Session state | Persist attendance + session skips across refresh **if low-risk** (per class) |
| Existing browser data | **Must load automatically** (compatible shape or automatic migration) |
| Old export files | **Must import** cleanly |
| Split mode | **Primaryworkflow**; keep slides-left / tracker-right; core actions one-click |
| Student / projector view | Largely as-is (large name, volunteer indicator, waiting state) |
| Input | Mouse-primary (desktop); latest **Chrome / Edge** first-class |
| Theming | **Cornerstone Christian School brand colors** (blue professional); single refreshed theme; no dark-mode requirement |
| Motion | Tasteful, subtle transitions |
| Product name | **Participation Tracker** (repo/Docker names unchanged) |
| Brand reference | https://cornerstonechristianschool.org/ |
| Post-v1 features | None planned — don't over-abstract |
| Deploy artifact | Docker image with **static build output** in nginx (same usage as today) |
| Teacher docs | Dedicated how-to-use guide (no deploy content) |

### Explicit non-goals (v1)

- Backend, accounts, multi-device cloud sync
- PWA / offline service worker
- i18n
- Dark mode toggle
- Full PowerPoint fidelity (charts, SmartArt, animations, complex effects)
- Supporting old browsers
- npm/yarn dual support (pnpm only)
- Incremental strangler migration of the monolith

---

## Current State (baseline)

Single file: `src/index.html` (~2,170 lines) — HTML + CSS + JS monolith.

| Area | Behavior today |
|------|----------------|
| Modes | Teacher, Student (projector), Split (slides + tracker) |
| Tabs | Picker, Leaderboard, Manage Classes |
| Selection | Weighted random, Teacher pick (searchable), Volunteer |
| No back-to-back random | Excludes `lastPickedStudent`; single-present fallback = fewest picks |
| Scoring | Correct / Incorrect / Skip; configurable points + add/subtract |
| Weights | Per-action amount + increase/decrease likelihood |
| Attendance | Present set (in-memory); select all / deselect all |
| Session skips | In-memory counter + skip limit (default 3; **not persisted**) |
| Persistence | `localStorage`: `participationData`, `participationScoringSettings`, `participationWeightSettings` |
| Cross-tab | `BroadcastChannel('participation-tracker-sync')` — teacher → student only |
| Manage | Create class, delete class, export/import JSON, no edit roster |
| Leaderboard | Sort by score, CSV export, reset stats |
| Slides | Client-side PPTX via JSZip + canvas render; thumbs; fullscreen; drag resize; arrow keys |
| Deploy | nginx Alpine Docker image copying `index.html`; GH Action tags from `VERSION` |

### Storage shapes (compatibility targets)

```ts
// localStorage key: participationData
type StoredClasses = Record<string, {
  students: Record<string, {
    picks: number;
    correct: number;
    incorrect: number;
    volunteers: number;
    skips: number;
  }>;
}>;

// localStorage key: participationScoringSettings
type ScoringSettings = {
  correctPoints: number; correctEffect: 'add' | 'subtract';
  incorrectPoints: number; incorrectEffect: 'add' | 'subtract';
  volunteerPoints: number; volunteerEffect: 'add' | 'subtract';
  skipPoints: number; skipEffect: 'add' | 'subtract';
};

// localStorage key: participationWeightSettings
type WeightSettings = {
  enabled: boolean;
  volunteerAmt: number; volunteerDir: 'increase' | 'decrease';
  correctAmt: number;   correctDir: 'increase' | 'decrease';
  incorrectAmt: number; incorrectDir: 'increase' | 'decrease';
  skipAmt: number;      skipDir: 'increase' | 'decrease';
};

// Export file JSON
type ExportFile = {
  app: 'Participation Tracker';
  date: string;
  data: StoredClasses;
};

// Broadcast messages (teacher → student)
type BroadcastMessage =
  | { type: 'studentSelected'; name: string; isVolunteer: boolean; isTeacherPick?: boolean }
  | { type: 'studentCleared' };
```

**v1 may add** versioned keys or a `schemaVersion` **plus migrations**, but readers must still accept the unversioned shapes above.

---

## Target Architecture

### Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Language | TypeScript 5.x (strict) | Safety, refactor confidence |
| UI | Preact 10.x | Small, component model, broadly used |
| State | `@preact/signals` | Simple reactivity without Redux weight |
| Build | Vite | Fast dev/HMR, standard for modern TS apps |
| Package manager | pnpm | Strict, fast, common in modern TS repos |
| Routing | hash-based (`#/picker`, etc.) or light preact-router | Bookmarkable tabs; no server routes needed |
| CSS | CSS Modules + global design tokens | Scoped components, one theme |
| Unit/integration | Vitest + Testing Library (Preact) | Vite-native |
| E2E | Playwright (Chromium/Edge focus) | Real classroom flows |
| Lint/format | ESLint + Prettier | Consistency solo or not |
| PPTX | `jszip` (bundled dependency, not CDN) | Deterministic builds |
| Deploy | Multi-stage Docker → nginx:alpine static | Identical ops model to today |

**Why Preact (not vanilla DOM):** UX overhaul + editing modals + split-mode shell are much more maintainable as components. Bundle cost stays small relative to JSZip.

### Repository structure

```
participation-tracker/
├── .github/workflows/
│   ├── ci.yml                 # lint, typecheck, unit, build
│   └── docker-build.yml       # main → Docker Hub (VERSION tags)
├── docs/
│   ├── TEACHER_GUIDE.md       # How to use a deployed site only
│   └── UX_SPEC.md             # Light UX spec (layouts, flows, tokens)
├── public/
│   └── favicon.ico
├── src/
│   ├── index.html             # Vite HTML entry
│   ├── main.tsx               # Bootstrap
│   ├── app/
│   │   ├── App.tsx            # Shell: mode switch, layout
│   │   ├── routes.tsx
│   │   └── mode-shells/
│   │       ├── TeacherShell.tsx
│   │       ├── StudentShell.tsx
│   │       └── SplitShell.tsx # FIRST-CLASS layout
│   ├── domain/
│   │   ├── types.ts
│   │   ├── scoring.ts         # pure: participation pts, leaderboard score
│   │   ├── weighted-pick.ts   # pure: weight calc + pick
│   │   ├── class-roster.ts    # pure: create/rename/edit helpers
│   │   └── defaults.ts
│   ├── state/
│   │   ├── store.ts           # signals: classes, settings, ui, session
│   │   ├── persistence.ts     # localStorage load/save + migrations
│   │   ├── session.ts         # attendance, sessionSkips, lastPicked (persist)
│   │   └── broadcast.ts       # BroadcastChannel typed wrapper
│   ├── features/
│   │   ├── picker/
│   │   ├── leaderboard/
│   │   ├── manage/
│   │   ├── settings/
│   │   ├── attendance/
│   │   └── slides/
│   │       ├── pptx-parser.ts
│   │       ├── slide-renderer.ts
│   │       ├── SlidesPanel.tsx
│   │       └── types.ts
│   ├── ui/                    # shared primitives
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Tabs.tsx
│   │   ├── Select.tsx
│   │   ├── TextField.tsx
│   │   └── ...
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── global.css
│   │   └── reset.css
│   └── utils/
│       ├── download.ts
│       ├── dom.ts
│       └── id.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── VERSION                    # remains source of Docker tags
├── README.md                  # dev + deploy
├── docs/TEACHER_GUIDE.md
└── CHANGELOG.md
```

### Layering rules

1. **`domain/`** — pure functions, no DOM, no Preact. Heavily unit-tested. Algorithms must match current math.
2. **`state/`** — signals + persistence + broadcast. Only place that touches `localStorage` / `BroadcastChannel`.
3. **`features/` + `app/`** — UI composition; call into domain/state.
4. **`ui/`** — dumb presentational primitives.
5. **No business logic in event handlers** beyond wiring.

---

## UX Spec (light)

Full detail lives in `docs/UX_SPEC.md` (written in Phase 0). Summary of intent:

### Design principles

1. **Split-mode is the hero path** — presenting must never feel secondary or stripped-down.
2. **One-click core actions** in teacher and split: Pick Random, Teacher Pick, Volunteer, Correct, Incorrect, Skip.
3. **Progressive disclosure** — scoring/weight settings available but not competing with pick flow.
4. **Familiar modern SaaS/classroom tool feel** — clear hierarchy, restrained color, readable type, generous hit targets for mouse.
5. **Tasteful motion** — selection reveal, modals, toasts; nothing that delays calling on a student.
6. **Parity over cleverness** — every current capability remains reachable without hunting.

### Visual direction

Brand source: [Cornerstone Christian School](https://cornerstonechristianschool.org/) theme CSS / assets (extracted for this plan).

#### School color tokens (locked)

| Role | Hex | Source / use on school site |
|------|-----|-----------------------------|
| **Primary** | `#106CAD` | Body background, brand blue, links |
| **Primary hover / deep** | `#0B578A` | Darken of primary for buttons/hover |
| **Primary soft** | `#5696C6` | Welcome panel blue |
| **Primary muted (chips/bg)** | `#D2E0F9` | Highlight wash |
| **Primary border soft** | `#A8BFE8` | Accent borders |
| **Navy (headings/secondary text)** | `#1B2E49` | Header subtitle on site |
| **Accent link (optional)** | `#6F98CD` | Footer / secondary link blue |
| **Calendar accent text** | `#99BEEE` | Light blue on dark panels |
| **Ink / near-black** | `#1E1E1E` | Nav active, strong text |
| **Surface** | `#FFFFFF` | Content panels |
| **Surface muted** | `#F4F7FB` | App background (cool tint of primary) |
| **Border** | `#E2E8F0` | Dividers |

#### Semantic (not school brand — keep meaning clear)

| Role | Suggested | Meaning |
|------|-----------|---------|
| Success / correct | `#159947` | Correct answers |
| Danger / incorrect | `#D92D20` | Incorrect |
| Warning / skip | `#D97706` | Skip / caution |
| Volunteer | Primary or a supporting teal | Distinct from score actions |

#### Application rules

- **Theme:** light professional UI on `surface-muted`, white cards, **primary `#106CAD`** for main actions, focus rings, active tabs, key highlights.
- **Do not** reuse the old purple gradient (`#667eea` → `#764ba2`) as brand.
- **Split mode:** laptop-legible; primary action bar uses solid primary/semantic fills (high contrast), not low-contrast pastels.
- **Student / projector view:** dark navy shell (`#1B2E49` or `#0F1C2E`) with white name text and primary accent for volunteer — projector-friendly contrast (allowed dark exception).
- **Typography:** system UI stack (site display fonts not required in-app); large type for selected student and student-view name.
- **Chrome:** clear panels, consistent spacing; restrained primary so screens don’t become a blue flood.
- **No dark-mode toggle** for v1 teacher UI.
- **Logo/mascot:** not required in-app for v1 (colors alone carry school identity unless an official mark is added later).

### Information architecture

| Mode | Layout |
|------|--------|
| **Teacher** | Top bar: app name, class selector, mode switch. Nav: Picker · Leaderboard · Manage. Main canvas by route. Settings via drawer or dedicated panel (not a wall of forms under the pick buttons). |
| **Student** | Full-viewport dark (or high-contrast) waiting / name / volunteer badge. Minimal chrome. |
| **Split** | **Left ~60%:** slides (drop zone → render, thumbs, prev/next, fullscreen). **Resize handle.** **Right ~40%:** compact tracker — class, selected name, **primary action row always visible**, attendance/stats collapsible, tabs de-emphasized or iconized. |

Hash routes (example): `#/picker`, `#/leaderboard`, `#/manage`. Mode is orthogonal (query, separate signal, or `#/split/picker`).

### Split-mode action bar (non-negotiable)

Always visible, one click, no menu:

- 🎲 Pick Random  
- 🍎 Teacher Pick  
- 🙋 Volunteer  
- ✓ Correct · ✗ Incorrect · ⏭ Skip  

Disabled states match today (no class / no selection / etc.).

### Key screens (behavioral parity checklist)

**Picker**

- Select class → show attendance grid (default all present)
- Select all / deselect all  
- Stats: present, picks, correct, volunteers, skips  
- Selected student display (+ volunteer marker)  
- Weighted toggle + weight settings (drawer/modal)  
- Skip limit + reset session skips  
- Scoring settings (drawer/modal) with live formula preview  

**Teacher pick modal**

- Search  
- Present first; absent listed (dimmed) when browsing full roster via search — **preserve current capability**  
- Show picks / correct / incorrect; mark last-picked  

**Volunteer modal**

- Present students only, pick one  

**Leaderboard**

- Class select (defaults to current class)  
- Rank table with participation pts + leaderboard score  
- Export CSV · Reset (confirm)  

**Manage**

- Create class (name + names one-per-line)  
- **Edit class:** rename; add / remove / rename students (with confirm when destructive)  
- Delete class (confirm)  
- Export / import backup JSON  

**Student view**

- Receives `studentSelected` / `studentCleared`  
- Large name; volunteer indicator  

**Slides (split)**

- Load PPTX (file + drag/drop)  
- Navigate thumbs / buttons / arrow keys  
- Fullscreen panel  
- Drag resize 20–80%  
- Loading + error states  

### Microcopy & emoji

- Keep action labels teachers already know; emoji OK if they aid scanability in the action bar.  
- Confirm copy for destructive actions (delete class, reset leaderboard, replace-on-import).

### Accessibility (best-effort, mouse-first)

- Keyboard: Esc closes modals; arrows move slides in split  
- Focus trap in modals  
- Visible focus rings  
- Labels on inputs; contrast meeting WCAG AA where practical  

---

## Behavior Spec (parity)

These rules are **normative** — unit tests should encode them.

### Weighted selection

```
base weight = 100
for each stat in {volunteers, correct, incorrect, skips}:
  if dir == decrease: weight -= amt * count
  if dir == increase: weight += amt * count
weight = max(1, weight)
pick proportional to weights
```

If weighting disabled → uniform random among eligible.

### Random pick eligibility

1. Eligible = present students except `lastPickedStudent`  
2. If none eligible (only one present or all filtered) → among present, those with **minimum `picks`** (random tie-break)  
3. Increment `picks` on selection  
4. Broadcast `studentSelected` with `isVolunteer: false`  

### Volunteer

- Present only  
- Increment `picks` and `volunteers`  
- UI shows name + volunteer marker  
- Broadcast `isVolunteer: true`  

### Teacher pick

- Can pick from list built as today (search full roster; present/absent grouping)  
- Increment `picks`  
- Broadcast `isTeacherPick: true` optional field  

### Correct / Incorrect

- Increment respective counter  
- Clear current student → “Ready to pick!”  
- Broadcast `studentCleared`  
- Disable score buttons until next pick  

### Skip

- If `skipLimit > 0` and session skips for student ≥ limit → toast, no-op  
- Else increment lifetime `skips`, session skip count; clear student; broadcast clear  

### Scores

```
participationPoints =
  apply(correctEffect, correctPoints, correct)
  + apply(volunteerEffect, volunteerPoints, volunteers)
  + apply(incorrectEffect, incorrectPoints, incorrect)
  + apply(skipEffect, skipPoints, skips)

// apply(add) = pts * count; apply(subtract) = -(pts * count)

leaderboardScore = picks > 0 ? participationPoints / picks : undefined (display "—")
```

### Session persistence (v1 enhancement)

When low-risk implementation:

| Field | Scope | Persist? |
|-------|-------|----------|
| `presentStudents` | per class | yes |
| `sessionSkips` | per class | yes |
| `skipLimit` | global | yes (new key or fold into settings) |
| `lastPickedStudent` | per class | yes (improves fairness across refresh) |
| `currentStudent` | — | optional; prefer clear on full reload |
| loaded PPTX | — | no (memory / object URLs only) |

Use a dedicated key e.g. `participationSession` with `{ [className]: { present: string[], sessionSkips: Record<string,number>, lastPicked?: string } }` so class data backups stay clean.

If persistence causes bugs before ship, feature-flag off and fall back to today’s in-memory behavior — **do not block release**.

### Data load order

1. Read legacy keys  
2. Run migrations if `schemaVersion` present/missing  
3. Validate lightly (missing student fields default to 0)  
4. Hydrate signals  
5. Never wipe user data on parse error — toast + keep last good or empty with recovery export hint  

### Import / export

- Export: `{ app: 'Participation Tracker', date, data }` — same semantic as today  
- Import: require `app === 'Participation Tracker'` and `data`; confirm replace-all  
- Settings: export may **optionally** include scoring/weight in a backward-compatible extension later; v1 can keep settings local-only like today  

---

## Slides engine

**Priority: rendering quality.** Port and structure the existing canvas pipeline; improve only where it fixes clear bugs or structure.

### Supported (document in TEACHER_GUIDE)

- Slide order from `ppt/slides/slideN.xml`  
- Background solid colors  
- Pictures (`p:pic` + relationships → media)  
- Text in shapes (runs, basic size/bold/color, simple wrap)  
- Common image types: png, jpg, gif, svg, bmp  

### Known limitations (document honestly)

- Animations, transitions, charts, SmartArt, tables (advanced), WordArt, many theme-color references, EMF/WMF reliability, fonts ≠ installed classroom fonts, notes, video  

### Implementation notes

- Bundle JSZip via pnpm (no CDN)  
- Lazy-load slides module only when entering split mode (bundle budget)  
- Keep EMU → pixel scaling approach  
- Thumbnail strip + object URL lifecycle (revoke on reload)  
- Visual sanity: store 1–2 fixture PPTXs under `tests/fixtures/slides/` for automated “renders N slides without throw” + optional screenshot snapshots  

---

## Phase Plan

Estimate assumes **solo**, part-time flexible pace. Days are **focused workdays**, not calendar insistence. One long branch until cutover.

### Phase 0 — UX Spec & acceptance notes (0.5 day) ✅

- [x] `docs/UX_SPEC.md` — layouts, tokens, action bar, settings drawer, manage edit flows  
- [x] `docs/ACCEPTANCE_CHECKLIST.md`  
- [x] Algorithm parity captured in domain tests  

**Exit:** met  

### Phase 1 — Project foundation (1 day) ✅

- [x] `pnpm` + Vite + Preact + TS strict  
- [x] ESLint, Prettier, Vitest, Playwright scaffold  
- [x] Path aliases `@/*`  
- [x] `VERSION` still authoritative for Docker tags  
- [x] Multi-stage `docker/Dockerfile` + `nginx.conf`  
- [x] `ci.yml`: lint → typecheck → unit → build  
- [x] `docker-build.yml` → `docker/Dockerfile`  
- [x] App shells: welcome → Teacher / Student / Split  
- [x] CCS brand tokens in CSS  

**Exit:** met (`pnpm dev` / `pnpm build` / tests green)  

### Phase 2 — Domain + persistence (1.5–2 days) ✅

- [x] Types + defaults matching current defaults  
- [x] Pure: `scoring`, `weighted-pick`, roster helpers  
- [x] `persistence` module (legacy keys + session + skip limit)  
- [x] `broadcast` wrapper  
- [x] Import/export/CSV pure helpers  
- [x] Hydrate signals from `loadState()` on boot; autosave subscriptions  
- [x] Unit tests: scoring + weighted pick + roster + import-export + persistence + session  

**Exit:** met  

### Phase 3–5 — App shell + picker + leaderboard + manage ✅

- [x] Teacher/Student/Split shells with top bar, tabs, mode select  
- [x] Settings drawer (weights, scoring, skip limit)  
- [x] Picker: attendance, stats, selection stage, action bar, modals  
- [x] Leaderboard table, CSV, reset with confirm  
- [x] Manage: create/delete/edit roster, JSON import/export  
- [x] Toast + ConfirmDialog  
- [x] Session persistence for present / sessionSkips / lastPicked  

**Exit:** classroom flows usable without slides  

### Phase 6 — Split + slides ✅

- [x] Split shell layout + compact tracker  
- [x] Drag resize handle (20–80%)  
- [x] PPTX parse/render (JSZip), thumbs, fullscreen, keyboard nav  
- [x] Lazy chunk: `slides` + `jszip` (main ~15KB gzip)  
- [x] Unit tests for slide path ordering / rels  

### Phase 7 — Docs + polish ✅/🔄

- [x] `docs/TEACHER_GUIDE.md`  
- [x] README updated for v2  
- [ ] Manual acceptance pass (`docs/ACCEPTANCE_CHECKLIST.md`)  
- [ ] Optional Playwright e2e in CI after `pnpm exec playwright install`  

### Phase 8 — Cutover ✅ (code ready; run manual checklist before live period)

- [x] Set `VERSION` to `2.0.0`  
- [x] Root `Dockerfile` + compose serve Vite build  
- [x] `legacy/index.html` retained for reference  
- [x] `CHANGELOG.md` updated  
- [ ] Teacher manual QA on real class data + PPTX  
- [ ] Merge / push `main` to publish Docker Hub `2.0.0`  


### Phase 3 — App shell + modes (1.5 days)

- Signals store wiring  
- Teacher / Student / Split shells  
- Hash routing for tabs  
- Toast + Modal primitives  
- Mode switch titles/backgrounds parity  
- Broadcast student view end-to-end with mock  

**Exit:** shells navigable; student tab responds to broadcast in two windows  

### Phase 4 — Picker, attendance, settings (2 days)

- Class select, attendance grid, stats  
- Pick random / volunteer / teacher pick flows  
- Correct / incorrect / skip + disable rules  
- Settings drawer (weights + scoring + skip limit)  
- Session persistence  
- Toasts for error cases (no present, skip limit, etc.)  

**Exit:** full picker parity on desktop Chrome  

### Phase 5 — Leaderboard + Manage (1 day)

- Leaderboard table, CSV, reset  
- Manage create/delete/export/import  
- **Edit class / students** UI  

**Exit:** manage + leaderboard parity + new edit features  

### Phase 6 — Slides engine + split polish (2 days)

- Port parser/renderer to modules  
- SlidesPanel UI aligned with UX_SPEC  
- Split layout polish: compact action bar, resize, keyboard, fullscreen  
- Lazy load  
- Fixture tests  

**Exit:** real PPTX through split mode; one-click actions while deck visible  

### Phase 7 — Visual system pass (1–1.5 days)

- Apply tokens globally; replace leftover prototype styles  
- Motion  
- Split-mode density pass (hero path)  
- Student view typography polish (still simple)  

**Exit:** matches UX_SPEC; no obvious “old CSS soup” remnants  

### Phase 8 — E2E, docs, cutover (1.5–2 days)

- Playwright: teacher happy path; student broadcast; split load+pick; import/export  
- `docs/TEACHER_GUIDE.md` (usage only)  
- README: dev setup, scripts, Docker run (ops)  
- CHANGELOG + version bump strategy  
- Manual acceptance checklist run  
- Merge branch → tag VERSION → deploy as today  

**Exit:** checklist complete; Docker image drop-in replacement  

### Effort summary

| Phase | Days (focused) |
|-------|----------------|
| 0 UX spec | 0.5 |
| 1 Foundation | 1 |
| 2 Domain + persistence | 1.5–2 |
| 3 Shells + modes | 1.5 |
| 4 Picker + settings | 2 |
| 5 Leaderboard + manage | 1 |
| 6 Slides + split | 2 |
| 7 Visual pass | 1–1.5 |
| 8 E2E + docs + cutover | 1.5–2 |
| **Total** | **~12–14 focused days** |

UX overhaul + roster editing + session persistence add a small buffer over a pure port.

---

## Docker & CI (deploy parity)

### Runtime contract (unchanged for operators)

```bash
docker pull jhuebert/participation-tracker:latest   # or :1 / :x.y.z
docker run -p 80:80 jhuebert/participation-tracker:1
# or docker compose up
```

Container serves **static files only** on port 80 via nginx. No Node in production.

### Dockerfile shape

```dockerfile
# build
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# runtime
FROM nginx:alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

### nginx

- `try_files $uri $uri/ /index.html`  
- Long-cache hashed assets; no-cache `index.html`  
- gzip  
- Sensible security headers (CSP tailored to app: no external CDN required after JSZip bundle)

### CI

| Workflow | Trigger | Jobs |
|----------|---------|------|
| `ci.yml` | PR + push | lint, `tsc`, vitest, build |
| `docker-build.yml` | push `main` | read `VERSION`, buildx, push `:x.y.z`, `:x.y`, `:x` |

Optional later: multi-arch (`linux/amd64,linux/arm64`) — not required for v1.

### Versioning

- Keep root `VERSION` file as Docker tag source (matches current mental model)  
- Mirror the same version in `package.json` during release to avoid drift  
- App may display version via Vite `define` from `VERSION` or `package.json`

---

## Testing strategy

### Unit (must-have)

- Scoring: all add/subtract combinations  
- Weighted pick: deterministic tests with mocked `Math.random`  
- No back-to-back + single-student fallback  
- Skip limit enforcement  
- Roster rename/add/remove  
- Migration: legacy localStorage → store  
- Import validation  

### Integration

- persistence round-trip  
- export then import  
- session restore for a class  

### E2E (Chromium primary)

1. Create class → attendance → pick → correct → leaderboard score  
2. Two pages: teacher pick → student view updates → clear  
3. Split: load fixture pptx → next slide → pick random  
4. Export / import backup  
5. Edit student name and confim stats follow  

### Manual acceptance (before trusting live class)

- [ ] Existing browser with old data: upgrade URL/image → classes appear  
- [ ] Old backup JSON imports  
- [ ] Full period simulation in **split mode** with a real classroom PPTX  
- [ ] Teacher + Student two-window sync  
- [ ] Weighted vs unweighted feel sane  
- [ ] Skip limit blocks appropriately  
- [ ] CSV opens in spreadsheet  
- [ ] Docker run on port 80 matches compose workflow  
- [ ] Chrome and Edge smoke  

---

## Risk mitigation

| Risk | Mitigation |
|------|------------|
| Algorithm drift vs old app | Port pure functions first; golden tests from current examples |
| PPTX platform regression | Fixtures + structural tests; document limitations; manual real-deck check |
| localStorage loss on bad migration | Migrations additive; try/catch; never write empty over unreadable data without confirm |
| Split UX too cramped after redesign | Phase 7 density pass; protect action bar; collapse secondary panels |
| Scope creep (editing, session, polish) | Non-goals list; session persistence optionally delayed, not rewrite of domain |
| Bundle bloat | Lazy slides+jszip; analyze dist; budget **<250KB gzip** main path excluding slides chunk |
| Solo long branch rot | Milestone tags on branch; keep `pnpm build` green every phase |

---

## Success criteria

- [ ] Behavior matches parity spec (selection, scoring, broadcast, import/export)  
- [ ] Automatic load of legacy `localStorage` data  
- [ ] Legacy export JSON imports  
- [ ] Split mode: deck + one-click pick/score/volunteer/teacher-pick  
- [ ] PPTX rendering quality ≥ current app on typical lesson decks  
- [ ] Class/student rename/add/remove shipped  
- [ ] Modern UI per UX_SPEC; single professional theme  
- [ ] `tsc --noEmit` clean; ESLint clean  
- [ ] Domain unit tests green (scoring + picker 100% branch coverage)  
- [ ] Playwright critical paths green on Chromium  
- [ ] Docker image: static nginx, same run instructions  
- [ ] `docs/TEACHER_GUIDE.md` published  
- [ ] README documents dev + deploy  
- [ ] Production main bundle target: **<250KB gzip** without slides chunk  

---

## Documentation deliverables

| Doc | Audience | Contents |
|-----|----------|----------|
| `README.md` | Developer / operator | Setup, scripts, Docker, versioning, architecture pointer |
| `docs/TEACHER_GUIDE.md` | Teacher | Modes, daily flow, split presenting, attendance, scoring/weights, leaderboard, backup/restore — **no deploy** |
| `docs/UX_SPEC.md` | Maintainers | Layouts, tokens, components, motion |
| `CHANGELOG.md` | Everyone | v2 notes + any behavior nits (e.g. session persistence) |

---

## Suggested npm scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "format": "prettier -w .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "docker:build": "docker build -f docker/Dockerfile -t jhuebert/participation-tracker:local ."
}
```

---

## Cutover plan

1. Finish branch; run automated + manual acceptance  
2. Bump `VERSION` (e.g. `2.0.0` — major for rewrite/UX)  
3. Merge to `main` → CI + Docker Hub publish  
4. Deploy container identically to v1  
5. Smoke on production URL: data present, split mode, two-tab student view  
6. Keep an exported backup before first live class  

**Rollback:** redeploy previous image tag; `localStorage` keys remain compatible so rolling back does not brick data.

---

## Open items to decide during Phase 0 (non-blocking)

Small choices deferred to UX_SPEC writing — not architectural blockers:

- Settings: right drawer vs full-page route  
- Student view: exact navy hex within school family (`#1B2E49` vs deeper)  
- Confirm dialogs: browser `confirm` vs in-app modal (prefer in-app for polish)  
- Optional: school name subtitle in app header — default **no** unless desired  

**Settled:** primary brand hue is school blue `#106CAD` (not generic indigo/purple).

---

## Appendix A — Default settings (parity)

```
Scoring: correct +2, volunteer +1, incorrect −1, skip −1
Weights: enabled; volunteer −30; correct −15; incorrect +10; skip +20 (amt/dir as current)
Skip limit: 3
```

## Appendix A2 — Brand CSS tokens (starter for `src/styles/tokens.css`)

```css
:root {
  /* Cornerstone Christian School — brand */
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
  --color-danger: #d92d20;
  --color-warning: #d97706;

  /* Student / projector shell */
  --color-projector-bg: #1b2e49;
  --color-projector-text: #ffffff;
}
```

## Appendix B — Broadcast channel

- Name: `participation-tracker-sync`  
- Publisher: teacher (and split, which is a teacher variant)  
- Subscriber UI: student mode  
- Forward-compatible: ignore unknown `type` values  

## Appendix C — Manual algorithm golden example

Use in tests: one class, students A/B/C with known counters; fix `Math.random`; assert selected student and resulting weights array. Recompute once from current app if needed and freeze as fixture.
