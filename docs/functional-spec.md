# LUNAR Frontend Functional Spec

Functional specification of what the current frontend delivers.

## Product Modules

- **Space** (Learn): content and activity entry points for space technology learning
- **Arena** (Build): Blockly mission coding and simulation result feedback
- **Studio** (Launch): user collections and LAIKA-assisted thinking workspace

## User Input / Output

- Input: clicks, text entry, block drag/drop, route navigation, LAIKA prompts
- Output: UI transitions, auth/session handling, mission outcomes, streamed LAIKA responses, validation/error messages

## Authentication

### Supported Methods

- Email/password login and register
- Google sign-in (One Tap + button)

### Behavior

- Session uses backend-set cookies
- Protected routes redirect unauthenticated users to `/login?next=...`
- Expired access token triggers silent refresh before failing

## Space Module

### Routes

- `/space`
- `/space/course/:courseId`

### Frontend Responsibilities

- Show module home and course view navigation
- Maintain protected access and consistent module shell UI
- Render educational sections and interactive module entry points

## Arena Module

### Routes

- `/arena`
- `/arena/mission/:missionId`

### Current Mission Scope

- Active playable mission: `leo-orbital-launch`
- Placeholder mission(s) can be listed as non-playable

### Functional Behavior

1. Load mission pack and latest saved attempt
2. Let user edit Blockly program
3. Save AST draft to backend
4. Submit simulation run job
5. Poll run status until finished/failed
6. Render result summary/dashboard/outcome
7. Highlight related block when backend returns `error.blockId`

### In Scope

- Blockly editor and toolbox
- Attempt persistence
- Async run feedback panel

### Deferred

- 3D replay visualization in mission feedback

## Studio Module

### Routes

- `/studio`
- `/studio/new`
- `/studio/chat/:collectionId`

### Landing

- Show LAIKA greeting hero
- Show user collection list
- Support create/open collection flow

### Chat Workspace

- Load selected collection conversation
- Stream LAIKA response tokens (SSE)
- Support intent-based prompts
- Support follow-up, retry, edit, and branch interactions
- Provide branch map dialog and branch switching
- Support optional web-search flag and LAIKA mode selection (`standard` / `extra`)

### Rendering

- Streaming markdown render during generation
- Stable markdown render after completion
- Math support (KaTeX)
- Mermaid diagrams in fenced code blocks (`mermaid`)

## Backoffice (Frontend Surface)

### Routes

- `/backoffice/users`
- `/backoffice/knowledge`

### Functional Coverage

- User role management view
- Knowledge catalog/list/detail
- Upload, patch, ingest, sync-manifest, delete actions through backend APIs

## Error Handling and UX Rules

- API errors surface human-readable Thai messages where possible
- LAIKA stream abort is handled gracefully without crashing UI
- Loading and empty states are shown for protected routes and async data
- Mission and chat pages keep local state coherent during retries and branch switches

## Non-Functional Notes

- SPA architecture (no server components)
- Browser-only API communication (`fetch`, cookie credentials)
- Route-level access guards and auth-aware retry logic
