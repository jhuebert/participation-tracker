# Local Docker testing (production-like)

The production deploy is a static nginx image built from the root `Dockerfile`.
Use these commands on branch `rewrite/typescript-v2` before opening a PR.

## Build

```bash
pnpm docker:build
# equivalent:
# docker build -t jhuebert/participation-tracker:local .
```

Tags the image **`jhuebert/participation-tracker:local`** (does not push).

## Run

```bash
pnpm docker:run
# → http://localhost:8080
```

Stop:

```bash
pnpm docker:stop
```

Rebuild + restart after code changes:

```bash
pnpm docker:rebuild
```

Logs:

```bash
pnpm docker:logs
```

## Docker Compose

```bash
docker compose up --build
# → http://localhost:80
docker compose down
```

## Checklist smoke

1. Open http://localhost:8080  
2. Choose **Teacher** → Manage → create a tiny class  
3. Picker → pick / correct  
4. Open a second tab → `#/student` → pick again, confirm name appears  
5. Split mode → load a `.pptx` if you have one  

Data is stored in **your browser's localStorage** for `localhost:8080` (separate from `pnpm dev` on `:5173`).

## Notes

- Image matches CI/production (multi-stage Vite build → nginx).  
- Publishing to Docker Hub still only happens after merge to `main` (workflow on `main`).  
- `VERSION` is currently `2.0.0` on this branch; Hub tags update on merge, not on feature-branch pushes.
