# LUNAR Frontend

Vite + React Router — web app, landing page, auth และ UI การเรียนรู้

**Product context:** [concept.md](concept.md) · [functional-spec.md](functional-spec.md)  
**Tech stack (เต็ม):** [stack.md](stack.md)  
**Stack:** Vite 7, React 19, React Router 7, Tailwind CSS v4, TypeScript, Three.js / R3F, Google Identity Services, micromark (streaming Markdown), react-markdown + KaTeX, Shadcn/ui

## Commands

### Docker (recommended — workspace root)

Repo นี้เป็น submodule ใน [lunar-dev](https://github.com/Tridevel-Lunar/lunar-dev). รันทั้ง stack จาก workspace:

```bash
# จาก lunar-dev root
cp .env.example .env
docker compose up --build
```

- App: http://localhost:3000 (Vite HMR + `/api` → backend)
- Backend **ไม่** expose ออก host — เรียกผ่าน proxy เท่านั้น
- รายละเอียด: [../../docs/docker-dev.md](../../docs/docker-dev.md)

### Local frontend only

```bash
npm install
npm run dev          # Vite — http://localhost:3000
npm run build        # output → dist/
npm run preview      # preview production build
npm run lint
```

Vite proxy ใน `vite.config.ts` ส่ง `/api` → `VITE_PROXY_TARGET` (default `http://localhost:8000`; ใน Docker = `http://backend:8000`)

Backend แยก: [../../backend/docs/development.md](../../backend/docs/development.md)

**Requirements:** Node.js 18.17+, npm 9+

## Environment

**Docker:** ตั้งค่าใน workspace root `.env` — compose ส่ง `GOOGLE_CLIENT_ID` ไปทั้ง frontend และ backend (ห้ามส่ง `GOOGLE_CLIENT_SECRET` ไป frontend)

| Variable | ที่ตั้ง | ใช้เมื่อ |
|----------|---------|----------|
| `GOOGLE_CLIENT_ID` | workspace `.env` → compose → FE + BE | เปิด Google Sign-In (GIS) |
| `GOOGLE_CLIENT_SECRET` | workspace `.env` → backend เท่านั้น | redirect OAuth (optional) |
| `GOOGLE_REDIRECT_URI` | workspace `.env` | default `http://localhost:3000/api/auth/google/callback` |
| `VITE_API_URL` | optional (frontend) | default `/api` — เปลี่ยนเมื่อไม่ใช้ Vite proxy |
| `VITE_PROXY_TARGET` | compose (frontend) | backend URL สำหรับ proxy |

ถ้าไม่ตั้ง `GOOGLE_CLIENT_ID` ปุ่ม Google จะไม่แสดง (email/password ยังใช้ได้)

Vite เปิดเผยเฉพาะชื่อ `GOOGLE_CLIENT_ID` (ผ่าน `envPrefix` ใน `vite.config.ts`) — ไม่ใช่ prefix `GOOGLE_` ทั้งก้อน (จะรั่ว secret)

**Local without Docker:** สร้าง `frontend/.env.local` (ไม่ commit) แล้วใส่ `GOOGLE_CLIENT_ID=…` ให้ตรงกับ backend

### Google Sign-In setup (dev)

1. สร้าง OAuth 2.0 **Web application** client ใน [Google Cloud Console](https://console.cloud.google.com/)
2. **Authorized JavaScript origins:** `http://localhost:3000`, `http://127.0.0.1:3000`
3. **Authorized redirect URIs:** `http://localhost:3000/api/auth/google/callback` (ถ้าใช้ redirect flow)
4. OAuth consent screen: **External** + เพิ่ม test user (ถ้าอยู่ใน Testing mode)
5. ใส่ client ID เป็น `GOOGLE_CLIENT_ID` ใน workspace `.env` แล้ว recreate frontend container (หรือรีสตาร์ท `npm run dev`)

## Product ↔ UI Mapping

| Product module | Landing tab (`PlatformSection`) | Route | เนื้อหาหลัก |
|----------------|--------------------------------|-------|-------------|
| **Space** | LEARN (เรียนรู้) | `/space`, `/space/course/:courseId`, `/space/course/:courseId/module/:moduleId` | Courses → custom Modules (Overview, Anatomy, Physics, Programming) |
| **Arena** | BUILD (สร้าง) | `/arena`, `/arena/mission/:missionId` | Visual Coding (Blockly), mission run + feedback |
| **Studio** | LAUNCH (ปล่อย) | `/studio` | พอร์ตโฟลิโอ, LAIKA, ต่อยอดไอเดีย |

ฟีเจอร์ LAIKA / LLM / RAG จะเรียก backend API — ไม่ implement ใน frontend โดยตรง

### Space (Courses & Modules)

Space is a **course catalogue**: each course lists **modules**, and each module is a **lazy-loaded custom React page** registered in code (no CMS).

| Route | หน้าที่ |
|-------|---------|
| `/space` | Home + My Courses (`SpaceHome`) — courses from registry |
| `/space/course/:courseId` | Course overview + module list (`SpaceCourse`) |
| `/space/course/:courseId/module/:moduleId` | Resolves module via registry and renders its `Component` (`SpaceModuleRoute`) |

Current course: **`cubesat-for-beginner`** with modules `overview`, `anatomy`, `physics`, `programming`. Only **physics** has a full lesson UI today; others use a placeholder page.

| ใน scope | นอก scope |
|----------|-----------|
| Explicit course/module registry (`core/registry.ts`) | Backend progress / unlock API |
| Custom module pages (`SpaceModulePageProps`) | Plugin / auto-discovery (`import.meta.glob`) |
| Physics: slides + WebGPU scenes + sim clock | Persist progress beyond UI metadata |

**Lib / components**

| Path | บทบาท |
|------|--------|
| `src/components/space/core/types.ts` | `SpaceCourseDefinition`, `SpaceModuleDefinition`, page props |
| `src/components/space/core/registry.ts` | `listCourses` / `getCourse` / `getModule` |
| `src/components/space/core/routes.ts` | Path builders (`spaceCoursePath`, `spaceModulePath`) |
| `src/components/space/courses/` | Per-course folders + [README](../src/components/space/courses/README.md) for contributors |
| `src/components/space/courses/cubesat-for-beginner/` | Course def + modules |
| `…/modules/physics/` | Physics page, `LessonScene`, `scene/`, `sim/`, `physics/` |
| `src/components/space/SpaceHome.tsx` · `SpaceCourse.tsx` · `SpaceModuleRoute.tsx` | Generic shells |
| `src/lib/knowledge/` · `src/components/knowledge/` | Shared glossary popups (`[[id\|label]]`) |

**Add a module:** create a folder under the course, export a definition with `lazy(() => import(…))`, then add one line to the course’s `modules` array — see `courses/README.md`.

### Studio (LAIKA)

Studio แยกเป็น landing + chat ต่อ collection:

| Route | หน้าที่ |
|-------|---------|
| `/studio` | LAIKA hero (static copy + typewriter) + collection grid จาก API |
| `/studio/new` | สร้าง note/idea ใหม่ |
| `/studio/chat/:id` | แชทกับ LAIKA ต่อ collection (intent + SSE stream) |

| ใน scope | นอก scope |
|----------|-----------|
| Collections ใน PostgreSQL (`GET/POST/PATCH /studio/collections`) | Space/Arena progress API → `learning_context` |
| Branch navigation: `GET …/conversation`, `POST …/select-branch`, `GET …/branch-map` | Venture forms, expert matching |
| `POST /laika/assist/stream` — history + `created_at`, `client_now`; ชื่อผู้เรียนจาก session ฝั่ง backend | `POST /laika/studio/greeting` บน landing (มี API แต่ UI ใช้ static hero) |
| Hero: typewriter, rotate หลังพิมพ์เสร็จ ~15s; ต้อนรับกลับถ้าหายไป ≥3 วัน (`studio-visit.ts`) | |

**Lib / components**

| Path | บทบาท |
|------|--------|
| `src/lib/api.ts` | `streamLaikaAssist()`, studio collection APIs |
| `src/lib/studio-storage.ts` | Async CRUD บน `/studio/collections` |
| `src/lib/studio-tree.ts` | Conversation tree; `toLaikaHistory()` ส่ง `created_at` |
| `src/lib/studio-visit.ts` | Last visit สำหรับ hero welcome-back |
| `src/lib/studio-learner.ts` | ใส่ชื่อใน hero copy |
| `src/components/studio/landing/` | `StudioLanding`, `LaikaHeroGreeting`, `CollectionGrid` |
| `src/components/studio/chat/` | `StudioChatView`, composer, branch map |

### Arena (Visual Coding)

Mission hub + Blockly workspace for **MISSION 01 — ONE LAP AROUND EARTH** (`leo-orbit-one-lap`). Live: pack metadata + setup presets, attempt save/load (`ast` + Blockly `workspace`), and `POST .../runs` one-orbit grading with sampled `trace[]`. Spec: workspace `docs/programming_arena_revamp_spec.md`.

| Route | หน้าที่ |
|-------|---------|
| `/arena` | Mission carousel (`ArenaDemo`) — brief + CTA |
| `/arena/mission/:missionId` | Full-width mission shell (**no** `ModuleSidebar`): header (back, code/title, timer) + `MissionActivity` |

Playable id: `leo-orbit-one-lap` only. Other missions show a not-ready message.

| ใน scope | นอก scope (ถัดไป) |
|----------|-------------------|
| M01 Blockly libs (obc/eps/payload) → program AST + workspace JSON | Multi-mission packs / camera payload variants |
| Setup tabs EPS / Payload / COMM → run payload | COMM flyout + downlink ops (M02+) |
| `GET` pack · `GET`/`PUT` attempt · `POST` runs (orbit sim) | Realtime wall-clock replay / full 3D umbra |
| Tab bar: รายละเอียดภารกิจ \| เขียนโค้ดบล็อก | Extra mission tabs |
| Save / Clear / Run + validation error modal | Longevity health accumulation |
| Orbit trace feedback (sun/eclipse band) | Richer outcome UX |

**UI layout (coding view)**

- Top bar (`ArenaMission`): back · mission code/title · countdown timer — sidebar hidden for immersion  
- Tab bar (`MissionActivity`): detail vs coding — tabs use `z-[80]` above Blockly toolbox (`z-index: 70`)  
- Setup tabs above editor: EPS / Payload / COMM (config, not Blockly)  
- Leaving coding snapshots **AST + Blockly workspace** so remount restores **block positions**; Save persists both to the API  
- Split: Blockly ~`1.5fr` · Result ~`1fr`  
- Blockly seed: single `obc_on_start` containing `obc_repeat_orbit`

**Lib / components**

| Path | บทบาท |
|------|--------|
| `src/pages/Arena.tsx` · `ArenaMission.tsx` | Routes (mission page: no module sidebar) |
| `src/components/arena/arena-data.ts` | Static mission copy |
| `src/components/arena/ArenaDemo.tsx` | Hub carousel |
| `src/components/arena/mission/MissionActivity.tsx` | Tabs, setup state, draft snapshot, save/clear/run |
| `src/components/arena/mission/MissionSetupTabs.tsx` | EPS / Payload / COMM forms |
| `src/components/arena/mission/MissionRunErrorDialog.tsx` | Modal for AST validation / run API errors |
| `src/components/arena/grade-label.ts` | Thai grade labels + status colors |
| `src/components/arena/blockly/BlocklyEditor.tsx` | Inject + theme; restore prefers `workspace` → AST → seed |
| `src/components/arena/blockly/libs/` | `obc` / `eps` / `payload` / `comm` block defs + toolboxes |
| `src/components/arena/blockly/registry.ts` | `enabledLibs` → toolbox |
| `src/components/arena/blockly/compileProgram.ts` | `obc_on_start` → `{ setup, main_loop }` |
| `src/components/arena/blockly/toAst.ts` · `fromAst.ts` | Workspace ↔ program AST |
| `src/components/arena/feedback/MissionFeedbackMock.tsx` | Orbit trace playback + dashboard + outcome |
| `src/components/arena/timeline/` | Sun/eclipse band timeline |
| `src/ast/types.ts` | AST / pack types (mirror BE) |
| `src/lib/api.ts` | `getArenaMission` · attempt · `runArenaMission({ ast, epsSetup, … })` |

**Backend:** draft `ast` + optional `workspace` in `arena_attempts`; runs use AST + setup tabs — see [backend/docs/api.md](../../backend/docs/api.md#arena).
## Directory Map

```
frontend/
├── index.html
├── vite.config.ts
├── src/
│   ├── main.tsx           # createRoot + BrowserRouter
│   ├── App.tsx            # React Router routes
│   ├── index.css          # Fonts, CSS variables, Tailwind
│   ├── pages/             # Home, Login, Register, Space, Arena, ArenaMission, Studio
│   ├── routes/            # ProtectedRoute, GuestRoute, useAuthUser
│   ├── ast/               # Arena AST type contracts
│   ├── components/
│   │   ├── auth/          # GoogleSignInButton, GoogleOneTap, LoginForm, ...
│   │   ├── arena/         # ArenaDemo, mission/, blockly/, feedback/
│   │   ├── space/         # SpaceHome, SpaceCourse, SpaceModuleRoute, core/, courses/
│   │   ├── studio/
│   │   └── ...            # Landing sections, Navbar, SpaceCanvas
│   ├── lib/
│   │   ├── api.ts         # User type, studio + arena API helpers
│   │   ├── auth.ts        # tryRefreshSession, getCurrentUser, clearSession, Google sign-in
│   │   ├── googleIdentity.ts  # GIS script load, initialize, renderButton, One Tap
│   │   └── constants.ts   # API_URL
│   └── types/
│       └── google-identity.d.ts
├── public/
│   └── blockly/media/     # Blockly trashcan / zoom icons
├── docs/
├── tailwind.config.ts
└── tsconfig.json          # @/* → src/*
```

## Architecture

- **SPA** — Vite + React Router; ไม่มี server components
- **Section components** — แต่ละ section ของ landing อยู่ใน `components/<Section>.tsx`
- **Pages** — compose sections หรือ module UI
- **Canvas / WebGL** — `React.lazy()` + `<Suspense>` สำหรับ browser-only (ดู `HeroSection` → `SpaceCanvas`)
- **Auth** — httpOnly cookies (`lunar_token` + `lunar_refresh`) จาก FastAPI; เรียก `/api/auth/*` (Vite proxy)
- **Google Sign-In** — Google Identity Services (`gsi/client`); credential ส่งไป `POST /auth/google/onetap`
- **Route guards** — `GuestRoute` (login/register) · `ProtectedRoute` (space/arena/studio)
- **Styling** — Tailwind v4 utilities เป็นหลัก; `@theme` tokens ใน `index.css`

### Auth flow

```
Login/Register page
  ├─ Email/password → POST /api/auth/login | register → cookies (access + refresh)
  ├─ GoogleSignInButton → GIS renderButton → credential → POST /api/auth/google/onetap → cookies
  └─ GoogleOneTap (GuestRoute) → auto prompt on guest pages

ProtectedRoute → GET /api/auth/me (cookie) → allow or redirect /login?next=

API call 401 (access expired)
  → tryRefreshSession() → POST /api/auth/refresh → retry once
  → redirect login if refresh fails
```

**Lib:** `src/lib/auth.ts` — `tryRefreshSession`, `fetchWithAuthRetry`, `getCurrentUser`  
**Lib:** `src/lib/api.ts` — `apiFetch` retries on 401 after refresh

## Code Style

- Import ด้วย `@/` (`@/components/Navbar`)
- Functional components
- สีจาก Tailwind theme (`bg-bg`, `text-cyan`, `text-muted` ฯลฯ) หรือ CSS variables (`--bg`, `--cyan`)
- Fonts (semantic utilities ใน `@theme`):
  - `font-thai` — Noto Sans Thai (body)
  - `font-en` — Syne (Navbar, Hero, Footer, Join, Research, auth logo)
  - `font-mono` — Space Mono (labels, CTAs, auth primary btn)
  - `font-display` — Orbitron (WhySpace headings)
  - `font-section-thai` — Sarabun (WhySpace / Platform ย่อหน้าไทย)
  - `font-platform` — Space Grotesk (Platform headings EN)
  - `font-ui-mono` — ui-monospace (Platform labels — ไม่ใช่ Space Mono)
- หลีกเลี่ยง inline `style={{}}` ใหม่ — ยกเว้น Three.js, dynamic accent colors (`--accent`), runtime animation duration
- ข้อความ UI ภาษา**ไทย**; ชื่อ component/code ภาษา**อังกฤษ**
- ชื่อ product: **Space**, **Arena**, **Studio**, **LAIKA**

### Component Pattern

```tsx
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>{/* sections */}</main>
    </>
  );
}
```

```tsx
import { lazy, Suspense } from "react";

const SpaceCanvas = lazy(() => import("./SpaceCanvas"));

// ...
<Suspense fallback={null}>
  <SpaceCanvas />
</Suspense>
```

## Landing Sections

1. **Hero** — space canvas, brand intro (Thailand Deep Tech Space Program)
2. **Why Space** — แรงจูงใจ / ประโยชน์อวกาศต่อไทย (การ์ด interactive)
3. **Platform** — LEARN / BUILD / LAUNCH → Space / Arena / Studio
4. **Join** — enrollment + email signup CTA

## Do / Don't

| Do | Don't |
|----|-------|
| อ้างอิง [concept.md](concept.md) เมื่อเพิ่มฟีเจอร์ product | สร้างชื่อ module ใหม่ที่ขัด Space/Arena/Studio |
| Colocate section UI ใน `components/` | ใส่ business logic หนักใน `pages/` |
| `React.lazy` + `Suspense` สำหรับ Three.js/Canvas | Import WebGL โดยตรงใน route ที่โหลดทันที |
| เรียก LAIKA/RAG ผ่าน backend API | ฝัง LLM keys หรือ RAG logic ใน frontend |
| ใช้ `credentials: "include"` กับ auth API | เก็บ JWT ใน localStorage (ใช้ httpOnly cookies) |
| ใช้ CSS variables จาก `index.css` | สี hex แบบ one-off เมื่อมี token แล้ว |

## Testing & Lint

```bash
npm run lint
```

Frontend ยังไม่มี unit test runner — auth/API ทดสอบผ่าน backend **pytest** (`cd ../backend && pytest`) หรือ manual ที่ `/login`, `/register` + Swagger (`/api/docs` ผ่าน Docker proxy)

## Git

- Dev บน **`develop`** — ห้าม push ตรงไป **`main`**
- งานใหญ่: `feature/*` จาก `develop` → PR กลับ `develop`
- Release: PR **`develop` → `main`**

## Boundaries

- ห้ามเอา `lang="th"` ออกจาก `index.html`
- โค้ดอยู่ใน `frontend/` เท่านั้น — ไม่ shared package กับ backend
- อย่าเพิ่ม dependency ถ้าไม่จำเป็น
- ห้าม commit `.env` / `.env.local` หรือ Google **client secret** (`GOOGLE_CLIENT_ID` เป็นค่า public ได้)

## Deploy

```bash
npm run build   # → dist/
```

Serve `dist/` เป็น static files พร้อม SPA fallback (`/* → index.html`). ตั้ง `GOOGLE_CLIENT_ID` (และ `VITE_API_URL` ถ้าจำเป็น) ใน build env สำหรับ production origin.

## JIT Index

```bash
rg "LEARN|BUILD|LAUNCH" src/components/PlatformSection.tsx
rg "lazy\\(" src/
rg "googleIdentity|GoogleSignIn" src/
rg "--bg|--cyan|--teal" src/index.css
```
