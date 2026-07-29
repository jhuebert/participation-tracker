# Changelog

## Unreleased → 2.0.0 (TypeScript rewrite)

### Added
- Full Preact + TypeScript app (Vite, pnpm, signals)
- Domain: scoring, weighted pick, roster edit, import/export/CSV
- Persistence with legacy key compatibility + optional session store
- Teacher / Student / Split modes with modern CCS-branded UI
- Picker, leaderboard, manage, settings drawer
- Split-mode PPTX engine (JSZip), resize handle, thumbs, fullscreen, arrows
- `docs/UX_SPEC.md`, `docs/ACCEPTANCE_CHECKLIST.md`, `docs/TEACHER_GUIDE.md`
- CI + multi-stage `docker/Dockerfile`

### Changed
- UI overhaul (school blue; no purple gradients)
- Settings live in a right drawer; roster editing supported
- Session attendance / skips / last-picked can persist across refresh

### Compatibility
- `legacy/index.html` holds the v1 monolith for reference
- localStorage keys and export JSON remain loadable
- BroadcastChannel name unchanged (`participation-tracker-sync`)

### Bundle (approx.)
- Main JS ~15KB gzip; slides ~12KB; jszip ~30KB (lazy on Split)
