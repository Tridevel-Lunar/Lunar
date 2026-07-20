# Frontend Development Guide

Practical guide for working on the LUNAR frontend.

## Commands

### Docker (workspace root)

```bash
cp .env.example .env
docker compose up --build
```

### Frontend only

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

## Runtime and Proxy

- Frontend runs on port `3000`
- API calls use `API_URL` from `src/lib/constants.ts` (default `/api`)
- `vite.config.ts` proxies:
  - `/api/laika/assist/stream` with no buffering headers
  - `/api/*` to `VITE_PROXY_TARGET`

## Environment Variables

- `GOOGLE_CLIENT_ID` (public client ID for GIS)
- `VITE_API_URL` (optional, defaults to `/api`)
- `VITE_PROXY_TARGET` (dev proxy backend target)
- `CHOKIDAR_USEPOLLING` (optional for file-watch in Docker/WSL setups)

## Routing and Access Control

Routing lives in `src/App.tsx`.

- `GuestRoute`: blocks authenticated users from `/login` and `/register`
- `ProtectedRoute`: requires active session for app modules

Protected pages:

- `Space`: `/space`, `/space/course/:courseId`
- `Arena`: `/arena`, `/arena/mission/:missionId`
- `Studio`: `/studio`, `/studio/new`, `/studio/chat/:collectionId`
- `Backoffice`: `/backoffice/users`, `/backoffice/knowledge`

## Authentication Flow

- Session is cookie-based (`credentials: "include"` on requests)
- `apiFetch` retries once on `401` after `tryRefreshSession()`
- Refresh endpoint: `POST /auth/refresh`
- Skip-refresh paths are defined in `src/lib/auth.ts`
- Google sign-in uses GIS credential -> `POST /auth/google/onetap`

## API Layer

`src/lib/api.ts` contains typed frontend API helpers for:

- Auth/session-aware fetch (`apiFetch`)
- LAIKA health and stream APIs
- Studio collections/conversation/branch-map APIs
- Backoffice knowledge and user management APIs
- Arena mission/attempt/run APIs

Prefer adding all new API contracts to `src/lib/api.ts` instead of spreading raw fetch calls across components.

## Arena (M01) Development Notes

- Mission list: `src/components/arena/arena-data.ts`
- Blockly editor: `src/components/arena/blockly/BlocklyEditor.tsx`
- AST conversion:
  - `toAst.ts` (workspace -> AST)
  - `fromAst.ts` (AST -> workspace)
- Mission workspace page: `src/components/arena/mission/MissionActivity.tsx`
- Feedback panel: `src/components/arena/feedback/MissionFeedback.tsx`

Run flow:

1. Save draft AST -> `PUT /arena/missions/:id/attempt`
2. Submit run -> `POST /arena/missions/:id/runs`
3. Poll status -> `GET /arena/missions/:id/runs/:jobId`
4. Render `RunResult` summary/dashboard/outcome

Current frontend scope: structured feedback + block highlight. 3D replay is deferred.

## Studio + LAIKA Development Notes

- Landing: `src/components/studio/landing/*`
- Chat: `src/components/studio/chat/*`
- Storage/API adapter: `src/lib/studio-storage.ts`
- Conversation transforms: `src/lib/studio-conversation.ts`
- Tree/path helpers: `src/lib/studio-tree.ts`

Chat behavior:

- Loads conversation via `/studio/collections/:id/conversation`
- Streams assistant output from `/laika/assist/stream` (SSE)
- Supports retry/edit/branch on user and assistant turns
- Supports branch-map visualization via `/branch-map`
- Uses micromark for live streaming render, react-markdown for stable render

## Styling

- Tailwind CSS v4 utilities are primary styling method
- Shared theme tokens and typography live in `src/index.css`
- Prefer token-based utility classes over one-off hardcoded colors

## Conventions

- Use alias imports: `@/...`
- Keep page components focused on composition; move logic/UI units to `components/` or `lib/`
- Keep API schemas and types near `src/lib/api.ts`
- UI text is Thai-first; component/code naming stays English

## Verification Checklist

Before opening PR:

1. `npm run lint` passes
2. Core routes render (`/space`, `/arena`, `/studio`)
3. Auth redirect behavior works (`GuestRoute` and `ProtectedRoute`)
4. Arena mission can save and submit run
5. Studio chat can stream and recover from stop/retry
