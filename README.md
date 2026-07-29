# Participation Tracker

Interactive classroom tool for fair student selection, participation scoring, and optional side-by-side lesson slides.

## Features

- **Fair selection** — weighted random pick, teacher pick, and volunteer
- **Attendance** — present / absent chips (persisted per class)
- **Scoring** — correct / incorrect / skip / volunteer with configurable points
- **Leaderboard** — ranks + CSV export
- **Class & roster editing** — create, rename, add/remove/rename students
- **Modes** — Teacher, Student (projector), Split (slides + tracker)
- **Slides** — load a `.pptx` in split mode (basic backgrounds, images, text)
- **Backup** — JSON export/import; localStorage stays compatible with v1 data

## Quick start (development)

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm test
pnpm build
```

Teacher usage guide: [`docs/TEACHER_GUIDE.md`](docs/TEACHER_GUIDE.md)

## Docker (production-like local test)

Same multi-stage Vite → nginx image ops will run in production:

```bash
pnpm docker:build          # jhuebert/participation-tracker:local
pnpm docker:run            # http://localhost:8080
pnpm docker:stop

# or rebuild + restart after changes
pnpm docker:rebuild

# compose (port 80)
docker compose up --build
```

See [`docs/LOCAL_DOCKER.md`](docs/LOCAL_DOCKER.md) for details.

Published Hub image (after merge to `main`):

```bash
docker pull jhuebert/participation-tracker:latest
docker run -p 80:80 jhuebert/participation-tracker:latest
```

## Versioning & CI

- `VERSION` drives Docker Hub tags (`x.y.z`, `x.y`, `x`) via `.github/workflows/docker-build.yml`
- PRs/pushes to `main` run lint, typecheck, unit tests, and build (`.github/workflows/ci.yml`)

## Architecture (v2 rewrite)

```
src/
  app/           # mode shells (teacher / student / split)
  domain/        # pure scoring, weighted pick, roster, import-export
  state/         # signals, persistence, broadcast, actions
  features/      # picker, leaderboard, manage, settings, slides
  ui/            # shared primitives
```

- Stack: Preact + TypeScript + Vite + pnpm + `@preact/signals`
- Data keys (legacy-compatible): `participationData`, `participationScoringSettings`, `participationWeightSettings`
- Optional session key: `participationSession`
- Cross-tab channel: `participation-tracker-sync`

See [`CONVERSION_PLAN.md`](CONVERSION_PLAN.md) for rewrite status and decisions.

## Browser support

Latest **Chrome** and **Edge** (desktop). Mouse-first classroom use.
