# LUNAR Frontend

Frontend app for LUNAR learning platform (Space, Arena, Studio, LAIKA chat).

This repository is a submodule inside the workspace `lunar-dev`.

## Quick Start

### Run with Docker (recommended)

From workspace root (`lunar-dev`):

```bash
cp .env.example .env
docker compose up --build
```

- App: `http://localhost:3000`
- API: frontend calls `/api/*` and Vite proxy forwards to backend
- Full setup guide: `../../docs/docker-dev.md`

### Run frontend only (local)

```bash
npm install
npm run dev
```

Default dev URL: `http://localhost:3000`

## Requirements

- Node.js 18.17+
- npm 9+
- Backend running (for auth, Space data, Arena runs, Studio/LAIKA)

## Environment

- `GOOGLE_CLIENT_ID`: enables Google Sign-In UI (GIS)
- `VITE_API_URL`: API base URL (default `/api`)
- `VITE_PROXY_TARGET`: Vite dev proxy target (default `http://localhost:8000`)

`vite.config.ts` exposes only `GOOGLE_CLIENT_ID` and `VITE_*` to the browser.

## Main Routes

- Public: `/`
- Guest only: `/login`, `/register`
- Protected:
  - `/space` and `/space/course/:courseId`
  - `/arena`
  - `/arena/mission/:missionId`
  - `/studio`
  - `/studio/new`
  - `/studio/chat/:collectionId`
  - `/backoffice/users`
  - `/backoffice/knowledge`

## Product Modules

- **Space**: learning home + course pages
- **Arena**: Blockly mission flow (attempt save/load + async run feedback)
- **Studio**: collection workspace + LAIKA streaming chat (branch-aware)

## Key Frontend Features

- React 19 + React Router 7 SPA
- Cookie-based auth with silent refresh retry (`/auth/refresh`)
- Google One Tap + Google Sign-In button
- LAIKA SSE chat streaming (`/laika/assist/stream`)
- Markdown + math rendering and Mermaid diagram blocks in assistant messages
- Arena M01 visual coding with Blockly

## Project Structure

```text
frontend/
  src/
    App.tsx
    pages/
    components/
      arena/
      studio/
      space/
      auth/
    lib/
      api.ts
      auth.ts
      studio-storage.ts
      studio-tree.ts
    ast/
  docs/
    development.md
    functional-spec.md
    stack.md
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## References

- Development guide: `docs/development.md`
- Functional spec: `docs/functional-spec.md`
- Stack details: `docs/stack.md`
