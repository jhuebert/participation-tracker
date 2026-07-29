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

## Docker (production)

Production image is a multi-stage Vite build served by nginx:

```bash
docker build -f docker/Dockerfile -t jhuebert/participation-tracker:local .
docker run --rm -p 8080:80 jhuebert/participation-tracker:local
# open http://localhost:8080
```

Or pull a published tag:

```bash
docker pull jhuebert/participation-tracker:latest
docker run -p 80:80 jhuebert/participation-tracker:latest
```

Compose:

```bash
docker-compose up
```

> Root `Dockerfile` still backs the **legacy** single-file app under `legacy/` until cutover. Prefer `docker/Dockerfile` for the TypeScript rewrite.

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
